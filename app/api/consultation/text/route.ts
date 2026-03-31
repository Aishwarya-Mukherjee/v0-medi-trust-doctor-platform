import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { doctorId, message } = await request.json()

  if (!doctorId || !message) {
    return new Response('Missing required fields', { status: 400 })
  }

  try {
    // Create or get consultation
    const { data: consultation, error: consultError } = await supabase
      .from('consultations')
      .select('id')
      .eq('patient_id', user.id)
      .eq('doctor_id', doctorId)
      .eq('type', 'text')
      .eq('status', 'active')
      .single()

    let consultationId = consultation?.id

    if (!consultationId) {
      const { data: newConsult, error: createError } = await supabase
        .from('consultations')
        .insert({
          patient_id: user.id,
          doctor_id: doctorId,
          type: 'text',
          status: 'active',
        })
        .select('id')
        .single()

      if (createError) throw createError
      consultationId = newConsult.id
    }

    // Insert message
    const { data: msg, error: msgError } = await supabase
      .from('messages')
      .insert({
        consultation_id: consultationId,
        sender_id: user.id,
        content: message,
      })
      .select()
      .single()

    if (msgError) throw msgError

    return Response.json(msg)
  } catch (error) {
    console.error('Error creating message:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
