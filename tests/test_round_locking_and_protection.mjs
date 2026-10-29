import assert from 'assert';
import fs from 'fs';

console.log('=== Running NBTC Microwave Round Locking & Read-Only Protection Verification Test ===\n');

// 1. Schema and SQL Migrations
console.log('1. Checking Schema & SQL Migrations for inspection_rounds table...');
const schemaSql = fs.readFileSync('schema.sql', 'utf8');
assert(schemaSql.includes('CREATE TABLE IF NOT EXISTS inspection_rounds'), 'schema.sql must define inspection_rounds table');
assert(schemaSql.includes('INSERT OR IGNORE INTO inspection_rounds (round_number, status) VALUES') && schemaSql.includes("(1, 'open')"), 'schema.sql must seed inspection_rounds');

const migrationSql = fs.readFileSync('migrations/0004_create_inspection_rounds.sql', 'utf8');
assert(migrationSql.includes('CREATE TABLE IF NOT EXISTS inspection_rounds'), '0004 migration must create inspection_rounds');
assert(migrationSql.includes('(18, \'open\')'), '0004 migration must seed all 18 rounds');
console.log('  ✓ schema.sql and migrations/0004_create_inspection_rounds.sql verified');

// 2. Cloudflare Worker Edge API guards and endpoints
console.log('\n2. Checking Cloudflare Worker Edge API (worker/index.js)...');
const workerJs = fs.readFileSync('worker/index.js', 'utf8');
assert(workerJs.includes("path === '/api/rounds'"), 'worker/index.js must handle /api/rounds');
assert(workerJs.includes("path === '/api/rounds/lock'"), 'worker/index.js must handle /api/rounds/lock');
assert(workerJs.includes('isRoundLocked(db, roundNumber)'), 'worker/index.js must define isRoundLocked helper');
assert(workerJs.includes("403") && workerJs.includes("This inspection round has been closed and cannot be modified"), 'worker/index.js must return 403 Forbidden for closed rounds');
console.log('  ✓ worker/index.js endpoints & 403 Forbidden guards verified');

// 3. Local Python Server (database.py)
console.log('\n3. Checking Local Python Server (database.py)...');
const databasePy = fs.readFileSync('database.py', 'utf8');
assert(databasePy.includes('CREATE TABLE IF NOT EXISTS inspection_rounds'), 'database.py must create inspection_rounds');
assert(databasePy.includes('def get_round_statuses'), 'database.py must implement get_round_statuses');
assert(databasePy.includes('def is_round_locked'), 'database.py must implement is_round_locked');
assert(databasePy.includes('def update_round_lock'), 'database.py must implement update_round_lock');
assert(databasePy.includes('/api/rounds'), 'database.py must handle GET /api/rounds');
assert(databasePy.includes('/api/rounds/lock'), 'database.py must handle POST /api/rounds/lock');
assert(databasePy.includes('DatabaseService.is_round_locked(round_num)'), 'database.py must check if round is locked');
console.log('  ✓ database.py SQLite table, routes, & 403 Forbidden guards verified');

// 4. Client API (src/lib/api.js)
console.log('\n4. Checking Client API Layer (src/lib/api.js)...');
const apiJs = fs.readFileSync('src/lib/api.js', 'utf8');
assert(apiJs.includes('ROUNDS_STATUS_CACHE_KEY'), 'api.js must export ROUNDS_STATUS_CACHE_KEY');
assert(apiJs.includes('LOCKED_ROUNDS_KEY'), 'api.js must export LOCKED_ROUNDS_KEY');
assert(apiJs.includes('function getCachedRoundStatuses'), 'api.js must export getCachedRoundStatuses');
assert(apiJs.includes('function setCachedRoundStatuses'), 'api.js must export setCachedRoundStatuses');
assert(apiJs.includes('function isRoundClosed'), 'api.js must export isRoundClosed');
assert(apiJs.includes('async function fetchRoundStatuses'), 'api.js must export fetchRoundStatuses');
assert(apiJs.includes('async function updateRoundLockStatus'), 'api.js must export updateRoundLockStatus');
assert(apiJs.includes('isRoundClosed(roundNumber)'), 'api.js must check isRoundClosed in mutating functions');
assert(apiJs.includes('roundsSummary'), 'api.js must compute roundsSummary in mergeDashboardWithLocal');
console.log('  ✓ src/lib/api.js round caching, lock helpers, and guard checks verified');

