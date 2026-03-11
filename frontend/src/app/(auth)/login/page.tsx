'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';

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
    <div
      className="flex min-h-screen bg-white"
      style={{ padding: '40px' }}
    >
      {/* ── Left column: Form ─────────────────────────────────────── */}
      <div
        className="flex flex-1 flex-col justify-center items-center"
        style={{ gap: '50px' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 self-start">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{
              background: 'linear-gradient(180deg, #FF7C4E 0%, #EE5E30 100%)',
              boxShadow: 'inset 4.89px -11px 19.56px 0px rgba(233, 118, 43, 0.4)',
              border: '1.63px solid',
              borderColor: 'transparent',
            }}
          >
            <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
              <path
                d="M1 9.5L5 13.5L11 7.5M11 7.5L15 11.5L21 4.5"
                stroke="url(#logo-grad-a)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <defs>
                <linearGradient id="logo-grad-a" x1="0" y1="0" x2="22" y2="18" gradientUnits="userSpaceOnUse">
                  <stop stopColor="rgba(255,255,255,0.8)" />
                  <stop offset="1" stopColor="rgba(255,255,255,0.5)" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span
            className="font-onest font-semibold text-xl"
            style={{ color: '#331100' }}
          >
            RBAC Admin
          </span>
        </div>

        {/* Card */}
        <div
          className="bg-white rounded-[20px] w-full"
          style={{
            maxWidth: '420px',
            padding: '40px',
            border: '10px solid rgba(0,0,0,0.02)',
            boxShadow:
              '0px 16px 34px 0px rgba(194,194,194,0.10), ' +
              '0px 62px 62px 0px rgba(194,194,194,0.09), ' +
              '0px 140px 84px 0px rgba(194,194,194,0.05), ' +
              '0px 249px 100px 0px rgba(194,194,194,0.01), ' +
              '0px 389px 109px 0px rgba(194,194,194,0)',
          }}
        >
          {/* Heading */}
          <div
            className="flex flex-col"
            style={{ alignItems: 'flex-start', gap: '2px', marginBottom: '40px' }}
          >
            <h1
              className="font-onest font-semibold"
              style={{
                fontSize: '24px',
                lineHeight: '32px',
                letterSpacing: '-0.48px',
                color: '#1F232A',
              }}
            >
              Login
            </h1>
            <p
              className="font-inter font-normal"
              style={{
                fontSize: '15px',
                lineHeight: '24px',
                color: '#9BA0AB',
              }}
            >
              Enter your details to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

            {/* Global error */}
            {errors.form && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {errors.form}
              </div>
            )}

            {/* Fields group */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Email field */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label
                    htmlFor="email"
                    className="font-inter font-medium"
                    style={{
                      fontSize: '14px',
                      lineHeight: '20px',
                      letterSpacing: '-0.14px',
                      color: '#404857',
                    }}
                  >
                    Email
                  </label>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '0 10px',
                    height: '46px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: `1px solid ${errors.email ? '#EF4444' : 'rgba(0,0,0,0.10)'}`,
                  }}
                >
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
                    placeholder="example@email.com"
                    style={{
                      flex: 1,
                      outline: 'none',
                      background: 'transparent',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      lineHeight: '20px',
                      letterSpacing: '-0.14px',
                      color: '#1F232A',
                    }}
                    className="placeholder:text-[#A1A6B0]"
                  />
                </div>
                {errors.email && (
                  <p className="font-inter text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Password group (includes Remember me row) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                {/* Password field */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label
                    htmlFor="password"
                    className="font-inter font-medium"
                    style={{
                      fontSize: '14px',
                      lineHeight: '20px',
                      letterSpacing: '-0.14px',
                      color: '#404857',
                    }}
                  >
                    Password
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '0 10px',
                      height: '46px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: `1px solid ${errors.password ? '#EF4444' : 'rgba(0,0,0,0.10)'}`,
                    }}
                  >
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
                      placeholder="Enter your password"
                      style={{
                        flex: 1,
                        outline: 'none',
                        background: 'transparent',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        lineHeight: '20px',
                        letterSpacing: '-0.14px',
                        color: '#1F232A',
                      }}
                      className="placeholder:text-[#A1A6B0]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      tabIndex={-1}
                      style={{
                        opacity: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '16px',
                        height: '16px',
                        flexShrink: 0,
                      }}
                      className="hover:opacity-100 transition-opacity"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" style={{ color: '#404857' }} />
                      ) : (
                        <Eye className="w-4 h-4" style={{ color: '#404857' }} />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="font-inter text-xs text-red-500">{errors.password}</p>
                  )}
                </div>

                {/* Remember me + Forgot password */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    alignSelf: 'stretch',
                  }}
                >
                  {/* Custom checkbox */}
                  <button
                    type="button"
                    onClick={() => setRememberMe((v) => !v)}
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '4px',
                      border: '1.5px solid #E2E4E9',
                      backgroundColor: rememberMe ? '#FD6D3F' : '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      cursor: 'pointer',
                      transition: 'background-color 0.15s, border-color 0.15s',
                      borderColor: rememberMe ? '#FD6D3F' : '#E2E4E9',
                    }}
                  >
                    {rememberMe && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>

                  <span
                    className="font-inter font-normal flex-1 cursor-pointer select-none"
                    style={{
                      fontSize: '14px',
                      lineHeight: '23px',
                      letterSpacing: '-0.14px',
                      color: '#666C79',
                    }}
                    onClick={() => setRememberMe((v) => !v)}
                  >
                    Remember me
                  </span>

                  <button
                    type="button"
                    className="font-inter font-medium hover:opacity-75 transition-opacity"
                    style={{
                      fontSize: '14px',
                      lineHeight: '16px',
                      letterSpacing: '-0.14px',
                      color: '#FD6D3F',
                      borderRadius: '4px',
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
              </div>
            </div>

            {/* Submit button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="font-inter font-medium flex items-center justify-center transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                alignSelf: 'stretch',
                height: '48px',
                padding: '0 12px',
                gap: '4px',
                backgroundColor: '#FD6D3F',
                border: '2px solid #FD5E2B',
                borderRadius: '12px',
                fontSize: '14px',
                lineHeight: '20px',
                letterSpacing: '-0.14px',
                color: '#FFFFFF',
                boxShadow:
                  '0px 0px 0px 2px rgba(0,0,0,0.06), ' +
                  '0px 4px 10px 0px rgba(242,61,3,0.10), ' +
                  '0px 17px 17px 0px rgba(242,61,3,0.09), ' +
                  '0px 39px 23px 0px rgba(242,61,3,0.05), ' +
                  '0px 70px 28px 0px rgba(242,61,3,0.01), ' +
                  '0px 109px 30px 0px rgba(242,61,3,0)',
              }}
            >
              {isLoading ? (
                <span
                  style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: '#FFFFFF',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 0.75s linear infinite',
                  }}
                />
              ) : (
                'Log in'
              )}
            </button>
          </form>

          {/* Footer: Don't have an account */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '40px',
            }}
          >
            <span
              className="font-inter font-normal"
              style={{
                fontSize: '14px',
                lineHeight: '20px',
                letterSpacing: '-0.14px',
                color: '#666C79',
              }}
            >
              Don&apos;t have an account?
            </span>
            <button
              type="button"
              className="font-inter font-medium hover:opacity-75 transition-opacity"
              style={{
                fontSize: '14px',
                lineHeight: '16px',
                letterSpacing: '-0.14px',
                color: '#1F232A',
                borderRadius: '4px',
              }}
            >
              Sign up
            </button>
          </div>
        </div>
      </div>

      {/* ── Right column: Decorative image panel ──────────────────── */}
      <div
        className="hidden lg:block flex-1 relative overflow-hidden"
        style={{
          borderRadius: '20px',
          backgroundColor: 'rgba(255,255,255,0.13)',
          backgroundImage: 'url(/images/login-right-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          minHeight: '820px',
          border: '8px solid rgba(0,0,0,0.05)',
          boxShadow:
            '19px 16px 55px 0px rgba(0,0,0,0.05), ' +
            '77px 63px 100px 0px rgba(0,0,0,0.03), ' +
            '174px 142px 135px 0px rgba(0,0,0,0.02)',
        }}
      >
        {/* Orange blurred glow */}
        <div
          style={{
            position: 'absolute',
            top: '-30px',
            left: '-30px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            backgroundColor: '#FD6D3F',
            opacity: 0.30,
            filter: 'blur(350px)',
            pointerEvents: 'none',
          }}
        />

        {/* Inner dashboard mockup (offset 390x, 110y as per Figma) */}
        <div
          style={{
            position: 'absolute',
            left: '390px',
            top: '110px',
            width: '960px',
            height: '600px',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '8px solid rgba(0,0,0,0.05)',
            boxShadow:
              '19px 16px 55px 0px rgba(0,0,0,0.05), ' +
              '77px 63px 100px 0px rgba(0,0,0,0.03)',
          }}
        >
          <Image
            src="/images/login-inner-image.png"
            alt="Dashboard preview"
            fill
            style={{ objectFit: 'cover' }}
            priority={false}
          />
        </div>
      </div>

      {/* Spinner keyframes */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
