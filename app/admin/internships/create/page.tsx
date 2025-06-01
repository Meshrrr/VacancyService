"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Building2, Save, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { useDataStore } from "@/lib/data-store"
import Link from "next/link"

interface InternshipForm {
  title: string
  department: string
  campus: string
  location: string
  duration: string
  salary: string
  description: string
  requirements: string[]
  responsibilities: string[]
  benefits: string[]
  deadline: string
  contactName: string
  contactEmail: string
  contactPhone: string
  status: "draft" | "active"
}

export default function CreateInternshipPage() {
  const router = useRouter()
  const { user, isAdmin } = useAuth()
  const { addInternship } = useDataStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [currentRequirement, setCurrentRequirement] = useState("")
  const [currentResponsibility, setCurrentResponsibility] = useState("")
  const [currentBenefit, setCurrentBenefit] = useState("")

  const [form, setForm] = useState<InternshipForm>({
    title: "",
    department: "",
    campus: "",
    location: "",
    duration: "",
    salary: "",
    description: "",
    requirements: [],
    responsibilities: [],
    benefits: [],
    deadline: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    status: "active",
  })

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!form.title.trim()) {
      newErrors.title = "Название стажировки обязательно"
    }

    if (!form.department.trim()) {
      newErrors.department = "Кафедра обязательна"
    }

    if (!form.campus) {
      newErrors.campus = "Выберите корпус"
    }

    if (!form.location.trim()) {
      newErrors.location = "Местоположение обязательно"
    }

    if (!form.duration.trim()) {
      newErrors.duration = "Длительность обязательна"
    }

    if (!form.salary.trim()) {
      newErrors.salary = "Зарплата обязательна"
    }

    if (!form.description.trim()) {
      newErrors.description = "Описание обязательно"
    } else if (form.description.length < 100) {
      newErrors.description = "Описание должно содержать минимум 100 символов"
    }

    if (form.requirements.length === 0) {
      newErrors.requirements = "Добавьте хотя бы одно требование"
    }

    if (form.responsibilities.length === 0) {
      newErrors.responsibilities = "Добавьте хотя бы одну обязанность"
    }

    if (!form.deadline) {
      newErrors.deadline = "Дедлайн обязателен"
    } else {
      const deadlineDate = new Date(form.deadline)
      const today = new Date()
      if (deadlineDate <= today) {
        newErrors.deadline = "Дедлайн должен быть в будущем"
      }
    }

    if (!form.contactName.trim()) {
      newErrors.contactName = "Имя контактного лица обязательно"
    }

    if (!form.contactEmail.trim()) {
      newErrors.contactEmail = "Email контактного лица обязателен"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) {
      newErrors.contactEmail = "Некорректный формат email"
    }

    if (!form.contactPhone.trim()) {
      newErrors.contactPhone = "Телефон контактного лица обязателен"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof InternshipForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const addListItem = (field: "requirements" | "responsibilities" | "benefits", value: string) => {
    if (value.trim()) {
      setForm((prev) => ({
        ...prev,
        [field]: [...prev[field], value.trim()],
      }))

      // Очищаем соответствующее поле ввода
      if (field === "requirements") setCurrentRequirement("")
      if (field === "responsibilities") setCurrentResponsibility("")
      if (field === "benefits") setCurrentBenefit("")

      // Очищаем ошибку
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[field]
          return newErrors
        })
      }
    }
  }

  const removeListItem = (field: "requirements" | "responsibilities" | "benefits", index: number) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Добавляем стажировку через DataStore
      addInternship({
        ...form,
        createdBy: user?.email || "admin",
      })

      setIsSubmitted(true)
    } catch (error) {
      setErrors({ submit: "Ошибка при создании стажировки. Попробуйте еще раз." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCampusLabel = (campus: string) => {
    switch (campus) {
      case "IRIT-RTF":
        return "ИРИТ-РТФ"
      case "Novokoltcovsky":
        return "Новокольцовский кампус"
      case "GUK":
        return "ГУК"
      default:
        return campus
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>У вас нет прав для доступа к этой странице</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Стажировка создана!</CardTitle>
            <CardDescription>Стажировка успешно добавлена в систему</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Стажировка сохранена со статусом "{form.status === "draft" ? "Черновик" : "Активная"}". Вы можете
                изменить статус в любое время.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Button className="w-full" onClick={() => router.push("/")}>
                Посмотреть на главной
              </Button>
              <Button variant="outline" className="w-full" onClick={() => router.push("/admin")}>
                Админ-панель
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Админ-панель
              </Badge>
            </div>
            <nav className="flex items-center space-x-6">
              <Link href="/admin" className="text-gray-700 hover:text-blue-600">
                Админ-панель
              </Link>
              <Link href="/logout">
                <Button variant="outline">Выйти</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад к админ-панели
        </Button>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Создание новой стажировки</CardTitle>
              <CardDescription>Заполните информацию о стажировке для публикации на платформе</CardDescription>
            </CardHeader>

            <CardContent>
              {errors.submit && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.submit}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Основная информация */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Основная информация</h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Название стажировки *</Label>
                      <Input
                        id="title"
                        value={form.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        placeholder="Стажер-разработчик в лаборатории ИИ"
                        className={errors.title ? "border-red-500" : ""}
                      />
                      {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
                    </div>

                    <div>
                      <Label htmlFor="department">Кафедра/Отдел *</Label>
                      <Input
                        id="department"
                        value={form.department}
                        onChange={(e) => handleInputChange("department", e.target.value)}
                        placeholder="Кафедра информационных систем"
                        className={errors.department ? "border-red-500" : ""}
                      />
                      {errors.department && <p className="text-sm text-red-500 mt-1">{errors.department}</p>}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="campus">Корпус *</Label>
                      <Select value={form.campus} onValueChange={(value) => handleInputChange("campus", value)}>
                        <SelectTrigger className={errors.campus ? "border-red-500" : ""}>
                          <SelectValue placeholder="Выберите корпус" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="IRIT-RTF">ИРИТ-РТФ</SelectItem>
                          <SelectItem value="Novokoltcovsky">Новокольцовский кампус</SelectItem>
                          <SelectItem value="GUK">ГУК</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.campus && <p className="text-sm text-red-500 mt-1">{errors.campus}</p>}
                    </div>

                    <div>
                      <Label htmlFor="duration">Длительность *</Label>
                      <Input
                        id="duration"
                        value={form.duration}
                        onChange={(e) => handleInputChange("duration", e.target.value)}
                        placeholder="3 месяца"
                        className={errors.duration ? "border-red-500" : ""}
                      />
                      {errors.duration && <p className="text-sm text-red-500 mt-1">{errors.duration}</p>}
                    </div>

                    <div>
                      <Label htmlFor="salary">Зарплата *</Label>
                      <Input
                        id="salary"
                        value={form.salary}
                        onChange={(e) => handleInputChange("salary", e.target.value)}
                        placeholder="25 000 ₽/месяц"
                        className={errors.salary ? "border-red-500" : ""}
                      />
                      {errors.salary && <p className="text-sm text-red-500 mt-1">{errors.salary}</p>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Местоположение *</Label>
                    <Input
                      id="location"
                      value={form.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      placeholder="ИРИТ-РТФ, ауд. 405"
                      className={errors.location ? "border-red-500" : ""}
                    />
                    {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location}</p>}
                  </div>

                  <div>
                    <Label htmlFor="deadline">Дедлайн подачи заявок *</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={form.deadline}
                      onChange={(e) => handleInputChange("deadline", e.target.value)}
                      className={errors.deadline ? "border-red-500" : ""}
                    />
                    {errors.deadline && <p className="text-sm text-red-500 mt-1">{errors.deadline}</p>}
                  </div>
                </div>

                {/* Описание */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Описание стажировки</h3>

                  <div>
                    <Label htmlFor="description">Подробное описание *</Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Опишите суть стажировки, цели, задачи..."
                      rows={6}
                      className={errors.description ? "border-red-500" : ""}
                    />
                    <div className="flex justify-between items-center mt-1">
                      {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                      <p className="text-sm text-gray-500 ml-auto">{form.description.length}/2000 символов</p>
                    </div>
                  </div>
                </div>

                {/* Требования */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Требования к кандидатам</h3>

                  <div>
                    <Label htmlFor="requirements">Добавить требование *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="requirements"
                        value={currentRequirement}
                        onChange={(e) => setCurrentRequirement(e.target.value)}
                        placeholder="Python, машинное обучение"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addListItem("requirements", currentRequirement)
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={() => addListItem("requirements", currentRequirement)}
                        disabled={!currentRequirement.trim()}
                      >
                        Добавить
                      </Button>
                    </div>
                    {errors.requirements && <p className="text-sm text-red-500 mt-1">{errors.requirements}</p>}

                    {form.requirements.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {form.requirements.map((req, index) => (
                          <Badge key={index} variant="secondary" className="cursor-pointer">
                            {req}
                            <button
                              type="button"
                              onClick={() => removeListItem("requirements", index)}
                              className="ml-2 text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Обязанности */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Обязанности стажера</h3>

                  <div>
                    <Label htmlFor="responsibilities">Добавить обязанность *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="responsibilities"
                        value={currentResponsibility}
                        onChange={(e) => setCurrentResponsibility(e.target.value)}
                        placeholder="Разработка алгоритмов машинного обучения"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addListItem("responsibilities", currentResponsibility)
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={() => addListItem("responsibilities", currentResponsibility)}
                        disabled={!currentResponsibility.trim()}
                      >
                        Добавить
                      </Button>
                    </div>
                    {errors.responsibilities && <p className="text-sm text-red-500 mt-1">{errors.responsibilities}</p>}

                    {form.responsibilities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {form.responsibilities.map((resp, index) => (
                          <Badge key={index} variant="outline" className="cursor-pointer">
                            {resp}
                            <button
                              type="button"
                              onClick={() => removeListItem("responsibilities", index)}
                              className="ml-2 text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Преимущества */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Что мы предлагаем (опционально)</h3>

                  <div>
                    <Label htmlFor="benefits">Добавить преимущество</Label>
                    <div className="flex gap-2">
                      <Input
                        id="benefits"
                        value={currentBenefit}
                        onChange={(e) => setCurrentBenefit(e.target.value)}
                        placeholder="Гибкий график работы"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addListItem("benefits", currentBenefit)
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={() => addListItem("benefits", currentBenefit)}
                        disabled={!currentBenefit.trim()}
                      >
                        Добавить
                      </Button>
                    </div>

                    {form.benefits.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {form.benefits.map((benefit, index) => (
                          <Badge key={index} variant="default" className="cursor-pointer">
                            {benefit}
                            <button
                              type="button"
                              onClick={() => removeListItem("benefits", index)}
                              className="ml-2 text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Контактная информация */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Контактная информация</h3>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="contactName">Контактное лицо *</Label>
                      <Input
                        id="contactName"
                        value={form.contactName}
                        onChange={(e) => handleInputChange("contactName", e.target.value)}
                        placeholder="Профессор Иванова Е.П."
                        className={errors.contactName ? "border-red-500" : ""}
                      />
                      {errors.contactName && <p className="text-sm text-red-500 mt-1">{errors.contactName}</p>}
                    </div>

                    <div>
                      <Label htmlFor="contactEmail">Email *</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={form.contactEmail}
                        onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                        placeholder="e.ivanova@urfu.ru"
                        className={errors.contactEmail ? "border-red-500" : ""}
                      />
                      {errors.contactEmail && <p className="text-sm text-red-500 mt-1">{errors.contactEmail}</p>}
                    </div>

                    <div>
                      <Label htmlFor="contactPhone">Телефон *</Label>
                      <Input
                        id="contactPhone"
                        value={form.contactPhone}
                        onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                        placeholder="+7 (343) 123-45-67"
                        className={errors.contactPhone ? "border-red-500" : ""}
                      />
                      {errors.contactPhone && <p className="text-sm text-red-500 mt-1">{errors.contactPhone}</p>}
                    </div>
                  </div>
                </div>

                {/* Статус публикации */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Статус публикации</h3>

                  <div>
                    <Label htmlFor="status">Статус стажировки</Label>
                    <Select
                      value={form.status}
                      onValueChange={(value: "draft" | "active") => handleInputChange("status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Черновик (не видна студентам)</SelectItem>
                        <SelectItem value="active">Активная (видна студентам)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Кнопки */}
                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Отмена
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Создание...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Создать стажировку
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
