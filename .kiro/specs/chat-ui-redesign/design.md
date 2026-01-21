# Design Document: Chat UI Redesign

## Overview

This design document outlines the technical approach for redesigning the chat application UI to match a modern, dark-themed interface. The redesign will transform the existing Next.js/TypeScript application with Tailwind CSS styling into a polished, sophisticated interface featuring a deep navy color scheme, enhanced sidebar navigation, and improved message display.

The design maintains all existing functionality while significantly improving the visual presentation and user experience. Key improvements include a refined color palette, enhanced component styling, smooth animations, and better visual hierarchy throughout the interface.

## Architecture

### High-Level Structure

The application follows a component-based architecture using React and Next.js:

```
┌─────────────────────────────────────────────────────┐
│                   Main Layout                        │
│  ┌──────────────┐  ┌──────────────────────────────┐ │
│  │              │  │      Chat Area               │ │
│  │   Sidebar    │  │  ┌────────────────────────┐  │ │
│  │              │  │  │   Message List         │  │ │
│  │  - Logo      │  │  │   - User Messages      │  │ │
│  │  - Search    │  │  │   - Assistant Messages │  │ │
│  │  - Nav       │  │  │   - Rich Content       │  │ │
│  │  - Convos    │  │  └────────────────────────┘  │ │
│  │  - CTA       │  │  ┌────────────────────────┐  │ │
│  │              │  │  │   Input Area           │  │ │
│  │              │  │  │   - Text Input         │  │ │
│  │              │  │  │   - Attach Button      │  │ │
│  │              │  │  │   - Send Button        │  │ │
│  │              │  │  └────────────────────────┘  │ │
│  └──────────────┘  └──────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Design Principles

1. **Incremental Enhancement**: Modify existing components rather than complete rewrites
2. **Tailwind-First**: Use Tailwind CSS utility classes for all styling
3. **Component Isolation**: Each component manages its own styling and behavior
4. **Responsive Design**: Mobile-first approach with progressive enhancement
5. **Accessibility**: Maintain WCAG AA compliance throughout

### Technology Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom theme configuration
- **State Management**: React hooks (existing useChat hook)
- **Animation**: Tailwind transitions and CSS animations

## Components and Interfaces

### 1. Theme Configuration

**File**: `tailwind.config.ts`

The theme system will be extended with custom colors matching the design:

```typescript
// Extended theme configuration
theme: {
  extend: {
    colors: {
      // Primary dark theme colors
      'navy-950': '#0f1419',  // Sidebar background
      'navy-900': '#1a2332',  // Main background
      'navy-800': '#1f2937',  // Message backgrounds
      'navy-700': '#374151',  // Borders
      
      // Accent colors
      'blue-accent': '#3b82f6',  // Primary actions
      'blue-accent-hover': '#2563eb',  // Hover states
      
      // Text colors
      'text-primary': '#f3f4f6',  // Primary text
      'text-secondary': '#9ca3af',  // Secondary text
      'text-muted': '#6b7280',  // Muted text
    },
    spacing: {
      // Consistent spacing scale
      '18': '4.5rem',
      '88': '22rem',
    },
    borderRadius: {
      'xl': '0.75rem',
      '2xl': '1rem',
      '3xl': '1.5rem',
    },
    backdropBlur: {
      'xs': '2px',
    },
  },
}
```

### 2. Sidebar Component

**File**: `src/components/sidebar/ConversationSidebar.tsx`

**Interface**:
```typescript
interface ConversationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  threads: ThreadSummary[];
  currentThreadId: string | null;
  onSelectThread: (threadId: string, projectId: string) => void;
  onNewChat: () => void;
}
```

**Key Changes**:
- Update background colors to navy-950
- Add search bar component below logo
- Implement navigation sections (Settings, Projects, Chats, Templates, Teams)
- Add bottom CTA button with blue accent
- Enhance conversation item styling with better hover states
- Improve transition animations (300ms ease-in-out)

**Structure**:
```
Sidebar
├── Header Section
│   ├── Logo (VOXA/AI BRAIN)
│   └── Close Button
├── Search Bar
├── Navigation Sections
│   ├── Settings
│   ├── My Projects
│   ├── Chats (active)
│   ├── Templates
│   └── Teams
├── Conversation List (scrollable)
│   └── Conversation Items
└── Bottom CTA Button
```

### 3. Chat Container Component

**File**: `src/components/chat/ChatContainer.tsx`

**Interface**:
```typescript
interface ChatContainerProps {
  messages: ChatMessage[];
  onSend: (message: string, files?: File[]) => void;
  onStop?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  threadId?: string | null;
  projectId?: string | null;
}
```

**Key Changes**:
- Update background to navy-900 with gradient overlay
- Adjust max-width for optimal reading (800px instead of 768px)
- Enhance scrollbar styling (hidden but functional)
- Improve welcome message positioning and styling
- Add smooth scroll behavior

### 4. Chat Message Component

**File**: `src/components/chat/ChatMessage.tsx`

**Interface**:
```typescript
interface ChatMessageProps {
  message: ChatMessage;
  threadId?: string | null;
  projectId?: string | null;
}
```

**Key Changes**:
- Increase border-radius to 16px (rounded-2xl)
- Adjust padding to 20px (px-5 py-4)
- Update background colors with backdrop-blur-md
- Enhance message header styling (sender name, timestamp)
- Improve image display with max-width constraints
- Add message action buttons (thumbs up/down, copy) on hover
- Better spacing between message elements
- Enhanced loading indicator styling

**Message Actions**:
```typescript
interface MessageActionsProps {
  messageId: string;
  onThumbsUp: () => void;
  onThumbsDown: () => void;
  onCopy: () => void;
}
```

### 5. Chat Input Component

**File**: `src/components/chat/ChatInput.tsx`

**Interface**:
```typescript
interface ChatInputProps {
  onSend: (message: string, files?: File[]) => void;
  onStop?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}
