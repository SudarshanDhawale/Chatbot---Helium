# Implementation Plan: Chat UI Redesign

## Overview

This implementation plan breaks down the chat UI redesign into incremental, testable steps. The approach follows a phased migration strategy: starting with theme configuration, then updating core components, enhancing the sidebar, adding new components, implementing animations, and finally polishing responsive behavior. Each phase builds on the previous one, ensuring the application remains functional throughout the redesign.

## Tasks

- [x] 1. Update theme configuration with dark color palette
  - Update `tailwind.config.ts` with new color definitions (navy-950, navy-900, navy-800, navy-700, blue-accent colors, text colors)
  - Add custom spacing values (18, 88) and border radius values (xl, 2xl, 3xl)
  - Add backdrop blur utilities
  - Update `src/app/globals.css` with CSS custom properties for the new theme
  - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [ ]* 1.1 Write unit tests for theme configuration
  - Test that all required color values are defined in Tailwind config
  - Test that spacing and border radius values are available
  - _Requirements: 1.3_

- [ ] 2. Update ChatMessage component styling
  - [x] 2.1 Update message container styling
    - Increase border-radius to rounded-2xl (16px)
    - Update padding to px-5 py-4 (20px horizontal, 16px vertical)
    - Add backdrop-blur-md effect to message backgrounds
    - Update background colors to use new navy-800 with opacity
    - _Requirements: 4.1, 4.2, 4.6_
  
  - [ ]* 2.2 Write property test for message container styling
    - **Property 3: Message Container Styling**
    - **Validates: Requirements 4.1, 4.2, 4.6, 4.7**
  
  - [x] 2.3 Enhance message header (sender name and timestamp)
    - Update font size to text-xs for sender and timestamp
    - Adjust opacity to 70% for subtle appearance
    - Ensure proper spacing between sender and timestamp
    - _Requirements: 4.7_
  
  - [x] 2.4 Update message alignment and colors by role
    - Ensure user messages are right-aligned with appropriate background
    - Ensure assistant messages are left-aligned with appropriate background
    - Update text colors to use text-primary from theme
    - _Requirements: 4.3, 4.4_
  
  - [ ]* 2.5 Write property test for message alignment by role
    - **Property 4: Message Alignment by Role**
    - **Validates: Requirements 4.3, 4.4**

- [x] 3. Update ChatContainer component styling
  - Update background to navy-900
  - Adjust max-width to 800px (max-w-3xl) for optimal reading
  - Ensure consistent message spacing (mb-3 or mb-4 for 12-16px)
  - Update scrollbar styling to be hidden but functional
  - Enhance welcome message styling with updated colors
  - _Requirements: 4.5, 1.1_

- [ ]* 3.1 Write property test for message spacing consistency
  - **Property 5: Message Spacing Consistency**
  - **Validates: Requirements 4.5**

- [ ] 4. Update ChatInput component styling
  - [x] 4.1 Redesign input container
    - Update to rounded-3xl (24px border radius)
    - Add backdrop-blur-md with semi-transparent background
    - Update padding and spacing for better visual balance
    - _Requirements: 7.1, 7.5_
  
  - [x] 4.2 Style attachment button
    - Add paperclip or plus icon on the left side
    - Style with hover states and transitions
    - Position with appropriate spacing from input field
    - _Requirements: 7.2_
  
  - [x] 4.3 Style send button
    - Add arrow or send icon on the right side
    - Apply blue-accent color for primary action
    - Add hover and disabled states
    - Implement disabled state when input is empty
    - _Requirements: 7.3, 7.4_
  
  - [ ]* 4.4 Write property test for input state button behavior
    - **Property 17: Input State Button Behavior**
    - **Validates: Requirements 7.4**
  
  - [x] 4.5 Implement auto-expanding textarea
    - Configure textarea to expand vertically as content grows
    - Set maximum height to 6 lines
    - Ensure smooth height transitions
    - _Requirements: 7.6_
  
  - [ ]* 4.6 Write property test for input auto-expansion
    - **Property 18: Input Auto-Expansion**
    - **Validates: Requirements 7.6**
  
  - [x] 4.7 Add file attachment preview chips
    - Display file preview chips when files are selected
    - Style chips with file name and remove button
    - Position chips above the input field
    - _Requirements: 7.7_
  
  - [ ]* 4.8 Write property test for file attachment previews
    - **Property 19: File Attachment Previews**
    - **Validates: Requirements 7.7**

