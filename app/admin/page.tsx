"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Building2, Plus, FileText, Eye, CheckCircle, XCircle, Clock, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { useDataStore } from "@/lib/data-store"
import Link from "next/link"

export default function AdminDashboard() {
  const router = useRouter()
  const { user, isAdmin, isLoading } = useAuth()
  const { internships, applications, activities, updateApplicationStatus } = useDataStore()
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push("/")
    }
  }, [isAdmin, isLoading, router])

  // Фильтруем заявки - показываем только pending в "Последние заявки"
  const pendingApplications = applications.filter((app) => app.status === "pending")

  const filteredApplications = pendingApplications.filter(
    (app) =>
      app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleApplicationAction = async (applicationId: string, action: "accept" | "reject") => {
    const feedback =
      action === "accept" ? "Поздравляем! Ваша заявка одобрена." : "К сожалению, мы выбрали другого кандидата."

    updateApplicationStatus(applicationId, action === "accept" ? "accepted" : "rejected", feedback)
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "На рассмотрении"
      case "reviewed":
        return "Рассмотрена"
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
      case "accepted":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "reviewed":
        return "outline"
      case "accepted":
        return "default"
      case "rejected":
        return "destructive"
      default:
        return "secondary"
    }
  }

  // Вычисляем актуальную статистику
  const internshipStats = {
    total: internships.length,
    active: internships.filter((i) => i.status === "active").length,
    draft: internships.filter((i) => i.status === "draft").length,
    expired: internships.filter((i) => i.status === "expired").length,
  }

  const applicationStats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    reviewed: applications.filter((a) => a.status === "reviewed").length,
    accepted: applications.filter((a) => a.status === "accepted").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAdmin) {
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
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Админ-панель
              </Badge>
            </div>
            <nav className="flex items-center space-x-6">
              <Link href="/" className="text-gray-700 hover:text-blue-600">
                Главная
              </Link>
              <Link href="/admin" className="text-blue-600 font-medium">
                Админ-панель
              </Link>
              <span className="text-gray-700">
                {user?.firstName} {user?.lastName}
              </span>
              <Link href="/logout">
                <Button variant="outline">Выйти</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Панель администратора</h2>
          <p className="text-gray-600">Управление стажировками и заявками студентов</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Link href="/admin/internships/create">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Plus className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold">Создать стажировку</h3>
                <p className="text-sm text-gray-600">Добавить новую позицию</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/internships">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Building2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold">Управление стажировками</h3>
                <p className="text-sm text-gray-600">Редактировать позиции</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/applications">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold">Все заявки</h3>
                <p className="text-sm text-gray-600">Просмотр заявок</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Internship Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Статистика стажировок</CardTitle>
              <CardDescription>Обзор всех позиций</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{internshipStats.total}</div>
                  <div className="text-sm text-gray-600">Всего</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{internshipStats.active}</div>
                  <div className="text-sm text-gray-600">Активные</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{internshipStats.draft}</div>
                  <div className="text-sm text-gray-600">Черновики</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{internshipStats.expired}</div>
                  <div className="text-sm text-gray-600">Истекшие</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Статистика заявок</CardTitle>
              <CardDescription>Обзор всех откликов</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{applicationStats.total}</div>
                  <div className="text-sm text-gray-600">Всего</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{applicationStats.pending}</div>
                  <div className="text-sm text-gray-600">Ожидают</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{applicationStats.reviewed}</div>
                  <div className="text-sm text-gray-600">Рассмотрены</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{applicationStats.accepted}</div>
                  <div className="text-sm text-gray-600">Приняты</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{applicationStats.rejected}</div>
                  <div className="text-sm text-gray-600">Отклонены</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Последние заявки</CardTitle>
                <CardDescription>Новые заявки от студентов, требующие рассмотрения</CardDescription>
              </div>
              <Link href="/admin/applications">
                <Button variant="outline">Все заявки</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Поиск по имени студента или названию стажировки..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="space-y-3">
                {filteredApplications.slice(0, 5).map((application) => (
                  <div
                    key={application.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h4 className="font-medium">{application.studentName}</h4>
                          <p className="text-sm text-gray-600">{application.studentEmail}</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">{application.course}</Badge>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{application.jobTitle}</p>
                      <p className="text-xs text-gray-500">
                        Подана: {new Date(application.appliedDate).toLocaleDateString("ru-RU")}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Badge variant={getStatusVariant(application.status) as any}>
                        {getStatusIcon(application.status)}
                        <span className="ml-1">{getStatusLabel(application.status)}</span>
                      </Badge>

                      {application.status === "pending" && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApplicationAction(application.id, "accept")}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApplicationAction(application.id, "reject")}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      <Link href={`/admin/applications/${application.id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          Подробнее
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {filteredApplications.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Заявки не найдены</h3>
                  <p className="text-gray-500">
                    {searchTerm ? "Попробуйте изменить параметры поиска" : "Нет новых заявок для рассмотрения"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Последняя активность</CardTitle>
            <CardDescription>Недавние действия в системе</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Пока нет активности</p>
              ) : (
                activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3 text-sm">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        activity.type === "application_submitted"
                          ? "bg-blue-500"
                          : activity.type === "application_accepted"
                            ? "bg-green-500"
                            : activity.type === "application_rejected"
                              ? "bg-red-500"
                              : activity.type === "internship_created"
                                ? "bg-purple-500"
                                : "bg-gray-500"
                      }`}
                    ></div>
                    <span className="text-gray-600">
                      {new Date(activity.timestamp).toLocaleTimeString("ru-RU", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span>{activity.description}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
