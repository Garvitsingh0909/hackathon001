'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'

interface DashboardHeaderProps {
  userName?: string
}

export function DashboardHeader({ userName = 'User' }: DashboardHeaderProps) {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/auth/login')
  }

  return (
    <header className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-purple-600" />
            <h1 className="text-xl font-bold">Dashboard</h1>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <span className="text-sm text-slate-600">Welcome, {userName}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut size={16} />
              Logout
            </Button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t">
            <div className="py-3 text-sm text-slate-600">Welcome, {userName}</div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full gap-2 justify-center"
            >
              <LogOut size={16} />
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
