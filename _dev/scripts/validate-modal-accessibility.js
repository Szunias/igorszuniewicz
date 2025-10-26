/**
 * Static Accessibility Validation Script
 * Validates modal implementation against accessibility requirements
 * Can be run with Node.js to check code structure
 */

const fs = require('fs');
const path = require('path');

const results = {
  passed: [],
  failed: [],
  warnings: []
};

function logTest(name, passed, message = '') {
  const result = { name, message };
  if (passed) {
    results.passed.push(result);
    console.log(`✓ ${name}${message ? ': ' + message : ''}`);
  } else {
    results.failed.push(result);
    console.error(`✗ ${name}${message ? ': ' + message : ''}`);
  }
}

function logWarning(name, message) {
  results.warnings.push({ name, message });
  console.warn(`⚠ ${name}: ${message}`);
}

// Test 1: Check modal HTML structure in music.html
function testModalHTMLStructure() {
  console.log('\n=== Testing Modal HTML Structure ===');
  
  try {
    const musicHTML = fs.readFileSync('music.html', 'utf8');
    
    // Check for modal container
    logTest('HTML Structure - Modal Container', 
      musicHTML.includes('id="track-info-modal"'),
      'Modal container found');
    
    // Check for ARIA attributes
    logTest('HTML Structure - role="dialog"',
      musicHTML.includes('role="dialog"'),
      'Dialog role present');
    
    logTest('HTML Structure - aria-modal="true"',
      musicHTML.includes('aria-modal="true"'),
      'aria-modal attribute present');
    
    logTest('HTML Structure - aria-labelledby',
      musicHTML.includes('aria-labelledby'),
      'aria-labelledby attribute present');
    
    // Check for close button with aria-label
    logTest('HTML Structure - Close Button aria-label',
      musicHTML.includes('aria-label="Close"') || musicHTML.includes('aria-label=\'Close\''),
      'Close button has aria-label');
    
    // Check for modal title with ID
    logTest('HTML Structure - Modal Title ID',
      musicHTML.includes('id="modal-title"'),
      'Modal title has ID for aria-labelledby');
    
  } catch (error) {
    logTest('HTML Structure - File Read', false, error.message);
  }
}

// Test 2: Check modal CSS for responsive design
function testModalCSS() {
  console.log('\n=== Testing Modal CSS ===');
  
  try {
    const musicHTML = fs.readFileSync('music.html', 'utf8');
    
    // Check for mobile media query
    logTest('CSS - Mobile Media Query',
      musicHTML.includes('@media') && musicHTML.includes('768px'),
      'Mobile breakpoint at 768px found');
    
    // Check for max-width on desktop
    logTest('CSS - Desktop Max Width',
      musicHTML.includes('max-width') && musicHTML.includes('600px'),
      'Max width constraint found');
    
    // Check for backdrop blur
    logTest('CSS - Backdrop Blur Effect',
      musicHTML.includes('backdrop-filter') && musicHTML.includes('blur'),
      'Backdrop blur effect present');
    
    // Check for transitions
    logTest('CSS - Smooth Transitions',
      musicHTML.includes('transition'),
      'CSS transitions present');
    
    // Check for z-index in modal
    const modalStyleMatch = musicHTML.match(/\.track-info-modal\s*{[^}]*z-index:\s*(\d+)/s);
    const zIndex = modalStyleMatch ? parseInt(modalStyleMatch[1]) : 0;
    logTest('CSS - High Z-Index',
      zIndex >= 9999,
      `z-index: ${zIndex}`);
    
  } catch (error) {
    logTest('CSS - File Read', false, error.message);
  }
}

// Test 3: Check JavaScript implementation
function testModalJavaScript() {
  console.log('\n=== Testing Modal JavaScript ===');
  
  try {
    const musicHTML = fs.readFileSync('music.html', 'utf8');
    
    // Check for TrackInfoModal object
    logTest('JavaScript - TrackInfoModal Object',
      musicHTML.includes('TrackInfoModal'),
      'TrackInfoModal object found');
    
    // Check for init method
    logTest('JavaScript - init() Method',
      musicHTML.includes('init()') || musicHTML.includes('init:'),
      'init method present');
    
    // Check for open method
    logTest('JavaScript - open() Method',
      musicHTML.includes('open(') && musicHTML.includes('trackIndex'),
      'open method with trackIndex parameter');
    
    // Check for close method
    logTest('JavaScript - close() Method',
      musicHTML.includes('close()') || musicHTML.includes('close:'),
      'close method present');
    
    // Check for Escape key handler
    logTest('JavaScript - Escape Key Handler',
      musicHTML.includes('Escape') && musicHTML.includes('keydown'),
      'Escape key handler present');
    
    // Check for focus trap
    logTest('JavaScript - Focus Trap',
      musicHTML.includes('Tab') && musicHTML.includes('handleTabKey'),
      'Focus trap implementation found');
    
    // Check for backdrop click handler
    logTest('JavaScript - Backdrop Click Handler',
      musicHTML.includes('backdrop') && musicHTML.includes('addEventListener'),
      'Backdrop click handler present');
    
    // Check for focus restoration
    logTest('JavaScript - Focus Restoration',
      musicHTML.includes('lastFocusedElement'),
      'Focus restoration logic present');
    
  } catch (error) {
    logTest('JavaScript - File Read', false, error.message);
  }
}

