"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, User, Mail, Phone, Edit, Save, X, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

interface ProfileForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState("")

  const [form, setForm] = useState<ProfileForm>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleInputChange = (field: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!form.firstName.trim()) {
      newErrors.firstName = "Имя обязательно"
    }

    if (!form.lastName.trim()) {
      newErrors.lastName = "Фамилия обязательна"
    }

    if (!form.email.trim()) {
      newErrors.email = "Email обязателен"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Некорректный формат email"
    }

    if (isChangingPassword) {
      if (!form.currentPassword) {
        newErrors.currentPassword = "Введите текущий пароль"
      }

      if (!form.newPassword) {
        newErrors.newPassword = "Введите новый пароль"
      } else if (form.newPassword.length < 6) {
        newErrors.newPassword = "Пароль должен содержать минимум 6 символов"
      }

      if (!form.confirmPassword) {
        newErrors.confirmPassword = "Подтвердите новый пароль"
      } else if (form.newPassword !== form.confirmPassword) {
        newErrors.confirmPassword = "Пароли не совпадают"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    try {
      // Имитация API запроса
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // В реальном приложении здесь был бы запрос к API
      // Пока просто показываем сообщение об успехе
      setSuccessMessage("Профиль успешно обновлен")
      setIsEditing(false)
      setIsChangingPassword(false)
      setForm((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }))
    } catch (error) {
      setErrors({ submit: "Ошибка при сохранении профиля" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setForm({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
    setIsEditing(false)
    setIsChangingPassword(false)
    setErrors({})
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "student":
        return "Студент"
      case "teacher":
        return "Преподаватель"
      case "admin":
        return "Администратор"
      default:
        return role
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "student":
        return "bg-blue-100 text-blue-800"
      case "teacher":
        return "bg-green-100 text-green-800"
      case "admin":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    router.push("/login")
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Building2 className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">URFU Intern</h1>
            </div>
            <nav className="flex items-center space-x-6">
              <Link href="/" className="text-gray-700 hover:text-blue-600">
                Главная
              </Link>
              {user?.role === "student" && (
                <Link href="/applications" className="text-gray-700 hover:text-blue-600">
                  Мои заявки
                </Link>
              )}
              {(user?.role === "admin" || user?.role === "teacher") && (
                <Link href="/admin" className="text-gray-700 hover:text-blue-600">
                  Админ-панель
                </Link>
              )}
              <Link href="/profile" className="text-blue-600 font-medium">
                Профиль
              </Link>
              <Link href="/logout">
                <Button variant="outline">Выйти</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Мой профиль</h2>
            <p className="text-gray-600">Управление личной информацией и настройками аккаунта</p>
          </div>

          {successMessage && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
            </Alert>
          )}

          {errors.submit && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}

          {/* Profile Info */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3">
                    <User className="h-6 w-6" />
                    Личная информация
                  </CardTitle>
                  <CardDescription>Основные данные вашего аккаунта</CardDescription>
                </div>
                {!isEditing && (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Редактировать
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Имя</Label>
                  {isEditing ? (
                    <Input
                      id="firstName"
                      value={form.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className={errors.firstName ? "border-red-500" : ""}
                    />
                  ) : (
                    <div className="p-2 bg-gray-50 rounded">{user?.firstName}</div>
                  )}
                  {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <Label htmlFor="lastName">Фамилия</Label>
                  {isEditing ? (
                    <Input
                      id="lastName"
                      value={form.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className={errors.lastName ? "border-red-500" : ""}
                    />
                  ) : (
                    <div className="p-2 bg-gray-50 rounded">{user?.lastName}</div>
                  )}
                  {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={errors.email ? "border-red-500" : ""}
                    disabled
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    {user?.email}
                  </div>
                )}
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div>
                <Label htmlFor="phone">Телефон</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+7 (999) 123-45-67"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    {form.phone || "Не указан"}
                  </div>
                )}
              </div>

              <div>
                <Label>Роль</Label>
                <div className="p-2 bg-gray-50 rounded">
                  <Badge className={getRoleBadgeColor(user?.role || "")}>{getRoleLabel(user?.role || "")}</Badge>
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSave} disabled={isSaving} className="flex-1">
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Сохранение...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Сохранить
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleCancel} disabled={isSaving} className="flex-1">
                    <X className="h-4 w-4 mr-2" />
                    Отмена
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Безопасность</CardTitle>
                  <CardDescription>Изменение пароля и настройки безопасности</CardDescription>
                </div>
                {!isChangingPassword && (
                  <Button variant="outline" onClick={() => setIsChangingPassword(true)}>
                    Изменить пароль
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isChangingPassword ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Текущий пароль</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={form.currentPassword}
                        onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                        className={errors.currentPassword ? "border-red-500" : ""}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    {errors.currentPassword && <p className="text-sm text-red-500 mt-1">{errors.currentPassword}</p>}
                  </div>

                  <div>
                    <Label htmlFor="newPassword">Новый пароль</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={form.newPassword}
                        onChange={(e) => handleInputChange("newPassword", e.target.value)}
                        className={errors.newPassword ? "border-red-500" : ""}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    {errors.newPassword && <p className="text-sm text-red-500 mt-1">{errors.newPassword}</p>}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Подтвердите новый пароль</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={form.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        className={errors.confirmPassword ? "border-red-500" : ""}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleSave} disabled={isSaving} className="flex-1">
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Сохранение...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Изменить пароль
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsChangingPassword(false)
                        setForm((prev) => ({
                          ...prev,
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        }))
                        setErrors({})
                      }}
                      disabled={isSaving}
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Отмена
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-gray-600">
                  <p>Последнее изменение пароля: Никогда</p>
                  <p className="text-sm mt-2">
                    Рекомендуется регулярно менять пароль для обеспечения безопасности аккаунта.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
