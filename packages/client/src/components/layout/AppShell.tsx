import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  LayoutDashboard,
  FolderCode,
  GitCompareArrows,
  Sparkles,
  FileSpreadsheet,
  ClipboardList,
  Users,
  Blocks,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon,
  LogOut,
  AlertTriangle,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MotionButton, PageTransition } from '../motion/primitives';
import { api } from '../../lib/api';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  isDemo?: boolean;
}

const PRIMARY_NAV: NavItem[] = [
  { label: 'Overview', path: '/', icon: <LayoutDashboard size={16} /> },
  { label: 'Submissions', path: '/submissions', icon: <FolderCode size={16} /> },
  { label: 'Similarity', path: '/similarity', icon: <GitCompareArrows size={16} /> },
  { label: 'AI Signals', path: '/ai-signals', icon: <Sparkles size={16} /> },
  { label: 'Reports', path: '/reports', icon: <FileSpreadsheet size={16} /> },
];

const DEMO_NAV: NavItem[] = [
  { label: 'Assessments', path: '/assessments', icon: <ClipboardList size={16} />, isDemo: true },
  { label: 'Team', path: '/team', icon: <Users size={16} />, isDemo: true },
  { label: 'Integrations', path: '/integrations', icon: <Blocks size={16} />, isDemo: true },
  { label: 'Settings', path: '/settings', icon: <Settings size={16} />, isDemo: true },
];

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, authChecked, theme, toggleTheme, dbDegraded, dismissDbBanner, setUser } =
    useApp();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  // Do not flash protected layout before session verification completes
  if (!authChecked || !user) {
    return (
      <div
        style={{
          height: '100vh',
          backgroundColor: 'var(--bg-base)',
          display: 'grid',
          gridTemplateColumns: '240px 1fr',
        }}
      >
        <div className="skeleton-shimmer" style={{ borderRadius: 0 }} />
        <div style={{ padding: 'var(--space-8)' }}>
          <div className="skeleton-shimmer" style={{ height: 32, width: 240, marginBottom: 24 }} />
          <div className="skeleton-shimmer" style={{ height: 180, width: '100%' }} />
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    if (import.meta.env.DEV) {
      navigate('/', { replace: true });
      return;
    }
    await api.logout().catch(() => undefined);
    setUser(null);
    navigate('/auth', { replace: true });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-base)',
      }}
    >
      {/* Persistent Degraded Database Banner */}
      {dbDegraded && (
        <div
          role="status"
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.14)',
            borderBottom: '1px solid var(--risk-suspicious)',
            color: 'var(--text-primary)',
            padding: 'var(--space-2) var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 'var(--text-xs)',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <AlertTriangle size={14} color="var(--risk-suspicious)" />
            Database connection unavailable. Some features may not work correctly.
          </span>
          <MotionButton
            type="button"
            onClick={dismissDbBanner}
            aria-label="Dismiss database status banner"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={14} />
          </MotionButton>
        </div>
      )}

      {import.meta.env.DEV && (
        <div
          role="status"
          style={{
            backgroundColor: 'rgba(99, 102, 241, 0.12)',
            borderBottom: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            padding: 'var(--space-2) var(--space-4)',
            fontSize: 'var(--text-xs)',
          }}
        >
          Local preview · authentication bypassed. Sample analysis is loaded locally; uploads need the API.
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Left Navigation Rail */}
        <motion.aside
          layout={!reduced}
          animate={{ width: collapsed ? 48 : 240 }}
          transition={reduced ? { duration: 0 } : { duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          <div>
            {/* Brand Header */}
            <div
              style={{
                height: 48,
                padding: '0 var(--space-3)',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
              }}
            >
              <div
                className="mono"
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 'var(--radius-control)',
                  backgroundColor: 'var(--accent)',
                  color: '#FAFAFA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 'var(--text-xs)',
                  flexShrink: 0,
                }}
              >
                Z
              </div>
              {!collapsed && (
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: 'var(--text-sm)',
                    letterSpacing: '-0.02em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Zixie Integrity
                </span>
              )}
            </div>

            {/* Primary Routes */}
            <nav
              aria-label="Primary Workspace Navigation"
              style={{ padding: 'var(--space-2) 0', display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              {[...PRIMARY_NAV, ...DEMO_NAV].map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  title={collapsed ? item.label : undefined}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    height: 36,
                    padding: collapsed ? '0 14px' : '0 var(--space-3)',
                    textDecoration: 'none',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                    borderLeft: isActive
                      ? '2px solid var(--accent)'
                      : '2px solid transparent',
                    fontSize: 'var(--text-sm)',
                    fontWeight: isActive ? 500 : 400,
                    whiteSpace: 'nowrap',
                  })}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    {item.icon}
                    {!collapsed && <span>{item.label}</span>}
                  </span>
                  {!collapsed && item.isDemo && (
                    <span
                      className="mono"
                      style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-control)',
                        padding: '0 4px',
                      }}
                    >
                      Demo
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Rail Footer: User Avatar Initial, Theme Toggle, Collapse Toggle */}
          <div
            style={{
              borderTop: '1px solid var(--border-subtle)',
              padding: 'var(--space-2)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'space-between',
                gap: 'var(--space-2)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  minWidth: 0,
                }}
              >
                <div
                  className="mono"
                  title={user.email}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 'var(--radius-control)',
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                </div>
                {!collapsed && (
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <div
                      style={{
                        fontSize: 'var(--text-xs)',
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {user.name}
                    </div>
                    <div
                      className="mono"
                      style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--text-muted)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {user.email}
                    </div>
                  </div>
                )}
              </div>

              {!collapsed && (
                <MotionButton
                  type="button"
                  onClick={handleLogout}
                  title="Sign out"
                  aria-label="Sign out"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: 'var(--space-1)',
                  }}
                >
                  <LogOut size={14} />
                </MotionButton>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'space-between',
                gap: 'var(--space-1)',
              }}
            >
              <MotionButton
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle color theme"
                title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                className="zixie-button"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-secondary)',
                  padding: 'var(--space-1) var(--space-2)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-1)',
                  fontSize: 'var(--text-xs)',
                }}
              >
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                {!collapsed && <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>}
              </MotionButton>

              <MotionButton
                type="button"
                onClick={() => setCollapsed((c) => !c)}
                aria-label={collapsed ? 'Expand navigation rail' : 'Collapse navigation rail'}
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                className="zixie-button"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-secondary)',
                  padding: 'var(--space-1) var(--space-2)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                {collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
              </MotionButton>
            </div>
          </div>
        </motion.aside>

        {/* Main Workspace Scroll Container */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'var(--space-6)',
            minWidth: 0,
          }}
        >
          <PageTransition routeKey={location.pathname}>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
};
