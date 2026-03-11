'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      // Validate inputs
      const result = loginSchema.safeParse({ email, password });
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.issues.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        setIsLoading(false);
        return;
      }

      // Perform login
      await login({ email, password });
      
      // Redirect to dashboard on success
      router.push('/dashboard');
      
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setErrors({ form: error.response?.data?.message || 'Invalid credentials or login failed.' });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left side: Form */}
      <div className="flex w-full flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-1/2 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            {/* Logo placeholder - replace with actual if provided */}
            <div className="flex items-center gap-2 mb-8">
               <div className="w-8 h-8 bg-blue-600 rounded-md"></div>
               <span className="text-xl font-bold text-gray-900">RBAC System</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please enter your details to sign in.
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {errors.form && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                  {errors.form}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({...prev, email: undefined, form: undefined})); }}
                    className={`block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${errors.email ? 'ring-red-500 focus:ring-red-600' : 'ring-gray-300 focus:ring-blue-600'} placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6`}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-1 flex text-xs text-red-500">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Password
                </label>
                <div className="mt-2 relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({...prev, password: undefined, form: undefined})); }}
                    className={`block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${errors.password ? 'ring-red-500 focus:ring-red-600' : 'ring-gray-300 focus:ring-blue-600'} placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6`}
                    placeholder="••••••••"
                  />
                  {errors.password && (
                    <p className="mt-1 flex text-xs text-red-500">
                      {errors.password}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                 <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                      Remember for 30 days
                    </label>
                 </div>
                 <div className="text-sm">
                   <a href="#" className="font-semibold text-blue-600 hover:text-blue-500">
                     Forgot password?
                   </a>
                 </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right side: Image illustration */}
      <div className="relative hidden w-0 flex-1 lg:block bg-slate-900">
         {/* Placeholder for the abstract background graphic seen in typical modern SaaS auth pages */}
         <div className="absolute inset-0 h-full w-full object-cover p-12 flex flex-col justify-center">
             <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-10 max-w-lg shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl opacity-20"></div>
                
                <h3 className="text-2xl font-semibold text-white mb-4 relative z-10">Dynamic Role-Based Access Control</h3>
                <p className="text-slate-300 text-sm leading-relaxed relative z-10">
                   Manage granular permissions effortlessly across your entire organization. Build security hierarchies with atomic precision and absolute confidence.
                </p>
                
                {/* Mock UI Elements matching Figma style decorations */}
                <div className="mt-8 space-y-3 relative z-10">
                   <div className="h-2 w-3/4 bg-white/20 rounded-full"></div>
                   <div className="h-2 w-1/2 bg-white/20 rounded-full"></div>
                   <div className="h-2 w-5/6 bg-white/20 rounded-full"></div>
                </div>
             </div>
         </div>
      </div>
    </div>
  );
}
