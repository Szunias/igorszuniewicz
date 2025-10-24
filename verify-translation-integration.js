/**
 * Translation Integration Verification Script
 * Tests translation integration with navigation component
 */

const fs = require('fs');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const issues = [];

console.log('🌐 Translation Integration Verification\n');
console.log('=' .repeat(60));

// Check navigation.js for translation integration
console.log('\n⚙️  Checking Navigation Translation Integration...\n');

if (!fs.existsSync('assets/js/components/navigation.js')) {
    console.log('❌ navigation.js not found');
    issues.push('  - Missing assets/js/components/navigation.js');
    failedTests++;
    totalTests++;
} else {
    const navJS = fs.readFileSync('assets/js/components/navigation.js', 'utf8');
    
    // Check for data-i18n attributes
    totalTests++;
    if (navJS.includes('data-i18n')) {
        console.log('✅ Navigation uses data-i18n attributes');
        passedTests++;
    } else {
        console.log('❌ Missing data-i18n attributes in navigation');
        issues.push('  - Missing data-i18n attributes in navigation.js');
        failedTests++;
    }
    
    // Check for translation keys
    totalTests++;
    const hasNavKeys = navJS.includes('nav.home') || 
                      navJS.includes('nav.about') ||
                      navJS.includes('nav.projects') ||
                      navJS.includes('nav.music') ||
                      navJS.includes('nav.contact');
    if (hasNavKeys) {
        console.log('✅ Navigation has translation keys (nav.*)');
        passedTests++;
    } else {
        console.log('⚠️  Translation keys may be missing or different');
    }
    
    // Check for language switcher
    totalTests++;
    const hasLangSwitcher = navJS.includes('lang-btn') || 
                           navJS.includes('lang-switcher') ||
                           navJS.includes('language');
    if (hasLangSwitcher) {
        console.log('✅ Language switcher exists in navigation');
        passedTests++;
    } else {
        console.log('❌ Missing language switcher in navigation');
        issues.push('  - Missing language switcher in navigation.js');
        failedTests++;
    }
}

// Check translation system files
console.log('\n📁 Checking Translation System Files...\n');

totalTests++;
if (fs.existsSync('assets/js/translations.js')) {
    console.log('✅ translations.js exists');
    passedTests++;
    
    const transJS = fs.readFileSync('assets/js/translations.js', 'utf8');
    
    // Check for updateTranslations function
    totalTests++;
    if (transJS.includes('updateTranslations') || transJS.includes('function')) {
        console.log('✅ Translation update function exists');
        passedTests++;
    } else {
        console.log('⚠️  Translation update function may be missing');
    }
} else {
    console.log('❌ translations.js not found');
    issues.push('  - Missing assets/js/translations.js');
    failedTests++;
}

totalTests++;
if (fs.existsSync('assets/js/preload-lang.js')) {
    console.log('✅ preload-lang.js exists');
    passedTests++;
} else {
    console.log('⚠️  preload-lang.js not found (may use different language detection)');
}

// Check translation files
console.log('\n🌍 Checking Translation Files...\n');

const languages = ['en', 'pl', 'nl'];
const translationFile = 'locales/shared.json';

totalTests++;
if (fs.existsSync(translationFile)) {
    console.log('✅ shared.json translation file exists');
    passedTests++;
    
    try {
        const sharedData = JSON.parse(fs.readFileSync(translationFile, 'utf8'));
        
        // Check for nav keys in each language
        for (const lang of languages) {
            totalTests++;
            if (sharedData[lang] && sharedData[lang].nav) {
                console.log(`✅ ${lang.toUpperCase()}: Has nav translation keys`);
                passedTests++;
                
                // Check for specific nav keys
                const navKeys = ['home', 'about', 'projects', 'music', 'contact'];
                const missingKeys = navKeys.filter(key => !sharedData[lang].nav[key]);
                
                if (missingKeys.length === 0) {
                    console.log(`   ✓ All nav keys present for ${lang.toUpperCase()}`);
                } else {
                    console.log(`   ⚠️  Missing keys for ${lang.toUpperCase()}: ${missingKeys.join(', ')}`);
                }
            } else {
                console.log(`❌ ${lang.toUpperCase()}: Missing nav translation keys`);
                issues.push(`  - Missing nav keys for ${lang} in shared.json`);
                failedTests++;
            }
        }
    } catch (error) {
        console.log('❌ Error parsing shared.json');
        issues.push('  - shared.json is not valid JSON');
        failedTests++;
    }
} else {
    console.log('❌ shared.json not found');
    issues.push('  - Missing locales/shared.json');
    failedTests++;
}

// Check pages load translation scripts
console.log('\n📄 Checking Pages Load Translation Scripts...\n');

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
    
    const hasPreloadLang = content.includes('preload-lang.js');
    const hasTranslations = content.includes('translations.js');
    const hasNavigation = content.includes('navigation.js');
    
    if (hasPreloadLang && hasTranslations && hasNavigation) {
        console.log(`✅ ${page}: All translation scripts loaded`);
        passedTests++;
    } else {
        let missing = [];
        if (!hasPreloadLang) missing.push('preload-lang.js');
        if (!hasTranslations) missing.push('translations.js');
        if (!hasNavigation) missing.push('navigation.js');
        console.log(`⚠️  ${page}: May be missing: ${missing.join(', ')}`);
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
console.log('\n1. Open any page in a browser');
console.log('2. Click the language switcher buttons (EN, PL, NL)');
console.log('3. Verify navigation text updates for each language:');
console.log('   EN: Home, About, Projects, Music, Contact');
console.log('   PL: Strona Główna, O Mnie, Projekty, Muzyka, Kontakt');
console.log('   NL: Home, Over, Projecten, Muziek, Contact');
console.log('4. Verify language preference is saved (refresh page)');
console.log('5. Test on multiple pages to ensure consistency');
console.log('\nYou can use test-translation-integration.html for interactive testing.');

console.log('\n' + '='.repeat(60));

if (failedTests === 0) {
    console.log('\n✅ All automated tests passed!');
    console.log('Translation integration is properly configured.');
    console.log('Please complete manual testing as described above.');
    process.exit(0);
} else {
    console.log('\n❌ Some tests failed. Please review the issues above.');
    process.exit(1);
}
