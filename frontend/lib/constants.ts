export const ROUTE_PERMISSION_MAP: Record<string, string> = {
  '/dashboard': 'dashboard.view',
  '/users': 'users.manage',
  '/roles': 'roles.manage',
  '/permissions': 'permissions.manage',
  '/audit': 'audit.view',
  '/leads': 'leads.view',
  '/leads/manage': 'leads.manage',
  '/tasks': 'tasks.view',
  '/tasks/manage': 'tasks.manage',
  '/reports': 'reports.view',
  '/settings': 'settings.manage',
  '/portal': 'customer_portal.view',
};

export const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'DashboardIcon', // We'll map this to a real icon component later
    requiredAtom: 'dashboard.view',
  },
  {
    label: 'Users',
    href: '/users',
    icon: 'UsersIcon',
    requiredAtom: 'users.manage',
  },
  {
    label: 'Roles',
    href: '/roles',
    icon: 'ShieldIcon',
    requiredAtom: 'roles.manage',
  },
  {
    label: 'Permissions',
    href: '/permissions',
    icon: 'KeyIcon',
    requiredAtom: 'permissions.manage',
  },
  {
    label: 'Leads',
    href: '/leads',
    icon: 'TrendingUpIcon',
    requiredAtom: 'leads.view',
  },
  {
    label: 'Tasks',
    href: '/tasks',
    icon: 'CheckSquareIcon',
    requiredAtom: 'tasks.view',
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: 'BarChartIcon',
    requiredAtom: 'reports.view',
  },
  {
    label: 'Audit Log',
    href: '/audit',
    icon: 'ActivityIcon',
    requiredAtom: 'audit.view',
  },
  {
    label: 'Customer Portal',
    href: '/portal',
    icon: 'BriefcaseIcon',
    requiredAtom: 'customer_portal.view',
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: 'SettingsIcon',
    requiredAtom: 'settings.manage',
  },
];
