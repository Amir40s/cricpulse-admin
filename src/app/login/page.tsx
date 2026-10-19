'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import {
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  Shield,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useApp();
  const [email, setEmail] = useState('admin@cricpulse.app');
  const [password, setPassword] = useState('cricpulse#2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      const ok = login(email, password);
      setIsLoading(false);
      if (ok) {
        router.push('/');
      } else {
        setErrorMsg('Invalid admin credentials. Please use the demo credentials below.');
      }
    }, 400);
  };

  const handleFillDemo = () => {
    setEmail('admin@cricpulse.app');
    setPassword('cricpulse#2026');
    setErrorMsg('');
  };

  return (
    <div className="h-screen w-full flex bg-[#070b14] text-slate-100 overflow-hidden">
      {/* LEFT COLUMN: Clean Cinematic Cricket Hero (50% on desktop, hidden on mobile) */}
      <div className="hidden lg:relative lg:flex lg:w-1/2 flex-col justify-between p-12 xl:p-16 overflow-hidden bg-[#060911] border-r border-slate-800/60 select-none">
        {/* Full-bleed stadium background with deep rich cricket gradient */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/cricket-stadium.jpg"
            alt="Cricket Stadium"
            fill
            priority
            className="object-cover object-center brightness-[0.60] contrast-[1.15]"
          />
          {/* Deep Navy/Black Vignette & cricket turf dark overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-[#070b14]/50 to-[#070b14]/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#070b14]" />
        </div>

        {/* Clean Logo without ANY background or box */}
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

        {/* Editorial Cricket Hero Message - Clean, zero badges, zero cards */}
        <div className="relative z-10 max-w-lg space-y-4">
          <h1 className="text-3xl xl:text-4xl font-bold tracking-tight text-white leading-snug">
            Powering Live Cricket Across Mobile Devices
          </h1>
          <p className="text-sm text-slate-300/90 leading-relaxed font-normal">
            Real-time match data gateway, live fan polling system, and Google AdMob monetization control for the CricPulse Android ecosystem.
          </p>
        </div>

        {/* Bottom subtle copyright / node status */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400/80 border-t border-white/10 pt-4">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted Admin Session</span>
          </span>
          <span className="font-mono text-slate-500">v1.2.0 Production</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Minimal, Premium Cricket Admin Login (Strictly 100vh) */}
      <div className="flex-1 h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-12 w-full max-w-lg mx-auto lg:max-w-none overflow-y-auto">
        {/* Mobile Logo (Visible on mobile only, NO box, NO background) */}
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

        {/* Main Login Box */}
        <div className="w-full max-w-sm mx-auto space-y-6 my-auto">
          {/* Logo on Desktop (Clean, NO box, NO background) */}
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

          {/* Error Notice */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@cricpulse.app"
                  className="w-full h-10 pl-10 pr-3.5 text-xs bg-[#0c1220] border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                >
                  Auto-fill Demo
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-10 pl-10 pr-10 text-xs bg-[#0c1220] border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-[#0c1220] text-emerald-600 focus:ring-emerald-500"
                />
                <span>Remember this workstation</span>
              </label>

              <span className="text-[11px] font-mono text-slate-500">
                admin@cricpulse.app
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 h-10 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
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
