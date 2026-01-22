# Manual Testing Results - Scrollable Code Blocks

## Test Environment
- **Date**: 2024
- **Browser**: To be tested in Chrome/Firefox/Safari
- **Application URL**: http://localhost:3000 (or 3001)
- **Feature**: Scrollable Code Blocks with Syntax Highlighting

## Test Cases

### 1. Basic Code Block Rendering
**Requirement**: 2.1, 2.2, 2.3, 2.4, 2.5

**Test Steps**:
1. Send a message with a simple Python code block:
   ```
   Here's a Python example:
   ```python
   def hello():
       print("Hello, World!")
   ```
   ```

**Expected Results**:
- [ ] Code block displays with dark background
- [ ] Header shows "Python" label
- [ ] Code uses monospace font
- [ ] Rounded corners and border visible
- [ ] Syntax highlighting applied (keywords in color)

**Actual Results**:


---

### 2. Multiple Programming Languages
**Requirement**: 5.1, 5.3

**Test Steps**:
Test with various languages:

**JavaScript**:
```javascript
const greeting = "Hello";
console.log(greeting);
```

**TypeScript**:
```typescript
interface User {
  name: string;
  age: number;
}
```

**HTML**:
```html
<div class="container">
  <h1>Title</h1>
</div>
```

**CSS**:
```css
.button {
  background: blue;
  color: white;
}
```

**JSON**:
```json
{
  "name": "test",
  "value": 123
}
```

**Bash**:
```bash
#!/bin/bash
echo "Hello"
```

**SQL**:
```sql
SELECT * FROM users WHERE id = 1;
```

**Expected Results**:
- [ ] Each language displays correct label in header
- [ ] Syntax highlighting appropriate for each language
- [ ] No errors or crashes

**Actual Results**:


---

### 3. Horizontal Scrolling
**Requirement**: 3.1, 6.3

**Test Steps**:
1. Send a message with very long lines:
   ```
   ```python
   def very_long_function_name_that_exceeds_container_width(parameter1, parameter2, parameter3, parameter4, parameter5, parameter6, parameter7, parameter8):
       return "This is a very long string that should definitely exceed the container width and trigger horizontal scrolling behavior"
   ```
   ```

**Expected Results**:
- [ ] Horizontal scrollbar appears
- [ ] Can scroll horizontally to see full line
- [ ] No text wrapping or truncation
- [ ] Code formatting preserved during scroll
- [ ] Header remains fixed at top while scrolling

**Actual Results**:


---

### 4. Vertical Scrolling
**Requirement**: 3.2, 3.3

**Test Steps**:
1. Send a message with many lines (>30 lines):
   ```
   ```python
   def function1():
       pass
   
   def function2():
       pass
   
   # ... (repeat for 30+ lines)
   ```
   ```

**Expected Results**:
- [ ] Vertical scrollbar appears when content exceeds ~500px
- [ ] Can scroll vertically to see all code
- [ ] Indentation preserved during scroll
- [ ] Scrollbar styled for dark theme

**Actual Results**:


---

### 5. Copy Button Functionality
**Requirement**: 4.1, 4.2, 4.3, 4.4, 4.5

**Test Steps**:
1. Send a code block
2. Click the copy button
3. Paste into a text editor

**Expected Results**:
- [ ] Copy button visible in header
- [ ] Button shows "Copied" feedback for 2 seconds
- [ ] Pasted content matches original code exactly
- [ ] No formatting or styling in pasted content
- [ ] Raw code copied (no HTML)

**Actual Results**:


---

### 6. Multiple Code Blocks in One Message
**Requirement**: 1.4, 7.1, 7.2

**Test Steps**:
1. Send a message with multiple code blocks:
   ```
   First example in Python:
   ```python
   print("Hello")
   ```
   
   And here's JavaScript:
   ```javascript
   console.log("Hello");
   ```
   ```

**Expected Results**:
- [ ] Both code blocks render separately
- [ ] Each has its own header and language label
- [ ] Each has its own copy button
- [ ] Proper spacing between blocks
- [ ] Order preserved

