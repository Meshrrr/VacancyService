"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Building2, Plus, Search, Edit, Eye, Trash2, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

interface Internship {
  id: string
  title: string
  department: string
  campus: "IRIT-RTF" | "Novokoltcovsky" | "GUK"
  location: string
  duration: string
  salary: string
  status: "draft" | "active" | "expired"
  applicants: number
  deadline: string
  createdAt: string
}

const mockInternships: Internship[] = [
  {
    id: "1",
    title: "Стажер-разработчик в лаборатории ИИ",
    department: "Кафедра информационных систем",
    campus: "IRIT-RTF",
    location: "ИРИТ-РТФ, ауд. 405",
    duration: "3 месяца",
    salary: "25 000 ₽/месяц",
    status: "active",
    applicants: 0,
    deadline: "2024-02-01",
    createdAt: "2024-01-15",
  },
]

export default function ManageInternshipsPage() {
  const router = useRouter()
  const { isAdmin } = useAuth()
  const [internships, setInternships] = useState<Internship[]>(mockInternships)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [campusFilter, setCampusFilter] = useState<string>("all")

  const filteredInternships = internships.filter((internship) => {
    const matchesSearch =
      internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.department.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || internship.status === statusFilter
    const matchesCampus = campusFilter === "all" || internship.campus === campusFilter

    return matchesSearch && matchesStatus && matchesCampus
  })

  const handleStatusChange = async (internshipId: string, newStatus: "draft" | "active" | "expired") => {
    setInternships((prev) =>
      prev.map((internship) => (internship.id === internshipId ? { ...internship, status: newStatus } : internship)),
    )
  }

  const handleDelete = async (internshipId: string) => {
    if (confirm("Вы уверены, что хотите удалить эту стажировку?")) {
      setInternships((prev) => prev.filter((internship) => internship.id !== internshipId))
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "draft":
        return "Черновик"
      case "active":
        return "Активная"
      case "expired":
        return "Истекшая"
      default:
        return status
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "draft":
        return "secondary"
      case "active":
        return "default"
      case "expired":
        return "destructive"
      default:
        return "secondary"
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
              <h1 className="text-2xl font-bold text-gray-900">UniInternships</h1>
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

        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Управление стажировками</h2>
            <p className="text-gray-600">Создание, редактирование и управление стажировками</p>
          </div>
          <Link href="/admin/internships/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Создать стажировку
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Поиск по названию или кафедре..."
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
                  <SelectItem value="draft">Черновики</SelectItem>
                  <SelectItem value="active">Активные</SelectItem>
                  <SelectItem value="expired">Истекшие</SelectItem>
                </SelectContent>
              </Select>

              <Select value={campusFilter} onValueChange={setCampusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Корпус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все корпуса</SelectItem>
                  <SelectItem value="IRIT-RTF">ИРИТ-РТФ</SelectItem>
                  <SelectItem value="Novokoltcovsky">Новокольцовский кампус</SelectItem>
                  <SelectItem value="GUK">ГУК</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline">
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
              <div className="text-2xl font-bold text-gray-900">{internships.length}</div>
              <div className="text-sm text-gray-600">Всего стажировок</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600">
                {internships.filter((i) => i.status === "active").length}
              </div>
              <div className="text-sm text-gray-600">Активные</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {internships.filter((i) => i.status === "draft").length}
              </div>
              <div className="text-sm text-gray-600">Черновики</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {internships.reduce((sum, i) => sum + i.applicants, 0)}
              </div>
              <div className="text-sm text-gray-600">Всего заявок</div>
            </CardContent>
          </Card>
        </div>

        {/* Internships List */}
        <div className="space-y-4">
          {filteredInternships.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Стажировки не найдены</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || statusFilter !== "all" || campusFilter !== "all"
                    ? "Попробуйте изменить параметры поиска"
                    : "Создайте первую стажировку для начала работы"}
                </p>
                <Link href="/admin/internships/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Создать стажировку
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            filteredInternships.map((internship) => (
              <Card key={internship.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{internship.title}</CardTitle>
                      <CardDescription className="text-base">{internship.department}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusVariant(internship.status) as any}>
                        {getStatusLabel(internship.status)}
                      </Badge>
                      <Badge variant="outline">{getCampusLabel(internship.campus)}</Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <strong>Местоположение:</strong> {internship.location}
                    </div>
                    <div>
                      <strong>Длительность:</strong> {internship.duration}
                    </div>
                    <div>
                      <strong>Зарплата:</strong> {internship.salary}
                    </div>
                    <div>
                      <strong>Заявок:</strong> {internship.applicants}
                    </div>
                    <div>
                      <strong>Дедлайн:</strong> {new Date(internship.deadline).toLocaleDateString("ru-RU")}
                    </div>
                    <div>
                      <strong>Создана:</strong> {new Date(internship.createdAt).toLocaleDateString("ru-RU")}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-2">
                      <Select
                        value={internship.status}
                        onValueChange={(value: "draft" | "active" | "expired") =>
                          handleStatusChange(internship.id, value)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Черновик</SelectItem>
                          <SelectItem value="active">Активная</SelectItem>
                          <SelectItem value="expired">Истекшая</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/jobs/${internship.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Просмотр
                        </Button>
                      </Link>

                      <Link href={`/admin/internships/${internship.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Редактировать
                        </Button>
                      </Link>

                      <Link href={`/admin/internships/${internship.id}/applications`}>
                        <Button variant="outline" size="sm">
                          Заявки ({internship.applicants})
                        </Button>
                      </Link>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(internship.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
