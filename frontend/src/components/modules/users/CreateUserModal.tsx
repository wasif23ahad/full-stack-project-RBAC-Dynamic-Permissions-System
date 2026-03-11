'use client';

import { useState } from 'react';
import { z } from 'zod';
import api from '@/lib/api';
import { Role } from '@/types';
import { X, Loader2 } from 'lucide-react';

const userSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  roleId: z.string().min(1, 'Role must be selected'),
});

type UserFormData = z.infer<typeof userSchema>;

interface CreateUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
  roles: Role[];
}

export default function CreateUserModal({ onClose, onSuccess, roles }: CreateUserModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    roleId: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear individual error when typing
    if (errors[name as keyof UserFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);

    // Validate
    const result = userSchema.safeParse(formData);
    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          formattedErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(formattedErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post('/users', formData);
      onSuccess();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string | string[] } } };
      const message = errorObj.response?.data?.message || 'An error occurred while creating the user.';
      // Handle array of messages often returned by NestJS validation pipe
      setGlobalError(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Background Overlay */}
      <div 
        className="fixed inset-0 bg-slate-900/60 transition-opacity backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 border-b border-neutral-100">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-semibold leading-6 text-neutral-900">
                Create New User
              </h3>
              <button
                type="button"
                className="rounded-full bg-white text-neutral-400 hover:text-neutral-500 hover:bg-neutral-100 p-1 transition-colors focus:outline-none"
                onClick={onClose}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {globalError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-md mb-4">
                  <p className="text-sm text-red-700">{globalError}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`block w-full rounded-md border ${errors.firstName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-neutral-300 focus:border-brand focus:ring-brand'} sm:text-sm px-3 py-2 shadow-sm`}
                    placeholder="Jane"
                  />
                  {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`block w-full rounded-md border ${errors.lastName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-neutral-300 focus:border-brand focus:ring-brand'} sm:text-sm px-3 py-2 shadow-sm`}
                    placeholder="Doe"
                  />
                  {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full rounded-md border ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-neutral-300 focus:border-brand focus:ring-brand'} sm:text-sm px-3 py-2 shadow-sm`}
                  placeholder="jane.doe@example.com"
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Temporary Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full rounded-md border ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-neutral-300 focus:border-brand focus:ring-brand'} sm:text-sm px-3 py-2 shadow-sm`}
                  placeholder="Minimum 6 characters"
                />
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Assign Role</label>
                <select
                  name="roleId"
                  value={formData.roleId}
                  onChange={handleChange}
                  className={`block w-full rounded-md border ${errors.roleId ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-neutral-300 focus:border-brand focus:ring-brand'} sm:text-sm px-3 py-2 shadow-sm bg-white`}
                >
                  <option value="" disabled>Select a role...</option>
                  {roles.length > 0 ? (
                    roles.map((role) => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))
                  ) : (
                    // Fallback explicit values if roles aren't loaded or /roles endpoint is not available yet
                    <>
                      <option value="1">ADMIN</option>
                      <option value="2">MANAGER</option>
                      <option value="3">AGENT</option>
                      <option value="4">CUSTOMER</option>
                    </>
                  )}
                </select>
                {errors.roleId && <p className="mt-1 text-xs text-red-600">{errors.roleId}</p>}
                <p className="mt-1.5 text-xs text-neutral-500">
                  Note: A Manager cannot assign a role higher than their own level.
                </p>
              </div>

              <div className="mt-6 sm:flex sm:flex-row-reverse sm:gap-3 py-3 border-t border-neutral-100">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full justify-center rounded-[10px] px-4 py-2 text-sm font-semibold text-white shadow-brand-btn sm:w-auto disabled:opacity-70 disabled:cursor-not-allowed items-center transition-colors"
                  style={{ background: 'var(--brand)', border: '1.5px solid #FD5E2B' }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create User'
                  )}
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-[10px] bg-white px-4 py-2 text-sm font-semibold text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-300 hover:bg-neutral-50 sm:mt-0 sm:w-auto transition-colors"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
