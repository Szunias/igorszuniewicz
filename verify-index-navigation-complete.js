// Verification script for Task 2.5: Test index.html navigation
// This script checks all requirements for the navigation implementation

const fs = require('fs');
const path = require('path');

console.log('🧪 Starting Index.html Navigation Verification\n');
console.log('=' .repeat(60));

const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

function test(name, condition, details = '') {
  const status = condition ? '✅ PASS' : '❌ FAIL';
  const result = { name, passed: condition, details };
  results.tests.push(result);
  
  if (condition) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  console.log(`${status}: ${name}`);
  if (details) {
    console.log(`   ${details}`);
  }
}

function warn(name, details = '') {
  const result = { name, passed: null, details };
  results.tests.push(result);
  results.warnings++;
  
  console.log(`⚠️  WARN: ${name}`);
  if (details) {
    console.log(`   ${details}`);
  }
}

// Read index.html
const indexPath = path.join(__dirname, 'index.html');
let indexContent = '';

try {
  indexContent = fs.readFileSync(indexPath, 'utf-8');
} catch (error) {
  console.error('❌ Failed to read index.html:', error.message);
  process.exit(1);
}

console.log('\n📋 Test Category 1: Navigation Component Integration\n');

// Test 1.1: navigation.css is linked
test(
  'navigation.css is linked in <head>',
  indexContent.includes('href="assets/css/navigation.css"'),
  'Found: <link rel="stylesheet" href="assets/css/navigation.css">'
);

// Test 1.2: navigation.js is loaded
test(
  'navigation.js is loaded before </body>',
  indexContent.includes('src="assets/js/components/navigation.js"'),
  'Found: <script src="assets/js/components/navigation.js"></script>'
);

// Test 1.3: No inline navigation styles
const hasInlineNavStyles = 
  (indexContent.match(/<style[^>]*>[\s\S]*?\.header[\s\S]*?<\/style>/i) !== null) ||
  (indexContent.match(/<style[^>]*>[\s\S]*?\.nav-links[\s\S]*?<\/style>/i) !== null) ||
  (indexContent.match(/<style[^>]*>[\s\S]*?\.mobile-menu[\s\S]*?<\/style>/i) !== null);

test(
  'No inline navigation styles in HTML',
  !hasInlineNavStyles,
  hasInlineNavStyles ? 
    'Found inline navigation styles (should be in navigation.css)' : 
    'No inline navigation styles found - using external CSS'
);

// Test 1.4: No hardcoded navigation HTML
const hasHardcodedNav = 
  indexContent.match(/<header[^>]*class="[^"]*header[^"]*"[^>]*>[\s\S]*?<\/header>/i) !== null &&
  !indexContent.includes('<!-- Navigation loaded by navigation.js -->');

test(
  'No hardcoded navigation HTML structure',
  !hasHardcodedNav,
  hasHardcodedNav ? 
    'Found hardcoded <header> element (should be injected by navigation.js)' : 
    'Navigation is dynamically loaded by navigation.js'
);

// Test 1.5: Comment indicating dynamic navigation
test(
  'Comment indicates navigation is loaded dynamically',
  indexContent.includes('<!-- Navigation loaded by navigation.js -->') ||
  indexContent.includes('Navigation loaded by navigation.js') ||
  indexContent.includes('Navigation will be injected'),
  'Found comment about dynamic navigation loading'
);

console.log('\n📋 Test Category 2: Navigation Component Files\n');

// Test 2.1: navigation.js exists
const navJsPath = path.join(__dirname, 'assets/js/components/navigation.js');
const navJsExists = fs.existsSync(navJsPath);
test(
  'navigation.js file exists',
  navJsExists,
  navJsExists ? 'File found at assets/js/components/navigation.js' : 'File not found'
);

// Test 2.2: navigation.css exists
const navCssPath = path.join(__dirname, 'assets/css/navigation.css');
const navCssExists = fs.existsSync(navCssPath);
test(
  'navigation.css file exists',
  navCssExists,
  navCssExists ? 'File found at assets/css/navigation.css' : 'File not found'
);

// Test 2.3: navigation.js has required functions
if (navJsExists) {
  const navJsContent = fs.readFileSync(navJsPath, 'utf-8');
  
  test(
    'navigation.js has loadNavigation() function',
    navJsContent.includes('function loadNavigation()'),
    'Function found'
  );
  
  test(
    'navigation.js has setActiveLink() function',
    navJsContent.includes('function setActiveLink()'),
    'Function found - handles active link highlighting'
  );
  
  test(
    'navigation.js has initMobileMenu() function',
    navJsContent.includes('function initMobileMenu()'),
    'Function found - handles mobile menu functionality'
  );
  
  test(
    'navigation.js has initScrollEffect() function',
    navJsContent.includes('function initScrollEffect()'),
    'Function found - handles scroll effects'
  );
  
  test(
    'navigation.js auto-loads on DOMContentLoaded',
    navJsContent.includes('DOMContentLoaded') || navJsContent.includes('document.readyState'),
    'Auto-initialization code found'
  );
}

