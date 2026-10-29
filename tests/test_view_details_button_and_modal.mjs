import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('--- Test Suite: View Details Button & Modal Routing Verification ---');

const drillDownPath = path.join(rootDir, 'src', 'components', 'dashboard', 'SurveyDrillDownModal.jsx');
const previewModalPath = path.join(rootDir, 'src', 'components', 'dashboard', 'SurveyPreviewModal.jsx');
const fieldVisitPath = path.join(rootDir, 'src', 'components', 'field', 'FieldVisitView.jsx');
const appPath = path.join(rootDir, 'src', 'App.jsx');
const utilsPath = path.join(rootDir, 'src', 'lib', 'utils.js');

// 1. Verify files exist
assert.ok(fs.existsSync(drillDownPath), 'SurveyDrillDownModal.jsx must exist');
assert.ok(fs.existsSync(previewModalPath), 'SurveyPreviewModal.jsx must exist');
assert.ok(fs.existsSync(fieldVisitPath), 'FieldVisitView.jsx must exist');
assert.ok(fs.existsSync(appPath), 'App.jsx must exist');
assert.ok(fs.existsSync(utilsPath), 'utils.js must exist');
console.log('✓ All target component files verified');

// 2. Verify SurveyDrillDownModal click binding and data extraction
const drillDownCode = fs.readFileSync(drillDownPath, 'utf-8');
assert.ok(drillDownCode.includes('handleViewDetails'), 'Must have handleViewDetails handler');
assert.ok(drillDownCode.includes('loadingRowId'), 'Must have loadingRowId state for visual feedback');
assert.ok(drillDownCode.includes('setLoadingRowId'), 'Must set loadingRowId on click');
assert.ok(drillDownCode.includes('siteId: item.siteId'), 'Must extract siteId from selected row');
assert.ok(drillDownCode.includes('contactName: item.contactName'), 'Must extract contact info from selected row');
assert.ok(drillDownCode.includes('handleDirectVisit'), 'Must have handleDirectVisit for unvisited stations');
assert.ok(drillDownCode.includes('onClick={(e) => handleViewDetails(item, e)}'), 'Button onClick must be bound to handleViewDetails');
assert.ok(drillDownCode.includes('onStartSurvey'), 'Must pass onStartSurvey to SurveyPreviewModal');
assert.ok(drillDownCode.includes('active:scale-95'), 'Must have active press visual feedback on buttons');
assert.ok(drillDownCode.includes('Loader2'), 'Must show Loader2 loading spinner feedback');
console.log('✓ SurveyDrillDownModal click event handler and data extraction verified');

// 3. Verify SurveyPreviewModal portal, z-index, and unvisited state handling
const previewModalCode = fs.readFileSync(previewModalPath, 'utf-8');
assert.ok(previewModalCode.includes('createPortal'), 'SurveyPreviewModal must use createPortal for proper stacking over modals');
assert.ok(previewModalCode.includes('z-[70]'), 'SurveyPreviewModal must have z-[70] higher than drill-down modal z-50');
assert.ok(previewModalCode.includes('isUnvisited'), 'Must detect isUnvisited stations');
assert.ok(previewModalCode.includes('onStartSurvey'), 'Must support onStartSurvey prop');
assert.ok(previewModalCode.includes('ยังไม่มีประวัติการบันทึกข้อมูลการตรวจเยี่ยมภาคสนาม'), 'Must show clean unvisited empty state headline');
assert.ok(previewModalCode.includes('เริ่มลงพื้นที่สำรวจสถานีนี้'), 'Must show quick action button to start field visit for unvisited station');
assert.ok(previewModalCode.includes("e.key === 'Escape'"), 'Must handle Escape key to close modal');
assert.ok(previewModalCode.includes('overflow = \'hidden\''), 'Must lock background scroll when preview modal is open');
assert.ok(previewModalCode.includes('z-[80]'), 'Photo lightbox must have z-[80] higher than preview modal');
console.log('✓ SurveyPreviewModal portal, layering, and unvisited defensive state verified');

// 4. Verify FieldVisitView pre-fill and URL query param auto-hydration
const fieldVisitCode = fs.readFileSync(fieldVisitPath, 'utf-8');
assert.ok(fieldVisitCode.includes('isEditMode'), 'Must check isEditMode before showing editing status');
assert.ok(fieldVisitCode.includes('เตรียมพร้อมบันทึกข้อมูลการตรวจเยี่ยมสถานี'), 'Must show friendly status when pre-filling unvisited station');
assert.ok(fieldVisitCode.includes('URLSearchParams'), 'Must support URL query params for Option B navigation');
assert.ok(fieldVisitCode.includes('siteIdParam'), 'Must extract siteId query parameter');
assert.ok(fieldVisitCode.includes('findStationByName'), 'Must match station by name from query param');
console.log('✓ FieldVisitView unvisited status and Option B URL auto-hydration verified');

// 5. Verify App.jsx and utils.js routing
const appCode = fs.readFileSync(appPath, 'utf-8');
const utilsCode = fs.readFileSync(utilsPath, 'utf-8');
assert.ok(appCode.includes("page === 'field-visit'"), 'App.jsx navigateTo must support field-visit route');
assert.ok(appCode.includes('?siteId='), 'App.jsx must attach siteId query param when navigating');
assert.ok(utilsCode.includes("clean === '/field-visit'"), 'utils.js getAppRoute must map /field-visit cleanly to field page');
console.log('✓ App.jsx and utils.js SPA routing verified');

console.log('--- ALL VIEW DETAILS & MODAL ROUTING TESTS PASSED ---');

