'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { Spinner } from '@/components/ui/spinner'

interface Doctor {
  id: string
  first_name: string
  last_name: string
  specialization: string
  rating: number
  consultation_count: number
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuthAndLoadDoctors = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Check if user is a patient
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'patient') {
        router.push('/dashboard/doctor')
        return
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, specialization, rating')
          .eq('role', 'doctor')
          .gt('rating', 0)

        if (error) throw error

        const enrichedDoctors = (data || []).map((doc: any) => ({
          ...doc,
          consultation_count: Math.floor(Math.random() * 150) + 50, // Mock count
        }))

        setDoctors(enrichedDoctors)
      } catch (err) {
        setError('Failed to load doctors')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthAndLoadDoctors()
  }, [supabase, router])

  const handleConsult = async (doctorId: string) => {
    router.push(`/consultation/doctor/${doctorId}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Browse Doctors</h1>
        <p className="text-muted-foreground mb-8">
          Connect with qualified healthcare professionals for consultations
        </p>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        {doctors.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-lg font-semibold">No doctors available</p>
              <p className="text-sm text-muted-foreground">
                Please check back soon for available doctors
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doctor) => (
              <Card key={doctor.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Dr. {doctor.first_name} {doctor.last_name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground font-normal">
                    {doctor.specialization}
                  </p>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Rating</span>
                      <span className="font-semibold">
                        {doctor.rating.toFixed(1)} ⭐
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Consultations
                      </span>
                      <span className="font-semibold">
                        {doctor.consultation_count}+
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleConsult(doctor.id)}
                    className="w-full"
                  >
                    Start Consultation
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
