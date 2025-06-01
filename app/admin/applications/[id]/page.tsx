"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, User, Mail, Calendar, Clock, MessageSquare, CheckCircle, XCircle, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"
import { useDataStore, type Application } from "@/lib/data-store"
import Link from "next/link"

export default function ApplicationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { isAdmin } = useAuth()
  const { getApplicationById, getInternshipById, updateApplicationStatus } = useDataStore()

  const applicationId = params.id as string
  const application = getApplicationById(applicationId)
  const internship = application ? getInternshipById(application.jobId) : null

  const [feedback, setFeedback] = useState("")
  const [interviewDate, setInterviewDate] = useState("")
  const [nextSteps, setNextSteps] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (!isAdmin) {
      router.push("/")
      return
    }

    if (!application) {
      router.push("/admin/applications")
      return
    }

    // Заполняем поля существующими данными
    setFeedback(application.feedback || "")
    setInterviewDate(application.interviewDate ? application.interviewDate.split("T")[0] : "")
    setNextSteps(application.nextSteps || "")
  }, [application, isAdmin, router])

  const handleStatusUpdate = async (newStatus: Application["status"]) => {
    if (!application) return

    setIsUpdating(true)
    try {
      const interviewDateTime = interviewDate ? new Date(interviewDate).toISOString() : undefined
      updateApplicationStatus(application.id, newStatus, feedback, interviewDateTime, nextSteps)
    } catch (error) {
      console.error("Ошибка при обновлении статуса:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "reviewed":
        return "bg-blue-100 text-blue-800"
      case "interview":
        return "bg-purple-100 text-purple-800"
      case "accepted":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Ожидает рассмотрения"
      case "reviewed":
        return "Рассмотрена"
      case "interview":
        return "Собеседование"
      case "accepted":
        return "Принята"
      case "rejected":
        return "Отклонена"
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!isAdmin || !application || !internship) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin/applications">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Назад к заявкам
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Eye className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Детали заявки</h1>
              </div>
            </div>
            <Badge className={getStatusColor(application.status)}>{getStatusLabel(application.status)}</Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Основная информация */}
          <div className="lg:col-span-2 space-y-6">
            {/* Информация о кандидате */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Информация о кандидате
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Имя</Label>
                    <p className="text-lg font-semibold">{application.applicantName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Email</Label>
                    <p className="text-lg">{application.applicantEmail}</p>
                  </div>
                </div>
                {application.course && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Курс обучения</Label>
                    <p className="text-lg">{application.course}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Информация о стажировке */}
            <Card>
              <CardHeader>
                <CardTitle>Стажировка</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Название</Label>
                  <p className="text-lg font-semibold">{internship.title}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Кафедра</Label>
                    <p>{internship.department}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Корпус</Label>
                    <p>{internship.campus}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Оплата</Label>
                  <p className="text-lg font-semibold text-green-600">{internship.salary}</p>
                </div>
                <div className="flex justify-end">
                  <Link href={`/jobs/${internship.id}`}>
                    <Button variant="outline" size="sm">
                      Посмотреть стажировку
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Сопроводительное письмо */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Сопроводительное письмо
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{application.coverLetter}</p>
                </div>
              </CardContent>
            </Card>

            {/* Обратная связь и комментарии */}
            <Card>
              <CardHeader>
                <CardTitle>Обратная связь</CardTitle>
                <CardDescription>Комментарии и заметки по заявке</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="feedback">Комментарии</Label>
                  <Textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Добавьте комментарии о кандидате..."
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="nextSteps">Следующие шаги</Label>
                  <Textarea
                    id="nextSteps"
                    value={nextSteps}
                    onChange={(e) => setNextSteps(e.target.value)}
                    placeholder="Что нужно сделать дальше..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="interviewDate">Дата собеседования</Label>
                  <Input
                    id="interviewDate"
                    type="date"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            {/* Статус и действия */}
            <Card>
              <CardHeader>
                <CardTitle>Управление заявкой</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Текущий статус</Label>
                  <Badge className={`${getStatusColor(application.status)} w-full justify-center py-2`}>
                    {getStatusLabel(application.status)}
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Быстрые действия</Label>
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusUpdate("reviewed")}
                      disabled={isUpdating || application.status === "reviewed"}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Рассмотрена
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusUpdate("interview")}
                      disabled={isUpdating || application.status === "interview"}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Собеседование
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-200 hover:bg-green-50"
                      onClick={() => handleStatusUpdate("accepted")}
                      disabled={isUpdating || application.status === "accepted"}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Принять
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleStatusUpdate("rejected")}
                      disabled={isUpdating || application.status === "rejected"}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Отклонить
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Временная шкала */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  История заявки
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Заявка подана</p>
                      <p className="text-xs text-gray-500">{formatDate(application.appliedDate)}</p>
                    </div>
                  </div>
                  {application.lastUpdate !== application.appliedDate && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Последнее обновление</p>
                        <p className="text-xs text-gray-500">{formatDate(application.lastUpdate)}</p>
                      </div>
                    </div>
                  )}
                  {application.interviewDate && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Собеседование запланировано</p>
                        <p className="text-xs text-gray-500">{formatDate(application.interviewDate)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Контакты */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Контакты
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <Label className="text-xs text-gray-500">Email кандидата</Label>
                  <p className="text-sm">{application.applicantEmail}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Контакт по стажировке</Label>
                  <p className="text-sm">{internship.contact.name}</p>
                  <p className="text-xs text-gray-500">{internship.contact.email}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
