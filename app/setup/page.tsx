"use client"

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Volume2, 
  ExternalLink, 
  Copy,
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Setup() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen px-6 py-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center shadow-2xl">
            <Settings className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
            Setup Guide
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Configure Supabase and ElevenLabs to unlock the full potential of Calmind
          </p>
        </div>

        <div className="space-y-8">
          {/* Supabase Setup */}
          <Card className="p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
                  Supabase Configuration
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Set up authentication and data persistence
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                Optional
              </Badge>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Step 1: Create a Supabase Project
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>Visit <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">supabase.com</a> and create an account</li>
                  <li>Create a new project and wait for it to be ready</li>
                  <li>Go to Settings → API to find your project credentials</li>
                </ol>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Step 2: Add Environment Variables
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Create a <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">.env.local</code> file in your project root:
                </p>
                
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm relative">
                  <Button
                    onClick={() => copyToClipboard(`NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here`)}
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 text-gray-400 hover:text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <div>NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here</div>
                  <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here</div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-300">
                      Note about Authentication
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                      Calmind works perfectly without Supabase! All data is stored locally in your browser. 
                      Supabase is only needed if you want to sync data across devices or use Google OAuth.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* ElevenLabs Setup */}
          <Card className="p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <Volume2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
                  ElevenLabs Voice Integration
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Enable high-quality text-to-speech features
                </p>
              </div>
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                Optional
              </Badge>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Step 1: Get ElevenLabs API Key
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>Visit <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">elevenlabs.io</a> and create an account</li>
                  <li>Go to your profile settings and generate an API key</li>
                  <li>Copy the API key for the next step</li>
                </ol>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Step 2: Add to Environment Variables
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Add this line to your <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">.env.local</code> file:
                </p>
                
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm relative">
                  <Button
                    onClick={() => copyToClipboard('NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here')}
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 text-gray-400 hover:text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <div>NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here</div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-800 dark:text-green-300">
                      Fallback Available
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                      If ElevenLabs isn't configured, Calmind automatically uses your browser's built-in 
                      speech synthesis. You'll still get voice feedback, just with a different voice quality.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Complete Environment File */}
          <Card className="p-8 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-0 shadow-xl">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Complete .env.local File
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Here's what your complete environment file should look like:
            </p>
            
            <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm relative">
              <Button
                onClick={() => copyToClipboard(`# Supabase Configuration (Optional)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# ElevenLabs Configuration (Optional)
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here`)}
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2 text-gray-400 hover:text-white"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <div className="space-y-1">
                <div className="text-gray-500"># Supabase Configuration (Optional)</div>
                <div>NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here</div>
                <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here</div>
                <div className="mt-4 text-gray-500"># ElevenLabs Configuration (Optional)</div>
                <div>NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here</div>
              </div>
            </div>
          </Card>

          {/* Getting Started */}
          <Card className="p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-xl text-center">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Remember, both integrations are optional. Calmind works great out of the box with local storage and browser speech synthesis!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <a href="/quiz">
                  Take Learning Style Quiz
                </a>
              </Button>
              
              <Button
                asChild
                variant="outline"
              >
                <a href="/">
                  Back to Home
                </a>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
