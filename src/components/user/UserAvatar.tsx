/**
 * User Avatar Component
 * Displays a circular user avatar with fallback to initials
 */

'use client';

import { useState } from 'react';

interface UserAvatarProps {
  /** Avatar image URL (optional) */
  avatarUrl?: string;
  /** User name for generating initials */
  userName?: string;
  /** Avatar size in pixels (default: 36px) */
  size?: number;
  /** Click handler for avatar interaction */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** ARIA expanded state for dropdown menus */
  'aria-expanded'?: boolean;
  /** ARIA haspopup attribute for dropdown menus */
  'aria-haspopup'?: boolean | 'true' | 'false' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  /** ARIA label override */
  'aria-label'?: string;
}

/**
 * Get initials from a name
 * @param name - Full name
 * @returns Two-letter initials
 */
function getInitials(name: string): string {
  if (!name) return 'U';
  
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function UserAvatar({
  avatarUrl,
  userName = 'User',
  size = 36,
  onClick,
  className = '',
  'aria-expanded': ariaExpanded,
  'aria-haspopup': ariaHaspopup,
  'aria-label': ariaLabel,
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const initials = getInitials(userName);
  const showInitials = !avatarUrl || imageError;

  return (
    <button
      onClick={onClick}
      className={`
        relative flex items-center justify-center
        rounded-full overflow-hidden
        bg-gradient-to-br from-blue-500 to-blue-600
        hover:from-blue-600 hover:to-blue-700
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900
        ${className}
      `}
      style={{ width: size, height: size }}
      aria-label={ariaLabel || `${userName}'s profile`}
      aria-expanded={ariaExpanded}
      aria-haspopup={ariaHaspopup}
      title={userName}
    >
      {showInitials ? (
        <span
          className="text-white font-bold select-none"
          style={{ fontSize: size * 0.4 }}
        >
          {initials}
        </span>
      ) : (
        <img
          src={avatarUrl}
          alt={userName}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      )}
    </button>
  );
}
