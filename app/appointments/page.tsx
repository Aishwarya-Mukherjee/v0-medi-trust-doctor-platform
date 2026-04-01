'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { Spinner } from '@/components/ui/spinner'
import { Navbar } from '@/components/navbar'

interface TimeSlot {
  date: string
  time: string
  available: boolean
}

interface Doctor {
  id: string
  first_name: string
  last_name: string
  specialization: string
}

interface Appointment {
  id: string
  doctor_id: string
  appointment_date: string
  appointment_time: string
  status: string
  doctor: Doctor
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isBooking, setIsBooking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      try {
        // Load user's appointments
        const { data: appts, error: apptError } = await supabase
          .from('appointments')
          .select('*, doctor:profiles(id, first_name, last_name, specialization)')
          .eq('patient_id', user.id)
          .order('appointment_date', { ascending: true })

        if (apptError) throw apptError
        setAppointments(appts || [])

        // Load available doctors
        const { data: docs, error: docError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, specialization')
          .eq('role', 'doctor')

        if (docError) throw docError
        setAvailableDoctors(docs || [])
      } catch (err) {
        setError('Failed to load appointments')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthAndLoadData()
  }, [supabase, router])

  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 9; hour < 17; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
      slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
    return slots
  }

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      setError('Please select all fields')
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    setIsBooking(true)
    setError(null)

    try {
      const { data, error: bookError } = await supabase
        .from('appointments')
        .insert({
          patient_id: user.id,
          doctor_id: selectedDoctor,
          appointment_date: selectedDate,
          appointment_time: selectedTime,
          status: 'confirmed',
        })
        .select('*, doctor:profiles(id, first_name, last_name, specialization)')
        .single()

      if (bookError) throw bookError

      setAppointments((prev) => [data, ...prev])
      setSelectedDoctor(null)
      setSelectedDate('')
      setSelectedTime('')
    } catch (err) {
      setError('Failed to book appointment')
      console.error(err)
    } finally {
      setIsBooking(false)
    }
  }

  if (isLoading) {
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
        <div className="mx-auto max-w-6xl px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">Appointments</h1>
          <p className="text-muted-foreground mb-8">
            Book and manage your doctor appointments
          </p>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Booking Form */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Book Appointment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Select Doctor</label>
                  <select
                    value={selectedDoctor || ''}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Choose a doctor...</option>
                    {availableDoctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        Dr. {doc.first_name} {doc.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Select Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Select Time</label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Choose a time...</option>
                    {generateTimeSlots().map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button
                  onClick={handleBookAppointment}
                  disabled={isBooking}
                  className="w-full"
                >
                  {isBooking ? (
                    <>
                      <Spinner className="h-4 w-4 mr-2" />
                      Booking...
                    </>
                  ) : (
                    'Book Appointment'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Appointments List */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Your Appointments</h2>
            {appointments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-lg font-semibold">No appointments yet</p>
                  <p className="text-sm text-muted-foreground">
                    Book your first appointment using the form on the left
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {appointments.map((appt) => (
                  <Card key={appt.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>
                            Dr. {appt.doctor.first_name} {appt.doctor.last_name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {appt.doctor.specialization}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            appt.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {appt.status}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm">
                            📅{' '}
                            {new Date(appt.appointment_date).toLocaleDateString()}
                          </p>
                          <p className="text-sm">🕐 {appt.appointment_time}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Reschedule
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
