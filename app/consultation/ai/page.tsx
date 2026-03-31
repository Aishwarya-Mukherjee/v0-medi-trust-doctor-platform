'use client'

import { useChat } from '@ai-sdk/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Spinner } from '@/components/ui/spinner'
import { Navbar } from '@/components/navbar'

export default function AIConsultationPage() {
  const router = useRouter()
  const [isAuthed, setIsAuthed] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: '/api/ai-consultation',
      onError: (error) => {
        console.error('Chat error:', error)
      },
    })

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
      } else {
        setIsAuthed(true)
      }
    }
    checkAuth()
  }, [router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!isAuthed) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen flex-col">
        <div className="border-b bg-background">
        <div className="mx-auto max-w-2xl px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold">AI Medical Assistant</h1>
          <p className="text-sm text-muted-foreground">
            Describe your symptoms and I&apos;ll provide guidance
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-muted/30">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-lg font-semibold">Welcome to AI Consultation</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Start by describing your symptoms or health concerns. I&apos;m here to provide
                    health information and guidance.
                  </p>
                  <p className="mt-4 text-xs text-muted-foreground italic">
                    ⚠️ This is not a substitute for professional medical advice. Always consult
                    with a licensed healthcare provider for proper diagnosis and treatment.
                  </p>
                </CardContent>
              </Card>
            ) : (
              messages.map((message, i) => (
                <div
                  key={i}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 max-w-xs lg:max-w-md ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-muted px-4 py-2">
                  <Spinner className="h-5 w-5" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <div className="border-t bg-background">
        <div className="mx-auto max-w-2xl px-4 py-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Describe your symptoms or ask a health question..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? <Spinner className="h-4 w-4" /> : 'Send'}
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}
