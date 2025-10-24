/**
 * Verification script for music.html navigation migration
 * Tests that navigation component works correctly and doesn't interfere with music player
 */

const fs = require('fs');
const path = require('path');

console.log('🎵 Verifying music.html navigation migration...\n');

let passed = 0;
let failed = 0;
let warnings = 0;

// Read music.html
const musicHtmlPath = path.join(__dirname, 'music.html');
let musicHtml = '';

try {
  musicHtml = fs.readFileSync(musicHtmlPath, 'utf8');
} catch (error) {
  console.error('❌ Failed to read music.html:', error.message);
  process.exit(1);
}

// Test 1: Navigation CSS is linked
console.log('Test 1: Navigation CSS is linked');
if (musicHtml.includes('assets/css/navigation.css')) {
  console.log('✅ PASS: navigation.css is linked\n');
  passed++;
} else {
  console.log('❌ FAIL: navigation.css is not linked\n');
  failed++;
}

// Test 2: Navigation JS is loaded
console.log('Test 2: Navigation JS is loaded');
if (musicHtml.includes('assets/js/components/navigation.js')) {
  console.log('✅ PASS: navigation.js is loaded\n');
  passed++;
} else {
  console.log('❌ FAIL: navigation.js is not loaded\n');
  failed++;
}

// Test 3: No inline header styles
console.log('Test 3: No inline .header styles');
const headerStyleMatch = musicHtml.match(/\.header\s*{[^}]*position:\s*fixed/);
if (!headerStyleMatch) {
  console.log('✅ PASS: No inline header styles found\n');
  passed++;
} else {
  console.log('❌ FAIL: Found inline header styles (should be removed)\n');
  failed++;
}

// Test 4: No inline nav styles
console.log('Test 4: No inline .nav styles');
const navStyleMatch = musicHtml.match(/\.nav\s*{[^}]*display:\s*flex/);
if (!navStyleMatch) {
  console.log('✅ PASS: No inline nav styles found\n');
  passed++;
} else {
  console.log('❌ FAIL: Found inline nav styles (should be removed)\n');
  failed++;
}

// Test 5: No inline nav-links styles
console.log('Test 5: No inline .nav-links styles');
const navLinksStyleMatch = musicHtml.match(/\.nav-links\s*{[^}]*display:\s*flex/);
if (!navLinksStyleMatch) {
  console.log('✅ PASS: No inline nav-links styles found\n');
  passed++;
} else {
  console.log('❌ FAIL: Found inline nav-links styles (should be removed)\n');
  failed++;
}

// Test 6: No inline lang-switcher styles
console.log('Test 6: No inline .lang-switcher styles');
const langStyleMatch = musicHtml.match(/\.lang-switcher\s*{[^}]*display:\s*flex/);
if (!langStyleMatch) {
  console.log('✅ PASS: No inline lang-switcher styles found\n');
  passed++;
} else {
  console.log('❌ FAIL: Found inline lang-switcher styles (should be removed)\n');
  failed++;
}

// Test 7: No hardcoded navigation HTML
console.log('Test 7: No hardcoded navigation HTML');
const hardcodedHeaderMatch = musicHtml.match(/<header[^>]*class="header"/i);
const hardcodedNavMatch = musicHtml.match(/<nav[^>]*class="nav"/i);
if (!hardcodedHeaderMatch && !hardcodedNavMatch) {
  console.log('✅ PASS: No hardcoded navigation HTML found\n');
  passed++;
} else {
  console.log('❌ FAIL: Found hardcoded navigation HTML (should be removed)\n');
  failed++;
}

// Test 8: Music player bar styles preserved
console.log('Test 8: Music player bar styles preserved');
if (musicHtml.includes('.player-bar')) {
  console.log('✅ PASS: Player bar styles are preserved\n');
  passed++;
} else {
  console.log('❌ FAIL: Player bar styles are missing\n');
  failed++;
}

// Test 9: Audio player element exists
console.log('Test 9: Audio player element exists');
if (musicHtml.includes('<audio id="audio-player"')) {
  console.log('✅ PASS: Audio player element exists\n');
  passed++;
} else {
  console.log('❌ FAIL: Audio player element is missing\n');
  failed++;
}