console.log('\n📋 Test Category 3: Requirements Coverage\n');

// Requirement 2.1: Navigation bar with links
test(
  'Req 2.1: Navigation displays Home, About, Projects, Music, Contact',
  navJsExists && fs.readFileSync(navJsPath, 'utf-8').includes('nav_home') &&
  fs.readFileSync(navJsPath, 'utf-8').includes('nav_about') &&
  fs.readFileSync(navJsPath, 'utf-8').includes('nav_projects') &&
  fs.readFileSync(navJsPath, 'utf-8').includes('nav_music') &&
  fs.readFileSync(navJsPath, 'utf-8').includes('nav_contact'),
  'All navigation links are present in navigation.js'
);

// Requirement 2.2: Language switcher
test(
  'Req 2.2: Language switcher displays EN, PL, NL',
  navJsExists && fs.readFileSync(navJsPath, 'utf-8').includes('data-lang="en"') &&
  fs.readFileSync(navJsPath, 'utf-8').includes('data-lang="pl"') &&
  fs.readFileSync(navJsPath, 'utf-8').includes('data-lang="nl"'),
  'All three language options are present'
);

// Requirement 2.3: Active link highlighting
test(
  'Req 2.3: Active link highlighting implemented',
  navJsExists && fs.readFileSync(navJsPath, 'utf-8').includes('setActiveLink'),
  'setActiveLink() function handles active state'
);

// Requirement 4.1 & 4.2: Responsive navigation
warn(
  'Req 4.1 & 4.2: Desktop/Mobile responsive behavior',
  'Manual test required: Check navigation at different viewport sizes'
);

// Requirement 4.3: Scroll effects
test(
  'Req 4.3: Scroll effects implemented',
  navJsExists && fs.readFileSync(navJsPath, 'utf-8').includes('initScrollEffect'),
  'initScrollEffect() function handles scroll behavior'
);

console.log('\n📋 Test Category 4: Integration Checks\n');

// Test 4.1: Translation system integration
test(
  'Navigation uses translation system (data-i18n attributes)',
  navJsExists && fs.readFileSync(navJsPath, 'utf-8').includes('data-i18n'),
  'Navigation links have data-i18n attributes for translations'
);

// Test 4.2: Smooth navigation compatibility
test(
  'Smooth navigation script is loaded',
  indexContent.includes('simple-smooth-nav.js') || indexContent.includes('smooth-navigation.js'),
  'Smooth navigation system is present'
);

// Test 4.3: Load order is correct
const cssIndex = indexContent.indexOf('navigation.css');
const jsIndex = indexContent.indexOf('navigation.js');
test(
  'CSS loads before JS (correct order)',
  cssIndex > 0 && jsIndex > 0 && cssIndex < jsIndex,
  'navigation.css loads in <head>, navigation.js loads before </body>'
);

console.log('\n📋 Test Category 5: Manual Testing Required\n');

warn(
  'Load page and verify navigation appears',
  'Open index.html in browser and check that navigation is visible'
);

warn(
  'Test active link highlighting',
  'Verify that "Home" link is highlighted on index.html'
);

warn(
  'Test mobile menu functionality',
  'Resize to mobile viewport (≤768px) and test hamburger menu'
);

warn(
  'Test scroll effects',
  'Scroll down page and verify header changes appearance'
);

warn(
  'Test language switcher',
  'Click EN/PL/NL buttons and verify navigation text updates'
);

warn(
  'Test cross-browser compatibility',
  'Test in Chrome, Firefox, Safari, and Edge'
);

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 TEST SUMMARY\n');
console.log(`✅ Passed:   ${results.passed}`);
console.log(`❌ Failed:   ${results.failed}`);
console.log(`⚠️  Warnings: ${results.warnings}`);
console.log(`📝 Total:    ${results.tests.length}`);

const passRate = results.tests.length > 0 
  ? Math.round((results.passed / (results.passed + results.failed)) * 100) 
  : 0;
console.log(`\n📈 Pass Rate: ${passRate}%`);

if (results.failed === 0) {
  console.log('\n🎉 All automated tests passed!');
  console.log('⚠️  Please complete manual tests in browser to fully verify Task 2.5');
} else {
  console.log('\n❌ Some tests failed. Please review and fix issues.');
  process.exit(1);
}

console.log('\n💡 Next Steps:');
console.log('   1. Open http://localhost:8000/test-index-navigation-complete.html');
console.log('   2. Review automated test results');
console.log('   3. Perform manual testing in browser');
console.log('   4. Test on different devices and browsers');
console.log('   5. Mark task 2.5 as complete if all tests pass');
console.log('\n' + '='.repeat(60));
