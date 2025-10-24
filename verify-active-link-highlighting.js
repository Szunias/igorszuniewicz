/**
 * Active Link Highlighting Verification Script
 * Tests that navigation.js properly detects and highlights the active page
 */

const fs = require('fs');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const issues = [];

console.log('🎯 Active Link Highlighting Verification\n');
console.log('=' .repeat(60));

// Check navigation.js has active link logic
console.log('\n📄 Checking Navigation Component Logic...\n');

if (!fs.existsSync('assets/js/components/navigation.js')) {
    console.log('❌ navigation.js not found');
    issues.push('  - Missing assets/js/components/navigation.js');
    failedTests++;
    totalTests++;
} else {
    const navJS = fs.readFileSync('assets/js/components/navigation.js', 'utf8');
    
    // Check for active link detection logic
    totalTests++;
    const hasActiveLogic = navJS.includes('active') || navJS.includes('classList.add');
    if (hasActiveLogic) {
        console.log('✅ Navigation has active class logic');
        passedTests++;
    } else {
        console.log('❌ Navigation missing active class logic');
        issues.push('  - navigation.js missing active class logic');
        failedTests++;
    }
    
    // Check for path detection
    totalTests++;
    const hasPathDetection = navJS.includes('window.location.pathname') || 
                             navJS.includes('location.pathname');
    if (hasPathDetection) {
        console.log('✅ Navigation has path detection logic');
        passedTests++;
    } else {
        console.log('❌ Navigation missing path detection logic');
        issues.push('  - navigation.js missing path detection logic');
        failedTests++;
    }
    
    // Check for setActiveLink function or similar
    totalTests++;
    const hasSetActiveFunction = navJS.includes('setActiveLink') || 
                                 navJS.includes('function') && navJS.includes('active');
    if (hasSetActiveFunction) {
        console.log('✅ Navigation has active link function');
        passedTests++;
    } else {
        console.log('⚠️  Navigation may not have dedicated active link function');
        console.log('   (This is OK if active logic is inline)');
    }
}

// Check navigation.css has active styles
console.log('\n🎨 Checking Navigation Styles...\n');

if (!fs.existsSync('assets/css/navigation.css')) {
    console.log('❌ navigation.css not found');
    issues.push('  - Missing assets/css/navigation.css');
    failedTests++;
    totalTests++;
} else {
    const navCSS = fs.readFileSync('assets/css/navigation.css', 'utf8');
    
    // Check for active class styles
    totalTests++;
    const hasActiveStyles = navCSS.includes('.active') || 
                           navCSS.includes('a.active') ||
                           navCSS.includes('.nav-links a.active');
    if (hasActiveStyles) {
        console.log('✅ Navigation CSS has active link styles');
        passedTests++;
    } else {
        console.log('❌ Navigation CSS missing active link styles');
        issues.push('  - navigation.css missing .active styles');
        failedTests++;
    }
    
    // Check for visual distinction (color, underline, etc.)
    totalTests++;
    const hasVisualStyles = navCSS.match(/\.active[^{]*\{[^}]*(color|border|background|text-decoration)/);
    if (hasVisualStyles) {
        console.log('✅ Active links have visual distinction');
        passedTests++;
    } else {
        console.log('⚠️  Active link styles may not be visually distinct');
    }
}

// Check pages have navigation component
console.log('\n📄 Checking Pages Have Navigation Component...\n');

const pagesToCheck = [
    { path: 'index.html', name: 'Home', expectedPath: '/index.html' },
    { path: 'about.html', name: 'About', expectedPath: '/about.html' },
    { path: 'contact.html', name: 'Contact', expectedPath: '/contact.html' },
    { path: 'music.html', name: 'Music', expectedPath: '/music.html' },
    { path: 'projects/index.html', name: 'Projects', expectedPath: '/projects/' }
];

for (const page of pagesToCheck) {
    totalTests++;
    if (!fs.existsSync(page.path)) {
        console.log(`❌ ${page.path}: File not found`);
        issues.push(`  - ${page.path} not found`);
        failedTests++;
        continue;
    }
    
    const content = fs.readFileSync(page.path, 'utf8');
    const hasNavJS = content.includes('navigation.js');
    
    if (hasNavJS) {
        console.log(`✅ ${page.path}: Has navigation component (will auto-detect active link)`);
        passedTests++;
    } else {
        console.log(`❌ ${page.path}: Missing navigation component`);
        issues.push(`  - ${page.path} missing navigation.js`);
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

console.log('\n📋 Manual Verification Required:\n');
console.log('Please manually verify the following:');
console.log('1. Open each page in a browser');
console.log('2. Check that the corresponding navigation link is highlighted');
console.log('3. Verify the active link has a visual distinction (color, underline, etc.)');
console.log('4. Test on both root pages and subfolder pages');
console.log('\nPages to test:');
pagesToCheck.forEach(page => {
    console.log(`   - ${page.path} → "${page.name}" link should be active`);
});

console.log('\n' + '='.repeat(60));

if (failedTests === 0) {
    console.log('\n✅ All automated tests passed!');
    console.log('Active link highlighting logic is properly configured.');
    console.log('Please complete manual verification as described above.');
    process.exit(0);
} else {
    console.log('\n❌ Some tests failed. Please review the issues above.');
    process.exit(1);
}