- [x] 5. Checkpoint - Ensure core components are styled correctly
  - Verify all messages display with new styling
  - Verify input area has new design
  - Test that theme colors are applied consistently
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Enhance ConversationSidebar component
  - [x] 6.1 Update sidebar background and structure
    - Change background to navy-950 for darker appearance
    - Update border colors to navy-700
    - Adjust padding and spacing throughout
    - _Requirements: 1.2, 2.1_
  
  - [x] 6.2 Update conversation list item styling
    - Enhance hover states with subtle background change
    - Update selected state with distinct background and border
    - Ensure text truncation with ellipsis for long titles
    - Update timestamp and message count styling
    - _Requirements: 3.2, 3.4, 3.5_
  
  - [ ]* 6.3 Write property tests for conversation list
    - **Property 6: Conversation List Item Structure**
    - **Property 7: Conversation Selection Highlighting**
    - **Property 9: Text Truncation with Ellipsis**
    - **Validates: Requirements 3.1, 3.2, 3.5**
  
  - [x] 6.4 Ensure conversation list ordering
    - Verify conversations are sorted by lastUpdated in descending order
    - _Requirements: 3.3_
  
  - [ ]* 6.5 Write property test for conversation list ordering
    - **Property 8: Conversation List Ordering**
    - **Validates: Requirements 3.3**
  
  - [x] 6.6 Update sidebar animations
    - Ensure smooth slide-in/slide-out transitions (300ms ease-in-out)
    - Update overlay backdrop styling
    - _Requirements: 2.6, 2.7_

- [x] 7. Create SearchBar component
  - Create new file `src/components/sidebar/SearchBar.tsx`
  - Implement search input with icon
  - Style with rounded corners and appropriate padding
  - Add placeholder text "Search conversations..."
  - Position below logo in sidebar
  - _Requirements: 2.2_

- [ ]* 7.1 Write unit tests for SearchBar component
  - Test component renders with correct structure
  - Test onChange handler is called when typing
  - Test placeholder text is displayed
  - _Requirements: 2.2_

- [x] 8. Create NavigationSection component
  - Create new file `src/components/sidebar/NavigationSection.tsx`
  - Implement navigation items: Settings, My Projects, Chats, Templates, Teams
  - Style navigation items with icons and labels
  - Add active state styling for current section
  - Add hover states with smooth transitions
  - Position below search bar in sidebar
  - _Requirements: 2.3_

- [ ]* 8.1 Write unit tests for NavigationSection component
  - Test component renders all navigation items
  - Test active state is applied correctly
  - Test onClick handlers are called
  - _Requirements: 2.3_

- [x] 9. Add bottom CTA button to sidebar
  - Add call-to-action button at bottom of sidebar
  - Style with blue-accent background
  - Add text like "Update the plan" or "New Project"
  - Position with fixed or sticky positioning at bottom
  - _Requirements: 2.5_

- [x] 10. Create MessageActions component
  - Create new file `src/components/chat/MessageActions.tsx`
  - Implement thumbs up, thumbs down, and copy buttons
  - Use icon-only buttons with tooltips
  - Add hover state to show/hide actions
  - Position consistently relative to message content
  - Implement visual feedback on button click
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 10.1 Write property tests for message actions
  - **Property 15: Message Actions on Hover**
  - **Property 16: Message Action Visual Feedback**
  - **Validates: Requirements 6.1, 6.2, 6.3**

- [x] 11. Integrate MessageActions into ChatMessage
  - Import MessageActions component
  - Add hover state tracking to ChatMessage
  - Render MessageActions for assistant messages only
  - Implement action handlers (thumbs up/down, copy)
  - Ensure actions are hidden when not hovering
  - _Requirements: 6.1, 6.5_

- [ ] 12. Update header with user profile section
  - [x] 12.1 Add user avatar component
    - Display circular avatar in top right corner
    - Set size to 32-40px diameter
    - Add placeholder image or initials if no avatar URL
    - _Requirements: 8.1, 8.4_
  
  - [x] 12.2 Add score/status indicator
    - Display score indicator next to avatar (e.g., "6/75")
    - Style with appropriate font size and color
    - _Requirements: 8.2_
  
  - [x] 12.3 Implement avatar dropdown menu
    - Add click handler to toggle dropdown visibility
    - Create dropdown menu with account options
    - Style dropdown with dark theme colors
    - Position dropdown below avatar
    - _Requirements: 8.3_
  
  - [ ]* 12.4 Write property test for avatar click interaction
    - **Property 20: Avatar Click Interaction**
    - **Validates: Requirements 8.3**

