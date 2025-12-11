import { Suspense } from 'react'
import CheckoutClient from './CheckoutClient'

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            flexDirection: 'column',
            gap: '20px',
            fontFamily: 'sans-serif',
          }}
        >
          <h1>Processing checkout...</h1>
          <p>Please wait a moment.</p>
        </div>
      }
    >
      <CheckoutClient />
    </Suspense>
  )
}
