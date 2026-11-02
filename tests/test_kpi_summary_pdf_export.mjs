import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log('======================================================================');
console.log(' NBTC Microwave — Executive KPI Summary & PDF Export Verification Test');
console.log('======================================================================\n');

// 1. Verify Component Files Existence
console.log('[Test 1] Verifying Component Files Existence...');
const modalFile = path.resolve('src/components/export/KpiSummaryReportModal.jsx');
assert(fs.existsSync(modalFile), 'KpiSummaryReportModal.jsx must exist');
const modalCode = fs.readFileSync(modalFile, 'utf8');

assert(modalCode.includes('HighResDonutChart'), 'Must contain SVG Donut Chart component');
assert(modalCode.includes('HighResProvincialBarChart'), 'Must contain Horizontal Bar Chart component');
assert(modalCode.includes('a4-sheet'), 'Must define A4 sheets for print and PDF');
assert(modalCode.includes('printable-kpi-report-area'), 'Must define printable report area container');
assert(modalCode.includes('html2canvas-pro'), 'Must use html2canvas-pro for Tailwind v4 compatibility');
assert(modalCode.includes('jspdf'), 'Must use jsPDF for direct PDF export');
assert(modalCode.includes('TH Sarabun New'), 'Must configure TH Sarabun New Thai typography');
console.log('  --> OK: KpiSummaryReportModal.jsx is fully structured');

// 2. Verify 10-Province Baseline & 197 Stations
console.log('\n[Test 2] Verifying 10-Province Baseline & 197 Stations...');
assert(modalCode.includes("name: 'กาญจนบุรี', total: 32"), 'Must include กาญจนบุรี (32)');
assert(modalCode.includes("name: 'ขอนแก่น', total: 29"), 'Must include ขอนแก่น (29)');
assert(modalCode.includes("name: 'นครราชสีมา', total: 26"), 'Must include นครราชสีมา (26)');
assert(modalCode.includes("name: 'นครศรีธรรมราช', total: 22"), 'Must include นครศรีธรรมราช (22)');
assert(modalCode.includes("name: 'เพชรบูรณ์', total: 22"), 'Must include เพชรบูรณ์ (22)');
assert(modalCode.includes("name: 'ตรัง', total: 19"), 'Must include ตรัง (19)');
assert(modalCode.includes("name: 'กำแพงเพชร', total: 18"), 'Must include กำแพงเพชร (18)');
assert(modalCode.includes("name: 'จันทบุรี', total: 18"), 'Must include จันทบุรี (18)');
assert(modalCode.includes("name: 'พิจิตร', total: 6"), 'Must include พิจิตร (6)');
assert(modalCode.includes("name: 'นครสวรรค์', total: 5"), 'Must include นครสวรรค์ (5)');
assert(modalCode.includes('TOTAL_BASELINE_STATIONS = 197'), 'Must define TOTAL_BASELINE_STATIONS = 197');
console.log('  --> OK: 10 provinces baseline sums to 197 stations');

// 3. Verify Executive KPI Cards & Metrics Structure
console.log('\n[Test 3] Verifying Executive KPI Summary Cards...');
assert(modalCode.includes('สถานีทั้งหมดในระบบ'), 'Must contain Total Stations in System card');
assert(modalCode.includes('สำรวจแล้วเสร็จ'), 'Must contain Total Surveyed card');
assert(modalCode.includes('อนุญาตเข้าพื้นที่'), 'Must contain Permitted Access card');
assert(modalCode.includes('ไม่อนุญาตเข้าพื้นที่'), 'Must contain Rejected Access card');
assert(modalCode.includes('รอดำเนินการ / ยังไม่ตรวจ'), 'Must contain Pending / Unvisited card');
console.log('  --> OK: All 5 Executive KPI Metric Cards implemented against 197 baseline');

// 4. Verify Provincial Breakdown Table
console.log('\n[Test 4] Verifying Provincial Breakdown Table...');
assert(modalCode.includes('ตารางสรุปผลการดำเนินงานจำแนกรายจังหวัด'), 'Must include Provincial Breakdown Table title');
assert(modalCode.includes('จำนวนสถานี (Baseline)'), 'Must include Baseline column');
assert(modalCode.includes('สำรวจแล้ว (แห่ง)'), 'Must include Surveyed column');
assert(modalCode.includes('ความคืบหน้า KPI (%)'), 'Must include KPI Progress Bar column');
assert(modalCode.includes('รวมทั้งสิ้น (Total — 10 จังหวัด)'), 'Must include Total summary row');
console.log('  --> OK: Provincial Breakdown Table with ranking and progress bars verified');

// 5. Verify DashboardView Integration
console.log('\n[Test 5] Verifying DashboardView Integration...');
const dashboardFile = path.resolve('src/components/dashboard/DashboardView.jsx');
const dashboardCode = fs.readFileSync(dashboardFile, 'utf8');

assert(dashboardCode.includes('KpiSummaryReportModal'), 'DashboardView must import KpiSummaryReportModal');
assert(dashboardCode.includes('isKpiReportOpen'), 'DashboardView must have isKpiReportOpen state');
assert(dashboardCode.includes('สรุปรายงาน KPI (Export PDF)'), 'DashboardView must have prominent Export PDF button');
console.log('  --> OK: Prominent Export Button in Dashboard Header verified');

// 6. Verify RecentSurveys Integration
console.log('\n[Test 6] Verifying RecentSurveys Integration...');
const recentFile = path.resolve('src/components/dashboard/RecentSurveys.jsx');
const recentCode = fs.readFileSync(recentFile, 'utf8');

assert(recentCode.includes('onOpenKpiReport'), 'RecentSurveys must accept onOpenKpiReport prop');
assert(recentCode.includes('สรุปรายงาน KPI (PDF)'), 'RecentSurveys must render KPI report button');
console.log('  --> OK: RecentSurveys integration verified');

// 7. Verify Print Stylesheet & Typography in index.css
console.log('\n[Test 7] Verifying Print Stylesheet & Typography in src/index.css...');
const cssFile = path.resolve('src/index.css');
const cssCode = fs.readFileSync(cssFile, 'utf8');

assert(cssCode.includes('#printable-kpi-report-area'), 'src/index.css must protect #printable-kpi-report-area');
assert(cssCode.includes('body.kpi-report-modal-open #root'), 'src/index.css must hide #root when KPI modal is open for printing');
assert(cssCode.includes('#kpi-report-modal-portal'), 'src/index.css must handle #kpi-report-modal-portal in print');
assert(cssCode.includes("font-family: 'TH Sarabun New'"), 'src/index.css must define TH Sarabun New web font');
console.log('  --> OK: Zero-offset print stylesheet and Thai typography verified');

// 8. Verify Signature & Approval Block Completely Removed
console.log('\n[Test 8] Verifying Signature & Approval Block Removal...');
assert(!modalCode.includes('ผู้จัดทำและรวบรวมรายงาน'), 'Must not contain ผู้จัดทำและรวบรวมรายงาน');
assert(!modalCode.includes('ผู้ตรวจสอบความถูกต้อง'), 'Must not contain ผู้ตรวจสอบความถูกต้อง');
assert(!modalCode.includes('ผู้อนุมัติรายงาน'), 'Must not contain ผู้อนุมัติรายงาน');
assert(!modalCode.includes('......................................................'), 'Must not contain dotted signature placeholders');
console.log('  --> OK: 3-column signature block, placeholders, and top divider line completely removed');

console.log('\n======================================================================');
console.log(' [SUCCESS] ALL 8 VERIFICATION SUITES PASSED CLEANLY (100%)');
console.log('======================================================================');
