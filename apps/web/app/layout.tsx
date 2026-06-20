import type { Metadata } from "next"
import { Plus_Jakarta_Sans, Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/providers/theme-provider"
import { QueryProvider } from "@/providers/QueryProvider"
import { Toaster } from "@/components/ui/toaster"

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
})

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Creonex — Learn from India's Best Creators",
  description: "Discover courses and book 1-on-1 mentorship sessions with verified experts across design, tech, marketing, and more.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>): React.ReactElement {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${geist.variable} ${geistMono.variable}`}
    >
      <body className="overflow-x-hidden antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
        >
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
