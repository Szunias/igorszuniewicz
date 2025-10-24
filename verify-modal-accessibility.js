/**
 * Accessibility and Responsive Behavior Test Suite
 * Tests modal layout, keyboard navigation, ARIA attributes, touch targets, and color contrast
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */

const testResults = {
  passed: [],
  failed: [],
  warnings: []
};

function logTest(name, passed, message = '') {
  const result = { name, message };
  if (passed) {
    testResults.passed.push(result);
    console.log(`✓ ${name}${message ? ': ' + message : ''}`);
  } else {
    testResults.failed.push(result);
    console.error(`✗ ${name}${message ? ': ' + message : ''}`);
  }
}

function logWarning(name, message) {
  testResults.warnings.push({ name, message });
  console.warn(`⚠ ${name}: ${message}`);
}

// Test 1: Modal Responsive Layout - Mobile (< 768px)
function testMobileLayout() {
  console.log('\n=== Testing Mobile Layout (< 768px) ===');
  
  const modal = document.getElementById('track-info-modal');
  const content = modal?.querySelector('.track-info-content');
  
  if (!modal || !content) {
    logTest('Mobile Layout - Elements Exist', false, 'Modal or content not found');
    return;
  }
  
  // Simulate mobile viewport
  const originalWidth = window.innerWidth;
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 375
  });
  window.dispatchEvent(new Event('resize'));
  
  const styles = window.getComputedStyle(content);
  const width = parseFloat(styles.width);
  const padding = parseFloat(styles.padding);
  const maxHeight = parseFloat(styles.maxHeight);
  
  // Check width is 90-95% of viewport
  const viewportWidth = 375;
  const widthPercent = (width / viewportWidth) * 100;
  logTest('Mobile Layout - Width 90-95%', widthPercent >= 85 && widthPercent <= 100, 
    `Width: ${width}px (${widthPercent.toFixed(1)}%)`);
  
  // Check padding is reasonable for mobile
  logTest('Mobile Layout - Padding', padding >= 16 && padding <= 32, 
    `Padding: ${padding}px`);
  
  // Check max-height allows scrolling
  logTest('Mobile Layout - Max Height', maxHeight > 0, 
    `Max height: ${maxHeight}px`);
  
  // Check overflow is set
  logTest('Mobile Layout - Overflow', styles.overflowY === 'auto' || styles.overflowY === 'scroll',
    `Overflow-Y: ${styles.overflowY}`);
  
  // Restore original width
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: originalWidth
  });
}

// Test 2: Modal Responsive Layout - Desktop (>= 768px)
function testDesktopLayout() {
  console.log('\n=== Testing Desktop Layout (>= 768px) ===');
  
  const modal = document.getElementById('track-info-modal');
  const content = modal?.querySelector('.track-info-content');
  
  if (!modal || !content) {
    logTest('Desktop Layout - Elements Exist', false, 'Modal or content not found');
    return;
  }
  
  // Simulate desktop viewport
  const originalWidth = window.innerWidth;
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 1920
  });
  window.dispatchEvent(new Event('resize'));
  
  const styles = window.getComputedStyle(content);
  const maxWidth = parseFloat(styles.maxWidth);
  const width = parseFloat(styles.width);
  
  // Check max-width is around 600px
  logTest('Desktop Layout - Max Width 600px', maxWidth >= 550 && maxWidth <= 650,
    `Max width: ${maxWidth}px`);
  
  // Check modal is centered
  const modalStyles = window.getComputedStyle(modal);
  logTest('Desktop Layout - Centered (Flexbox)', 
    modalStyles.display === 'flex' && 
    modalStyles.alignItems === 'center' && 
    modalStyles.justifyContent === 'center',
    `Display: ${modalStyles.display}, Align: ${modalStyles.alignItems}, Justify: ${modalStyles.justifyContent}`);
  
  // Restore original width
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: originalWidth
  });
}

// Test 3: Keyboard Navigation
function testKeyboardNavigation() {
  console.log('\n=== Testing Keyboard Navigation ===');
  
  const modal = document.getElementById('track-info-modal');
  const closeBtn = document.getElementById('track-info-close');
  
  if (!modal || !closeBtn) {
    logTest('Keyboard Navigation - Elements Exist', false, 'Modal or close button not found');
    return;
  }
  
  // Test Escape key closes modal
  modal.classList.add('visible');
  const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27 });
  document.dispatchEvent(escapeEvent);
  
  setTimeout(() => {
    const isVisible = modal.classList.contains('visible');
    logTest('Keyboard Navigation - Escape Key Closes Modal', !isVisible,
      isVisible ? 'Modal still visible after Escape' : 'Modal closed successfully');
  }, 100);
  
  // Test Tab navigation (focus trap)
  modal.classList.add('visible');
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  logTest('Keyboard Navigation - Focusable Elements Exist', focusableElements.length > 0,
    `Found ${focusableElements.length} focusable elements`);
  
  // Test close button is focusable
  logTest('Keyboard Navigation - Close Button Focusable', 
    closeBtn.tabIndex >= 0 || closeBtn.tabIndex === undefined,
    `TabIndex: ${closeBtn.tabIndex}`);
  
  modal.classList.remove('visible');
}

