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
    icon: 'LayoutDashboard', 
    requiredAtom: 'dashboard.view',
  },
  {
    label: 'Users',
    href: '/users',
    icon: 'Users',
    requiredAtom: 'users.manage',
  },
  {
    label: 'Roles',
    href: '/roles',
    icon: 'Shield',
    requiredAtom: 'roles.manage',
  },
  {
    label: 'Permissions',
    href: '/permissions',
    icon: 'Key',
    requiredAtom: 'permissions.manage',
  },
  {
    label: 'Leads',
    href: '/leads',
    icon: 'TrendingUp',
    requiredAtom: 'leads.view',
  },
  {
    label: 'Tasks',
    href: '/tasks',
    icon: 'CheckSquare',
    requiredAtom: 'tasks.view',
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: 'BarChart',
    requiredAtom: 'reports.view',
  },
  {
    label: 'Audit Log',
    href: '/audit',
    icon: 'Activity',
    requiredAtom: 'audit.view',
  },
  {
    label: 'Customer Portal',
    href: '/portal',
    icon: 'Briefcase',
    requiredAtom: 'customer_portal.view',
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: 'Settings',
    requiredAtom: 'settings.manage',
  },
];
