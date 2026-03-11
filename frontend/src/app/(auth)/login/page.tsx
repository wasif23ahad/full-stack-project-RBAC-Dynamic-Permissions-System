'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const loginSchema = z.object({
  email:    z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe,   setRememberMe]   = useState(false);
  const [isLoading,    setIsLoading]    = useState(false);
  const [errors,       setErrors]       = useState<{ email?: string; password?: string; form?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const result = loginSchema.safeParse({ email, password });
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.issues.forEach((err) => {
          if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
        });
        setErrors(fieldErrors);
        setIsLoading(false);
        return;
      }

      await login({ email, password });
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setErrors({ form: error.response?.data?.message || 'Invalid credentials. Please try again.' });
      setIsLoading(false);
    }
  };

  const clearError = (field: 'email' | 'password') =>
    setErrors((prev) => ({ ...prev, [field]: undefined, form: undefined }));

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side — Login Form */}
      <div className="flex flex-1 flex-col justify-center items-center px-6 py-12 lg:px-20 xl:px-24 bg-white">
        <div className="w-full max-w-[420px]">

          {/* Card container */}
          <div
            className="bg-white rounded-[20px] p-10 w-full"
            style={{
              border: '10px solid rgba(0,0,0,0.02)',
              boxShadow:
                '0px 16px 34px 0px rgba(194,194,194,0.10), 0px 62px 62px 0px rgba(194,194,194,0.09), 0px 140px 84px 0px rgba(194,194,194,0.05)',
            }}
          >
            {/* Heading */}
            <div className="flex flex-col items-center gap-[2px] mb-8">
              <h1 className="font-onest font-semibold text-[24px] leading-[32px] tracking-[-0.02em] text-dark-text text-center">
                Login
              </h1>
              <p className="font-inter text-[15px] leading-[24px] text-subtle-text text-center">
                Enter your details to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-[30px]">

              {/* Global error */}
              {errors.form && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                  {errors.form}
                </div>
              )}

              {/* Fields group */}
              <div className="flex flex-col gap-5">

                {/* Email */}
                <div className="flex flex-col gap-[6px]">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="email"
                      className="font-inter font-medium text-[14px] leading-[20px] tracking-[-0.01em] text-mid-text"
                    >
                      Email
                    </label>
                  </div>
                  <div
                    className="flex items-center px-[10px] h-[46px] bg-white rounded-[12px]"
                    style={{ border: `1px solid ${errors.email ? '#EF4444' : 'rgba(0,0,0,0.10)'}` }}
                  >
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
                      placeholder="example@email.com"
                      className="flex-1 outline-none bg-transparent font-inter text-[14px] leading-[20px] tracking-[-0.01em] text-dark-text placeholder:text-placeholder"
                    />
                  </div>
                  {errors.email && (
                    <p className="font-inter text-xs text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div className="flex flex-col gap-[6px]">
                  <label
                    htmlFor="password"
                    className="font-inter font-medium text-[14px] leading-[20px] tracking-[-0.01em] text-mid-text"
                  >
                    Password
                  </label>
                  <div
                    className="flex items-center gap-[10px] px-[10px] h-[46px] bg-white rounded-[12px]"
                    style={{ border: `1px solid ${errors.password ? '#EF4444' : 'rgba(0,0,0,0.10)'}` }}
                  >
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
                      placeholder="Enter your password"
                      className="flex-1 outline-none bg-transparent font-inter text-[14px] leading-[20px] tracking-[-0.01em] text-dark-text placeholder:text-placeholder"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="opacity-50 hover:opacity-100 transition-opacity shrink-0"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-mid-text" />
                      ) : (
                        <Eye className="w-4 h-4 text-mid-text" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="font-inter text-xs text-red-500">{errors.password}</p>
                  )}

                  {/* Remember me + Forgot password */}
                  <div className="flex items-center gap-[6px] mt-1">
                    <input
                      id="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-[18px] h-[18px] rounded border border-[#E2E4E9] accent-brand cursor-pointer"
                    />
                    <label
                      htmlFor="remember-me"
                      className="flex-1 font-inter text-[14px] leading-[23px] text-muted-text cursor-pointer select-none"
                    >
                      Remember me
                    </label>
                    <button
                      type="button"
                      className="font-inter font-medium text-[14px] leading-[16px] text-brand hover:opacity-80 transition-opacity"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                id="login-submit-btn"
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center h-[48px] px-3 rounded-[12px] font-inter font-medium text-[14px] leading-[20px] text-white transition-opacity disabled:opacity-60 disabled:cursor-not-allowed shadow-brand-btn"
                style={{
                  background: '#FD6D3F',
                  border: '2px solid #FD5E2B',
                }}
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Log in'
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="flex items-center justify-center gap-[6px] mt-8">
              <span className="font-inter text-[14px] text-muted-text">
                Don&apos;t have an account?
              </span>
              <button
                type="button"
                className="font-inter font-medium text-[14px] text-dark-text hover:text-brand transition-colors"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right side — Decorative image panel */}
      <div
        className="hidden lg:flex flex-1 relative overflow-hidden rounded-[20px] m-10"
        style={{
          background: 'rgba(255,255,255,0.13)',
          backgroundImage: 'url(/images/login-right-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Orange blurred ellipse decoration */}
        <div
          className="absolute -top-8 -left-8 w-[200px] h-[200px] rounded-full"
          style={{
            background: '#FD6D3F',
            opacity: 0.30,
            filter: 'blur(350px)',
          }}
        />

        {/* Overlay gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent rounded-[20px]" />

        {/* Branding overlay */}
        <div className="relative z-10 flex flex-col justify-end p-10 text-white">
          <div className="max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center shadow-brand-btn">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <span className="font-onest font-semibold text-xl">RBAC Admin</span>
            </div>
            <h2 className="font-onest font-semibold text-2xl leading-tight mb-2">
              Role-Based Access Control
            </h2>
            <p className="font-inter text-sm text-white/70 leading-relaxed">
              Manage granular permissions across your organization with atomic precision.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
