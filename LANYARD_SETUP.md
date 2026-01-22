# 3D Lanyard Component Setup

The Lanyard component has been successfully integrated into your ChatInput component at the bottom-right position of the outer text field card.

## What's Been Done

1. ✅ Installed required dependencies:
   - @react-three/fiber
   - @react-three/drei
   - @react-three/rapier
   - meshline
   - three

2. ✅ Created component structure:
   - `src/components/lanyard/Lanyard.tsx` - Main component
   - `src/components/lanyard/Lanyard.css` - Styling
   - `src/global.d.ts` - TypeScript declarations

3. ✅ Updated configurations:
   - `next.config.js` - Added webpack config for .glb files
   - `src/components/chat/ChatInput.tsx` - Integrated Lanyard component

4. ✅ Created asset folder:
   - `src/assets/lanyard/` - For 3D model and texture files

## Required Assets

To make the component fully functional, you need to add these files to `src/assets/lanyard/`:

### 1. card.glb
The 3D model file for the ID card. You can:
- Download from the React Bits repository
- Create your own using Blender or other 3D tools
- Edit online at: https://modelviewer.dev/editor/

The model should contain:
- Meshes: `card`, `clip`, `clamp`
- Materials: `base` (with texture map), `metal`

### 2. lanyard.png
The texture image for the lanyard band. This can be any image you want to display on the band.

## Current State

The component is currently using a **placeholder white card** since the actual 3D assets aren't loaded yet. Once you add the `card.glb` and `lanyard.png` files to `src/assets/lanyard/`, the component will automatically use them.

## Testing

To test the component:

```bash
npm run dev
```

Then navigate to your chat interface. You should see a 3D lanyard hanging at the bottom-right of the text input card. You can:
- Drag the card with your mouse
- Watch it swing with physics simulation
- See it respond to gravity

## Customization

You can customize the Lanyard component in `ChatInput.tsx`:

```tsx
<Lanyard 
  position={[0, 0, 20]}    // Camera position [x, y, z]
  gravity={[0, -40, 0]}    // Gravity force [x, y, z]
  fov={20}                 // Field of view
  transparent={true}       // Transparent background
/>
```

## Troubleshooting

If you see errors:
1. Make sure all dependencies are installed: `npm install`
2. Restart the dev server: `npm run dev`
3. Check browser console for specific errors
4. Ensure the asset files are in the correct location

## Notes

- The component uses dynamic import with SSR disabled to prevent server-side rendering issues
- Physics simulation is optimized for mobile devices (lower frame rate)
- The component is positioned absolutely within the outer card container
