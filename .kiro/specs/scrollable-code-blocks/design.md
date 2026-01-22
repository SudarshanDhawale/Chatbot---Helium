# Design Document: Scrollable Code Blocks

## Overview

This design implements scrollable code blocks with syntax highlighting for chat messages. The solution enhances the existing CodeBlock component and integrates it into the markdown rendering pipeline. The implementation uses `react-syntax-highlighter` with the Prism light build for optimal bundle size and performance, while maintaining the existing dark theme aesthetic.

The key architectural decision is to extend the markdown parser to recognize code fence blocks and render them using the enhanced CodeBlock component, rather than displaying them as plain text. This approach maintains separation of concerns while providing a seamless user experience.

## Architecture

### Component Hierarchy

```
ChatMessage
  └── renderMarkdown() [markdown.tsx]
      ├── parseMarkdownBlocks()
      │   └── detectCodeBlocks() [NEW]
      └── formatBlocks()
          ├── Headers (h1-h4)
          ├── Lists (ul, ol)
          ├── Paragraphs
          └── CodeBlock [ENHANCED]
              ├── CodeBlockHeader
              │   ├── LanguageLabel
              │   └── CopyButton
              └── ScrollableCodeContainer
                  └── SyntaxHighlighter
```

### Data Flow

1. **Message Reception**: Chat message arrives with markdown content containing code fences
2. **Markdown Parsing**: `renderMarkdown()` parses the message text
3. **Code Block Detection**: Parser identifies code fence patterns (triple backticks)
4. **Language Extraction**: Parser extracts language identifier from code fence
5. **Component Rendering**: CodeBlock component receives language and code content
6. **Syntax Highlighting**: react-syntax-highlighter applies language-specific styling
7. **Display**: Scrollable container renders the highlighted code

### Integration Points

- **Markdown Parser** (`src/utils/markdown.tsx`): Extended to detect and parse code blocks
- **CodeBlock Component** (`src/components/chat/CodeBlock.tsx`): Enhanced with syntax highlighting
- **ChatMessage Component** (`src/components/chat/ChatMessage.tsx`): No changes required (uses renderMarkdown)

## Components and Interfaces

### Enhanced Markdown Parser

**Location**: `src/utils/markdown.tsx`

**New Block Type**:
```typescript
interface MarkdownBlock {
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'ul' | 'ol' | 'paragraph' | 'linebreak' | 'code';
  content: string;
  items?: string[];
  language?: string;  // NEW: for code blocks
  code?: string;      // NEW: for code blocks
}
```

**Code Block Detection Logic**:
```typescript
function detectCodeBlock(lines: string[], startIndex: number): {
  block: MarkdownBlock | null;
  endIndex: number;
} {
  // Detect opening fence: ```language
  // Extract language identifier
  // Collect code lines until closing fence
  // Return code block with language and content
}
```

**Parsing Strategy**:
- Scan lines sequentially
- When encountering triple backticks, enter code block mode
- Extract optional language identifier from opening fence
- Accumulate lines until closing fence
- Create code block with language and content
- Continue parsing remaining content

### Enhanced CodeBlock Component

**Location**: `src/components/chat/CodeBlock.tsx`

**Component Interface**:
```typescript
interface CodeBlockProps {
  language: string;
  code: string;
  maxHeight?: number;  // NEW: default 500px
}
```

**Subcomponents**:

1. **CodeBlockHeader**
   - Displays language name with icon
   - Contains copy button
   - Fixed position during vertical scroll
   - Dark background matching theme

2. **CopyButton**
   - Copies raw code to clipboard
   - Shows "Copied" feedback for 2 seconds
   - Handles copy failures gracefully
   - Accessible with aria-label

3. **ScrollableCodeContainer**
   - Wraps syntax highlighter
   - Provides horizontal scroll for long lines
   - Provides vertical scroll when exceeding maxHeight
   - Preserves code formatting during scroll
   - Custom scrollbar styling for dark theme

**Styling Enhancements**:
```typescript
const containerStyles = {
  maxHeight: '500px',
  overflowY: 'auto',
  overflowX: 'auto',
  scrollbarWidth: 'thin',
  scrollbarColor: 'rgba(255, 255, 255, 0.3) rgba(0, 0, 0, 0.2)'
};
```

### Syntax Highlighter Integration

**Library**: `react-syntax-highlighter` (Prism light build)

**Rationale**: 
- Lightweight bundle size with code splitting
- Supports JSX/TSX highlighting (important for React projects)
- Pure React implementation (no dangerouslySetInnerHTML)
- JavaScript-based styles (no external CSS required)
- Wide language support through Prism

**Implementation Strategy**:
```typescript
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Register only needed languages for optimal bundle size
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
// ... other common languages
```

**Language Support**:
- JavaScript/TypeScript (including JSX/TSX)
- Python
- HTML/CSS
- JSON
- Bash/Shell
- SQL
- YAML
- Markdown
- Fallback to plain text for unsupported languages

**Theme Selection**: `vscDarkPlus` - matches existing dark theme aesthetic and provides excellent contrast

## Data Models

### Code Block Data Structure

```typescript
interface CodeBlockData {
  language: string;      // Language identifier (e.g., "python", "typescript")
  code: string;          // Raw code content
  startLine: number;     // Line number where code block starts in message
  endLine: number;       // Line number where code block ends in message
}
```

### Markdown Block Extension

```typescript
type MarkdownBlockType = 
  | 'h1' | 'h2' | 'h3' | 'h4'
  | 'ul' | 'ol'
  | 'paragraph'
  | 'linebreak'
  | 'code';  // NEW

