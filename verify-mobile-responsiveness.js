/**
 * Mobile Responsiveness Verification Script
 * Tests mobile navigation functionality and responsive styles
 */

const fs = require('fs');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const issues = [];

console.log('📱 Mobile Responsiveness Verification\n');
console.log('=' .repeat(60));

// Check navigation.css for mobile styles
console.log('\n🎨 Checking Mobile Navigation Styles...\n');

if (!fs.existsSync('assets/css/navigation.css')) {
    console.log('❌ navigation.css not found');
    issues.push('  - Missing assets/css/navigation.css');
    failedTests++;
    totalTests++;
} else {
    const navCSS = fs.readFileSync('assets/css/navigation.css', 'utf8');
    
    // Check for mobile menu toggle styles
    totalTests++;
    if (navCSS.includes('.mobile-menu-toggle')) {
        console.log('✅ Mobile menu toggle styles exist');
        passedTests++;
    } else {
        console.log('❌ Missing .mobile-menu-toggle styles');
        issues.push('  - Missing .mobile-menu-toggle in navigation.css');
        failedTests++;
    }
    
    // Check for mobile menu styles
    totalTests++;
    if (navCSS.includes('.mobile-menu')) {
        console.log('✅ Mobile menu styles exist');
        passedTests++;
    } else {
        console.log('❌ Missing .mobile-menu styles');
        issues.push('  - Missing .mobile-menu in navigation.css');
        failedTests++;
    }
    
    // Check for mobile overlay styles
    totalTests++;
    if (navCSS.includes('.mobile-menu-overlay')) {
        console.log('✅ Mobile overlay styles exist');
        passedTests++;
    } else {
        console.log('❌ Missing .mobile-menu-overlay styles');
        issues.push('  - Missing .mobile-menu-overlay in navigation.css');
        failedTests++;
    }
    
    // Check for media queries
    totalTests++;
    const hasMediaQuery = navCSS.includes('@media') && navCSS.includes('768px');
    if (hasMediaQuery) {
        console.log('✅ Responsive media queries exist (768px breakpoint)');
        passedTests++;
    } else {
        console.log('❌ Missing @media queries for 768px breakpoint');
        issues.push('  - Missing @media queries in navigation.css');
        failedTests++;
    }
    
    // Check for desktop nav styles
    totalTests++;
    if (navCSS.includes('.nav-links')) {
        console.log('✅ Desktop navigation styles exist');
        passedTests++;
    } else {
        console.log('❌ Missing .nav-links styles');
        issues.push('  - Missing .nav-links in navigation.css');
        failedTests++;
    }
    
    // Check for responsive display properties
    totalTests++;
    const hasResponsiveDisplay = navCSS.includes('display: none') || 
                                 navCSS.includes('display: flex') ||
                                 navCSS.includes('display: block');
    if (hasResponsiveDisplay) {
        console.log('✅ Responsive display properties exist');
        passedTests++;
    } else {
        console.log('⚠️  May be missing responsive display properties');
    }
}

// Check navigation.js for mobile functionality
console.log('\n⚙️  Checking Mobile Navigation JavaScript...\n');

if (!fs.existsSync('assets/js/components/navigation.js')) {
    console.log('❌ navigation.js not found');
    issues.push('  - Missing assets/js/components/navigation.js');
    failedTests++;
    totalTests++;
} else {
    const navJS = fs.readFileSync('assets/js/components/navigation.js', 'utf8');
    
    // Check for mobile menu initialization
    totalTests++;
    const hasMobileMenuInit = navJS.includes('mobile') || 
                             navJS.includes('initMobileMenu') ||
                             navJS.includes('mobile-menu');
    if (hasMobileMenuInit) {
        console.log('✅ Mobile menu initialization logic exists');
        passedTests++;
    } else {
        console.log('⚠️  Mobile menu init may be inline (check manually)');
    }
    
    // Check for toggle button logic
    totalTests++;
    const hasToggleLogic = navJS.includes('toggle') && 
                          navJS.includes('addEventListener');
    if (hasToggleLogic) {
        console.log('✅ Toggle button event handling exists');
        passedTests++;
    } else {
        console.log('❌ Missing toggle button event handling');
        issues.push('  - Missing toggle button logic in navigation.js');
        failedTests++;
    }
    
    // Check for overlay logic
    totalTests++;
    const hasOverlayLogic = navJS.includes('overlay') && 
                           navJS.includes('click');
    if (hasOverlayLogic) {
        console.log('✅ Overlay click handling exists');
        passedTests++;
    } else {
        console.log('❌ Missing overlay click handling');
        issues.push('  - Missing overlay click logic in navigation.js');
        failedTests++;
    }
    
    // Check for active class toggling
    totalTests++;
    const hasActiveToggle = navJS.includes('classList.add') || 
                           navJS.includes('classList.remove') ||
                           navJS.includes('classList.toggle');
    if (hasActiveToggle) {
        console.log('✅ Class toggling logic exists');
        passedTests++;
    } else {
        console.log('❌ Missing class toggling logic');
        issues.push('  - Missing classList manipulation in navigation.js');
        failedTests++;
    }
}

// Check pages have viewport meta tag
console.log('\n📄 Checking Viewport Meta Tags...\n');

const pagesToCheck = [
    'index.html',
    'about.html',
    'contact.html',
    'music.html',
    'projects/index.html'
];

for (const page of pagesToCheck) {
    totalTests++;
    if (!fs.existsSync(page)) {
        console.log(`❌ ${page}: File not found`);
        issues.push(`  - ${page} not found`);
        failedTests++;
        continue;
    }
    
    const content = fs.readFileSync(page, 'utf8');
    const hasViewportMeta = content.includes('<meta name="viewport"') && 
                           content.includes('width=device-width');
    
    if (hasViewportMeta) {
        console.log(`✅ ${page}: Has proper viewport meta tag`);
        passedTests++;
    } else {
        console.log(`❌ ${page}: Missing or improper viewport meta tag`);
        issues.push(`  - ${page} missing viewport meta tag`);
        failedTests++;
    }
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 Test Summary\n');
console.log(`Total Tests: ${totalTests}`);
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);
console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

if (issues.length > 0) {
    console.log('\n⚠️  Issues Found:\n');
    issues.forEach(issue => console.log(issue));
}

console.log('\n' + '='.repeat(60));

console.log('\n📋 Manual Testing Required:\n');
console.log('Please manually test the following on actual devices or browser DevTools:');
console.log('\n1. Mobile View (< 768px):');
console.log('   - Hamburger menu button is visible');
console.log('   - Desktop nav links are hidden');
console.log('   - Click hamburger to open mobile menu');
console.log('   - Menu slides in from right');
console.log('   - Dark overlay appears');
console.log('   - Click overlay to close menu');
console.log('   - Menu slides out smoothly');
console.log('\n2. Desktop View (≥ 768px):');
console.log('   - Nav links visible in header');
console.log('   - Hamburger button is hidden');
console.log('   - Links display horizontally');
console.log('   - Hover effects work');
console.log('\n3. Touch Interactions:');
console.log('   - Tap hamburger button');
console.log('   - Tap menu links');
console.log('   - Tap overlay');
console.log('   - Verify smooth animations');

console.log('\n' + '='.repeat(60));

if (failedTests === 0) {
    console.log('\n✅ All automated tests passed!');
    console.log('Mobile responsiveness is properly configured.');
    console.log('Please complete manual testing as described above.');
    process.exit(0);
} else {
    console.log('\n❌ Some tests failed. Please review the issues above.');
    process.exit(1);
}