- [x] 13. Checkpoint - Ensure all new components are integrated
  - Verify sidebar has search bar, navigation, and CTA button
  - Verify message actions appear on hover
  - Verify user profile section is displayed
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Implement responsive behavior
  - [x] 14.1 Update sidebar responsive behavior
    - On mobile (<1024px), sidebar should overlay chat area
    - On desktop (≥1024px), sidebar can dock to left side
    - Ensure smooth transitions between responsive states
    - _Requirements: 9.1, 9.2_
  
  - [ ]* 14.2 Write property test for responsive sidebar behavior
    - **Property 21: Responsive Sidebar Behavior**
    - **Validates: Requirements 9.1, 9.2**
  
  - [x] 14.3 Update chat area responsive width
    - Adjust max-width based on viewport size
    - Ensure optimal reading width on all screen sizes
    - _Requirements: 9.3_
  
  - [ ]* 14.4 Write property test for responsive chat width
    - **Property 22: Responsive Chat Width**
    - **Validates: Requirements 9.3**
  
  - [x] 14.5 Prevent horizontal overflow
    - Ensure message containers don't cause horizontal scrolling
    - Test on narrow viewports (320px, 375px, 414px)
    - Add word-break or overflow-wrap if needed
    - _Requirements: 9.4_
  
  - [ ]* 14.6 Write property test for no horizontal overflow
    - **Property 23: No Horizontal Overflow**
    - **Validates: Requirements 9.4**
  
  - [x] 14.7 Ensure input area remains fixed at bottom
    - Verify input area positioning on all screen sizes
    - Test with different content heights
    - _Requirements: 9.5_
  
  - [ ]* 14.8 Write property test for fixed input positioning
    - **Property 24: Fixed Input Positioning**
    - **Validates: Requirements 9.5**
  
  - [x] 14.9 Hide non-essential UI on narrow viewports
    - Hide or collapse secondary information on mobile
    - Ensure core functionality remains accessible
    - _Requirements: 9.6_

- [ ] 15. Implement smooth animations and transitions
  - [x] 15.1 Add transition utilities to Tailwind config
    - Define transition durations (fast: 150ms, normal: 200ms, slow: 300ms)
    - Define easing functions (ease-in-out as default)
    - _Requirements: 10.1, 10.3, 10.4_
  
  - [x] 15.2 Apply transitions to interactive elements
    - Add hover transitions to buttons, links, and interactive elements
    - Ensure consistent timing (150-200ms)
    - Use ease-in-out easing for natural feel
    - _Requirements: 10.3, 10.4_
  
  - [ ]* 15.3 Write property test for animation timing consistency
    - **Property 25: Animation Timing Consistency**
    - **Validates: Requirements 2.6, 2.7, 10.1, 10.2, 10.3, 10.4**
  
  - [x] 15.4 Implement message fade-in animation
    - Add fade-in animation when new messages appear
    - Use CSS animation or Framer Motion
    - Keep animation subtle and quick (200-300ms)
    - _Requirements: 10.2_
  
  - [x] 15.5 Implement smooth scroll behavior
    - Add smooth scroll to scrollToBottom function
    - Ensure smooth scrolling when navigating to new messages
    - _Requirements: 10.5_
  
  - [ ]* 15.6 Write property test for smooth scroll behavior
    - **Property 26: Smooth Scroll Behavior**
    - **Validates: Requirements 10.5**
  
  - [x] 15.7 Add prefers-reduced-motion support
    - Detect prefers-reduced-motion media query
    - Disable animations when user prefers reduced motion
    - Ensure functionality works without animations
    - _Requirements: 10.6 (accessibility)_

- [ ] 16. Implement visual hierarchy and spacing
  - [x] 16.1 Audit and update spacing throughout application
    - Ensure all spacing uses defined units (4px, 8px, 12px, 16px, 24px, 32px)
    - Update any arbitrary spacing values to use Tailwind spacing scale
    - _Requirements: 11.1_
  
  - [ ]* 16.2 Write property test for spacing unit consistency
    - **Property 27: Spacing Unit Consistency**
    - **Validates: Requirements 11.1**
  
  - [x] 16.3 Verify visual hierarchy through color
    - Ensure sidebar is darker than chat area
    - Test color contrast between sections
    - _Requirements: 11.2_
  
  - [ ]* 16.4 Write property test for visual hierarchy through color
    - **Property 28: Visual Hierarchy through Color**
    - **Validates: Requirements 11.2**
  
  - [x] 16.5 Implement font size hierarchy
    - Update headings to 18-24px range
    - Update body text to 14-16px range
    - Update captions to 12px
    - _Requirements: 11.3_
  
  - [ ]* 16.6 Write property test for font size hierarchy
    - **Property 29: Font Size Hierarchy**
    - **Validates: Requirements 11.3**
  
  - [x] 16.7 Implement font weight distinction
    - Use font-semibold or font-bold for primary text
    - Use font-normal or font-medium for secondary text
    - _Requirements: 11.4_
  
  - [ ]* 16.8 Write property test for font weight distinction
    - **Property 30: Font Weight Distinction**
    - **Validates: Requirements 11.4**
  
  - [x] 16.9 Add borders and dividers to major sections
    - Add subtle borders between header, chat area, and input
    - Use navy-700 for border colors
    - _Requirements: 11.6_

