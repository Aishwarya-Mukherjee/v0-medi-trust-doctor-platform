'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TextConsultation } from '@/components/text-consultation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Navbar } from '@/components/navbar'

interface Doctor {
  id: string
  first_name: string
  last_name: string
  specialization: string
}

interface Consultation {
  id: string
}

export default function DoctorConsultationPage() {
  const params = useParams()
  const router = useRouter()
  const doctorId = params.id as string
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [consultation, setConsultation] = useState<Consultation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const initConsultation = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      setCurrentUserId(user.id)

      try {
        // Get doctor info
        const { data: docData, error: docError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, specialization')
          .eq('id', doctorId)
          .eq('role', 'doctor')
          .single()

        if (docError) throw docError
        setDoctor(docData)

        // Get or create consultation
        const { data: existingConsult } = await supabase
          .from('consultations')
          .select('id')
          .eq('patient_id', user.id)
          .eq('doctor_id', doctorId)
          .eq('type', 'text')
          .eq('status', 'active')
          .single()

        if (existingConsult) {
          setConsultation(existingConsult)
        } else {
          const { data: newConsult, error: createError } = await supabase
            .from('consultations')
            .insert({
              patient_id: user.id,
              doctor_id: doctorId,
              type: 'text',
              status: 'active',
            })
            .select()
            .single()

          if (createError) throw createError
          setConsultation(newConsult)
        }
      } catch (error) {
        console.error('Error initializing consultation:', error)
        router.push('/doctors')
      } finally {
        setIsLoading(false)
      }
    }

    initConsultation()
  }, [doctorId, router, supabase])

  if (isLoading || !doctor || !consultation || !currentUserId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="flex flex-col lg:flex-row h-screen">
          {/* Sidebar with doctor info */}
          <div className="lg:w-80 border-r bg-card p-6">
            <Button
              variant="ghost"
              onClick={() => router.push('/doctors')}
              className="mb-6"
            >
              ← Back to Doctors
            </Button>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  Dr. {doctor.first_name} {doctor.last_name}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  {doctor.specialization}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-semibold">Available</p>
                  </div>
                  <Button className="w-full" variant="outline">
                    End Consultation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          <div className="border-b bg-card px-6 py-4">
            <h1 className="text-lg font-semibold">
              Chat with Dr. {doctor.last_name}
            </h1>
          </div>
          <TextConsultation
            doctorId={doctorId}
            consultationId={consultation.id}
            currentUserId={currentUserId}
          />
        </div>
      </div>
    </>
  )
}
