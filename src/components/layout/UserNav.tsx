"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LogOut } from 'lucide-react'

export function UserNav() {
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2.5 w-full animate-pulse">
        <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-2.5 bg-slate-200 rounded w-20" />
          <div className="h-2 bg-slate-100 rounded w-28" />
        </div>
      </div>
    )
  }

  const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  const initial = fullName.charAt(0).toUpperCase()

  return (
    <div className="flex items-center gap-3 w-full">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-[12px] font-bold text-white shrink-0 shadow-sm">
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-slate-800 truncate leading-tight mb-0.5">{fullName}</p>
        <p className="text-[11px] font-medium text-slate-500 truncate leading-tight">{user.email}</p>
      </div>
      <button
        onClick={handleLogout}
        className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-200 transition-colors"
        title="Đăng xuất"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  )
}
