import type { Metadata } from 'next'
import Providers from '@/components/layout/Providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'VoxSPM — La voix de l\'archipel',
  description: 'Sondages citoyens pour Saint-Pierre-et-Miquelon',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* 🎨 Intent: Google Fonts via <link> — @import CSS incompatible avec Tailwind v4 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
