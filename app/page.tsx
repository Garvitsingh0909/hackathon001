import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Zap, BarChart3 } from 'lucide-react'

export const metadata = {
  title: 'Project Management Dashboard',
  description: 'Organize your projects and tasks efficiently',
}

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-purple-600" />
            <span className="text-xl font-bold text-white">Dashboard</span>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold text-white text-balance">
            Manage Projects & Tasks Effortlessly
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto text-balance">
            A modern, full-stack dashboard to organize your work, track progress, and achieve your goals with ease.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Button size="lg" asChild>
              <Link href="/auth/sign-up" className="gap-2">
                Start Free <ArrowRight size={20} />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <CheckCircle className="text-blue-400" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-white">Task Management</h3>
            <p className="text-slate-400">
              Create, organize, and track tasks with ease. Mark them as complete and monitor your progress.
            </p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Zap className="text-purple-400" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-white">Project Organization</h3>
            <p className="text-slate-400">
              Group tasks into projects and stay organized. Everything you need in one place.
            </p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4">
            <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
              <BarChart3 className="text-green-400" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-white">Progress Tracking</h3>
            <p className="text-slate-400">
              View detailed stats and completion rates. Understand your productivity at a glance.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
        <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to get organized?</h2>
        <Button size="lg" asChild className="gap-2">
          <Link href="/auth/sign-up">
            Create Free Account <ArrowRight size={20} />
          </Link>
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400">
          <p>&copy; 2024 Project Dashboard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
