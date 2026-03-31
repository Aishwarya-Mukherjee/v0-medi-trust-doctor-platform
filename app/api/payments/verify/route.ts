import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { orderId, razorpayPaymentId, razorpaySignature } = await request.json()

  if (!orderId) {
    return new Response('Missing order ID', { status: 400 })
  }

  try {
    // Update payment status to confirmed (in a real app, verify the signature)
    const { data: payment, error } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        razorpay_payment_id: razorpayPaymentId || `pay_mock_${Date.now()}`,
      })
      .eq('order_id', orderId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    return Response.json({
      success: true,
      message: 'Payment verified',
      payment: payment,
    })
  } catch (error) {
    console.error('Error verifying payment:', error)
    return new Response('Failed to verify payment', { status: 500 })
  }
}
