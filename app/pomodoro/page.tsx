'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { Play, Pause, RotateCcw, Settings, Volume2, VolumeX, Maximize, Minimize, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { speakText } from '@/lib/elevenlabs';

interface TimerSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
  soundEnabled: boolean;
}

type TimerState = 'work' | 'shortBreak' | 'longBreak';

// Your specified video URLs
const backgroundVideos = [
  'https://cdn.pixabay.com/video/2024/06/23/217850_large.mp4',
  'https://cdn.pixabay.com/video/2020/03/03/33194-396036988_large.mp4',
  'https://cdn.pixabay.com/video/2023/11/10/188595-883402169_large.mp4',
  'https://cdn.pixabay.com/video/2024/06/10/216134_large.mp4',
];

export default function PomodoroTimer() {
  const [settings, setSettings] = useState<TimerSettings>({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
    soundEnabled: true,
  });

  const [currentState, setCurrentState] = useState<TimerState>('work');
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const circleRef = useRef<SVGCircleElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const radius = 120;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    // Load saved preferences
    const savedPrefs = localStorage.getItem('pomodoroSettings');
    if (savedPrefs) {
      const prefs = JSON.parse(savedPrefs);
      setSettings(prefs);
      setTimeLeft(prefs.workDuration * 60);
    }

    // Set random video on load
    setCurrentVideoIndex(Math.floor(Math.random() * backgroundVideos.length));

    // Handle fullscreen changes
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    setTimeLeft(settings.workDuration * 60);
  }, [settings.workDuration]);

  useEffect(() => {
    if (isRunning) {
      startTimer();
    } else {
      stopTimer();
    }

    return () => {
      stopTimer();
    };
  }, [isRunning]);

  useEffect(() => {
    updateCircleProgress();
  }, [timeLeft, currentState, settings]);

  // Change video every 3 minutes during active sessions
  useEffect(() => {
    if (!isRunning) return;

    const videoChangeInterval = setInterval(() => {
      changeVideo();
    }, 3 * 60 * 1000); // 3 minutes

    return () => clearInterval(videoChangeInterval);
  }, [isRunning]);

  const updateCircleProgress = () => {
    if (!circleRef.current) return;

    const totalTime = getCurrentSessionDuration();
    const progress = (totalTime - timeLeft) / totalTime;
    const strokeDashoffset = circumference - (progress * circumference);

    gsap.to(circleRef.current, {
      strokeDashoffset,
      duration: 0.5,
      ease: 'power2.out'
    });
  };

  const getCurrentSessionDuration = () => {
    switch (currentState) {
      case 'work': return settings.workDuration * 60;
      case 'shortBreak': return settings.shortBreakDuration * 60;
      case 'longBreak': return settings.longBreakDuration * 60;
    }
  };

  const startTimer = () => {
    sessionIntervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSessionComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (sessionIntervalRef.current) {
      clearInterval(sessionIntervalRef.current);
    }
  };

  const handleSessionComplete = () => {
    setIsRunning(false);
    
    if (currentState === 'work') {
      const newSessionsCompleted = sessionsCompleted + 1;
      setSessionsCompleted(newSessionsCompleted);
      
      const isLongBreakTime = newSessionsCompleted % settings.sessionsUntilLongBreak === 0;
      const nextState = isLongBreakTime ? 'longBreak' : 'shortBreak';
      setCurrentState(nextState);
      setTimeLeft(getSessionDurationForState(nextState));
      
      const message = isLongBreakTime 
        ? "Great work! Time for a long break. You've earned it!"
        : "Good job! Take a short break to recharge.";
      
      if (settings.soundEnabled) {
        speakText(message);
      }
    } else {
      setCurrentState('work');
      setTimeLeft(settings.workDuration * 60);
      
      if (settings.soundEnabled) {
        speakText("Break time is over. Ready to focus again?");
      }
    }

    // Change video on session complete
    changeVideo();
    
    // Save session stats
    const stats = JSON.parse(localStorage.getItem('pomodoroStats') || '{"sessionsCompleted": 0}');
    stats.sessionsCompleted = sessionsCompleted + 1;
    localStorage.setItem('pomodoroStats', JSON.stringify(stats));
  };

  const getSessionDurationForState = (state: TimerState) => {
    switch (state) {
      case 'work': return settings.workDuration * 60;
      case 'shortBreak': return settings.shortBreakDuration * 60;
      case 'longBreak': return settings.longBreakDuration * 60;
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
    
    if (!isRunning && settings.soundEnabled) {
      const message = currentState === 'work' 
        ? "Focus session started. Let's get productive!"
        : "Break time started. Relax and recharge.";
      speakText(message);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setCurrentState('work');
    setTimeLeft(settings.workDuration * 60);
    setSessionsCompleted(0);
  };

  const changeVideo = () => {
    const nextIndex = (currentVideoIndex + 1) % backgroundVideos.length;
    setCurrentVideoIndex(nextIndex);
    setVideoLoaded(false);
  };

  const handleVideoLoad = () => {
    setVideoLoaded(true);
  };

  const handleVideoError = () => {
    console.log('Video failed to load, trying next video');
    changeVideo();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStateColor = () => {
    switch (currentState) {
      case 'work': return 'from-red-500 to-orange-500';
      case 'shortBreak': return 'from-green-500 to-emerald-500';
      case 'longBreak': return 'from-blue-500 to-purple-500';
    }
  };

  const getStateLabel = () => {
    switch (currentState) {
      case 'work': return 'Focus Time';
      case 'shortBreak': return 'Short Break';
      case 'longBreak': return 'Long Break';
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <motion.video
          ref={videoRef}
          key={currentVideoIndex}
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={handleVideoLoad}
          onError={handleVideoError}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: videoLoaded ? 1 : 0, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <source src={backgroundVideos[currentVideoIndex]} type="video/mp4" />
        </motion.video>
        
        {/* Loading overlay */}
        <AnimatePresence>
          {!videoLoaded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"
            />
          )}
        </AnimatePresence>
        
        {/* Dynamic overlay for better readability */}
        <motion.div 
          className="absolute inset-0"
          animate={{
            background: isRunning 
              ? "linear-gradient(45deg, rgba(0,0,0,0.3), rgba(0,0,0,0.5))"
              : "linear-gradient(45deg, rgba(0,0,0,0.4), rgba(0,0,0,0.6))"
          }}
          transition={{ duration: 2 }}
        />
        
        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-30, 30, -30],
                opacity: [0.2, 0.8, 0.2],
                scale: [0.5, 1.5, 0.5],
              }}
              transition={{
                duration: 6 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-8"
          >
            <motion.h1 
              className="text-5xl md:text-6xl font-bold mb-4 text-white drop-shadow-2xl"
              animate={{ 
                textShadow: isRunning 
                  ? "0 0 30px rgba(255,255,255,0.5)" 
                  : "0 0 20px rgba(255,255,255,0.3)" 
              }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            >
              Focus Timer
            </motion.h1>
            <p className="text-xl text-white/90 drop-shadow-lg">
              Boost your productivity with the Pomodoro Technique
            </p>
          </motion.div>

          {/* Controls Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex justify-between items-center mb-8"
          >
            <div className="flex gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={changeVideo}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 transition-all duration-300"
                >
                  <SkipForward size={16} className="mr-2" />
                  Change Scene
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={toggleFullscreen}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 transition-all duration-300"
                >
                  {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                  {isFullscreen ? 'Exit' : 'Fullscreen'}
                </Button>
              </motion.div>
            </div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => setShowSettings(!showSettings)}
                variant="outline"
                size="sm"
                className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 transition-all duration-300"
              >
                <Settings size={16} className="mr-2" />
                Settings
              </Button>
            </motion.div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Timer Section */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <Card className="p-8 bg-white/10 backdrop-blur-xl border border-white/20 text-center shadow-2xl">
                  <div className="mb-8">
                    <motion.div
                      animate={{ 
                        boxShadow: isRunning 
                          ? "0 0 40px rgba(255,255,255,0.4)" 
                          : "0 0 20px rgba(255,255,255,0.2)" 
                      }}
                      transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                      className={`inline-flex px-6 py-3 rounded-full bg-gradient-to-r ${getStateColor()} text-white font-semibold text-lg shadow-lg`}
                    >
                      {getStateLabel()}
                    </motion.div>
                  </div>

                  {/* Circular Progress */}
                  <div className="relative mb-8">
                    <motion.svg 
                      width="300" 
                      height="300" 
                      className="mx-auto"
                      animate={{ rotate: isRunning ? 360 : 0 }}
                      transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                    >
                      <circle
                        cx="150"
                        cy="150"
                        r={radius}
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.2)"
                        strokeWidth="8"
                      />
                      <circle
                        ref={circleRef}
                        cx="150"
                        cy="150"
                        r={radius}
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference}
                        transform="rotate(-90 150 150)"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.7" />
                          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.5" />
                        </linearGradient>
                      </defs>
                    </motion.svg>
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.div
                        key={timeLeft}
                        initial={{ scale: 1.1, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="text-6xl md:text-7xl font-bold text-white mb-3 drop-shadow-2xl"
                      >
                        {formatTime(timeLeft)}
                      </motion.div>
                      <motion.div 
                        className="text-white/90 text-xl font-medium"
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        Session {sessionsCompleted + 1}
                      </motion.div>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex justify-center gap-6 mb-8">
                    <motion.div
                      whileHover={{ scale: 1.1, y: -5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button
                        size="lg"
                        onClick={toggleTimer}
                        className={`px-10 py-5 text-xl font-semibold ${
                          isRunning 
                            ? 'bg-red-500/80 hover:bg-red-600/80 backdrop-blur-md' 
                            : 'bg-white/20 hover:bg-white/30 backdrop-blur-md'
                        } text-white border-0 shadow-2xl transition-all duration-300`}
                      >
                        {isRunning ? (
                          <>
                            <Pause className="mr-3" size={24} />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="mr-3" size={24} />
                            Start
                          </>
                        )}
                      </Button>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.1, y: -5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={resetTimer}
                        className="px-8 py-5 text-xl bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 shadow-xl transition-all duration-300"
                      >
                        <RotateCcw className="mr-3" size={24} />
                        Reset
                      </Button>
                    </motion.div>
                  </div>

                  {/* Progress Bar */}
                  <div className="bg-white/20 rounded-full h-3 mb-4 overflow-hidden">
                    <motion.div 
                      className={`h-full rounded-full bg-gradient-to-r ${getStateColor()} shadow-lg`}
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${((getCurrentSessionDuration() - timeLeft) / getCurrentSessionDuration()) * 100}%` 
                      }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-white/90 text-lg font-medium">
                    {Math.round(((getCurrentSessionDuration() - timeLeft) / getCurrentSessionDuration()) * 100)}% Complete
                  </p>
                </Card>
              </motion.div>
            </div>

            {/* Stats & Settings */}
            <div className="space-y-6">
              {/* Stats Card */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
                  <h3 className="font-bold text-white mb-6 text-xl">Today's Progress</h3>
                  
                  <div className="space-y-6">
                    <div className="text-center">
                      <motion.div
                        key={sessionsCompleted}
                        initial={{ scale: 1.3, color: "#fbbf24" }}
                        animate={{ scale: 1, color: "#ffffff" }}
                        transition={{ duration: 0.5 }}
                        className="text-4xl font-bold text-white mb-2"
                      >
                        {sessionsCompleted}
                      </motion.div>
                      <div className="text-white/80 font-medium">Sessions Completed</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-400 mb-2">
                        {Math.floor(sessionsCompleted * settings.workDuration / 60)}h {(sessionsCompleted * settings.workDuration) % 60}m
                      </div>
                      <div className="text-white/80 font-medium">Focus Time</div>
                    </div>

                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400 mb-1">
                          {Math.round((sessionsCompleted / (sessionsCompleted + 1)) * 100) || 0}%
                        </div>
                        <div className="text-white/80 text-sm">Completion Rate</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Settings Card */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, x: 30, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ opacity: 0, x: 30, height: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
                      <h3 className="font-bold text-white mb-6 text-xl">Timer Settings</h3>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-white/90 mb-3">
                            Work Duration: {settings.workDuration} min
                          </label>
                          <Slider
                            value={[settings.workDuration]}
                            onValueChange={(value) => {
                              const newSettings = { ...settings, workDuration: value[0] };
                              setSettings(newSettings);
                              if (currentState === 'work' && !isRunning) {
                                setTimeLeft(value[0] * 60);
                              }
                            }}
                            max={60}
                            min={5}
                            step={5}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white/90 mb-3">
                            Short Break: {settings.shortBreakDuration} min
                          </label>
                          <Slider
                            value={[settings.shortBreakDuration]}
                            onValueChange={(value) => setSettings({ ...settings, shortBreakDuration: value[0] })}
                            max={30}
                            min={1}
                            step={1}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white/90 mb-3">
                            Long Break: {settings.longBreakDuration} min
                          </label>
                          <Slider
                            value={[settings.longBreakDuration]}
                            onValueChange={(value) => setSettings({ ...settings, longBreakDuration: value[0] })}
                            max={60}
                            min={5}
                            step={5}
                            className="w-full"
                          />
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-white/20">
                          <div className="flex items-center gap-3">
                            {settings.soundEnabled ? (
                              <Volume2 size={20} className="text-white/90" />
                            ) : (
                              <VolumeX size={20} className="text-white/90" />
                            )}
                            <span className="text-sm font-medium text-white/90">Voice Notifications</span>
                          </div>
                          <Switch
                            checked={settings.soundEnabled}
                            onCheckedChange={(checked) => setSettings({ ...settings, soundEnabled: checked })}
                          />
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Video Info */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
              >
                <Card className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
                  <div className="text-center">
                    <div className="text-white/90 text-sm font-medium mb-2">
                      Scene {currentVideoIndex + 1} of {backgroundVideos.length}
                    </div>
                    <div className="flex justify-center gap-1">
                      {backgroundVideos.map((_, index) => (
                        <motion.div
                          key={index}
                          className={`w-2 h-2 rounded-full ${
                            index === currentVideoIndex ? 'bg-white' : 'bg-white/30'
                          }`}
                          animate={{ scale: index === currentVideoIndex ? 1.2 : 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
