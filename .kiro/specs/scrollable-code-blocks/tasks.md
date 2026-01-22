# Implementation Plan: Scrollable Code Blocks

## Overview

This implementation plan breaks down the scrollable code blocks feature into discrete, incremental tasks. The approach focuses on first enhancing the markdown parser to detect code blocks, then integrating the syntax highlighter into the existing CodeBlock component, and finally wiring everything together. Each task builds on previous work to ensure continuous integration and validation.

## Tasks

- [x] 1. Set up syntax highlighting dependencies
  - Install `react-syntax-highlighter` package
  - Install type definitions: `@types/react-syntax-highlighter`
  - Verify installation and imports work correctly
  - _Requirements: 5.1, 5.3_

- [ ] 2. Enhance markdown parser to detect code blocks
  - [x] 2.1 Add 'code' type to MarkdownBlock interface
    - Extend MarkdownBlock type union to include 'code'
    - Add optional `language` and `code` properties to interface
    - _Requirements: 1.1_

  - [x] 2.2 Implement code block detection function
    - Create `detectCodeBlock()` function to identify code fences
    - Extract language identifier from opening fence (e.g., ```python)
    - Collect all lines between opening and closing fences
    - Handle edge case: unclosed code fences (treat rest as code)
    - Handle edge case: no language identifier (default to "text")
    - Return code block data with language and content
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ]* 2.3 Write property test for code block parsing
    - **Property 1: Code Block Parsing Completeness**
    - **Validates: Requirements 1.1, 1.2**
    - Generate random code blocks with various languages
    - Verify parser extracts language and code correctly
    - Test with 100+ iterations

  - [x] 2.4 Integrate code block detection into parseMarkdownBlocks
    - Modify main parsing loop to check for code fence patterns
    - Call detectCodeBlock when triple backticks found
    - Add parsed code blocks to blocks array
    - Ensure code blocks are processed before other markdown elements
    - _Requirements: 1.4, 7.1_

  - [ ]* 2.5 Write property test for multiple code blocks
    - **Property 2: Multiple Code Block Independence**
    - **Validates: Requirements 1.4**
    - Generate markdown with multiple code blocks
    - Verify each is parsed independently
    - Test with 100+ iterations

  - [ ]* 2.6 Write property test for mixed content parsing
    - **Property 12: Mixed Content Parsing**
    - **Validates: Requirements 7.1, 7.2**
    - Generate markdown with code blocks and other elements
    - Verify all elements parsed in correct order
    - Test with 100+ iterations

- [ ] 3. Update renderMarkdown to render code blocks
  - [x] 3.1 Add code block case to rendering switch statement
    - Import CodeBlock component
    - Add case for 'code' block type
    - Pass language and code props to CodeBlock component
    - Ensure proper key for React rendering
    - _Requirements: 7.2_

  - [ ]* 3.2 Write unit test for code block rendering
    - Test that code blocks are rendered as CodeBlock components
    - Test that language is passed correctly
    - Test that code content is passed correctly
    - _Requirements: 7.2_

  - [ ]* 3.3 Write property test for language display
    - **Property 3: Language Display Consistency**
    - **Validates: Requirements 2.2**
    - Generate code blocks with various languages
    - Verify language name appears in rendered output
    - Test with 100+ iterations

- [x] 4. Checkpoint - Verify basic code block parsing and rendering
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Enhance CodeBlock component with syntax highlighting
  - [x] 5.1 Import and configure react-syntax-highlighter
    - Import Prism light build from react-syntax-highlighter
    - Import vscDarkPlus theme
    - Register common languages (JavaScript, TypeScript, Python, HTML, CSS, JSON, Bash, SQL)
    - _Requirements: 5.1, 5.3_

  - [x] 5.2 Replace plain code rendering with SyntaxHighlighter
    - Wrap code content in SyntaxHighlighter component
    - Pass language prop to SyntaxHighlighter
    - Apply vscDarkPlus theme
    - Configure to use inline styles
    - _Requirements: 5.1_

  - [ ]* 5.3 Write property test for syntax highlighter language routing
    - **Property 8: Syntax Highlighter Language Routing**
    - **Validates: Requirements 5.1**
    - Generate code blocks with supported languages
    - Verify SyntaxHighlighter receives correct language
    - Test with 100+ iterations

  - [x] 5.4 Add fallback for unsupported languages
    - Wrap SyntaxHighlighter in try-catch or error boundary
    - Fall back to plain <pre><code> on error
    - Test with invalid language identifiers
    - _Requirements: 5.5_

  - [ ]* 5.5 Write property test for unsupported language handling
    - **Property 9: Unsupported Language Graceful Degradation**
    - **Validates: Requirements 5.5**
    - Generate code blocks with random/invalid languages
    - Verify no errors thrown and code still displays
    - Test with 100+ iterations

  - [ ]* 5.6 Write unit test for supported languages
    - Test that Python, JavaScript, TypeScript, HTML, CSS, JSON, Bash, SQL are supported
    - Verify each language renders without errors
    - _Requirements: 5.3_

- [ ] 6. Implement scrollable container
  - [x] 6.1 Add ScrollableCodeContainer wrapper
    - Create wrapper div around SyntaxHighlighter
    - Set maxHeight to 500px
    - Enable overflow-x: auto for horizontal scroll
    - Enable overflow-y: auto for vertical scroll
    - Add custom scrollbar styling for dark theme
    - _Requirements: 3.1, 3.2_

  - [x] 6.2 Configure SyntaxHighlighter for scroll preservation
    - Set wrapLines={false} to prevent line wrapping
    - Set wrapLongLines={false} to enable horizontal scroll
    - Ensure whitespace is preserved (pre-wrap)
    - _Requirements: 3.3_

  - [ ]* 6.3 Write property test for horizontal scroll
    - **Property 4: Horizontal Scroll Enablement**
    - **Validates: Requirements 3.1, 6.3**
    - Generate code with very long lines (200+ chars)
    - Verify container has overflow-x enabled
    - Verify content not truncated
    - Test with 100+ iterations

  - [ ]* 6.4 Write property test for vertical scroll and content preservation
    - **Property 5: Vertical Scroll and Content Preservation**
    - **Validates: Requirements 3.2, 3.3**
    - Generate code with many lines (100+ lines)
    - Verify container has overflow-y enabled
    - Verify all content preserved and formatted correctly
    - Test with 100+ iterations

- [ ] 7. Enhance copy functionality
  - [x] 7.1 Update copy button to handle raw code
    - Ensure copy button copies the raw `code` prop
    - Remove any HTML or formatting from copied content
    - Test clipboard content matches original code
    - _Requirements: 4.2, 4.5_

  - [ ]* 7.2 Write property test for copy functionality
    - **Property 6: Copy Functionality Correctness**
    - **Validates: Requirements 4.2, 4.5**
    - Generate random code content
    - Simulate copy button click
    - Verify clipboard contains exact raw code
    - Test with 100+ iterations

  - [x] 7.3 Add error handling for copy failures
    - Wrap clipboard.writeText in try-catch
    - Maintain original button state on error
    - Log error to console for debugging
    - _Requirements: 4.4_

  - [ ]* 7.4 Write property test for copy error handling
    - **Property 7: Copy Error Handling**
    - **Validates: Requirements 4.4**
    - Mock clipboard API to throw errors
    - Verify component maintains original state
    - Test with 100+ iterations

  - [ ]* 7.5 Write unit test for copy feedback
    - Test that "Copied" message appears after successful copy
    - Test that message disappears after 2 seconds
    - _Requirements: 4.3_

- [ ] 8. Handle edge cases and special content
  - [x] 8.1 Add handling for empty code blocks
    - Check if code is empty string
    - Render empty container with header
    - Display placeholder text: "Empty code block"
    - _Requirements: 6.1_

  - [ ]* 8.2 Write unit test for empty code blocks
    - Test rendering with empty string code
    - Verify header still displays
    - Verify no errors thrown
    - _Requirements: 6.1_

  - [x] 8.3 Ensure special characters are preserved
    - Verify Unicode characters render correctly
    - Test with emojis, special symbols, non-ASCII characters
    - Ensure no character encoding issues
    - _Requirements: 6.2_

  - [ ]* 8.4 Write property test for special character preservation
    - **Property 10: Special Character Preservation**
    - **Validates: Requirements 6.2**
    - Generate code with Unicode and special characters
    - Verify all characters preserved in rendered output
    - Test with 100+ iterations

  - [x] 8.5 Handle tab characters consistently
    - Configure SyntaxHighlighter tabSize (default: 4 spaces)
    - Ensure tabs render with consistent spacing
    - Test code with mixed tabs and spaces
    - _Requirements: 6.4_

  - [ ]* 8.6 Write property test for tab character consistency
    - **Property 11: Tab Character Consistency**
    - **Validates: Requirements 6.4**
    - Generate code with tab characters
    - Verify tabs render with consistent spacing
    - Test with 100+ iterations

- [ ] 9. Ensure user message handling
  - [x] 9.1 Verify user messages bypass markdown processing
    - Check that ChatMessage component only calls renderMarkdown for assistant messages
    - Verify user messages with code fences display as plain text
    - Test that user messages don't trigger code block rendering
    - _Requirements: 7.5_

  - [ ]* 9.2 Write property test for user message markdown bypass
    - **Property 13: User Message Markdown Bypass**
    - **Validates: Requirements 7.5**
    - Generate user messages with code fence syntax
    - Verify they render as plain text, not code blocks
    - Test with 100+ iterations

- [ ] 10. Final integration and testing
  - [x] 10.1 Test complete message rendering flow
    - Create test messages with code blocks
    - Verify end-to-end rendering in ChatMessage component
    - Test with multiple code blocks in one message
    - Test with code blocks mixed with other markdown
    - _Requirements: 7.1, 7.2_

  - [ ]* 10.2 Write integration tests
    - Test full message with code blocks renders correctly
    - Test assistant vs user message handling
    - Test multiple code blocks in conversation
    - _Requirements: 7.1, 7.2, 7.5_

  - [x] 10.3 Manual testing and visual verification
    - Test in browser with real chat messages
    - Verify syntax highlighting looks correct
    - Verify scrolling works smoothly
    - Verify copy button works
    - Verify styling matches dark theme
    - Test with various code languages
    - Test with large code blocks
    - _Requirements: All_

- [x] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties with 100+ iterations
- Unit tests validate specific examples and edge cases
- The implementation builds incrementally: parser → renderer → component → integration
