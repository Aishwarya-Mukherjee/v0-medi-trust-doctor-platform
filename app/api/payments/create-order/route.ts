import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { orderId, amount, consultationType } = await request.json()

  if (!orderId || !amount) {
    return new Response('Missing required fields', { status: 400 })
  }

  try {
    // Create payment record
    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        order_id: orderId,
        amount: amount,
        status: 'pending',
        consultation_type: consultationType || 'text',
      })
      .select()
      .single()

    if (error) throw error

    // Return mock payment order (simulating Razorpay response)
    return Response.json({
      success: true,
      orderId: orderId,
      razorpayOrderId: `order_${Date.now()}`,
      amount: amount,
      currency: 'INR',
      receipt: `receipt_${orderId}`,
    })
  } catch (error) {
    console.error('Error creating payment order:', error)
    return new Response('Failed to create payment order', { status: 500 })
  }
}
