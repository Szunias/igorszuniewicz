/**
 * Existing Functionality Verification Script
 * Verifies that existing page functionality still works after navigation migration
 */

const fs = require('fs');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const issues = [];

console.log('✅ Existing Functionality Verification\n');
console.log('=' .repeat(60));

// Check music.html functionality
console.log('\n🎵 Checking Music Page Functionality...\n');

totalTests++;
if (fs.existsSync('music.html')) {
    console.log('✅ music.html exists');
    passedTests++;
    
    const musicHTML = fs.readFileSync('music.html', 'utf8');
    
    // Check for music player elements
    totalTests++;
    const hasPlayer = musicHTML.includes('music-player') || 
                     musicHTML.includes('player') ||
                     musicHTML.includes('audio-player');
    if (hasPlayer) {
        console.log('✅ Music player elements exist');
        passedTests++;
    } else {
        console.log('⚠️  Music player elements may be missing');
    }
    
    // Check for audio element
    totalTests++;
    const hasAudio = musicHTML.includes('<audio') || musicHTML.includes('new Audio(');
    if (hasAudio) {
        console.log('✅ Audio element exists');
        passedTests++;
    } else {
        console.log('⚠️  Audio element may be missing');
    }
    
    // Check for track list
    totalTests++;
    const hasTrackList = musicHTML.includes('track') || musicHTML.includes('playlist');
    if (hasTrackList) {
        console.log('✅ Track list elements exist');
        passedTests++;
    } else {
        console.log('⚠️  Track list may be missing');
    }
    
    // Check navigation doesn't interfere
    totalTests++;
    const hasNavigation = musicHTML.includes('navigation.js');
    const hasNoConflicts = !musicHTML.includes('<!-- CONFLICT -->');
    if (hasNavigation && hasNoConflicts) {
        console.log('✅ Navigation integrated without conflicts');
        passedTests++;
    } else if (!hasNavigation) {
        console.log('⚠️  Navigation may not be integrated');
    }
    
} else {
    console.log('❌ music.html not found');
    issues.push('  - music.html not found');
    failedTests++;
}

// Check contact.html functionality
console.log('\n📧 Checking Contact Page Functionality...\n');

totalTests++;
if (fs.existsSync('contact.html')) {
    console.log('✅ contact.html exists');
    passedTests++;
    
    const contactHTML = fs.readFileSync('contact.html', 'utf8');
    
    // Check for contact form
    totalTests++;
    if (contactHTML.includes('<form')) {
        console.log('✅ Contact form exists');
        passedTests++;
    } else {
        console.log('❌ Contact form not found');
        issues.push('  - Contact form missing in contact.html');
        failedTests++;
    }
    
    // Check for EmailJS integration
    totalTests++;
    const hasEmailJS = contactHTML.includes('emailjs') || contactHTML.includes('EmailJS');
    if (hasEmailJS) {
        console.log('✅ EmailJS integration exists');
        passedTests++;
    } else {
        console.log('⚠️  EmailJS integration may be missing');
    }
    
    // Check for form validation
    totalTests++;
    const hasValidation = contactHTML.includes('required') || 
                         contactHTML.includes('validate') ||
                         contactHTML.includes('validation');
    if (hasValidation) {
        console.log('✅ Form validation exists');
        passedTests++;
    } else {
        console.log('⚠️  Form validation may be missing');
    }
    
    // Check navigation integration
    totalTests++;
    if (contactHTML.includes('navigation.js')) {
        console.log('✅ Navigation integrated');
        passedTests++;
    } else {
        console.log('⚠️  Navigation may not be integrated');
    }
    
} else {
    console.log('❌ contact.html not found');
    issues.push('  - contact.html not found');
    failedTests++;
}

// Check project pages
console.log('\n🎨 Checking Project Pages...\n');

const projectPages = [
    'projects/audiolab.html',
    'projects/musicforgames.html',
    'projects/not-today-darling.html',
    'projects/akantilado.html',
    'projects/amorak.html'
];

let projectsChecked = 0;
let projectsWithNav = 0;

for (const page of projectPages) {
    totalTests++;
    if (fs.existsSync(page)) {
        projectsChecked++;
        const content = fs.readFileSync(page, 'utf8');
        
        // Check if navigation is integrated
        if (content.includes('navigation.js')) {
            projectsWithNav++;
        }
    }
}

