import fs from 'fs';
import path from 'path';

console.log('=== Running NBTC Microwave Collapsible Sidebar Verification Test ===\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passCount++;
  } else {
    console.error(`  ✗ FAILED: ${message}`);
    failCount++;
  }
}

// 1. Verify App.jsx
console.log('1. Checking App.jsx Sidebar State & Layout Integration...');
const appCode = fs.readFileSync('src/App.jsx', 'utf8');
assert(appCode.includes("localStorage.getItem('nbtc_pre_pm_sidebar_open')"), 'App.jsx reads nbtc_pre_pm_sidebar_open from localStorage');
assert(appCode.includes("localStorage.setItem('nbtc_pre_pm_sidebar_open', String(isSidebarOpen))"), 'App.jsx persists isSidebarOpen to localStorage on change');
assert(appCode.includes('toggleSidebar'), 'App.jsx defines toggleSidebar handler');
assert(appCode.includes("onToggleSidebar={toggleSidebar}"), 'App.jsx passes onToggleSidebar to Navbar');
assert(appCode.includes("isSidebarOpen={isSidebarOpen}"), 'App.jsx passes isSidebarOpen to Navbar');
assert(appCode.includes("isOpen={isSidebarOpen}"), 'App.jsx passes isOpen to Sidebar');
assert(appCode.includes("isSidebarOpen ? 'pl-0 lg:pl-64' : 'pl-0'"), 'App.jsx dynamically adjusts padding to expand main content to 100% when collapsed');
assert(appCode.includes('transition-all duration-300 ease-in-out'), 'App.jsx uses smooth duration-300 transition for content resizing');

// 2. Verify Navbar.jsx
console.log('\n2. Checking Navbar.jsx Hamburger & Panel Toggle Button...');
const navbarCode = fs.readFileSync('src/components/Navbar.jsx', 'utf8');
assert(navbarCode.includes('PanelLeftClose'), 'Navbar.jsx imports PanelLeftClose from lucide-react');
assert(!navbarCode.includes('lg:hidden focus:outline-none focus:ring-2 focus:ring-blue-500\n            aria-label={isMobileMenuOpen'), 'Navbar toggle button is no longer hidden on desktop');
assert(navbarCode.includes('onToggleSidebar'), 'Navbar.jsx accepts onToggleSidebar prop');
assert(navbarCode.includes('isSidebarOpen'), 'Navbar.jsx accepts isSidebarOpen prop');
assert(navbarCode.includes('<PanelLeftClose className="h-5 w-5 text-cyan-400" />'), 'Navbar.jsx displays PanelLeftClose icon when desktop sidebar is expanded');
assert(navbarCode.includes('<Menu className="h-5 w-5" />'), 'Navbar.jsx displays Menu icon when sidebar is collapsed');
assert(navbarCode.includes('aria-label='), 'Navbar toggle button provides accessible aria-label');

// 3. Verify Sidebar.jsx
console.log('\n3. Checking Sidebar.jsx Responsive Drawer & Collapsible Layout...');
const sidebarCode = fs.readFileSync('src/components/Sidebar.jsx', 'utf8');
assert(sidebarCode.includes('isOpen = true'), 'Sidebar.jsx supports isOpen prop with default true');
assert(sidebarCode.includes("e.key === 'Escape'"), 'Sidebar.jsx listens to Escape key to close mobile drawer');
assert(sidebarCode.includes('bg-black/40') && sidebarCode.includes('backdrop-blur-sm'), 'Sidebar.jsx provides backdrop-blur-sm bg-black/40 overlay for mobile');
assert(sidebarCode.includes("isOpen ? 'lg:translate-x-0' : 'lg:-translate-x-full"), 'Sidebar.jsx transitions between visible and collapsed on desktop');
assert(sidebarCode.includes('transition-all duration-300 ease-in-out'), 'Sidebar.jsx has smooth duration-300 ease-in-out transition');
assert(sidebarCode.includes('PanelLeftClose'), 'Sidebar.jsx includes desktop collapse shortcut inside header');

// 4. Verify Version Consistency
console.log('\n4. Checking Version Consistency across Files...');
const versionJs = fs.readFileSync('src/version.js', 'utf8');
const packageJson = fs.readFileSync('package.json', 'utf8');
const changelog = fs.readFileSync('CHANGELOG.md', 'utf8');

assert(versionJs.includes("APP_VERSION = '2.17.7'"), 'src/version.js is at v2.17.7');
assert(packageJson.includes('"version": "2.17.7"'), 'package.json is at v2.17.7');
assert(changelog.includes('## [2.17.7] - 2026-10-29'), 'CHANGELOG.md has entry for v2.17.7');

console.log('\n======================================================');
if (failCount === 0) {
  console.log(`🎉 ALL ${passCount} COLLAPSIBLE SIDEBAR TESTS PASSED!`);
  console.log('======================================================');
  process.exit(0);
} else {
  console.error(`💥 ${failCount} TESTS FAILED! (Passed: ${passCount})`);
  console.log('======================================================');
  process.exit(1);
}
