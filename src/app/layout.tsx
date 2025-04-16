import React from 'react'
import Footer from '../components/Footer'
import '../styles.css'
import { ThemeProvider } from '../components/ThemeProvider'
import { ModeToggle } from '../components/ModeToggle'
import FilePizzaQueryClientProvider from '../components/QueryClientProvider'
import { Viewport } from 'next'
import { ViewTransitions } from 'next-view-transitions'
import Head from 'next/head'

export const metadata = {
  title: 'FileDonut • Your files, delivered.',
  description: 'Peer-to-peer file transfers in your web browser. Send files instantly and securely with FileDonut.',
  charSet: 'utf-8',
  keywords: 'file transfer, donut, peer to peer, send files online, secure file sharing, instant file transfer, free file sharing',
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
        <body>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <FilePizzaQueryClientProvider>
              <main>{children}</main>
              <Footer />
              <ModeToggle />
            </FilePizzaQueryClientProvider>
          </ThemeProvider>
        </body>
      </html>
    </ViewTransitions>
  )
}
