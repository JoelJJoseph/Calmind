'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const result = await supabase?.auth.getSession()

        // Handle case when supabase or result is undefined
        if (!result || !('data' in result) || !('error' in result)) {
          console.error('Invalid session result:', result)
          router.push('/?error=invalid_response')
          return
        }

        const { data, error } = result

        if (error) {
          console.error('Auth callback error:', error)
          router.push('/?error=auth_failed')
          return
        }

        if (data?.session) {
          router.push('/profile?success=signed_in')
        } else {
          router.push('/?error=no_session')
        }
      } catch (error) {
        console.error('Unexpected auth error:', error)
        router.push('/?error=unexpected')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Completing sign in...</h2>
        <p className="text-gray-600">Please wait while we redirect you.</p>
      </div>
    </div>
  )
}
