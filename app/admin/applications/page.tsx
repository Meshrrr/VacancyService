"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Building2, Search, Eye, CheckCircle, XCircle, Clock, Filter, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"
import { useDataStore } from "@/lib/data-store"
import Link from "next/link"

export default function ManageApplicationsPage() {
  const router = useRouter()
  const { isAdmin } = useAuth()
  const { applications, updateApplicationStatus } = useDataStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredApplications = applications.filter((application) => {
    const matchesSearch =
      application.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || application.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleStatusChange = async (applicationId: string, newStatus: "reviewed" | "accepted" | "rejected") => {
    const feedback =
      newStatus === "accepted"
        ? "Поздравляем! Ваша заявка одобрена."
        : newStatus === "rejected"
          ? "К сожалению, мы выбрали другого кандидата."
          : "Ваша заявка рассмотрена."

    updateApplicationStatus(applicationId, newStatus, feedback)
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert variant="destructive">
          <AlertDescription>У вас нет прав для доступа к этой странице</AlertDescription>
        </Alert>
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
        <Button variant="ghost" onClick={() => router.push("/admin")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад к админ-панели
        </Button>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Управление заявками</h2>
          <p className="text-gray-600">Рассмотрение и обработка заявок студентов на стажировки</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Поиск по имени, email или стажировке..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="pending">На рассмотрении</SelectItem>
                  <SelectItem value="reviewed">Рассмотрены</SelectItem>
                  <SelectItem value="accepted">Приняты</SelectItem>
                  <SelectItem value="rejected">Отклонены</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Сбросить фильтры
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-gray-900">{applications.length}</div>
              <div className="text-sm text-gray-600">Всего заявок</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {applications.filter((a) => a.status === "pending").length}
              </div>
              <div className="text-sm text-gray-600">На рассмотрении</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600">
                {applications.filter((a) => a.status === "accepted").length}
              </div>
              <div className="text-sm text-gray-600">Приняты</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-red-600">
                {applications.filter((a) => a.status === "rejected").length}
              </div>
              <div className="text-sm text-gray-600">Отклонены</div>
            </CardContent>
          </Card>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Заявки не найдены</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== "all"
                    ? "Попробуйте изменить параметры поиска"
                    : "Пока нет поданных заявок"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredApplications.map((application) => (
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        {application.studentName || application.applicantName}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {application.studentEmail || application.applicantEmail}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusVariant(application.status) as any}>
                      {getStatusIcon(application.status)}
                      <span className="ml-1">{getStatusLabel(application.status)}</span>
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{application.jobTitle}</h4>
                    <p className="text-sm text-gray-600">Стажировка</p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <strong>Курс:</strong> {application.course || "Не указан"}
                    </div>
                    <div>
                      <strong>Отдел:</strong> {application.department}
                    </div>
                    <div>
                      <strong>Дата подачи:</strong> {new Date(application.appliedDate).toLocaleDateString("ru-RU")}
                    </div>
                  </div>

                  {application.feedback && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <strong className="text-sm text-gray-700">Обратная связь:</strong>
                      <p className="text-sm text-gray-600 mt-1">{application.feedback}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-2">
                      {application.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(application.id, "accepted")}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Принять
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(application.id, "rejected")}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Отклонить
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(application.id, "reviewed")}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Рассмотрена
                          </Button>
                        </>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/admin/applications/${application.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Подробнее
                        </Button>
                      </Link>

                      <Link href={`/jobs/${application.jobId}`}>
                        <Button variant="outline" size="sm">
                          Стажировка
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
