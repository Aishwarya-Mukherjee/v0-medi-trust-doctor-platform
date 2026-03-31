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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600">
      {/* Navigation */}
      <nav className="flex items-center justify-between max-w-7xl mx-auto px-6 py-6">
        <h1 className="text-3xl font-bold text-white">MediTrust</h1>
        <div className="flex gap-4 items-center">
          <button
            onClick={() => router.push('/auth/login')}
            className="px-6 py-2 text-white hover:bg-white hover:bg-opacity-20 rounded-md transition-all duration-200 font-medium"
          >
            Login
          </button>
          <button
            onClick={() => router.push('/auth/sign-up')}
            className="px-6 py-2 bg-white text-blue-600 rounded-md hover:bg-opacity-90 transition-all duration-200 font-medium"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Healthcare at Your Fingertips
          </h2>
          <p className="text-lg md:text-xl text-blue-100 mb-10 leading-relaxed">
            Connect with doctors instantly, get AI-powered health insights, and manage your medical records securely all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <button
              onClick={() => router.push('/auth/sign-up')}
              className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-50 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              Get Started as Patient
            </button>
            <button
              onClick={() => router.push('/auth/sign-up?role=doctor')}
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-200 font-semibold text-lg"
            >
              Join as Doctor
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
          {/* AI Assistant Card */}
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-8 text-white hover:bg-opacity-20 transition-all duration-300 cursor-pointer">
            <div className="text-5xl mb-4">🤖</div>
            <h3 className="text-xl font-bold mb-3">AI Medical Assistant</h3>
            <p className="text-blue-100 leading-relaxed">
              Get instant health insights powered by advanced AI. Describe your symptoms and receive immediate guidance based on evidence-based medical knowledge.
            </p>
          </div>

          {/* Expert Doctors Card */}
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-8 text-white hover:bg-opacity-20 transition-all duration-300 cursor-pointer">
            <div className="text-5xl mb-4">👨‍⚕️</div>
            <h3 className="text-xl font-bold mb-3">Verified Doctors</h3>
            <p className="text-blue-100 leading-relaxed">
              Connect with verified doctors across various specializations for real-time text consultations and expert medical advice.
            </p>
          </div>

          {/* Secure Records Card */}
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-8 text-white hover:bg-opacity-20 transition-all duration-300 cursor-pointer">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-xl font-bold mb-3">Secure Medical Records</h3>
            <p className="text-blue-100 leading-relaxed">
              Keep all your medical documents organized, secure, and accessible. Share them with doctors when needed with complete privacy control.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <p className="text-blue-100 text-lg mb-6">
            Ready to transform your healthcare experience?
          </p>
          <button
            onClick={() => router.push('/auth/sign-up')}
            className="px-10 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-50 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl inline-block"
          >
            Start Your Journey Now
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-24 bg-blue-900 bg-opacity-50 border-t border-white border-opacity-10 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-blue-100">
          <p>&copy; 2026 MediTrust. All rights reserved. Your health, our priority.</p>
        </div>
      </div>
    </div>
  )
}
