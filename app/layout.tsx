import type React from "react"
import { Inter } from "next/font/google"
import { Providers } from "@/components/providers"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Contacts App",
  description: "Modern contact management application",
  manifest: "/manifest.json",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F9F7F7" },
    { media: "(prefers-color-scheme: dark)", color: "#35374B" },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Contacts App",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}



import './globals.css'