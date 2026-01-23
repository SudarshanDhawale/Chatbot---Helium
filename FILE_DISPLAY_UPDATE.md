# File Display Update: Capsule Format

## Overview
Updated the file display system to show all files (images, documents, media) in a compact capsule format with icons, making the UI cleaner and more consistent.

## Changes Made

### 1. **AI-Generated Files (in responses)**
- **Before**: Images displayed inline at full size, other files in grid cards
- **After**: All files shown as compact capsules with:
  - File type icon
  - File name (truncated if too long)
  - File size
  - Hover effect
  - Click to preview (for images) or download (for other files)

### 2. **User-Uploaded Files (in prompts)**
- **Before**: Images displayed at full size above the message
- **After**: All uploaded files shown as capsules with:
  - File type icon (green for images, gray for documents)
  - File name
  - File size
  - Click to preview images

## Visual Design

### Capsule Format
```
┌─────────────────────────────────────┐
│ [Icon] filename.png  1.2 MB         │
└─────────────────────────────────────┘
```

- **Background**: Light blue (`bg-blue-50`)
- **Border**: Blue (`border-blue-200`)
- **Hover**: Slightly darker blue (`hover:bg-blue-100`)
- **Shape**: Fully rounded (`rounded-full`)
- **Padding**: Compact (`px-3 py-1.5`)

### Icons
- **Images**: Green image icon
- **PDFs**: Red document icon
- **Documents**: Blue document icon
- **Code files**: Purple code icon
- **Archives**: Yellow archive icon
- **Default**: Gray file icon

## User Experience

### For Generated Files
1. AI generates a file (image, document, etc.)
2. File appears as a capsule below the AI's message
3. Click the capsule to:
   - **Images**: Open full-size preview modal
   - **Documents**: Download the file

### For Uploaded Files
1. User uploads a file with their message
2. File appears as a capsule above their message text
3. Click the capsule to:
   - **Images**: Open full-size preview modal
   - **Documents**: No action (already uploaded)

## Benefits

1. **Cleaner UI**: No more large images taking up screen space
2. **Consistent Design**: All files look the same regardless of type
3. **Better Scanning**: Easy to see what files are in a conversation
4. **Mobile-Friendly**: Capsules work well on small screens
5. **Quick Access**: Click any file to preview or download

## Technical Details

### Components Updated
- `src/components/chat/FileList.tsx` - Renders AI-generated files
- `src/components/chat/ChatMessage.tsx` - Renders uploaded files

### Key Features
- **Lazy Loading**: Images fetched only when needed
- **API Key Auth**: Secure file access with stored API key
- **Error Handling**: Graceful fallback for failed loads
- **Loading States**: Spinner while fetching files
- **Preview Modal**: Full-size image viewing

## Example Usage

### AI Response with Image
```
AI: I've generated an image for you.

[🖼️ sports_car.png  245 KB]
```

### User Message with Upload
```
You: Check out this design

[🖼️ mockup.png  1.2 MB]
```

### AI Response with Multiple Files
```
AI: Here are the files you requested.

[📄 README.md  2.1 KB] [🖼️ logo.png  45 KB] [📦 project.zip  1.5 MB]
```

## Future Enhancements

Possible improvements:
- File type badges (NEW, UPDATED)
- Download progress indicators
- Bulk download option
- File organization/grouping
- Thumbnail previews on hover