interface MarkdownBlock {
  type: MarkdownBlockType;
  content: string;
  items?: string[];      // For lists
  language?: string;     // For code blocks
  code?: string;         // For code blocks
}
```

### Copy State Management

```typescript
interface CopyState {
  copied: boolean;       // Whether code was recently copied
  timeout: NodeJS.Timeout | null;  // Timeout for resetting copied state
}
```

## Correctness Properties


*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Code Block Parsing Completeness

*For any* markdown text containing code fences with language identifiers, the parser should extract both the language identifier and the complete code content, and pass them correctly to the CodeBlock component.

**Validates: Requirements 1.1, 1.2**

### Property 2: Multiple Code Block Independence

*For any* markdown message containing multiple code blocks, each code block should be rendered as a separate CodeBlock component with its own language and content preserved independently.

**Validates: Requirements 1.4**

### Property 3: Language Display Consistency

*For any* code block with a specified language, the rendered component should display that language name in the header.

**Validates: Requirements 2.2**

### Property 4: Horizontal Scroll Enablement

*For any* code content with lines exceeding the container width, the scroll container should enable horizontal scrolling and preserve all content without truncation.

**Validates: Requirements 3.1, 6.3**

### Property 5: Vertical Scroll and Content Preservation

*For any* code content exceeding the maximum height threshold, the scroll container should enable vertical scrolling while preserving all code formatting and indentation.

**Validates: Requirements 3.2, 3.3**

### Property 6: Copy Functionality Correctness

*For any* code block, clicking the copy button should copy the complete raw code content to the clipboard without any formatting, styling, or modifications.

**Validates: Requirements 4.2, 4.5**

### Property 7: Copy Error Handling

*For any* code block where the copy operation fails, the component should maintain its original state without showing false success feedback.

**Validates: Requirements 4.4**

### Property 8: Syntax Highlighter Language Routing

*For any* supported programming language, the syntax highlighter should be invoked with the correct language parameter to apply appropriate highlighting.

**Validates: Requirements 5.1**

### Property 9: Unsupported Language Graceful Degradation

*For any* unsupported or invalid language identifier, the code block should render without errors, displaying the code in plain monospace format.

**Validates: Requirements 5.5**

### Property 10: Special Character Preservation

*For any* code content containing special characters or Unicode, the rendered code block should preserve and display all characters exactly as provided.

**Validates: Requirements 6.2**

### Property 11: Tab Character Consistency

*For any* code content containing tab characters, the rendered code block should display tabs with consistent spacing throughout the code.

**Validates: Requirements 6.4**

### Property 12: Mixed Content Parsing

*For any* markdown text containing code blocks interspersed with other markdown elements (headers, lists, paragraphs), the parser should correctly identify and render all elements in their original order.

**Validates: Requirements 7.1, 7.2**

### Property 13: User Message Markdown Bypass

*For any* user message containing code fence syntax, the renderer should preserve the text as plain text without converting it to a code block component.

**Validates: Requirements 7.5**

## Error Handling

### Parser Error Handling

**Unclosed Code Fences**:
- If a code fence is opened but never closed, treat remaining content as code
- Log warning to console for debugging
- Render code block with all content until end of message

**Invalid Language Identifiers**:
- Accept any string as language identifier
- Pass to syntax highlighter for validation
- Fall back to plain text if unsupported

**Nested Code Fences**:
- First closing fence closes the block
- Subsequent fences treated as literal text within code
- No nesting support (matches standard markdown behavior)

### Component Error Handling

**Clipboard API Unavailable**:
- Detect if `navigator.clipboard` is undefined
- Disable copy button or show "Copy not supported" message
- Gracefully degrade without breaking component

**Syntax Highlighter Errors**:
- Wrap syntax highlighter in error boundary
- Fall back to plain `<pre><code>` rendering on error
- Log error for debugging but don't crash UI

**Empty Code Content**:
- Render empty code block with header
- Display placeholder text: "Empty code block"
- Maintain consistent height and styling

**Very Large Code Blocks**:
- Set maximum height (500px default)
- Enable vertical scrolling
- Consider lazy rendering for blocks > 10,000 lines

### State Management Errors

**Copy State Timeout Cleanup**:
- Clear timeout on component unmount
- Prevent memory leaks from dangling timeouts
- Reset state properly on rapid clicks

## Testing Strategy

### Unit Testing Approach

Unit tests will focus on specific examples, edge cases, and integration points:

**Markdown Parser Tests**:
- Test parsing single code block with language
- Test parsing code block without language (defaults to "text")
- Test parsing multiple code blocks in one message
- Test unclosed code fence handling
- Test code block with empty content
- Test code block mixed with other markdown elements

**CodeBlock Component Tests**:
- Test rendering with valid language
- Test rendering with invalid/unsupported language
- Test copy button click triggers clipboard API
- Test copy button shows "Copied" feedback
- Test empty code block rendering
- Test code with special characters renders correctly

**Integration Tests**:
- Test full message rendering with code blocks
- Test user vs assistant message handling
- Test multiple code blocks in conversation

### Property-Based Testing Approach

Property tests will verify universal correctness across randomized inputs. Each test should run a minimum of 100 iterations.

**Test Configuration**:
- Library: `@fast-check/vitest` (for Vitest) or `fast-check` (for Jest)
- Minimum iterations: 100 per property
- Tag format: `Feature: scrollable-code-blocks, Property {N}: {description}`

**Property Test Generators**:

```typescript
// Generator for random code content
const codeGenerator = fc.string({ minLength: 1, maxLength: 1000 });

