'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Plus, 
  CheckSquare, 
  Trash2, 
  Edit3, 
  Calendar,
  Flag,
  GripVertical
} from 'lucide-react'

interface Task {
  id: string
  title: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  createdAt: Date
  dueDate?: Date
}

const priorityColors = {
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400', 
  high: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400'
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')

  useEffect(() => {
    // Load tasks from localStorage
    const savedTasks = localStorage.getItem('tasks')
    if (savedTasks) {
      const parsed = JSON.parse(savedTasks)
      setTasks(parsed.map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined
      })))
    }
  }, [])

  useEffect(() => {
    // Save tasks to localStorage
    localStorage.setItem('tasks', JSON.stringify(tasks))
  }, [tasks])

  const addTask = () => {
    if (!newTask.trim()) return

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.trim(),
      completed: false,
      priority: 'medium',
      createdAt: new Date()
    }

    setTasks([task, ...tasks])
    setNewTask('')
  }

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id))
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ))
  }

  const startEditing = (task: Task) => {
    setEditingTask(task.id)
    setEditingTitle(task.title)
  }

  const saveEdit = () => {
    if (editingTask && editingTitle.trim()) {
      updateTask(editingTask, { title: editingTitle.trim() })
    }
    setEditingTask(null)
    setEditingTitle('')
  }

  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'active': return !task.completed
      case 'completed': return task.completed
      default: return true
    }
  })

  const completedCount = tasks.filter(task => task.completed).length
  const activeCount = tasks.filter(task => !task.completed).length

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckSquare className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Task Manager
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Organize your tasks with intuitive drag-and-drop functionality
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Add Task & Filters */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 bg-white/70 dark:bg-black/30 backdrop-blur-sm border-emerald-100 dark:border-emerald-900">
              <div className="flex gap-4 mb-4">
                <Input
                  placeholder="Add a new task..."
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTask()}
                  className="flex-1"
                />
                <Button 
                  onClick={addTask}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex gap-2">
                {(['all', 'active', 'completed'] as const).map((filterType) => (
                  <Button
                    key={filterType}
                    variant={filter === filterType ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter(filterType)}
                    className={filter === filterType ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                  >
                    {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  </Button>
                ))}
              </div>
            </Card>

            {/* Tasks List */}
            <div className="space-y-3">
              <AnimatePresence>
                {filteredTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
                    whileHover={{ y: -2 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  >
                    <Card className={`p-4 bg-white/70 dark:bg-black/30 backdrop-blur-sm border-emerald-100 dark:border-emerald-900 ${
                      task.completed ? 'opacity-60' : 'hover:shadow-lg hover:shadow-emerald-500/10'
                    } transition-all duration-200`}>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
                          
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => toggleTask(task.id)}
                            className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                          />

                          {editingTask === task.id ? (
                            <Input
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') saveEdit()
                                if (e.key === 'Escape') setEditingTask(null)
                              }}
                              onBlur={saveEdit}
                              autoFocus
                              className="flex-1"
                            />
                          ) : (
                            <span 
                              className={`flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}
                              onDoubleClick={() => startEditing(task)}
                            >
                              {task.title}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary" 
                            className={priorityColors[task.priority]}
                          >
                            <Flag className="h-3 w-3 mr-1" />
                            {task.priority}
                          </Badge>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditing(task)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTask(task.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredTasks.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckSquare className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    {filter === 'all' ? 'No tasks yet. Add one above!' : 
                     filter === 'active' ? 'No active tasks. Great job!' : 
                     'No completed tasks yet.'}
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            <Card className="p-6 bg-white/70 dark:bg-black/30 backdrop-blur-sm border-emerald-100 dark:border-emerald-900">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Task Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Tasks</span>
                  <span className="font-semibold">{tasks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Active</span>
                  <span className="font-semibold text-emerald-600">{activeCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Completed</span>
                  <span className="font-semibold text-blue-600">{completedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Completion Rate</span>
                  <span className="font-semibold">
                    {tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0}%
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white/70 dark:bg-black/30 backdrop-blur-sm border-emerald-100 dark:border-emerald-900">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    const completed = tasks.filter(t => t.completed)
                    if (completed.length > 0 && confirm('Clear all completed tasks?')) {
                      setTasks(tasks.filter(t => !t.completed))
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Completed
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Set Due Dates
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
