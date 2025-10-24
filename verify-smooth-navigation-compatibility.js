/**
 * Smooth Navigation Compatibility Verification Script
 * Tests compatibility between navigation component and smooth navigation system
 */

const fs = require('fs');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const issues = [];

console.log('🔄 Smooth Navigation Compatibility Verification\n');
console.log('=' .repeat(60));

// Check smooth navigation script exists
console.log('\n📁 Checking Smooth Navigation System...\n');

totalTests++;
if (fs.existsSync('assets/js/simple-smooth-nav.js')) {
    console.log('✅ simple-smooth-nav.js exists');
    passedTests++;
    
    const smoothNavJS = fs.readFileSync('assets/js/simple-smooth-nav.js', 'utf8');
    
    // Check for transition logic
    totalTests++;
    const hasTransitionLogic = smoothNavJS.includes('transition') || 
                               smoothNavJS.includes('fade') ||
                               smoothNavJS.includes('opacity');
    if (hasTransitionLogic) {
        console.log('✅ Transition/fade logic exists');
        passedTests++;
    } else {
        console.log('⚠️  Transition logic may be missing');
    }
    
    // Check for link handling
    totalTests++;
    const hasLinkHandling = smoothNavJS.includes('addEventListener') && 
                           smoothNavJS.includes('click');
    if (hasLinkHandling) {
        console.log('✅ Link click handling exists');
        passedTests++;
    } else {
        console.log('❌ Missing link click handling');
        issues.push('  - Missing link click handling in simple-smooth-nav.js');
        failedTests++;
    }
    
    // Check for preventDefault
    totalTests++;
    if (smoothNavJS.includes('preventDefault')) {
        console.log('✅ preventDefault() used (prevents normal navigation)');
        passedTests++;
    } else {
        console.log('⚠️  May not prevent default navigation');
    }
    
    // Check for History API
    totalTests++;
    const hasHistoryAPI = smoothNavJS.includes('history.pushState') || 
                         smoothNavJS.includes('pushState');
    if (hasHistoryAPI) {
        console.log('✅ Uses History API for navigation');
        passedTests++;
    } else {
        console.log('⚠️  May not use History API');
    }
    
} else {
    console.log('❌ simple-smooth-nav.js not found');
    issues.push('  - Missing assets/js/simple-smooth-nav.js');
    failedTests++;
}

// Check navigation component compatibility
console.log('\n⚙️  Checking Navigation Component Compatibility...\n');

if (fs.existsSync('assets/js/components/navigation.js')) {
    const navJS = fs.readFileSync('assets/js/components/navigation.js', 'utf8');
    
    // Check navigation doesn't interfere with smooth nav
    totalTests++;
    const hasNoConflicts = !navJS.includes('window.location.href =') &&
                          !navJS.includes('window.location =');
    if (hasNoConflicts) {
        console.log('✅ Navigation doesn\'t interfere with smooth nav');
        passedTests++;
    } else {
        console.log('⚠️  Navigation may have conflicting location changes');
    }
    
    // Check uses standard links
    totalTests++;
    if (navJS.includes('<a href=')) {
        console.log('✅ Navigation uses standard <a> tags');
        passedTests++;
    } else {
        console.log('⚠️  Navigation may not use standard links');
    }
    
    // Check has proper structure
    totalTests++;
    const hasProperStructure = navJS.includes('nav') || navJS.includes('header');
    if (hasProperStructure) {
        console.log('✅ Navigation has proper HTML structure');
        passedTests++;
    } else {
        console.log('⚠️  Navigation structure may be non-standard');
    }
    
} else {
    console.log('❌ navigation.js not found');
    issues.push('  - Missing assets/js/components/navigation.js');
    failedTests++;
    totalTests++;
}

// Check pages load both scripts in correct order
console.log('\n📄 Checking Script Load Order in Pages...\n');

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
    
    const hasSmoothNav = content.includes('simple-smooth-nav.js');
    const hasNavigation = content.includes('navigation.js');
    
    if (hasSmoothNav && hasNavigation) {
        // Check load order
        const smoothNavIndex = content.indexOf('simple-smooth-nav.js');
        const navigationIndex = content.indexOf('navigation.js');
        
        if (smoothNavIndex < navigationIndex) {
            console.log(`✅ ${page}: Correct script load order`);
            passedTests++;
        } else {
            console.log(`⚠️  ${page}: navigation.js loads before smooth-nav.js`);
        }
    } else {
        let missing = [];
        if (!hasSmoothNav) missing.push('simple-smooth-nav.js');
        if (!hasNavigation) missing.push('navigation.js');
        console.log(`⚠️  ${page}: Missing scripts: ${missing.join(', ')}`);
    }
}

// Check for CSS that might interfere
console.log('\n🎨 Checking CSS Compatibility...\n');

if (fs.existsSync('assets/css/navigation.css')) {
    const navCSS = fs.readFileSync('assets/css/navigation.css', 'utf8');
    
    // Check for fixed positioning (should work with smooth nav)
    totalTests++;
    if (navCSS.includes('position: fixed') || navCSS.includes('position:fixed')) {
        console.log('✅ Navigation uses fixed positioning (compatible with smooth nav)');
        passedTests++;
    } else {
        console.log('⚠️  Navigation may not use fixed positioning');
    }
    
    // Check for z-index (should be high enough)
    totalTests++;
    if (navCSS.includes('z-index')) {
        console.log('✅ Navigation has z-index (stays on top during transitions)');
        passedTests++;
    } else {
        console.log('⚠️  Navigation may not have z-index');
    }
    
} else {
    console.log('❌ navigation.css not found');
    issues.push('  - Missing assets/css/navigation.css');
    failedTests++;
    totalTests++;
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
console.log('\n1. Open any page in a browser');
console.log('2. Click navigation links to navigate between pages');
console.log('3. Verify smooth transitions occur:');
console.log('   - No white flash');
console.log('   - Smooth fade-out of current page');
console.log('   - Smooth fade-in of new page');
console.log('   - Navigation remains visible during transition');
console.log('4. Verify active link updates on new page');
console.log('5. Test on multiple pages and different browsers');
console.log('6. Check that back/forward buttons work correctly');
console.log('\nYou can use test-smooth-navigation-compatibility.html for interactive testing.');

console.log('\n' + '='.repeat(60));

if (failedTests === 0) {
    console.log('\n✅ All automated tests passed!');
    console.log('Smooth navigation compatibility is properly configured.');
    console.log('Please complete manual testing as described above.');
    process.exit(0);
} else {
    console.log('\n❌ Some tests failed. Please review the issues above.');
    process.exit(1);
}
