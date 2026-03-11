'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Permission } from '@/types';
import { Loader2, ShieldAlert, Check } from 'lucide-react';

interface PermissionEditorProps {
  userId: string;
}

export default function PermissionEditor({ userId }: PermissionEditorProps) {
  const { user: currentUser } = useAuth();
  
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [userAtoms, setUserAtoms] = useState<Set<string>>(new Set());
  const [callerAtoms, setCallerAtoms] = useState<Set<string>>(new Set());
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (currentUser?.permissions) {
      setCallerAtoms(new Set(currentUser.permissions));
    }
  }, [currentUser]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [permsRes, userPermsRes] = await Promise.all([
        api.get<Permission[]>('/permissions'),
        api.get<string[]>(`/users/${userId}/permissions`),
      ]);
      
      setPermissions(permsRes.data);
      setUserAtoms(new Set(userPermsRes.data));
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setError(errorObj.response?.data?.message || 'Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleToggle = (atom: string) => {
    // Prevent toggling if caller doesn't hold the permission
    if (!callerAtoms.has(atom)) return;
    
    setUserAtoms((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(atom)) {
        newSet.delete(atom);
      } else {
        newSet.add(atom);
      }
      return newSet;
    });
    
    // Clear notification states when user makes a change
    setSuccess(false);
    setError(null);
  };

  const handleSave = async () => {
    // Only send atoms that the caller holds
    const grants: string[] = [];
    const revocations: string[] = [];

    // We iterate through ALL known permissions from the backend
    permissions.forEach((p) => {
      if (callerAtoms.has(p.atom)) {
        if (userAtoms.has(p.atom)) {
          grants.push(p.atom);
        } else {
          revocations.push(p.atom);
        }
      }
    });

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      const res = await api.put<string[]>(`/users/${userId}/permissions`, {
        grants,
        revocations,
      });
      
      setUserAtoms(new Set(res.data));
      setSuccess(true);
      
      // Auto-hide success message
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string | string[] } } };
      const msg = errorObj.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Group permissions by module
  const groupedPermissions: Record<string, Permission[]> = {};
  permissions.forEach((p) => {
    if (!groupedPermissions[p.module]) {
      groupedPermissions[p.module] = [];
    }
    groupedPermissions[p.module].push(p);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium leading-6 text-neutral-900">Access Control</h3>
          <p className="mt-1 text-sm text-neutral-500">
            Explicitly grant or revoke permissions for this user.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <ShieldAlert className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3 text-sm text-red-700">
              {error}
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4 border border-green-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <Check className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="ml-3 text-sm text-green-700">
              Permissions updated successfully.
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        <div className="divide-y divide-neutral-200">
          {Object.entries(groupedPermissions).map(([moduleName, perms]) => (
            <div key={moduleName} className="p-6">
              <h4 className="text-base font-medium text-neutral-900 capitalize mb-4">
                {moduleName.replace(/_/g, ' ')}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {perms.map((p) => {
                  const hasAccess = callerAtoms.has(p.atom);
                  const isEnabled = userAtoms.has(p.atom);

                  return (
                    <div key={p.id} className="relative flex items-start">
                      <div className="flex h-6 items-center">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isEnabled}
                          disabled={!hasAccess || saving}
                          onClick={() => handleToggle(p.atom)}
                          className={`
                            relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                            ${isEnabled ? 'bg-blue-600' : 'bg-neutral-200'}
                            ${!hasAccess ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                        >
                          <span
                            aria-hidden="true"
                            className={`
                              pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                              ${isEnabled ? 'translate-x-4' : 'translate-x-0'}
                            `}
                          />
                        </button>
                      </div>
                      <div className="ml-3 text-sm leading-6">
                        <label 
                          className={`font-medium ${hasAccess ? 'text-neutral-900 cursor-pointer' : 'text-neutral-500 cursor-not-allowed'}`}
                          onClick={() => hasAccess && !saving && handleToggle(p.atom)}
                        >
                          {p.label}
                        </label>
                        {!hasAccess && (
                          <p className="text-xs text-neutral-400">
                            Requires <code>{p.atom}</code>
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
