import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePermission } from '@/hooks/usePermission';
import { NAV_ITEMS } from '@/lib/constants';
import * as Icons from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-64 bg-slate-900 text-slate-300 flex flex-col transition-all duration-300">
      
      {/* Sidebar Header / Logo area */}
      <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
        <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center mr-3">
          <Icons.Shield className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-bold text-white tracking-wide">RBAC Admin</span>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
        {NAV_ITEMS.map((item) => {
          // Rule: Filters items using `usePermission(item.requiredAtom)`. 
          // Items whose atom is absent are not rendered.
          const hasAccess = usePermission(item.requiredAtom);
          
          if (!hasAccess) return null;

          const isActive = pathname.startsWith(item.href);
          
          // Dynamically grab the Lucide icon by name matching constants
          // Defaulting to Circle if icon name is mismatched
          const IconComponent = (Icons as any)[item.icon] || Icons.Circle;

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
                className={`w-5 h-5 mr-3 shrink-0 ${
                  isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-300'
                }`} 
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
      
      {/* Sidebar Footer (Optional decoration/meta) */}
      <div className="p-4 border-t border-white/10">
        <div className="bg-white/5 rounded-lg p-3 text-xs text-slate-400">
          <p className="font-medium text-slate-300 mb-1">Internal System</p>
          <p>v1.0.0-beta</p>
        </div>
      </div>
    </aside>
  );
}
