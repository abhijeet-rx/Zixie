import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/cn';
import { Button } from './button';
import { ThemeToggle } from './ThemeToggle';
import { useAuthStore } from '../../store/auth';

const navItems = [
  { to: '/', label: 'Overview' },
  { to: '/assessments', label: 'Assessments' },
  { to: '/submissions', label: 'Submissions' },
  { to: '/similarity', label: 'Similarity' },
  { to: '/ai-detection', label: 'AI Detection' },
  { to: '/reports', label: 'Reports' },
  { to: '/team', label: 'Team' },
  { to: '/integrations', label: 'Integrations' },
  { to: '/settings', label: 'Settings' },
];

export function SidebarNav({ onLogout }: { onLogout: () => void }) {
  const user = useAuthStore((s) => ({ name: s.userName }));
  return (
    <aside className="w-64 bg-white dark:bg-z-surface-2 border-r border-z-border flex flex-col h-full">
      <div className="p-4 flex items-center justify-between border-b border-z-border">
        <h2 className="text-xl font-semibold">Zixie</h2>
        <ThemeToggle />
      </div>
      <nav className="flex-1 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              cn(
                'block px-4 py-2 text-sm hover:bg-z-surface-3',
                isActive ? 'bg-z-surface-3 font-medium' : 'text-z-text-primary',
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-z-border flex items-center justify-between">
        <span className="text-sm font-medium">{user.name || 'User'}</span>
        <Button variant="ghost" size="sm" onClick={onLogout}>
          Logout
        </Button>
      </div>
    </aside>
  );
}
