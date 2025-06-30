"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { gsap } from "gsap"
import {
  Eye,
  Headphones,
  Users,
  Target,
  Brain,
  Lightbulb,
  CheckCircle,
  RotateCcw,
  Share2,
  Download,
  TrendingUp,
  Star,
  Zap,
  Heart,
  MessageCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"

interface Question {
  id: number
  question: string
  options: {
    text: string
    type: "visual" | "auditory" | "kinesthetic"
    icon: React.ComponentType<any>
  }[]
}

interface LearningStyleResult {
  visual: number
  auditory: number
  kinesthetic: number
}

interface PersonalityTraits {
  primary: string
  secondary: string
  strengths: string[]
  challenges: string[]
  studyTips: string[]
  recommendedResources: string[]
}

const questions: Question[] = [
  {
    id: 1,
    question: "When learning something new, I prefer to:",
    options: [
      { text: "Read detailed instructions and diagrams", type: "visual", icon: Eye },
      { text: "Listen to explanations and discussions", type: "auditory", icon: Headphones },
      { text: "Try it hands-on and learn by doing", type: "kinesthetic", icon: Users },
    ],
  },
  {
    id: 2,
    question: "When I need to remember information, I:",
    options: [
      { text: "Create visual aids like charts or mind maps", type: "visual", icon: Eye },
      { text: "Repeat it out loud or discuss it with others", type: "auditory", icon: Headphones },
      { text: "Write it down or practice it physically", type: "kinesthetic", icon: Users },
    ],
  },
  {
    id: 3,
    question: "In a classroom setting, I learn best when:",
    options: [
      { text: "The teacher uses slides, diagrams, and visual presentations", type: "visual", icon: Eye },
      { text: "The teacher explains concepts verbally and encourages discussion", type: "auditory", icon: Headphones },
      { text: "There are hands-on activities and group work", type: "kinesthetic", icon: Users },
    ],
  },
  {
    id: 4,
    question: "When solving problems, I tend to:",
    options: [
      { text: "Visualize the problem and draw diagrams", type: "visual", icon: Eye },
      { text: "Talk through the problem step by step", type: "auditory", icon: Headphones },
      { text: "Work through examples and practice similar problems", type: "kinesthetic", icon: Users },
    ],
  },
  {
    id: 5,
    question: "My ideal study environment includes:",
    options: [
      { text: "Good lighting, organized materials, and visual references", type: "visual", icon: Eye },
      { text: "Background music or the ability to read aloud", type: "auditory", icon: Headphones },
      { text: "Comfortable seating and the freedom to move around", type: "kinesthetic", icon: Users },
    ],
  },
  {
    id: 6,
    question: "When taking notes, I prefer to:",
    options: [
      { text: "Use colors, highlights, and organize information visually", type: "visual", icon: Eye },
      { text: "Record lectures or summarize in my own words", type: "auditory", icon: Headphones },
      { text: "Write by hand and use bullet points or lists", type: "kinesthetic", icon: Users },
    ],
  },
  {
    id: 7,
    question: "I remember information best when:",
    options: [
      { text: "I can see it written down or in a diagram", type: "visual", icon: Eye },
      { text: "I hear it explained or discuss it with others", type: "auditory", icon: Headphones },
      { text: "I can connect it to real-world examples or experiences", type: "kinesthetic", icon: Users },
    ],
  },
  {
    id: 8,
    question: "When studying for exams, I:",
    options: [
      { text: "Create flashcards, charts, and visual summaries", type: "visual", icon: Eye },
      { text: "Read notes aloud or form study groups", type: "auditory", icon: Headphones },
      { text: "Practice with mock tests and hands-on exercises", type: "kinesthetic", icon: Users },
    ],
  },
  {
    id: 9,
    question: "I understand concepts better when:",
    options: [
      { text: "I can see examples and visual representations", type: "visual", icon: Eye },
      { text: "Someone explains them to me verbally", type: "auditory", icon: Headphones },
      { text: "I can apply them in practical situations", type: "kinesthetic", icon: Users },
    ],
  },
  {
    id: 10,
    question: "My attention is best maintained when:",
    options: [
      { text: "Information is presented with visual variety", type: "visual", icon: Eye },
      { text: "There's verbal interaction and discussion", type: "auditory", icon: Headphones },
      { text: "I can be actively involved and engaged", type: "kinesthetic", icon: Users },
    ],
  },
]

const learningStyleDescriptions = {
  visual: {
    title: "Visual Learner",
    description:
      "You learn best through seeing and visualizing information. You prefer charts, diagrams, and written instructions.",
    icon: Eye,
    color: "from-blue-500 to-cyan-500",
    strengths: [
      "Excellent at remembering visual details",
      "Good at organizing information spatially",
      "Strong ability to follow written instructions",
      "Effective at creating mental images",
    ],
    challenges: [
      "May struggle with purely auditory instructions",
      "Can be distracted by visual clutter",
      "Might have difficulty with verbal-only presentations",
    ],
    studyTips: [
      "Use mind maps and flowcharts",
      "Highlight and color-code notes",
      "Create visual summaries and infographics",
      "Use flashcards with images",
      "Study in well-lit, organized spaces",
    ],
  },
  auditory: {
    title: "Auditory Learner",
    description:
      "You learn best through listening and verbal communication. You prefer discussions, lectures, and audio materials.",
    icon: Headphones,
    color: "from-green-500 to-emerald-500",
    strengths: [
      "Excellent listening skills",
      "Good at remembering spoken information",
      "Strong verbal communication abilities",
      "Effective in group discussions",
    ],
    challenges: [
      "May struggle with silent reading",
      "Can be distracted by background noise",
      "Might have difficulty with visual-only materials",
    ],
    studyTips: [
      "Read notes and textbooks aloud",
      "Join study groups and discussions",
      "Use audio recordings and podcasts",
      "Explain concepts to others",
      "Study with background music if helpful",
    ],
  },
  kinesthetic: {
    title: "Kinesthetic Learner",
    description:
      "You learn best through hands-on experience and physical activity. You prefer practical applications and movement.",
    icon: Users,
    color: "from-purple-500 to-pink-500",
    strengths: [
      "Excellent at hands-on learning",
      "Good at remembering through practice",
      "Strong problem-solving abilities",
      "Effective at learning through experience",
    ],
    challenges: [
      "May struggle with long lectures",
      "Can be restless during passive learning",
      "Might have difficulty with abstract concepts",
    ],
    studyTips: [
      "Take frequent breaks and move around",
      "Use hands-on activities and experiments",
      "Practice with real-world applications",
      "Write notes by hand",
      "Study while walking or using a standing desk",
    ],
  },
}

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<LearningStyleResult>({ visual: 0, auditory: 0, kinesthetic: 0 })
  const [primaryStyle, setPrimaryStyle] = useState<string>("")
  const [secondaryStyle, setSecondaryStyle] = useState<string>("")
  const [isAnimating, setIsAnimating] = useState(false)

  const questionRef = useRef<HTMLDivElement>(null)
  const optionsRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    animateQuestionEntry()
  }, [currentQuestion])

  const animateQuestionEntry = () => {
    if (questionRef.current && optionsRef.current) {
      const tl = gsap.timeline()

      tl.fromTo(
        questionRef.current,
        { opacity: 0, y: 50, rotationX: -15 },
        { opacity: 1, y: 0, rotationX: 0, duration: 0.8, ease: "power3.out" },
      ).fromTo(
        optionsRef.current.children,
        { opacity: 0, y: 30, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: "back.out(1.7)" },
        "-=0.4",
      )
    }
  }

  const handleAnswer = (answerType: string) => {
    if (isAnimating) return

    setIsAnimating(true)
    const newAnswers = [...answers, answerType]
    setAnswers(newAnswers)

    // Animate out current question
    if (questionRef.current && optionsRef.current) {
      gsap.to([questionRef.current, optionsRef.current], {
        opacity: 0,
        x: -100,
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => {
          if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1)
          } else {
            calculateResults(newAnswers)
          }
          setIsAnimating(false)
        },
      })
    }
  }

  const calculateResults = (allAnswers: string[]) => {
    const counts = { visual: 0, auditory: 0, kinesthetic: 0 }

    allAnswers.forEach((answer) => {
      counts[answer as keyof typeof counts]++
    })

    const total = allAnswers.length
    const percentages = {
      visual: Math.round((counts.visual / total) * 100),
      auditory: Math.round((counts.auditory / total) * 100),
      kinesthetic: Math.round((counts.kinesthetic / total) * 100),
    }

    setResults(percentages)

    // Determine primary and secondary styles
    const sortedStyles = Object.entries(percentages).sort(([, a], [, b]) => b - a)

    setPrimaryStyle(sortedStyles[0][0])
    setSecondaryStyle(sortedStyles[1][0])

    // Save results to localStorage
    localStorage.setItem(
      "learningStyleResults",
      JSON.stringify({
        results: percentages,
        primary: sortedStyles[0][0],
        secondary: sortedStyles[1][0],
        completedAt: new Date().toISOString(),
      }),
    )

    setShowResults(true)
    toast.success("Quiz completed! Your learning style has been identified.")
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setAnswers([])
    setShowResults(false)
    setResults({ visual: 0, auditory: 0, kinesthetic: 0 })
    setPrimaryStyle("")
    setSecondaryStyle("")
  }

  const shareResults = () => {
    const primaryStyleData = learningStyleDescriptions[primaryStyle as keyof typeof learningStyleDescriptions]
    const text = `I just discovered I'm a ${primaryStyleData?.title}! 🧠 Take the learning style quiz to find out yours: ${window.location.href}`

    if (navigator.share) {
      navigator.share({
        title: "My Learning Style Results",
        text: text,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(text)
      toast.success("Results copied to clipboard!")
    }
  }

  const downloadResults = () => {
    const primaryStyleData = learningStyleDescriptions[primaryStyle as keyof typeof learningStyleDescriptions]
    const secondaryStyleData = learningStyleDescriptions[secondaryStyle as keyof typeof learningStyleDescriptions]

    const content = `
Learning Style Assessment Results
Generated on: ${new Date().toLocaleDateString()}

PRIMARY LEARNING STYLE: ${primaryStyleData?.title} (${results[primaryStyle as keyof typeof results]}%)
${primaryStyleData?.description}

SECONDARY LEARNING STYLE: ${secondaryStyleData?.title} (${results[secondaryStyle as keyof typeof results]}%)

STRENGTHS:
${primaryStyleData?.strengths.map((s) => `• ${s}`).join("\n")}

STUDY TIPS:
${primaryStyleData?.studyTips.map((s) => `• ${s}`).join("\n")}

CHALLENGES TO WORK ON:
${primaryStyleData?.challenges.map((s) => `• ${s}`).join("\n")}
    `

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "learning-style-results.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success("Results downloaded!")
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100

  if (showResults) {
    const primaryStyleData = learningStyleDescriptions[primaryStyle as keyof typeof learningStyleDescriptions]
    const secondaryStyleData = learningStyleDescriptions[secondaryStyle as keyof typeof learningStyleDescriptions]
    const PrimaryIcon = primaryStyleData?.icon
    const SecondaryIcon = secondaryStyleData?.icon

    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <div className="flex justify-center mb-4">
              <motion.div
                className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                <CheckCircle className="text-white" size={40} />
              </motion.div>
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Your Learning Style Results
            </h1>
            <p className="text-xl text-gray-600">Discover how you learn best and optimize your study approach</p>
          </motion.div>

          {/* Results Overview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid md:grid-cols-3 gap-6 mb-8"
          >
            {Object.entries(results).map(([style, percentage], index) => {
              const styleData = learningStyleDescriptions[style as keyof typeof learningStyleDescriptions]
              const StyleIcon = styleData.icon
              const isPrimary = style === primaryStyle

              return (
                <motion.div
                  key={style}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <Card
                    className={`p-6 text-center relative overflow-hidden ${
                      isPrimary
                        ? "ring-2 ring-purple-500 bg-gradient-to-br from-purple-50 to-pink-50"
                        : "bg-white/60 backdrop-blur-sm"
                    }`}
                  >
                    {isPrimary && (
                      <motion.div
                        className="absolute top-2 right-2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8 }}
                      >
                        <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">Primary</Badge>
                      </motion.div>
                    )}

                    <div
                      className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${styleData.color} rounded-full flex items-center justify-center`}
                    >
                      <StyleIcon className="text-white" size={24} />
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-2">{styleData.title}</h3>

                    <div className="mb-4">
                      <div className="text-3xl font-bold text-gray-800 mb-2">{percentage}%</div>
                      <Progress value={percentage} className="h-3" />
                    </div>

                    <p className="text-sm text-gray-600">{styleData.description}</p>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Detailed Results */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Primary Style Details */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
              <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${primaryStyleData?.color} rounded-lg flex items-center justify-center`}
                  >
                    {PrimaryIcon && <PrimaryIcon className="text-white" size={20} />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Primary Style</h3>
                    <p className="text-purple-600 font-semibold">{primaryStyleData?.title}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <Star className="text-yellow-500" size={16} />
                      Your Strengths
                    </h4>
                    <ul className="space-y-1">
                      {primaryStyleData?.strengths.map((strength, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={12} />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <Lightbulb className="text-orange-500" size={16} />
                      Study Tips
                    </h4>
                    <ul className="space-y-1">
                      {primaryStyleData?.studyTips.slice(0, 3).map((tip, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <Zap className="text-blue-500 flex-shrink-0 mt-0.5" size={12} />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Secondary Style & Challenges */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-6"
            >
              <Card className="p-6 bg-white/60 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${secondaryStyleData?.color} rounded-lg flex items-center justify-center`}
                  >
                    {SecondaryIcon && <SecondaryIcon className="text-white" size={20} />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Secondary Style</h3>
                    <p className="text-gray-600">{secondaryStyleData?.title}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{secondaryStyleData?.description}</p>
              </Card>

              <Card className="p-6 bg-white/60 backdrop-blur-sm">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Target className="text-red-500" size={16} />
                  Areas for Growth
                </h4>
                <ul className="space-y-2">
                  {primaryStyleData?.challenges.map((challenge, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                      <TrendingUp className="text-orange-500 flex-shrink-0 mt-0.5" size={12} />
                      {challenge}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Button
              onClick={shareResults}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
            >
              <Share2 className="mr-2" size={16} />
              Share Results
            </Button>

            <Button
              onClick={downloadResults}
              variant="outline"
              className="border-purple-200 hover:bg-purple-50 bg-transparent"
            >
              <Download className="mr-2" size={16} />
              Download Report
            </Button>

            <Button onClick={resetQuiz} variant="outline" className="border-gray-200 hover:bg-gray-50 bg-transparent">
              <RotateCcw className="mr-2" size={16} />
              Retake Quiz
            </Button>
          </motion.div>

          {/* Motivational Message */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-8 text-center"
          >
            <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
              <div className="flex justify-center mb-4">
                <Heart className="text-red-500" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Remember</h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Everyone learns differently, and that's your superpower! Use these insights to create a study approach
                that works best for you. Combine techniques from different styles to maximize your learning potential.
              </p>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Learning Style Assessment
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Discover your unique learning preferences to optimize your study approach
          </p>

          {/* Progress */}
          <div ref={progressRef} className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        </motion.div>

        {/* Question Card */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-8">
          <Card className="p-8 bg-white/60 backdrop-blur-sm border border-white/20 hover:bg-white/80 transition-all duration-500">
            <div ref={questionRef} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                  {currentQuestion + 1}
                </div>
                <Brain className="text-purple-600" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 leading-relaxed">
                {questions[currentQuestion]?.question}
              </h2>
            </div>

            <div ref={optionsRef} className="space-y-4">
              {questions[currentQuestion]?.options.map((option, index) => {
                const IconComponent = option.icon
                return (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswer(option.type)}
                    className="w-full p-6 text-left bg-white/40 hover:bg-white/60 border border-white/30 hover:border-purple-300 rounded-lg transition-all duration-300 group"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isAnimating}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-gray-400 to-gray-500 group-hover:from-purple-500 group-hover:to-pink-500 rounded-lg flex items-center justify-center transition-all duration-300">
                        <IconComponent className="text-white" size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium group-hover:text-purple-700 transition-colors">
                          {option.text}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </Card>
        </motion.div>

        {/* Learning Style Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-3 gap-4"
        >
          {Object.entries(learningStyleDescriptions).map(([key, style]) => {
            const StyleIcon = style.icon
            return (
              <Card key={key} className="p-4 bg-white/40 backdrop-blur-sm border border-white/20 text-center">
                <div
                  className={`w-10 h-10 mx-auto mb-2 bg-gradient-to-r ${style.color} rounded-full flex items-center justify-center`}
                >
                  <StyleIcon className="text-white" size={16} />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm">{style.title}</h3>
                <p className="text-xs text-gray-600 mt-1">{style.description}</p>
              </Card>
            )
          })}
        </motion.div>

        {/* Quiz Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
            <div className="flex justify-center mb-3">
              <MessageCircle className="text-blue-600" size={20} />
            </div>
            <p className="text-sm text-gray-600">
              This assessment will help identify your primary learning style. Answer honestly based on your natural
              preferences, not what you think is the "right" answer. There are no wrong choices!
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
