'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { NAV_ITEMS } from '@/lib/constants';
import * as Icons from 'lucide-react';

interface SidebarProps {
  className?: string;
  collapsed?: boolean;
}

export default function Sidebar({ className = 'w-64', collapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside
      className={`h-screen flex flex-col transition-all duration-300 ${className}`}
      style={{
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-border)',
      }}
    >
      {/* Logo / Brand */}
      <div
        className="h-16 flex items-center shrink-0 overflow-hidden"
        style={{ borderBottom: '1px solid var(--sidebar-border)', padding: collapsed ? '0 14px' : '0 20px' }}
      >
        <div
          className="w-9 h-9 shrink-0 flex items-center justify-center rounded-[10px]"
          style={{ background: 'var(--brand)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        {!collapsed && (
          <span
            className="ml-3 font-onest font-semibold text-[16px] truncate"
            style={{ color: 'var(--dark-text)' }}
          >
            RBAC Admin
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const hasAccess = user?.permissions?.includes(item.requiredAtom) ?? false;
          if (!hasAccess) return null;

          const isActive = pathname.startsWith(item.href);
          const iconName = item.icon as keyof typeof Icons;
          const IconComponent = (Icons[iconName] as React.ElementType) || Icons.Circle;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center rounded-[10px] transition-all duration-150 group
                ${collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5 gap-3'}
                ${isActive ? '' : 'hover:bg-gray-50'}
              `}
              style={
                isActive
                  ? {
                      background: '#FFF3EE',
                      color: 'var(--brand)',
                    }
                  : { color: 'var(--mid-text)' }
              }
            >
              <IconComponent
                className="w-[18px] h-[18px] shrink-0 transition-colors"
                style={{ color: isActive ? 'var(--brand)' : 'var(--muted-text)' }}
              />
              {!collapsed && (
                <span
                  className={`text-[14px] font-inter truncate transition-colors ${isActive ? 'font-medium' : 'font-normal group-hover:text-dark-text'}`}
                >
                  {item.label}
                </span>
              )}
              {/* Active left accent */}
              {isActive && !collapsed && (
                <span
                  className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: 'var(--brand)' }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer — user info */}
      {!collapsed && (
        <div
          className="p-4 shrink-0"
          style={{ borderTop: '1px solid var(--sidebar-border)' }}
        >
          <div className="flex items-center gap-3 px-2 py-2 rounded-[10px] bg-gray-50">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-onest font-semibold text-sm text-white"
              style={{ background: 'var(--brand)' }}
            >
              {user?.firstName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-inter font-medium text-[13px] text-dark-text truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="font-inter text-[11px] text-subtle-text truncate">
                {user?.role?.name || 'User'}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
