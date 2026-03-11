'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import PageWrapper from '@/components/layout/PageWrapper';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* Desktop & Tablet Sidebar */}
      <div className="hidden md:block shrink-0">
        <Sidebar className="w-16 lg:w-64" isCollapsedClass="md:max-lg:w-16" />
      </div>

      {/* Mobile Sidebar overlay (Wired in Task 8c mostly, but structure can be here) */}
      {/* For now, just a basic drawer wrapper if opened */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Overlay background */}
          <div 
            className="fixed inset-0 bg-slate-900/80 transition-opacity" 
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          
          <div className="relative flex w-full max-w-xs flex-1 bg-slate-900">
            {/* Close button inside drawer */}
            <div className="absolute right-0 top-0 flex w-16 justify-center pt-5 -mr-16">
              <button
                type="button"
                className="-m-2.5 p-2.5"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <Sidebar className="w-64" />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        <PageWrapper>{children}</PageWrapper>
      </div>
    </div>
  );
}
