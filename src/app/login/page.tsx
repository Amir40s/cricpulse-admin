'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    const res = await login(email, password);
    setIsLoading(false);
    if (res.success) {
      router.push('/');
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="h-screen w-full flex bg-[#070b14] text-slate-100 overflow-hidden">
      {/* LEFT COLUMN: Clean Cinematic Cricket Hero */}
      <div className="hidden lg:relative lg:flex lg:w-1/2 flex-col justify-between p-12 xl:p-16 overflow-hidden bg-[#060911] border-r border-slate-800/60 select-none">
        <div className="absolute inset-0 z-0">
          <Image
            src="/cricket-stadium.jpg"
            alt="Cricket Stadium"
            fill
            priority
            className="object-cover object-center brightness-[0.60] contrast-[1.15]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-[#070b14]/50 to-[#070b14]/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#070b14]" />
        </div>

        <div className="relative z-10">
          <Image
            src="/logo-cric.png"
            alt="CricPulse Logo"
            width={180}
            height={56}
            className="h-12 w-auto object-contain drop-shadow-md"
            priority
          />
        </div>

        <div className="relative z-10 max-w-lg space-y-4">
          <h1 className="text-3xl xl:text-4xl font-bold tracking-tight text-white leading-snug">
            Powering Live Cricket Across Mobile Devices
          </h1>
          <p className="text-sm text-slate-300/90 leading-relaxed font-normal">
            Real-time match data gateway, live fan polling system, and Google AdMob monetization control for the CricPulse Android ecosystem.
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: Minimal, Premium Cricket Admin Portal */}
      <div className="flex-1 h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-12 w-full max-w-lg mx-auto lg:max-w-none overflow-y-auto">
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center justify-center pt-2 pb-4">
          <Image
            src="/logo-cric.png"
            alt="CricPulse Logo"
            width={160}
            height={50}
            className="h-11 w-auto object-contain"
            priority
          />
        </div>

        <div className="hidden lg:block" />

        {/* Main Auth Box */}
        <div className="w-full max-w-sm mx-auto space-y-7 my-auto">
          {/* Logo on Desktop */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-1">
              <Image
                src="/logo-cric.png"
                alt="CricPulse"
                width={190}
                height={60}
                className="h-14 w-auto object-contain"
                priority
              />
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-white">
              Admin Portal
            </h2>
            <p className="text-xs text-slate-400">
              Sign in with your administrator credentials
            </p>
          </div>

          {/* Alerts */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Email with Left Icon & Floating Label */}
            <div className="relative pt-5 pb-1">
              <div className="flex items-center border-b border-slate-700/80 focus-within:border-emerald-500 transition-colors pb-2">
                <Mail className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
                <div className="relative flex-1">
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder=" "
                    className="peer w-full bg-transparent border-0 text-slate-100 text-sm p-0 focus:outline-none focus:ring-0"
                  />
                  <label
                    htmlFor="email"
                    className={`absolute left-0 pointer-events-none transition-all duration-200 uppercase tracking-wider text-[11px] font-medium select-none ${
                      email
                        ? '-top-5 text-emerald-400'
                        : 'top-0 text-slate-400 peer-focus:-top-5 peer-focus:text-emerald-400'
                    }`}
                  >
                    Email Address
                  </label>
                </div>
              </div>
            </div>

            {/* Password with Left Icon & Right Toggle */}
            <div className="relative pt-5 pb-1">
              <div className="flex items-center border-b border-slate-700/80 focus-within:border-emerald-500 transition-colors pb-2">
                <Lock className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
                <div className="relative flex-1">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder=" "
                    className="peer w-full bg-transparent border-0 text-slate-100 text-sm p-0 pr-2 focus:outline-none focus:ring-0"
                  />
                  <label
                    htmlFor="password"
                    className={`absolute left-0 pointer-events-none transition-all duration-200 uppercase tracking-wider text-[11px] font-medium select-none ${
                      password
                        ? '-top-5 text-emerald-400'
                        : 'top-0 text-slate-400 peer-focus:-top-5 peer-focus:text-emerald-400'
                    }`}
                  >
                    Password
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="text-slate-400 hover:text-slate-200 transition-colors p-1 focus:outline-none shrink-0"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 h-11 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </div>
              ) : (
                <>
                  <span>Sign In to Admin Panel</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Bottom Credits */}
        <div className="text-center text-xs text-slate-500/80 pb-2">
          <p>© 2026 CricPulse Android Operations</p>
        </div>
      </div>
    </div>
  );
}
