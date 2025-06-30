import { supabase, isSupabaseConfigured } from "./supabase"

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  description?: string
  completed: boolean
  priority: "low" | "medium" | "high"
  due_date?: string
  created_at: string
  updated_at: string
}

export interface PomodoroSession {
  id: string
  user_id: string
  duration: number
  completed: boolean
  session_type: "work" | "short_break" | "long_break"
  created_at: string
}

class DataService {
  // Helper function to safely access localStorage
  private getLocalStorage() {
    if (typeof window === "undefined") {
      return {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      }
    }
    return localStorage
  }

  // User Profile Methods
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!supabase || !isSupabaseConfigured) {
      console.warn("Supabase not configured")
      return this.getLocalUserProfile(userId)
    }

    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        console.error("Error fetching user profile:", error)
        return this.getLocalUserProfile(userId)
      }

      return data
    } catch (error) {
      console.error("Error in getUserProfile:", error)
      return this.getLocalUserProfile(userId)
    }
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
    if (!supabase || !isSupabaseConfigured) {
      console.warn("Supabase not configured")
      return this.updateLocalUserProfile(userId, updates)
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", userId)

      if (error) {
        console.error("Error updating user profile:", error)
        return this.updateLocalUserProfile(userId, updates)
      }

      return true
    } catch (error) {
      console.error("Error in updateUserProfile:", error)
      return this.updateLocalUserProfile(userId, updates)
    }
  }

  // Task Methods
  async getTasks(userId: string): Promise<Task[]> {
    if (!supabase || !isSupabaseConfigured) {
      console.warn("Supabase not configured")
      return this.getLocalTasks(userId)
    }

    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching tasks:", error)
        return this.getLocalTasks(userId)
      }

      return data || []
    } catch (error) {
      console.error("Error in getTasks:", error)
      return this.getLocalTasks(userId)
    }
  }

  async createTask(task: Omit<Task, "id" | "created_at" | "updated_at">): Promise<Task | null> {
    if (!supabase || !isSupabaseConfigured) {
      console.warn("Supabase not configured")
      return this.createLocalTask(task)
    }

    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          ...task,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating task:", error)
        return this.createLocalTask(task)
      }

      return data
    } catch (error) {
      console.error("Error in createTask:", error)
      return this.createLocalTask(task)
    }
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<boolean> {
    if (!supabase || !isSupabaseConfigured) {
      console.warn("Supabase not configured")
      return this.updateLocalTask(taskId, updates)
    }

    try {
      const { error } = await supabase
        .from("tasks")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", taskId)

      if (error) {
        console.error("Error updating task:", error)
        return this.updateLocalTask(taskId, updates)
      }

      return true
    } catch (error) {
      console.error("Error in updateTask:", error)
      return this.updateLocalTask(taskId, updates)
    }
  }

  async deleteTask(taskId: string): Promise<boolean> {
    if (!supabase || !isSupabaseConfigured) {
      console.warn("Supabase not configured")
      return this.deleteLocalTask(taskId)
    }

    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId)

      if (error) {
        console.error("Error deleting task:", error)
        return this.deleteLocalTask(taskId)
      }

      return true
    } catch (error) {
      console.error("Error in deleteTask:", error)
      return this.deleteLocalTask(taskId)
    }
  }

  // Pomodoro Session Methods
  async createPomodoroSession(session: Omit<PomodoroSession, "id" | "created_at">): Promise<PomodoroSession | null> {
    if (!supabase || !isSupabaseConfigured) {
      console.warn("Supabase not configured")
      return this.createLocalPomodoroSession(session)
    }

    try {
      const { data, error } = await supabase
        .from("pomodoro_sessions")
        .insert({
          ...session,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating pomodoro session:", error)
        return this.createLocalPomodoroSession(session)
      }

      return data
    } catch (error) {
      console.error("Error in createPomodoroSession:", error)
      return this.createLocalPomodoroSession(session)
    }
  }

  async getPomodoroSessions(userId: string, limit = 50): Promise<PomodoroSession[]> {
    if (!supabase || !isSupabaseConfigured) {
      console.warn("Supabase not configured")
      return this.getLocalPomodoroSessions(userId, limit)
    }

    try {
      const { data, error } = await supabase
        .from("pomodoro_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("Error fetching pomodoro sessions:", error)
        return this.getLocalPomodoroSessions(userId, limit)
      }

      return data || []
    } catch (error) {
      console.error("Error in getPomodoroSessions:", error)
      return this.getLocalPomodoroSessions(userId, limit)
    }
  }

  async getPomodoroStats(userId: string): Promise<{
    totalSessions: number
    completedSessions: number
    totalFocusTime: number
    averageSessionLength: number
  }> {
    const sessions = await this.getPomodoroSessions(userId)
    const completedSessions = sessions.filter((s) => s.completed)
    const workSessions = sessions.filter((s) => s.session_type === "work")
    const totalFocusTime = workSessions.reduce((sum, s) => sum + (s.completed ? s.duration : 0), 0)

    return {
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      totalFocusTime,
      averageSessionLength:
        completedSessions.length > 0
          ? Math.round(completedSessions.reduce((sum, s) => sum + s.duration, 0) / completedSessions.length)
          : 0,
    }
  }

  // Local storage fallback methods
  private getLocalUserProfile(userId: string): UserProfile | null {
    const storage = this.getLocalStorage()
    const profile = storage.getItem(`calmind_profile_${userId}`)
    return profile ? JSON.parse(profile) : null
  }

  private updateLocalUserProfile(userId: string, updates: Partial<UserProfile>): boolean {
    const storage = this.getLocalStorage()
    try {
      const existing = this.getLocalUserProfile(userId) || {
        id: userId,
        email: "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      const updated = { ...existing, ...updates, updated_at: new Date().toISOString() }
      storage.setItem(`calmind_profile_${userId}`, JSON.stringify(updated))
      return true
    } catch (error) {
      console.error("Error updating local profile:", error)
      return false
    }
  }

  private getLocalTasks(userId: string): Task[] {
    const storage = this.getLocalStorage()
    const tasks = storage.getItem(`calmind_tasks_${userId}`)
    return tasks ? JSON.parse(tasks) : []
  }

  private createLocalTask(task: Omit<Task, "id" | "created_at" | "updated_at">): Task {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const storage = this.getLocalStorage()
    const tasks = this.getLocalTasks(task.user_id)
    tasks.unshift(newTask)
    storage.setItem(`calmind_tasks_${task.user_id}`, JSON.stringify(tasks))
    return newTask
  }

  private updateLocalTask(taskId: string, updates: Partial<Task>): boolean {
    if (!updates.user_id) return false
    const storage = this.getLocalStorage()
    const tasks = this.getLocalTasks(updates.user_id)
    const index = tasks.findIndex((t) => t.id === taskId)
    if (index === -1) return false

    tasks[index] = { ...tasks[index], ...updates, updated_at: new Date().toISOString() }
    storage.setItem(`calmind_tasks_${updates.user_id}`, JSON.stringify(tasks))
    return true
  }

  private deleteLocalTask(taskId: string): boolean {
    const storage = this.getLocalStorage()
    // We need to find the task first to get the user_id
    const allTasks = this.getAllLocalTasks()
    const task = allTasks.find((t) => t.id === taskId)
    if (!task) return false

    const tasks = this.getLocalTasks(task.user_id)
    const filteredTasks = tasks.filter((t) => t.id !== taskId)
    storage.setItem(`calmind_tasks_${task.user_id}`, JSON.stringify(filteredTasks))
    return true
  }

  private getAllLocalTasks(): Task[] {
    const storage = this.getLocalStorage()
    const allTasks: Task[] = []

    if (typeof window === "undefined") return allTasks

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("calmind_tasks_")) {
        const tasks = JSON.parse(localStorage.getItem(key) || "[]")
        allTasks.push(...tasks)
      }
    }
    return allTasks
  }

  private getLocalPomodoroSessions(userId: string, limit: number): PomodoroSession[] {
    const storage = this.getLocalStorage()
    const sessions = storage.getItem(`calmind_pomodoro_${userId}`)
    const allSessions = sessions ? JSON.parse(sessions) : []
    return allSessions.slice(0, limit)
  }

  private createLocalPomodoroSession(session: Omit<PomodoroSession, "id" | "created_at">): PomodoroSession {
    const newSession: PomodoroSession = {
      ...session,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    }

    const storage = this.getLocalStorage()
    const sessions = this.getLocalPomodoroSessions(session.user_id, 1000)
    sessions.unshift(newSession)
    storage.setItem(`calmind_pomodoro_${session.user_id}`, JSON.stringify(sessions))
    return newSession
  }
}

// Export singleton instance
export const dataService = new DataService()
export default dataService