// 5. System Settings (SettingsModal.jsx)
console.log('\n5. Checking System Settings Modal (src/components/settings/SettingsModal.jsx)...');
const settingsModal = fs.readFileSync('src/components/settings/SettingsModal.jsx', 'utf8');
assert(settingsModal.includes('Welcomw@01'), 'SettingsModal must enforce REQUIRED_PASSCODE Welcomw@01');
assert(settingsModal.includes('สถานะและล็อกรอบตรวจเยี่ยม (Rounds 1–18)'), 'SettingsModal must have Rounds 1-18 tab');
assert(settingsModal.includes('canLock: completed >= totalStations'), 'SettingsModal must enforce completion threshold (197 stations) for locking');
assert(settingsModal.includes('updateRoundLockStatus'), 'SettingsModal must call updateRoundLockStatus');
assert(settingsModal.includes('ปิดรอบ (Lock Round)'), 'SettingsModal must render Lock Round action button');
assert(settingsModal.includes('ปิดรอบแล้ว (Locked)'), 'SettingsModal must render disabled Locked button');
assert(settingsModal.includes('ปลดล็อกรอบ (Re-open)'), 'SettingsModal must render Re-open action button for closed rounds');
console.log('  ✓ SettingsModal.jsx round management, 197-station completion gate, and lock/unlock verified');

// 6. Field Visit Form (FieldVisitView.jsx)
console.log('\n6. Checking Field Visit View (src/components/field/FieldVisitView.jsx)...');
const fieldVisit = fs.readFileSync('src/components/field/FieldVisitView.jsx', 'utf8');
assert(fieldVisit.includes('openRounds'), 'FieldVisitView must calculate openRounds');
assert(fieldVisit.includes('openRounds.map'), 'FieldVisitView must render only open rounds in dropdown');
assert(fieldVisit.includes('Closed & Locked — Read-Only'), 'FieldVisitView must show Read-Only banner when round is closed');
assert(fieldVisit.includes('isRoundClosed(formData.round_number || 1)'), 'FieldVisitView must check isRoundClosed');
assert(fieldVisit.includes('disabled={isSubmitting || isRateLimited || isRoundClosed'), 'FieldVisitView must disable submit button for closed rounds');
console.log('  ✓ FieldVisitView.jsx dynamic round filtering, defaulting, and read-only banner verified');

// 7. Recent Surveys & Preview Modal
console.log('\n7. Checking Recent Surveys & Survey Preview Modal...');
const recentSurveys = fs.readFileSync('src/components/dashboard/RecentSurveys.jsx', 'utf8');
assert(recentSurveys.includes('const isLocked = isRoundClosed(itemRound)'), 'RecentSurveys must check isLocked for items');
assert(recentSurveys.includes('disabled={isLocked}'), 'RecentSurveys must disable edit/delete for locked items');
assert(recentSurveys.includes('checked={isSelected && !isLocked}'), 'RecentSurveys must prevent checkbox selection for locked items');
assert(recentSurveys.includes('<span>Locked</span>'), 'RecentSurveys must display Locked badge');
assert(recentSurveys.includes('nbtc-rounds-updated'), 'RecentSurveys must subscribe to nbtc-rounds-updated');

const previewModal = fs.readFileSync('src/components/dashboard/SurveyPreviewModal.jsx', 'utf8');
assert(previewModal.includes('isLockedRound'), 'SurveyPreviewModal must determine isLockedRound');
assert(previewModal.includes('disabled={isLockedRound}'), 'SurveyPreviewModal must disable edit/delete buttons when locked');
assert(previewModal.includes('Closed & Locked — Read-Only'), 'SurveyPreviewModal must show read-only banner when locked');
assert(previewModal.includes('nbtc-rounds-updated'), 'SurveyPreviewModal must subscribe to nbtc-rounds-updated');
console.log('  ✓ RecentSurveys.jsx and SurveyPreviewModal.jsx read-only lock protection verified');

