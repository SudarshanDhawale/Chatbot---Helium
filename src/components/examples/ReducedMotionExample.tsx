/**
 * Example component demonstrating how to use the usePrefersReducedMotion hook
 * to conditionally apply animations based on user preferences.
 * 
 * This is a reference implementation showing best practices for respecting
 * user accessibility preferences in React components.
 */

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export function ReducedMotionExample() {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold text-text-primary">
        Reduced Motion Example
      </h2>

      {/* Status indicator */}
      <div className={`p-4 rounded-lg ${
        prefersReducedMotion 
          ? 'bg-green-500/20 border border-green-500' 
          : 'bg-blue-500/20 border border-blue-500'
      }`}>
        <p className="text-text-primary font-semibold">
          {prefersReducedMotion 
            ? '✓ Reduced Motion is ENABLED' 
            : '✗ Reduced Motion is DISABLED (animations active)'}
        </p>
        <p className="text-text-secondary text-sm mt-2">
          {prefersReducedMotion
            ? 'Animations are disabled to respect your accessibility preferences.'
            : 'Animations are enabled. You can disable them in your system settings.'}
        </p>
      </div>

      {/* Example 1: Conditional animation class */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-text-primary">
          Example 1: Conditional Animation Class
        </h3>
        <div 
          className={`
            p-4 bg-navy-800 rounded-lg
            ${prefersReducedMotion ? '' : 'animate-fade-in'}
          `}
        >
          <p className="text-text-primary">
            This box uses the fade-in animation only when motion is allowed.
          </p>
        </div>
      </div>

      {/* Example 2: Conditional transition duration */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-text-primary">
          Example 2: Conditional Transition Duration
        </h3>
        <button
          className={`
            px-6 py-3 bg-blue-accent text-white rounded-lg
            hover:bg-blue-accent-hover
            ${prefersReducedMotion ? 'transition-none' : 'transition-all duration-200'}
          `}
        >
          Hover over me
        </button>
        <p className="text-text-secondary text-sm">
          {prefersReducedMotion
            ? 'Button changes color instantly on hover'
            : 'Button has smooth color transition on hover'}
        </p>
      </div>

      {/* Example 3: Alternative visual feedback */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-text-primary">
          Example 3: Alternative Visual Feedback
        </h3>
        <div className="flex gap-4">
          <div 
            className={`
              w-16 h-16 bg-blue-accent rounded-lg
              ${prefersReducedMotion 
                ? 'border-4 border-blue-accent-hover' 
                : 'animate-pulse'}
            `}
          />
          <div className="flex-1">
            <p className="text-text-primary">
              {prefersReducedMotion
                ? 'Static box with border for emphasis'
                : 'Pulsing animation to draw attention'}
            </p>
            <p className="text-text-secondary text-sm mt-1">
              When motion is reduced, use alternative visual cues like borders,
              colors, or icons instead of animations.
            </p>
          </div>
        </div>
      </div>

      {/* Example 4: Programmatic animation control */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-text-primary">
          Example 4: Programmatic Animation Control
        </h3>
        <div className="p-4 bg-navy-800 rounded-lg">
          <p className="text-text-primary mb-2">
            Animation duration: {prefersReducedMotion ? '0ms (instant)' : '300ms (smooth)'}
          </p>
          <p className="text-text-secondary text-sm">
            You can use the hook value to adjust animation parameters
            programmatically, such as setting duration to 0 or using
            different easing functions.
          </p>
        </div>
      </div>

      {/* Testing instructions */}
      <div className="mt-8 p-6 bg-navy-800 rounded-lg border border-navy-700">
        <h3 className="text-lg font-semibold text-text-primary mb-3">
          How to Test
        </h3>
        <div className="space-y-3 text-text-secondary text-sm">
          <div>
            <p className="font-semibold text-text-primary">Browser DevTools (Easiest):</p>
            <ol className="list-decimal list-inside ml-2 space-y-1">
              <li>Open DevTools (F12)</li>
              <li>Press Ctrl+Shift+P (Cmd+Shift+P on Mac)</li>
              <li>Type "Emulate CSS prefers-reduced-motion"</li>
              <li>Select "reduce" option</li>
              <li>Watch the status indicator update automatically</li>
            </ol>
          </div>
          <div>
            <p className="font-semibold text-text-primary">System Settings:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li><strong>macOS:</strong> System Settings → Accessibility → Display → Reduce motion</li>
              <li><strong>Windows:</strong> Settings → Accessibility → Visual effects → Animation effects (off)</li>
              <li><strong>Linux:</strong> Settings → Accessibility → Seeing → Reduce animation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
