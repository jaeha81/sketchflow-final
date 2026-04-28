import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SketchFlow',
    short_name: 'SketchFlow',
    description: '러프 인테리어 스케치를 시공 워크플로우 데이터로 변환',
    lang: 'ko',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0f172a',
    theme_color: '#0f172a',
    categories: ['productivity', 'business', 'utilities'],
    icons: [
      { src: '/icon', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon1', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icon1', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png', purpose: 'any' },
    ],
  }
}
