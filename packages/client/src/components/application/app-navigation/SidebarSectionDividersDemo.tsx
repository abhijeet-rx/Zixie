import {
  LayoutDashboard,
  ClipboardCheck,
  Inbox,
  GitCompare,
  Bot,
  FileText,
  Users,
  Boxes,
  Settings,
} from 'lucide-react';
import type { NavItemOrDivider } from "@/components/application/app-navigation/config";
import { SidebarNavigationSectionDividers } from "@/components/application/app-navigation/sidebar-navigation/sidebar-section-dividers";

export const navItemsWithDividers: NavItemOrDivider[] = [
  { header: 'WORKSPACE' },
  {
    label: 'Overview',
    href: '/overview',
    icon: LayoutDashboard,
  },
  {
    label: 'Assessments',
    href: '/assessments',
    icon: ClipboardCheck,
    badge: (
      <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-600 rounded-md border border-slate-200">
        4
      </span>
    ),
  },
  {
    label: 'Submissions',
    href: '/submissions',
    icon: Inbox,
    badge: (
      <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-blue-100 text-blue-700 rounded-md border border-blue-200">
        8
      </span>
    ),
  },
  {
    label: 'Similarity Analysis',
    href: '/similarity',
    icon: GitCompare,
  },
  {
    label: 'AI Detection',
    href: '/ai-detection',
    icon: Bot,
    badge: (
      <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-purple-100 text-purple-700 rounded-md border border-purple-200">
        AI
      </span>
    ),
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: FileText,
  },
  { divider: true },
  { header: 'ADMINISTRATION' },
  {
    label: 'Team & Members',
    href: '/admin/team',
    icon: Users,
    badge: (
      <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-600 rounded-md border border-slate-200">
        6
      </span>
    ),
  },
  {
    label: 'Integrations',
    href: '/admin/integrations',
    icon: Boxes,
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

export const SidebarSectionDividersDemo = () => (
  <SidebarNavigationSectionDividers activeUrl="/overview" items={navItemsWithDividers} />
);
