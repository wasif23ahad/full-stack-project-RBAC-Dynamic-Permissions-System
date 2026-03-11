import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Users, UserSquare2, Target, CheckSquare, Activity } from 'lucide-react';

async function getAccessToken() {
  const cookieStore = cookies();
  const refreshCookie = cookieStore.get('refreshToken');
  if (!refreshCookie) return null;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        Cookie: `refreshToken=${refreshCookie.value}`,
      },
      cache: 'no-store'
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.accessToken;
  } catch {
    return null;
  }
}

async function fetchDashboardData(token: string) {
  try {
    // We fetch Users and Audit logs in parallel.
    // For Leads and Tasks, since backend endpoints may not exist yet, we mock for now or handle missing.
    const [usersRes, auditRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/users?limit=1`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/audit?limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
    ]);

    const usersData = usersRes.ok ? await usersRes.json() : null;
    const auditData = auditRes.ok ? await auditRes.json() : null;

    return {
      totalUsers: usersData?.meta?.total || 0,
      activeAgents: 0, // Mocked until leads/tasks endpoints exist
      openLeads: 0,
      openTasks: 0,
      recentActivity: auditData?.data || []
    };
  } catch {
    return {
      totalUsers: 0, activeAgents: 0, openLeads: 0, openTasks: 0, recentActivity: []
    };
  }
}

export default async function DashboardPage() {
  const token = await getAccessToken();
  if (!token) {
    redirect('/login');
  }

  const data = await fetchDashboardData(token);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Dashboard</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Overview of your system activity and key metrics.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-neutral-500">Total Users</h3>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-neutral-900 mt-4">{data.totalUsers}</p>
        </div>
        
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-neutral-500">Active Agents</h3>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <UserSquare2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-neutral-900 mt-4">{data.activeAgents}</p>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-neutral-500">Open Leads</h3>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-neutral-900 mt-4">{data.openLeads}</p>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-neutral-500">Open Tasks</h3>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-neutral-900 mt-4">{data.openTasks}</p>
        </div>
      </div>

      {/* Main Content Area - Activity Feed */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-neutral-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-neutral-900 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-neutral-400" />
            Recent Activity
          </h2>
        </div>
        
        <div className="divide-y divide-neutral-200 max-h-[500px] overflow-y-auto">
          {data.recentActivity.length > 0 ? (
            data.recentActivity.map((log: {
              id: string;
              actorName: string;
              action: string;
              targetType: string;
              targetId: string;
              createdAt: string;
              metadata: Record<string, unknown>;
            }) => (
              <div key={log.id} className="p-6 hover:bg-neutral-50 transition-colors">
                <div className="flex space-x-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0">
                     <span className="text-sm font-bold text-slate-600">
                       {log.actorName?.charAt(0) || 'U'}
                     </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-neutral-900">
                      <span className="font-semibold">{log.actorName || 'System'}</span>
                      {' '}
                      <span className="text-neutral-600">{log.action.toLowerCase().replace('_', ' ')}</span>
                      {' '}
                      <span className="font-medium text-neutral-900">{log.targetType.toLowerCase()}</span>
                      {log.targetId && <span className="text-neutral-500"> (ID: {log.targetId.split('-')[0]}...)</span>}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="mt-2 text-xs bg-slate-50 p-2 rounded border border-slate-100 text-slate-600 overflow-x-auto">
                        <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-neutral-500">
              <p>No recent activity found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
