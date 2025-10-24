/**
 * Test: Verify Player Continues During Modal Interaction
 * 
 * This test validates that:
 * 1. Clicking info button doesn't pause playback
 * 2. Modal open/close doesn't affect audio state
 * 3. Player controls remain functional while modal is visible
 * 
 * Requirements: 2.2, 4.4
 */

const fs = require('fs');
const path = require('path');

console.log('🎵 Testing Player Continuity During Modal Interaction\n');
console.log('=' .repeat(60));

// Test results tracker
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function test(name, fn) {
  try {
    fn();
    results.passed++;
    results.tests.push({ name, status: 'PASS' });
    console.log(`✅ PASS: ${name}`);
  } catch (error) {
    results.failed++;
    results.tests.push({ name, status: 'FAIL', error: error.message });
    console.log(`❌ FAIL: ${name}`);
    console.log(`   Error: ${error.message}`);
  }
}

// Read music.html file
const musicHtmlPath = path.join(__dirname, 'music.html');
const musicHtml = fs.readFileSync(musicHtmlPath, 'utf-8');

console.log('\n📋 Test Suite: Player Continuity During Modal Interaction\n');

// Test 1: Info button click handler prevents event propagation
test('Info button has stopPropagation to prevent track playback', () => {
  const hasStopPropagation = musicHtml.includes('e.stopPropagation()');
  const infoButtonContext = musicHtml.match(/infoBtn\.addEventListener\('click',[\s\S]{0,200}stopPropagation/);
  
  if (!hasStopPropagation || !infoButtonContext) {
    throw new Error('Info button click handler must call e.stopPropagation() to prevent triggering track playback');
  }
});

// Test 2: Modal open function doesn't pause audio
test('TrackInfoModal.open() does not pause audio playback', () => {
  const modalOpenFunction = musicHtml.match(/open\(trackIndex\)\s*{[\s\S]*?(?=close\(\)|$)/);
  
  if (!modalOpenFunction) {
    throw new Error('TrackInfoModal.open() function not found');
  }
  
  const openFunctionCode = modalOpenFunction[0];
  
  // Check that open() doesn't call audio.pause()
  if (openFunctionCode.includes('audio.pause()')) {
    throw new Error('TrackInfoModal.open() should NOT pause audio playback');
  }
  
  // Check that open() doesn't call pause()
  if (openFunctionCode.match(/\bpause\s*\(/)) {
    throw new Error('TrackInfoModal.open() should NOT call pause() function');
  }
});

// Test 3: Modal close function doesn't affect audio state
test('TrackInfoModal.close() does not affect audio playback state', () => {
  const modalCloseFunction = musicHtml.match(/close\(\)\s*{[\s\S]*?(?=setupFocusTrap|handleTabKey|updateLanguage|init|open|$)/);
  
  if (!modalCloseFunction) {
    throw new Error('TrackInfoModal.close() function not found');
  }
  
  const closeFunctionCode = modalCloseFunction[0];
  
  // Check that close() doesn't call audio.pause()
  if (closeFunctionCode.includes('audio.pause()')) {
    throw new Error('TrackInfoModal.close() should NOT pause audio playback');
  }
  
  // Check that close() doesn't call pause()
  if (closeFunctionCode.match(/\bpause\s*\(/)) {
    throw new Error('TrackInfoModal.close() should NOT call pause() function');
  }
  
  // Check that close() doesn't call audio.play()
  if (closeFunctionCode.includes('audio.play()')) {
    throw new Error('TrackInfoModal.close() should NOT call audio.play()');
  }
});

// Test 4: Modal backdrop click handler closes modal without affecting audio
test('Modal backdrop click closes modal without affecting audio', () => {
  const backdropListener = musicHtml.match(/backdrop\.addEventListener\('click',[\s\S]{0,100}\)/);
  
  if (!backdropListener) {
    throw new Error('Backdrop click listener not found');
  }
  
  const listenerCode = backdropListener[0];
  
  // Should call close()
  if (!listenerCode.includes('this.close()') && !listenerCode.includes('close()')) {
    throw new Error('Backdrop click should call close() method');
  }
});

// Test 5: Escape key handler closes modal without affecting audio
test('Escape key closes modal without affecting audio', () => {
  const escapeHandler = musicHtml.match(/if\s*\(\s*e\.key\s*===\s*['"]Escape['"][\s\S]{0,150}\)/);
  
  if (!escapeHandler) {
    throw new Error('Escape key handler not found');
  }
  
  const handlerCode = escapeHandler[0];
  
  // Should call close()
  if (!handlerCode.includes('this.close()') && !handlerCode.includes('close()')) {
    throw new Error('Escape key should call close() method');
  }
});

// Test 6: Player controls remain accessible while modal is visible
test('Player controls are not disabled when modal is open', () => {
  const modalOpenFunction = musicHtml.match(/open\(trackIndex\)\s*{[\s\S]*?(?=close\(\)|$)/);
  
  if (!modalOpenFunction) {
    throw new Error('TrackInfoModal.open() function not found');
  }
  
  const openFunctionCode = modalOpenFunction[0];
  
  // Check that open() doesn't disable player controls
  if (openFunctionCode.includes('playBtn.disabled') || 
      openFunctionCode.includes('prevBtn.disabled') || 
      openFunctionCode.includes('nextBtn.disabled')) {
    throw new Error('Modal open should NOT disable player controls');
  }
  
  // Check that open() doesn't hide player bar
  if (openFunctionCode.includes('playerBar.style.display') || 
      (openFunctionCode.includes('player-bar') && openFunctionCode.includes('display: none'))) {
    throw new Error('Modal open should NOT hide player bar');
  }
});

// Test 7: Modal z-index is higher than player bar but doesn't interfere
test('Modal z-index allows interaction without blocking player', () => {
  // Check modal z-index
  const modalZIndex = musicHtml.match(/\.track-info-modal\s*{[\s\S]*?z-index:\s*(\d+)/);
  const playerZIndex = musicHtml.match(/\.player-bar\s*{[\s\S]*?z-index:\s*(\d+)/);
  
  if (!modalZIndex) {
    throw new Error('Modal z-index not found in CSS');
  }
  
  if (!playerZIndex) {
    throw new Error('Player bar z-index not found in CSS');
  }
  
  const modalZ = parseInt(modalZIndex[1]);
  const playerZ = parseInt(playerZIndex[1]);
  
  if (modalZ <= playerZ) {
    throw new Error(`Modal z-index (${modalZ}) should be higher than player bar z-index (${playerZ})`);
  }
  
  console.log(`   Modal z-index: ${modalZ}, Player z-index: ${playerZ}`);
});

// Test 8: Audio element is not affected by modal visibility
test('Audio element remains independent of modal state', () => {
  // Check that audio element is separate from modal
  const audioElement = musicHtml.match(/<audio[\s\S]*?<\/audio>/);
  const modalElement = musicHtml.match(/<div class="track-info-modal"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/);
  
  if (!audioElement) {
    throw new Error('Audio element not found');
  }
  
  if (!modalElement) {
    throw new Error('Modal element not found');
  }
  
  // Audio should be outside modal
  const audioIndex = musicHtml.indexOf(audioElement[0]);
  const modalIndex = musicHtml.indexOf(modalElement[0]);
  
  if (audioIndex > modalIndex && audioIndex < modalIndex + modalElement[0].length) {
    throw new Error('Audio element should not be inside modal element');
  }
});

// Test 9: Modal doesn't interfere with audio event listeners
test('Modal initialization doesn\'t remove audio event listeners', () => {
  const modalInit = musicHtml.match(/init\(\)\s*{[\s\S]*?(?=open\(|$)/);
  
  if (!modalInit) {
    throw new Error('TrackInfoModal.init() function not found');
  }
  
  const initCode = modalInit[0];
  
  // Check that init() doesn't remove audio listeners
  if (initCode.includes('audio.removeEventListener')) {
    throw new Error('Modal init should NOT remove audio event listeners');
  }
});

// Test 10: Player bar remains visible when modal is open
test('Player bar visibility is maintained when modal opens', () => {
  const modalOpenFunction = musicHtml.match(/open\(trackIndex\)\s*{[\s\S]*?(?=close\(\)|$)/);
  
  if (!modalOpenFunction) {
    throw new Error('TrackInfoModal.open() function not found');
  }
  
  const openFunctionCode = modalOpenFunction[0];
  
  // Check that open() doesn't hide player bar
  if (openFunctionCode.includes('playerBar.classList.remove(\'visible\')') ||
      (openFunctionCode.includes('player-bar') && openFunctionCode.includes('display: none'))) {
    throw new Error('Modal open should NOT hide player bar');
  }
});

// Test 11: Info button is properly styled and positioned
test('Info button is visible and accessible in playlist items', () => {
  // Check that info button is added to playlist items
  const infoButtonCreation = musicHtml.match(/infoBtn\s*=\s*document\.createElement\(['"]button['"]\)/);
  
  if (!infoButtonCreation) {
    throw new Error('Info button creation not found in renderPlaylist()');
  }
  
  // Check that info button has proper class
  const infoButtonClass = musicHtml.match(/infoBtn\.className\s*=\s*['"]playlist-info-btn['"]/);
  
  if (!infoButtonClass) {
    throw new Error('Info button should have class "playlist-info-btn"');
  }
  
  // Check that info button is appended to playlist item
  const infoButtonAppend = musicHtml.match(/item\.appendChild\(infoBtn\)/);
  
  if (!infoButtonAppend) {
    throw new Error('Info button should be appended to playlist item');
  }
});

// Test 12: Modal content updates don't affect audio playback
test('Modal content population doesn\'t interfere with audio', () => {
  const populateFunction = musicHtml.match(/populateModalContent\(trackIndex\)\s*{[\s\S]*?(?=close\(|open\(|setupFocusTrap|$)/);
  
  if (!populateFunction) {
    throw new Error('populateModalContent() function not found');
  }
  
  const populateCode = populateFunction[0];
  
  // Check that populate doesn't affect audio
  if (populateCode.includes('audio.pause()') || 
      populateCode.includes('audio.play()') ||
      populateCode.match(/\bpause\s*\(/) ||
      populateCode.match(/\bplay\s*\(/)) {
    throw new Error('populateModalContent() should NOT affect audio playback');
  }
});

console.log('\n' + '='.repeat(60));
console.log('\n📊 Test Results Summary\n');
console.log(`Total Tests: ${results.passed + results.failed}`);
console.log(`✅ Passed: ${results.passed}`);
console.log(`❌ Failed: ${results.failed}`);
console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);

if (results.failed > 0) {
  console.log('\n❌ Failed Tests:');
  results.tests.filter(t => t.status === 'FAIL').forEach(t => {
    console.log(`   - ${t.name}`);
    if (t.error) console.log(`     ${t.error}`);
  });
}

console.log('\n' + '='.repeat(60));

// Exit with appropriate code
process.exit(results.failed > 0 ? 1 : 0);
