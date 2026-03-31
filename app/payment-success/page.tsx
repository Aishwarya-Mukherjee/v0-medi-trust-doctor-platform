'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('orderId')

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <CardTitle className="text-center">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Your payment has been processed successfully.
          </p>
          {orderId && (
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">Order ID</p>
              <p className="font-mono text-sm font-semibold">{orderId}</p>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            You can now proceed with your consultation.
          </p>
          <div className="space-y-2">
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Go to Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/consultation/ai')}
              className="w-full"
            >
              Start AI Consultation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