```

**Key Changes**:
- Redesign with rounded container (rounded-3xl)
- Add attachment button with icon on left
- Style send button with blue accent color
- Implement auto-expand for multi-line input (max 6 lines)
- Add file preview chips when files are attached
- Enhance focus states and transitions
- Update background with backdrop-blur

**Layout**:
```
Input Container
├── Attachment Button (left)
├── Text Input (center, auto-expanding)
└── Send Button (right, blue accent)
```

### 6. Header Component

**File**: `src/app/page.tsx` (inline header)

**Key Changes**:
- Update background to navy-900/90 with backdrop-blur
- Add user avatar component in top right
- Add score/status indicator next to avatar
- Enhance hamburger menu button styling
- Improve border styling

**User Profile Section**:
```typescript
interface UserProfileProps {
  avatarUrl?: string;
  score: string;  // e.g., "6/75"
  onProfileClick: () => void;
}
```

### 7. Navigation Section Component (New)

**File**: `src/components/sidebar/NavigationSection.tsx`

**Interface**:
```typescript
interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  isActive?: boolean;
  onClick: () => void;
}

interface NavigationSectionProps {
  items: NavigationItem[];
}
```

**Purpose**: Render the navigation menu items in the sidebar (Settings, Projects, Chats, Templates, Teams).

### 8. Search Bar Component (New)

**File**: `src/components/sidebar/SearchBar.tsx`

**Interface**:
```typescript
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}
```

**Purpose**: Allow users to search/filter conversations in the sidebar.

### 9. Message Actions Component (New)

**File**: `src/components/chat/MessageActions.tsx`

**Interface**:
```typescript
interface MessageActionsProps {
  messageId: string;
  onThumbsUp: () => void;
  onThumbsDown: () => void;
  onCopy: () => void;
  visible: boolean;
}
```

**Purpose**: Provide interaction buttons for assistant messages (feedback, copy).

## Data Models

### Theme Configuration

```typescript
interface ThemeColors {
  // Background colors
  sidebarBg: string;      // navy-950
  mainBg: string;         // navy-900
  messageBg: string;      // navy-800
  borderColor: string;    // navy-700
  
  // Accent colors
  primary: string;        // blue-accent
  primaryHover: string;   // blue-accent-hover
  
