/**
 * NBTC Microwave — Pre-PM Survey
 * Script to synchronize local survey photos directly to Microsoft OneDrive via Make.com Webhook
 *
 * Usage:
 *   node scripts/sync_photos_to_onedrive.mjs --limit 3    (Test sync first 3 photos)
 *   node scripts/sync_photos_to_onedrive.mjs --all        (Sync all photos)
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const PHOTOS_DIR = path.join(ROOT_DIR, 'photos');
const SURVEYS_DIR = path.join(ROOT_DIR, 'data', 'surveys');
const CACHE_FILE = path.join(ROOT_DIR, 'data', '.synced_photos.json');
const WEBHOOK_URL = process.env.ONEDRIVE_WEBHOOK_URL || 'https://hook.eu1.make.com/myra16508wq4lqnr3guul8enz9v5iuj3';

const args = process.argv.slice(2);
const limitArgIdx = args.indexOf('--limit');
const limit = limitArgIdx !== -1 ? parseInt(args[limitArgIdx + 1], 10) : (args.includes('--all') ? Infinity : 5);
const forceSync = args.includes('--force');

function loadSyncedCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      return new Set(JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')));
    }
  } catch (e) {}
  return new Set();
}

function saveSyncedCache(syncedSet) {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(Array.from(syncedSet), null, 2), 'utf8');
  } catch (e) {}
}

async function postToWebhook(payload) {
  return new Promise((resolve, reject) => {
    const url = new URL(WEBHOOK_URL);
    const data = JSON.stringify(payload);
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
      timeout: 45000,
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ ok: true, status: res.statusCode, body });
        } else {
          resolve({ ok: false, status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout after 45s'));
    });

    req.write(data);
    req.end();
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('======================================================================');
  console.log(' NBTC Microwave — OneDrive Photo Synchronizer (Make.com)');
  console.log('======================================================================');
  console.log(`Target Webhook: ${WEBHOOK_URL}`);

  if (!fs.existsSync(PHOTOS_DIR)) {
    console.error(`[ERROR] Photos folder not found: ${PHOTOS_DIR}`);
    process.exit(1);
  }

  // Cache survey records by recordId
  const surveyMap = new Map();
  if (fs.existsSync(SURVEYS_DIR)) {
    const jsonFiles = fs.readdirSync(SURVEYS_DIR).filter(f => f.endsWith('.json'));
    for (const f of jsonFiles) {
      try {
        const doc = JSON.parse(fs.readFileSync(path.join(SURVEYS_DIR, f), 'utf8'));
        const recId = doc.recordId || path.basename(f, '.json');
        surveyMap.set(recId, doc);
      } catch (e) {}
    }
  }

  const syncedSet = loadSyncedCache();
  const allPhotos = fs.readdirSync(PHOTOS_DIR).filter(f => /\.(jpe?g|png|webp)$/i.test(f));
  console.log(`Found ${allPhotos.length} photo(s) in ${PHOTOS_DIR}`);
  console.log(`Already synced: ${syncedSet.size} photo(s)`);

  const pendingPhotos = forceSync ? allPhotos : allPhotos.filter(f => !syncedSet.has(f));
  console.log(`Pending sync: ${pendingPhotos.length} photo(s)`);
  console.log(`Sync limit: ${limit === Infinity ? 'ALL' : limit} photo(s)\n`);

  const photosToSync = pendingPhotos.slice(0, limit);
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < photosToSync.length; i++) {
    const photoFileName = photosToSync[i];
    const photoPath = path.join(PHOTOS_DIR, photoFileName);

    const match = photoFileName.match(/^(PM-[A-Za-z0-9-]+)_(.+)$/);
    const recordId = match ? match[1] : '';
    const surveyDoc = surveyMap.get(recordId) || {};
    const roundNumber = surveyDoc.round_number || surveyDoc.fields?.round_number || 1;
    const stationName = surveyDoc.station || surveyDoc.fields?.station || 'สถานีทั่วไป';

    const fileBytes = fs.readFileSync(photoPath);
    const base64Data = fileBytes.toString('base64');

    const payload = {
      round: Number(roundNumber) || 1,
      station: stationName,
      recordId: recordId || 'LEGACY-RECORD',
      fileName: photoFileName,
      contentType: 'image/jpeg',
      photoBase64: base64Data,
    };

    process.stdout.write(`[${i + 1}/${photosToSync.length}] Syncing: รอบที่ ${payload.round} / ${payload.station} / ${payload.fileName} ... `);

    let sent = false;
    let attempts = 0;
    while (!sent && attempts < 5) {
      attempts++;
      try {
        const res = await postToWebhook(payload);
        if (res.ok) {
          console.log(`[OK] (${(fileBytes.length / 1024).toFixed(1)} KB)`);
          syncedSet.add(photoFileName);
          saveSyncedCache(syncedSet);
          successCount++;
          sent = true;
        } else if (res.body && res.body.includes('Queue is full')) {
          console.log(`[Queue full, waiting 15s for Make.com to process...]`);
          await sleep(15000);
        } else {
          console.log(`[FAILED: HTTP ${res.status}] ${res.body || ''}`);
          failCount++;
          break;
        }
      } catch (err) {
        console.log(`[ERROR: ${err.message}]`);
        failCount++;
        break;
      }
    }

    // Friendly delay between uploads to avoid bursting webhook rate limits
    if (i < photosToSync.length - 1) {
      await sleep(2500);
    }
  }

  console.log('\n======================================================================');
  console.log(`[SUMMARY] Finished sync: ${successCount} succeeded, ${failCount} failed.`);
  console.log(`[TOTAL SYNCED] ${syncedSet.size}/${allPhotos.length} photos recorded.`);
  console.log('======================================================================');
}

main().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
