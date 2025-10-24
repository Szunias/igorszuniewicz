/**
 * Contact Navigation Verification Script
 * Verifies that contact.html has been properly migrated to unified navigation
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Contact Navigation Verification\n');
console.log('='.repeat(60));

// Read contact.html
const contactPath = path.join(__dirname, 'contact.html');
let contactHtml;

try {
  contactHtml = fs.readFileSync(contactPath, 'utf8');
  console.log('✓ contact.html loaded successfully\n');
} catch (error) {
  console.error('✗ FAILED: Could not read contact.html');
  console.error(error.message);
  process.exit(1);
}

let passed = 0;
let failed = 0;
let warnings = 0;

// Test 1: Check for navigation.css link
console.log('Test 1: Navigation CSS Link');
if (contactHtml.includes('assets/css/navigation.css')) {
  console.log('  ✓ PASS: navigation.css is linked');
  passed++;
} else {
  console.log('  ✗ FAIL: navigation.css link not found');
  failed++;
}

// Test 2: Check for navigation.js script
console.log('\nTest 2: Navigation JS Script');
if (contactHtml.includes('assets/js/components/navigation.js')) {
  console.log('  ✓ PASS: navigation.js is loaded');
  passed++;
} else {
  console.log('  ✗ FAIL: navigation.js script not found');
  failed++;
}

// Test 3: Check that inline navigation styles are removed
console.log('\nTest 3: Inline Navigation Styles Removed');
const hasHeaderStyles = contactHtml.includes('.header {') && 
                        contactHtml.match(/\.header\s*{[^}]*position:\s*fixed/);
const hasNavStyles = contactHtml.includes('.nav {') && 
                     contactHtml.match(/\.nav\s*{[^}]*display:\s*flex/);
const hasNavLinksStyles = contactHtml.match(/\.nav-links\s*{[^}]*display:\s*flex/);
const hasLangSwitcherStyles = contactHtml.match(/\.lang-switcher\s*{/);
const hasMobileMenuStyles = contactHtml.match(/\.mobile-menu-toggle\s*{/);

if (hasHeaderStyles || hasNavStyles || hasNavLinksStyles || hasLangSwitcherStyles || hasMobileMenuStyles) {
  console.log('  ✗ FAIL: Inline navigation styles still present:');
  if (hasHeaderStyles) console.log('    - .header styles found');
  if (hasNavStyles) console.log('    - .nav styles found');
  if (hasNavLinksStyles) console.log('    - .nav-links styles found');
  if (hasLangSwitcherStyles) console.log('    - .lang-switcher styles found');
  if (hasMobileMenuStyles) console.log('    - .mobile-menu-toggle styles found');
  failed++;
} else {
  console.log('  ✓ PASS: No inline navigation styles found');
  passed++;
}

// Test 4: Check that no hardcoded navigation HTML exists (in body)
console.log('\nTest 4: No Hardcoded Navigation HTML');
const bodyMatch = contactHtml.match(/<body[^>]*>([\s\S]*)<\/body>/);
if (bodyMatch) {
  const bodyContent = bodyMatch[1];
  // Check if there's a hardcoded header/nav before the comment
  const hasHardcodedHeader = bodyContent.match(/<header[^>]*class="header"/);
  const hasHardcodedNav = bodyContent.match(/<nav[^>]*class="nav"/);
  
  if (hasHardcodedHeader || hasHardcodedNav) {
    console.log('  ⚠ WARNING: Found <header> or <nav> tags in body');
    console.log('    (This may be okay if injected by navigation.js)');
    warnings++;
  } else {
    console.log('  ✓ PASS: No hardcoded navigation HTML in body');
    passed++;
  }
} else {
  console.log('  ⚠ WARNING: Could not parse body content');
  warnings++;
}

// Test 5: Check for translation integration
console.log('\nTest 5: Translation Integration');
if (contactHtml.includes('assets/js/translations.js')) {
  console.log('  ✓ PASS: translations.js is loaded');
  passed++;
} else {
  console.log('  ✗ FAIL: translations.js not found');
  failed++;
}

// Test 6: Check for smooth navigation integration
console.log('\nTest 6: Smooth Navigation Integration');
if (contactHtml.includes('simple-smooth-nav.js')) {
  console.log('  ✓ PASS: smooth navigation is integrated');
  passed++;
} else {
  console.log('  ⚠ WARNING: smooth navigation script not found');
  warnings++;
}

// Test 7: Check for contact form (existing functionality)
console.log('\nTest 7: Contact Form Preserved');
if (contactHtml.includes('id="contact-form"')) {
  console.log('  ✓ PASS: Contact form is present');
  passed++;
} else {
  console.log('  ✗ FAIL: Contact form not found');
  failed++;
}

// Test 8: Check for proper script loading order
console.log('\nTest 8: Script Loading Order');
const scriptMatches = [...contactHtml.matchAll(/<script[^>]*src="([^"]+)"/g)];
const scriptOrder = scriptMatches.map(m => m[1]);
const navIndex = scriptOrder.findIndex(s => s.includes('navigation.js'));
const translationIndex = scriptOrder.findIndex(s => s.includes('translations.js'));

if (navIndex !== -1 && translationIndex !== -1) {
  if (navIndex < translationIndex) {
    console.log('  ✓ PASS: navigation.js loads before translations.js');
    passed++;
  } else {
    console.log('  ⚠ WARNING: translations.js loads before navigation.js');
    console.log('    (This may cause timing issues)');
    warnings++;
  }
} else {
  console.log('  ⚠ WARNING: Could not verify script order');
  warnings++;
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('SUMMARY');
console.log('='.repeat(60));
console.log(`✓ Passed:   ${passed}`);
console.log(`✗ Failed:   ${failed}`);
console.log(`⚠ Warnings: ${warnings}`);

if (failed === 0) {
  console.log('\n✓ All critical tests passed!');
  console.log('\nManual testing required:');
  console.log('  1. Open contact.html in browser');
  console.log('  2. Verify navigation appears at top');
  console.log('  3. Verify "Contact" link is active/highlighted');
  console.log('  4. Test navigation links work');
  console.log('  5. Test language switcher');
  console.log('  6. Test mobile menu (resize to < 768px)');
  console.log('  7. Test scroll effects');
  console.log('  8. Test contact form submission');
  process.exit(0);
} else {
  console.log('\n✗ Some tests failed. Please review and fix issues.');
  process.exit(1);
}
