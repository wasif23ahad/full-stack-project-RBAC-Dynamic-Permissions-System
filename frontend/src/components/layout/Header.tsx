'use client';

import { useAuth } from '@/hooks/useAuth';
import { LogOut, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 relative z-10 shadow-sm">
      <div className="flex items-center">
        {/* Mobile menu toggle (wired in Task 8c later) */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 mr-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold text-neutral-900 hidden sm:block">
          Welcome{user?.firstName ? `, ${user.firstName}` : ''}
        </h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-sm font-medium text-neutral-900">
            {user?.firstName} {user?.lastName}
          </span>
          <span className="text-xs text-neutral-500 font-medium tracking-wide">
            {/* Display user's role */}
            {user?.role?.name || 'User'}
          </span>
        </div>
        
        {/* Simple Avatar */}
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200 shadow-sm">
          {user?.firstName?.charAt(0) || 'U'}
        </div>
        
        <div className="w-px h-8 bg-neutral-200 mx-2"></div>
        
        <button
          onClick={logout}
          className="flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors p-2 rounded-md hover:bg-neutral-50"
          title="Logout"
        >
          <LogOut className="w-5 h-5 sm:mr-2" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
