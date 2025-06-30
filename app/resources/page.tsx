"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import {
  ExternalLink,
  BookOpen,
  Video,
  FileText,
  Download,
  Clock,
  Users,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Heart,
  Bookmark,
  Volume2,
  Eye,
  ThumbsUp,
  MessageSquare,
  MessageCircle,
  Send,
  Mic,
  MicOff,
  X,
  Calendar,
  Target,
  TrendingUp,
  Award,
  CheckCircle,
  PlayCircle,
  Star,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { initializeDatabase } from "@/lib/supabase"
import {
  speakResourceDescription as originalSpeakResourceDescription,
  speakStudyTip as originalSpeakStudyTip,
  isElevenLabsConfigured,
  startConversation,
  sendMessage,
  endConversation,
  getStudyAssistance,
} from "@/lib/elevenlabs"
import { toast } from "sonner"

gsap.registerPlugin(ScrollTrigger)

interface Resource {
  id: string
  title: string
  description: string
  type: "document" | "video" | "article" | "tool" | "course" | "podcast"
  category: string
  url: string
  duration?: string
  rating: number
  difficulty: "beginner" | "intermediate" | "advanced"
  tags: string[]
  views?: number
  likes?: number
  bookmarks?: number
  author?: string
  thumbnail?: string
  isBookmarked?: boolean
  isLiked?: boolean
  userRating?: number
  learningStyles?: ("visual" | "auditory" | "kinesthetic")[]
}

interface StudyTip {
  id: string
  title: string
  description: string
  category: string
  difficulty: "beginner" | "intermediate" | "advanced"
  likes: number
  isLiked?: boolean
  audioUrl?: string
}

interface UserProgress {
  resourceId: string
  completed: boolean
  progress: number
  timeSpent: number
  lastAccessed: string
  notes?: string
  rating?: number
}