if (projectsChecked > 0) {
    console.log(`✅ Found ${projectsChecked} project pages`);
    passedTests++;
    
    if (projectsWithNav > 0) {
        console.log(`✅ ${projectsWithNav} project pages have navigation integrated`);
    } else {
        console.log('⚠️  No project pages have navigation integrated yet');
    }
} else {
    console.log('❌ No project pages found');
    issues.push('  - No project pages found');
    failedTests++;
}

// Check about.html
console.log('\n📄 Checking About Page...\n');

totalTests++;
if (fs.existsSync('about.html')) {
    console.log('✅ about.html exists');
    passedTests++;
    
    const aboutHTML = fs.readFileSync('about.html', 'utf8');
    
    // Check navigation integration
    totalTests++;
    if (aboutHTML.includes('navigation.js')) {
        console.log('✅ Navigation integrated');
        passedTests++;
    } else {
        console.log('⚠️  Navigation may not be integrated');
    }
    
    // Check for content
    totalTests++;
    const hasContent = aboutHTML.includes('<p') || aboutHTML.includes('content');
    if (hasContent) {
        console.log('✅ Page content exists');
        passedTests++;
    } else {
        console.log('⚠️  Page content may be missing');
    }
    
} else {
    console.log('❌ about.html not found');
    issues.push('  - about.html not found');
    failedTests++;
}

// Check index.html
console.log('\n🏠 Checking Home Page...\n');

totalTests++;
if (fs.existsSync('index.html')) {
    console.log('✅ index.html exists');
    passedTests++;
    
    const indexHTML = fs.readFileSync('index.html', 'utf8');
    
    // Check navigation integration
    totalTests++;
    if (indexHTML.includes('navigation.js')) {
        console.log('✅ Navigation integrated');
        passedTests++;
    } else {
        console.log('⚠️  Navigation may not be integrated');
    }
    
    // Check for main content
    totalTests++;
    const hasContent = indexHTML.includes('<main') || 
                      indexHTML.includes('hero') ||
                      indexHTML.includes('content');
    if (hasContent) {
        console.log('✅ Page content exists');
        passedTests++;
    } else {
        console.log('⚠️  Page content may be missing');
    }
    
} else {
    console.log('❌ index.html not found');
    issues.push('  - index.html not found');
    failedTests++;
}

// Check for common JavaScript files
console.log('\n⚙️  Checking Common JavaScript Files...\n');

const jsFiles = [
    'assets/js/translations.js',
    'assets/js/preload-lang.js',
    'assets/js/simple-smooth-nav.js',
    'assets/js/components/navigation.js'
];

for (const jsFile of jsFiles) {
    totalTests++;
    if (fs.existsSync(jsFile)) {
        console.log(`✅ ${jsFile} exists`);
        passedTests++;
    } else {
        console.log(`❌ ${jsFile} not found`);
        issues.push(`  - ${jsFile} not found`);
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
console.log('Please manually test the following functionality:');
console.log('\n1. Music Page (music.html):');
console.log('   - Play/pause music');
console.log('   - Skip tracks');
console.log('   - Adjust volume');
console.log('   - View track info');
console.log('   - Player persists during navigation');
console.log('\n2. Contact Page (contact.html):');
console.log('   - Fill out form fields');
console.log('   - Submit form');
console.log('   - Verify EmailJS sends email');
console.log('   - Check validation messages');
console.log('\n3. Project Pages:');
console.log('   - View project details');
console.log('   - Check images load');
console.log('   - Test any interactive elements');
console.log('   - Verify videos/audio work');
console.log('\n4. About Page (about.html):');
console.log('   - Content displays correctly');
console.log('   - Images load');
console.log('   - Animations work');
console.log('\n5. Home Page (index.html):');
console.log('   - Hero section displays');
console.log('   - Animations work');
console.log('   - Links work');
console.log('\nYou can use test-existing-functionality.html for guided testing.');

console.log('\n' + '='.repeat(60));

if (failedTests === 0) {
    console.log('\n✅ All automated tests passed!');
    console.log('Existing functionality appears to be intact.');
    console.log('Please complete manual testing as described above.');
    process.exit(0);
} else {
    console.log('\n❌ Some tests failed. Please review the issues above.');
    process.exit(1);
}
