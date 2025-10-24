// Automated verification script for navigation component
// Run with: node verify-navigation-component.js

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Navigation Component...\n');

// Test 1: Check if files exist
console.log('📁 Test 1: File Existence');
const jsPath = 'assets/js/components/navigation.js';
const cssPath = 'assets/css/navigation.css';

const jsExists = fs.existsSync(jsPath);
const cssExists = fs.existsSync(cssPath);

console.log(`  ${jsExists ? '✅' : '❌'} navigation.js exists: ${jsPath}`);
console.log(`  ${cssExists ? '✅' : '❌'} navigation.css exists: ${cssPath}`);

if (!jsExists || !cssExists) {
  console.log('\n❌ FAILED: Required files missing');
  process.exit(1);
}

// Test 2: Check JavaScript component structure
console.log('\n📝 Test 2: JavaScript Component Structure');
const jsContent = fs.readFileSync(jsPath, 'utf8');

const requiredFunctions = [
  'loadNavigation',
  'getRelativePath',
  'setActiveLink',
  'initMobileMenu',
  'initScrollEffect'
];

let allFunctionsPresent = true;
requiredFunctions.forEach(func => {
  const present = jsContent.includes(`function ${func}`);
  console.log(`  ${present ? '✅' : '❌'} Function: ${func}`);
  if (!present) allFunctionsPresent = false;
});

// Test 3: Check for auto-execution
console.log('\n🚀 Test 3: Auto-Execution');
const hasAutoExec = jsContent.includes('DOMContentLoaded') || jsContent.includes('document.readyState');
console.log(`  ${hasAutoExec ? '✅' : '❌'} Auto-execution on DOM ready`);

// Test 4: Check HTML structure generation
console.log('\n🏗️  Test 4: HTML Structure Generation');
const requiredElements = [
  '<header class="header"',
  '<nav class="nav"',
  'class="nav-links"',
  'class="mobile-menu"',
  'class="mobile-menu-overlay"',
  'class="mobile-menu-toggle"',
  'class="lang-switcher"'
];

let allElementsPresent = true;
requiredElements.forEach(elem => {
  const present = jsContent.includes(elem);
  console.log(`  ${present ? '✅' : '❌'} Element: ${elem}`);
  if (!present) allElementsPresent = false;
});

// Test 5: Check navigation links
console.log('\n🔗 Test 5: Navigation Links');
const requiredLinks = [
  'index.html',
  'about.html',
  'projects/index.html',
  'music.html',
  'contact.html'
];

let allLinksPresent = true;
requiredLinks.forEach(link => {
  const present = jsContent.includes(link);
  console.log(`  ${present ? '✅' : '❌'} Link: ${link}`);
  if (!present) allLinksPresent = false;
});

// Test 6: Check CSS styles
console.log('\n🎨 Test 6: CSS Styles');
const cssContent = fs.readFileSync(cssPath, 'utf8');

const requiredStyles = [
  '.header',
  '.header.scrolled',
  '.nav',
  '.nav-links',
  '.mobile-menu',
  '.mobile-menu-toggle',
  '.mobile-menu-overlay',
  '.lang-switcher',
  '.lang-btn',
  '@media (max-width: 768px)'
];

let allStylesPresent = true;
requiredStyles.forEach(style => {
  const present = cssContent.includes(style);
  console.log(`  ${present ? '✅' : '❌'} Style: ${style}`);
  if (!present) allStylesPresent = false;
});

// Test 7: Check for translation support
console.log('\n🌐 Test 7: Translation Support');
const hasTranslationSupport = jsContent.includes('data-i18n');
console.log(`  ${hasTranslationSupport ? '✅' : '❌'} data-i18n attributes present`);

// Test 8: Check for relative path handling
console.log('\n📂 Test 8: Relative Path Handling');
const hasRelativePathLogic = jsContent.includes('/projects/') && jsContent.includes('../');
console.log(`  ${hasRelativePathLogic ? '✅' : '❌'} Subfolder path detection`);

// Test 9: Check for error handling
console.log('\n⚠️  Test 9: Error Handling');
const hasErrorHandling = jsContent.includes('console.error') || jsContent.includes('if (!document.body)');
console.log(`  ${hasErrorHandling ? '✅' : '❌'} Error handling present`);

// Test 10: Check for mobile responsiveness
console.log('\n📱 Test 10: Mobile Responsiveness');
const hasMobileStyles = cssContent.includes('@media') && cssContent.includes('768px');
console.log(`  ${hasMobileStyles ? '✅' : '❌'} Mobile breakpoint defined`);

// Final Summary
console.log('\n' + '='.repeat(50));
console.log('📊 VERIFICATION SUMMARY');
console.log('='.repeat(50));

const allTestsPassed = 
  jsExists && 
  cssExists && 
  allFunctionsPresent && 
  hasAutoExec && 
  allElementsPresent && 
  allLinksPresent && 
  allStylesPresent && 
  hasTranslationSupport && 
  hasRelativePathLogic && 
  hasErrorHandling && 
  hasMobileStyles;

if (allTestsPassed) {
  console.log('✅ ALL TESTS PASSED');
  console.log('\nThe navigation component is ready for migration!');
  console.log('\nNext steps:');
  console.log('  1. Open http://localhost:8000/test-navigation-component.html');
  console.log('  2. Verify visual appearance and interactions');
  console.log('  3. Test mobile menu functionality');
  console.log('  4. Test scroll effects');
  console.log('  5. Proceed with page migration');
} else {
  console.log('❌ SOME TESTS FAILED');
  console.log('\nPlease fix the issues above before proceeding.');
  process.exit(1);
}

console.log('\n');
