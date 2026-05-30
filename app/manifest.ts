import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Toyla — тойға сайт және электронды шақыру',
    short_name: 'Toyla',
    description:
      'Тойға арналған әдемі электронды шақыру, қонақтар тізімі мен еске салулар бір жерде.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F4ECDF',
    theme_color: '#A8492A',
    lang: 'kk',
    categories: ['lifestyle', 'events', 'social'],
    icons: [
      { src: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { src: '/apple-touch-icon-180.png', sizes: '180x180', type: 'image/png' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
  }
}
