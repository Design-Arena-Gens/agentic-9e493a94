import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Gestion de Paie - Algérie',
  description: 'Application de gestion de paie conforme à la législation algérienne',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
