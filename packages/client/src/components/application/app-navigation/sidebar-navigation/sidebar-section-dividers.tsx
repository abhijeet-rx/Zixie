import React, { useState } from 'react';
import { ChevronDown, ChevronRight, LogOut, Search } from 'lucide-react';
import type { NavItemType, NavItemDividerType } from '../config';

interface SidebarNavigationProps {
  activeUrl?: string;
  items: (NavItemType | NavItemDividerType)[];
  onNavigate?: (href: string) => void;
  user?: {
    name: string;
    email: string;
    role?: string;
  };
  onLogout?: () => void;
  className?: string;
}

export function SidebarNavigationSectionDividers({
  activeUrl = '/dashboard',
  items,
  onNavigate,
  user = {
    name: 'Abhijeet',
    email: 'abhijeet@zixie.io',
    role: 'Head TA & Proctor',
  },
  onLogout,
  className = '',
}: SidebarNavigationProps) {
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    Folders: true,
  });

  const toggleFolder = (label: string) => {
    setOpenFolders((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleClick = (e: React.MouseEvent, href: string) => {
    if (href.startsWith('http')) return; // external link
    e.preventDefault();
    if (onNavigate) {
      onNavigate(href);
    }
  };

  return (
    <aside
      className={`w-72 bg-white border-r border-slate-200 flex flex-col justify-between h-full font-sans select-none shrink-0 ${className}`}
    >
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Brand Header */}
        <div className="p-5 pb-3 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm shadow-blue-500/20 shrink-0">
              Z
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 text-base tracking-tight leading-none">
                Zixie
              </span>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
                Integrity Engine
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-slate-100 text-slate-600 rounded-md border border-slate-200">
            v0.1.0
          </span>
        </div>

        {/* Quick Search */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search navigation..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Navigation List */}
        <nav className="px-3 py-2 space-y-1 flex-1">
          {items.map((item, idx) => {
            if ('divider' in item && item.divider) {
              return (
                <div key={`divider-${idx}`} className="py-2">
                  <hr className="border-slate-200" />
                </div>
              );
            }

            const navItem = item as NavItemType;
            const Icon = navItem.icon;
            const hasChildren = navItem.items && navItem.items.length > 0;
            const isOpen = !!openFolders[navItem.label];
            const isActive = activeUrl === navItem.href;

            return (
              <div key={navItem.label} className="space-y-1">
                <a
                  href={navItem.href}
                  onClick={(e) => {
                    if (hasChildren) {
                      e.preventDefault();
                      toggleFolder(navItem.label);
                    } else {
                      handleClick(e, navItem.href);
                    }
                  }}
                  className={`flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer group ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {Icon && (
                      <Icon
                        size={18}
                        className={`w-4.5 h-4.5 shrink-0 transition-colors ${
                          isActive
                            ? 'text-blue-600'
                            : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      />
                    )}
                    <span className="truncate">{navItem.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {navItem.badge && <span>{navItem.badge}</span>}
                    {hasChildren && (
                      <span className="text-slate-400 group-hover:text-slate-600">
                        {isOpen ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </span>
                    )}
                  </div>
                </a>

                {/* Sub-items if accordion is open */}
                {hasChildren && isOpen && (
                  <div className="pl-9 pr-2 py-1 space-y-1 border-l-2 border-slate-100 ml-4">
                    {navItem.items!.map((sub) => {
                      const isSubActive = activeUrl === sub.href;
                      return (
                        <a
                          key={sub.label}
                          href={sub.href}
                          onClick={(e) => handleClick(e, sub.href)}
                          className={`flex items-center justify-between py-1.5 px-2 rounded-md text-xs transition-colors cursor-pointer ${
                            isSubActive
                              ? 'text-blue-700 font-semibold bg-blue-50/60'
                              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                          }`}
                        >
                          <span className="truncate">{sub.label}</span>
                          {sub.badge !== undefined && (
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
                              {sub.badge}
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
      </div>

      {/* User Account Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/70">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-200 shadow-2xs">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-900 truncate">
                {user.name}
              </span>
              <span className="text-[11px] text-slate-500 truncate font-mono">
                {user.email}
              </span>
            </div>
          </div>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