  // Text colors
  textPrimary: string;    // text-primary
  textSecondary: string;  // text-secondary
  textMuted: string;      // text-muted
}
```

### Spacing System

```typescript
interface SpacingScale {
  xs: string;   // 4px
  sm: string;   // 8px
  md: string;   // 12px
  lg: string;   // 16px
  xl: string;   // 24px
  '2xl': string; // 32px
}
```

### Animation Configuration

```typescript
interface AnimationConfig {
  duration: {
    fast: string;    // 150ms
    normal: string;  // 200ms
    slow: string;    // 300ms
  };
  easing: {
    default: string;  // ease-in-out
    in: string;       // ease-in
    out: string;      // ease-out
  };
}
```

### Message Action State

```typescript
interface MessageActionState {
  messageId: string;
  thumbsUp: boolean;
  thumbsDown: boolean;
  copied: boolean;
}
```

### User Profile Data

```typescript
interface UserProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  score: {
    current: number;
    total: number;
  };
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After analyzing all 72 acceptance criteria, several patterns of redundancy emerged:

**Color and Styling Properties**: Many criteria test similar styling properties (colors, borders, padding) across different components. These can be consolidated into component-level styling tests rather than individual properties for each element.

**Animation Properties**: Multiple criteria test animation timing and easing (2.6, 2.7, 10.1, 10.2, 10.3, 10.4, 10.5). These can be consolidated into a single property about consistent animation behavior.

**Responsive Behavior**: Several criteria test responsive behavior across different components (9.1-9.6). These can be consolidated into viewport-based layout properties.

**Message Display Properties**: Multiple criteria test message container styling (4.1, 4.2, 4.6, 4.7). These can be combined into comprehensive message styling properties.

**Hover State Properties**: Several criteria test hover behavior (3.4, 6.1, 6.5, 10.3). These can be consolidated into interaction state properties.

The following properties represent the unique, high-value tests after eliminating redundancy:

### Core Properties

**Property 1: Theme Color Consistency**
*For any* component in the application, all color values used should be defined in the theme configuration and match the dark theme palette (navy backgrounds, blue accents, light text).
**Validates: Requirements 1.1, 1.2, 1.3, 1.5**

**Property 2: Text Contrast Accessibility**
*For any* text element displayed in the application, the contrast ratio between text color and background color should meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text).
**Validates: Requirements 1.4**

**Property 3: Message Container Styling**
*For any* message displayed in the chat, the message container should have rounded corners (12-16px), appropriate padding (16-24px), backdrop blur effect, and display sender name and timestamp.
**Validates: Requirements 4.1, 4.2, 4.6, 4.7**

**Property 4: Message Alignment by Role**
*For any* message in the chat, if the role is "user" then it should be right-aligned with user background color, and if the role is "assistant" then it should be left-aligned with assistant background color.
**Validates: Requirements 4.3, 4.4**

**Property 5: Message Spacing Consistency**
*For any* two consecutive messages in the chat area, the vertical spacing between them should be consistent (12-16px margin).
**Validates: Requirements 4.5**

**Property 6: Conversation List Item Structure**
*For any* conversation item in the sidebar, it should display a title, preview text, and timestamp.
**Validates: Requirements 3.1**

**Property 7: Conversation Selection Highlighting**
*For any* conversation in the list, when it is the currently selected conversation, it should have distinct background color and border styling applied.
**Validates: Requirements 3.2**

**Property 8: Conversation List Ordering**
*For any* conversation list, conversations should be ordered by timestamp in descending order (most recent first).
**Validates: Requirements 3.3**

**Property 9: Text Truncation with Ellipsis**
*For any* conversation item with title or preview text exceeding the container width, the text should be truncated with ellipsis.
**Validates: Requirements 3.5**

**Property 10: Scrollable Overflow**
*For any* container with content exceeding its height (conversation list, chat area), scrolling should be enabled with appropriate overflow styling.
**Validates: Requirements 3.6**

**Property 11: Image Display Constraints**
*For any* message containing images, the images should be displayed inline with maximum width constraints to prevent overflow beyond the message container.
**Validates: Requirements 5.1, 5.2**

**Property 12: Code Block Formatting**
*For any* message containing code blocks, the code should be rendered with monospace font and syntax highlighting applied.
**Validates: Requirements 5.3**

**Property 13: Markdown Rendering**
*For any* message content containing markdown syntax (bold, italic, lists, links), the markdown should be converted to properly styled HTML.
**Validates: Requirements 5.4**

**Property 14: Image Click Interaction**
*For any* image displayed in a message, clicking the image should trigger the full-size image modal.
**Validates: Requirements 5.6**

**Property 15: Message Actions on Hover**
*For any* assistant message, hovering over it should reveal action buttons (thumbs up, thumbs down, copy) with icons and tooltips.
**Validates: Requirements 6.1, 6.2**

