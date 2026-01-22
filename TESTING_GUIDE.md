# Manual Testing Guide - Scrollable Code Blocks

## Quick Start

### Option 1: Standalone HTML Test (Fastest)
1. Open `test-code-blocks.html` in your browser
2. Review each test section visually
3. Click copy buttons to test functionality
4. Check off items in the visual checklists

### Option 2: Full Application Test (Most Comprehensive)
1. Ensure dev server is running: `npm run dev`
2. Open http://localhost:3000 (or 3001) in browser
3. Use test messages from `TEST_MESSAGES.md`
4. Record results in `MANUAL_TEST_RESULTS.md`

---

## Testing Checklist

### Pre-Testing Setup
- [ ] Development server is running
- [ ] Browser console is open (F12)
- [ ] Test files are ready (TEST_MESSAGES.md)
- [ ] Results document is open (MANUAL_TEST_RESULTS.md)

### Core Functionality Tests

#### 1. Basic Rendering (5 min)
- [ ] Test 1: Basic Python code block
- [ ] Test 2: JavaScript code block
- [ ] Test 3: TypeScript code block
- [ ] Verify: Dark background, monospace font, language labels

#### 2. Syntax Highlighting (5 min)
- [ ] Python keywords (def, return, if, etc.)
- [ ] JavaScript keywords (const, function, etc.)
- [ ] HTML tags and attributes
- [ ] CSS properties and values
- [ ] JSON keys and values
- [ ] Comments styled differently
- [ ] Strings in orange/brown color
- [ ] Keywords in blue color

#### 3. Scrolling Behavior (5 min)
- [ ] Test horizontal scroll with long lines
- [ ] Test vertical scroll with many lines (>30)
- [ ] Verify scrollbars appear only when needed
- [ ] Verify header stays fixed during scroll
- [ ] Check scrollbar styling (dark theme)

#### 4. Copy Functionality (3 min)
- [ ] Click copy button
- [ ] Verify "Copied" feedback appears
- [ ] Verify feedback disappears after 2 seconds
- [ ] Paste into text editor
- [ ] Verify pasted content is raw code (no formatting)
- [ ] Test with multiple code blocks

#### 5. Multiple Code Blocks (3 min)
- [ ] Send message with 2+ code blocks
- [ ] Verify each renders independently
- [ ] Verify each has own copy button
- [ ] Verify proper spacing between blocks

#### 6. Mixed Content (3 min)
- [ ] Send message with headers + code + lists
- [ ] Verify all elements render in order
- [ ] Verify proper spacing
- [ ] Verify no layout issues

#### 7. Edge Cases (5 min)
- [ ] Empty code block shows placeholder
- [ ] No language specified defaults to "Code" or "text"
- [ ] Unsupported language doesn't crash
- [ ] Special characters display correctly (🚀 💻 <>&"')
- [ ] Unicode/emojis render properly
- [ ] Tabs render with consistent spacing

#### 8. Performance (3 min)
- [ ] Send large code block (100+ lines)
- [ ] Verify no UI lag
- [ ] Verify smooth scrolling
- [ ] Check browser console for errors
- [ ] Monitor memory usage (if possible)

#### 9. Theme Consistency (2 min)
- [ ] Background color matches app theme
- [ ] Text colors have good contrast
- [ ] Border colors consistent
- [ ] Scrollbar styled appropriately
- [ ] Overall aesthetic matches

#### 10. User Messages (2 min)
- [ ] Send user message with code fence syntax
- [ ] Verify it displays as plain text
- [ ] Verify markdown NOT processed

---

## Common Issues to Watch For

### Visual Issues
- ❌ Code blocks too wide/narrow
- ❌ Text color too light/dark (poor contrast)
- ❌ Scrollbars not styled or too prominent
- ❌ Spacing issues between elements
- ❌ Border/corner radius inconsistent

### Functional Issues
- ❌ Copy button doesn't work
- ❌ Copy includes HTML/formatting
- ❌ Scrolling doesn't work
- ❌ Syntax highlighting missing
- ❌ Language label incorrect/missing

### Performance Issues
- ❌ Lag when rendering large blocks
- ❌ Stuttering during scroll
- ❌ Memory leaks (check DevTools)
- ❌ Console errors

### Edge Case Issues
- ❌ Crashes with empty blocks
- ❌ Errors with special characters
- ❌ Problems with unsupported languages
- ❌ User messages processed as markdown

---

## Browser Testing Matrix

Test in multiple browsers if possible:

| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| Chrome  | Latest  | [ ]    |       |
| Firefox | Latest  | [ ]    |       |
| Safari  | Latest  | [ ]    |       |
| Edge    | Latest  | [ ]    |       |

---

## Reporting Issues

When you find an issue, document:

1. **What you did**: Exact steps to reproduce
2. **What you expected**: Expected behavior
3. **What happened**: Actual behavior
4. **Browser/OS**: Environment details
5. **Screenshot**: If visual issue
6. **Console errors**: If any errors appear

Example:
```
Issue: Copy button doesn't work in Safari

Steps:
1. Open app in Safari 17.2
2. Send Python code block
3. Click copy button

Expected: Code copied to clipboard
Actual: Nothing happens, no feedback

Console: TypeError: navigator.clipboard is undefined
```

---

## Quick Visual Inspection

For rapid testing, check these visually:

1. **Open test-code-blocks.html**
2. **Scroll through all tests**
3. **Look for obvious issues**:
   - Broken layout
   - Missing colors
   - Weird spacing
   - Broken buttons
4. **Test copy buttons**
5. **Test scrolling**

This should take ~5 minutes and catch major issues.

---

## Sign-off Criteria

The feature is ready when:

- ✅ All 15 test cases pass
- ✅ No console errors
- ✅ Copy functionality works
- ✅ Scrolling works smoothly
- ✅ Syntax highlighting applied
- ✅ Theme consistent
- ✅ No performance issues
- ✅ Edge cases handled gracefully

---

## Time Estimate

- **Quick test** (HTML only): 5-10 minutes
- **Full test** (all cases): 30-40 minutes
- **Comprehensive** (multiple browsers): 1-2 hours

---

## Next Steps After Testing

1. **Document results** in MANUAL_TEST_RESULTS.md
2. **Take screenshots** of any issues
3. **Report findings** to the team
4. **Create bug tickets** for issues found
5. **Retest** after fixes

---

## Tips for Effective Testing

- 🎯 **Focus on user experience**: Does it feel good to use?
- 🔍 **Look for edge cases**: Try to break it
- 📝 **Document everything**: Even small issues
- 🖥️ **Test different screen sizes**: Responsive?
- ⚡ **Check performance**: Is it fast?
- 🎨 **Verify aesthetics**: Does it look good?

---

## Questions to Ask

- Does this make code easier to read?
- Is the copy button intuitive?
- Are the scrollbars discoverable?
- Does it match the app's design language?
- Would I want to use this feature?

---

Good luck with testing! 🚀
