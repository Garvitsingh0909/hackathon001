'use client'

import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Project {
  id: string
  name: string
  description: string | null
  created_at: string
}

export function ProjectsList() {
  const { data: projects, mutate } = useSWR<Project[]>('/api/projects', fetcher)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setFormData({ name: '', description: '' })
        setShowForm(false)
        mutate()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
      if (res.ok) {
        mutate()
      }
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Projects</h2>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus size={16} />
          New Project
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleCreateProject} className="space-y-4">
              <input
                type="text"
                placeholder="Project name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md"
                required
              />
              <textarea
                placeholder="Description (optional)"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {projects?.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <Link href={`/dashboard/projects/${project.id}`}>
                    <CardTitle className="hover:text-blue-600 cursor-pointer">
                      {project.name}
                    </CardTitle>
                  </Link>
                  {project.description && (
                    <CardDescription className="mt-2">
                      {project.description}
                    </CardDescription>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteProject(project.id)}
                  className="text-slate-400 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {!projects && <div className="text-center py-8 text-slate-500">Loading projects...</div>}
      {projects?.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          No projects yet. Create your first project to get started!
        </div>
      )}
    </div>
  )
}
