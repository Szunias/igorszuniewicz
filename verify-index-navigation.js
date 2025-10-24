/**
 * Verification script for index.html navigation migration
 * Run this in the browser console on index.html
 */

console.log('🔍 Starting index.html navigation verification...\n');

const tests = [];

// Test 1: Navigation CSS loaded
const navCss = document.querySelector('link[href="assets/css/navigation.css"]');
tests.push({
  name: 'Navigation CSS link exists in <head>',
  pass: !!navCss,
  details: navCss ? '✓ Found' : '✗ Not found'
});

// Test 2: No inline navigation styles
const styleBlocks = Array.from(document.querySelectorAll('style'));
let hasInlineNavStyles = false;
styleBlocks.forEach(style => {
  const content = style.textContent;
  if (content.includes('.header {') || 
      content.includes('.nav {') || 
      content.includes('.nav-links') ||
      content.includes('.mobile-menu')) {
    hasInlineNavStyles = true;
  }
});
tests.push({
  name: 'No inline navigation styles in <style> blocks',
  pass: !hasInlineNavStyles,
  details: hasInlineNavStyles ? '✗ Found inline nav styles' : '✓ Clean'
});

// Test 3: Navigation JS loaded
const navScript = document.querySelector('script[src="assets/js/components/navigation.js"]');
tests.push({
  name: 'Navigation JS script loaded',
  pass: !!navScript,
  details: navScript ? '✓ Found' : '✗ Not found'
});

// Test 4: Header element exists
const header = document.querySelector('.header');
tests.push({
  name: 'Header element injected by navigation.js',
  pass: !!header,
  details: header ? '✓ Present' : '✗ Missing'
});

// Test 5: Navigation structure
const nav = document.querySelector('.nav');
const logo = document.querySelector('.logo');
const navLinks = document.querySelectorAll('.nav-links a');
tests.push({
  name: 'Navigation structure complete',
  pass: !!nav && !!logo && navLinks.length === 5,
  details: `Nav: ${!!nav}, Logo: ${!!logo}, Links: ${navLinks.length}/5`
});

// Test 6: Active link highlighting
const currentPath = window.location.pathname;
const activeLink = document.querySelector('.nav-links a.active');
tests.push({
  name: 'Active link highlighting works',
  pass: !!activeLink,
  details: activeLink ? `✓ Active: ${activeLink.textContent}` : '✗ No active link'
});

// Test 7: Mobile menu elements
const mobileToggle = document.querySelector('.mobile-menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileOverlay = document.querySelector('.mobile-menu-overlay');
tests.push({
  name: 'Mobile menu elements present',
  pass: !!mobileToggle && !!mobileMenu && !!mobileOverlay,
  details: `Toggle: ${!!mobileToggle}, Menu: ${!!mobileMenu}, Overlay: ${!!mobileOverlay}`
});

// Test 8: Language switcher
const langButtons = document.querySelectorAll('.lang-btn');
tests.push({
  name: 'Language switcher buttons',
  pass: langButtons.length === 6, // 3 desktop + 3 mobile
  details: `Found ${langButtons.length}/6 buttons`
});

// Test 9: Scroll effect
const scrollTest = () => {
  const initialScroll = window.scrollY;
  window.scrollTo(0, 100);
  setTimeout(() => {
    const hasScrolledClass = header && header.classList.contains('scrolled');
    tests.push({
      name: 'Scroll effect functionality',
      pass: hasScrolledClass,
      details: hasScrolledClass ? '✓ Header has scrolled class' : '✗ Scroll effect not working'
    });
    window.scrollTo(0, initialScroll);
    displayResults();
  }, 200);
};

// Test 10: Mobile menu functionality
const mobileTest = () => {
  if (mobileToggle && mobileMenu && mobileOverlay) {
    mobileToggle.click();
    setTimeout(() => {
      const isOpen = mobileMenu.classList.contains('active');
      tests.push({
        name: 'Mobile menu toggle functionality',
        pass: isOpen,
        details: isOpen ? '✓ Opens correctly' : '✗ Does not open'
      });
      
      // Close it
      if (isOpen) {
        mobileOverlay.click();
      }
      
      scrollTest();
    }, 100);
  } else {
    scrollTest();
  }
};

function displayResults() {
  console.log('\n📊 Test Results:\n');
  console.log('═'.repeat(60));
  
  let passed = 0;
  let failed = 0;
  
  tests.forEach((test, index) => {
    const icon = test.pass ? '✅' : '❌';
    console.log(`${icon} ${index + 1}. ${test.name}`);
    console.log(`   ${test.details}`);
    
    if (test.pass) passed++;
    else failed++;
  });
  
  console.log('═'.repeat(60));
  console.log(`\n📈 Summary: ${passed} passed, ${failed} failed out of ${tests.length} tests`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Navigation migration successful!');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the issues above.');
  }
  
  // Additional manual test instructions
  console.log('\n📝 Manual Tests to Perform:');
  console.log('1. Resize browser to mobile width (<768px)');
  console.log('2. Click hamburger menu and verify it opens');
  console.log('3. Click overlay to close menu');
  console.log('4. Test language switcher buttons');
  console.log('5. Navigate to other pages and verify navigation persists');
  console.log('6. Check that smooth navigation transitions work');
}

// Run mobile test which chains to scroll test and results
setTimeout(mobileTest, 500);
