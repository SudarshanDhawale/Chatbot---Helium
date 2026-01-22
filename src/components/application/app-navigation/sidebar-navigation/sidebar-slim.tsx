'use client';

import { useState } from 'react';
import type { FC } from 'react';
import type { NavItemType } from '../config';

interface SidebarNavigationSlimProps {
  items: (NavItemType & { icon: FC<{ className?: string }> })[];
  footerItems?: (NavItemType & { icon: FC<{ className?: string }> })[];
}

export const SidebarNavigationSlim: FC<SidebarNavigationSlimProps> = ({
  items,
  footerItems = [],
}) => {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const toggleExpand = (label: string) => {
    setExpandedItem(expandedItem === label ? null : label);
  };

  return (
    <aside className="w-20 bg-navy-950 border-r border-navy-700 flex flex-col items-center py-4 relative">
      {/* Main navigation items */}
      <nav className="flex-1 flex flex-col gap-2 w-full px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isExpanded = expandedItem === item.label;
          const isHovered = hoveredItem === item.label;
          const hasSubItems = item.items && item.items.length > 0;

          return (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => setHoveredItem(item.label)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {/* Main item button */}
              <button
                onClick={() => hasSubItems && toggleExpand(item.label)}
                className="w-full h-14 flex flex-col items-center justify-center gap-1 rounded-lg hover:bg-navy-800 transition-colors relative group"
                aria-label={item.label}
                title={item.label}
              >
                <Icon className="w-6 h-6 text-gray-400 group-hover:text-gray-200" />
                <span className="text-xs text-gray-500 group-hover:text-gray-300">
                  {item.label}
                </span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>

              {/* Submenu - shown on hover or when expanded */}
              {hasSubItems && (isHovered || isExpanded) && (
                <div className="absolute left-full top-0 ml-2 bg-navy-900 border border-navy-700 rounded-lg shadow-xl min-w-[200px] z-50 py-2">
                  <div className="px-3 py-2 border-b border-navy-700">
                    <p className="text-sm font-bold text-gray-200">{item.label}</p>
                  </div>
                  {item.items?.map((subItem) => {
                    const SubIcon = subItem.icon;
                    return (
                      <a
                        key={subItem.href}
                        href={subItem.href}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-navy-800 transition-colors"
                      >
                        {SubIcon && <SubIcon className="w-4 h-4 text-gray-400" />}
                        <span className="text-sm text-gray-300">{subItem.label}</span>
                        {subItem.badge !== undefined && subItem.badge > 0 && (
                          <span className="ml-auto bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                            {subItem.badge}
                          </span>
                        )}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer items */}
      {footerItems.length > 0 && (
        <div className="flex flex-col gap-2 w-full px-2 border-t border-navy-700 pt-4">
          {footerItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href={item.href}
                className="w-full h-14 flex flex-col items-center justify-center gap-1 rounded-lg hover:bg-navy-800 transition-colors group"
                aria-label={item.label}
                title={item.label}
              >
                <Icon className="w-6 h-6 text-gray-400 group-hover:text-gray-200" />
                <span className="text-xs text-gray-500 group-hover:text-gray-300">
                  {item.label}
                </span>
              </a>
            );
          })}
        </div>
      )}
    </aside>
  );
};
