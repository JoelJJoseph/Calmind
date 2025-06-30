import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl!, supabaseAnonKey!) : null

// Database initialization
export async function initializeDatabase() {
  if (!supabase || !isSupabaseConfigured) {
    console.warn("Supabase not configured, skipping database initialization")
    return false
  }

  try {
    // Test the connection
    const { data, error } = await supabase.from("profiles").select("count").limit(1)

    if (error) {
      console.error("Database connection test failed:", error)
      return false
    }

    console.log("Database connection successful")
    return true
  } catch (error) {
    console.error("Error initializing database:", error)
    return false
  }
}

// Test Supabase connection
export async function testSupabaseConnection(): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) {
    console.warn("Supabase not configured")
    return false
  }

  try {
    const { error } = await supabase.from("profiles").select("count").limit(1)

    if (error) {
      console.error("Supabase connection test failed:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error testing Supabase connection:", error)
    return false
  }
}

// Auth helpers
export async function signUp(email: string, password: string) {
  if (!supabase) throw new Error("Supabase not configured")

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function signIn(email: string, password: string) {
  if (!supabase) throw new Error("Supabase not configured")

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function signOut() {
  if (!supabase) throw new Error("Supabase not configured")

  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  if (!supabase) return null

  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getCurrentSession() {
  if (!supabase) return null

  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

// Profile helpers
export async function createProfile(userId: string, profileData: any) {
  if (!supabase) throw new Error("Supabase not configured")

  const { data, error } = await supabase
    .from("profiles")
    .insert([
      {
        id: userId,
        ...profileData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getProfile(userId: string) {
  if (!supabase) return null

  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error fetching profile:", error)
    return null
  }

  return data
}

export async function updateProfile(userId: string, updates: any) {
  if (!supabase) throw new Error("Supabase not configured")

  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Task helpers
export async function createTask(userId: string, taskData: any) {
  if (!supabase) throw new Error("Supabase not configured")

  const { data, error } = await supabase
    .from("tasks")
    .insert([
      {
        user_id: userId,
        ...taskData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getTasks(userId: string) {
  if (!supabase) return []

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching tasks:", error)
    return []
  }

  return data || []
}

export async function updateTask(taskId: string, updates: any) {
  if (!supabase) throw new Error("Supabase not configured")

  const { data, error } = await supabase
    .from("tasks")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteTask(taskId: string) {
  if (!supabase) throw new Error("Supabase not configured")

  const { error } = await supabase.from("tasks").delete().eq("id", taskId)

  if (error) throw error
  return true
}
