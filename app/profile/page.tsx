"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { gsap } from "gsap"
import {
  Settings,
  Trophy,
  Target,
  Clock,
  BookOpen,
  Brain,
  TrendingUp,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  Eye,
  Headphones,
  Users,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity,
  Flame,
  Timer,
  Book,
  GraduationCap,
  Crown,
  Sparkles,
  Camera,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface UserProfile {
  name: string
  email: string
  avatar?: string
  bio: string
  studyGoals: string[]
  learningStyle: {
    primary: string
    secondary: string
    visual: number
    auditory: number
    kinesthetic: number
  }
  preferences: {
    studyReminders: boolean
    emailNotifications: boolean
    soundEffects: boolean
    darkMode: boolean
    pomodoroLength: number
    shortBreakLength: number
    longBreakLength: number
  }
  stats: {
    totalStudyTime: number
    completedSessions: number
    currentStreak: number
    longestStreak: number
    tasksCompleted: number
    averageSessionLength: number
  }
  achievements: Achievement[]
  recentActivity: ActivityItem[]
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  earned: boolean
  earnedDate?: string
  category: string
  rarity: "common" | "rare" | "epic" | "legendary"
}

interface ActivityItem {
  id: string
  type: "study" | "task" | "goal" | "achievement"
  title: string
  description: string
  timestamp: string
  icon: React.ComponentType<any>
}

const achievements: Achievement[] = [
  {
    id: "first-session",
    title: "Getting Started",
    description: "Complete your first study session",
    icon: Play,
    earned: true,
    earnedDate: "2024-01-15",
    category: "Study",
    rarity: "common",
  },
  {
    id: "week-streak",
    title: "Week Warrior",
    description: "Study for 7 consecutive days",
    icon: Flame,
    earned: true,
    earnedDate: "2024-01-22",
    category: "Consistency",
    rarity: "rare",
  },
  {
    id: "pomodoro-master",
    title: "Pomodoro Master",
    description: "Complete 50 Pomodoro sessions",
    icon: Timer,
    earned: false,
    category: "Technique",
    rarity: "epic",
  },
  {
    id: "knowledge-seeker",
    title: "Knowledge Seeker",
    description: "Study for 100 total hours",
    icon: Book,
    earned: false,
    category: "Time",
    rarity: "epic",
  },
  {
    id: "goal-crusher",
    title: "Goal Crusher",
    description: "Complete 25 study goals",
    icon: Target,
    earned: true,
    earnedDate: "2024-02-01",
    category: "Goals",
    rarity: "rare",
  },
  {
    id: "scholar",
    title: "Scholar",
    description: "Maintain a 30-day study streak",
    icon: GraduationCap,
    earned: false,
    category: "Consistency",
    rarity: "legendary",
  },
  {
    id: "champion",
    title: "Study Champion",
    description: "Reach the top 1% of users",
    icon: Crown,
    earned: false,
    category: "Elite",
    rarity: "legendary",
  },
]

const recentActivity: ActivityItem[] = [
  {
    id: "1",
    type: "study",
    title: "Completed Pomodoro Session",
    description: "Mathematics - 25 minutes",
    timestamp: "2 hours ago",
    icon: Timer,
  },
  {
    id: "2",
    type: "achievement",
    title: "Achievement Unlocked",
    description: "Goal Crusher - Complete 25 study goals",
    timestamp: "1 day ago",
    icon: Trophy,
  },
  {
    id: "3",
    type: "task",
    title: "Task Completed",
    description: "Review calculus notes",
    timestamp: "2 days ago",
    icon: CheckCircle,
  },
  {
    id: "4",
    type: "goal",
    title: "Goal Set",
    description: "Study 2 hours daily this week",
    timestamp: "3 days ago",
    icon: Target,
  },
]

const rarityColors = {
  common: "from-gray-400 to-gray-500",
  rare: "from-blue-400 to-blue-500",
  epic: "from-purple-400 to-purple-500",
  legendary: "from-yellow-400 to-orange-500",
}

const rarityBorders = {
  common: "border-gray-300",
  rare: "border-blue-300",
  epic: "border-purple-300",
  legendary: "border-yellow-300",
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    bio: "Computer Science student passionate about learning and productivity. Always looking for better ways to optimize my study habits and achieve my academic goals.",
    studyGoals: [
      "Master advanced calculus concepts",
      "Complete data structures course",
      "Improve time management skills",
      "Maintain consistent study schedule",
    ],
    learningStyle: {
      primary: "visual",
      secondary: "kinesthetic",
      visual: 65,
      auditory: 20,
      kinesthetic: 35,
    },
    preferences: {
      studyReminders: true,
      emailNotifications: false,
      soundEffects: true,
      darkMode: false,
      pomodoroLength: 25,
      shortBreakLength: 5,
      longBreakLength: 15,
    },
    stats: {
      totalStudyTime: 2847, // minutes
      completedSessions: 156,
      currentStreak: 12,
      longestStreak: 28,
      tasksCompleted: 89,
      averageSessionLength: 18.2,
    },
    achievements: achievements,
    recentActivity: recentActivity,
  })

  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState(profile)
  const [newGoal, setNewGoal] = useState("")
  const [showAchievements, setShowAchievements] = useState("all")

  const profileRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const achievementsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadProfileData()
    initializeAnimations()
  }, [])

  const initializeAnimations = () => {
    if (profileRef.current) {
      gsap.fromTo(
        profileRef.current.children,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
        },
      )
    }

    if (statsRef.current) {
      const statCards = statsRef.current.querySelectorAll(".stat-card")
      gsap.fromTo(
        statCards,
        { opacity: 0, scale: 0.8, rotationY: -15 },
        {
          opacity: 1,
          scale: 1,
          rotationY: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "back.out(1.7)",
          delay: 0.3,
        },
      )
    }

    if (achievementsRef.current) {
      const achievementCards = achievementsRef.current.querySelectorAll(".achievement-card")
      gsap.fromTo(
        achievementCards,
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          stagger: 0.05,
          ease: "power2.out",
          delay: 0.5,
        },
      )
    }
  }

  const loadProfileData = () => {
    // Load learning style results if available
    const savedResults = localStorage.getItem("learningStyleResults")
    if (savedResults) {
      const results = JSON.parse(savedResults)
      setProfile((prev) => ({
        ...prev,
        learningStyle: {
          primary: results.primary,
          secondary: results.secondary,
          visual: results.results.visual,
          auditory: results.results.auditory,
          kinesthetic: results.results.kinesthetic,
        },
      }))
    }

    // Load other profile data from localStorage
    const savedProfile = localStorage.getItem("userProfile")
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile)
      setProfile((prev) => ({ ...prev, ...parsed }))
    }
  }

  const saveProfile = () => {
    setProfile(editedProfile)
    localStorage.setItem("userProfile", JSON.stringify(editedProfile))
    setIsEditing(false)
    toast.success("Profile updated successfully!")
  }

  const cancelEdit = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const addGoal = () => {
    if (newGoal.trim()) {
      const updatedGoals = [...editedProfile.studyGoals, newGoal.trim()]
      setEditedProfile((prev) => ({ ...prev, studyGoals: updatedGoals }))
      setNewGoal("")
      toast.success("Goal added!")
    }
  }

  const removeGoal = (index: number) => {
    const updatedGoals = editedProfile.studyGoals.filter((_, i) => i !== index)
    setEditedProfile((prev) => ({ ...prev, studyGoals: updatedGoals }))
    toast.success("Goal removed!")
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const getAchievementProgress = () => {
    const earned = profile.achievements.filter((a) => a.earned).length
    const total = profile.achievements.length
    return { earned, total, percentage: Math.round((earned / total) * 100) }
  }

  const filteredAchievements = profile.achievements.filter((achievement) => {
    if (showAchievements === "all") return true
    if (showAchievements === "earned") return achievement.earned
    if (showAchievements === "unearned") return !achievement.earned
    return achievement.rarity === showAchievements
  })

  const learningStyleIcon = {
    visual: Eye,
    auditory: Headphones,
    kinesthetic: Users,
  }

  const PrimaryIcon = learningStyleIcon[profile.learningStyle.primary as keyof typeof learningStyleIcon]
  const SecondaryIcon = learningStyleIcon[profile.learningStyle.secondary as keyof typeof learningStyleIcon]

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div ref={profileRef}>
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Your Profile
            </h1>
            <p className="text-xl text-gray-600">Track your progress and customize your learning experience</p>
          </motion.div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Profile Info */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="p-6 bg-white/60 backdrop-blur-sm border border-white/20">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Avatar className="w-20 h-20">
                            <AvatarImage src={profile.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-2xl">
                              {profile.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <motion.button
                            className="absolute -bottom-1 -right-1 w-8 h-8 bg-purple-600 hover:bg-purple-700 text-white rounded-full flex items-center justify-center transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Camera size={14} />
                          </motion.button>
                        </div>
                        <div>
                          {isEditing ? (
                            <div className="space-y-2">
                              <Input
                                value={editedProfile.name}
                                onChange={(e) => setEditedProfile((prev) => ({ ...prev, name: e.target.value }))}
                                className="text-2xl font-bold"
                              />
                              <Input
                                value={editedProfile.email}
                                onChange={(e) => setEditedProfile((prev) => ({ ...prev, email: e.target.value }))}
                                type="email"
                              />
                            </div>
                          ) : (
                            <>
                              <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
                              <p className="text-gray-600">{profile.email}</p>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {isEditing ? (
                          <>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button onClick={saveProfile} size="sm">
                                <Save className="mr-2" size={16} />
                                Save
                              </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button onClick={cancelEdit} variant="outline" size="sm">
                                <X className="mr-2" size={16} />
                                Cancel
                              </Button>
                            </motion.div>
                          </>
                        ) : (
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                              <Edit3 className="mr-2" size={16} />
                              Edit
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Bio</Label>
                        {isEditing ? (
                          <Textarea
                            value={editedProfile.bio}
                            onChange={(e) => setEditedProfile((prev) => ({ ...prev, bio: e.target.value }))}
                            rows={3}
                            className="mt-1"
                          />
                        ) : (
                          <p className="text-gray-600 mt-1">{profile.bio}</p>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <Label className="text-sm font-medium text-gray-700">Study Goals</Label>
                          {isEditing && (
                            <div className="flex gap-2">
                              <Input
                                value={newGoal}
                                onChange={(e) => setNewGoal(e.target.value)}
                                placeholder="Add new goal..."
                                className="text-sm"
                                onKeyPress={(e) => e.key === "Enter" && addGoal()}
                              />
                              <Button onClick={addGoal} size="sm">
                                <Plus size={16} />
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          {(isEditing ? editedProfile.studyGoals : profile.studyGoals).map((goal, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Target className="text-purple-600" size={16} />
                                <span className="text-gray-800">{goal}</span>
                              </div>
                              {isEditing && (
                                <motion.button
                                  onClick={() => removeGoal(index)}
                                  className="text-red-500 hover:text-red-700 transition-colors"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Trash2 size={16} />
                                </motion.button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Learning Style */}
                  <Card className="p-6 bg-white/60 backdrop-blur-sm border border-white/20">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Brain className="text-purple-600" size={24} />
                      Learning Style Profile
                    </h3>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <PrimaryIcon className="text-white" size={20} />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Primary Style</p>
                            <p className="font-semibold text-gray-800 capitalize">{profile.learningStyle.primary}</p>
                          </div>
                        </div>
                        <Progress
                          value={
                            profile.learningStyle[
                              profile.learningStyle.primary as keyof typeof profile.learningStyle
                            ] as number
                          }
                          className="h-2"
                        />
                        <p className="text-sm text-gray-600 mt-1">
                          {profile.learningStyle[profile.learningStyle.primary as keyof typeof profile.learningStyle]}%
                          preference
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                            <SecondaryIcon className="text-white" size={20} />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Secondary Style</p>
                            <p className="font-semibold text-gray-800 capitalize">{profile.learningStyle.secondary}</p>
                          </div>
                        </div>
                        <Progress
                          value={
                            profile.learningStyle[
                              profile.learningStyle.secondary as keyof typeof profile.learningStyle
                            ] as number
                          }
                          className="h-2"
                        />
                        <p className="text-sm text-gray-600 mt-1">
                          {profile.learningStyle[profile.learningStyle.secondary as keyof typeof profile.learningStyle]}
                          % preference
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <Sparkles className="inline mr-1" size={14} />
                        Your learning style was determined from your quiz results.
                        <Button variant="link" className="p-0 h-auto text-blue-600 underline ml-1">
                          Retake the quiz
                        </Button>{" "}
                        to update your profile.
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Quick Stats & Recent Activity */}
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <BarChart3 className="text-purple-600" size={20} />
                      Quick Stats
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="text-blue-600" size={16} />
                          <span className="text-sm text-gray-600">Total Study Time</span>
                        </div>
                        <span className="font-semibold text-gray-800">{formatTime(profile.stats.totalStudyTime)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Flame className="text-orange-600" size={16} />
                          <span className="text-sm text-gray-600">Current Streak</span>
                        </div>
                        <span className="font-semibold text-gray-800">{profile.stats.currentStreak} days</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="text-green-600" size={16} />
                          <span className="text-sm text-gray-600">Tasks Completed</span>
                        </div>
                        <span className="font-semibold text-gray-800">{profile.stats.tasksCompleted}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Trophy className="text-yellow-600" size={16} />
                          <span className="text-sm text-gray-600">Achievements</span>
                        </div>
                        <span className="font-semibold text-gray-800">
                          {getAchievementProgress().earned}/{getAchievementProgress().total}
                        </span>
                      </div>
                    </div>
                  </Card>

                  {/* Recent Activity */}
                  <Card className="p-6 bg-white/60 backdrop-blur-sm border border-white/20">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Activity className="text-green-600" size={20} />
                      Recent Activity
                    </h3>
                    <div className="space-y-3">
                      {profile.recentActivity.slice(0, 5).map((activity) => {
                        const ActivityIcon = activity.icon
                        return (
                          <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <ActivityIcon className="text-white" size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                              <p className="text-xs text-gray-600">{activity.description}</p>
                              <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="stats">
              <div ref={statsRef} className="space-y-8">
                {/* Overview Stats */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <motion.div className="stat-card">
                    <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 text-center">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                        <Clock className="text-white" size={20} />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">{formatTime(profile.stats.totalStudyTime)}</h3>
                      <p className="text-sm text-gray-600">Total Study Time</p>
                    </Card>
                  </motion.div>

                  <motion.div className="stat-card">
                    <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 text-center">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                        <BookOpen className="text-white" size={20} />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">{profile.stats.completedSessions}</h3>
                      <p className="text-sm text-gray-600">Study Sessions</p>
                    </Card>
                  </motion.div>

                  <motion.div className="stat-card">
                    <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 text-center">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                        <Flame className="text-white" size={20} />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">{profile.stats.currentStreak}</h3>
                      <p className="text-sm text-gray-600">Day Streak</p>
                    </Card>
                  </motion.div>

                  <motion.div className="stat-card">
                    <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 text-center">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="text-white" size={20} />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">{profile.stats.tasksCompleted}</h3>
                      <p className="text-sm text-gray-600">Tasks Done</p>
                    </Card>
                  </motion.div>
                </div>

                {/* Detailed Stats */}
                <div className="grid lg:grid-cols-2 gap-8">
                  <Card className="p-6 bg-white/60 backdrop-blur-sm border border-white/20">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <TrendingUp className="text-green-600" size={24} />
                      Performance Metrics
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Average Session Length</span>
                        <span className="font-semibold text-gray-800">{profile.stats.averageSessionLength} min</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Longest Streak</span>
                        <span className="font-semibold text-gray-800">{profile.stats.longestStreak} days</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Completion Rate</span>
                        <span className="font-semibold text-gray-800">87%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Weekly Goal Progress</span>
                        <div className="flex items-center gap-2">
                          <Progress value={75} className="w-20 h-2" />
                          <span className="font-semibold text-gray-800">75%</span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-white/60 backdrop-blur-sm border border-white/20">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <PieChart className="text-purple-600" size={24} />
                      Study Distribution
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-600">Mathematics</span>
                          <span className="font-semibold text-gray-800">35%</span>
                        </div>
                        <Progress value={35} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-600">Computer Science</span>
                          <span className="font-semibold text-gray-800">28%</span>
                        </div>
                        <Progress value={28} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-600">Physics</span>
                          <span className="font-semibold text-gray-800">22%</span>
                        </div>
                        <Progress value={22} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-600">Other</span>
                          <span className="font-semibold text-gray-800">15%</span>
                        </div>
                        <Progress value={15} className="h-2" />
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="achievements">
              <div ref={achievementsRef} className="space-y-6">
                {/* Achievement Progress */}
                <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <Trophy className="text-yellow-600" size={24} />
                      Achievement Progress
                    </h3>
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                      {getAchievementProgress().earned}/{getAchievementProgress().total}
                    </Badge>
                  </div>
                  <div className="mb-4">
                    <Progress value={getAchievementProgress().percentage} className="h-3" />
                    <p className="text-sm text-gray-600 mt-2">
                      {getAchievementProgress().percentage}% Complete - Keep going to unlock more achievements!
                    </p>
                  </div>
                </Card>

                {/* Achievement Filters */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={showAchievements === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowAchievements("all")}
                  >
                    All
                  </Button>
                  <Button
                    variant={showAchievements === "earned" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowAchievements("earned")}
                  >
                    Earned
                  </Button>
                  <Button
                    variant={showAchievements === "unearned" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowAchievements("unearned")}
                  >
                    Locked
                  </Button>
                  <Separator orientation="vertical" className="h-8" />
                  <Button
                    variant={showAchievements === "common" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowAchievements("common")}
                  >
                    Common
                  </Button>
                  <Button
                    variant={showAchievements === "rare" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowAchievements("rare")}
                  >
                    Rare
                  </Button>
                  <Button
                    variant={showAchievements === "epic" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowAchievements("epic")}
                  >
                    Epic
                  </Button>
                  <Button
                    variant={showAchievements === "legendary" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowAchievements("legendary")}
                  >
                    Legendary
                  </Button>
                </div>

                {/* Achievements Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAchievements.map((achievement) => {
                    const AchievementIcon = achievement.icon
                    return (
                      <motion.div
                        key={achievement.id}
                        className="achievement-card"
                        whileHover={{ scale: 1.02, y: -2 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card
                          className={`p-6 relative overflow-hidden ${
                            achievement.earned
                              ? `bg-gradient-to-br from-white to-gray-50 ${rarityBorders[achievement.rarity]} border-2`
                              : "bg-gray-100 border-gray-200 opacity-60"
                          }`}
                        >
                          {/* Rarity Indicator */}
                          <div
                            className={`absolute top-2 right-2 w-3 h-3 rounded-full bg-gradient-to-r ${rarityColors[achievement.rarity]}`}
                          />

                          {/* Achievement Icon */}
                          <div
                            className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                              achievement.earned
                                ? `bg-gradient-to-r ${rarityColors[achievement.rarity]}`
                                : "bg-gray-400"
                            }`}
                          >
                            <AchievementIcon className="text-white" size={24} />
                          </div>

                          {/* Achievement Info */}
                          <div className="text-center">
                            <h4 className={`font-bold mb-2 ${achievement.earned ? "text-gray-800" : "text-gray-500"}`}>
                              {achievement.title}
                            </h4>
                            <p className={`text-sm mb-3 ${achievement.earned ? "text-gray-600" : "text-gray-400"}`}>
                              {achievement.description}
                            </p>

                            <div className="flex items-center justify-between">
                              <Badge
                                variant="outline"
                                className={`text-xs ${achievement.earned ? "border-gray-300" : "border-gray-200"}`}
                              >
                                {achievement.category}
                              </Badge>
                              <Badge
                                className={`text-xs bg-gradient-to-r ${rarityColors[achievement.rarity]} text-white`}
                              >
                                {achievement.rarity}
                              </Badge>
                            </div>

                            {achievement.earned && achievement.earnedDate && (
                              <p className="text-xs text-gray-500 mt-2">
                                Earned {new Date(achievement.earnedDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>

                          {/* Earned Overlay */}
                          {achievement.earned && (
                            <motion.div
                              className="absolute top-2 left-2"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <CheckCircle className="text-white" size={14} />
                              </div>
                            </motion.div>
                          )}
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>

                {filteredAchievements.length === 0 && (
                  <Card className="p-12 text-center bg-white/40">
                    <Trophy className="mx-auto mb-4 text-gray-400" size={48} />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No achievements found</h3>
                    <p className="text-gray-500">Try adjusting your filters to see more achievements</p>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <div className="max-w-2xl mx-auto space-y-6">
                {/* Preferences */}
                <Card className="p-6 bg-white/60 backdrop-blur-sm border border-white/20">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Settings className="text-gray-600" size={24} />
                    Preferences
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Study Reminders</Label>
                        <p className="text-xs text-gray-500">Get notified about your study sessions</p>
                      </div>
                      <Switch
                        checked={profile.preferences.studyReminders}
                        onCheckedChange={(checked) =>
                          setProfile((prev) => ({
                            ...prev,
                            preferences: { ...prev.preferences, studyReminders: checked },
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Email Notifications</Label>
                        <p className="text-xs text-gray-500">Receive updates via email</p>
                      </div>
                      <Switch
                        checked={profile.preferences.emailNotifications}
                        onCheckedChange={(checked) =>
                          setProfile((prev) => ({
                            ...prev,
                            preferences: { ...prev.preferences, emailNotifications: checked },
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Sound Effects</Label>
                        <p className="text-xs text-gray-500">Play sounds for notifications and timers</p>
                      </div>
                      <Switch
                        checked={profile.preferences.soundEffects}
                        onCheckedChange={(checked) =>
                          setProfile((prev) => ({
                            ...prev,
                            preferences: { ...prev.preferences, soundEffects: checked },
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Dark Mode</Label>
                        <p className="text-xs text-gray-500">Switch to dark theme</p>
                      </div>
                      <Switch
                        checked={profile.preferences.darkMode}
                        onCheckedChange={(checked) =>
                          setProfile((prev) => ({
                            ...prev,
                            preferences: { ...prev.preferences, darkMode: checked },
                          }))
                        }
                      />
                    </div>
                  </div>
                </Card>

                {/* Pomodoro Settings */}
                <Card className="p-6 bg-white/60 backdrop-blur-sm border border-white/20">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Timer className="text-red-600" size={24} />
                    Pomodoro Timer Settings
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Focus Session Length</Label>
                      <Select
                        value={profile.preferences.pomodoroLength.toString()}
                        onValueChange={(value) =>
                          setProfile((prev) => ({
                            ...prev,
                            preferences: { ...prev.preferences, pomodoroLength: Number.parseInt(value) },
                          }))
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="20">20 minutes</SelectItem>
                          <SelectItem value="25">25 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Short Break Length</Label>
                      <Select
                        value={profile.preferences.shortBreakLength.toString()}
                        onValueChange={(value) =>
                          setProfile((prev) => ({
                            ...prev,
                            preferences: { ...prev.preferences, shortBreakLength: Number.parseInt(value) },
                          }))
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 minutes</SelectItem>
                          <SelectItem value="5">5 minutes</SelectItem>
                          <SelectItem value="10">10 minutes</SelectItem>
                          <SelectItem value="15">15 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Long Break Length</Label>
                      <Select
                        value={profile.preferences.longBreakLength.toString()}
                        onValueChange={(value) =>
                          setProfile((prev) => ({
                            ...prev,
                            preferences: { ...prev.preferences, longBreakLength: Number.parseInt(value) },
                          }))
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="20">20 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>

                {/* Save Settings */}
                <div className="flex justify-center">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => {
                        localStorage.setItem("userProfile", JSON.stringify(profile))
                        toast.success("Settings saved successfully!")
                      }}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8"
                    >
                      <Save className="mr-2" size={16} />
                      Save Settings
                    </Button>
                  </motion.div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

// Import Play icon that was missing
import { Play } from "lucide-react"