**Property 16: Message Action Visual Feedback**
*For any* message action button, clicking it should provide immediate visual feedback (color change, animation, or state indicator).
**Validates: Requirements 6.3**

**Property 17: Input State Button Behavior**
*For any* state where the input field is empty, the send button should be disabled or displayed in a muted state.
**Validates: Requirements 7.4**

**Property 18: Input Auto-Expansion**
*For any* input content that exceeds one line, the input field should auto-expand vertically up to a maximum height (6 lines).
**Validates: Requirements 7.6**

**Property 19: File Attachment Previews**
*For any* state where files are attached to the input, file preview chips should be visible in the input area.
**Validates: Requirements 7.7**

**Property 20: Avatar Click Interaction**
*For any* click on the user avatar, the dropdown menu should toggle visibility.
**Validates: Requirements 8.3**

**Property 21: Responsive Sidebar Behavior**
*For any* viewport width below 1024px, the sidebar should overlay the chat area with absolute positioning, and for viewport width 1024px or above, the sidebar should optionally dock to the left side.
**Validates: Requirements 9.1, 9.2**

**Property 22: Responsive Chat Width**
*For any* viewport size, the chat area content should have an appropriate maximum width that adjusts based on viewport size for optimal reading.
**Validates: Requirements 9.3**

**Property 23: No Horizontal Overflow**
*For any* viewport width, message containers and other content should not cause horizontal scrolling.
**Validates: Requirements 9.4**

**Property 24: Fixed Input Positioning**
*For any* viewport size, the input area should remain fixed at the bottom of the chat area.
**Validates: Requirements 9.5**

**Property 25: Animation Timing Consistency**
*For any* animated transition in the application (sidebar, messages, hover states), the transition duration should be within appropriate ranges (150-300ms) and use ease-in-out easing.
**Validates: Requirements 2.6, 2.7, 10.1, 10.2, 10.3, 10.4**

**Property 26: Smooth Scroll Behavior**
*For any* programmatic scroll action (scrolling to new messages), smooth scroll behavior should be applied.
**Validates: Requirements 10.5**

**Property 27: Spacing Unit Consistency**
*For any* spacing value used in the application (margins, padding, gaps), it should be one of the defined spacing units (4px, 8px, 12px, 16px, 24px, 32px).
**Validates: Requirements 11.1**

**Property 28: Visual Hierarchy through Color**
*For any* comparison between sidebar and chat area backgrounds, the sidebar background should be darker than the chat area background.
**Validates: Requirements 11.2**

**Property 29: Font Size Hierarchy**
*For any* text element, its font size should match its semantic role: headings (18-24px), body text (14-16px), captions (12px).
**Validates: Requirements 11.3**

**Property 30: Font Weight Distinction**
*For any* text element, primary text should have a heavier font weight than secondary text to establish hierarchy.
**Validates: Requirements 11.4**

**Property 31: Loading State Indicators**
*For any* assistant message in loading state, an animated typing indicator should be visible.
**Validates: Requirements 12.1**

**Property 32: Upload Progress Indication**
*For any* file upload in progress, a progress indicator should be visible in the input area.
**Validates: Requirements 12.2**

**Property 33: Processing State Button Disabling**
*For any* button that triggers a processing action, the button should be disabled while the action is processing.
**Validates: Requirements 12.3**

**Property 34: Loading Animation Presence**
*For any* loading indicator, it should have animation applied (pulsing, bouncing, spinning, etc.).
**Validates: Requirements 12.4**

**Property 35: Error State Display**
*For any* error condition, an error message should be displayed with error styling (red colors, error icon).
**Validates: Requirements 12.5**

**Property 36: Success Confirmation Feedback**
*For any* successfully completed action, visual confirmation should be provided (checkmark, success message, or state change).
**Validates: Requirements 12.6**

## Error Handling

### Visual Error States

1. **Theme Loading Errors**: If theme configuration fails to load, fall back to default Tailwind dark theme
2. **Image Loading Errors**: Display placeholder or error icon when images fail to load
3. **Animation Errors**: Gracefully degrade to instant transitions if animations fail
4. **Responsive Breakpoint Errors**: Ensure layout remains functional even if media queries fail

### User Input Validation

1. **Empty Message Validation**: Prevent sending empty messages by disabling send button
2. **File Size Validation**: Validate file sizes before upload and show error for oversized files
3. **File Type Validation**: Validate file types and show error for unsupported formats

