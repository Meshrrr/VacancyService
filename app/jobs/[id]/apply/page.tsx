"use client"

import type React from "react"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"
import { useDataStore } from "@/lib/data-store"
import Link from "next/link"

interface ApplicationForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  course: string
  coverLetter: string
  agreeToTerms: boolean
  agreeToDataProcessing: boolean
}

export default function JobApplicationPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { getInternshipById, addApplication, applications } = useDataStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const internship = getInternshipById(params.id as string)

  // Проверяем, не подавал ли пользователь уже заявку
  const existingApplication = applications.find((app) => app.jobId === params.id && app.applicantEmail === user?.email)

  const [form, setForm] = useState<ApplicationForm>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: "",
    course: "",
    coverLetter: "",
    agreeToTerms: false,
    agreeToDataProcessing: false,
  })

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!form.firstName.trim()) {
      newErrors.firstName = "Имя обязательно для заполнения"
    }

    if (!form.lastName.trim()) {
      newErrors.lastName = "Фамилия обязательна для заполнения"
    }

    if (!form.email.trim()) {
      newErrors.email = "Email обязателен для заполнения"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Некорректный формат email"
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Телефон обязателен для заполнения"
    }

    if (!form.course.trim()) {
      newErrors.course = "Курс обязателен для заполнения"
    }

    if (!form.coverLetter.trim()) {
      newErrors.coverLetter = "Сопроводительное письмо обязательно"
    } else if (form.coverLetter.length < 50) {
      newErrors.coverLetter = "Сопроводительное письмо должно содержать минимум 50 символов"
    }

    if (!form.agreeToTerms) {
      newErrors.agreeToTerms = "Необходимо согласиться с условиями"
    }

    if (!form.agreeToDataProcessing) {
      newErrors.agreeToDataProcessing = "Необходимо согласиться на обработку данных"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof ApplicationForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Имитация отправки
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Добавляем заявку через DataStore
      addApplication({
        jobId: params.id as string,
        jobTitle: internship?.title || "Стажировка",
        department: internship?.department || "Отдел",
        status: "pending",
        applicantName: `${form.firstName} ${form.lastName}`,
        applicantEmail: form.email,
        coverLetter: form.coverLetter,
      })

      setIsSubmitted(true)
    } catch (error) {
      setErrors({ submit: "Произошла ошибка при отправке заявки. Попробуйте еще раз." })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Проверки доступа
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Необходима авторизация</CardTitle>
            <CardDescription>Войдите в систему для подачи заявки</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/login">
              <Button className="w-full">Войти</Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" className="w-full">
                Зарегистрироваться
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!internship) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Стажировка не найдена</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (existingApplication) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Заявка уже подана</CardTitle>
            <CardDescription>Вы уже подали заявку на эту стажировку</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Статус: {existingApplication.status === "pending" ? "На рассмотрении" : existingApplication.status}
              </AlertDescription>
            </Alert>
            <Link href="/applications">
              <Button className="w-full">Мои заявки</Button>
            </Link>
            <Link href={`/jobs/${params.id}`}>
              <Button variant="outline" className="w-full">
                К стажировке
              </Button>
            </Link>
          </CardContent>
        </Card>
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
            <CardTitle className="text-2xl">Заявка отправлена!</CardTitle>
            <CardDescription>Ваша заявка успешно отправлена работодателю</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Ответ работодателя придет в течение 3-5 рабочих дней. Вы можете отслеживать статус в разделе "Мои
                заявки".
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Link href="/applications">
                <Button className="w-full">Мои заявки</Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full">
                  К списку стажировок
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад к стажировке
        </Button>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Подача заявки</CardTitle>
              <CardDescription>
                {internship.title} • {internship.department}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {errors.submit && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.submit}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Личная информация */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Личная информация</h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Имя *</Label>
                      <Input
                        id="firstName"
                        value={form.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        className={errors.firstName ? "border-red-500" : ""}
                      />
                      {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
                    </div>

                    <div>
                      <Label htmlFor="lastName">Фамилия *</Label>
                      <Input
                        id="lastName"
                        value={form.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        className={errors.lastName ? "border-red-500" : ""}
                      />
                      {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={errors.email ? "border-red-500" : ""}
                        disabled={!!user?.email}
                      />
                      {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <Label htmlFor="phone">Телефон *</Label>
                      <Input
                        id="phone"
                        value={form.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+7 (999) 123-45-67"
                        className={errors.phone ? "border-red-500" : ""}
                      />
                      {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="course">Курс обучения *</Label>
                    <Input
                      id="course"
                      value={form.course}
                      onChange={(e) => handleInputChange("course", e.target.value)}
                      placeholder="3 курс бакалавриата"
                      className={errors.course ? "border-red-500" : ""}
                    />
                    {errors.course && <p className="text-sm text-red-500 mt-1">{errors.course}</p>}
                  </div>
                </div>

                {/* Сопроводительное письмо */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Сопроводительное письмо</h3>

                  <div>
                    <Label htmlFor="coverLetter">Расскажите о себе и почему вы подходите для этой позиции *</Label>
                    <Textarea
                      id="coverLetter"
                      value={form.coverLetter}
                      onChange={(e) => handleInputChange("coverLetter", e.target.value)}
                      placeholder="Опишите ваш опыт, навыки и мотивацию..."
                      rows={6}
                      className={errors.coverLetter ? "border-red-500" : ""}
                    />
                    <div className="flex justify-between items-center mt-1">
                      {errors.coverLetter && <p className="text-sm text-red-500">{errors.coverLetter}</p>}
                      <p className="text-sm text-gray-500 ml-auto">{form.coverLetter.length}/1000 символов</p>
                    </div>
                  </div>
                </div>

                {/* Согласия */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Согласия</h3>

                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="agreeToTerms"
                        checked={form.agreeToTerms}
                        onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                      />
                      <Label htmlFor="agreeToTerms" className="text-sm leading-relaxed">
                        Я согласен с условиями участия в программе и понимаю требования к позиции *
                      </Label>
                    </div>
                    {errors.agreeToTerms && <p className="text-sm text-red-500">{errors.agreeToTerms}</p>}

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="agreeToDataProcessing"
                        checked={form.agreeToDataProcessing}
                        onCheckedChange={(checked) => handleInputChange("agreeToDataProcessing", checked as boolean)}
                      />
                      <Label htmlFor="agreeToDataProcessing" className="text-sm leading-relaxed">
                        Я согласен на обработку персональных данных в соответствии с политикой конфиденциальности *
                      </Label>
                    </div>
                    {errors.agreeToDataProcessing && (
                      <p className="text-sm text-red-500">{errors.agreeToDataProcessing}</p>
                    )}
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
                    {isSubmitting ? "Отправка..." : "Отправить заявку"}
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
