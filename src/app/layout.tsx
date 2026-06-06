import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FitEthio — Ethiopian Wellness Platform',
  description: 'Personalized nutrition, fitness, skincare, and mental wellness for Ethiopians',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
