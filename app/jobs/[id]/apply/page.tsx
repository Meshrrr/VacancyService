"use client"

import type React from "react"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Upload, FileText, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

interface ApplicationForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  course: string
  gpa: string
  coverLetter: string
  resume: File | null
  portfolio: File | null
  agreeToTerms: boolean
  agreeToDataProcessing: boolean
}

export default function JobApplicationPage() {
  const params = useParams()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitProgress, setSubmitProgress] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState<ApplicationForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    course: "",
    gpa: "",
    coverLetter: "",
    resume: null,
    portfolio: null,
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
    } else if (!/^[+]?[1-9][\d]{0,15}$/.test(form.phone.replace(/[\s\-$$$$]/g, ""))) {
      newErrors.phone = "Некорректный формат телефона"
    }

    if (!form.course.trim()) {
      newErrors.course = "Курс обязателен для заполнения"
    }

    if (!form.gpa.trim()) {
      newErrors.gpa = "Средний балл обязателен для заполнения"
    } else if (isNaN(Number(form.gpa)) || Number(form.gpa) < 2 || Number(form.gpa) > 5) {
      newErrors.gpa = "Средний балл должен быть числом от 2 до 5"
    }

    if (!form.coverLetter.trim()) {
      newErrors.coverLetter = "Сопроводительное письмо обязательно"
    } else if (form.coverLetter.length < 100) {
      newErrors.coverLetter = "Сопроводительное письмо должно содержать минимум 100 символов"
    }

    if (!form.resume) {
      newErrors.resume = "Резюме обязательно для загрузки"
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

  const handleInputChange = (field: keyof ApplicationForm, value: string | boolean | File | null) => {
    setForm((prev) => ({ ...prev, [field]: value }))

    // Очищаем ошибку для поля при изменении
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleFileUpload = (field: "resume" | "portfolio", file: File | null) => {
    if (file) {
      // Проверяем размер файла (максимум 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, [field]: "Размер файла не должен превышать 5MB" }))
        return
      }

      // Проверяем тип файла
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({ ...prev, [field]: "Поддерживаются только файлы PDF, DOC, DOCX" }))
        return
      }
    }

    handleInputChange(field, file)
  }

  const simulateSubmission = async () => {
    setIsSubmitting(true)
    setSubmitProgress(0)

    // Имитация загрузки файлов
    for (let i = 0; i <= 100; i += 10) {
      setSubmitProgress(i)
      await new Promise((resolve) => setTimeout(resolve, 200))
    }

    // Имитация отправки данных
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await simulateSubmission()
    } catch (error) {
      setErrors({ submit: "Произошла ошибка при отправке заявки. Попробуйте еще раз." })
      setIsSubmitting(false)
    }
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
                Мы отправили подтверждение на ваш email. Ответ работодателя придет в течение 3-5 рабочих дней.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Button className="w-full" onClick={() => router.push("/applications")}>
                Мои заявки
              </Button>
              <Button variant="outline" className="w-full" onClick={() => router.push("/")}>
                К списку вакансий
              </Button>
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
          Назад к вакансии
        </Button>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Подача заявки</CardTitle>
              <CardDescription>Ассистент преподавателя по математике • Математический факультет</CardDescription>
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

                  <div className="grid md:grid-cols-2 gap-4">
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

                    <div>
                      <Label htmlFor="gpa">Средний балл *</Label>
                      <Input
                        id="gpa"
                        value={form.gpa}
                        onChange={(e) => handleInputChange("gpa", e.target.value)}
                        placeholder="4.5"
                        className={errors.gpa ? "border-red-500" : ""}
                      />
                      {errors.gpa && <p className="text-sm text-red-500 mt-1">{errors.gpa}</p>}
                    </div>
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

                {/* Документы */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Документы</h3>

                  <div>
                    <Label htmlFor="resume">Резюме * (PDF, DOC, DOCX, до 5MB)</Label>
                    <div className="mt-2">
                      <input
                        id="resume"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileUpload("resume", e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("resume")?.click()}
                        className={`w-full ${errors.resume ? "border-red-500" : ""}`}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {form.resume ? form.resume.name : "Выберите файл резюме"}
                      </Button>
                      {errors.resume && <p className="text-sm text-red-500 mt-1">{errors.resume}</p>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="portfolio">Портфолио (опционально)</Label>
                    <div className="mt-2">
                      <input
                        id="portfolio"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileUpload("portfolio", e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("portfolio")?.click()}
                        className={`w-full ${errors.portfolio ? "border-red-500" : ""}`}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        {form.portfolio ? form.portfolio.name : "Выберите файл портфолио"}
                      </Button>
                      {errors.portfolio && <p className="text-sm text-red-500 mt-1">{errors.portfolio}</p>}
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

                {/* Прогресс отправки */}
                {isSubmitting && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Отправка заявки...</span>
                      <span>{submitProgress}%</span>
                    </div>
                    <Progress value={submitProgress} />
                  </div>
                )}

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