const enhancedResources: Resource[] = [
  {
    id: "1",
    title: "Complete Study Guide Collection",
    description:
      "Comprehensive study materials including note-taking templates, exam preparation guides, study schedules, flashcard templates, research methods, and subject-specific study strategies. Everything you need for academic success.",
    type: "document",
    category: "Study Materials",
    url: "https://www.khanacademy.org/college-careers-more/study-skills",
    rating: 5,
    difficulty: "intermediate",
    tags: ["study-guide", "comprehensive", "multi-subject"],
    views: 15420,
    likes: 892,
    bookmarks: 1567,
    author: "Calmind Team",
    learningStyles: ["visual", "kinesthetic"],
  },
  {
    id: "2",
    title: "How to Study Effectively - Evidence-Based Methods",
    description:
      "Learn scientifically proven study techniques including active recall, spaced repetition, and the Feynman technique for maximum retention.",
    type: "video",
    category: "Study Techniques",
    url: "https://www.youtube.com/watch?v=ukLnPbIffxE",
    duration: "12 min",
    rating: 5,
    difficulty: "beginner",
    tags: ["study-methods", "science-based", "productivity"],
    views: 2340,
    likes: 187,
    bookmarks: 234,
    author: "Thomas Frank",
    learningStyles: ["visual", "auditory"],
  },
  {
    id: "3",
    title: "Memory Palace Technique - Complete Guide",
    description:
      "Master the ancient art of memory palaces used by memory champions. Learn to memorize anything using spatial memory techniques.",
    type: "video",
    category: "Memory Techniques",
    url: "https://www.youtube.com/watch?v=3vlpQHJ09do",
    duration: "15 min",
    rating: 5,
    difficulty: "advanced",
    tags: ["memory-palace", "mnemonics", "advanced-techniques"],
    views: 890,
    likes: 156,
    bookmarks: 203,
    author: "Memory Expert",
    learningStyles: ["visual", "kinesthetic"],
  },
  {
    id: "4",
    title: "Focus Music - Deep Concentration Playlist",
    description:
      "Carefully curated instrumental music designed to enhance focus and concentration during study sessions. Binaural beats included.",
    type: "podcast",
    category: "Focus Music",
    url: "https://www.youtube.com/watch?v=5qap5aO4i9A",
    duration: "3 hours",
    rating: 4,
    difficulty: "beginner",
    tags: ["focus-music", "concentration", "binaural-beats"],
    views: 3450,
    likes: 298,
    bookmarks: 445,
    author: "Study Music Project",
    learningStyles: ["auditory"],
  },
  {
    id: "5",
    title: "Pomodoro Technique Explained",
    description:
      "Learn the famous time management technique that breaks work into focused 25-minute intervals with strategic breaks.",
    type: "video",
    category: "Time Management",
    url: "https://www.youtube.com/watch?v=VFW3Ld7JO0w",
    duration: "8 min",
    rating: 4,
    difficulty: "beginner",
    tags: ["pomodoro", "time-management", "productivity"],
    views: 1890,
    likes: 234,
    bookmarks: 567,
    author: "Productivity Expert",
    learningStyles: ["visual", "kinesthetic"],
  },
  {
    id: "6",
    title: "Speed Reading Mastery Course",
    description:
      "Double or triple your reading speed while maintaining comprehension. Learn advanced techniques used by speed reading champions.",
    type: "video",
    category: "Reading Skills",
    url: "https://www.youtube.com/watch?v=ZwEquW_Yij0",
    duration: "45 min",
    rating: 4,
    difficulty: "intermediate",
    tags: ["speed-reading", "comprehension", "reading-skills"],
    views: 1567,
    likes: 123,
    bookmarks: 289,
    author: "Reading Pro",
    learningStyles: ["visual"],
  },
  {
    id: "7",
    title: "Calm Piano Music for Studying",
    description:
      "Peaceful piano melodies perfect for creating a serene study environment. Helps reduce stress and improve concentration.",
    type: "podcast",
    category: "Calm Music",
    url: "https://www.youtube.com/watch?v=lFcSrYw-ARY",
    duration: "2 hours",
    rating: 5,
    difficulty: "beginner",
    tags: ["calm-music", "piano", "relaxation"],
    views: 4200,
    likes: 356,
    bookmarks: 678,
    author: "Peaceful Piano",
    learningStyles: ["auditory"],
  },
  {
    id: "8",
    title: "Note-Taking Strategies That Actually Work",
    description:
      "Master the Cornell method, mind mapping, and digital note-taking. Transform your notes into powerful learning tools.",
    type: "video",
    category: "Note Taking",
    url: "https://www.youtube.com/watch?v=WtW9IyE04OQ",
    duration: "18 min",
    rating: 4,
    difficulty: "beginner",
    tags: ["note-taking", "cornell-method", "mind-mapping"],
    views: 2890,
    likes: 245,
    bookmarks: 432,
    author: "Study Skills Expert",
    learningStyles: ["visual", "kinesthetic"],
  },
  {
    id: "9",
    title: "Nature Sounds for Deep Focus",
    description:
      "Immersive nature soundscapes including rain, forest, and ocean sounds to create the perfect study atmosphere.",
    type: "podcast",
    category: "Focus Music",
    url: "https://www.youtube.com/watch?v=n61ULEU7CO0",
    duration: "10 hours",
    rating: 5,
    difficulty: "beginner",
    tags: ["nature-sounds", "ambient", "focus"],
    views: 5670,
    likes: 489,
    bookmarks: 892,
    author: "Nature Sounds HD",
    learningStyles: ["auditory"],
  },
  {
    id: "10",
    title: "How to Learn Anything Fast",
    description:
      "Meta-learning techniques to accelerate your learning process. Based on research from cognitive science and neuroscience.",
    type: "video",
    category: "Learning Techniques",
    url: "https://www.youtube.com/watch?v=O96fE1E-rf8",
    duration: "22 min",
    rating: 5,
    difficulty: "intermediate",
    tags: ["meta-learning", "fast-learning", "cognitive-science"],
    views: 3240,
    likes: 278,
    bookmarks: 456,
    author: "Learning Expert",
    learningStyles: ["visual", "auditory"],
  },
  {
    id: "11",
    title: "Meditation Music for Studying",
    description:
      "Gentle meditation music with Tibetan singing bowls and soft ambient tones to enhance mindfulness while studying.",
    type: "podcast",
    category: "Calm Music",
    url: "https://www.youtube.com/watch?v=1ZYbU82GVz4",
    duration: "1 hour",
    rating: 4,
    difficulty: "beginner",
    tags: ["meditation", "mindfulness", "ambient"],
    views: 2890,
    likes: 234,
    bookmarks: 445,
    author: "Meditation Music",
    learningStyles: ["auditory"],
  },
  {
    id: "12",
    title: "Active Learning Strategies",
    description:
      "Transform passive reading into active learning. Techniques for better engagement and long-term retention of information.",
    type: "video",
    category: "Learning Techniques",
    url: "https://www.youtube.com/watch?v=MlJdMr3O5J4",
    duration: "16 min",
    rating: 4,
    difficulty: "intermediate",
    tags: ["active-learning", "engagement", "retention"],
    views: 1890,
    likes: 156,
    bookmarks: 289,
    author: "Education Researcher",
    learningStyles: ["visual", "kinesthetic"],
  },
]

