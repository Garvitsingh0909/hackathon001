import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard-header'
import { TasksList } from '@/components/tasks-list'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Project',
  description: 'View project details and tasks',
}

interface ProjectPageProps {
  params: {
    id: string
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()
    .catch(() => ({ data: null }))

  if (!project) {
    redirect('/dashboard')
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
        <Link href="/dashboard">
          <Button variant="outline" className="gap-2 mb-6">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
          {project.description && (
            <p className="text-slate-600 mt-2">{project.description}</p>
          )}
        </div>

        <TasksList projectId={params.id} />
      </main>
    </div>
  )
}