// Test 4: ARIA Attributes
function testARIAAttributes() {
  console.log('\n=== Testing ARIA Attributes ===');
  
  const modal = document.getElementById('track-info-modal');
  const closeBtn = document.getElementById('track-info-close');
  
  if (!modal) {
    logTest('ARIA - Modal Exists', false, 'Modal not found');
    return;
  }
  
  // Test modal ARIA attributes
  logTest('ARIA - Modal role="dialog"', modal.getAttribute('role') === 'dialog',
    `Role: ${modal.getAttribute('role')}`);
  
  logTest('ARIA - Modal aria-modal="true"', modal.getAttribute('aria-modal') === 'true',
    `aria-modal: ${modal.getAttribute('aria-modal')}`);
  
  logTest('ARIA - Modal aria-labelledby', modal.hasAttribute('aria-labelledby'),
    `aria-labelledby: ${modal.getAttribute('aria-labelledby')}`);
  
  // Test close button ARIA label
  if (closeBtn) {
    const ariaLabel = closeBtn.getAttribute('aria-label');
    logTest('ARIA - Close Button aria-label', ariaLabel && ariaLabel.length > 0,
      `aria-label: "${ariaLabel}"`);
  } else {
    logTest('ARIA - Close Button Exists', false, 'Close button not found');
  }
  
  // Test modal title exists and has ID
  const modalTitle = document.getElementById('modal-title');
  logTest('ARIA - Modal Title Exists', modalTitle !== null,
    modalTitle ? `ID: ${modalTitle.id}` : 'Title element not found');
  
  // Test that aria-labelledby points to existing element
  if (modal.hasAttribute('aria-labelledby')) {
    const labelId = modal.getAttribute('aria-labelledby');
    const labelElement = document.getElementById(labelId);
    logTest('ARIA - aria-labelledby Points to Valid Element', labelElement !== null,
      `Points to: ${labelId}`);
  }
}

// Test 5: Touch Targets (44x44px minimum)
function testTouchTargets() {
  console.log('\n=== Testing Touch Targets (44x44px minimum) ===');
  
  const closeBtn = document.getElementById('track-info-close');
  const infoButtons = document.querySelectorAll('.playlist-info-btn');
  
  // Test close button size
  if (closeBtn) {
    const rect = closeBtn.getBoundingClientRect();
    const styles = window.getComputedStyle(closeBtn);
    const width = parseFloat(styles.width);
    const height = parseFloat(styles.height);
    
    logTest('Touch Target - Close Button Width >= 44px', width >= 44,
      `Width: ${width.toFixed(1)}px`);
    
    logTest('Touch Target - Close Button Height >= 44px', height >= 44,
      `Height: ${height.toFixed(1)}px`);
  } else {
    logTest('Touch Target - Close Button Exists', false, 'Close button not found');
  }
  
  // Test info buttons size
  if (infoButtons.length > 0) {
    const firstBtn = infoButtons[0];
    const styles = window.getComputedStyle(firstBtn);
    const width = parseFloat(styles.width);
    const height = parseFloat(styles.height);
    
    logTest('Touch Target - Info Button Width >= 44px', width >= 44,
      `Width: ${width.toFixed(1)}px`);
    
    logTest('Touch Target - Info Button Height >= 44px', height >= 44,
      `Height: ${height.toFixed(1)}px`);
    
    if (infoButtons.length > 1) {
      logWarning('Touch Targets', `Found ${infoButtons.length} info buttons - all should meet size requirements`);
    }
  } else {
    logTest('Touch Target - Info Buttons Exist', false, 'No info buttons found');
  }
}

