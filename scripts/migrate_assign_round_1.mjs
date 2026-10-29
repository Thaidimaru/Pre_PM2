/**
 * NBTC Microwave — Pre-PM Survey Retroactive Data Migration (Round 1)
 * 
 * Safely assigns round_number = 1 to all existing survey records:
 * 1. Backs up original data/surveys/*.json files to data/surveys_backup_round1/
 * 2. Injects round_number = 1 at top-level and inside fields.round_number
 * 3. Updates public/api/dashboard and public/api/dashboard.json static snapshots
 * 4. Regenerates migrations/0002_seed_data.sql via d1_etl_export
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runEtl } from './d1_etl_export.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const SURVEYS_DIR = path.resolve(ROOT_DIR, 'data', 'surveys');
const BACKUP_DIR = path.resolve(ROOT_DIR, 'data', 'surveys_backup_round1');

export function runMigration() {
  console.log('='.repeat(70));
  console.log(' NBTC Microwave — Retroactive Round 1 Migration Tool');
  console.log('='.repeat(70));

  if (!fs.existsSync(SURVEYS_DIR)) {
    console.error(`[ERROR] Surveys directory not found: ${SURVEYS_DIR}`);
    process.exit(1);
  }

  // 1. Create Backup Directory
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`[BACKUP] Created backup directory at ${BACKUP_DIR}`);
  }

  const files = fs.readdirSync(SURVEYS_DIR).filter((f) => f.endsWith('.json'));
  console.log(`[INFO] Found ${files.length} survey JSON files in ${SURVEYS_DIR}`);

  let updatedCount = 0;
  let alreadyHasRound = 0;

  for (const filename of files) {
    const filePath = path.join(SURVEYS_DIR, filename);
    const backupPath = path.join(BACKUP_DIR, filename);

    // Create backup copy if not already backed up
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(filePath, backupPath);
    }

    const raw = fs.readFileSync(filePath, 'utf8');
    let doc;
    try {
      doc = JSON.parse(raw);
    } catch (e) {
      console.warn(`[WARN] Skipping invalid JSON: ${filename}`);
      continue;
    }

    const fields = doc.fields || {};
    const existingRound = doc.round_number || fields.round_number;

    if (existingRound === 1 && doc.round_number === 1 && fields.round_number === 1) {
      alreadyHasRound++;
      continue;
    }

    // Set round_number = 1
    doc.round_number = 1;
    if (doc.fields) {
      doc.fields.round_number = 1;
    }

    fs.writeFileSync(filePath, JSON.stringify(doc, null, 2) + '\n', 'utf8');
    updatedCount++;
  }

  console.log(`[MIGRATION] Updated ${updatedCount} survey records with round_number = 1`);
  console.log(`[MIGRATION] ${alreadyHasRound} survey records already had round_number = 1`);
  console.log(`[MIGRATION] Total verified: ${updatedCount + alreadyHasRound} / ${files.length}`);

  // 2. Update snapshots in public/api/
  const dashboardJsonPath = path.resolve(ROOT_DIR, 'public', 'api', 'dashboard.json');
  const dashboardPath = path.resolve(ROOT_DIR, 'public', 'api', 'dashboard');

  if (fs.existsSync(dashboardJsonPath)) {
    try {
      const dbData = JSON.parse(fs.readFileSync(dashboardJsonPath, 'utf8'));
      if (Array.isArray(dbData.recent)) {
        dbData.recent = dbData.recent.map((r) => {
          const rn = Number(r.round_number || r.fields?.round_number || 1);
          return {
            ...r,
            round_number: rn,
            fields: {
              ...(r.fields || {}),
              round_number: rn,
            },
          };
        });
      }
      const serialized = JSON.stringify(dbData, null, 2);
      fs.writeFileSync(dashboardJsonPath, serialized, 'utf8');
      fs.writeFileSync(dashboardPath, serialized, 'utf8');
      console.log(`[SNAPSHOT] Updated public/api/dashboard & dashboard.json with round_number`);
    } catch (e) {
      console.warn(`[SNAPSHOT] Warning updating dashboard snapshot:`, e.message);
    }
  }

  // 3. Re-run D1 ETL to update SQL seeds
  try {
    runEtl();
    console.log(`[ETL] Regenerated Cloudflare D1 seed SQL migrations with round_number`);
  } catch (e) {
    console.warn(`[ETL] Warning running runEtl():`, e.message);
  }

  console.log('='.repeat(70));
  console.log(' [SUCCESS] Retroactive Round 1 Migration Completed Successfully');
  console.log('='.repeat(70));
}

// Direct execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigration();
}

