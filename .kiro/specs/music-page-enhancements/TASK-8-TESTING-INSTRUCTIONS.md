# Task 8: Testing Instructions

## Automated Tests

### Method 1: Run in Browser Console (Recommended)

1. Open `music.html` in your browser
2. Wait for the page to fully load (tracks should appear)
3. Open Browser DevTools (F12)
4. Go to the Console tab
5. Copy and paste the contents of `verify-task-8-integration.js`
6. Press Enter
7. Tests will run automatically and display results

**OR** if you have the script loaded:

1. Open `music.html` in browser
2. Open DevTools Console (F12)
3. Type: `runTask8Tests()`
4. Press Enter

### Method 2: Add Script to Page Temporarily

1. Open `music.html` in a text editor
2. Before the closing `</body>` tag, add:
   ```html
   <script src="verify-task-8-integration.js"></script>
   ```
3. Save and open `music.html` in browser
4. Open DevTools Console (F12)
5. Tests will run automatically after 1 second

### Method 3: Use Local Server (For Full Test Suite)

If you want to run the full HTML test suite (`test-task-8-integration.html`):

1. Install a local server (choose one):
   - **Python**: `python -m http.server 8000`
   - **Node.js**: `npx http-server -p 8000`
   - **VS Code**: Install "Live Server" extension

2. Navigate to: `http://localhost:8000/test-task-8-integration.html`

3. Click "Run All Tests" button

---

## Manual Testing Checklist

Use the comprehensive checklist: `.kiro/specs/music-page-enhancements/TASK-8-TEST-CHECKLIST.md`

### Quick Manual Tests (5 minutes)

1. **Translation Test**
   - Click EN, PL, NL buttons
   - Verify all text changes

2. **Modal Test**
   - Click info button (ℹ️) on any track
   - Modal should open with track details
   - Click backdrop to close
   - Press Escape to close
   - Click X button to close

3. **Player Integration Test**
   - Play a track
   - Open modal while playing
   - Verify playback continues
   - Close modal
   - Playback should still continue

4. **Language + Modal Test**
   - Open modal
   - Switch language while modal is open
   - Description should update

5. **Keyboard Navigation Test**
   - Tab to info button
   - Press Enter to open modal
   - Tab within modal (focus should stay trapped)
   - Press Escape to close

6. **Responsive Test**
   - Resize browser to < 768px
   - Open modal
   - Should be 90% width and readable

---

## Expected Results

### Automated Tests
- **Total Tests**: ~35
- **Expected Pass Rate**: 100%
- **Common Issues**:
  - If tests fail due to "tracks not loaded", wait longer and re-run
  - If translation tests fail, check that `locales/music.json` exists

### Manual Tests
All interactions should be:
- ✅ Smooth (no lag)
- ✅ Responsive (< 300ms)
- ✅ Accessible (keyboard works)
- ✅ No console errors

---

## Browser Testing Matrix

Test on these browsers (minimum):

| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | Latest  | ⬜ |
| Firefox | Latest  | ⬜ |
| Safari  | Latest  | ⬜ |
| Edge    | Latest  | ⬜ |

---

## Troubleshooting

### Tests Don't Run
- **Issue**: Script doesn't execute
- **Fix**: Make sure page is fully loaded, wait 2-3 seconds

### "tracks is not defined"
- **Issue**: Tracks haven't loaded yet
- **Fix**: Wait for tracks to load, then run `runTask8Tests()` manually

### CORS Errors
- **Issue**: Opening HTML file directly (file://)
- **Fix**: Use a local server (see Method 3 above)

### Modal Doesn't Open
- **Issue**: JavaScript error or tracks not loaded
- **Fix**: Check console for errors, verify tracks.json loads

---

## Requirements Coverage

This test suite covers the following requirements:

- **1.1, 1.2, 1.3**: Translation system
- **1.4**: Language persistence
- **2.1, 2.2, 2.3, 2.4**: Modal functionality
- **2.5**: Styling and animations
- **3.1, 3.2, 3.3**: Responsive behavior
- **3.4, 3.5**: Accessibility
- **4.1, 4.2, 4.3, 4.4**: Integration with existing code

---

## Reporting Issues

If you find issues, document:

1. **Browser**: Name and version
2. **OS**: Operating system
3. **Steps to Reproduce**: Exact steps
4. **Expected**: What should happen
5. **Actual**: What actually happened
6. **Console Errors**: Any errors in DevTools
7. **Screenshots**: If applicable

---

## Sign-off

Once all tests pass:

- [ ] Automated tests: 100% pass rate
- [ ] Manual tests: All scenarios work
- [ ] Cross-browser: Tested on 3+ browsers
- [ ] No console errors during normal operation
- [ ] Responsive: Works on mobile and desktop
- [ ] Accessible: Keyboard navigation works

**Tester**: _______________  
**Date**: _______________  
**Status**: ⬜ APPROVED ⬜ NEEDS WORK
