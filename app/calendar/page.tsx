'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
  Star,
  Target,
  Edit3,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface Goal {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'goal' | 'milestone' | 'reminder';
  completed: boolean;
  createdAt: string;
}

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const goalTypes = {
  goal: { label: 'Goal', color: 'bg-purple-100 text-purple-800', icon: Target },
  milestone: {
    label: 'Milestone',
    color: 'bg-blue-100 text-blue-800',
    icon: Star,
  },
  reminder: {
    label: 'Reminder',
    color: 'bg-green-100 text-green-800',
    icon: CalendarIcon,
  },
};

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    type: 'goal' as Goal['type'],
  });
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    const savedGoals = localStorage.getItem('calmindGoals');
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('calmindGoals', JSON.stringify(goals));
  }, [goals]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(
      day
    ).padStart(2, '0')}`;
  };

  const getGoalsForDate = (dateString: string) => {
    return goals.filter((goal) => goal.date === dateString);
  };

  const addGoal = () => {
    if (!newGoal.title.trim() || !selectedDate) return;

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      date: selectedDate,
      type: newGoal.type,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setGoals([...goals, goal]);
    setNewGoal({ title: '', description: '', type: 'goal' });
    setIsAddDialogOpen(false);
  };

  const updateGoal = () => {
    if (!editingGoal) return;

    setGoals(
      goals.map((goal) => (goal.id === editingGoal.id ? editingGoal : goal))
    );
    setEditingGoal(null);
    setIsEditDialogOpen(false);
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter((goal) => goal.id !== id));
  };

  const toggleGoal = (id: string) => {
    setGoals(
      goals.map((goal) =>
        goal.id === id ? { ...goal, completed: !goal.completed } : goal
      )
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + (direction === 'next' ? 1 : -1),
        1
      )
    );
  };

  const openAddDialog = (dateString: string) => {
    setSelectedDate(dateString);
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (goal: Goal) => {
    setEditingGoal(goal);
    setIsEditDialogOpen(true);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="h-24 bg-gray-50 rounded-lg opacity-50"
        />
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = formatDate(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const dayGoals = getGoalsForDate(dateString);
      const isToday =
        dateString ===
        formatDate(
          new Date().getFullYear(),
          new Date().getMonth(),
          new Date().getDate()
        );

      days.push(
        <motion.div
          key={day}
          className={`h-24 p-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
            isToday
              ? 'bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-300'
              : 'bg-white/60 backdrop-blur-sm border border-white/20 hover:bg-white/80'
          }`}
          whileHover={{ scale: 1.02 }}
          onClick={() => openAddDialog(dateString)}
        >
          <div className="flex justify-between items-start mb-1">
            <span
              className={`text-sm font-medium ${
                isToday ? 'text-purple-700' : 'text-gray-700'
              }`}
            >
              {day}
            </span>
            {dayGoals.length > 0 && (
              <div className="flex gap-1">
                {dayGoals.slice(0, 2).map((goal, index) => {
                  const typeInfo = goalTypes[goal.type];
                  return (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        goal.completed ? 'bg-green-400' : 'bg-purple-400'
                      }`}
                    />
                  );
                })}
                {dayGoals.length > 2 && (
                  <div className="w-2 h-2 rounded-full bg-gray-400" />
                )}
              </div>
            )}
          </div>

          <div className="space-y-1">
            {dayGoals.slice(0, 1).map((goal, index) => (
              <div
                key={index}
                className={`text-xs px-1 py-0.5 rounded truncate ${
                  goal.completed ? 'line-through opacity-60' : ''
                } ${goalTypes[goal.type].color}`}
              >
                {goal.title}
              </div>
            ))}
            {dayGoals.length > 1 && (
              <div className="text-xs text-gray-500">
                +{dayGoals.length - 1} more
              </div>
            )}
          </div>
        </motion.div>
      );
    }

    return days;
  };

  const upcomingGoals = goals
    .filter((goal) => !goal.completed && new Date(goal.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Goal Calendar
          </h1>
          <p className="text-xl text-gray-600">
            Plan your journey and track your achievements
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <Card className="p-6 bg-white/60 backdrop-blur-sm border border-white/20">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(new Date())}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>

              {/* Days of Week Header */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {daysOfWeek.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-gray-600 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">{renderCalendar()}</div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="p-4 bg-white/60 backdrop-blur-sm border border-white/20">
              <h3 className="font-semibold text-gray-800 mb-4">This Month</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Goals</span>
                  <span className="font-bold text-purple-600">
                    {goals.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-bold text-green-600">
                    {goals.filter((g) => g.completed).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-bold text-blue-600">
                    {goals.length > 0
                      ? Math.round(
                          (goals.filter((g) => g.completed).length /
                            goals.length) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </Card>

            {/* Upcoming Goals */}
            <Card className="p-4 bg-white/60 backdrop-blur-sm border border-white/20">
              <h3 className="font-semibold text-gray-800 mb-4">Upcoming</h3>
              <div className="space-y-3">
                {upcomingGoals.length === 0 ? (
                  <p className="text-gray-500 text-sm">No upcoming goals</p>
                ) : (
                  upcomingGoals.map((goal) => {
                    const typeInfo = goalTypes[goal.type];
                    return (
                      <div
                        key={goal.id}
                        className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/40 transition-colors"
                      >
                        <button
                          onClick={() => toggleGoal(goal.id)}
                          className="mt-1 text-purple-600 hover:text-purple-700"
                        >
                          <div
                            className={`w-4 h-4 rounded border-2 border-purple-600 ${
                              goal.completed ? 'bg-purple-600' : ''
                            }`}
                          />
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={`${typeInfo.color} text-xs`}>
                              {typeInfo.label}
                            </Badge>
                          </div>
                          <h4 className="font-medium text-sm text-gray-800 truncate">
                            {goal.title}
                          </h4>
                          {goal.description && (
                            <p className="text-xs text-gray-500 truncate">
                              {goal.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            {new Date(goal.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditDialog(goal)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit3 size={12} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteGoal(goal.id)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Add Goal Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Add Goal for{' '}
                {selectedDate &&
                  new Date(selectedDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <Input
                  value={newGoal.title}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, title: e.target.value })
                  }
                  placeholder="What do you want to achieve?"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <Textarea
                  value={newGoal.description}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, description: e.target.value })
                  }
                  placeholder="Add details about your goal..."
                  className="w-full"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(goalTypes).map(([type, info]) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        setNewGoal({ ...newGoal, type: type as Goal['type'] })
                      }
                      className={`p-3 rounded-lg border-2 transition-all ${
                        newGoal.type === type
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <info.icon
                        size={20}
                        className="mx-auto mb-2 text-gray-600"
                      />
                      <div className="text-sm font-medium">{info.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={addGoal}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white flex-1"
                >
                  Add Goal
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

        {/* Edit Goal Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Goal</DialogTitle>
            </DialogHeader>
            {editingGoal && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <Input
                    value={editingGoal.title}
                    onChange={(e) =>
                      setEditingGoal({ ...editingGoal, title: e.target.value })
                    }
                    placeholder="What do you want to achieve?"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <Textarea
                    value={editingGoal.description}
                    onChange={(e) =>
                      setEditingGoal({
                        ...editingGoal,
                        description: e.target.value,
                      })
                    }
                    placeholder="Add details about your goal..."
                    className="w-full"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(goalTypes).map(([type, info]) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() =>
                          setEditingGoal({
                            ...editingGoal,
                            type: type as Goal['type'],
                          })
                        }
                        className={`p-3 rounded-lg border-2 transition-all ${
                          editingGoal.type === type
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <info.icon
                          size={20}
                          className="mx-auto mb-2 text-gray-600"
                        />
                        <div className="text-sm font-medium">{info.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <Input
                    type="date"
                    value={editingGoal.date}
                    onChange={(e) =>
                      setEditingGoal({ ...editingGoal, date: e.target.value })
                    }
                    className="w-full"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={updateGoal}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white flex-1"
                  >
                    Update Goal
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingGoal(null);
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
      </div>
    </div>
  );
}
