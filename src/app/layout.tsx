import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: 'SketchFlow — 인테리어 스케치 워크플로우',
  description: '러프 스케치를 시공 워크플로우 데이터로 변환',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ko"><body className="antialiased">{children}</body></html>
}
