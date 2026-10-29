import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('--- Test Suite: View Details Button, Scrollable Modal & Table Header Verification ---');

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

// 2. Verify SurveyDrillDownModal table header rename and data extraction
const drillDownCode = fs.readFileSync(drillDownPath, 'utf-8');
assert.ok(drillDownCode.includes('>ลำดับ</th>'), 'First column header must be renamed from # to ลำดับ');
assert.ok(!drillDownCode.includes('>#</th>'), 'First column header must not be #');
assert.ok(drillDownCode.includes('handleViewDetails'), 'Must have handleViewDetails handler');
assert.ok(drillDownCode.includes('loadingRowId'), 'Must have loadingRowId state for visual feedback');
assert.ok(drillDownCode.includes('setLoadingRowId'), 'Must set loadingRowId on click');
assert.ok(drillDownCode.includes('siteId: item.siteId'), 'Must extract siteId from selected row');
assert.ok(drillDownCode.includes('recordId: recId'), 'Must extract recordId for edit routing');
assert.ok(drillDownCode.includes('contactName: item.contactName'), 'Must extract contact info from selected row');
assert.ok(drillDownCode.includes('handleDirectVisit'), 'Must have handleDirectVisit for unvisited stations');
assert.ok(drillDownCode.includes('onClick={(e) => handleViewDetails(item, e)}'), 'Button onClick must be bound to handleViewDetails');
assert.ok(drillDownCode.includes('onStartSurvey'), 'Must pass onStartSurvey to SurveyPreviewModal');
assert.ok(drillDownCode.includes('active:scale-95'), 'Must have active press visual feedback on buttons');
assert.ok(drillDownCode.includes('Loader2'), 'Must show Loader2 loading spinner feedback');
console.log('✓ SurveyDrillDownModal table header ลำดับ and data extraction verified');

// 3. Verify SurveyPreviewModal uses Radix Dialog Primitive, proper overflow, and responsive controls
const previewModalCode = fs.readFileSync(previewModalPath, 'utf-8');
assert.ok(previewModalCode.includes('DialogPrimitive.Root'), 'SurveyPreviewModal must use DialogPrimitive.Root to avoid focus/pointer blocking');
assert.ok(previewModalCode.includes('DialogPrimitive.Portal'), 'Must use DialogPrimitive.Portal');
assert.ok(previewModalCode.includes('DialogPrimitive.Overlay'), 'Must use DialogPrimitive.Overlay');
assert.ok(previewModalCode.includes('DialogPrimitive.Content'), 'Must use DialogPrimitive.Content');
assert.ok(previewModalCode.includes('max-h-[90vh]'), 'Modal dialog container must have max-h-[90vh]');
assert.ok(previewModalCode.includes('overflow-y-auto'), 'Modal body must allow vertical scrolling with overflow-y-auto');
assert.ok(previewModalCode.includes('pointer-events-auto'), 'Overlay and content must have pointer-events-auto to prevent click interception');
assert.ok(previewModalCode.includes('z-[70]'), 'SurveyPreviewModal must have z-[70] higher than drill-down modal z-50');
assert.ok(previewModalCode.includes('onOpenChange={(open) => !open && onClose()}'), 'Must handle outside click and Escape via onOpenChange');
assert.ok(previewModalCode.includes('DialogPrimitive.Close'), 'Must bind close button (✕) cleanly to DialogPrimitive.Close and onClose');
assert.ok(previewModalCode.includes('onEdit(surveyData)'), 'Must bind Edit button to onEdit with surveyData');
assert.ok(previewModalCode.includes('isUnvisited'), 'Must detect isUnvisited stations');
assert.ok(previewModalCode.includes('onStartSurvey'), 'Must support onStartSurvey prop');
assert.ok(previewModalCode.includes('ยังไม่มีประวัติการบันทึกข้อมูลการตรวจเยี่ยมภาคสนาม'), 'Must show clean unvisited empty state headline');
assert.ok(previewModalCode.includes('เริ่มลงพื้นที่สำรวจสถานีนี้'), 'Must show quick action button to start field visit for unvisited station');
assert.ok(previewModalCode.includes('z-[80]'), 'Photo lightbox must have z-[80] higher than preview modal');
console.log('✓ SurveyPreviewModal Radix integration, unblocked pointer events, scrolling, and action buttons verified');

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

console.log('--- ALL TESTS PASSED SUCCESSFULLY ---');
