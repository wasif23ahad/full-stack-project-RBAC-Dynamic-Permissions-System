import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { NAV_ITEMS } from '@/lib/constants';
import * as Icons from 'lucide-react';

interface SidebarProps {
  className?: string;
  isCollapsedClass?: string;
}

export default function Sidebar({ className = "w-64", isCollapsedClass = "" }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className={`h-screen bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 ${className} ${isCollapsedClass}`}>
      
      {/* Sidebar Header / Logo area */}
      <div className="h-16 flex items-center px-4 md:px-6 border-b border-white/10 shrink-0 overflow-hidden">
        <div className="w-8 h-8 shrink-0 bg-blue-500 rounded-md flex items-center justify-center mr-3">
          <Icons.Shield className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-bold text-white tracking-wide truncate group-[.md:max-lg:w-16]:md:max-lg:hidden">RBAC Admin</span>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
        {NAV_ITEMS.map((item) => {
          // Rule: Filters items using user object directly
          const hasAccess = user?.permissions?.includes(item.requiredAtom) ?? false;
          
          if (!hasAccess) return null;

          const isActive = pathname.startsWith(item.href);
          
          // Dynamically grab the Lucide icon by name matching constants
          const iconName = item.icon as keyof typeof Icons;
          const IconComponent = (Icons[iconName] as React.ElementType) || Icons.Circle;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2.5 rounded-lg transition-colors group ${
                isActive 
                  ? 'bg-blue-600/10 text-blue-400 font-medium' 
                  : 'hover:bg-white/5 hover:text-white'
              }`}
            >
              <IconComponent 
                className={`w-5 h-5 shrink-0 ${
                  isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-300'
                } group-[.md:max-lg:w-16]:md:max-lg:mx-auto`} 
              />
              <span className="truncate ml-3 group-[.md:max-lg:w-16]:md:max-lg:hidden">{item.label}</span>
            </Link>
          );
        })}
      </div>
      
      {/* Sidebar Footer (Optional decoration/meta) */}
      <div className="p-4 border-t border-white/10 group-[.md:max-lg:w-16]:md:max-lg:hidden overflow-hidden shrink-0">
        <div className="bg-white/5 rounded-lg p-3 text-xs text-slate-400 truncate">
          <p className="font-medium text-slate-300 mb-1">Internal System</p>
          <p>v1.0.0-beta</p>
        </div>
      </div>
    </aside>
  );
}
