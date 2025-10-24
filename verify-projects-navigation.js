/**
 * Verification script for projects/index.html navigation migration
 * Tests that the unified navigation component is properly integrated
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Verifying projects/index.html navigation migration...\n');

let passed = 0;
let failed = 0;
let warnings = 0;

// Test 1: Check if navigation.css exists
console.log('📋 Test 1: Navigation CSS file exists');
try {
  const cssPath = path.join(__dirname, 'assets', 'css', 'navigation.css');
  if (fs.existsSync(cssPath)) {
    console.log('✅ PASS: navigation.css found\n');
    passed++;
  } else {
    console.log('❌ FAIL: navigation.css not found\n');
    failed++;
  }
} catch (error) {
  console.log(`❌ FAIL: Error checking navigation.css: ${error.message}\n`);
  failed++;
}

// Test 2: Check if navigation.js exists
console.log('📋 Test 2: Navigation JS file exists');
try {
  const jsPath = path.join(__dirname, 'assets', 'js', 'components', 'navigation.js');
  if (fs.existsSync(jsPath)) {
    console.log('✅ PASS: navigation.js found\n');
    passed++;
  } else {
    console.log('❌ FAIL: navigation.js not found\n');
    failed++;
  }
} catch (error) {
  console.log(`❌ FAIL: Error checking navigation.js: ${error.message}\n`);
  failed++;
}

// Test 3: Check if projects/index.html exists
console.log('📋 Test 3: Projects index.html exists');
try {
  const htmlPath = path.join(__dirname, 'projects', 'index.html');
  if (fs.existsSync(htmlPath)) {
    console.log('✅ PASS: projects/index.html found\n');
    passed++;
  } else {
    console.log('❌ FAIL: projects/index.html not found\n');
    failed++;
  }
} catch (error) {
  console.log(`❌ FAIL: Error checking projects/index.html: ${error.message}\n`);
  failed++;
}

// Test 4: Check if navigation.css is linked with correct path
console.log('📋 Test 4: Navigation CSS linked with correct relative path');
try {
  const htmlPath = path.join(__dirname, 'projects', 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  
  if (html.includes('href="../assets/css/navigation.css"')) {
    console.log('✅ PASS: navigation.css linked with correct path (../assets/css/navigation.css)\n');
    passed++;
  } else if (html.includes('navigation.css')) {
    console.log('⚠️  WARNING: navigation.css linked but path may be incorrect\n');
    warnings++;
  } else {
    console.log('❌ FAIL: navigation.css not linked in projects/index.html\n');
    failed++;
  }
} catch (error) {
  console.log(`❌ FAIL: Error checking CSS link: ${error.message}\n`);
  failed++;
}

// Test 5: Check if navigation.js is loaded with correct path
console.log('📋 Test 5: Navigation JS loaded with correct relative path');
try {
  const htmlPath = path.join(__dirname, 'projects', 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  
  if (html.includes('src="../assets/js/components/navigation.js"')) {
    console.log('✅ PASS: navigation.js loaded with correct path (../assets/js/components/navigation.js)\n');
    passed++;
  } else if (html.includes('navigation.js')) {
    console.log('⚠️  WARNING: navigation.js loaded but path may be incorrect\n');
    warnings++;
  } else {
    console.log('❌ FAIL: navigation.js not loaded in projects/index.html\n');
    failed++;
  }
} catch (error) {
  console.log(`❌ FAIL: Error checking JS script: ${error.message}\n`);
  failed++;
}

// Test 6: Check that inline navigation styles are removed
console.log('📋 Test 6: Inline navigation styles removed');
try {
  const htmlPath = path.join(__dirname, 'projects', 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  
  const hasHeaderStyles = html.includes('.header {');
  const hasNavLinksStyles = html.includes('.nav-links {');
  const hasLangSwitcherStyles = html.includes('.lang-switcher {');
  
  if (!hasHeaderStyles && !hasNavLinksStyles && !hasLangSwitcherStyles) {
    console.log('✅ PASS: No inline navigation styles found\n');
    passed++;
  } else {
    const foundStyles = [];
    if (hasHeaderStyles) foundStyles.push('.header');
    if (hasNavLinksStyles) foundStyles.push('.nav-links');
    if (hasLangSwitcherStyles) foundStyles.push('.lang-switcher');
    console.log(`❌ FAIL: Inline navigation styles still present: ${foundStyles.join(', ')}\n`);
    failed++;
  }
} catch (error) {
  console.log(`❌ FAIL: Error checking inline styles: ${error.message}\n`);
  failed++;
}

// Test 7: Check that hardcoded navigation HTML is removed
console.log('📋 Test 7: Hardcoded navigation HTML removed');
try {
  const htmlPath = path.join(__dirname, 'projects', 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  
  // Look for hardcoded header/nav in the body (not in the component)
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/);
  if (bodyMatch) {
    const bodyContent = bodyMatch[1];
    // Check if there's a header before the script loads
    const hasHardcodedHeader = bodyContent.includes('<header class="header"') && 
                               bodyContent.indexOf('<header') < bodyContent.indexOf('navigation.js');
    
    if (!hasHardcodedHeader) {
      console.log('✅ PASS: No hardcoded navigation HTML found\n');
      passed++;
    } else {
      console.log('❌ FAIL: Hardcoded navigation HTML still present\n');
      failed++;
    }
  } else {
    console.log('⚠️  WARNING: Could not parse body content\n');
    warnings++;
  }
} catch (error) {
  console.log(`❌ FAIL: Error checking hardcoded HTML: ${error.message}\n`);
  failed++;
}

// Test 8: Check navigation.js has relative path logic
console.log('📋 Test 8: Navigation component handles relative paths');
try {
  const jsPath = path.join(__dirname, 'assets', 'js', 'components', 'navigation.js');
  const jsCode = fs.readFileSync(jsPath, 'utf8');
  
  const hasGetRelativePath = jsCode.includes('function getRelativePath()');
  const hasProjectsCheck = jsCode.includes("path.includes('/projects/')");
  const hasRelativeReturn = jsCode.includes("return '../'");
  
  if (hasGetRelativePath && hasProjectsCheck && hasRelativeReturn) {
    console.log('✅ PASS: Navigation component has relative path logic\n');
    passed++;
  } else {
    const missing = [];
    if (!hasGetRelativePath) missing.push('getRelativePath()');
    if (!hasProjectsCheck) missing.push('projects folder check');
    if (!hasRelativeReturn) missing.push('../ return statement');
    console.log(`❌ FAIL: Navigation component missing: ${missing.join(', ')}\n`);
    failed++;
  }
} catch (error) {
  console.log(`❌ FAIL: Error checking navigation.js logic: ${error.message}\n`);
  failed++;
}

// Test 9: Check for translation integration
console.log('📋 Test 9: Translation integration maintained');
try {
  const htmlPath = path.join(__dirname, 'projects', 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  
  if (html.includes('translations.js')) {
    console.log('✅ PASS: translations.js is loaded\n');
    passed++;
  } else {
    console.log('⚠️  WARNING: translations.js not found (may affect i18n)\n');
    warnings++;
  }
} catch (error) {
  console.log(`❌ FAIL: Error checking translations: ${error.message}\n`);
  failed++;
}

// Test 10: Check for smooth navigation integration
console.log('📋 Test 10: Smooth navigation integration maintained');
try {
  const htmlPath = path.join(__dirname, 'projects', 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  
  if (html.includes('simple-smooth-nav.js')) {
    console.log('✅ PASS: simple-smooth-nav.js is loaded\n');
    passed++;
  } else {
    console.log('⚠️  WARNING: simple-smooth-nav.js not found (may affect transitions)\n');
    warnings++;
  }
} catch (error) {
  console.log(`❌ FAIL: Error checking smooth navigation: ${error.message}\n`);
  failed++;
}

// Summary
console.log('═══════════════════════════════════════════════════════');
console.log('📊 TEST SUMMARY');
console.log('═══════════════════════════════════════════════════════');
console.log(`✅ Passed:   ${passed}`);
console.log(`❌ Failed:   ${failed}`);
console.log(`⚠️  Warnings: ${warnings}`);
console.log(`📈 Total:    ${passed + failed + warnings}`);

const passRate = ((passed / (passed + failed + warnings)) * 100).toFixed(1);
console.log(`\n🎯 Pass Rate: ${passRate}%`);

if (failed === 0) {
  console.log('\n🎉 SUCCESS! All critical tests passed!');
  console.log('✨ projects/index.html is ready for unified navigation');
  process.exit(0);
} else {
  console.log('\n⚠️  ATTENTION: Some tests failed. Please review the results above.');
  process.exit(1);
}
