import type { FC } from "react";

export interface NavItemType {
  label: string;
  href: string;
  icon?: FC<{ className?: string }>;
  badge?: number;
  items?: NavItemType[];
}
