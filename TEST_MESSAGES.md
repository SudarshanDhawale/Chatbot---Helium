# Test Messages for Code Block Feature

Copy and paste these messages into the chat to test various code block scenarios.

---

## Test 1: Basic Python Code Block

```
Here's a simple Python function:

```python
def greet(name):
    """Greet someone by name."""
    return f"Hello, {name}!"

# Test the function
print(greet("World"))
```

This should display with syntax highlighting.
```

---

## Test 2: JavaScript with Long Lines

```
Here's JavaScript with very long lines to test horizontal scrolling:

```javascript
const veryLongFunctionNameThatExceedsContainerWidth = (parameter1, parameter2, parameter3, parameter4, parameter5, parameter6, parameter7, parameter8) => {
    return "This is a very long string that should definitely exceed the container width and trigger horizontal scrolling behavior in the code block component";
};

// Another long line
const anotherVeryLongVariableNameThatShouldTriggerHorizontalScrolling = "This string is also intentionally very long to test the horizontal scrolling functionality";
```
```

---

## Test 3: Multiple Code Blocks

```
Let's compare Python and JavaScript:

**Python version:**
```python
def add(a, b):
    return a + b

result = add(5, 3)
print(result)
```

**JavaScript version:**
```javascript
function add(a, b) {
    return a + b;
}

const result = add(5, 3);
console.log(result);
```

Both do the same thing!
```

---

## Test 4: Large Code Block (Vertical Scroll)

```
Here's a longer Python file to test vertical scrolling:

```python
class Calculator:
    """A simple calculator class."""
    
    def __init__(self):
        self.result = 0
    
    def add(self, x):
        """Add x to result."""
        self.result += x
        return self.result
    
    def subtract(self, x):
        """Subtract x from result."""
        self.result -= x
        return self.result
    
    def multiply(self, x):
        """Multiply result by x."""
        self.result *= x
        return self.result
    
    def divide(self, x):
        """Divide result by x."""
        if x == 0:
            raise ValueError("Cannot divide by zero")
        self.result /= x
        return self.result
    
    def reset(self):
        """Reset result to 0."""
        self.result = 0
        return self.result
    
    def get_result(self):
        """Get current result."""
        return self.result

# Example usage
calc = Calculator()
calc.add(10)
calc.multiply(5)
calc.subtract(3)
print(f"Result: {calc.get_result()}")

# Test error handling
try:
    calc.divide(0)
except ValueError as e:
    print(f"Error: {e}")
```
```

---

## Test 5: HTML and CSS

```
Here's some HTML and CSS:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Test Page</title>
</head>
<body>
    <div class="container">
        <h1>Welcome</h1>
        <p>This is a test.</p>
    </div>
</body>
</html>
```

And the CSS:

```css
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

h1 {
    color: white;
    font-size: 2.5rem;
    text-align: center;
}
```
```

---

## Test 6: JSON Data

```
Here's some JSON configuration:

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "next": "^13.0.0"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "config": {
    "port": 3000,
    "apiUrl": "https://api.example.com"
  }
}
```
```

---

## Test 7: Bash Script

```
Here's a bash script:

```bash
#!/bin/bash

# Setup script for development environment

echo "Setting up development environment..."

# Install dependencies
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
fi

# Run database migrations
npm run db:migrate

echo "Setup complete!"
```
```

---

## Test 8: SQL Query

```
Here's a SQL query:

```sql
SELECT 
    u.id,
    u.name,
    u.email,
    COUNT(o.id) as order_count,
    SUM(o.total) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= '2024-01-01'
GROUP BY u.id, u.name, u.email
HAVING COUNT(o.id) > 5
ORDER BY total_spent DESC
LIMIT 10;
```
```

---

## Test 9: TypeScript Interface

```
Here's a TypeScript interface:

```typescript
interface User {
    id: string;
    name: string;
    email: string;
    age?: number;
    roles: string[];
    metadata: {
        createdAt: Date;
        updatedAt: Date;
        lastLogin?: Date;
    };
}

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    timestamp: number;
}

async function fetchUser(id: string): Promise<ApiResponse<User>> {
    try {
        const response = await fetch(`/api/users/${id}`);
        const data = await response.json();
        return {
            success: true,
            data,
            timestamp: Date.now()
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            timestamp: Date.now()
        };
    }
}
```
```

---

## Test 10: Empty Code Block

```
Here's an empty code block:

```python
```

It should show a placeholder.
```

---

## Test 11: No Language Specified

```
Code without a language:

```
function test() {
    console.log("No language specified");
}
```

Should default to plain text.
```

---

## Test 12: Special Characters and Unicode

```
Testing special characters:

```python
# Unicode characters: 🚀 💻 ✨ 🎉
# Special chars: <>&"'

def test_unicode():
    emoji = "😀 😃 😄"
    special = "<div>&amp;</div>"
    return f"Emoji: {emoji}, Special: {special}"

# Tabs and spaces
def indented():
	if True:
		print("Mixed tabs")
    	print("and spaces")
```
```

---

## Test 13: Mixed Markdown and Code

```
# Complete Example

Let's build a simple API:

## Step 1: Define the model

```python
from dataclasses import dataclass
from datetime import datetime

@dataclass
class Task:
    id: int
    title: str
    completed: bool
    created_at: datetime
```

## Step 2: Create the API endpoint

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/tasks")
async def get_tasks():
    return [
        Task(1, "Learn Python", False, datetime.now()),
        Task(2, "Build API", True, datetime.now())
    ]
```

## Step 3: Test it

Run the server:

```bash
uvicorn main:app --reload
```

That's it! You now have a working API.
```

---

## Test 14: Unsupported Language

```
Testing with a fake language:

```fakeLanguage
this is not a real language
but it should still display
without errors or crashes
```

Should fall back to plain text rendering.
```

---

## Test 15: Code with Comments

```
Python with extensive comments:

```python
# This is a comment explaining the code
# It should be styled differently from regular code

def calculate_fibonacci(n):
    """
    Calculate the nth Fibonacci number.
    
    Args:
        n: The position in the Fibonacci sequence
        
    Returns:
        The nth Fibonacci number
    """
    # Base cases
    if n <= 0:
        return 0  # Return 0 for invalid input
    elif n == 1:
        return 1  # First Fibonacci number
    
    # Recursive case
    return calculate_fibonacci(n - 1) + calculate_fibonacci(n - 2)

# Test the function
for i in range(10):
    print(f"F({i}) = {calculate_fibonacci(i)}")  # Print results
```
```

---

## Instructions for Testing

1. **Open the application** in your browser (http://localhost:3000 or 3001)
2. **Copy each test message** above (one at a time)
3. **Paste into the chat** and send
4. **Verify the results** against the checklist in MANUAL_TEST_RESULTS.md
5. **Test the copy button** by clicking it and pasting into a text editor
6. **Test scrolling** by trying to scroll horizontally and vertically where applicable
7. **Check styling** to ensure it matches the dark theme
8. **Look for errors** in the browser console

## Key Things to Verify

- ✅ Syntax highlighting works for all languages
- ✅ Copy button copies raw code (no formatting)
- ✅ Horizontal scroll appears for long lines
- ✅ Vertical scroll appears for tall blocks (>500px)
- ✅ Empty blocks show placeholder
- ✅ Special characters display correctly
- ✅ Multiple blocks in one message work
- ✅ Mixed markdown and code renders properly
- ✅ No errors in console
- ✅ Styling matches dark theme