const enhancedStudyTips: StudyTip[] = [
  {
    id: "1",
    title: "Use the 2-Minute Rule",
    description:
      "If a task takes less than 2 minutes, do it immediately instead of adding it to your to-do list. This prevents small tasks from accumulating and becoming overwhelming.",
    category: "Productivity",
    difficulty: "beginner",
    likes: 234,
  },
  {
    id: "2",
    title: "Study in Different Locations",
    description:
      "Changing your study environment can improve retention and prevent boredom. Try libraries, cafes, parks, or different rooms in your home.",
    category: "Environment",
    difficulty: "beginner",
    likes: 189,
  },
  {
    id: "3",
    title: "Teach Someone Else",
    description:
      "Explaining concepts to others is one of the most effective ways to solidify your understanding. If no one is available, try explaining to yourself out loud.",
    category: "Learning",
    difficulty: "intermediate",
    likes: 345,
  },
  {
    id: "4",
    title: "Use the Feynman Technique",
    description:
      "Break down complex concepts into simple terms as if explaining to a child. This reveals gaps in your understanding and helps you learn more effectively.",
    category: "Understanding",
    difficulty: "intermediate",
    likes: 278,
  },
  {
    id: "5",
    title: "Implement Active Recall",
    description:
      "Instead of just re-reading notes, actively test yourself on the material. Use flashcards, practice problems, or summarize from memory.",
    category: "Memory",
    difficulty: "intermediate",
    likes: 412,
  },
  {
    id: "6",
    title: "Practice Spaced Repetition",
    description:
      "Review material at increasing intervals (1 day, 3 days, 1 week, 2 weeks, 1 month) to move information into long-term memory.",
    category: "Memory",
    difficulty: "advanced",
    likes: 356,
  },
]

const typeIcons = {
  document: FileText,
  video: Video,
  article: BookOpen,
  tool: Download,
  course: BookOpen,
  podcast: Volume2,
}

const difficultyColors = {
  beginner: "bg-green-100 text-green-800",
  intermediate: "bg-yellow-100 text-yellow-800",
  advanced: "bg-red-100 text-red-800",
}

// Replace the existing speakResourceDescription function with:
const handleSpeakResource = (resource: Resource) => {
  if (!isElevenLabsConfigured) {
    toast.error("Voice features not configured")
    return
  }

  originalSpeakResourceDescription({
    title: resource.title,
    description: resource.description,
    type: resource.type,
    category: resource.category,
    difficulty: resource.difficulty,
  }).catch((error) => {
    console.error("Error speaking resource:", error)
    toast.error("Failed to play audio")
  })
}

