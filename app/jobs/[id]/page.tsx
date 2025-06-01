"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, MapPin, Clock, Users, DollarSign, Building2, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"
import { useDataStore } from "@/lib/data-store"
import Link from "next/link"

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { getInternshipById, applications } = useDataStore()
  const [isLoading, setIsLoading] = useState(true)

  const internship = getInternshipById(params.id as string)

  // Проверяем, подавал ли текущий пользователь заявку
  const userApplication = applications.find((app) => app.jobId === params.id && app.applicantEmail === user?.email)

  useEffect(() => {
    setIsLoading(false)
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const isDeadlineSoon = (deadline: string) => {
    const deadlineDate = new Date(deadline)
    const today = new Date()
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7 && diffDays > 0
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-64 bg-gray-200 rounded mb-6"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!internship) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Стажировка не найдена</AlertDescription>
          </Alert>
        </div>
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
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-gray-700 hover:text-blue-600">
                Стажировки
              </Link>
              {isAuthenticated && (
                <>
                  <Link href="/profile" className="text-gray-700 hover:text-blue-600">
                    Мой профиль
                  </Link>
                  <Link href="/applications" className="text-gray-700 hover:text-blue-600">
                    Мои заявки
                  </Link>
                </>
              )}
              {isAuthenticated ? (
                <Link href="/logout">
                  <Button variant="outline">Выйти</Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button>Войти</Button>
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад к стажировкам
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{internship.title}</CardTitle>
                    <CardDescription className="text-lg">{internship.department}</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-sm">
                    {getCampusLabel(internship.campus || "GUK")}
                  </Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {internship.location}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    {internship.duration}
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    {internship.salary}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    {internship.applicants} заявок
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Описание</h3>
                  <p className="text-gray-700 leading-relaxed">{internship.description}</p>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">Требования</h3>
                  <ul className="space-y-2">
                    {internship.requirements.map((req, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">Обязанности</h3>
                  <ul className="space-y-2">
                    {internship.responsibilities.map((resp, index) => (
                      <li key={index} className="flex items-start">
                        <div className="h-2 w-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {internship.benefits.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Что мы предлагаем</h3>
                      <ul className="space-y-2">
                        {internship.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Application Card */}
            <Card>
              <CardHeader>
                <CardTitle>{userApplication ? "Ваша заявка" : "Подать заявку"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isDeadlineSoon(internship.deadline) && !userApplication && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Срок подачи заявок истекает через несколько дней!</AlertDescription>
                  </Alert>
                )}

                {userApplication && (
                  <Alert
                    className={
                      userApplication.status === "accepted"
                        ? "border-green-200 bg-green-50"
                        : userApplication.status === "rejected"
                          ? "border-red-200 bg-red-50"
                          : "border-blue-200 bg-blue-50"
                    }
                  >
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Статус заявки:</strong>{" "}
                      {userApplication.status === "pending"
                        ? "На рассмотрении"
                        : userApplication.status === "reviewed"
                          ? "Рассмотрена"
                          : userApplication.status === "accepted"
                            ? "Принята"
                            : userApplication.status === "rejected"
                              ? "Отклонена"
                              : userApplication.status}
                      <br />
                      <strong>Подана:</strong> {formatDate(userApplication.appliedDate)}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Опубликовано:</span>
                    <span>{formatDate(internship.posted)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Дедлайн:</span>
                    <span className={isDeadlineSoon(internship.deadline) ? "text-red-600 font-medium" : ""}>
                      {formatDate(internship.deadline)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Заявок:</span>
                    <span>{internship.applicants}</span>
                  </div>
                </div>

                <Separator />

                {!isAuthenticated ? (
                  <div className="space-y-2">
                    <Link href="/login">
                      <Button className="w-full" size="lg">
                        Войти для подачи заявки
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button variant="outline" className="w-full">
                        Зарегистрироваться
                      </Button>
                    </Link>
                  </div>
                ) : userApplication ? (
                  <div className="space-y-2">
                    <Link href="/applications">
                      <Button className="w-full" size="lg">
                        Посмотреть мои заявки
                      </Button>
                    </Link>
                    {userApplication.feedback && (
                      <div className="p-3 bg-gray-50 rounded text-sm">
                        <strong>Обратная связь:</strong>
                        <p className="mt-1">{userApplication.feedback}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href={`/jobs/${internship.id}/apply`}>
                    <Button className="w-full" size="lg">
                      Подать заявку
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle>Контактная информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{internship.contact.name}</p>
                  <p className="text-sm text-gray-600">Контактное лицо</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Email: </span>
                    <a href={`mailto:${internship.contact.email}`} className="text-blue-600 hover:underline">
                      {internship.contact.email}
                    </a>
                  </div>
                  <div>
                    <span className="text-gray-600">Телефон: </span>
                    <a href={`tel:${internship.contact.phone}`} className="text-blue-600 hover:underline">
                      {internship.contact.phone}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
