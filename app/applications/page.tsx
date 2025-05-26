"use client"

import { useState } from "react"
import {
  Building2,
  Calendar,
  Clock,
  Eye,
  FileText,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

interface Application {
  id: string
  jobId: string
  jobTitle: string
  department: string
  appliedDate: string
  status: "pending" | "reviewed" | "interview" | "accepted" | "rejected"
  lastUpdate: string
  interviewDate?: string
  feedback?: string
  nextSteps?: string
}

const mockApplications: Application[] = [
  {
    id: "app1",
    jobId: "1",
    jobTitle: "Ассистент преподавателя по математике",
    department: "Математический факультет",
    appliedDate: "2024-01-20",
    status: "interview",
    lastUpdate: "2024-01-25",
    interviewDate: "2024-02-01",
    nextSteps: "Собеседование назначено на 1 февраля в 14:00, аудитория 205",
  },
  {
    id: "app2",
    jobId: "2",
    jobTitle: "Стажер в IT-отделе",
    department: "Управление информационных технологий",
    appliedDate: "2024-01-18",
    status: "reviewed",
    lastUpdate: "2024-01-24",
    feedback: "Ваше резюме рассмотрено. Ожидайте дальнейших инструкций.",
  },
  {
    id: "app3",
    jobId: "3",
    jobTitle: "Исследователь в лаборатории физики",
    department: "Физический факультет",
    appliedDate: "2024-01-15",
    status: "accepted",
    lastUpdate: "2024-01-22",
    feedback: "Поздравляем! Ваша заявка одобрена. Начало работы 5 февраля.",
    nextSteps: "Свяжитесь с руководителем лаборатории для получения инструкций",
  },
  {
    id: "app4",
    jobId: "4",
    jobTitle: "Помощник в библиотеке",
    department: "Научная библиотека",
    appliedDate: "2024-01-10",
    status: "rejected",
    lastUpdate: "2024-01-20",
    feedback: "К сожалению, мы выбрали другого кандидата. Спасибо за интерес к позиции.",
  },
  {
    id: "app5",
    jobId: "5",
    jobTitle: "Лаборант кафедры химии",
    department: "Химический факультет",
    appliedDate: "2024-01-22",
    status: "pending",
    lastUpdate: "2024-01-22",
  },
]

export default function ApplicationsPage() {
  const [applications] = useState<Application[]>(mockApplications)
  const [activeTab, setActiveTab] = useState("all")

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "На рассмотрении"
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "reviewed":
        return <Eye className="h-4 w-4" />
      case "interview":
        return <MessageSquare className="h-4 w-4" />
      case "accepted":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "reviewed":
        return "outline"
      case "interview":
        return "default"
      case "accepted":
        return "default"
      case "rejected":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600"
      case "reviewed":
        return "text-blue-600"
      case "interview":
        return "text-purple-600"
      case "accepted":
        return "text-green-600"
      case "rejected":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const filteredApplications = applications.filter((app) => {
    if (activeTab === "all") return true
    return app.status === activeTab
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusCounts = () => {
    return {
      all: applications.length,
      pending: applications.filter((app) => app.status === "pending").length,
      reviewed: applications.filter((app) => app.status === "reviewed").length,
      interview: applications.filter((app) => app.status === "interview").length,
      accepted: applications.filter((app) => app.status === "accepted").length,
      rejected: applications.filter((app) => app.status === "rejected").length,
    }
  }

  const statusCounts = getStatusCounts()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Building2 className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">UniJobs</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-gray-700 hover:text-blue-600">
                Вакансии
              </Link>
              <Link href="/profile" className="text-gray-700 hover:text-blue-600">
                Мой профиль
              </Link>
              <Link href="/applications" className="text-blue-600 font-medium">
                Мои заявки
              </Link>
              <Button>Войти</Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Мои заявки</h2>
          <p className="text-gray-600">Отслеживайте статус ваших заявок на работу и стажировки</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{statusCounts.all}</div>
              <div className="text-sm text-gray-600">Всего</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
              <div className="text-sm text-gray-600">На рассмотрении</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{statusCounts.reviewed}</div>
              <div className="text-sm text-gray-600">Рассмотрены</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{statusCounts.interview}</div>
              <div className="text-sm text-gray-600">Собеседования</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{statusCounts.accepted}</div>
              <div className="text-sm text-gray-600">Приняты</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{statusCounts.rejected}</div>
              <div className="text-sm text-gray-600">Отклонены</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="all">Все ({statusCounts.all})</TabsTrigger>
            <TabsTrigger value="pending">На рассмотрении ({statusCounts.pending})</TabsTrigger>
            <TabsTrigger value="reviewed">Рассмотрены ({statusCounts.reviewed})</TabsTrigger>
            <TabsTrigger value="interview">Собеседования ({statusCounts.interview})</TabsTrigger>
            <TabsTrigger value="accepted">Приняты ({statusCounts.accepted})</TabsTrigger>
            <TabsTrigger value="rejected">Отклонены ({statusCounts.rejected})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            {filteredApplications.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Заявки не найдены</h3>
                  <p className="text-gray-500 mb-6">
                    {activeTab === "all"
                      ? "У вас пока нет поданных заявок"
                      : `Нет заявок со статусом "${getStatusLabel(activeTab)}"`}
                  </p>
                  <Link href="/">
                    <Button>Найти вакансии</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((application) => (
                  <Card key={application.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-1">{application.jobTitle}</CardTitle>
                          <CardDescription className="text-base">{application.department}</CardDescription>
                        </div>
                        <Badge
                          variant={getStatusVariant(application.status) as any}
                          className="flex items-center gap-1"
                        >
                          <span className={getStatusColor(application.status)}>
                            {getStatusIcon(application.status)}
                          </span>
                          {getStatusLabel(application.status)}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Подана: {formatDate(application.appliedDate)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          Обновлена: {formatDate(application.lastUpdate)}
                        </div>
                      </div>

                      {application.interviewDate && (
                        <Alert>
                          <Calendar className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Собеседование назначено:</strong> {formatDate(application.interviewDate)}
                          </AlertDescription>
                        </Alert>
                      )}

                      {application.feedback && (
                        <Alert
                          className={
                            application.status === "accepted"
                              ? "border-green-200 bg-green-50"
                              : application.status === "rejected"
                                ? "border-red-200 bg-red-50"
                                : "border-blue-200 bg-blue-50"
                          }
                        >
                          <MessageSquare className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Обратная связь:</strong> {application.feedback}
                          </AlertDescription>
                        </Alert>
                      )}

                      {application.nextSteps && (
                        <Alert className="border-purple-200 bg-purple-50">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Следующие шаги:</strong> {application.nextSteps}
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="flex gap-3 pt-4">
                        <Link href={`/jobs/${application.jobId}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Посмотреть вакансию
                          </Button>
                        </Link>

                        {application.status === "interview" && (
                          <Button size="sm">
                            <Calendar className="h-4 w-4 mr-2" />
                            Подтвердить участие
                          </Button>
                        )}

                        {application.status === "accepted" && (
                          <Button size="sm">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Принять предложение
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
            <CardDescription>Полезные ссылки для управления вашими заявками</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/">
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                  <Building2 className="h-6 w-6" />
                  <span>Найти новые вакансии</span>
                </Button>
              </Link>

              <Link href="/profile">
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                  <FileText className="h-6 w-6" />
                  <span>Обновить профиль</span>
                </Button>
              </Link>

              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                <MessageSquare className="h-6 w-6" />
                <span>Связаться с поддержкой</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