// Replace the existing speakTip function with:
const handleSpeakTip = (tip: StudyTip) => {
  if (!isElevenLabsConfigured) {
    toast.error("Voice features not configured")
    return
  }

  originalSpeakStudyTip({
    title: tip.title,
    description: tip.description,
    category: tip.category,
  }).catch((error) => {
    console.error("Error speaking tip:", error)
    toast.error("Failed to play audio")
  })
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>(enhancedResources)
  const [studyTips, setStudyTips] = useState<StudyTip[]>(enhancedStudyTips)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("popular")
  const [expandedTips, setExpandedTips] = useState<string[]>([])
  const [userProgress, setUserProgress] = useState<UserProgress[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [userNotes, setUserNotes] = useState("")
  const [userRating, setUserRating] = useState(0)
  const [learningStyle, setLearningStyle] = useState<string>("all")
  const [showChatbot, setShowChatbot] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<
    Array<{
      id: string
      text: string
      isUser: boolean
      audioUrl?: string
      timestamp: Date
    }>
  >([])
  const [currentMessage, setCurrentMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)

  const headerRef = useRef<HTMLDivElement>(null)
  const featuredRef = useRef<HTMLDivElement>(null)
  const resourcesGridRef = useRef<HTMLDivElement>(null)
  const tipsGridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadUserData()
    // Make sure DB tables exist; if they don't, this simply logs a warning.
    initializeDatabase()
      .then((ok) => {
        if (ok) loadUserProgress()
      })
      .catch((err) => {
        console.error("Database init check failed:", err)
      })
    initializeAnimations()
  }, [])

  const initializeAnimations = () => {
    // Header animation
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current.children,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.2,
          ease: "power3.out",
        },
      )
    }

    // Featured resource animation
    if (featuredRef.current) {
      gsap.fromTo(
        featuredRef.current,
        { opacity: 0, scale: 0.9, rotationX: -15 },
        {
          opacity: 1,
          scale: 1,
          rotationX: 0,
          duration: 1.2,
          ease: "power3.out",
          delay: 0.5,
          transformPerspective: 1000,
        },
      )
    }

    // Resources grid animation
    if (resourcesGridRef.current) {
      const cards = resourcesGridRef.current.querySelectorAll(".resource-card")

      ScrollTrigger.batch(cards, {
        onEnter: (elements) => {
          gsap.fromTo(
            elements,
            { opacity: 0, y: 100, rotationX: -15 },
            {
              opacity: 1,
              y: 0,
              rotationX: 0,
              duration: 0.8,
              stagger: 0.1,
              ease: "power3.out",
              transformPerspective: 1000,
            },
          )
        },
        onLeave: (elements) => {
          gsap.to(elements, {
            opacity: 0.7,
            y: -20,
            duration: 0.3,
          })
        },
        onEnterBack: (elements) => {
          gsap.to(elements, {
            opacity: 1,
            y: 0,
            duration: 0.5,
          })
        },
      })
    }

    // Tips grid animation
    if (tipsGridRef.current) {
      const tipCards = tipsGridRef.current.querySelectorAll(".tip-card")

      ScrollTrigger.batch(tipCards, {
        onEnter: (elements) => {
          gsap.fromTo(
            elements,
            { opacity: 0, x: -50, rotationY: -15 },
            {
              opacity: 1,
              x: 0,
              rotationY: 0,
              duration: 0.8,
              stagger: 0.15,
              ease: "power3.out",
              transformPerspective: 1000,
            },
          )
        },
      })
    }
  }

  const loadUserData = () => {
    const savedLearningStyle = localStorage.getItem("learningStyle")
    if (savedLearningStyle) {
      const parsed = JSON.parse(savedLearningStyle)
      setLearningStyle(parsed.primary || "all")
    }
  }

  const loadUserProgress = async () => {
    if (!isSupabaseConfigured) return

    try {
      const { data, error } = await supabase.from("user_progress").select("*")

      if (error) {
        // 42P01 → relation does not exist (migration not yet run)
        if ((error as any).code === "42P01") {
          console.warn("user_progress table missing – run the SQL migration when ready.")
          return
        }
        throw error
      }
      if (data) setUserProgress(data)
    } catch (error) {
      console.error("Error loading user progress:", error)
    }
  }

  const saveUserProgress = async (resourceId: string, progress: Partial<UserProgress>) => {
    if (!isSupabaseConfigured) return

    try {
      const { error } = await supabase.from("user_progress").upsert({
        resource_id: resourceId,
        ...progress,
        last_accessed: new Date().toISOString(),
      })

      if (error) throw error
      loadUserProgress()
    } catch (error) {
      console.error("Error saving progress:", error)
    }
  }

  const toggleBookmark = async (resourceId: string) => {
    const resource = resources.find((r) => r.id === resourceId)
    if (!resource) return

    const newBookmarkState = !resource.isBookmarked

    setResources((prev) =>
      prev.map((r) =>
        r.id === resourceId
          ? { ...r, isBookmarked: newBookmarkState, bookmarks: (r.bookmarks || 0) + (newBookmarkState ? 1 : -1) }
          : r,
      ),
    )

    if (isSupabaseConfigured) {
      try {
        if (newBookmarkState) {
          await supabase.from("bookmarks").insert({ resource_id: resourceId })
        } else {
          await supabase.from("bookmarks").delete().eq("resource_id", resourceId)
        }
      } catch (error) {
        console.error("Error updating bookmark:", error)
      }
    }

    toast.success(newBookmarkState ? "Resource bookmarked!" : "Bookmark removed")
  }

  const toggleLike = async (resourceId: string) => {
    const resource = resources.find((r) => r.id === resourceId)
    if (!resource) return

    const newLikeState = !resource.isLiked

    setResources((prev) =>
      prev.map((r) =>
        r.id === resourceId ? { ...r, isLiked: newLikeState, likes: (r.likes || 0) + (newLikeState ? 1 : -1) } : r,
      ),
    )

    if (isSupabaseConfigured) {
      try {
        if (newLikeState) {
          await supabase.from("likes").insert({ resource_id: resourceId })
        } else {
          await supabase.from("likes").delete().eq("resource_id", resourceId)
        }
      } catch (error) {
        console.error("Error updating like:", error)
      }
    }

    toast.success(newLikeState ? "Resource liked!" : "Like removed")
  }

  const toggleTipLike = async (tipId: string) => {
    const tip = studyTips.find((t) => t.id === tipId)
    if (!tip) return

    const newLikeState = !tip.isLiked

    setStudyTips((prev) =>
      prev.map((t) => (t.id === tipId ? { ...t, isLiked: newLikeState, likes: t.likes + (newLikeState ? 1 : -1) } : t)),
    )
  }

  const speakResourceDescription = (resource: Resource) => {
    if (!isElevenLabsConfigured) {
      toast.error("Voice features not configured")
      return
    }

    const text = `${resource.title}. ${resource.description}. This is a ${resource.difficulty} level ${resource.type} in the ${resource.category} category.`
    originalSpeakResourceDescription(text)
  }

  const speakTip = (tip: StudyTip) => {
    if (!isElevenLabsConfigured) {
      toast.error("Voice features not configured")
      return
    }

    const text = `Study tip: ${tip.title}. ${tip.description}`
    originalSpeakStudyTip(text)
  }

  const categories = ["all", ...Array.from(new Set(resources.map((r) => r.category)))]
  const types = ["all", ...Array.from(new Set(resources.map((r) => r.type)))]

  const filteredResources = resources
    .filter((resource) => {
      const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory
      const matchesType = selectedType === "all" || resource.type === selectedType
      const matchesDifficulty = selectedDifficulty === "all" || resource.difficulty === selectedDifficulty
      const matchesSearch =
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesLearningStyle =
        learningStyle === "all" || !resource.learningStyles || resource.learningStyles.includes(learningStyle as any)

      return matchesCategory && matchesType && matchesDifficulty && matchesSearch && matchesLearningStyle
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return (b.likes || 0) - (a.likes || 0)
        case "newest":
          return b.id.localeCompare(a.id)
        case "rating":
          return b.rating - a.rating
        case "bookmarks":
          return (b.bookmarks || 0) - (a.bookmarks || 0)
        default:
          return 0
      }
    })

  const toggleTip = (tipId: string) => {
    setExpandedTips((prev) => (prev.includes(tipId) ? prev.filter((id) => id !== tipId) : [...prev, tipId]))
  }

  const openResourceModal = (resource: Resource) => {
    setSelectedResource(resource)
    const progress = userProgress.find((p) => p.resourceId === resource.id)
    setUserNotes(progress?.notes || "")
    setUserRating(progress?.rating || 0)
  }

  const saveResourceNotes = async () => {
    if (!selectedResource) return

    await saveUserProgress(selectedResource.id, {
      resourceId: selectedResource.id,
      notes: userNotes,
      rating: userRating,
      completed: false,
      progress: 0,
      timeSpent: 0,
      lastAccessed: new Date().toISOString(),
    })

    toast.success("Notes saved successfully!")
  }

  const initializeChatbot = async () => {
    setShowChatbot(true)
    if (isElevenLabsConfigured) {
      const convId = await startConversation()
      if (convId) {
        setConversationId(convId)
      }
    }

    // Add welcome message
    setChatMessages([
      {
        id: Date.now().toString(),
        text: "Hello! I'm your AI study assistant. I can help you with study techniques, motivation, memory tips, and answer questions about learning. How can I help you today?",
        isUser: false,
        timestamp: new Date(),
      },
    ])
  }

  const closeChatbot = async () => {
    if (conversationId) {
      await endConversation(conversationId)
      setConversationId(null)
    }
    setShowChatbot(false)
    setChatMessages([])
    setCurrentMessage("")
  }

  const sendChatMessage = async () => {
    if (!currentMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      text: currentMessage,
      isUser: true,
      timestamp: new Date(),
    }

    setChatMessages((prev) => [...prev, userMessage])
    setCurrentMessage("")
    setIsLoading(true)

    try {
      let response
      if (conversationId && isElevenLabsConfigured) {
        // Use ElevenLabs Conversational AI
        response = await sendMessage(conversationId, currentMessage)
      } else {
        // Use fallback text-based assistant
        const text = await getStudyAssistance(currentMessage)
        response = { text, audioUrl: undefined }
      }

      if (response) {
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          text: response.text,
          isUser: false,
          audioUrl: response.audioUrl,
          timestamp: new Date(),
        }
        setChatMessages((prev) => [...prev, assistantMessage])

        // Auto-play audio if available
        if (response.audioUrl) {
          const audio = new Audio(response.audioUrl)
          audio.play().catch(console.error)
        }
      }
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble responding right now. Please try again or check out our study resources!",
        isUser: false,
        timestamp: new Date(),
      }
      setChatMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const startVoiceRecognition = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast.error("Voice recognition not supported in this browser")
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = "en-US"

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setCurrentMessage(transcript)
      setIsListening(false)
    }

    recognition.onerror = () => {
      setIsListening(false)
      toast.error("Voice recognition error")
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  const playMessageAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl)
    audio.play().catch(console.error)
  }

  const ResourceCard = ({ resource }: { resource: Resource }) => {
    const IconComponent = typeIcons[resource.type]
    const progress = userProgress.find((p) => p.resourceId === resource.id)
    const cardRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (cardRef.current) {
        const card = cardRef.current

        const handleMouseEnter = () => {
          gsap.to(card, {
            y: -10,
            scale: 1.02,
            rotationY: 5,
            boxShadow: "0 20px 40px rgba(147, 51, 234, 0.15)",
            duration: 0.4,
            ease: "power2.out",
            transformPerspective: 1000,
          })

          const icon = card.querySelector(".resource-icon")
          if (icon) {
            gsap.to(icon, {
              scale: 1.1,
              rotation: 360,
              duration: 0.6,
              ease: "back.out(1.7)",
            })
          }
        }

        const handleMouseLeave = () => {
          gsap.to(card, {
            y: 0,
            scale: 1,
            rotationY: 0,
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            duration: 0.4,
            ease: "power2.out",
          })

          const icon = card.querySelector(".resource-icon")
          if (icon) {
            gsap.to(icon, {
              scale: 1,
              rotation: 0,
              duration: 0.4,
              ease: "power2.out",
            })
          }
        }

        card.addEventListener("mouseenter", handleMouseEnter)
        card.addEventListener("mouseleave", handleMouseLeave)

        return () => {
          card.removeEventListener("mouseenter", handleMouseEnter)
          card.removeEventListener("mouseleave", handleMouseLeave)
        }
      }
    }, [])

    return (
      <div ref={cardRef} className="resource-card transform-gpu">
        <Card className="p-6 bg-white/60 backdrop-blur-sm border border-white/20 hover:bg-white/80 transition-all duration-500 h-full relative group">
          {/* Bookmark Button */}
          <motion.button
            onClick={() => toggleBookmark(resource.id)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white transition-colors z-10"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Bookmark size={16} className={resource.isBookmarked ? "text-purple-600 fill-current" : "text-gray-400"} />
          </motion.button>

          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`resource-icon p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 transform-gpu`}
              >
                <IconComponent className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{resource.title}</h3>
                <p className="text-sm text-gray-600">{resource.category}</p>
                {resource.author && <p className="text-xs text-gray-500">by {resource.author}</p>}
              </div>
            </div>
          </div>

          <p className="text-gray-600 mb-4 leading-relaxed">{resource.description}</p>

          {/* Progress Bar */}
          {progress && progress.progress > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>{progress.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.progress}%` }}
                  transition={{ duration: 1, ease: "power2.out" }}
                />
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className={difficultyColors[resource.difficulty]}>{resource.difficulty}</Badge>
            {resource.duration && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock size={12} />
                {resource.duration}
              </Badge>
            )}
            {resource.learningStyles && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Eye size={12} />
                {resource.learningStyles.join(", ")}
              </Badge>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Eye size={14} />
              {resource.views}
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp size={14} />
              {resource.likes}
            </span>
            <span className="flex items-center gap-1">
              <Bookmark size={14} />
              {resource.bookmarks}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              asChild
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transform hover:scale-105 transition-all duration-300"
            >
              <a href={resource.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2" size={16} />
                {resource.type === "video" ? "Watch" : resource.type === "podcast" ? "Listen" : "View"}
              </a>
            </Button>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleLike(resource.id)}
                className={resource.isLiked ? "text-red-500 border-red-200" : ""}
              >
                <Heart size={16} className={resource.isLiked ? "fill-current" : ""} />
              </Button>
            </motion.div>

            {isElevenLabsConfigured && (
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button variant="outline" size="sm" onClick={() => handleSpeakResource(resource)}>
                  <Volume2 size={16} />
                </Button>
              </motion.div>
            )}

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button variant="outline" size="sm" onClick={() => openResourceModal(resource)}>
                <MessageSquare size={16} />
              </Button>
            </motion.div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div ref={headerRef} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Study Resources
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Curated collection of study materials, techniques, and tools to enhance your learning journey
          </p>

          {/* Integration Status */}
          <div className="flex justify-center gap-4 mt-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Badge variant={isSupabaseConfigured ? "default" : "secondary"} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? "bg-green-500" : "bg-gray-400"}`} />
                Database {isSupabaseConfigured ? "Connected" : "Offline"}
              </Badge>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
            >
              <Badge variant={isElevenLabsConfigured ? "default" : "secondary"} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isElevenLabsConfigured ? "bg-green-500" : "bg-gray-400"}`} />
                Voice {isElevenLabsConfigured ? "Enabled" : "Disabled"}
              </Badge>
            </motion.div>
          </div>
        </div>

        <Tabs defaultValue="resources" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="resources">Study Resources</TabsTrigger>
            <TabsTrigger value="tips">Study Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="resources">
            {/* Search and Filters */}
            <motion.div
              className="mb-8 space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search resources..."
                    className="pl-10"
                  />
                </div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                  >
                    <Filter size={16} />
                    Filters
                    <motion.div animate={{ rotate: showFilters ? 180 : 0 }} transition={{ duration: 0.3 }}>
                      <ChevronDown size={16} />
                    </motion.div>
                  </Button>
                </motion.div>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -20 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "power2.out" }}
                    className="grid md:grid-cols-5 gap-4 p-4 bg-white/40 rounded-lg border border-white/20 backdrop-blur-sm"
                  >
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category === "all" ? "All Categories" : category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {types.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type === "all" ? "All Types" : type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                      <SelectTrigger>
                        <SelectValue placeholder="Difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={learningStyle} onValueChange={setLearningStyle}>
                      <SelectTrigger>
                        <SelectValue placeholder="Learning Style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Styles</SelectItem>
                        <SelectItem value="visual">Visual</SelectItem>
                        <SelectItem value="auditory">Auditory</SelectItem>
                        <SelectItem value="kinesthetic">Kinesthetic</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="popular">Most Popular</SelectItem>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                        <SelectItem value="bookmarks">Most Bookmarked</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Featured Resource */}
            <div className="mb-12">
              <motion.h2
                className="text-2xl font-bold text-gray-800 mb-6 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Featured Resource
              </motion.h2>
              <motion.div ref={featuredRef} className="transform-gpu">
                <Card className="p-8 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 hover:shadow-2xl transition-all duration-500">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-shrink-0">
                      <motion.div
                        className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center"
                        whileHover={{
                          scale: 1.1,
                          rotate: 360,
                          boxShadow: "0 10px 25px rgba(147, 51, 234, 0.3)",
                        }}
                        transition={{ duration: 0.6 }}
                      >
                        <FileText className="text-white" size={32} />
                      </motion.div>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">Complete Study Guide Collection</h3>
                      <p className="text-gray-600 mb-4">
                        Access Khan Academy's comprehensive study skills course featuring proven learning techniques,
                        time management strategies, note-taking methods, and test preparation guides. This free resource
                        has helped millions of students worldwide improve their academic performance.
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        <Badge className="bg-purple-100 text-purple-800">Free Access</Badge>
                        <Badge className="bg-blue-100 text-blue-800">Video Lessons</Badge>
                        <Badge className="bg-green-100 text-green-800">Interactive Exercises</Badge>
                        <Badge className="bg-orange-100 text-orange-800">Millions of Users</Badge>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex gap-2">
                      {isElevenLabsConfigured && (
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button
                            variant="outline"
                            onClick={() =>
                              speakResourceDescription(
                                "Featured resource: Complete Study Guide Collection. Access our comprehensive collection of study materials, templates, and guides.",
                              )
                            }
                          >
                            <Volume2 size={20} />
                          </Button>
                        </motion.div>
                      )}
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          asChild
                          size="lg"
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                        >
                          <a
                            href="https://www.khanacademy.org/college-careers-more/study-skills"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="mr-2" size={20} />
                            Access Now
                          </a>
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Study Timeline */}
            <div className="mb-12">
              <motion.h2
                className="text-2xl font-bold text-gray-800 mb-6 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Calendar className="inline-block mr-2" size={24} />
                Your Study Journey
              </motion.h2>
              <motion.div
                className="max-w-4xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-gradient-to-b from-purple-200 to-pink-200"></div>

                  {/* Timeline items */}
                  <div className="space-y-8">
                    {[
                      {
                        icon: Target,
                        title: "Set Goals",
                        desc: "Define your learning objectives",
                        color: "from-purple-500 to-purple-600",
                      },
                      {
                        icon: PlayCircle,
                        title: "Start Learning",
                        desc: "Begin with our curated resources",
                        color: "from-blue-500 to-blue-600",
                      },
                      {
                        icon: TrendingUp,
                        title: "Track Progress",
                        desc: "Monitor your improvement",
                        color: "from-green-500 to-green-600",
                      },
                      {
                        icon: Award,
                        title: "Achieve Success",
                        desc: "Reach your academic goals",
                        color: "from-orange-500 to-orange-600",
                      },
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        className={`flex items-center ${index % 2 === 0 ? "justify-start" : "justify-end"}`}
                        initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.2 }}
                      >
                        <div
                          className={`flex items-center gap-4 ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"} max-w-sm`}
                        >
                          <div
                            className={`w-12 h-12 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center shadow-lg`}
                          >
                            <item.icon className="text-white" size={20} />
                          </div>
                          <Card className="p-4 bg-white/60 backdrop-blur-sm border border-white/20 hover:bg-white/80 transition-all duration-300">
                            <h3 className="font-semibold text-gray-800 flex items-center gap-2">{item.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                          </Card>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Achievement Badges */}
            <motion.div
              className="mb-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-center gap-2">
                <Star className="text-yellow-500" size={20} />
                Study Achievements
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  { icon: CheckCircle, label: "First Resource", count: "1.2k", color: "text-green-600" },
                  { icon: Zap, label: "Speed Learner", count: "856", color: "text-blue-600" },
                  { icon: Target, label: "Goal Crusher", count: "2.1k", color: "text-purple-600" },
                  { icon: Award, label: "Study Master", count: "445", color: "text-orange-600" },
                ].map((badge, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 hover:bg-white/80 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1 + index * 0.1 }}
                  >
                    <badge.icon className={badge.color} size={16} />
                    <span className="text-sm font-medium text-gray-700">{badge.label}</span>
                    <Badge variant="outline" className="text-xs">
                      {badge.count}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Resources Grid */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <motion.h2
                  className="text-2xl font-bold text-gray-800"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  All Resources ({filteredResources.length})
                </motion.h2>
                {learningStyle !== "all" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Badge className="bg-blue-100 text-blue-800">Filtered for {learningStyle} learners</Badge>
                  </motion.div>
                )}
              </div>

              {filteredResources.length === 0 ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <Card className="p-12 text-center bg-white/40">
                    <BookOpen className="mx-auto mb-4 text-gray-400" size={48} />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No resources found</h3>
                    <p className="text-gray-500">Try adjusting your filters or search query</p>
                  </Card>
                </motion.div>
              ) : (
                <div ref={resourcesGridRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResources.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="tips">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <motion.h2
                  className="text-3xl font-bold text-gray-800 mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Proven Study Tips
                </motion.h2>
                <motion.p
                  className="text-gray-600"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Evidence-based strategies to improve your learning effectiveness
                </motion.p>
              </div>

              <div ref={tipsGridRef} className="grid md:grid-cols-2 gap-6">
                {studyTips.map((tip, index) => (
                  <motion.div
                    key={tip.id}
                    className="tip-card transform-gpu"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-6 bg-white/60 backdrop-blur-sm border border-white/20 hover:bg-white/80 transition-all duration-500 hover:shadow-lg">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-gray-800 text-lg flex-1">{tip.title}</h3>
                        <div className="flex items-center gap-2 ml-2">
                          <Badge variant="outline">{tip.category}</Badge>
                          <Badge className={difficultyColors[tip.difficulty]}>{tip.difficulty}</Badge>
                        </div>
                      </div>

                      <div className="relative">
                        <motion.p
                          className={`text-gray-600 leading-relaxed transition-all duration-300 ${
                            expandedTips.includes(tip.id) ? "" : "line-clamp-3"
                          }`}
                          layout
                        >
                          {tip.description}
                        </motion.p>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-4">
                            <motion.button
                              onClick={() => toggleTipLike(tip.id)}
                              className={`flex items-center gap-1 text-sm transition-colors ${
                                tip.isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
                              }`}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Heart size={16} className={tip.isLiked ? "fill-current" : ""} />
                              {tip.likes}
                            </motion.button>

                            {isElevenLabsConfigured && (
                              <motion.button
                                onClick={() => handleSpeakTip(tip)}
                                className="flex items-center gap-1 text-sm text-gray-500 hover:text-purple-600 transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Volume2 size={16} />
                                Listen
                              </motion.button>
                            )}
                          </div>

                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleTip(tip.id)}
                              className="text-purple-600 hover:text-purple-700"
                            >
                              {expandedTips.includes(tip.id) ? (
                                <>
                                  Show Less <ChevronUp size={16} className="ml-1" />
                                </>
                              ) : (
                                <>
                                  Read More <ChevronDown size={16} className="ml-1" />
                                </>
                              )}
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Additional Resources */}
              <motion.div
                className="mt-12 text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Card className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 hover:shadow-xl transition-all duration-500">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Want More Study Resources?</h3>
                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    Join our community of learners and get access to exclusive study materials, live study sessions, and
                    personalized learning recommendations.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
                        <Users className="mr-2" size={20} />
                        Join Study Community
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="outline">
                        <BookOpen className="mr-2" size={20} />
                        Browse More Resources
                      </Button>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Resource Details Modal */}
        <Dialog open={!!selectedResource} onOpenChange={() => setSelectedResource(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedResource?.title}</DialogTitle>
            </DialogHeader>

            {selectedResource && (
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-gray-600">{selectedResource.description}</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Notes</label>
                    <Textarea
                      value={userNotes}
                      onChange={(e) => setUserNotes(e.target.value)}
                      placeholder="Add your notes about this resource..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button
                          key={star}
                          onClick={() => setUserRating(star)}
                          className={`text-2xl transition-colors ${star <= userRating ? "text-yellow-400" : "text-gray-300"}`}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          ★
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                      <Button onClick={saveResourceNotes} className="w-full">
                        Save Notes
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button variant="outline" asChild>
                        <a href={selectedResource.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2" size={16} />
                          Open Resource
                        </a>
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </DialogContent>
        </Dialog>
        {/* AI Study Assistant Chatbot */}
        <motion.div
          className="fixed bottom-6 right-6 z-50"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1 }}
        >
          {!showChatbot ? (
            <motion.button
              onClick={initializeChatbot}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <MessageCircle size={24} />
            </motion.button>
          ) : (
            <motion.div
              className="bg-white rounded-lg shadow-2xl border border-gray-200 w-80 h-96 flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Chatbot Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-t-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle size={20} />
                  <h3 className="font-semibold">AI Study Assistant</h3>
                </div>
                <button onClick={closeChatbot} className="hover:bg-white/20 p-1 rounded transition-colors">
                  <X size={16} />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((message) => (
                  <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.isUser
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      {message.audioUrl && (
                        <button
                          onClick={() => playMessageAudio(message.audioUrl!)}
                          className="mt-2 flex items-center gap-1 text-xs opacity-70 hover:opacity-100"
                        >
                          <Volume2 size={12} />
                          Play Audio
                        </button>
                      )}
                      <p className="text-xs opacity-60 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                    placeholder="Ask me about study techniques..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    disabled={isLoading}
                  />
                  <button
                    onClick={startVoiceRecognition}
                    className={`p-2 rounded-lg transition-colors ${
                      isListening ? "bg-red-500 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                    }`}
                    disabled={isLoading}
                  >
                    {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                  </button>
                  <button
                    onClick={sendChatMessage}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-2 rounded-lg transition-all duration-300 disabled:opacity-50"
                    disabled={isLoading || !currentMessage.trim()}
                  >
                    <Send size={16} />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {isElevenLabsConfigured ? "AI-powered with voice responses" : "Text-based study assistant"}
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
