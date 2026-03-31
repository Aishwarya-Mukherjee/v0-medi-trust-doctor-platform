'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Home() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setIsAuthenticated(true)
        // Redirect to appropriate dashboard
        const role = user.user_metadata?.role || 'patient'
        if (role === 'doctor') {
          router.push('/dashboard/doctor')
        } else {
          router.push('/dashboard')
        }
      } else {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-16">
          <h1 className="text-3xl font-bold text-white">MediTrust</h1>
          <div className="space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push('/auth/login')}
              className="text-white border-white hover:bg-white hover:text-blue-600"
            >
              Login
            </Button>
            <Button
              onClick={() => router.push('/auth/sign-up')}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Sign Up
            </Button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Healthcare at Your Fingertips
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-8">
            Connect with doctors instantly, get AI-powered health insights, and manage your medical records securely all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => router.push('/auth/sign-up')}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg"
            >
              Get Started as Patient
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push('/auth/sign-up')}
              className="text-white border-white hover:bg-white hover:text-blue-600 px-8 py-6 text-lg"
            >
              Join as Doctor
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-8 text-white">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold mb-3">AI Assistant</h3>
            <p className="text-blue-100">
              Get instant health insights powered by advanced AI. Describe your symptoms and receive immediate guidance.
            </p>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-8 text-white">
            <div className="text-4xl mb-4">👨‍⚕️</div>
            <h3 className="text-xl font-bold mb-3">Expert Doctors</h3>
            <p className="text-blue-100">
              Connect with verified doctors in various specializations for text and video consultations.
            </p>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-8 text-white">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-bold mb-3">Secure Records</h3>
            <p className="text-blue-100">
              Keep all your medical documents organized and secure. Share them with doctors when needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
