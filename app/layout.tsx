import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk, DM_Sans } from "next/font/google"
import "./globals.css"
import { FarcasterWalletProvider } from "@/components/FarcasterWalletProvider"
import { Toaster } from "sonner"

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
  imageUrl: "https://u.cubeupload.com/vmfcoin/BasedSpringsLogo.png",
  button: {
    title: "Explore Hot Springs",
    action: {
      type: "launch_frame",
      name: "Based Springs",
      url: "https://based-hot-springs.vercel.app",
      splashImageUrl: "https://u.cubeupload.com/vmfcoin/BasedSpringsLogo.png",
      splashBackgroundColor: "#D1E8D1"
    }
  }
}

export const metadata: Metadata = {
  title: "Based Springs - Complete US Hot Springs Database",
  description:
    "Discover the healing waters across the United States. Your comprehensive guide to hot springs with GPS coordinates, detailed descriptions, and everything you need for your next adventure.",
  generator: "v0.app",
  openGraph: {
    title: "Based Springs - Complete US Hot Springs Database",
    description: "Discover the healing waters across the United States. Your comprehensive guide to hot springs with GPS coordinates, detailed descriptions, and everything you need for your next adventure.",
    images: ["https://u.cubeupload.com/vmfcoin/7ccBasedSpringsNameLogo.png"],
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
      <body className="font-sans">
        <FarcasterWalletProvider>
          {children}
          <Toaster />
        </FarcasterWalletProvider>
      </body>
    </html>
  )
}
