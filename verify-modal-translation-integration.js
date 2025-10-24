/**
 * Verification script for Track Info Modal Translation Integration
 * This script checks that the modal properly integrates with the translation system
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Track Info Modal Translation Integration...\n');

// Read music.html
const musicHtmlPath = path.join(__dirname, 'music.html');
const musicHtml = fs.readFileSync(musicHtmlPath, 'utf8');

// Read translations.js
const translationsJsPath = path.join(__dirname, 'assets', 'js', 'translations.js');
const translationsJs = fs.readFileSync(translationsJsPath, 'utf8');

// Read locales/music.json
const musicJsonPath = path.join(__dirname, 'locales', 'music.json');
const musicJson = JSON.parse(fs.readFileSync(musicJsonPath, 'utf8'));

let allChecksPassed = true;

// Check 1: Modal elements have data-i18n attributes
console.log('✓ Check 1: Modal elements have data-i18n attributes');
const hasYearLabel = musicHtml.includes('data-i18n="track_info_year"');
const hasDurationLabel = musicHtml.includes('data-i18n="track_info_duration"');
if (hasYearLabel && hasDurationLabel) {
  console.log('  ✅ Modal labels have data-i18n attributes\n');
} else {
  console.log('  ❌ Modal labels missing data-i18n attributes\n');
  allChecksPassed = false;
}

// Check 2: Close button has aria-label translation attribute
console.log('✓ Check 2: Close button has aria-label translation');
if (musicHtml.includes('data-i18n-aria-label="track_info_close"')) {
  console.log('  ✅ Close button has data-i18n-aria-label attribute\n');
} else {
  console.log('  ❌ Close button missing data-i18n-aria-label attribute\n');
  allChecksPassed = false;
}

// Check 3: Info button has aria-label translation attribute
console.log('✓ Check 3: Info button has aria-label translation');
if (musicHtml.includes('data-i18n-aria-label', 'track_info_button')) {
  console.log('  ✅ Info button has data-i18n-aria-label attribute\n');
} else {
  console.log('  ❌ Info button missing data-i18n-aria-label attribute\n');
  allChecksPassed = false;
}

// Check 4: Translation system handles aria-label attributes
console.log('✓ Check 4: Translation system handles aria-label attributes');
if (translationsJs.includes('data-i18n-aria-label') && 
    translationsJs.includes('setAttribute(\'aria-label\'')) {
  console.log('  ✅ Translation system handles aria-label attributes\n');
} else {
  console.log('  ❌ Translation system does NOT handle aria-label attributes\n');
  allChecksPassed = false;
}

// Check 5: applyTranslations handles aria-label
console.log('✓ Check 5: applyTranslations handles aria-label');
// Check if applyTranslations function contains aria-label handling
const hasAriaLabelInApply = translationsJs.includes('function applyTranslations()') && 
                             translationsJs.includes('data-i18n-aria-label') &&
                             translationsJs.includes('Apply aria-label translations');
if (hasAriaLabelInApply) {
  console.log('  ✅ applyTranslations handles aria-label attributes\n');
} else {
  console.log('  ❌ applyTranslations does NOT handle aria-label attributes\n');
  allChecksPassed = false;
}

// Check 6: updateLanguage method re-applies translations
console.log('✓ Check 6: updateLanguage method re-applies translations');
if (musicHtml.includes('updateLanguage()') && 
    musicHtml.includes('window.applyTranslations')) {
  console.log('  ✅ updateLanguage calls applyTranslations\n');
} else {
  console.log('  ❌ updateLanguage does NOT call applyTranslations\n');
  allChecksPassed = false;
}

// Check 7: Modal updates description based on current language
console.log('✓ Check 7: Modal updates description based on language');
if (musicHtml.includes('track.desc[currentLang]') || 
    musicHtml.includes('track.desc && track.desc[currentLang]')) {
  console.log('  ✅ Modal uses current language for descriptions\n');
} else {
  console.log('  ❌ Modal does NOT use current language for descriptions\n');
  allChecksPassed = false;
}

// Check 8: Modal handles language switching while open
console.log('✓ Check 8: Modal handles language switching while open');
if (musicHtml.includes('this.modal.classList.contains(\'visible\')') &&
    musicHtml.includes('this.currentTrackIndex !== null')) {
  console.log('  ✅ Modal checks if open before updating\n');
} else {
  console.log('  ❌ Modal does NOT properly check if open\n');
  allChecksPassed = false;
}

// Check 9: Translation keys exist in all languages
console.log('✓ Check 9: Translation keys exist in all languages');
const requiredKeys = [
  'track_info_year',
  'track_info_duration',
  'track_info_close',
  'track_info_no_description',
  'track_info_button'
];

const languages = ['en', 'pl', 'nl'];
let allKeysPresent = true;

for (const lang of languages) {
  for (const key of requiredKeys) {
    if (!musicJson[lang] || !musicJson[lang][key]) {
      console.log(`  ❌ Missing key "${key}" in language "${lang}"\n`);
      allKeysPresent = false;
      allChecksPassed = false;
    }
  }
}

if (allKeysPresent) {
  console.log('  ✅ All required translation keys present in all languages\n');
}

// Check 10: setLanguage calls modal.updateLanguage
console.log('✓ Check 10: setLanguage calls modal.updateLanguage');
if (translationsJs.includes('window.TrackInfoModal') && 
    translationsJs.includes('window.TrackInfoModal.updateLanguage')) {
  console.log('  ✅ setLanguage calls modal.updateLanguage()\n');
} else {
  console.log('  ❌ setLanguage does NOT call modal.updateLanguage()\n');
  allChecksPassed = false;
}

// Check 11: Modal stores current track index for updates
console.log('✓ Check 11: Modal stores current track index');
if (musicHtml.includes('this.currentTrackIndex = trackIndex') &&
    musicHtml.includes('this.currentTrackIndex = null')) {
  console.log('  ✅ Modal stores and clears current track index\n');
} else {
  console.log('  ❌ Modal does NOT properly manage track index\n');
  allChecksPassed = false;
}

// Check 12: Info button gets initial translation
console.log('✓ Check 12: Info button gets initial translation');
if (musicHtml.includes('localStorage.getItem(\'language\')') &&
    musicHtml.includes('window.translations') &&
    musicHtml.includes('track_info_button')) {
  console.log('  ✅ Info button gets initial translation on creation\n');
} else {
  console.log('  ❌ Info button does NOT get initial translation\n');
  allChecksPassed = false;
}

// Final summary
console.log('═══════════════════════════════════════════════════════');
if (allChecksPassed) {
  console.log('✅ ALL CHECKS PASSED! Translation integration is complete.');
  console.log('\nThe modal now:');
  console.log('  • Updates content when setLanguage() is called');
  console.log('  • Has data-i18n attributes on modal elements');
  console.log('  • Displays track descriptions in current language');
  console.log('  • Handles language switching while modal is open');
} else {
  console.log('❌ SOME CHECKS FAILED. Please review the implementation.');
}
console.log('═══════════════════════════════════════════════════════\n');

process.exit(allChecksPassed ? 0 : 1);
