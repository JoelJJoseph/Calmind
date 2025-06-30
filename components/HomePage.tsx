"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import { ArrowRight, Heart, Brain, Timer, CheckSquare, Sparkles, Star, Zap, User, TrendingUp, Award, Calendar, Target } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/components/auth/AuthProvider"

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  
  // State for client-side only rendering
  const [isClient, setIsClient] = useState(false)

  // User stats from localStorage
  const [userStats, setUserStats] = useState({
    pomodoroSessions: 0,
    tasksCompleted: 0,
    goalsAchieved: 0,
    unwindSessions: 0,
    totalPoints: 0,
    level: 1,
  })
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  // Parallax transforms
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200])
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -300])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])

  // Smooth spring animations
  const springY1 = useSpring(y1, { stiffness: 100, damping: 30 })
  const springY2 = useSpring(y2, { stiffness: 100, damping: 30 })
  const springY3 = useSpring(y3, { stiffness: 100, damping: 30 })

  useEffect(() => {
    // Set client-side flag
    setIsClient(true)

    // Load user stats from localStorage
    loadUserStats()

    // Intersection Observer for feature cards
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-slide-up')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    )

    const featureCards = document.querySelectorAll('.feature-card')
    featureCards.forEach((card) => observer.observe(card))

    return () => observer.disconnect()
  }, [])

  const loadUserStats = () => {
    // Load Pomodoro stats
    const pomodoroStats = JSON.parse(localStorage.getItem("pomodoroStats") || '{"sessionsCompleted": 0}')
    
    // Load task stats
    const tasks = JSON.parse(localStorage.getItem("calmindTasks") || "[]")
    const completedTasks = tasks.filter((task: any) => task.completed).length
    
    // Load goal stats
    const goals = JSON.parse(localStorage.getItem("calmindGoals") || "[]")
    const completedGoals = goals.filter((goal: any) => goal.completed).length
    
    // Load unwind stats
    const unwindStats = JSON.parse(localStorage.getItem("unwindStats") || '{"sessions": 0}')
    
    // Calculate total points and level
    const totalPoints = (pomodoroStats.sessionsCompleted || 0) * 10 + completedTasks * 5 + completedGoals * 15 + (unwindStats.sessions || 0) * 8
    const level = Math.floor(totalPoints / 100) + 1

    setUserStats({
      pomodoroSessions: pomodoroStats.sessionsCompleted || 0,
      tasksCompleted: completedTasks,
      goalsAchieved: completedGoals,
      unwindSessions: unwindStats.sessions || 0,
      totalPoints,
      level,
    })
  }

  const features = [
    {
      icon: Brain,
      title: "Learning Style Quiz",
      description: "Discover your unique learning style with our interactive assessment",
      href: "/quiz",
      color: "from-purple-500 to-purple-600",
      accent: "from-purple-400 to-purple-500",
    },
    {
      icon: Timer,
      title: "Focus Timer",
      description: "Boost productivity with customizable Pomodoro sessions",
      href: "/pomodoro",
      color: "from-blue-500 to-blue-600",
      accent: "from-blue-400 to-blue-500",
    },
    {
      icon: CheckSquare,
      title: "Smart Tasks",
      description: "Organize your goals with our intuitive task management",
      href: "/todos",
      color: "from-green-500 to-green-600",
      accent: "from-green-400 to-green-500",
    },
    {
      icon: Heart,
      title: "Mindful Moments",
      description: "Find peace with guided breathing and meditation",
      href: "/unwind",
      color: "from-pink-500 to-pink-600",
      accent: "from-pink-400 to-pink-500",
    },
  ]

  const floatingElements = [
    { icon: Sparkles, delay: 0, duration: 6 },
    { icon: Star, delay: 1, duration: 8 },
    { icon: Zap, delay: 2, duration: 7 },
    { icon: Heart, delay: 3, duration: 9 },
  ]

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div ref={containerRef} className="min-h-screen relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          style={{ y: springY1 }}
          className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-purple-300/30 to-pink-300/30 rounded-full blur-3xl"
        />
        <motion.div 
          style={{ y: springY2 }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-300/30 to-cyan-300/30 rounded-full blur-3xl"
        />
        <motion.div 
          style={{ y: springY3 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-green-300/30 to-emerald-300/30 rounded-full blur-3xl"
        />
        
        {/* Floating Icons - Only render on client */}
        {isClient && floatingElements.map((element, index) => (
          <motion.div
            key={index}
            className="absolute"
            style={{
              top: `${20 + index * 15}%`,
              left: `${10 + index * 20}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              rotate: [0, 360],
            }}
            transition={{
              duration: element.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: element.delay,
            }}
          >
            <element.icon className="w-6 h-6 text-purple-400/40" />
          </motion.div>
        ))}
      </div>

      {/* Hero Section */}
      <motion.section 
        ref={heroRef}
        style={{ opacity, scale }}
        className="relative min-h-screen flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-blue-600/20" />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 mb-8 shadow-lg"
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
          >
            <Heart className="text-purple-600" size={20} />
            <span className="text-gray-600 font-medium">Welcome to Calmind</span>
            <Sparkles className="text-pink-500" size={16} />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent leading-tight"
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              Find Your
            </motion.span>
            <br />
            <motion.span
              initial={{ opacity: 0, rotateX: -90 }}
              animate={{ opacity: 1, rotateX: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="inline-block"
            >
              Calm Focus
            </motion.span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            A beautiful productivity and wellness companion designed specifically for students. 
            Discover your learning style, boost focus, and find inner peace.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/quiz">
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg shadow-2xl hover:shadow-purple-500/25 transition-all duration-300"
                >
                  <motion.span
                    initial={{ x: 0 }}
                    whileHover={{ x: 5 }}
                    className="flex items-center"
                  >
                    Get Started
                    <ArrowRight className="ml-2" size={20} />
                  </motion.span>
                </Button>
              </motion.div>
            </Link>
            <Link href="/unwind">
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-4 text-lg border-2 hover:bg-white/50 bg-white/20 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  Try Unwind Mode
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Profile Section */}
      <section className="py-20 px-6 relative bg-gradient-to-b from-transparent to-white/50">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Your Progress Dashboard
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Track your journey and celebrate your achievements
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="lg:col-span-1"
            >
              <Card className="p-6 bg-white/60 backdrop-blur-sm border border-white/20 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
                
                <div className="relative z-10">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Avatar className="w-24 h-24 mx-auto mb-4 shadow-lg">
                      <AvatarFallback className="text-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        {user?.email ? getInitials(user.email) : <User size={32} />}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>

                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {user?.email || "Welcome, Student!"}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {user ? "Signed in" : "Local progress tracking"}
                  </p>

                  {/* Level & Points */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-6"
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Star className="text-yellow-500" size={20} />
                      <span className="text-lg font-bold text-purple-600">Level {userStats.level}</span>
                    </div>
                    <div className="text-3xl font-bold text-purple-600 mb-1">{userStats.totalPoints}</div>
                    <div className="text-gray-600 text-sm mb-2">Total Points</div>
                    
                    {/* Progress to next level */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${((userStats.totalPoints % 100) / 100) * 100}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      {100 - (userStats.totalPoints % 100)} points to Level {userStats.level + 1}
                    </div>
                  </motion.div>

                  <Link href="/profile">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                      View Full Profile
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { icon: Timer, value: userStats.pomodoroSessions, label: "Focus Sessions", color: "text-purple-600", href: "/pomodoro" },
                  { icon: CheckSquare, value: userStats.tasksCompleted, label: "Tasks Done", color: "text-green-600", href: "/todos" },
                  { icon: Target, value: userStats.goalsAchieved, label: "Goals Reached", color: "text-blue-600", href: "/calendar" },
                  { icon: Heart, value: userStats.unwindSessions, label: "Unwind Sessions", color: "text-pink-600", href: "/unwind" },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    viewport={{ once: true }}
                  >
                    <Link href={stat.href}>
                      <Card className="p-4 bg-white/60 backdrop-blur-sm border border-white/20 text-center cursor-pointer hover:shadow-lg transition-all duration-200">
                        <stat.icon className={`mx-auto mb-2 ${stat.color}`} size={24} />
                        <motion.div
                          className="text-2xl font-bold text-gray-800"
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                          viewport={{ once: true }}
                        >
                          {stat.value}
                        </motion.div>
                        <div className="text-sm text-gray-600">{stat.label}</div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Quick Actions */}
              <Card className="p-6 bg-white/60 backdrop-blur-sm border border-white/20">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp size={20} />
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/pomodoro">
                    <Button variant="outline" className="w-full justify-start">
                      <Timer className="mr-2" size={16} />
                      Start Focus Session
                    </Button>
                  </Link>
                  <Link href="/todos">
                    <Button variant="outline" className="w-full justify-start">
                      <CheckSquare className="mr-2" size={16} />
                      Add New Task
                    </Button>
                  </Link>
                  <Link href="/unwind">
                    <Button variant="outline" className="w-full justify-start">
                      <Heart className="mr-2" size={16} />
                      Unwind Session
                    </Button>
                  </Link>
                  <Link href="/quiz">
                    <Button variant="outline" className="w-full justify-start">
                      <Brain className="mr-2" size={16} />
                      Take Quiz
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 relative bg-gradient-to-b from-white/50 to-transparent">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools to enhance your learning journey and well-being
            </p>
          </motion.div>

          <div ref={featuresRef} className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.href}
                initial={{ opacity: 0, y: 100, rotateX: -15 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.2,
                  type: "spring",
                  stiffness: 100
                }}
                viewport={{ once: true }}
                className="feature-card group"
              >
                <Link href={feature.href}>
                  <motion.div 
                    className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20 overflow-hidden"
                    whileHover={{ 
                      scale: 1.02,
                      rotateY: 5,
                      boxShadow: "0 25px 50px rgba(0,0,0,0.15)"
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    {/* Animated background gradient */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-r ${feature.accent} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                    />

                    <motion.div
                      className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${feature.color} mb-6 shadow-lg`}
                      whileHover={{ 
                        scale: 1.1, 
                        rotate: [0, -10, 10, 0],
                        boxShadow: "0 15px 30px rgba(0,0,0,0.2)"
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <feature.icon className="text-white" size={24} />
                    </motion.div>

                    <motion.h3 
                      className="text-2xl font-bold mb-4 text-gray-800 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text transition-all duration-500"
                      whileHover={{ x: 5 }}
                    >
                      {feature.title}
                    </motion.h3>

                    <p className="text-gray-600 text-lg leading-relaxed mb-6">{feature.description}</p>

                    <motion.div 
                      className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-500"
                      initial={{ x: 20 }}
                      whileHover={{ x: 0 }}
                    >
                      <motion.div
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <ArrowRight className="text-purple-600" size={20} />
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 relative overflow-hidden bg-gradient-to-r from-purple-600/10 to-pink-600/10">
        {/* Animated background elements - Only render on client */}
        {isClient && (
          <div className="absolute inset-0">
            {Array.from({ length: 20 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-purple-400/20 rounded-full"
                style={{
                  left: `${(i * 5.26) % 100}%`,
                  top: `${(i * 7.89) % 100}%`,
                }}
                animate={{
                  y: [-20, 20, -20],
                  opacity: [0.2, 0.8, 0.2],
                  scale: [0.5, 1.5, 0.5],
                }}
                transition={{
                  duration: 3 + (i % 3),
                  repeat: Infinity,
                  delay: (i % 5) * 0.6,
                }}
              />
            ))}
          </div>
        )}

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
          >
            Ready to Transform Your Study Life?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto"
          >
            Join thousands of students who have discovered their optimal learning rhythm with Calmind.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Link href="/quiz">
              <motion.div
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 30px 60px rgba(147, 51, 234, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-6 text-xl shadow-2xl relative overflow-hidden"
                >
                  {/* Animated shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                  <motion.span
                    className="relative flex items-center"
                    whileHover={{ x: 5 }}
                  >
                    Start Your Journey
                    <ArrowRight className="ml-3" size={24} />
                  </motion.span>
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