- [ ] 17. Enhance loading and status indicators
  - [x] 17.1 Update typing indicator animation
    - Ensure bouncing dots animation is smooth
    - Update colors to match new theme
    - _Requirements: 12.1_
  
  - [ ]* 17.2 Write property test for loading state indicators
    - **Property 31: Loading State Indicators**
    - **Validates: Requirements 12.1**
  
  - [x] 17.3 Add file upload progress indicator
    - Display progress bar or spinner during file upload
    - Show percentage or file name being uploaded
    - _Requirements: 12.2_
  
  - [ ]* 17.4 Write property test for upload progress indication
    - **Property 32: Upload Progress Indication**
    - **Validates: Requirements 12.2**
  
  - [x] 17.5 Implement button disabled states during processing
    - Disable send button while message is sending
    - Disable action buttons while processing
    - Add visual indication of disabled state
    - _Requirements: 12.3_
  
  - [ ]* 17.6 Write property test for processing state button disabling
    - **Property 33: Processing State Button Disabling**
    - **Validates: Requirements 12.3**
  
  - [x] 17.7 Ensure all loading indicators have animations
    - Audit all loading states for animation presence
    - Add animations where missing (pulsing, spinning, bouncing)
    - _Requirements: 12.4_
  
  - [ ]* 17.8 Write property test for loading animation presence
    - **Property 34: Loading Animation Presence**
    - **Validates: Requirements 12.4**
  
  - [x] 17.9 Update error state styling
    - Ensure error messages use red colors from theme
    - Add error icon to error messages
    - Update error banner styling
    - _Requirements: 12.5_
  
  - [ ]* 17.10 Write property test for error state display
    - **Property 35: Error State Display**
    - **Validates: Requirements 12.5**
  
  - [x] 17.11 Add success confirmation feedback
    - Add checkmark or success message for completed actions
    - Use green colors for success states
    - Ensure feedback is visible but not intrusive
    - _Requirements: 12.6_
  
  - [ ]* 17.12 Write property test for success confirmation feedback
    - **Property 36: Success Confirmation Feedback**
    - **Validates: Requirements 12.6**

- [ ] 18. Implement rich content enhancements
  - [x] 18.1 Update image display with constraints
    - Ensure images have max-width to prevent overflow
    - Add loading states for images
    - Implement click-to-expand for images
    - _Requirements: 5.1, 5.2, 5.5, 5.6_
  
  - [ ]* 18.2 Write property tests for image display
    - **Property 11: Image Display Constraints**
    - **Property 14: Image Click Interaction**
    - **Validates: Requirements 5.1, 5.2, 5.6**
  
  - [x] 18.3 Update code block styling
    - Ensure monospace font is applied
    - Verify syntax highlighting works correctly
    - Update code block background colors to match theme
    - _Requirements: 5.3_
  
  - [ ]* 18.4 Write property test for code block formatting
    - **Property 12: Code Block Formatting**
    - **Validates: Requirements 5.3**
  
  - [x] 18.5 Verify markdown rendering
    - Test bold, italic, lists, and links render correctly
    - Ensure markdown styles match theme
    - _Requirements: 5.4_
  
  - [ ]* 18.6 Write property test for markdown rendering
    - **Property 13: Markdown Rendering**
    - **Validates: Requirements 5.4**

- [ ] 19. Implement accessibility enhancements
  - [ ]* 19.1 Write property test for text contrast accessibility
    - **Property 2: Text Contrast Accessibility**
    - **Validates: Requirements 1.4**
  
  - [x] 19.2 Add ARIA labels to interactive elements
    - Add aria-label to icon-only buttons
    - Add aria-expanded to dropdown menus
    - Add aria-current to active navigation items
  
  - [x] 19.3 Ensure keyboard navigation works
    - Test tab order is logical
    - Ensure all interactive elements are keyboard accessible
    - Add visible focus indicators
  
  - [x] 19.4 Test with screen readers
    - Verify semantic HTML is used correctly
    - Test with NVDA or VoiceOver
    - Ensure all content is accessible

- [x] 20. Final checkpoint and polish
  - Run all unit tests and property tests
  - Perform visual regression testing
  - Test on multiple browsers (Chrome, Firefox, Safari, Edge)
  - Test on multiple devices (desktop, tablet, mobile)
  - Verify all requirements are met
  - Fix any remaining bugs or styling issues
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation throughout implementation
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples, component structure, and edge cases
- The implementation follows a phased approach to minimize risk and ensure the application remains functional
