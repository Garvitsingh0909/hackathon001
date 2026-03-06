'use client'

import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, Circle, Trash2, Plus } from 'lucide-react'
import { useState } from 'react'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Task {
  id: string
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'done'
  created_at: string
}

interface TasksListProps {
  projectId?: string
}

export function TasksList({ projectId }: TasksListProps) {
  const url = projectId ? `/api/tasks?project_id=${projectId}` : '/api/tasks'
  const { data: tasks, mutate } = useSWR<Task[]>(url, fetcher)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ title: '', description: '' })
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          project_id: projectId,
        }),
      })

      if (res.ok) {
        setFormData({ title: '', description: '' })
        setShowForm(false)
        mutate()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done'
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        mutate()
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleDeleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      if (res.ok) {
        mutate()
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tasks</h2>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus size={16} />
          New Task
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleCreateTask} className="space-y-4">
              <input
                type="text"
                placeholder="Task title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
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

      <div className="space-y-2">
        {tasks?.map((task) => (
          <Card key={task.id}>
            <CardContent className="flex items-center gap-3 py-3">
              <button
                onClick={() => handleToggleStatus(task)}
                className="text-slate-400 hover:text-blue-600 flex-shrink-0"
              >
                {task.status === 'done' ? (
                  <CheckCircle2 size={20} className="text-green-600" />
                ) : (
                  <Circle size={20} />
                )}
              </button>
              <div className="flex-1">
                <p
                  className={`font-medium ${
                    task.status === 'done'
                      ? 'line-through text-slate-400'
                      : ''
                  }`}
                >
                  {task.title}
                </p>
                {task.description && (
                  <p className="text-sm text-slate-500 mt-1">
                    {task.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="text-slate-400 hover:text-red-600 flex-shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      {!tasks && <div className="text-center py-8 text-slate-500">Loading tasks...</div>}
      {tasks?.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          No tasks yet. Create your first task to get started!
        </div>
      )}
    </div>
  )
}
