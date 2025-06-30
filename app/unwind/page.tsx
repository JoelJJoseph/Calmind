"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { gsap } from "gsap"
import { Play, Pause, RotateCcw, Volume2, Quote, Sparkles, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { speakText } from "@/lib/elevenlabs"

const quotes = [
  {
    text: "The present moment is the only time over which we have dominion.",
    author: "Thich Nhat Hanh",
  },
  {
    text: "Peace comes from within. Do not seek it without.",
    author: "Buddha",
  },
  {
    text: "Breathe in peace, breathe out stress.",
    author: "Unknown",
  },
  {
    text: "Your calm mind is the ultimate weapon against your challenges.",
    author: "Bryant McGill",
  },
  {
    text: "In the midst of movement and chaos, keep stillness inside of you.",
    author: "Deepak Chopra",
  },
  {
    text: "The quieter you become, the more you can hear.",
    author: "Ram Dass",
  },
  {
    text: "Meditation is not about stopping thoughts, but recognizing that you are more than your thoughts.",
    author: "Arianna Huffington",
  },
  {
    text: "Wherever you are, be there totally.",
    author: "Eckhart Tolle",
  },
]

const breathingPatterns = {
  calm: { inhale: 4, hold: 4, exhale: 4, hold2: 2 },
  energize: { inhale: 4, hold: 7, exhale: 8, hold2: 0 },
  focus: { inhale: 6, hold: 2, exhale: 6, hold2: 2 },
  sleep: { inhale: 4, hold: 7, exhale: 8, hold2: 0 },
}

type BreathingPhase = "inhale" | "hold" | "exhale" | "hold2"
type BreathingPattern = keyof typeof breathingPatterns

export default function UnwindPage() {
  const [isBreathing, setIsBreathing] = useState(false)
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>("inhale")
  const [phaseTime, setPhaseTime] = useState(0)
  const [cycle, setCycle] = useState(0)
  const [pattern, setPattern] = useState<BreathingPattern>("calm")
  const [duration, setDuration] = useState(5) // minutes
  const [timeLeft, setTimeLeft] = useState(duration * 60)
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [ambientMode, setAmbientMode] = useState(false)

  const breathingCircleRef = useRef<HTMLDivElement>(null)
  const backgroundRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const sessionIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Only access localStorage on the client side
    if (typeof window !== "undefined") {
      const savedPrefs = localStorage.getItem("unwindPreferences")
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs)
        setPattern(prefs.pattern || "calm")
        setDuration(prefs.duration || 5)
        setVoiceEnabled(prefs.voiceEnabled !== undefined ? prefs.voiceEnabled : true)
        setAmbientMode(prefs.ambientMode || false)
      }
    }

    // Animate background
    if (backgroundRef.current) {
      gsap.to(backgroundRef.current.children, {
        rotation: 360,
        duration: 60,
        repeat: -1,
        ease: "none",
        stagger: 10,
      })
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (sessionIntervalRef.current) clearInterval(sessionIntervalRef.current)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "unwindPreferences",
        JSON.stringify({
          pattern,
          duration,
          voiceEnabled,
          ambientMode,
        }),
      )
    }
  }, [pattern, duration, voiceEnabled, ambientMode])

  useEffect(() => {
    setTimeLeft(duration * 60)
  }, [duration])

  useEffect(() => {
    if (isBreathing) {
      startBreathingCycle()
      startSessionTimer()
    } else {
      stopBreathingCycle()
      stopSessionTimer()
    }

    return () => {
      stopBreathingCycle()
      stopSessionTimer()
    }
  }, [isBreathing, pattern])

  const startBreathingCycle = () => {
    const currentPattern = breathingPatterns[pattern]
    let phase: BreathingPhase = "inhale"
    const phaseCounter = 0
    let cycleCounter = 0

    const runCycle = () => {
      const phaseDuration = currentPattern[phase]

      setCurrentPhase(phase)
      setPhaseTime(phaseDuration)
      setCycle(cycleCounter)

      // Animate breathing circle
      if (breathingCircleRef.current) {
        const scale = phase === "inhale" ? 1.5 : phase === "exhale" ? 0.8 : 1.2
        const duration = phaseDuration

        gsap.to(breathingCircleRef.current, {
          scale,
          duration,
          ease: phase === "inhale" ? "power2.out" : "power2.in",
        })
      }

      // Voice guidance
      if (voiceEnabled && phase === "inhale" && cycleCounter % 3 === 0) {
        const guidance = getPhaseGuidance(phase)
        speakText(guidance)
      }

      // Move to next phase
      setTimeout(() => {
        if (phase === "inhale") {
          phase = currentPattern.hold > 0 ? "hold" : "exhale"
        } else if (phase === "hold") {
          phase = "exhale"
        } else if (phase === "exhale") {
          phase = currentPattern.hold2 > 0 ? "hold2" : "inhale"
          if (currentPattern.hold2 === 0) cycleCounter++
        } else {
          phase = "inhale"
          cycleCounter++
        }

        if (isBreathing) {
          runCycle()
        }
      }, phaseDuration * 1000)
    }

    runCycle()
  }

  const stopBreathingCycle = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    if (breathingCircleRef.current) {
      gsap.to(breathingCircleRef.current, {
        scale: 1,
        duration: 1,
        ease: "power2.out",
      })
    }
  }

  const startSessionTimer = () => {
    sessionIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSessionComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const stopSessionTimer = () => {
    if (sessionIntervalRef.current) {
      clearInterval(sessionIntervalRef.current)
    }
  }

  const handleSessionComplete = () => {
    setIsBreathing(false)
    if (voiceEnabled) {
      speakText("Your mindfulness session is complete. Take a moment to notice how you feel.")
    }

    // Save session stats only on client side
    if (typeof window !== "undefined") {
      const stats = JSON.parse(localStorage.getItem("unwindStats") || '{"sessions": 0, "totalMinutes": 0}')
      stats.sessions += 1
      stats.totalMinutes += duration
      localStorage.setItem("unwindStats", JSON.stringify(stats))
    }
  }

  const getPhaseGuidance = (phase: BreathingPhase) => {
    const guidance = {
      inhale: "Breathe in slowly and deeply",
      hold: "Hold your breath gently",
      exhale: "Breathe out slowly and completely",
      hold2: "Rest and prepare for the next breath",
    }
    return guidance[phase] || ""
  }

  const getPhaseInstruction = (phase: BreathingPhase) => {
    const instructions = {
      inhale: "Breathe In",
      hold: "Hold",
      exhale: "Breathe Out",
      hold2: "Rest",
    }
    return instructions[phase] || ""
  }

  const toggleBreathing = () => {
    if (!isBreathing && voiceEnabled) {
      speakText(`Starting ${pattern} breathing session. Find a comfortable position and follow the circle.`)
    }
    setIsBreathing(!isBreathing)
  }

  const resetSession = () => {
    setIsBreathing(false)
    setTimeLeft(duration * 60)
    setCycle(0)
    setCurrentPhase("inhale")
  }

  const nextQuote = () => {
    setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getStats = () => {
    if (typeof window === "undefined") {
      return { sessions: 0, totalMinutes: 0 }
    }
    return JSON.parse(localStorage.getItem("unwindStats") || '{"sessions": 0, "totalMinutes": 0}')
  }

  const stats = getStats()

  return (
    <div
      className={`min-h-screen transition-all duration-1000 ${
        ambientMode
          ? "bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900"
          : "bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50"
      }`}
    >
      {/* Ambient Background */}
      <div ref={backgroundRef} className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-20 left-20 w-72 h-72 rounded-full blur-3xl opacity-30 ${
            ambientMode ? "bg-purple-400" : "bg-purple-300"
          }`}
        />
        <div
          className={`absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl opacity-30 ${
            ambientMode ? "bg-pink-400" : "bg-pink-300"
          }`}
        />
        <div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl opacity-30 ${
            ambientMode ? "bg-blue-400" : "bg-blue-300"
          }`}
        />
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 mb-4"
            >
              <Sparkles className={ambientMode ? "text-purple-300" : "text-purple-600"} size={24} />
              <h1
                className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${
                  ambientMode ? "from-purple-300 to-pink-300" : "from-purple-600 to-pink-600"
                } bg-clip-text text-transparent`}
              >
                Unwind
              </h1>
              <Sparkles className={ambientMode ? "text-pink-300" : "text-pink-600"} size={24} />
            </motion.div>
            <p className={`text-xl ${ambientMode ? "text-gray-300" : "text-gray-600"}`}>
              Find your center with guided breathing and mindfulness
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Breathing Circle */}
            <div className="lg:col-span-2">
              <Card
                className={`p-8 text-center ${
                  ambientMode
                    ? "bg-black/20 backdrop-blur-md border-white/10"
                    : "bg-white/60 backdrop-blur-sm border border-white/20"
                }`}
              >
                <div className="mb-8">
                  <motion.div
                    animate={{
                      boxShadow: isBreathing ? "0 0 40px rgba(255,255,255,0.4)" : "0 0 20px rgba(255,255,255,0.2)",
                    }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                    className={`inline-flex px-6 py-3 rounded-full bg-gradient-to-r ${getStateColor()} text-white font-semibold text-lg shadow-lg`}
                  >
                    {getStateLabel()}
                  </motion.div>
                </div>

                {/* Circular Progress */}
                <div className="relative mb-8">
                  <div className="relative w-80 h-80 mx-auto">
                    {/* Breathing Circle */}
                    <div
                      ref={breathingCircleRef}
                      className={`absolute inset-0 rounded-full ${
                        ambientMode
                          ? "bg-gradient-to-br from-purple-400/30 to-pink-400/30 border-2 border-purple-300/50"
                          : "bg-gradient-to-br from-purple-200/50 to-pink-200/50 border-2 border-purple-300"
                      } flex items-center justify-center`}
                    >
                      <div className={`text-center ${ambientMode ? "text-white" : "text-gray-800"}`}>
                        <div className="text-2xl font-bold mb-2">{getPhaseInstruction(currentPhase)}</div>
                        <div className="text-lg opacity-70">{phaseTime}s</div>
                      </div>
                    </div>

                    {/* Pulse Rings */}
                    {isBreathing && (
                      <>
                        <motion.div
                          className={`absolute inset-0 rounded-full border-2 ${
                            ambientMode ? "border-purple-300/30" : "border-purple-300/50"
                          }`}
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 0, 0.5],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                          }}
                        />
                        <motion.div
                          className={`absolute inset-0 rounded-full border-2 ${
                            ambientMode ? "border-pink-300/30" : "border-pink-300/50"
                          }`}
                          animate={{
                            scale: [1, 1.4, 1],
                            opacity: [0.5, 0, 0.5],
                          }}
                          transition={{
                            duration: 4,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                            delay: 1,
                          }}
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-4 mb-6">
                  <motion.div whileHover={{ scale: 1.1, y: -5 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      size="lg"
                      onClick={toggleBreathing}
                      className={`px-10 py-5 text-xl font-semibold ${
                        isBreathing
                          ? "bg-red-500/80 hover:bg-red-600/80 backdrop-blur-md"
                          : "bg-white/20 hover:bg-white/30 backdrop-blur-md"
                      } text-white border-0 shadow-2xl transition-all duration-300`}
                    >
                      {isBreathing ? (
                        <>
                          <Pause className="mr-2" size={20} />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="mr-2" size={20} />
                          Start
                        </>
                      )}
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.1, y: -5 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={resetSession}
                      className={`px-8 py-5 text-xl ${
                        ambientMode ? "border-white/20 text-white hover:bg-white/10" : ""
                      } shadow-xl transition-all duration-300`}
                    >
                      <RotateCcw className="mr-2" size={20} />
                      Reset
                    </Button>
                  </motion.div>
                </div>

                {/* Session Info */}
                <div
                  className={`flex justify-between items-center text-sm ${
                    ambientMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  <div>Cycle: {cycle}</div>
                  <div>Time Left: {formatTime(timeLeft)}</div>
                  <div>Pattern: {pattern}</div>
                </div>
              </Card>
            </div>

            {/* Settings & Stats */}
            <div className="space-y-6">
              {/* Settings */}
              <Card
                className={`p-6 ${
                  ambientMode
                    ? "bg-black/20 backdrop-blur-md border-white/10"
                    : "bg-white/60 backdrop-blur-sm border border-white/20"
                }`}
              >
                <h3 className={`text-xl font-bold mb-4 ${ambientMode ? "text-white" : "text-gray-800"}`}>Settings</h3>

                <div className="space-y-6">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${ambientMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Breathing Pattern
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.keys(breathingPatterns).map((patternKey) => (
                        <button
                          key={patternKey}
                          onClick={() => setPattern(patternKey as BreathingPattern)}
                          className={`p-3 rounded-lg text-sm font-medium transition-all ${
                            pattern === patternKey
                              ? ambientMode
                                ? "bg-purple-500/50 text-white border-2 border-purple-400"
                                : "bg-purple-100 text-purple-800 border-2 border-purple-300"
                              : ambientMode
                                ? "bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20"
                                : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          {patternKey.charAt(0).toUpperCase() + patternKey.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${ambientMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Duration: {duration} minutes
                    </label>
                    <Slider
                      value={[duration]}
                      onValueChange={(value) => setDuration(value[0])}
                      max={30}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Volume2 size={20} className={ambientMode ? "text-gray-300" : "text-gray-600"} />
                        <span className={`text-sm font-medium ${ambientMode ? "text-gray-300" : "text-gray-700"}`}>
                          Voice Guidance
                        </span>
                      </div>
                      <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {ambientMode ? (
                          <Sun size={20} className="text-gray-300" />
                        ) : (
                          <Moon size={20} className="text-gray-600" />
                        )}
                        <span className={`text-sm font-medium ${ambientMode ? "text-gray-300" : "text-gray-700"}`}>
                          Ambient Mode
                        </span>
                      </div>
                      <Switch checked={ambientMode} onCheckedChange={setAmbientMode} />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Stats */}
              <Card
                className={`p-6 ${
                  ambientMode
                    ? "bg-black/20 backdrop-blur-md border-white/10"
                    : "bg-white/60 backdrop-blur-sm border border-white/20"
                }`}
              >
                <h3 className={`text-xl font-bold mb-4 ${ambientMode ? "text-white" : "text-gray-800"}`}>
                  Your Progress
                </h3>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className={`text-3xl font-bold mb-1 ${ambientMode ? "text-purple-300" : "text-purple-600"}`}>
                      {stats.sessions}
                    </div>
                    <div className={`text-sm ${ambientMode ? "text-gray-300" : "text-gray-600"}`}>
                      Sessions Completed
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold mb-1 ${ambientMode ? "text-green-300" : "text-green-600"}`}>
                      {stats.totalMinutes}
                    </div>
                    <div className={`text-sm ${ambientMode ? "text-gray-300" : "text-gray-600"}`}>Minutes Mindful</div>
                  </div>
                </div>
              </Card>

              {/* Inspirational Quote */}
              <Card
                className={`p-6 ${
                  ambientMode
                    ? "bg-black/20 backdrop-blur-md border-white/10"
                    : "bg-white/60 backdrop-blur-sm border border-white/20"
                }`}
              >
                <div className="text-center">
                  <Quote className={`mx-auto mb-4 ${ambientMode ? "text-purple-300" : "text-purple-600"}`} size={24} />
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentQuoteIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                    >
                      <p className={`mb-4 italic ${ambientMode ? "text-gray-200" : "text-gray-700"}`}>
                        "{quotes[currentQuoteIndex].text}"
                      </p>
                      <p className={`text-sm font-medium ${ambientMode ? "text-gray-300" : "text-gray-500"}`}>
                        — {quotes[currentQuoteIndex].author}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                  <Button
                    onClick={nextQuote}
                    variant="ghost"
                    size="sm"
                    className={`mt-4 ${
                      ambientMode ? "text-purple-300 hover:bg-white/10" : "text-purple-600 hover:bg-purple-50"
                    }`}
                  >
                    New Quote
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  function getStateColor() {
    switch (currentPhase) {
      case "inhale":
        return "from-blue-500 to-cyan-500"
      case "hold":
        return "from-purple-500 to-pink-500"
      case "exhale":
        return "from-green-500 to-emerald-500"
      case "hold2":
        return "from-orange-500 to-red-500"
      default:
        return "from-purple-500 to-blue-500"
    }
  }

  function getStateLabel() {
    switch (currentPhase) {
      case "inhale":
        return "Breathe In"
      case "hold":
        return "Hold"
      case "exhale":
        return "Breathe Out"
      case "hold2":
        return "Rest"
      default:
        return "Ready"
    }
  }
}
