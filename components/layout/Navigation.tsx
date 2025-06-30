"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Brain,
  Calendar,
  CheckSquare,
  Clock,
  Menu,
  User,
  LogOut,
  Cloud,
  CloudOff,
  BookOpen,
  Headphones,
  Sparkles,
  AlertCircle,
} from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { testSupabaseConnection, isSupabaseConfigured } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

const navigationItems = [
  { name: "Dashboard", href: "/", icon: Brain },
  { name: "Tasks", href: "/todos", icon: CheckSquare },
  { name: "Pomodoro", href: "/pomodoro", icon: Clock },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Resources", href: "/resources", icon: BookOpen },
  { name: "Quiz", href: "/quiz", icon: Brain },
  { name: "Unwind", href: "/unwind", icon: Headphones },
]

export default function Navigation() {
  const pathname = usePathname()
  const { user, loading, signOut } = useAuth()
  const { toast } = useToast()
  const [isConnected, setIsConnected] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  useEffect(() => {
    const checkConnection = async () => {
      if (!isSupabaseConfigured) {
        setIsConnected(false)
        setConnectionError("Supabase not configured")
        return
      }

      const result = await testSupabaseConnection()
      setIsConnected(result.connected)
      setConnectionError(result.error || null)
    }

    checkConnection()
    const interval = setInterval(checkConnection, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [user])

  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      })
    } catch (error) {
      console.error("Sign out error:", error)
      toast({
        title: "Sign Out Failed",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  const SyncBadge = () => {
    if (!isSupabaseConfigured) {
      return (
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="cursor-pointer"
          title="Supabase not configured"
        >
          <Badge variant="secondary" className="flex items-center gap-1">
            <CloudOff className="h-3 w-3" />
            Offline
          </Badge>
        </motion.div>
      )
    }

    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="cursor-pointer"
        title={connectionError || (isConnected ? "Connected to Supabase" : "Connection failed")}
      >
        <Badge 
          variant={isConnected ? "default" : "destructive"} 
          className="flex items-center gap-1"
        >
          {isConnected ? <Cloud className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
          {isConnected ? "Synced" : "Error"}
        </Badge>
      </motion.div>
    )
  }

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="p-1 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500"
              >
                <Brain className="h-6 w-6 text-white" />
              </motion.div>
              <motion.span 
                className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                whileHover={{ scale: 1.05 }}
              >
                Calmind
              </motion.span>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Sparkles className="h-4 w-4 text-purple-500" />
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item, index) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        isActive 
                          ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 shadow-md" 
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Icon className="h-4 w-4" />
                      </motion.div>
                      <span>{item.name}</span>
                    </Link>
                  </motion.div>
                )
              })}
            </div>

            {/* Right side - Sync Badge and User Menu */}
            <div className="flex items-center space-x-4">
              <SyncBadge />

              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"
                  />
                ) : user ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={user.user_metadata?.avatar_url || "/placeholder.svg"}
                                alt={user.email || ""}
                              />
                              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                {user.email?.charAt(0).toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                          </Button>
                        </motion.div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="end" forceMount>
                        <div className="flex items-center justify-start gap-2 p-2">
                          <div className="flex flex-col space-y-1 leading-none">
                            <p className="font-medium">{user.user_metadata?.full_name || "User"}</p>
                            <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/profile" className="flex items-center">
                            <User className="mr-2 h-4 w-4" />
                            Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut}>
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link href="/profile">
                      <Button 
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Button>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mobile menu button */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="ghost" size="sm" className="md:hidden">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </motion.div>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <div className="flex flex-col space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">Menu</span>
                      <SyncBadge />
                    </div>

                    {navigationItems.map((item, index) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href
                      return (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Link
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                              isActive
                                ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                            <span>{item.name}</span>
                          </Link>
                        </motion.div>
                      )
                    })}

                    <div className="pt-4 border-t">
                      {user ? (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3 px-3 py-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={user.user_metadata?.avatar_url || "/placeholder.svg"}
                                alt={user.email || ""}
                              />
                              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                {user.email?.charAt(0).toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{user.user_metadata?.full_name || "User"}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                          <Link
                            href="/profile"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                          >
                            <User className="h-5 w-5" />
                            <span>Profile</span>
                          </Link>
                          <button
                            onClick={() => {
                              handleSignOut()
                              setIsOpen(false)
                            }}
                            className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 w-full text-left"
                          >
                            <LogOut className="h-5 w-5" />
                            <span>Sign out</span>
                          </button>
                        </div>
                      ) : (
                        <Link href="/profile" onClick={() => setIsOpen(false)}>
                          <Button className="w-full">
                            <User className="mr-2 h-4 w-4" />
                            Profile
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Bolt.new Badge - Fixed position in bottom right */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="fixed bottom-4 right-4 z-40"
      >
        <motion.a
          href="https://bolt.new"
          target="_blank"
          rel="noopener noreferrer"
          className="block"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
        >
          <Image
            src="/images/bolt-badge.png"
            alt="Powered by Bolt.new"
            width={60}
            height={60}
            className="rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300"
          />
        </motion.a>
      </motion.div>
    </>
  )
}
