import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { DataStoreProvider } from "@/lib/data-store"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "URFU Intern - Платформа стажировок УрФУ",
  description: "Найдите идеальную стажировку в Уральском федеральном университете",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <AuthProvider>
          <DataStoreProvider>{children}</DataStoreProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
