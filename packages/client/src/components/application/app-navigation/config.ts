import React from 'react';

export interface NavSubItemType {
  label: string;
  href: string;
  badge?: number | string;
}

export interface NavItemType {
  label: string;
  href: string;
  icon?: React.ComponentType<any>;
  badge?: React.ReactNode;
  items?: NavSubItemType[];
}

export interface NavItemDividerType {
  divider: true;
}

export type NavItemOrDivider = NavItemType | NavItemDividerType;