### Accessibility Fallbacks

1. **Reduced Motion**: Respect `prefers-reduced-motion` media query and disable animations
2. **High Contrast**: Ensure theme works with high contrast mode
3. **Keyboard Navigation**: Maintain keyboard accessibility for all interactive elements
4. **Screen Reader Support**: Ensure ARIA labels and semantic HTML are present

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests to ensure comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and component rendering
- **Property tests**: Verify universal properties across all inputs and states

### Unit Testing Focus

Unit tests should focus on:

1. **Component Rendering**: Verify components render with correct structure and initial state
2. **Specific Examples**: Test specific color values, spacing values, and layout configurations
3. **Edge Cases**: Test empty states, loading states, error states
4. **Integration Points**: Test component interactions (sidebar toggle, message actions, file uploads)
5. **Accessibility**: Test ARIA attributes, keyboard navigation, focus management

**Example Unit Tests**:
- Sidebar renders with logo, search bar, and navigation sections
- Message container has correct border-radius and padding values
- Input area disables send button when empty
- Avatar displays with correct size (32-40px)
- Error banner displays when error state is set

### Property-Based Testing Focus

Property tests should focus on:

1. **Universal Styling Properties**: Theme consistency, contrast ratios, spacing units
2. **Responsive Behavior**: Layout adaptation across viewport sizes
3. **State-Based Rendering**: Message alignment, button states, loading indicators
4. **Animation Consistency**: Transition timing and easing across all animations
5. **Content Handling**: Text truncation, image constraints, markdown rendering

**Property Test Configuration**:
- Use React Testing Library with custom property test utilities
- Minimum 100 iterations per property test
- Generate random viewport sizes, message content, and component states
- Tag each test with: `Feature: chat-ui-redesign, Property {number}: {property_text}`

**Example Property Tests**:
- For any message, verify alignment matches role (user=right, assistant=left)
- For any text element, verify contrast ratio meets WCAG AA
- For any viewport size, verify no horizontal overflow
- For any animation, verify timing is within 150-300ms range
- For any conversation item, verify it has title, preview, and timestamp

### Testing Tools

- **Framework**: Jest with React Testing Library
- **Visual Regression**: Chromatic or Percy for visual diff testing
- **Accessibility**: jest-axe for automated accessibility testing
- **Property Testing**: Custom utilities built on top of Jest for property-based tests
- **E2E Testing**: Playwright for end-to-end user flows

### Test Coverage Goals

- **Unit Test Coverage**: 80%+ line coverage for component logic
- **Property Test Coverage**: All 36 correctness properties implemented
- **Visual Regression**: All major UI states captured
- **Accessibility**: 100% of interactive elements tested with jest-axe
- **E2E Coverage**: Critical user flows (send message, switch conversation, upload file)

## Implementation Notes

### Migration Strategy

1. **Phase 1: Theme Configuration** - Update Tailwind config with new color palette
2. **Phase 2: Core Components** - Update ChatMessage, ChatInput, and ChatContainer styling
3. **Phase 3: Sidebar Enhancement** - Add search bar, navigation sections, and CTA button
4. **Phase 4: New Components** - Implement MessageActions, NavigationSection, SearchBar
5. **Phase 5: Animations** - Add transitions and smooth animations throughout
6. **Phase 6: Responsive Polish** - Fine-tune responsive behavior and test across devices
7. **Phase 7: Testing** - Implement unit tests and property tests for all components

### Performance Considerations

1. **Animation Performance**: Use CSS transforms and opacity for animations (GPU-accelerated)
2. **Image Optimization**: Lazy load images and use appropriate image formats
3. **Virtualization**: Consider virtualizing long conversation lists for performance
4. **Memoization**: Use React.memo for expensive components to prevent unnecessary re-renders
5. **Bundle Size**: Ensure new components don't significantly increase bundle size

### Browser Compatibility

- **Target Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Fallbacks**: Provide fallbacks for backdrop-filter (not supported in older browsers)
- **Testing**: Test on major browsers and devices during development

### Accessibility Compliance

- **WCAG Level**: AA compliance for all interactive elements
- **Keyboard Navigation**: Full keyboard support for all features
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Focus Management**: Visible focus indicators and logical focus order
- **Motion**: Respect prefers-reduced-motion for users sensitive to animation
