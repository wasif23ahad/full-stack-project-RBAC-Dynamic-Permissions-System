'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { AuditLog } from '@/types';
import { Search, Loader2, Filter, ChevronLeft, ChevronRight, Activity } from 'lucide-react';

interface PaginatedAudit {
  data: AuditLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function AuditClient() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [meta, setMeta] = useState<PaginatedAudit['meta'] | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debounceSearch, setDebounceSearch] = useState('');

  // Debounce search (using it as an actor ID/name or target type filter optionally)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounceSearch(search);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      // Constructing query string parameters. 
      // Using search as actorId or targetType for demo purposes if it looks like one.
      const params: Record<string, string | number> = { page, limit: 15 };
      if (debounceSearch) {
        // Simple search mapping for now (real app would have specific field filters)
        params.targetType = debounceSearch; 
      }
      
      const res = await api.get('/audit', { params });
      setLogs(res.data.data);
      setMeta(res.data.meta);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setError(errorObj.response?.data?.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debounceSearch]);

  const formatMetadata = (metadata: unknown) => {
    if (!metadata) return '-';
    try {
      if (typeof metadata === 'string') return metadata;
      return JSON.stringify(metadata).substring(0, 50) + (JSON.stringify(metadata).length > 50 ? '...' : '');
    } catch {
      return 'Invalid metadata';
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('CREATE') || action.includes('GRANT')) return 'bg-green-100 text-green-800';
    if (action.includes('DELETE') || action.includes('REVOKE') || action.includes('BAN')) return 'bg-red-100 text-red-800';
    if (action.includes('UPDATE') || action.includes('SUSPEND')) return 'bg-amber-100 text-amber-800';
    return 'bg-orange-50 text-orange-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Audit Log</h1>
          <p className="text-sm text-neutral-500 mt-1">
            System-wide chronological record of user and system actions.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-neutral-400" />
            </div>
            <input
              type="text"
              className="block w-full sm:w-64 pl-10 pr-3 py-2 border border-neutral-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand sm:text-sm transition-shadow"
              placeholder="Filter by target type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <button className="inline-flex items-center justify-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-[10px] shadow-sm text-neutral-700 bg-white hover:bg-neutral-50 transition-colors shrink-0">
            <Filter className="w-4 h-4 mr-2 text-neutral-400" />
            Advanced
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        {loading && logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 mb-4" style={{ borderColor: 'var(--brand)' }}></div>
            <p className="font-inter text-[14px]" style={{ color: 'var(--subtle-text)' }}>Loading audit trail...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-neutral-500">
            <Activity className="w-12 h-12 mb-4 text-neutral-300" />
            <p className="text-lg font-medium text-neutral-900 mb-1">No logs found</p>
            <p>We could not find any audit records matching your criteria.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Timestamp</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actor</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Action</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Target</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-neutral-900">{log.actorName}</div>
                        <div className="text-xs text-neutral-400 font-mono tracking-tighter" title={log.actorId}>
                          {log.actorId.substring(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900">{log.targetType}</div>
                        <div className="text-xs text-neutral-400 font-mono tracking-tighter" title={log.targetId}>
                          {log.targetId.substring(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-500 max-w-sm truncate font-mono">
                        {formatMetadata(log.metadata)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {meta && meta.totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-neutral-200 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-neutral-700">
                      Showing <span className="font-medium">{(meta.page - 1) * meta.limit + 1}</span> to <span className="font-medium">{Math.min(meta.page * meta.limit, meta.total)}</span> of <span className="font-medium">{meta.total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-neutral-300 bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50 disabled:opacity-50"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      
                      {/* Simple pagination page display */}
                      <span className="relative inline-flex items-center px-4 py-2 border border-neutral-300 bg-white text-sm font-medium text-neutral-700">
                        {page} / {meta.totalPages}
                      </span>

                      <button
                        onClick={() => setPage(page + 1)}
                        disabled={page === meta.totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-neutral-300 bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50 disabled:opacity-50"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
                
                {/* Mobile version */}
                <div className="flex items-center justify-between w-full sm:hidden">
                  <button onClick={() => setPage(page - 1)} disabled={page === 1} className="relative inline-flex items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 disabled:opacity-50">
                    Previous
                  </button>
                  <button onClick={() => setPage(page + 1)} disabled={page === meta.totalPages} className="relative inline-flex items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 disabled:opacity-50">
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
