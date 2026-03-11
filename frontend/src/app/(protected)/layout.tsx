'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import PageWrapper from '@/components/layout/PageWrapper';
import { X } from 'lucide-react';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: 'var(--background)' }}>

      {/* Desktop sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar className="w-64" />
      </div>

      {/* Tablet icon-only sidebar */}
      <div className="hidden md:block lg:hidden shrink-0">
        <Sidebar className="w-[60px]" collapsed={true} />
      </div>

      {/* Mobile drawer overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="relative w-72 max-w-full flex flex-col shadow-2xl">
            <Sidebar className="w-full h-full" />

            {/* Close button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-3 p-1.5 rounded-[8px] transition-colors hover:bg-gray-100"
              style={{ color: 'var(--muted-text)' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        <PageWrapper>{children}</PageWrapper>
      </div>
    </div>
  );
}
