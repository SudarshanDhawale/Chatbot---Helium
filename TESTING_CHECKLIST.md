# Testing Checklist for API Key Modal Feature

## Pre-Testing Setup
- [ ] Clear browser localStorage: `localStorage.clear()` in console
- [ ] Have a valid Helium API key ready (format: `he-xxxxx...`)
- [ ] Have an invalid API key for error testing

## Test 1: First Visit Experience
**Steps:**
1. Clear localStorage
2. Navigate to the application homepage
3. Observe the modal appears automatically

**Expected Results:**
- [ ] Modal appears with gradient blue header
- [ ] Input field is focused and ready for input
- [ ] "Get your API key from app.he2.ai" link is visible
- [ ] Footer text about local storage is visible
- [ ] Modal cannot be dismissed by clicking outside (no close button)

## Test 2: Invalid API Key Format
**Steps:**
1. Enter an API key that doesn't start with "he-" (e.g., "invalid-key")
2. Click "Continue"

**Expected Results:**
- [ ] Error message appears: "Invalid API key format. API key must start with 'he-'"
- [ ] Error has red background with icon
- [ ] Button remains enabled for retry

## Test 3: Empty API Key
**Steps:**
1. Leave input field empty
2. Click "Continue"

**Expected Results:**
- [ ] Error message appears: "Please enter an API key"
- [ ] Button remains enabled for retry

## Test 4: Valid API Key Format
**Steps:**
1. Enter a properly formatted key (e.g., "he-test123456789")
2. Click "Continue"

**Expected Results:**
- [ ] Modal closes immediately (no loading state)
- [ ] API key is stored in localStorage (check: `localStorage.getItem('helium_api_key')`)
- [ ] Chat interface is ready to use

## Test 5: First Message with Valid Key
**Steps:**
1. After entering a valid API key, send a test message
2. Observe the response

**Expected Results:**
- [ ] Message is sent successfully
- [ ] Response is received from Helium API
- [ ] No errors occur

## Test 6: First Message with Invalid Key
**Steps:**
1. Manually set an invalid key: `localStorage.setItem('helium_api_key', 'he-invalidkey123')`
2. Refresh the page
3. Try to send a message

**Expected Results:**
- [ ] Message fails to send
- [ ] Error message appears
- [ ] Modal reappears automatically
- [ ] User can enter a correct key

## Test 6: Persistence After Refresh
**Steps:**
1. After successful validation, refresh the page
2. Observe the application loads

**Expected Results:**
- [ ] Modal does NOT appear
- [ ] Chat interface loads normally
- [ ] Can send messages without re-entering API key

## Test 7: Invalid Key During Usage
**Steps:**
1. Manually set an invalid key in localStorage: `localStorage.setItem('helium_api_key', 'he-invalid')`
2. Refresh the page
3. Try to send a chat message

**Expected Results:**
- [ ] Message fails to send
- [ ] Modal reappears automatically
- [ ] Error message indicates invalid API key
- [ ] User must enter valid key to continue

## Test 8: File Download with API Key
**Steps:**
1. Ensure valid API key is set
2. Send a message that generates a file (e.g., "create a simple text file")
3. Click to download the generated file

**Expected Results:**
- [ ] File downloads successfully
- [ ] No API key errors occur

## Test 9: Thread Navigation
**Steps:**
1. Create a new conversation
2. Navigate to a thread URL directly
3. Observe behavior

**Expected Results:**
- [ ] If no API key: Modal appears
- [ ] If valid API key: Thread loads normally
- [ ] All thread functionality works

## Test 10: Multiple Browser Tabs
**Steps:**
1. Open application in one tab with valid API key
2. Open application in another tab (same browser)

**Expected Results:**
- [ ] Second tab uses the same stored API key
- [ ] No modal appears in second tab
- [ ] Both tabs function independently

## Test 11: Visual Design Check
**Steps:**
1. Display the modal
2. Check all visual elements

**Expected Results:**
- [ ] Modal is centered on screen
- [ ] Background has blur effect
- [ ] Header has blue gradient
- [ ] Input field has proper focus styling (blue ring)
- [ ] Button has hover effect
- [ ] Error messages are clearly visible
- [ ] Footer text is readable
- [ ] Modal is responsive on mobile screens

## Test 12: Keyboard Navigation
**Steps:**
1. Display the modal
2. Use Tab key to navigate
3. Press Enter to submit

**Expected Results:**
- [ ] Input field receives focus automatically
- [ ] Tab moves to submit button
- [ ] Enter key submits the form
- [ ] Escape key does NOT close modal (by design)

## Browser Compatibility Testing
Test the above scenarios in:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

## Performance Testing
- [ ] Modal appears within 100ms of page load
- [ ] Validation completes within 3 seconds
- [ ] No console errors during any operation
- [ ] No memory leaks after multiple open/close cycles

## Security Testing
- [ ] API key is stored in localStorage (not sessionStorage or cookies)
- [ ] API key is not visible in network requests (except to Helium API)
- [ ] API key is not logged to console
- [ ] API key is sent via secure header (`x-helium-api-key`)

## Edge Cases
- [ ] Very long API key (100+ characters)
- [ ] API key with special characters
- [ ] Rapid clicking of submit button
- [ ] Network timeout during validation
- [ ] Browser back/forward navigation
- [ ] Page reload during validation

## Cleanup
After testing:
- [ ] Clear test data from localStorage
- [ ] Close all test tabs
- [ ] Document any issues found
