# Testing Quick Start Guide

## 🚀 Quick Test Commands

### Automated Tests (Recommended First)
```bash
node verify-index-navigation-complete.js
```
**Expected Result:** 19/19 tests passed (100%)

### Browser Tests (Visual Verification)
1. Start dev server (if not running):
   ```bash
   python dev_server.py
   ```

2. Open in browser:
   ```
   http://localhost:8000/test-index-navigation-complete.html
   ```

3. Tests run automatically - review results

### Manual Testing (Final Verification)
Open the actual page:
```
http://localhost:8000/index.html
```

**Quick Checks:**
- ✓ Navigation appears at top
- ✓ "Home" link is highlighted
- ✓ Resize to mobile - hamburger menu works
- ✓ Scroll down - header changes appearance
- ✓ Click language buttons - text updates

## 📊 What Each Test Does

### `verify-index-navigation-complete.js`
- Checks file structure
- Verifies navigation.css and navigation.js are linked
- Confirms no inline styles
- Validates all required functions exist
- Tests requirements coverage
- **Run this first** - fastest way to verify implementation

### `test-index-navigation-complete.html`
- Opens index.html in iframe
- Tests navigation loading
- Tests active link highlighting
- Tests mobile menu open/close
- Tests scroll effects
- **Run this second** - automated browser testing

### Manual Browser Testing
- Visual appearance
- Responsive behavior
- Touch interactions
- Cross-browser compatibility
- **Run this last** - final verification

## ✅ Success Criteria

Task 2.5 is complete when:
- [x] Automated tests pass (19/19)
- [ ] Browser tests pass (all green)
- [ ] Manual checks pass (navigation works as expected)

## 🐛 Troubleshooting

### "Cannot find module"
```bash
# Make sure you're in the project root
cd /path/to/igorszuniewicz
node verify-index-navigation-complete.js
```

### "Port already in use"
```bash
# Dev server is already running - that's fine!
# Just open the browser test URL
```

### "Tests fail in browser"
- Check browser console for errors
- Verify navigation.js and navigation.css loaded
- Clear browser cache and reload

## 📁 Test Files Location

```
.kiro/specs/unified-navigation/
├── TASK-2.5-TEST-REPORT.md      # Detailed test report
├── TASK-2.5-SUMMARY.md          # Executive summary
└── TESTING-QUICK-START.md       # This file

Root directory:
├── verify-index-navigation-complete.js    # Automated tests
└── test-index-navigation-complete.html    # Browser tests
```

## 🎯 Next Steps After Testing

1. Review test results
2. Fix any issues found
3. Mark task 2.5 as complete
4. Move to task 3 (about.html migration)

---

**Need Help?** Check the detailed test report: `TASK-2.5-TEST-REPORT.md`
