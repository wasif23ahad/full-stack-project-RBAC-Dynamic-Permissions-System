import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Users, UserSquare2, Target, CheckSquare, Activity, TrendingUp } from 'lucide-react';

async function getAccessToken() {
  const cookieStore = cookies();
  const refreshCookie = cookieStore.get('refreshToken');
  if (!refreshCookie) return null;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: `refreshToken=${refreshCookie.value}` },
      cache: 'no-store',
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
    const [usersRes, auditRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/users?limit=1`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/audit?limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      }),
    ]);

    const usersData = usersRes.ok ? await usersRes.json() : null;
    const auditData = auditRes.ok ? await auditRes.json() : null;

    return {
      totalUsers:     usersData?.meta?.total || 0,
      activeAgents:   0,
      openLeads:      0,
      openTasks:      0,
      recentActivity: auditData?.data || [],
    };
  } catch {
    return { totalUsers: 0, activeAgents: 0, openLeads: 0, openTasks: 0, recentActivity: [] };
  }
}

type StatCard = {
  label: string;
  value: number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  trend?: string;
};

export const metadata = { title: 'Dashboard — RBAC Admin' };

export default async function DashboardPage() {
  const token = await getAccessToken();
  if (!token) redirect('/login');

  const data = await fetchDashboardData(token);

  const cards: StatCard[] = [
    {
      label: 'Total Users',
      value: data.totalUsers,
      icon: Users,
      iconBg: '#FFF3EE',
      iconColor: '#FD6D3F',
      trend: '+2 this week',
    },
    {
      label: 'Active Agents',
      value: data.activeAgents,
      icon: UserSquare2,
      iconBg: '#EEF4FF',
      iconColor: '#5A7DF9',
      trend: 'Up to date',
    },
    {
      label: 'Open Leads',
      value: data.openLeads,
      icon: Target,
      iconBg: '#EDFBF4',
      iconColor: '#22C55E',
    },
    {
      label: 'Open Tasks',
      value: data.openTasks,
      icon: CheckSquare,
      iconBg: '#FFF8EE',
      iconColor: '#F59E0B',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-onest font-semibold text-[22px]" style={{ color: 'var(--dark-text)' }}>
            Overview
          </h1>
          <p className="font-inter text-[14px] mt-0.5" style={{ color: 'var(--subtle-text)' }}>
            System activity and key metrics at a glance.
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] border text-[13px] font-inter"
          style={{ borderColor: 'var(--border-color)', color: 'var(--muted-text)' }}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Last 7 days</span>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-[16px] p-5"
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                boxShadow: '0px 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="font-inter text-[13px]" style={{ color: 'var(--muted-text)' }}>
                  {card.label}
                </p>
                <div
                  className="w-9 h-9 rounded-[10px] flex items-center justify-center"
                  style={{ background: card.iconBg }}
                >
                  <Icon className="w-[18px] h-[18px]" style={{ color: card.iconColor }} />
                </div>
              </div>
              <p className="font-onest font-semibold text-[28px]" style={{ color: 'var(--dark-text)' }}>
                {card.value}
              </p>
              {card.trend && (
                <p className="font-inter text-[12px] mt-1" style={{ color: 'var(--subtle-text)' }}>
                  {card.trend}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div
        className="rounded-[16px] overflow-hidden"
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          boxShadow: '0px 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <div
          className="px-6 py-4 flex items-center gap-2"
          style={{ borderBottom: '1px solid var(--border-color)' }}
        >
          <Activity className="w-4 h-4" style={{ color: 'var(--brand)' }} />
          <h2 className="font-onest font-semibold text-[15px]" style={{ color: 'var(--dark-text)' }}>
            Recent Activity
          </h2>
        </div>

        <div className="divide-y max-h-[480px] overflow-y-auto scrollbar-thin" style={{ borderColor: 'var(--border-color)' }}>
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
              <div key={log.id} className="px-6 py-4 flex items-start gap-4 hover:bg-gray-50/60 transition-colors">
                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-onest font-semibold text-[13px] text-white"
                  style={{ background: 'var(--brand)' }}
                >
                  {log.actorName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-inter text-[13px]" style={{ color: 'var(--mid-text)' }}>
                    <span className="font-medium" style={{ color: 'var(--dark-text)' }}>{log.actorName || 'System'}</span>
                    {' '}
                    <span>{log.action.toLowerCase().replace('_', ' ')}</span>
                    {' '}
                    <span className="font-medium" style={{ color: 'var(--dark-text)' }}>{log.targetType.toLowerCase()}</span>
                  </p>
                  <p className="font-inter text-[11px] mt-0.5" style={{ color: 'var(--placeholder)' }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <Activity className="w-8 h-8" style={{ color: 'var(--placeholder)' }} />
              <p className="font-inter text-[14px]" style={{ color: 'var(--subtle-text)' }}>
                No recent activity
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
