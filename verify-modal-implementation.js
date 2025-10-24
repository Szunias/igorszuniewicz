/**
 * Verification script for Track Info Modal implementation
 * This script checks that all required functionality is present
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Track Info Modal Implementation...\n');

// Read music.html
const musicHtmlPath = path.join(__dirname, 'music.html');
const musicHtml = fs.readFileSync(musicHtmlPath, 'utf8');

// Read translations.js
const translationsJsPath = path.join(__dirname, 'assets', 'js', 'translations.js');
const translationsJs = fs.readFileSync(translationsJsPath, 'utf8');

let allChecksPassed = true;

// Check 1: TrackInfoModal object exists
console.log('✓ Check 1: TrackInfoModal object definition');
if (musicHtml.includes('const TrackInfoModal = {')) {
  console.log('  ✅ TrackInfoModal object found\n');
} else {
  console.log('  ❌ TrackInfoModal object NOT found\n');
  allChecksPassed = false;
}

// Check 2: init() method exists
console.log('✓ Check 2: init() method');
if (musicHtml.includes('init()') && musicHtml.includes('this.modal = document.getElementById')) {
  console.log('  ✅ init() method implemented\n');
} else {
  console.log('  ❌ init() method NOT properly implemented\n');
  allChecksPassed = false;
}

// Check 3: open() method exists
console.log('✓ Check 3: open() method');
if (musicHtml.includes('open(trackIndex)') && musicHtml.includes('this.populateModalContent')) {
  console.log('  ✅ open() method implemented\n');
} else {
  console.log('  ❌ open() method NOT properly implemented\n');
  allChecksPassed = false;
}

// Check 4: close() method exists
console.log('✓ Check 4: close() method');
if (musicHtml.includes('close()') && musicHtml.includes('this.modal.classList.remove')) {
  console.log('  ✅ close() method implemented\n');
} else {
  console.log('  ❌ close() method NOT properly implemented\n');
  allChecksPassed = false;
}

// Check 5: Event listeners for close button
console.log('✓ Check 5: Close button event listener');
if (musicHtml.includes('this.closeBtn.addEventListener') && musicHtml.includes('this.close()')) {
  console.log('  ✅ Close button event listener found\n');
} else {
  console.log('  ❌ Close button event listener NOT found\n');
  allChecksPassed = false;
}

// Check 6: Event listeners for backdrop click
console.log('✓ Check 6: Backdrop click event listener');
if (musicHtml.includes('this.backdrop.addEventListener') && musicHtml.includes('this.close()')) {
  console.log('  ✅ Backdrop click event listener found\n');
} else {
  console.log('  ❌ Backdrop click event listener NOT found\n');
  allChecksPassed = false;
}

// Check 7: Escape key handler
console.log('✓ Check 7: Escape key handler');
if (musicHtml.includes("e.key === 'Escape'") && musicHtml.includes('this.modal.classList.contains')) {
  console.log('  ✅ Escape key handler found\n');
} else {
  console.log('  ❌ Escape key handler NOT found\n');
  allChecksPassed = false;
}

// Check 8: Focus trap implementation
console.log('✓ Check 8: Focus trap implementation');
if (musicHtml.includes('setupFocusTrap()') && musicHtml.includes('handleTabKey')) {
  console.log('  ✅ Focus trap implemented\n');
} else {
  console.log('  ❌ Focus trap NOT implemented\n');
  allChecksPassed = false;
}

// Check 9: populateModalContent method
console.log('✓ Check 9: populateModalContent() method');
if (musicHtml.includes('populateModalContent(trackIndex)')) {
  console.log('  ✅ populateModalContent() method found\n');
} else {
  console.log('  ❌ populateModalContent() method NOT found\n');
  allChecksPassed = false;
}

// Check 10: Missing data fallbacks
console.log('✓ Check 10: Missing data fallbacks');
const hasFallbacks = musicHtml.includes('|| \'—\'') || 
                     musicHtml.includes('|| \'Unknown Track\'') ||
                     musicHtml.includes('track_info_no_description');
if (hasFallbacks) {
  console.log('  ✅ Fallback handling found\n');
} else {
  console.log('  ❌ Fallback handling NOT found\n');
  allChecksPassed = false;
}

// Check 11: updateLanguage() method
console.log('✓ Check 11: updateLanguage() method');
if (musicHtml.includes('updateLanguage()') && musicHtml.includes('this.currentTrackIndex')) {
  console.log('  ✅ updateLanguage() method implemented\n');
} else {
  console.log('  ❌ updateLanguage() method NOT properly implemented\n');
  allChecksPassed = false;
}

// Check 12: Modal exposed to window
console.log('✓ Check 12: Modal exposed to window object');
if (musicHtml.includes('window.TrackInfoModal = TrackInfoModal')) {
  console.log('  ✅ Modal exposed to window\n');
} else {
  console.log('  ❌ Modal NOT exposed to window\n');
  allChecksPassed = false;
}

// Check 13: Translation system integration
console.log('✓ Check 13: Translation system integration');
if (translationsJs.includes('window.TrackInfoModal') && translationsJs.includes('updateLanguage')) {
  console.log('  ✅ Translation system calls modal.updateLanguage()\n');
} else {
  console.log('  ❌ Translation system does NOT call modal.updateLanguage()\n');
  allChecksPassed = false;
}

// Check 14: applyTranslations helper function
console.log('✓ Check 14: applyTranslations helper function');
if (translationsJs.includes('window.applyTranslations')) {
  console.log('  ✅ applyTranslations exposed to window\n');
} else {
  console.log('  ❌ applyTranslations NOT exposed to window\n');
  allChecksPassed = false;
}

// Check 15: Modal HTML structure exists
console.log('✓ Check 15: Modal HTML structure');
if (musicHtml.includes('track-info-modal') && 
    musicHtml.includes('track-info-backdrop') &&
    musicHtml.includes('track-info-content')) {
  console.log('  ✅ Modal HTML structure found\n');
} else {
  console.log('  ❌ Modal HTML structure NOT found\n');
  allChecksPassed = false;
}

// Final summary
console.log('═══════════════════════════════════════════════════════');
if (allChecksPassed) {
  console.log('✅ ALL CHECKS PASSED! Modal implementation is complete.');
} else {
  console.log('❌ SOME CHECKS FAILED. Please review the implementation.');
}
console.log('═══════════════════════════════════════════════════════\n');

process.exit(allChecksPassed ? 0 : 1);
