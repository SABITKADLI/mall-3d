// app/checkout/CheckoutClient.tsx
'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function CheckoutClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    setTimeout(() => {
      router.push('/')
    }, 2000)
  }, [searchParams, router])

  return (
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
      <h1>✓ Order Processing</h1>
      <p>Thank you for your purchase! Redirecting...</p>
    </div>
  )
}