// Test 10: Player controls exist
console.log('Test 10: Player controls exist');
const hasPlayBtn = musicHtml.includes('player-play-btn');
const hasPrevBtn = musicHtml.includes('player-prev-btn');
const hasNextBtn = musicHtml.includes('player-next-btn');
if (hasPlayBtn && hasPrevBtn && hasNextBtn) {
  console.log('✅ PASS: All player controls exist\n');
  passed++;
} else {
  console.log('❌ FAIL: Some player controls are missing\n');
  console.log(`   Play button: ${hasPlayBtn ? '✓' : '✗'}`);
  console.log(`   Prev button: ${hasPrevBtn ? '✓' : '✗'}`);
  console.log(`   Next button: ${hasNextBtn ? '✓' : '✗'}\n`);
  failed++;
}

// Test 11: Playlist rendering code exists
console.log('Test 11: Playlist rendering code exists');
if (musicHtml.includes('renderPlaylist()')) {
  console.log('✅ PASS: Playlist rendering code exists\n');
  passed++;
} else {
  console.log('❌ FAIL: Playlist rendering code is missing\n');
  failed++;
}

// Test 12: Translation integration
console.log('Test 12: Translation script loaded');
if (musicHtml.includes('assets/js/translations.js')) {
  console.log('✅ PASS: Translation script is loaded\n');
  passed++;
} else {
  console.log('❌ FAIL: Translation script is not loaded\n');
  failed++;
}

// Test 13: Smooth navigation script loaded
console.log('Test 13: Smooth navigation script loaded');
if (musicHtml.includes('assets/js/simple-smooth-nav.js')) {
  console.log('✅ PASS: Smooth navigation script is loaded\n');
  passed++;
} else {
  console.log('⚠️  WARNING: Smooth navigation script is not loaded\n');
  warnings++;
}

// Test 14: No mobile menu styles in responsive section
console.log('Test 14: No mobile navigation styles in responsive section');
const responsiveSection = musicHtml.match(/@media\s*\([^)]*max-width:\s*768px[^)]*\)\s*{([^}]*{[^}]*})*[^}]*}/gi);
let hasMobileNavStyles = false;
if (responsiveSection) {
  responsiveSection.forEach(section => {
    if (section.includes('.nav-links') && section.includes('display: none')) {
      hasMobileNavStyles = true;
    }
  });
}
if (!hasMobileNavStyles) {
  console.log('✅ PASS: No mobile navigation styles in responsive section\n');
  passed++;
} else {
  console.log('❌ FAIL: Found mobile navigation styles (should be removed)\n');
  failed++;
}

// Test 15: Player bar z-index is high enough
console.log('Test 15: Player bar z-index is appropriate');
const playerBarZIndex = musicHtml.match(/\.player-bar\s*{[^}]*z-index:\s*(\d+)/);
if (playerBarZIndex && parseInt(playerBarZIndex[1]) >= 10000) {
  console.log(`✅ PASS: Player bar z-index is ${playerBarZIndex[1]} (high enough to stay above navigation)\n`);
  passed++;
} else {
  console.log('⚠️  WARNING: Player bar z-index might be too low\n');
  warnings++;
}

// Summary
console.log('═'.repeat(60));
console.log('SUMMARY');
console.log('═'.repeat(60));
console.log(`Total tests: ${passed + failed + warnings}`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`⚠️  Warnings: ${warnings}`);
console.log('═'.repeat(60));

if (failed === 0) {
  console.log('\n🎉 All tests passed! music.html navigation migration is complete.\n');
  console.log('Next steps:');
  console.log('1. Open music.html in a browser');
  console.log('2. Verify navigation appears correctly');
  console.log('3. Test that music player works (play, pause, next, prev)');
  console.log('4. Verify navigation doesn\'t interfere with player controls');
  console.log('5. Test mobile menu functionality');
  console.log('6. Test language switching');
  process.exit(0);
} else {
  console.log('\n❌ Some tests failed. Please review the failures above.\n');
  process.exit(1);
}
