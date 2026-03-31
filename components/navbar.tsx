'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from './ui/button'

export function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<'patient' | 'doctor' | null>(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setUserRole(user?.user_metadata?.role || 'patient')
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (!user) return null

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href={userRole === 'doctor' ? '/dashboard/doctor' : '/dashboard'} className="text-xl font-bold">
          MediTrust
        </Link>

        <div className="flex items-center gap-6">
          {userRole === 'patient' ? (
            <>
              <Link href="/dashboard" className="text-sm hover:text-primary">
                Dashboard
              </Link>
              <Link href="/consultation/ai" className="text-sm hover:text-primary">
                AI Assistant
              </Link>
              <Link href="/doctors" className="text-sm hover:text-primary">
                Doctors
              </Link>
              <Link href="/medical-records" className="text-sm hover:text-primary">
                Records
              </Link>
              <Link href="/appointments" className="text-sm hover:text-primary">
                Appointments
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard/doctor" className="text-sm hover:text-primary">
                Dashboard
              </Link>
              <Link href="/dashboard/doctor" className="text-sm hover:text-primary">
                Consultations
              </Link>
            </>
          )}
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </nav>
  )
}
