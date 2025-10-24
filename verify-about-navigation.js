// Verification script for about.html navigation migration
// Tests: navigation loads, active link, mobile menu, scroll effects, cross-page navigation

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying about.html navigation migration...\n');

let passed = 0;
let failed = 0;

function test(name, condition, details = '') {
  if (condition) {
    console.log(`✅ ${name}`);
    passed++;
  } else {
    console.log(`❌ ${name}`);
    if (details) console.log(`   ${details}`);
    failed++;
  }
}

// Read about.html
const aboutPath = path.join(__dirname, 'about.html');
const aboutContent = fs.readFileSync(aboutPath, 'utf-8');

// Test 1: navigation.css is linked
test(
  'navigation.css is linked in head',
  aboutContent.includes('<link rel="stylesheet" href="assets/css/navigation.css">'),
  'Should have navigation.css link in head'
);

// Test 2: No inline header styles
test(
  'No inline .header styles',
  !aboutContent.match(/\.header\s*{[^}]*position:\s*fixed/),
  'Inline .header styles should be removed'
);

// Test 3: No inline nav styles
test(
  'No inline .nav styles',
  !aboutContent.match(/\.nav\s*{[^}]*display:\s*flex/),
  'Inline .nav styles should be removed'
);

// Test 4: No inline nav-links styles
test(
  'No inline .nav-links styles',
  !aboutContent.match(/\.nav-links\s*{/),
  'Inline .nav-links styles should be removed'
);

// Test 5: No inline lang-switcher styles
test(
  'No inline .lang-switcher styles',
  !aboutContent.match(/\.lang-switcher\s*{/),
  'Inline .lang-switcher styles should be removed'
);

// Test 6: No inline mobile-menu styles
test(
  'No inline .mobile-menu styles',
  !aboutContent.match(/\.mobile-menu\s*{/),
  'Inline .mobile-menu styles should be removed'
);

// Test 7: No inline mobile-menu-toggle styles
test(
  'No inline .mobile-menu-toggle styles',
  !aboutContent.match(/\.mobile-menu-toggle\s*{/),
  'Inline .mobile-menu-toggle styles should be removed'
);

// Test 8: No hardcoded navigation HTML
test(
  'No hardcoded <header> element',
  !aboutContent.match(/<header[^>]*class="header"[^>]*>/),
  'Hardcoded header should be removed (navigation.js will inject it)'
);

// Test 9: navigation.js is loaded
test(
  'navigation.js script is loaded',
  aboutContent.includes('<script src="assets/js/components/navigation.js"></script>'),
  'Should load navigation.js before closing body tag'
);

// Test 10: translations.js is loaded (for language switcher)
test(
  'translations.js is loaded',
  aboutContent.includes('<script src="assets/js/translations.js"></script>'),
  'Should load translations.js for language switching'
);

// Test 11: Verify navigation component exists
const navComponentPath = path.join(__dirname, 'assets/js/components/navigation.js');
test(
  'navigation.js component exists',
  fs.existsSync(navComponentPath),
  'Navigation component file should exist'
);

// Test 12: Verify navigation.css exists
const navCssPath = path.join(__dirname, 'assets/css/navigation.css');
test(
  'navigation.css file exists',
  fs.existsSync(navCssPath),
  'Navigation CSS file should exist'
);

// Test 13: Check navigation.css has required styles
if (fs.existsSync(navCssPath)) {
  const navCss = fs.readFileSync(navCssPath, 'utf-8');
  
  test(
    'navigation.css has .header styles',
    navCss.includes('.header {'),
    'navigation.css should contain .header styles'
  );
  
  test(
    'navigation.css has .nav styles',
    navCss.includes('.nav {'),
    'navigation.css should contain .nav styles'
  );
  
  test(
    'navigation.css has .mobile-menu styles',
    navCss.includes('.mobile-menu {'),
    'navigation.css should contain .mobile-menu styles'
  );
}

// Test 14: Check navigation.js has required functions
if (fs.existsSync(navComponentPath)) {
  const navJs = fs.readFileSync(navComponentPath, 'utf-8');
  
  test(
    'navigation.js has loadNavigation function',
    navJs.includes('function loadNavigation()'),
    'navigation.js should have loadNavigation function'
  );
  
  test(
    'navigation.js has setActiveLink function',
    navJs.includes('function setActiveLink()'),
    'navigation.js should have setActiveLink function'
  );
  
  test(
    'navigation.js has initMobileMenu function',
    navJs.includes('function initMobileMenu()'),
    'navigation.js should have initMobileMenu function'
  );
  
  test(
    'navigation.js has initScrollEffect function',
    navJs.includes('function initScrollEffect()'),
    'navigation.js should have initScrollEffect function'
  );
}

// Test 15: Verify page structure is intact
test(
  'Hero section exists',
  aboutContent.includes('class="hero"'),
  'Hero section should be present'
);

test(
  'Skills section exists',
  aboutContent.includes('class="skills-section"'),
  'Skills section should be present'
);

test(
  'Timeline section exists',
  aboutContent.includes('class="timeline-section"'),
  'Timeline section should be present'
);

// Summary
console.log('\n' + '='.repeat(50));
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log('='.repeat(50));

if (failed === 0) {
  console.log('\n🎉 All tests passed! about.html navigation migration is complete.');
  console.log('\n📋 Next steps:');
  console.log('   1. Open about.html in a browser');
  console.log('   2. Verify navigation appears at the top');
  console.log('   3. Test "About" link is highlighted');
  console.log('   4. Test mobile menu (resize to < 768px)');
  console.log('   5. Test scroll effects');
  console.log('   6. Navigate from index.html to about.html');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. Please review the issues above.');
  process.exit(1);
}
