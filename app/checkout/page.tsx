'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const consultationType = searchParams.get('type') || 'ai'
  const amount = consultationType === 'ai' ? 299 : 499

  const handlePayment = async () => {
    setIsProcessing(true)
    setError(null)

    try {
      // Create order
      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: `order_${Date.now()}`,
          amount: amount * 100, // Convert to paise
          consultationType: consultationType,
        }),
      })

      if (!orderResponse.ok) {
        throw new Error('Failed to create payment order')
      }

      const orderData = await orderResponse.json()

      // Simulate payment verification
      const verifyResponse = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderData.orderId,
          razorpayPaymentId: `pay_${Date.now()}`,
          razorpaySignature: `sig_${Date.now()}`,
        }),
      })

      if (!verifyResponse.ok) {
        throw new Error('Failed to verify payment')
      }

      // Redirect to success page
      router.push(`/payment-success?orderId=${orderData.orderId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed')
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Confirm Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Consultation Type</p>
            <p className="text-lg font-semibold capitalize">
              {consultationType === 'ai'
                ? 'AI Medical Assistant'
                : 'Doctor Consultation'}
            </p>
          </div>

          <div className="space-y-2 border-t border-b py-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-semibold">₹{amount}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>GST (18%)</span>
              <span>₹{Math.round(amount * 0.18)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>₹{Math.round(amount * 1.18)}</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <p className="text-blue-900">
              This is a mock payment system for demonstration. In production, this
              would integrate with Razorpay.
            </p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Spinner className="h-4 w-4 mr-2" />
                Processing...
              </>
            ) : (
              'Complete Payment'
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={isProcessing}
            className="w-full"
          >
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
