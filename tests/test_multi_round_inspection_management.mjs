import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

console.log('Testing Multi-Round Inspection Management (Rounds 1–18)...');

const ROOT = process.cwd();
const schemaFile = path.join(ROOT, 'schema.sql');
const migration0003 = path.join(ROOT, 'migrations', '0003_add_round_number.sql');
const workerFile = path.join(ROOT, 'worker', 'index.js');
const dbFile = path.join(ROOT, 'database.py');
const fieldVisitFile = path.join(ROOT, 'src', 'components', 'field', 'FieldVisitView.jsx');
const multiRoundFile = path.join(ROOT, 'src', 'components', 'dashboard', 'MultiRoundOverview.jsx');
const pendingChecklistFile = path.join(ROOT, 'src', 'components', 'dashboard', 'PendingStationsChecklist.jsx');
const dashboardFile = path.join(ROOT, 'src', 'components', 'dashboard', 'DashboardView.jsx');
const recentSurveysFile = path.join(ROOT, 'src', 'components', 'dashboard', 'RecentSurveys.jsx');
const surveysDir = path.join(ROOT, 'data', 'surveys');
const dashboardJson = path.join(ROOT, 'public', 'api', 'dashboard.json');

// 1. Schema & Migration Verification
console.log('1. Checking Schema & Migration DDL...');
assert(fs.existsSync(schemaFile), 'schema.sql must exist');
const schemaContent = fs.readFileSync(schemaFile, 'utf8');
assert(schemaContent.includes('round_number INTEGER NOT NULL DEFAULT 1'), 'schema.sql must define round_number column');
assert(schemaContent.includes('idx_surveys_round_number'), 'schema.sql must create index on round_number');

assert(fs.existsSync(migration0003), 'migrations/0003_add_round_number.sql must exist');
const migContent = fs.readFileSync(migration0003, 'utf8');
assert(migContent.includes('ALTER TABLE surveys ADD COLUMN round_number'), 'migration must alter surveys table');
console.log('  [PASS] Schema & D1 migration scripts verified');

// 2. Worker Engine Verification
console.log('2. Checking Cloudflare Worker Engine CRUD...');
const workerContent = fs.readFileSync(workerFile, 'utf8');
assert(workerContent.includes('round_number INTEGER NOT NULL DEFAULT 1'), 'worker must ensure round_number in ensureSchema');
assert(workerContent.includes('round_number:'), 'worker must extract and return round_number');
assert(workerContent.includes('INSERT OR REPLACE INTO surveys'), 'worker must insert survey');
assert(workerContent.includes('UPDATE surveys SET updated_at'), 'worker must update survey');
console.log('  [PASS] Worker Engine CRUD with round_number verified');

// 3. Local SQLite Server Verification
console.log('3. Checking Local database.py Server Compatibility...');
const dbContent = fs.readFileSync(dbFile, 'utf8');
assert(dbContent.includes('round_number'), 'database.py must check and add round_number column');
console.log('  [PASS] database.py round_number compatibility verified');

// 4. Retroactive Data Migration Verification (All 197 Records)
console.log('4. Checking Retroactive Migration of 197 Survey Records...');
assert(fs.existsSync(surveysDir), 'data/surveys directory must exist');
const jsonFiles = fs.readdirSync(surveysDir).filter((f) => f.endsWith('.json'));
assert.equal(jsonFiles.length, 197, 'Must have exactly 197 survey records');

let round1Count = 0;
for (const file of jsonFiles) {
  const content = JSON.parse(fs.readFileSync(path.join(surveysDir, file), 'utf8'));
  assert.equal(content.round_number, 1, `Survey ${file} must have round_number = 1`);
  assert.equal(content.fields?.round_number, 1, `Survey ${file} fields must have round_number = 1`);
  round1Count++;
}
assert.equal(round1Count, 197, 'All 197 surveys must be retroactively mapped to Round 1');

// Verify dashboard snapshot
const dbJsonContent = JSON.parse(fs.readFileSync(dashboardJson, 'utf8'));
const r1InSnapshot = dbJsonContent.recent.filter((r) => r.round_number === 1);
assert.equal(r1InSnapshot.length, 197, 'Snapshot must have all 197 records mapped to Round 1');
console.log(`  [PASS] 197/197 survey records retroactively mapped to Round 1 successfully`);

// 5. FieldVisitView Form Integration
console.log('5. Checking FieldVisitView Form Integration...');
const fvContent = fs.readFileSync(fieldVisitFile, 'utf8');
assert(fvContent.includes('round_number: 1'), 'FieldVisitView must default round_number to 1');
assert(fvContent.includes('รอบการตรวจเยี่ยม (Inspection Round)'), 'FieldVisitView must render round label');
assert(fvContent.includes('Array.from({ length: 18 }'), 'FieldVisitView must render options for all 18 rounds');
assert(fvContent.includes('params.get(\'round\')'), 'FieldVisitView must handle URL round query parameter');
console.log('  [PASS] FieldVisitView form round selection and URL hydration verified');

// 6. Multi-Round Overview & Pending Checklist Components
console.log('6. Checking Multi-Round Dashboard Components...');
assert(fs.existsSync(multiRoundFile), 'MultiRoundOverview.jsx must exist');
const multiContent = fs.readFileSync(multiRoundFile, 'utf8');
assert(multiContent.includes('length: 18'), 'MultiRoundOverview must calculate 18 rounds');
assert(multiContent.includes('totalStations'), 'MultiRoundOverview must compare against totalStations baseline');

assert(fs.existsSync(pendingChecklistFile), 'PendingStationsChecklist.jsx must exist');
const pendingContent = fs.readFileSync(pendingChecklistFile, 'utf8');
assert(pendingContent.includes('missingStations'), 'PendingStationsChecklist must compute missing stations');
assert(pendingContent.includes('บันทึกผลรอบที่'), 'PendingStationsChecklist must provide action button to record survey');

// 7. DashboardView Integration
console.log('7. Checking DashboardView Round Selector & Recalculation...');
const dContent = fs.readFileSync(dashboardFile, 'utf8');
assert(dContent.includes('selectedRound'), 'DashboardView must maintain selectedRound state');
assert(dContent.includes('MultiRoundOverview'), 'DashboardView must render MultiRoundOverview');
assert(dContent.includes('PendingStationsChecklist'), 'DashboardView must render PendingStationsChecklist');
assert(dContent.includes('activeSurveys'), 'DashboardView must filter active surveys by round');
assert(dContent.includes('activeStats'), 'DashboardView must recalculate stats for active round');
assert(dContent.includes('activeProvinces'), 'DashboardView must recalculate provinces for active round');

// 8. RecentSurveys Table Round Integration
console.log('8. Checking RecentSurveys Table Round Integration...');
const rsContent = fs.readFileSync(recentSurveysFile, 'utf8');
assert(rsContent.includes('selectedRound'), 'RecentSurveys must accept selectedRound prop');
assert(rsContent.includes('รอบตรวจ:'), 'RecentSurveys must render round filter in toolbar');
assert(rsContent.includes('item.round_number'), 'RecentSurveys must display round badge in table row');

console.log('--- ALL MULTI-ROUND INSPECTION MANAGEMENT TESTS PASSED (100%) ---');

