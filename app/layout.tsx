import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '保護者ポータル',
  description: '学生保護者向けアクセスポータル',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
