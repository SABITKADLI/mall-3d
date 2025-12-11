import type { Metadata } from 'next'
import { ShopifyProvider } from '@/components/providers/ShopifyProvider'
import { StoreProvider } from '@/components/providers/StoreProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Shop Australia Virtual Mall',
  description: 'Walk through our 3D virtual shopping mall and discover amazing products',
  openGraph: {
    title: 'Shop Australia Virtual Mall',
    description: 'Interactive 3D shopping experience',
    url: 'https://mall.shopaustralia.online',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
        <ShopifyProvider>
          <StoreProvider>
            {children}
          </StoreProvider>
        </ShopifyProvider>
      </body>
    </html>
  )
}
