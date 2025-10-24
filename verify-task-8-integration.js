/**
 * Task 8: Cross-Browser Integration Test Script
 * Run this in the browser console on music.html page
 */

(function() {
  'use strict';

  const TestSuite = {
    results: [],
    
    log(message, type = 'info') {
      const styles = {
        info: 'color: #60a5fa; font-weight: bold',
        success: 'color: #4ade80; font-weight: bold',
        error: 'color: #f87171; font-weight: bold',
        warn: 'color: #fbbf24; font-weight: bold'
      };
      console.log(`%c${message}`, styles[type]);
    },

    test(name, fn) {
      try {
        const result = fn();
        if (result) {
          this.results.push({ name, pass: true });
          this.log(`✓ PASS: ${name}`, 'success');
          return true;
        } else {
          this.results.push({ name, pass: false, reason: 'Test returned false' });
          this.log(`✗ FAIL: ${name}`, 'error');
          return false;
        }
      } catch (error) {
        this.results.push({ name, pass: false, reason: error.message });
        this.log(`✗ ERROR: ${name} - ${error.message}`, 'error');
        return false;
      }
    },

    async asyncTest(name, fn) {
      try {
        const result = await fn();
        if (result) {
          this.results.push({ name, pass: true });
          this.log(`✓ PASS: ${name}`, 'success');
          return true;
        } else {
          this.results.push({ name, pass: false, reason: 'Test returned false' });
          this.log(`✗ FAIL: ${name}`, 'error');
          return false;
        }
      } catch (error) {
        this.results.push({ name, pass: false, reason: error.message });
        this.log(`✗ ERROR: ${name} - ${error.message}`, 'error');
        return false;
      }
    },

    summary() {
      const total = this.results.length;
      const passed = this.results.filter(r => r.pass).length;
      const failed = total - passed;
      const rate = total > 0 ? Math.round((passed / total) * 100) : 0;

      console.log('\n' + '='.repeat(60));
      this.log('📊 TEST SUMMARY', 'info');
      console.log('='.repeat(60));
      console.log(`Total Tests: ${total}`);
      this.log(`Passed: ${passed}`, 'success');
      this.log(`Failed: ${failed}`, failed > 0 ? 'error' : 'success');
      this.log(`Success Rate: ${rate}%`, rate === 100 ? 'success' : 'warn');
      console.log('='.repeat(60) + '\n');

      if (failed > 0) {
        this.log('Failed Tests:', 'error');
        this.results.filter(r => !r.pass).forEach(r => {
          console.log(`  - ${r.name}: ${r.reason || 'Unknown'}`);
        });
      }
    }
  };

  async function runAllTests() {
    TestSuite.log('🧪 Starting Task 8 Integration Tests...', 'info');
    console.log('Requirements: 1.1, 1.2, 2.1, 2.2, 2.4, 4.1, 4.2, 4.3, 4.4\n');

    // 1. Translation System Tests
    TestSuite.log('\n1️⃣ TRANSLATION SYSTEM TESTS', 'info');
    
    TestSuite.test('Translations object exists', () => {
      return typeof window.translations === 'object' && window.translations !== null;
    });

    TestSuite.test('All three languages loaded (EN, PL, NL)', () => {
      return window.translations.en && window.translations.pl && window.translations.nl;
    });

    TestSuite.test('Required translation keys exist in EN', () => {
      const keys = ['page_title', 'page_description', 'playlist_title', 'track_info_close', 'track_info_no_description'];
      return keys.every(key => window.translations.en[key]);
    });

    TestSuite.test('Required translation keys exist in PL', () => {
      const keys = ['page_title', 'page_description', 'playlist_title', 'track_info_close', 'track_info_no_description'];
      return keys.every(key => window.translations.pl[key]);
    });

    TestSuite.test('Required translation keys exist in NL', () => {
      const keys = ['page_title', 'page_description', 'playlist_title', 'track_info_close', 'track_info_no_description'];
      return keys.every(key => window.translations.nl[key]);
    });

    TestSuite.test('setLanguage function exists', () => {
      return typeof window.setLanguage === 'function';
    });

    // 2. Modal Structure Tests
    TestSuite.log('\n2️⃣ MODAL STRUCTURE TESTS', 'info');

    TestSuite.test('Modal element exists', () => {
      return document.getElementById('track-info-modal') !== null;
    });

    TestSuite.test('Modal backdrop exists', () => {
      return document.getElementById('track-info-backdrop') !== null;
    });

    TestSuite.test('Modal close button exists', () => {
      return document.getElementById('track-info-close') !== null;
    });

    TestSuite.test('Modal has role="dialog"', () => {
      const modal = document.getElementById('track-info-modal');
      return modal && modal.getAttribute('role') === 'dialog';
    });

    TestSuite.test('Modal has aria-modal="true"', () => {
      const modal = document.getElementById('track-info-modal');
      return modal && modal.getAttribute('aria-modal') === 'true';
    });

    TestSuite.test('Modal has aria-labelledby', () => {
      const modal = document.getElementById('track-info-modal');
      return modal && modal.hasAttribute('aria-labelledby');
    });

    TestSuite.test('Close button has aria-label or data-i18n-aria-label', () => {
      const closeBtn = document.getElementById('track-info-close');
      return closeBtn && (closeBtn.hasAttribute('aria-label') || closeBtn.hasAttribute('data-i18n-aria-label'));
    });

    TestSuite.test('Close button meets 44x44px minimum size', () => {
      const closeBtn = document.getElementById('track-info-close');
      if (!closeBtn) return false;
      const styles = window.getComputedStyle(closeBtn);
      const width = parseInt(styles.width);
      const height = parseInt(styles.height);
      console.log(`  Close button size: ${width}x${height}px`);
      return width >= 44 && height >= 44;
    });

    // 3. Modal Functionality Tests
    TestSuite.log('\n3️⃣ MODAL FUNCTIONALITY TESTS', 'info');

    TestSuite.test('TrackInfoModal object exists', () => {
      return typeof window.TrackInfoModal === 'object' && window.TrackInfoModal !== null;
    });

    TestSuite.test('TrackInfoModal.open method exists', () => {
      return typeof window.TrackInfoModal.open === 'function';
    });

    TestSuite.test('TrackInfoModal.close method exists', () => {
      return typeof window.TrackInfoModal.close === 'function';
    });

    TestSuite.test('TrackInfoModal.updateLanguage method exists', () => {
      return typeof window.TrackInfoModal.updateLanguage === 'function';
    });

    // 4. Player Integration Tests
    TestSuite.log('\n4️⃣ PLAYER INTEGRATION TESTS', 'info');

    TestSuite.test('Audio player element exists', () => {
      return document.getElementById('audio-player') !== null;
    });

    TestSuite.test('Player bar element exists', () => {
      return document.getElementById('player-bar') !== null;
    });

    TestSuite.test('Tracks array exists and has data', () => {
      return Array.isArray(window.tracks) && window.tracks.length > 0;
    });

    TestSuite.test('Tracks have required properties', () => {
      if (!window.tracks || window.tracks.length === 0) return false;
      const track = window.tracks[0];
      return track.title && track.artist && track.cover && track.sources;
    });

    // 5. Playlist Tests
    TestSuite.log('\n5️⃣ PLAYLIST TESTS', 'info');

    TestSuite.test('Playlist container exists', () => {
      return document.getElementById('playlist') !== null;
    });

    TestSuite.test('Playlist items rendered', () => {
      const items = document.querySelectorAll('.playlist-item');
      console.log(`  Found ${items.length} playlist items`);
      return items.length > 0;
    });

    TestSuite.test('Info buttons exist on playlist items', () => {
      const infoButtons = document.querySelectorAll('.playlist-info-btn');
      console.log(`  Found ${infoButtons.length} info buttons`);
      return infoButtons.length > 0;
    });

    TestSuite.test('Info buttons have aria-label or data-i18n-aria-label', () => {
      const infoButtons = document.querySelectorAll('.playlist-info-btn');
      if (infoButtons.length === 0) return false;
      
      let allHaveLabels = true;
      infoButtons.forEach(btn => {
        if (!btn.hasAttribute('aria-label') && !btn.hasAttribute('data-i18n-aria-label')) {
          allHaveLabels = false;
        }
      });
      return allHaveLabels;
    });

    TestSuite.test('Info buttons meet 44x44px minimum size', () => {
      const infoButtons = document.querySelectorAll('.playlist-info-btn');
      if (infoButtons.length === 0) return false;
      
      const firstBtn = infoButtons[0];
      const styles = window.getComputedStyle(firstBtn);
      const width = parseInt(styles.width);
      const height = parseInt(styles.height);
      console.log(`  Info button size: ${width}x${height}px`);
      return width >= 44 && height >= 44;
    });

    // 6. Translation Elements Tests
    TestSuite.log('\n6️⃣ TRANSLATION ELEMENTS TESTS', 'info');

    TestSuite.test('Page title has data-i18n attribute', () => {
      const title = document.querySelector('.page-title');
      return title && title.hasAttribute('data-i18n');
    });

    TestSuite.test('Page description has data-i18n attribute', () => {
      const desc = document.querySelector('.page-description');
      return desc && desc.hasAttribute('data-i18n');
    });

    TestSuite.test('Playlist title has data-i18n attribute', () => {
      const title = document.querySelector('.playlist-title');
      return title && title.hasAttribute('data-i18n');
    });

    TestSuite.test('Filter tags have data-i18n attributes', () => {
      const tags = document.querySelectorAll('.filter-tag');
      if (tags.length === 0) return false;
      
      let allHaveI18n = true;
      tags.forEach(tag => {
        if (!tag.hasAttribute('data-i18n')) {
          allHaveI18n = false;
        }
      });
      return allHaveI18n;
    });

    // 7. Browser Compatibility Tests
    TestSuite.log('\n7️⃣ BROWSER COMPATIBILITY TESTS', 'info');

    TestSuite.test('CSS backdrop-filter support', () => {
      return CSS.supports('backdrop-filter', 'blur(10px)') || 
             CSS.supports('-webkit-backdrop-filter', 'blur(10px)');
    });

    TestSuite.test('ES6+ features supported', () => {
      try {
        eval('const test = () => true; test();');
        return true;
      } catch (e) {
        return false;
      }
    });

    TestSuite.test('Audio API supported', () => {
      return typeof Audio !== 'undefined';
    });

    TestSuite.test('LocalStorage available', () => {
      try {
        localStorage.setItem('__test__', 'test');
        localStorage.removeItem('__test__');
        return true;
      } catch (e) {
        return false;
      }
    });

    // 8. Console Error Check
    TestSuite.log('\n8️⃣ CONSOLE ERROR CHECK', 'info');
    TestSuite.log('Check the console for any errors during normal operation', 'warn');
    TestSuite.log('Expected: No JavaScript errors, no 404s, no CORS errors', 'warn');

    // Summary
    TestSuite.summary();

    // Interactive Tests Instructions
    console.log('\n' + '='.repeat(60));
    TestSuite.log('🎯 MANUAL INTERACTIVE TESTS', 'info');
    console.log('='.repeat(60));
    console.log('Please perform these tests manually:\n');
    console.log('1. Click an info button (ℹ️) on any track');
    console.log('   ✓ Modal should open smoothly');
    console.log('   ✓ Track info should display correctly\n');
    console.log('2. While modal is open:');
    console.log('   ✓ Click backdrop → Modal closes');
    console.log('   ✓ Press Escape → Modal closes');
    console.log('   ✓ Click close button → Modal closes\n');
    console.log('3. Play a track, then open modal:');
    console.log('   ✓ Playback should continue uninterrupted\n');
    console.log('4. Switch languages (EN/PL/NL):');
    console.log('   ✓ All text should update');
    console.log('   ✓ Open modal → Description in new language\n');
    console.log('5. Test keyboard navigation:');
    console.log('   ✓ Tab to info button → Press Enter');
    console.log('   ✓ Tab within modal → Focus stays trapped');
    console.log('   ✓ Press Escape → Modal closes\n');
    console.log('6. Test on mobile (resize to < 768px):');
    console.log('   ✓ Modal should be 90% width');
    console.log('   ✓ Layout should be responsive\n');
    console.log('='.repeat(60));

    return TestSuite.results;
  }

  // Auto-run tests
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(runAllTests, 1000); // Wait for tracks to load
    });
  } else {
    setTimeout(runAllTests, 1000);
  }

  // Expose for manual running
  window.runTask8Tests = runAllTests;
  
  console.log('%c💡 TIP: You can re-run tests anytime by typing: runTask8Tests()', 'color: #a78bfa; font-size: 14px');
})();
