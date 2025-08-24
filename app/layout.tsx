import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk, DM_Sans } from "next/font/google"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
})

const frame = {
  version: "1",
  imageUrl: "https://based-hot-springs-8cqsqoqab-vmf-coin.vercel.app/Mono_Hot_Springs_Background.jpg",
  button: {
    title: "Explore Hot Springs",
    action: {
      type: "launch_frame",
      name: "Based Springs",
      url: "https://based-hot-springs-8cqsqoqab-vmf-coin.vercel.app",
      splashImageUrl: "https://based-hot-springs-8cqsqoqab-vmf-coin.vercel.app/placeholder-logo.png",
      splashBackgroundColor: "#D1E8D1"
    }
  }
}

export const metadata: Metadata = {
  title: "Based Springs - Complete US Hot Springs Database",
  description:
    "Discover the healing waters across the United States. Your comprehensive guide to hot springs with GPS coordinates, detailed descriptions, and everything you need for your next adventure.",
  generator: "v0.app",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
  themeColor: "#D1E8D1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Based Springs",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Based Springs - Complete US Hot Springs Database",
    description: "Discover the healing waters across the United States. Your comprehensive guide to hot springs with GPS coordinates, detailed descriptions, and everything you need for your next adventure.",
    images: ["https://based-hot-springs-8cqsqoqab-vmf-coin.vercel.app/Mono_Hot_Springs_Background.jpg"],
    type: "website",
  },
  other: {
    "fc:miniapp": JSON.stringify(frame)
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${dmSans.variable} antialiased`}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Based Springs" />
        <meta name="msapplication-TileColor" content="#D1E8D1" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className="font-sans touch-manipulation">{children}</body>
    </html>
  )
}
