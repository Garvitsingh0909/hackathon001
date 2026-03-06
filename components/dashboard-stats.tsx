'use client'

import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Circle, Briefcase, Activity } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Task {
  status: 'todo' | 'in_progress' | 'done'
}

interface Project {
  id: string
}

export function DashboardStats() {
  const { data: tasks } = useSWR<Task[]>('/api/tasks', fetcher)
  const { data: projects } = useSWR('/api/projects', fetcher)

  const completedTasks = tasks?.filter((t) => t.status === 'done').length || 0
  const totalTasks = tasks?.length || 0
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const stats = [
    {
      title: 'Projects',
      value: projects?.length || 0,
      icon: Briefcase,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Total Tasks',
      value: totalTasks,
      icon: Circle,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Completed Tasks',
      value: completedTasks,
      icon: CheckCircle2,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Completion Rate',
      value: `${completionRate}%`,
      icon: Activity,
      color: 'bg-orange-100 text-orange-600',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <Icon size={16} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
