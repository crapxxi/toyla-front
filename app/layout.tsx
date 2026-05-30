import type { Metadata, Viewport } from 'next'
import { Spectral, Manrope } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { Providers } from '@/components/shared/Providers'
import './globals.css'

const SITE_URL = 'https://toyla.app'

const spectral = Spectral({
  subsets: ['latin', 'cyrillic', 'cyrillic-ext'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-spectral',
})

const manrope = Manrope({
  subsets: ['latin', 'cyrillic', 'cyrillic-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-manrope',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Toyla — тойға сайт және электронды шақыру | приглашения на той онлайн',
    template: '%s · Toyla',
  },
  description:
    'Toyla — тойға арналған әдемі электронды шақыру, қонақтар тізімі мен еске салулар бір жерде. Той жасау, тойға сайт, ашық хат — бірнеше минутта. Создайте красивое сайт-приглашение (пригласительные) на той, свадьбу и любое мероприятие.',
  keywords: [
    'тойла', 'toyla', 'toila', 'той', 'toi', 'тойга', 'тойға',
    'тойга сайт', 'тойға сайт', 'той жасау', 'тойга жасау', 'тойға жасау',
    'пригласительные', 'пригласительные для сайта', 'пригласительные на той',
    'открытки', 'красивые открытки', 'электронная открытка', 'электронды шақыру', 'шақыру',
    'сайты', 'сайт на той', 'адемы', 'әдемі', 'мероприятие', 'жасау',
    'свадьба', 'қыз ұзату', 'беташар', 'тұсаукесер', 'сүндет той', 'мерейтой', 'юбилей',
  ],
  applicationName: 'Toyla',
  authors: [{ name: 'Toyla', url: SITE_URL }],
  creator: 'Toyla',
  publisher: 'Toyla',
  category: 'events',
  alternates: {
    canonical: SITE_URL,
    languages: {
      'kk-KZ': SITE_URL,
      'ru-RU': SITE_URL,
      'x-default': SITE_URL,
    },
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'Toyla',
    locale: 'kk_KZ',
    alternateLocale: ['ru_RU'],
    title: 'Toyla — тойға сайт және электронды шақыру',
    description:
      'Әдемі электронды шақыру, қонақтар тізімі және еске салулар. Той жасау — бір жерде, бірнеше минутта. Сайт-приглашение на той и любое мероприятие.',
    images: [{ url: '/og.svg', width: 1200, height: 630, alt: 'Toyla — тойға сайт' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Toyla — тойға сайт және электронды шақыру',
    description: 'Әдемі электронды шақыру, қонақтар тізімі және еске салулар бір жерде.',
    images: ['/og.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: { url: '/apple-touch-icon-180.png', sizes: '180x180' },
  },
}

export const viewport: Viewport = {
  themeColor: '#A8492A',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Toyla',
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
      description:
        'Toyla — той-көмекші: электронды шақыру, қонақтар тізімі және еске салулар.',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+7-707-390-71-31',
        contactType: 'customer support',
        availableLanguage: ['kk', 'ru'],
      },
      sameAs: ['https://wa.me/77073907131'],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Toyla',
      inLanguage: ['kk', 'ru'],
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Toyla',
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Web',
      url: SITE_URL,
      description:
        'Тойға сайт, электронды шақыру, қонақтарды тіркеу және еске салулар. Сайт-приглашение на той и мероприятия.',
      offers: [
        { '@type': 'Offer', name: 'Тегін', price: '0', priceCurrency: 'KZT' },
        { '@type': 'Offer', name: 'Дара', price: '6990', priceCurrency: 'KZT' },
        { '@type': 'Offer', name: 'Той', price: '9990', priceCurrency: 'KZT' },
      ],
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="kk" className={`${spectral.variable} ${manrope.variable}`}>
      <head>
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#261B11" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
