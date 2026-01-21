import { renderHook, act } from '@testing-library/react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

describe('usePrefersReducedMotion', () => {
  let mockMatchMedia: jest.Mock;
  let listeners: Array<(event: MediaQueryListEvent) => void>;

  beforeEach(() => {
    listeners = [];
    
    // Mock matchMedia
    mockMatchMedia = jest.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // Deprecated but still supported
      removeListener: jest.fn(), // Deprecated but still supported
      addEventListener: jest.fn((event: string, handler: (event: MediaQueryListEvent) => void) => {
        listeners.push(handler);
      }),
      removeEventListener: jest.fn((event: string, handler: (event: MediaQueryListEvent) => void) => {
        const index = listeners.indexOf(handler);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }),
      dispatchEvent: jest.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return false when prefers-reduced-motion is not set', () => {
    mockMatchMedia.mockReturnValue({
      matches: false,
      media: '(prefers-reduced-motion: reduce)',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });

    const { result } = renderHook(() => usePrefersReducedMotion());
    
    expect(result.current).toBe(false);
  });

  it('should return true when prefers-reduced-motion is enabled', () => {
    mockMatchMedia.mockReturnValue({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });

    const { result } = renderHook(() => usePrefersReducedMotion());
    
    expect(result.current).toBe(true);
  });

  it('should call matchMedia with correct query', () => {
    renderHook(() => usePrefersReducedMotion());
    
    expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
  });

  it('should add event listener for media query changes', () => {
    const addEventListener = jest.fn();
    mockMatchMedia.mockReturnValue({
      matches: false,
      media: '(prefers-reduced-motion: reduce)',
      addEventListener,
      removeEventListener: jest.fn(),
    });

    renderHook(() => usePrefersReducedMotion());
    
    expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should update when media query changes', () => {
    let changeHandler: ((event: MediaQueryListEvent) => void) | null = null;
    
    mockMatchMedia.mockReturnValue({
      matches: false,
      media: '(prefers-reduced-motion: reduce)',
      addEventListener: jest.fn((event: string, handler: (event: MediaQueryListEvent) => void) => {
        changeHandler = handler;
      }),
      removeEventListener: jest.fn(),
    });

    const { result } = renderHook(() => usePrefersReducedMotion());
    
    expect(result.current).toBe(false);

    // Simulate media query change
    act(() => {
      if (changeHandler) {
        changeHandler({ matches: true } as MediaQueryListEvent);
      }
    });

    expect(result.current).toBe(true);
  });

  it('should remove event listener on unmount', () => {
    const removeEventListener = jest.fn();
    let addedHandler: ((event: MediaQueryListEvent) => void) | null = null;

    mockMatchMedia.mockReturnValue({
      matches: false,
      media: '(prefers-reduced-motion: reduce)',
      addEventListener: jest.fn((event: string, handler: (event: MediaQueryListEvent) => void) => {
        addedHandler = handler;
      }),
      removeEventListener,
    });

    const { unmount } = renderHook(() => usePrefersReducedMotion());
    
    unmount();

    expect(removeEventListener).toHaveBeenCalledWith('change', addedHandler);
  });

  it('should handle SSR gracefully (no window)', () => {
    // Save original window
    const originalWindow = global.window;
    
    // Remove window to simulate SSR
    // @ts-ignore
    delete global.window;

    const { result } = renderHook(() => usePrefersReducedMotion());
    
    // Should return false as default when window is not available
    expect(result.current).toBe(false);

    // Restore window
    global.window = originalWindow;
  });

  it('should maintain state across re-renders', () => {
    mockMatchMedia.mockReturnValue({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });

    const { result, rerender } = renderHook(() => usePrefersReducedMotion());
    
    expect(result.current).toBe(true);

    rerender();

    expect(result.current).toBe(true);
  });
});
