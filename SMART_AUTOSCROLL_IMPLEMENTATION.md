# Smart Auto-Scroll Implementation

## Problem
When AI responses were streaming in, the chat would auto-scroll to the bottom continuously, preventing users from scrolling up to read previous messages. This created a frustrating user experience where users couldn't review earlier parts of the conversation while the AI was responding.

## Solution
Implemented a smart auto-scroll system that:
1. Only auto-scrolls when the user is already near the bottom
2. Detects when the user manually scrolls up
3. Stops auto-scrolling when the user is reading previous messages
4. Resumes auto-scrolling when the user scrolls back to the bottom
5. Shows a "scroll to bottom" button when the user has scrolled up

## Implementation Details

### Key Components

**1. Scroll Detection**
- Tracks user's scroll position using refs
- Detects when user scrolls up manually
- Checks if user is near the bottom (within 150px threshold)

**2. Smart Auto-Scroll Logic**
```typescript
// Only auto-scroll if:
// - User hasn't manually scrolled up, OR
// - User is already near the bottom
if (!userScrolledRef.current || isNearBottom()) {
  scrollToBottom();
}
```

**3. Scroll State Management**
- `userScrolledRef`: Tracks if user has manually scrolled up
- `lastScrollTopRef`: Stores previous scroll position to detect scroll direction
- `showScrollButton`: Controls visibility of the "scroll to bottom" button

**4. Visual Indicator**
- Floating button appears when user scrolls up
- Clicking the button smoothly scrolls back to the latest message
- Button has hover effects and smooth animations

### User Experience Flow

1. **AI starts responding**: Auto-scroll is active, user sees new content as it arrives
2. **User scrolls up**: System detects upward scroll, disables auto-scroll
3. **User reads previous messages**: No interruption, scroll position stays where user left it
4. **Scroll button appears**: Visual indicator that new content is arriving below
5. **User clicks button or scrolls down**: Auto-scroll resumes, user sees latest content

## Benefits

✅ **Non-intrusive**: Users can read previous messages without interruption  
✅ **Intuitive**: Auto-scroll works as expected when user is at the bottom  
✅ **Visual feedback**: Button indicates when new content is available  
✅ **Smooth transitions**: All scrolling uses smooth behavior for better UX  
✅ **Performance**: Uses passive event listeners for better scroll performance

## Technical Details

### Threshold
- 150px from bottom is considered "near bottom"
- This provides a comfortable buffer for auto-scroll to engage

### Event Handling
- Scroll events use `{ passive: true }` for better performance
- Cleanup function removes event listeners on unmount

### State Management
- Uses refs for scroll state to avoid unnecessary re-renders
- Only `showScrollButton` uses state since it affects the UI

## Testing

To test the implementation:

1. Start a conversation and wait for AI to respond
2. While AI is typing, scroll up to read previous messages
3. Verify that auto-scroll stops and you can read freely
4. Notice the "scroll to bottom" button appears
5. Click the button or scroll down manually
6. Verify that auto-scroll resumes

## Future Enhancements

Potential improvements:
1. Add unread message count to the scroll button
2. Implement keyboard shortcuts (e.g., End key to jump to bottom)
3. Add smooth scroll animations with easing
4. Show a subtle indicator when new content arrives while scrolled up
