'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { usePermission } from '@/hooks/usePermission';
import { User, Role } from '@/types';
import CreateUserModal from './CreateUserModal';
import PermissionEditorModal from './PermissionEditorModal';
import { Search, Plus, UserCircle, ChevronLeft, ChevronRight, Hash, MoreVertical, Edit2, Shield, XCircle, CheckCircle, Ban } from 'lucide-react';

interface PaginatedUsers {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function UsersClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PaginatedUsers['meta'] | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debounceSearch, setDebounceSearch] = useState('');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [editingPermissionsUser, setEditingPermissionsUser] = useState<User | null>(null);

  // Check if current user can create users
  const canManageUsers = usePermission('users.manage');

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = () => setOpenDropdownId(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounceSearch(search);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/users', {
        params: {
          page,
          limit: 10,
          ...(debounceSearch && { search: debounceSearch }),
        },
      });
      setUsers(res.data.data);
      setMeta(res.data.meta);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setError(errorObj.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Fetch roles for the create modal dropdown
  const fetchRoles = async () => {
    try {
      // In a real scenario, this might be a dedicated endpoint like `/roles`, 
      // but assuming we can fetch a small set if needed, or we might need it for filtering.
      // We will fetch roles if the user can manage users to populate the dropdown.
      if (canManageUsers) {
         // This assumes a GET /roles exists, otherwise we mock or handle accordingly.
         // Let's wrap this so it fails silently if not implemented yet (roles page is task 13+)
         const res = await api.get('/roles').catch(() => ({ data: [] }));
         if(res.data && Array.isArray(res.data)) {
           setRoles(res.data);
         } else if (res.data?.data) {
           setRoles(res.data.data);
         }
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debounceSearch]);

  useEffect(() => {
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManageUsers]);

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    fetchUsers(); // Refresh the list
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      await api.patch(`/users/${userId}/status`, { status: newStatus });
      fetchUsers();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      alert(errorObj.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleEdit = (user: User) => {
    // Placeholder for actual edit modal trigger
    alert(`Edit modal for ${user.firstName} ${user.lastName} will open here.`);
  };

  const handleManagePermissions = (user: User) => {
    setOpenDropdownId(null);
    setEditingPermissionsUser(user);
  };

  // Component states
  const renderStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800 border-green-200',
      SUSPENDED: 'bg-amber-100 text-amber-800 border-amber-200',
      BANNED: 'bg-red-100 text-red-800 border-red-200',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusClasses[status] || 'bg-slate-100 text-slate-800'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Users</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage system users, roles, and access control.
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
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          {canManageUsers && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-[10px] text-white transition-colors shrink-0 shadow-brand-btn"
              style={{ background: 'var(--brand)', border: '1.5px solid #FD5E2B' }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Table / List Content */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        {loading && users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 mb-4" style={{ borderColor: 'var(--brand)' }}></div>
            <p className="font-inter text-[14px]" style={{ color: 'var(--subtle-text)' }}>Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-neutral-500">
            <UserCircle className="w-12 h-12 mb-4 text-neutral-300" />
            <p className="text-lg font-medium text-neutral-900 mb-1">No users found</p>
            <p>We could not find any users matching your criteria.</p>
          </div>
        ) : (
          <>
            {/* Desktop / Tablet Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Manager ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Join Date
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full font-onest font-semibold text-[14px] text-white" style={{ background: 'var(--brand)' }}>
                            {user.firstName.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-neutral-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-neutral-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-neutral-900">
                           {user.role?.name || 'Unknown Role'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStatusBadge(user.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                        {user.managerId ? (
                          <span className="flex items-center" title={user.managerId}>
                            <Hash className="w-4 h-4 mr-1 text-slate-400" />
                            {user.managerId.substring(0, 8)}...
                          </span>
                        ) : (
                          <span className="text-neutral-400 italic">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-neutral-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => setOpenDropdownId(openDropdownId === user.id ? null : user.id)} 
                            className="text-neutral-400 hover:text-neutral-600 rounded-full p-1 hover:bg-neutral-100 transition-colors"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          {openDropdownId === user.id && (
                            <div className="origin-top-right absolute right-8 top-0 mt-0 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-30 divide-y divide-neutral-100">
                              <div className="py-1">
                                {canManageUsers && (
                                  <button onClick={() => handleEdit(user)} className="group flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 w-full text-left">
                                    <Edit2 className="mr-3 h-4 w-4 text-neutral-400 group-hover:text-neutral-500" />
                                    Edit
                                  </button>
                                )}
                                <button onClick={() => handleManagePermissions(user)} className="group flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 w-full text-left">
                                  <Shield className="mr-3 h-4 w-4 text-neutral-400 group-hover:text-neutral-500" />
                                  Manage Permissions
                                </button>
                              </div>
                              {canManageUsers && (
                                <div className="py-1">
                                  {user.status === 'ACTIVE' ? (
                                    <button onClick={() => handleStatusChange(user.id, 'SUSPENDED')} className="group flex items-center px-4 py-2 text-sm text-amber-600 hover:bg-neutral-100 w-full text-left">
                                      <XCircle className="mr-3 h-4 w-4 text-amber-500" />
                                      Suspend User
                                    </button>
                                  ) : (
                                    <button onClick={() => handleStatusChange(user.id, 'ACTIVE')} className="group flex items-center px-4 py-2 text-sm text-green-600 hover:bg-neutral-100 w-full text-left">
                                      <CheckCircle className="mr-3 h-4 w-4 text-green-500" />
                                      Activate User
                                    </button>
                                  )}
                                  {user.status !== 'BANNED' && (
                                    <button onClick={() => handleStatusChange(user.id, 'BANNED')} className="group flex items-center px-4 py-2 text-sm text-red-600 hover:bg-neutral-100 w-full text-left">
                                      <Ban className="mr-3 h-4 w-4 text-red-500" />
                                      Ban User
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden divide-y divide-neutral-200">
              {users.map((user) => (
                <div key={user.id} className="p-4 space-y-3 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full font-onest font-semibold text-[14px] text-white" style={{ background: 'var(--brand)' }}>
                        {user.firstName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-neutral-500">{user.email}</p>
                      </div>
                    </div>
                    <div>
                      {renderStatusBadge(user.status)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-neutral-500 bg-neutral-50 p-2 rounded-md">
                    <div>
                      <span className="font-semibold text-neutral-700 block mb-0.5">Role</span>
                      {user.role?.name || 'Unknown'}
                    </div>
                    <div>
                      <span className="font-semibold text-neutral-700 block mb-0.5">Manager</span>
                      {user.managerId ? user.managerId.substring(0, 8) + '...' : 'None'}
                    </div>
                  </div>
                  
                  {/* Mobile Actions block */}
                  <div className="pt-2 flex flex-wrap gap-2 border-t border-neutral-100">
                    {canManageUsers && (
                      <button onClick={() => handleEdit(user)} className="inline-flex items-center px-3 py-1.5 border border-neutral-200 shadow-sm text-xs font-medium rounded text-neutral-700 bg-white hover:bg-neutral-50">
                        <Edit2 className="mr-1.5 h-3.5 w-3.5 text-neutral-400" /> Edit
                      </button>
                    )}
                    <button onClick={() => { setOpenDropdownId(null); handleManagePermissions(user); }} className="inline-flex items-center px-3 py-1.5 border border-neutral-200 shadow-sm text-xs font-medium rounded text-neutral-700 bg-white hover:bg-neutral-50">
                      <Shield className="mr-1.5 h-3.5 w-3.5 text-neutral-400" /> Permissions
                    </button>
                    {canManageUsers && user.status === 'ACTIVE' && (
                      <button onClick={() => handleStatusChange(user.id, 'SUSPENDED')} className="inline-flex items-center px-3 py-1.5 border border-amber-200 shadow-sm text-xs font-medium rounded text-amber-700 bg-amber-50 hover:bg-amber-100">
                        <XCircle className="mr-1.5 h-3.5 w-3.5 text-amber-500" /> Suspend
                      </button>
                    )}
                    {canManageUsers && user.status !== 'ACTIVE' && (
                      <button onClick={() => handleStatusChange(user.id, 'ACTIVE')} className="inline-flex items-center px-3 py-1.5 border border-green-200 shadow-sm text-xs font-medium rounded text-green-700 bg-green-50 hover:bg-green-100">
                        <CheckCircle className="mr-1.5 h-3.5 w-3.5 text-green-500" /> Activate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination footer */}
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
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-neutral-300 bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                      </button>
                      
                      {/* Generates simple page buttons */}
                      {[...Array(meta.totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setPage(i + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === i + 1 
                              ? 'z-10 border-brand text-white' 
                              : 'bg-white border-neutral-300 text-neutral-500 hover:bg-neutral-50'
                          }`}
                          style={page === i + 1 ? { background: 'var(--brand)' } : {}}
                        >
                          {i + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => setPage(page + 1)}
                        disabled={page === meta.totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-neutral-300 bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRight className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </nav>
                  </div>
                </div>
                
                {/* Mobile pagination */}
                <div className="flex items-center justify-between w-full sm:hidden">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <p className="text-sm text-neutral-700">
                    Page <span className="font-medium">{meta.page}</span> of <span className="font-medium">{meta.totalPages}</span>
                  </p>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === meta.totalPages}
                    className="relative inline-flex items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <CreateUserModal 
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
          roles={roles}
        />
      )}

      {/* Permission Editor Modal */}
      {editingPermissionsUser && (
        <PermissionEditorModal 
          userId={editingPermissionsUser.id}
          userName={`${editingPermissionsUser.firstName} ${editingPermissionsUser.lastName}`}
          onClose={() => setEditingPermissionsUser(null)}
        />
      )}
    </div>
  );
}
