/**
 * Scroll Effects Verification Script
 * Tests scroll effect functionality in navigation
 */

const fs = require('fs');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const issues = [];

console.log('📜 Scroll Effects Verification\n');
console.log('=' .repeat(60));

// Check navigation.js for scroll logic
console.log('\n⚙️  Checking Scroll JavaScript Logic...\n');

if (!fs.existsSync('assets/js/components/navigation.js')) {
    console.log('❌ navigation.js not found');
    issues.push('  - Missing assets/js/components/navigation.js');
    failedTests++;
    totalTests++;
} else {
    const navJS = fs.readFileSync('assets/js/components/navigation.js', 'utf8');
    
    // Check for scroll event listener
    totalTests++;
    const hasScrollListener = navJS.includes('scroll') && navJS.includes('addEventListener');
    if (hasScrollListener) {
        console.log('✅ Scroll event listener exists');
        passedTests++;
    } else {
        console.log('❌ Missing scroll event listener');
        issues.push('  - Missing scroll event listener in navigation.js');
        failedTests++;
    }
    
    // Check for scrolled class manipulation
    totalTests++;
    const hasScrolledClass = navJS.includes('scrolled') || 
                             (navJS.includes('classList') && navJS.includes('add'));
    if (hasScrolledClass) {
        console.log('✅ Scrolled class manipulation exists');
        passedTests++;
    } else {
        console.log('❌ Missing scrolled class manipulation');
        issues.push('  - Missing scrolled class logic in navigation.js');
        failedTests++;
    }
    
    // Check for scroll position detection
    totalTests++;
    const hasScrollDetection = navJS.includes('window.scrollY') || 
                               navJS.includes('pageYOffset') ||
                               navJS.includes('scrollTop');
    if (hasScrollDetection) {
        console.log('✅ Scroll position detection exists');
        passedTests++;
    } else {
        console.log('❌ Missing scroll position detection');
        issues.push('  - Missing scroll position detection in navigation.js');
        failedTests++;
    }
    
    // Check for header element selection
    totalTests++;
    const hasHeaderSelection = navJS.includes('.header') || 
                              navJS.includes('querySelector') ||
                              navJS.includes('header');
    if (hasHeaderSelection) {
        console.log('✅ Header element selection exists');
        passedTests++;
    } else {
        console.log('⚠️  Header element selection may be missing');
    }
}

// Check navigation.css for scroll styles
console.log('\n🎨 Checking Scroll CSS Styles...\n');

if (!fs.existsSync('assets/css/navigation.css')) {
    console.log('❌ navigation.css not found');
    issues.push('  - Missing assets/css/navigation.css');
    failedTests++;
    totalTests++;
} else {
    const navCSS = fs.readFileSync('assets/css/navigation.css', 'utf8');
    
    // Check for .scrolled class styles
    totalTests++;
    const hasScrolledStyles = navCSS.includes('.scrolled') || 
                             navCSS.includes('.header.scrolled');
    if (hasScrolledStyles) {
        console.log('✅ .scrolled class styles exist');
        passedTests++;
    } else {
        console.log('❌ Missing .scrolled class styles');
        issues.push('  - Missing .scrolled styles in navigation.css');
        failedTests++;
    }
    
    // Check for transitions
    totalTests++;
    const hasTransitions = navCSS.includes('transition');
    if (hasTransitions) {
        console.log('✅ CSS transitions exist for smooth effects');
        passedTests++;
    } else {
        console.log('⚠️  May be missing smooth transitions');
    }
    
    // Check for visual changes in scrolled state
    totalTests++;
    const scrolledSection = navCSS.match(/\.scrolled[^{]*\{[^}]+\}/g);
    if (scrolledSection) {
        const hasVisualChanges = scrolledSection.some(section => 
            section.includes('padding') || 
            section.includes('shadow') || 
            section.includes('background') ||
            section.includes('height')
        );
        
        if (hasVisualChanges) {
            console.log('✅ Scrolled state has visual changes');
            passedTests++;
        } else {
            console.log('⚠️  Scrolled state may not have visual changes');
        }
    } else {
        console.log('⚠️  Could not parse scrolled styles');
    }
    
    // Check for header base styles
    totalTests++;
    const hasHeaderStyles = navCSS.includes('.header {') || navCSS.includes('.header{');
    if (hasHeaderStyles) {
        console.log('✅ Header base styles exist');
        passedTests++;
    } else {
        console.log('❌ Missing .header base styles');
        issues.push('  - Missing .header styles in navigation.css');
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
console.log('Please manually test the following:');
console.log('\n1. Open any page with navigation in a browser');
console.log('2. Scroll down the page');
console.log('3. Verify the header gets the "scrolled" class');
console.log('4. Check for visual changes:');
console.log('   - Reduced padding');
console.log('   - Box shadow appears');
console.log('   - Background opacity changes');
console.log('   - Smooth transition animation');
console.log('5. Scroll back to top');
console.log('6. Verify the "scrolled" class is removed');
console.log('7. Test on multiple pages to ensure consistency');
console.log('\nYou can use test-scroll-effects.html for interactive testing.');

console.log('\n' + '='.repeat(60));

if (failedTests === 0) {
    console.log('\n✅ All automated tests passed!');
    console.log('Scroll effects are properly configured.');
    console.log('Please complete manual testing as described above.');
    process.exit(0);
} else {
    console.log('\n❌ Some tests failed. Please review the issues above.');
    process.exit(1);
}