**Actual Results**:


---

### 7. Mixed Content (Code + Markdown)
**Requirement**: 7.1, 7.2, 7.3

**Test Steps**:
1. Send a message mixing code with other markdown:
   ```
   # Header
   
   Some text with **bold** and *italic*.
   
   ```python
   def example():
       pass
   ```
   
   - List item 1
   - List item 2
   ```

**Expected Results**:
- [ ] All elements render in correct order
- [ ] Headers, lists, and paragraphs display correctly
- [ ] Code block integrates seamlessly
- [ ] Proper spacing maintained

**Actual Results**:


---

### 8. Empty Code Block
**Requirement**: 6.1

**Test Steps**:
1. Send an empty code block:
   ```
   ```python
   ```
   ```

**Expected Results**:
- [ ] Header displays with "Python" label
- [ ] Placeholder text: "Empty code block"
- [ ] No errors or crashes
- [ ] Consistent height and styling

**Actual Results**:


---

### 9. Special Characters and Unicode
**Requirement**: 6.2

**Test Steps**:
1. Send code with special characters:
   ```
   ```python
   # Unicode: 🚀 💻 ✨
   text = "Special chars: <>&\"'"
   emoji = "😀"
   ```
   ```

**Expected Results**:
- [ ] All characters display correctly
- [ ] Emojis render properly
- [ ] Special HTML chars not escaped incorrectly
- [ ] No encoding issues

**Actual Results**:


---

### 10. Tab Characters
**Requirement**: 6.4

**Test Steps**:
1. Send code with tabs:
   ```
   ```python
   def example():
   	if True:
   		print("Tabs")
   ```
   ```

**Expected Results**:
- [ ] Tabs render with consistent spacing (4 spaces)
- [ ] Indentation looks correct
- [ ] Mixed tabs/spaces handled properly

**Actual Results**:


---

### 11. Unsupported Language
**Requirement**: 5.5

**Test Steps**:
1. Send code with invalid language:
   ```
   ```fakeLanguage
   some code here
   ```
   ```

**Expected Results**:
- [ ] No errors or crashes
- [ ] Code displays in monospace
- [ ] Header shows language name
- [ ] Falls back to plain text rendering

**Actual Results**:


---

### 12. No Language Specified
**Requirement**: 1.3

**Test Steps**:
1. Send code without language:
   ```
   ```
   some code here
   ```
   ```

**Expected Results**:
- [ ] Defaults to "text" or "Code" label
- [ ] Code displays correctly
- [ ] No errors

**Actual Results**:


---

### 13. Large Code Block Performance
**Requirement**: 8.1, 8.2, 8.3, 8.4, 8.5

**Test Steps**:
1. Send a very large code block (100+ lines)
2. Scroll through it
3. Check UI responsiveness

**Expected Results**:
- [ ] Renders without blocking UI
- [ ] Scrolling is smooth
- [ ] No lag or stuttering
- [ ] Syntax highlighting applied efficiently

**Actual Results**:


---

### 14. Dark Theme Consistency
**Requirement**: 2.1, 2.4, 2.5, 6.5

**Test Steps**:
1. Review code block styling
2. Compare with rest of application

**Expected Results**:
- [ ] Background color matches theme
- [ ] Text colors have good contrast
- [ ] Scrollbar styled for dark theme
- [ ] Border colors consistent
- [ ] Overall aesthetic matches app

**Actual Results**:


---

### 15. User Message Handling
**Requirement**: 7.5

**Test Steps**:
1. Send a user message with code fence syntax
2. Check if it's processed as markdown

**Expected Results**:
- [ ] User message displays as plain text
- [ ] Code fences NOT converted to code blocks
- [ ] Markdown NOT processed for user messages

**Actual Results**:


---

## Summary

### Tests Passed: __ / 15
### Tests Failed: __ / 15

### Critical Issues Found:


### Minor Issues Found:


### Recommendations:


---

## Sign-off

**Tester**: _______________
**Date**: _______________
**Status**: [ ] PASS [ ] FAIL [ ] NEEDS WORK
