'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd';
import {
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Circle,
  Calendar,
  Flag,
  Filter,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  due_date?: string;
  created_at: string;
  updated_at?: string;
}

const priorities = {
  low: { label: 'Low', color: 'bg-green-100 text-green-800' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'High', color: 'bg-red-100 text-red-800' },
};

const categories = ['Personal', 'Work', 'Study', 'Health', 'Shopping', 'Other'];

export default function TodoList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    category: 'Personal',
    due_date: '',
  });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    const savedTasks = localStorage.getItem('calmindTasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('calmindTasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!newTask.title.trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      completed: false,
      priority: newTask.priority,
      category: newTask.category,
      due_date: newTask.due_date || undefined,
      created_at: new Date().toISOString(),
    };

    setTasks([task, ...tasks]);
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      category: 'Personal',
      due_date: '',
    });
    setIsAddDialogOpen(false);
  };

  const updateTask = () => {
    if (!editingTask) return;

    const updatedTasks = tasks.map((task) =>
      task.id === editingTask.id
        ? { ...editingTask, updated_at: new Date().toISOString() }
        : task
    );
    setTasks(updatedTasks);
    setEditingTask(null);
    setIsEditDialogOpen(false);
  };

  const toggleTask = (id: string) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id
        ? {
            ...task,
            completed: !task.completed,
            updated_at: new Date().toISOString(),
          }
        : task
    );
    setTasks(updatedTasks);
  };

  const deleteTask = (id: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTasks(items);
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'completed' && task.completed) ||
      (filter === 'pending' && !task.completed);

    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || task.category === selectedCategory;

    return matchesFilter && matchesSearch && matchesCategory;
  });

  const completedCount = tasks.filter((task) => task.completed).length;
  const pendingCount = tasks.filter((task) => !task.completed).length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Smart Tasks
          </h1>
          <p className="text-xl text-gray-600">
            Organize your goals with intuitive task management
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Stats & Filters */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              <Card className="p-4 bg-white/60 backdrop-blur-sm border border-white/20 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {completedCount}
                </div>
                <div className="text-gray-600 text-sm">Completed</div>
              </Card>

              <Card className="p-4 bg-white/60 backdrop-blur-sm border border-white/20 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {pendingCount}
                </div>
                <div className="text-gray-600 text-sm">Pending</div>
              </Card>
            </div>

            {/* Filters */}
            <Card className="p-4 bg-white/60 backdrop-blur-sm border border-white/20">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Filter size={16} />
                Filters
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <Select
                    value={filter}
                    onValueChange={(value: any) => setFilter(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tasks</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </div>

          {/* Tasks List */}
          <div className="lg:col-span-3">
            {/* Search & Add */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-3 text-gray-400"
                  size={20}
                />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks..."
                  className="pl-10"
                />
              </div>

              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                    <Plus className="mr-2" size={20} />
                    Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Task</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Task Title
                      </label>
                      <Input
                        value={newTask.title}
                        onChange={(e) =>
                          setNewTask({ ...newTask, title: e.target.value })
                        }
                        placeholder="What needs to be done?"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <Textarea
                        value={newTask.description}
                        onChange={(e) =>
                          setNewTask({
                            ...newTask,
                            description: e.target.value,
                          })
                        }
                        placeholder="Add details about your task..."
                        className="w-full"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Priority
                        </label>
                        <Select
                          value={newTask.priority}
                          onValueChange={(value: Task['priority']) =>
                            setNewTask({ ...newTask, priority: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category
                        </label>
                        <Select
                          value={newTask.category}
                          onValueChange={(value) =>
                            setNewTask({ ...newTask, category: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Due Date (Optional)
                      </label>
                      <Input
                        type="date"
                        value={newTask.due_date}
                        onChange={(e) =>
                          setNewTask({ ...newTask, due_date: e.target.value })
                        }
                        className="w-full"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={addTask}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white flex-1"
                      >
                        Add Task
                      </Button>
                      <Button
                        onClick={() => setIsAddDialogOpen(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Tasks */}
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="tasks">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    <AnimatePresence>
                      {filteredTasks.map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <motion.div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              className={`${
                                snapshot.isDragging ? 'shadow-lg' : ''
                              } transition-shadow`}
                            >
                              <Card
                                className={`p-4 bg-white/60 backdrop-blur-sm border border-white/20 ${
                                  task.completed ? 'opacity-60' : ''
                                }`}
                              >
                                <div className="flex items-start gap-4">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="mt-1"
                                  >
                                    <div className="w-2 h-6 bg-gray-300 rounded-full cursor-grab active:cursor-grabbing" />
                                  </div>

                                  <button
                                    onClick={() => toggleTask(task.id)}
                                    className="mt-1 text-purple-600 hover:text-purple-700 transition-colors"
                                  >
                                    {task.completed ? (
                                      <CheckCircle2 size={20} />
                                    ) : (
                                      <Circle size={20} />
                                    )}
                                  </button>

                                  <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                      <h3
                                        className={`font-semibold text-gray-800 ${
                                          task.completed ? 'line-through' : ''
                                        }`}
                                      >
                                        {task.title}
                                      </h3>

                                      <div className="flex items-center gap-2">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => {
                                            setEditingTask(task);
                                            setIsEditDialogOpen(true);
                                          }}
                                        >
                                          <Edit3 size={16} />
                                        </Button>

                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => deleteTask(task.id)}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          <Trash2 size={16} />
                                        </Button>
                                      </div>
                                    </div>

                                    {task.description && (
                                      <p className="text-gray-600 text-sm mb-3">
                                        {task.description}
                                      </p>
                                    )}

                                    <div className="flex items-center gap-2 flex-wrap">
                                      <Badge
                                        className={
                                          priorities[task.priority].color
                                        }
                                      >
                                        <Flag size={12} className="mr-1" />
                                        {priorities[task.priority].label}
                                      </Badge>

                                      <Badge variant="outline">
                                        {task.category}
                                      </Badge>

                                      {task.due_date && (
                                        <Badge
                                          variant="outline"
                                          className="text-orange-600"
                                        >
                                          <Calendar
                                            size={12}
                                            className="mr-1"
                                          />
                                          {formatDate(task.due_date)}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            </motion.div>
                          )}
                        </Draggable>
                      ))}
                    </AnimatePresence>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {/* Edit Task Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Task</DialogTitle>
                </DialogHeader>
                {editingTask && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Task Title
                      </label>
                      <Input
                        value={editingTask.title}
                        onChange={(e) =>
                          setEditingTask({
                            ...editingTask,
                            title: e.target.value,
                          })
                        }
                        placeholder="What needs to be done?"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <Textarea
                        value={editingTask.description}
                        onChange={(e) =>
                          setEditingTask({
                            ...editingTask,
                            description: e.target.value,
                          })
                        }
                        placeholder="Add details about your task..."
                        className="w-full"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Priority
                        </label>
                        <Select
                          value={editingTask.priority}
                          onValueChange={(value: Task['priority']) =>
                            setEditingTask({ ...editingTask, priority: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category
                        </label>
                        <Select
                          value={editingTask.category}
                          onValueChange={(value) =>
                            setEditingTask({ ...editingTask, category: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Due Date (Optional)
                      </label>
                      <Input
                        type="date"
                        value={editingTask.due_date || ''}
                        onChange={(e) =>
                          setEditingTask({
                            ...editingTask,
                            due_date: e.target.value,
                          })
                        }
                        className="w-full"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={updateTask}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white flex-1"
                      >
                        Update Task
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingTask(null);
                          setIsEditDialogOpen(false);
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {filteredTasks.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <CheckCircle2 size={48} className="mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No tasks found
                </h3>
                <p className="text-gray-500">
                  {tasks.length === 0
                    ? 'Start by adding your first task!'
                    : 'Try adjusting your filters or search query.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
