import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard-header'
import { DashboardStats } from '@/components/dashboard-stats'
import { ProjectsList } from '@/components/projects-list'
import { TasksList } from '@/components/tasks-list'

export const metadata = {
  title: 'Dashboard',
  description: 'Manage your projects and tasks',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()
    .catch(() => ({ data: null }))

  const userName = profile?.full_name || user.email?.split('@')[0] || 'User'

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader userName={userName} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {userName}!
          </h1>
          <p className="text-slate-600 mt-2">
            Here's an overview of your projects and tasks.
          </p>
        </div>

        <div className="space-y-8">
          <DashboardStats />
          <ProjectsList />
          <TasksList />
        </div>
      </main>
    </div>
  )
}
