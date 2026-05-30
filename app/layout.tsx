import type { Metadata } from 'next'
import { Spectral, Manrope } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { Providers } from '@/components/shared/Providers'
import './globals.css'

const spectral = Spectral({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-spectral',
})

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-manrope',
})

export const metadata: Metadata = {
  title: 'Toyla — той-көмекші',
  description: 'Красивые пригласительные, список гостей и напоминания — собрано в одном месте.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: { url: '/apple-touch-icon-180.png', sizes: '180x180' },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${spectral.variable} ${manrope.variable}`}>
      <head>
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#261B11" />
      </head>
      <body className="font-sans antialiased min-h-screen" style={{ background: 'var(--bone)', fontFamily: 'var(--font-manrope), system-ui, sans-serif' }}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '12px',
                fontSize: '14px',
                fontFamily: 'var(--font-manrope), sans-serif',
                background: '#FBF6EE',
                color: '#261B11',
                border: '1px solid #E4D8C4',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
