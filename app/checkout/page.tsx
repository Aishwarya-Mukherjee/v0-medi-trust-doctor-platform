import { Suspense } from 'react'
import CheckoutPage from './CheckoutPage'
import { Spinner } from '@/components/ui/spinner'

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      }
    >
      <CheckoutPage />
    </Suspense>
  )
}
