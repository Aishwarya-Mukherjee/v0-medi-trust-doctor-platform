import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File
  const recordType = formData.get('recordType') as string
  const description = formData.get('description') as string

  if (!file || !recordType) {
    return new Response('Missing required fields', { status: 400 })
  }

  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('medical-records')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) throw uploadError

    // Create medical record entry
    const { data: record, error: recordError } = await supabase
      .from('medical_records')
      .insert({
        patient_id: user.id,
        record_type: recordType,
        file_path: fileName,
        file_name: file.name,
        description: description || null,
      })
      .select()
      .single()

    if (recordError) throw recordError

    return Response.json(record)
  } catch (error) {
    console.error('Error uploading file:', error)
    return new Response('Failed to upload file', { status: 500 })
  }
}