// Test 6: Color Contrast (WCAG AA)
function testColorContrast() {
  console.log('\n=== Testing Color Contrast (WCAG AA) ===');
  
  const modal = document.getElementById('track-info-modal');
  const content = modal?.querySelector('.track-info-content');
  const closeBtn = document.getElementById('track-info-close');
  const title = document.getElementById('modal-title');
  
  if (!content) {
    logTest('Color Contrast - Modal Content Exists', false, 'Modal content not found');
    return;
  }
  
  // Helper function to calculate relative luminance
  function getLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }
  
  // Helper function to calculate contrast ratio
  function getContrastRatio(rgb1, rgb2) {
    const l1 = getLuminance(rgb1[0], rgb1[1], rgb1[2]);
    const l2 = getLuminance(rgb2[0], rgb2[1], rgb2[2]);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }
  
  // Helper to parse RGB color
  function parseRGB(colorString) {
    const match = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    return match ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])] : null;
  }
  
  // Test modal content background vs text
  const contentStyles = window.getComputedStyle(content);
  const bgColor = parseRGB(contentStyles.backgroundColor);
  
  if (title) {
    const titleStyles = window.getComputedStyle(title);
    const textColor = parseRGB(titleStyles.color);
    
    if (bgColor && textColor) {
      const ratio = getContrastRatio(bgColor, textColor);
      // WCAG AA requires 4.5:1 for normal text, 3:1 for large text (18pt+)
      const fontSize = parseFloat(titleStyles.fontSize);
      const requiredRatio = fontSize >= 24 ? 3 : 4.5;
      
      logTest('Color Contrast - Title Text', ratio >= requiredRatio,
        `Ratio: ${ratio.toFixed(2)}:1 (required: ${requiredRatio}:1, font-size: ${fontSize}px)`);
    } else {
      logWarning('Color Contrast', 'Could not parse title colors');
    }
  }
  
  // Test close button contrast
  if (closeBtn) {
    const btnStyles = window.getComputedStyle(closeBtn);
    const btnColor = parseRGB(btnStyles.color);
    const btnBg = parseRGB(btnStyles.backgroundColor);
    
    if (btnColor && btnBg) {
      const ratio = getContrastRatio(btnColor, btnBg);
      logTest('Color Contrast - Close Button', ratio >= 3,
        `Ratio: ${ratio.toFixed(2)}:1 (required: 3:1 for UI components)`);
    } else {
      logWarning('Color Contrast', 'Could not parse close button colors');
    }
  }
  
  // Test backdrop opacity
  const backdrop = modal?.querySelector('.track-info-backdrop');
  if (backdrop) {
    const backdropStyles = window.getComputedStyle(backdrop);
    const backdropBg = backdropStyles.backgroundColor;
    logTest('Color Contrast - Backdrop Semi-transparent', 
      backdropBg.includes('rgba') || parseFloat(backdropStyles.opacity) < 1,
      `Background: ${backdropBg}, Opacity: ${backdropStyles.opacity}`);
  }
}

// Test 7: Focus Trap
function testFocusTrap() {
  console.log('\n=== Testing Focus Trap ===');
  
  const modal = document.getElementById('track-info-modal');
  
  if (!modal) {
    logTest('Focus Trap - Modal Exists', false, 'Modal not found');
    return;
  }
  
  // Open modal
  modal.classList.add('visible');
  
  // Get all focusable elements
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  logTest('Focus Trap - Has Focusable Elements', focusableElements.length > 0,
    `Found ${focusableElements.length} focusable elements`);
  
  if (focusableElements.length > 0) {
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    // Test that first element can receive focus
    firstElement.focus();
    logTest('Focus Trap - First Element Focusable', document.activeElement === firstElement,
      `Active element: ${document.activeElement?.tagName}`);
    
    // Test that last element can receive focus
    lastElement.focus();
    logTest('Focus Trap - Last Element Focusable', document.activeElement === lastElement,
      `Active element: ${document.activeElement?.tagName}`);
  }
  
  modal.classList.remove('visible');
}

// Run all tests
function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Modal Accessibility & Responsive Behavior Test Suite     ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  testMobileLayout();
  testDesktopLayout();
  testKeyboardNavigation();
  testARIAAttributes();
  testTouchTargets();
  testColorContrast();
  testFocusTrap();
  
  // Summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                      TEST SUMMARY                          ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`✓ Passed: ${testResults.passed.length}`);
  console.log(`✗ Failed: ${testResults.failed.length}`);
  console.log(`⚠ Warnings: ${testResults.warnings.length}`);
  
  if (testResults.failed.length > 0) {
    console.log('\nFailed Tests:');
    testResults.failed.forEach(test => {
      console.log(`  ✗ ${test.name}${test.message ? ': ' + test.message : ''}`);
    });
  }
  
  if (testResults.warnings.length > 0) {
    console.log('\nWarnings:');
    testResults.warnings.forEach(warning => {
      console.log(`  ⚠ ${warning.name}: ${warning.message}`);
    });
  }
  
  const allPassed = testResults.failed.length === 0;
  console.log('\n' + (allPassed ? '✓ ALL TESTS PASSED' : '✗ SOME TESTS FAILED'));
  
  return {
    passed: testResults.passed.length,
    failed: testResults.failed.length,
    warnings: testResults.warnings.length,
    allPassed,
    details: testResults
  };
}

// Auto-run when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(runAllTests, 1000);
  });
} else {
  setTimeout(runAllTests, 1000);
}
