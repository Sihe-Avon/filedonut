import React from 'react'
import Footer from '../components/Footer'
import '../styles.css'
import { ThemeProvider } from '../components/ThemeProvider'
import { ModeToggle } from '../components/ModeToggle'
import FilePizzaQueryClientProvider from '../components/QueryClientProvider'
import { Viewport } from 'next'
import { ViewTransitions } from 'next-view-transitions'
import Head from 'next/head'
import { Analytics } from '@vercel/analytics/react'

export const metadata = {
  title: 'Free Secure P2P File Transfer – No Registration | FileDonut',
  description: 'FileDonut is a free, fast, and secure P2P file transfer tool. Instantly share files with end-to-end encryption, no registration, and direct browser-to-browser transfer.',
  charSet: 'utf-8',
  keywords: 'p2p file transfer, free file sharing, secure file transfer, no registration, end-to-end encryption, browser file transfer, instant file sharing, large file transfer, cross-platform, FileDonut, peer to peer, send files online, encrypted file sharing, direct file transfer, fast',
  openGraph: {
    url: 'https://your-domain.com',
    title: 'FileDonut • Your files, delivered.',
    description: 'Peer-to-peer file transfers in your web browser. Send files instantly and securely with FileDonut.',
    images: [{ url: 'https://your-domain.com/images/fb.png' }],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  return (
    <ViewTransitions>
      <html lang="en" suppressHydrationWarning>
        <Head>
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          <link rel="icon" href="/favicon.ico" sizes="any" />
        </Head>
        <body className="h-screen flex flex-col">
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <FilePizzaQueryClientProvider>
              <main className="flex-1 overflow-auto flex flex-col items-center justify-center">{children}</main>
              <Footer />
              <ModeToggle />
              <Analytics />
            </FilePizzaQueryClientProvider>
          </ThemeProvider>
        </body>
      </html>
    </ViewTransitions>
  )
}