// Generator for programming languages
const languageGenerator = fc.oneof(
  fc.constant('python'),
  fc.constant('javascript'),
  fc.constant('typescript'),
  fc.constant('html'),
  fc.constant('css'),
  fc.constant('json'),
  fc.constant('bash'),
  fc.constant('sql'),
  fc.string({ minLength: 1, maxLength: 20 }) // random/invalid languages
);

// Generator for markdown with code blocks
const markdownWithCodeGenerator = fc.tuple(
  fc.array(fc.string()), // text before
  languageGenerator,
  codeGenerator,
  fc.array(fc.string())  // text after
).map(([before, lang, code, after]) => 
  `${before.join('\n')}\n\`\`\`${lang}\n${code}\n\`\`\`\n${after.join('\n')}`
);

// Generator for code with long lines
const longLineCodeGenerator = fc.array(
  fc.string({ minLength: 200, maxLength: 500 })
).map(lines => lines.join('\n'));

// Generator for code with many lines
const manyLinesCodeGenerator = fc.array(
  fc.string({ minLength: 10, maxLength: 50 }),
  { minLength: 100, maxLength: 200 }
).map(lines => lines.join('\n'));

// Generator for code with special characters
const specialCharCodeGenerator = fc.string({
  minLength: 10,
  maxLength: 200
}).map(s => s + '\n\t\n' + '🚀💻\n' + '<>&"\'');
```

**Property Test Examples**:

```typescript
// Property 1: Code Block Parsing Completeness
test('Property 1: Parser extracts language and code correctly', () => {
  fc.assert(
    fc.property(languageGenerator, codeGenerator, (lang, code) => {
      const markdown = `\`\`\`${lang}\n${code}\n\`\`\``;
      const blocks = parseMarkdownBlocks(markdown);
      const codeBlock = blocks.find(b => b.type === 'code');
      
      expect(codeBlock).toBeDefined();
      expect(codeBlock?.language).toBe(lang);
      expect(codeBlock?.code).toBe(code);
    }),
    { numRuns: 100 }
  );
});

// Property 6: Copy Functionality Correctness
test('Property 6: Copy button copies raw code without formatting', () => {
  fc.assert(
    fc.property(codeGenerator, async (code) => {
      const mockClipboard = { writeText: vi.fn() };
      global.navigator.clipboard = mockClipboard;
      
      render(<CodeBlock language="python" code={code} />);
      const copyButton = screen.getByLabelText('Copy code');
      await userEvent.click(copyButton);
      
      expect(mockClipboard.writeText).toHaveBeenCalledWith(code);
    }),
    { numRuns: 100 }
  );
});
```

**Test Coverage Goals**:
- Parser: 100% line coverage
- CodeBlock component: 95% line coverage (excluding error boundaries)
- Integration: All user-facing workflows covered

### Manual Testing Checklist

- [ ] Code blocks display with correct syntax highlighting
- [ ] Horizontal scroll works for long lines
- [ ] Vertical scroll works for tall code blocks
- [ ] Copy button copies code correctly
- [ ] Copy button shows "Copied" feedback
- [ ] Multiple code blocks in one message render correctly
- [ ] Code blocks work in both user and assistant messages
- [ ] Empty code blocks render without errors
- [ ] Unsupported languages fall back gracefully
- [ ] Special characters and Unicode display correctly
- [ ] Performance is acceptable with large code blocks
- [ ] Styling matches dark theme aesthetic