// Test 4: Check touch target sizes in CSS
function testTouchTargets() {
  console.log('\n=== Testing Touch Target Sizes ===');
  
  try {
    const musicHTML = fs.readFileSync('music.html', 'utf8');
    
    // Check close button size
    const closeButtonMatch = musicHTML.match(/\.track-info-close\s*{[^}]*width:\s*(\d+)px[^}]*height:\s*(\d+)px/s);
    if (closeButtonMatch) {
      const width = parseInt(closeButtonMatch[1]);
      const height = parseInt(closeButtonMatch[2]);
      logTest('Touch Targets - Close Button >= 44px',
        width >= 44 && height >= 44,
        `${width}x${height}px`);
    } else {
      logWarning('Touch Targets', 'Could not parse close button dimensions');
    }
    
    // Check info button size
    const infoButtonMatch = musicHTML.match(/\.playlist-info-btn\s*{[^}]*width:\s*(\d+)px[^}]*height:\s*(\d+)px/s);
    if (infoButtonMatch) {
      const width = parseInt(infoButtonMatch[1]);
      const height = parseInt(infoButtonMatch[2]);
      logTest('Touch Targets - Info Button >= 44px',
        width >= 44 && height >= 44,
        `${width}x${height}px`);
    } else {
      logWarning('Touch Targets', 'Could not parse info button dimensions');
    }
    
  } catch (error) {
    logTest('Touch Targets - File Read', false, error.message);
  }
}

// Test 5: Check translation integration
function testTranslationIntegration() {
  console.log('\n=== Testing Translation Integration ===');
  
  try {
    const musicHTML = fs.readFileSync('music.html', 'utf8');
    const musicJSON = fs.readFileSync('locales/music.json', 'utf8');
    const translations = JSON.parse(musicJSON);
    
    // Check for data-i18n attributes in modal
    logTest('Translation - data-i18n Attributes',
      musicHTML.includes('data-i18n="track_info_'),
      'Modal elements have data-i18n attributes');
    
    // Check for required translation keys
    const requiredKeys = [
      'track_info_year',
      'track_info_duration',
      'track_info_no_description'
    ];
    
    requiredKeys.forEach(key => {
      const hasKey = translations.en && translations.en[key] &&
                     translations.pl && translations.pl[key] &&
                     translations.nl && translations.nl[key];
      logTest(`Translation - Key "${key}"`,
        hasKey,
        hasKey ? 'Present in all languages' : 'Missing in some languages');
    });
    
    // Check for updateLanguage method
    logTest('Translation - updateLanguage() Method',
      musicHTML.includes('updateLanguage'),
      'Language update method present');
    
  } catch (error) {
    logTest('Translation - File Read', false, error.message);
  }
}

// Test 6: Check info button integration
function testInfoButtonIntegration() {
  console.log('\n=== Testing Info Button Integration ===');
  
  try {
    const musicHTML = fs.readFileSync('music.html', 'utf8');
    
    // Check for info button creation
    logTest('Info Button - Creation',
      musicHTML.includes('playlist-info-btn'),
      'Info button class found');
    
    // Check for stopPropagation to prevent track playback
    logTest('Info Button - stopPropagation',
      musicHTML.includes('stopPropagation'),
      'Event propagation stopped');
    
    // Check for aria-label on info button
    logTest('Info Button - aria-label',
      musicHTML.includes('aria-label') && musicHTML.includes('Track information'),
      'Info button has aria-label');
    
    // Check for modal open call
    logTest('Info Button - Opens Modal',
      musicHTML.includes('TrackInfoModal.open'),
      'Info button opens modal');
    
  } catch (error) {
    logTest('Info Button - File Read', false, error.message);
  }
}

// Run all tests
function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     Modal Accessibility Static Validation Suite           ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  testModalHTMLStructure();
  testModalCSS();
  testModalJavaScript();
  testTouchTargets();
  testTranslationIntegration();
  testInfoButtonIntegration();
  
  // Summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                      TEST SUMMARY                          ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`✓ Passed: ${results.passed.length}`);
  console.log(`✗ Failed: ${results.failed.length}`);
  console.log(`⚠ Warnings: ${results.warnings.length}`);
  
  if (results.failed.length > 0) {
    console.log('\nFailed Tests:');
    results.failed.forEach(test => {
      console.log(`  ✗ ${test.name}${test.message ? ': ' + test.message : ''}`);
    });
  }
  
  if (results.warnings.length > 0) {
    console.log('\nWarnings:');
    results.warnings.forEach(warning => {
      console.log(`  ⚠ ${warning.name}: ${warning.message}`);
    });
  }
  
  const allPassed = results.failed.length === 0;
  console.log('\n' + (allPassed ? '✅ ALL STATIC TESTS PASSED' : '❌ SOME TESTS FAILED'));
  console.log('\n📝 Note: Run test-modal-accessibility.html in a browser for runtime tests');
  
  return allPassed ? 0 : 1;
}

// Run tests
process.exit(runAllTests());
