"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Building2, LogOut } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LogoutPage() {
  const router = useRouter()
  const { logout } = useAuth()

  useEffect(() => {
    // Выполняем выход и перенаправляем на главную
    logout()
    setTimeout(() => {
      router.push("/")
    }, 2000)
  }, [logout, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
            <LogOut className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Выход выполнен</CardTitle>
          <CardDescription>Вы успешно вышли из системы</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <Building2 className="h-5 w-5" />
            <span>Перенаправление на главную страницу...</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
