'use client';

import { useAuth } from '@/hooks/useAuth';
import { LogOut, Menu, Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/lib/constants';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Find active page label for the breadcrumb
  const activeItem = NAV_ITEMS.find((item) => pathname.startsWith(item.href));
  const pageLabel = activeItem?.label ?? 'Dashboard';

  return (
    <header
      className="h-16 flex items-center justify-between shrink-0 px-5 sm:px-6 lg:px-8"
      style={{
        background: 'var(--card-bg)',
        borderBottom: '1px solid var(--sidebar-border)',
      }}
    >
      {/* Left — mobile menu + page title */}
      <div className="flex items-center gap-3">
        <button
          id="mobile-menu-btn"
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 rounded-[8px] transition-colors hover:bg-gray-100"
          style={{ color: 'var(--muted-text)' }}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1
            className="font-onest font-semibold text-[16px] leading-tight"
            style={{ color: 'var(--dark-text)' }}
          >
            {pageLabel}
          </h1>
          {user?.firstName && (
            <p className="font-inter text-[12px] hidden sm:block" style={{ color: 'var(--subtle-text)' }}>
              Welcome back, {user.firstName}
            </p>
          )}
        </div>
      </div>

      {/* Right — notifications + user */}
      <div className="flex items-center gap-3">
        {/* Bell */}
        <button
          className="relative p-2 rounded-[8px] transition-colors hover:bg-gray-100"
          style={{ color: 'var(--muted-text)' }}
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
        </button>

        {/* Divider */}
        <div className="w-px h-7 bg-gray-200" />

        {/* User block */}
        <div className="hidden sm:flex flex-col items-end">
          <span
            className="font-inter font-medium text-[14px]"
            style={{ color: 'var(--dark-text)' }}
          >
            {user?.firstName} {user?.lastName}
          </span>
          <span
            className="font-inter text-[12px]"
            style={{ color: 'var(--subtle-text)' }}
          >
            {user?.role?.name || 'User'}
          </span>
        </div>

        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center font-onest font-semibold text-[14px] text-white shrink-0 shadow-sm"
          style={{ background: 'var(--brand)' }}
        >
          {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
        </div>

        {/* Logout */}
        <button
          id="logout-btn"
          onClick={logout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] text-[13px] font-inter font-medium transition-colors hover:bg-red-50"
          style={{ color: 'var(--muted-text)' }}
          title="Logout"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline" style={{ color: '#EF4444' }}>Logout</span>
        </button>
      </div>
    </header>
  );
}
