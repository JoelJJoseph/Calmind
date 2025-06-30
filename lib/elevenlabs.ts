// ElevenLabs Text-to-Speech Integration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY
const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1"

export const isElevenLabsConfigured = !!ELEVENLABS_API_KEY

export interface VoiceSettings {
  stability: number
  similarity_boost: number
  style?: number
  use_speaker_boost?: boolean
}

export interface Voice {
  voice_id: string
  name: string
  samples: any[]
  category: string
  fine_tuning: {
    language?: string
    is_allowed_to_fine_tune: boolean
    fine_tuning_requested: boolean
    finetuning_state: string
    verification_attempts: any[]
    verification_failures: any[]
    verification_attempts_count: number
    slice_ids: any[]
    manual_verification: any
    manual_verification_requested: boolean
  }
  labels: Record<string, string>
  description?: string
  preview_url?: string
  available_for_tiers: any[]
  settings?: VoiceSettings
  sharing?: any
  high_quality_base_model_ids: string[]
  safety_control?: string
  voice_verification?: {
    requires_verification: boolean
    is_verified: boolean
    verification_failures: any[]
    verification_attempts_count: number
    language?: string
    verification_attempts: any[]
  }
  permission_on_resource?: string
}

export async function getVoices(): Promise<Voice[]> {
  if (!isElevenLabsConfigured) {
    console.warn("ElevenLabs API key not configured")
    return []
  }

  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY!,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.voices || []
  } catch (error) {
    console.error("Error fetching voices:", error)
    return []
  }
}

export async function generateSpeech(
  text: string,
  voiceId = "pNInz6obpgDQGcFmaJgB", // Default voice
  settings: VoiceSettings = {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.0,
    use_speaker_boost: true,
  },
): Promise<ArrayBuffer | null> {
  if (!isElevenLabsConfigured) {
    console.warn("ElevenLabs API key not configured")
    return null
  }

  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY!,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: settings,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.arrayBuffer()
  } catch (error) {
    console.error("Error generating speech:", error)
    return null
  }
}

export async function speakText(text: string, voiceId?: string, settings?: VoiceSettings): Promise<void> {
  // Try ElevenLabs first if configured
  if (isElevenLabsConfigured) {
    try {
      const audioBuffer = await generateSpeech(text, voiceId, settings)
      if (audioBuffer) {
        const audioBlob = new Blob([audioBuffer], { type: "audio/mpeg" })
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)

        return new Promise((resolve, reject) => {
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl)
            resolve()
          }
          audio.onerror = () => {
            URL.revokeObjectURL(audioUrl)
            reject(new Error("Audio playback failed"))
          }
          audio.play().catch(reject)
        })
      }
    } catch (error) {
      console.error("ElevenLabs TTS failed, falling back to browser TTS:", error)
    }
  }

  // Fallback to browser's built-in speech synthesis
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.onend = () => resolve()
      utterance.onerror = () => resolve() // Still resolve to not break the flow
      window.speechSynthesis.speak(utterance)
    })
  }

  console.warn("No text-to-speech capability available")
}

export async function getVoiceById(voiceId: string): Promise<Voice | null> {
  const voices = await getVoices()
  return voices.find((voice) => voice.voice_id === voiceId) || null
}

export function getDefaultVoiceSettings(): VoiceSettings {
  return {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.0,
    use_speaker_boost: true,
  }
}
