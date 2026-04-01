'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { Spinner } from '@/components/ui/spinner'
import { Navbar } from '@/components/navbar'

interface MedicalRecord {
  id: string
  record_type: string
  file_name: string
  description: string | null
  created_at: string
  file_path: string
}

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recordType, setRecordType] = useState('prescription')
  const [description, setDescription] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuthAndLoadRecords = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      try {
        const { data, error } = await supabase
          .from('medical_records')
          .select('*')
          .eq('patient_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setRecords(data || [])
      } catch (err) {
        setError('Failed to load medical records')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthAndLoadRecords()
  }, [supabase, router])

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fileInputRef.current?.files?.[0]) {
      setError('Please select a file')
      return
    }

    const file = fileInputRef.current.files[0]
    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('recordType', recordType)
      formData.append('description', description)

      const response = await fetch('/api/medical-records/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload file')
      }

      const newRecord = await response.json()
      setRecords((prev) => [newRecord, ...prev])
      setDescription('')
      setRecordType('prescription')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      setError('Failed to upload file')
      console.error(err)
    } finally {
      setIsUploading(false)
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
          <h1 className="text-3xl font-bold mb-2">Medical Records</h1>
          <p className="text-muted-foreground mb-8">
            Manage and organize your medical documents
          </p>

          {/* Upload Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Upload Medical Record</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFileUpload} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="recordType">Record Type</Label>
                  <select
                    id="recordType"
                    value={recordType}
                    onChange={(e) => setRecordType(e.target.value)}
                    className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="prescription">Prescription</option>
                    <option value="lab_report">Lab Report</option>
                    <option value="x_ray">X-Ray</option>
                    <option value="scan">Scan/MRI</option>
                    <option value="vaccination">Vaccination Record</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="file">Select File</Label>
                  <Input
                    id="file"
                    type="file"
                    ref={fileInputRef}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    disabled={isUploading}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Add notes about this record..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isUploading}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" disabled={isUploading} className="w-full">
                {isUploading ? (
                  <>
                    <Spinner className="h-4 w-4 mr-2" />
                    Uploading...
                  </>
                ) : (
                  'Upload Record'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Records List */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Records</h2>
          {records.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-lg font-semibold">No records yet</p>
                <p className="text-sm text-muted-foreground">
                  Upload your first medical record above
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {records.map((record) => (
                <Card key={record.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base capitalize">
                          {record.record_type.replace(/_/g, ' ')}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {record.file_name}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(record.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {record.description && (
                      <p className="text-sm mb-4">{record.description}</p>
                    )}
                    <Button variant="outline" size="sm" className="w-full">
                      View Document
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
