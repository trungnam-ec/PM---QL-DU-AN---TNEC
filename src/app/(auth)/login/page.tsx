"use client"

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function LoginPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState<string | null>(null)

  const handleLogin = async (provider: 'google' | 'azure') => {
    try {
      setLoading(provider)
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) throw error
    } catch (error: any) {
      alert('Đã có lỗi xảy ra: ' + error.message)
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1121] relative overflow-hidden">
      {/* Background soft glow effects */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-[420px] bg-[#111827] border border-slate-800/60 rounded-3xl p-10 flex flex-col items-center relative z-10 shadow-2xl">
        
        {/* Logo */}
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-xl shadow-lg shadow-blue-500/20 mb-6">
          TN
        </div>

        {/* Titles */}
        <div className="flex flex-col items-center text-center space-y-1 mb-10">
          <h1 className="text-xl font-bold text-white tracking-wide">
            PM - QLDA - TNEC
          </h1>
          <h2 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
            Hệ thống Quản lý Dự án & Đầu tư
          </h2>
        </div>

        {/* Login Buttons */}
        <div className="w-full space-y-3">
          <Button
            variant="outline"
            className="w-full h-12 bg-white hover:bg-slate-50 border-0 text-slate-800 font-semibold rounded-xl flex items-center justify-center gap-3 transition-all duration-200 hover:scale-[1.02] shadow-md"
            onClick={() => handleLogin('azure')}
            disabled={loading !== null}
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 0H0v10h10V0z" fill="#f25022"/>
              <path d="M21 0H11v10h10V0z" fill="#7fba00"/>
              <path d="M10 11H0v10h10V11z" fill="#00a4ef"/>
              <path d="M21 11H11v10h10V11z" fill="#ffb900"/>
            </svg>
            {loading === 'azure' ? 'Đang kết nối...' : 'Tài khoản @trungnamgroup.com.vn'}
          </Button>

          <Button
            variant="outline"
            className="w-full h-12 bg-white hover:bg-slate-50 border-0 text-slate-800 font-semibold rounded-xl flex items-center justify-center gap-3 transition-all duration-200 hover:scale-[1.02] shadow-md"
            onClick={() => handleLogin('google')}
            disabled={loading !== null}
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {loading === 'google' ? 'Đang kết nối...' : 'Đăng nhập bằng tài khoản Google'}
          </Button>
        </div>

      </div>
    </div>
  )
}