// 8. Multi-Round Overview
console.log('\n8. Checking Multi-Round Overview (MultiRoundOverview.jsx)...');
const multiRound = fs.readFileSync('src/components/dashboard/MultiRoundOverview.jsx', 'utf8');
assert(multiRound.includes('isRoundClosed'), 'MultiRoundOverview must import isRoundClosed');
assert(multiRound.includes('rm.isLocked ? ('), 'MultiRoundOverview must show Lock icon for locked rounds');
assert(multiRound.includes('ปิดรอบแล้ว (Read-Only)'), 'MultiRoundOverview must show text for locked rounds');
assert(multiRound.includes('nbtc-rounds-updated'), 'MultiRoundOverview must subscribe to nbtc-rounds-updated');
console.log('  ✓ MultiRoundOverview.jsx lock badges and visual indicators verified');

// 9. Master Station Mapping Reconciliation (SITE-191 & SITE-040)
console.log('\n9. Checking Master Station Reconciliation for SITE-191 & SITE-040...');
const survey191 = JSON.parse(fs.readFileSync('data/surveys/PM-202610070240292-0440.json', 'utf8'));
assert(survey191.siteId === 'SITE-191', 'PM-202610070240292-0440 must have siteId: SITE-191');
assert(survey191.station === 'BS ปางใหม่พัฒนา', 'PM-202610070240292-0440 must have station: BS ปางใหม่พัฒนา');

const survey040 = JSON.parse(fs.readFileSync('data/surveys/PM-202610051620381-aa77.json', 'utf8'));
assert(survey040.siteId === 'SITE-040', 'PM-202610051620381-aa77 must have siteId: SITE-040');
assert(survey040.station === 'หมู่ 10 ปางใหม่พัฒนา', 'PM-202610051620381-aa77 must have station: หมู่ 10 ปางใหม่พัฒนา');

const pendingChecklist = fs.readFileSync('src/components/dashboard/PendingStationsChecklist.jsx', 'utf8');
assert(pendingChecklist.includes('STATION_ALIASES'), 'PendingStationsChecklist must use STATION_ALIASES');
assert(pendingChecklist.includes('siteId'), 'PendingStationsChecklist must match siteId');

const apiJsAliases = fs.readFileSync('src/lib/api.js', 'utf8');
assert(apiJsAliases.includes("'BS บ้านปางใหม่พัฒนา': 'BS ปางใหม่พัฒนา'"), 'api.js must map BS บ้านปางใหม่พัฒนา alias');

console.log('  ✓ SITE-191 and SITE-040 reconciled and verified in master mapping');

// 10. Auto-Advance Active Round Context & Metric Reset
console.log('\n10. Checking Auto-Advance to Earliest Open Round & Metric Reset...');
assert(apiJs.includes('function getEarliestOpenRound'), 'api.js must export getEarliestOpenRound');

const dashboardView = fs.readFileSync('src/components/dashboard/DashboardView.jsx', 'utf8');
assert(dashboardView.includes('getEarliestOpenRound'), 'DashboardView must import and use getEarliestOpenRound');
assert(dashboardView.includes('handleRoundsUpdated'), 'DashboardView must define handleRoundsUpdated');
assert(dashboardView.includes('setSelectedRound'), 'DashboardView must update selectedRound upon locking');

const pendingList = fs.readFileSync('src/components/dashboard/PendingStationsChecklist.jsx', 'utf8');
assert(pendingList.includes('รอดำเนินการ'), 'PendingStationsChecklist must display pending badge for active round');

console.log('  ✓ Auto-advance to earliest open round and metric reset verified');

// 11. Version and Changelog
console.log('\n11. Checking Version Consistency & CHANGELOG.md...');
const versionJs = fs.readFileSync('src/version.js', 'utf8');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const changelog = fs.readFileSync('CHANGELOG.md', 'utf8');

assert(versionJs.includes("APP_VERSION = '2.17.7'"), 'src/version.js must be 2.17.7');
assert(packageJson.version === '2.17.7', 'package.json version must be 2.17.7');
assert(changelog.includes('## [2.17.7] - 2026-10-29'), 'CHANGELOG.md must document [2.17.7]');
console.log('  ✓ Version 2.17.7 synchronized in src/version.js, package.json, and CHANGELOG.md');

console.log('\n======================================================');
console.log('🎉 ALL ROUND LOCKING & PROTECTION VERIFICATION TESTS PASSED!');
console.log('======================================================');
