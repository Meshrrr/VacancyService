"use client"

import { useState } from "react"
import { Search, MapPin, Clock, Users, Building2, Filter, LogIn, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"
import { useDataStore } from "@/lib/data-store"
import Link from "next/link"

export default function HomePage() {
  const { user, isAuthenticated, isAdmin } = useAuth()
  const { internships } = useDataStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [campusFilter, setCampusFilter] = useState<string>("all")

  const filteredInternships = internships.filter((internship) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      searchTerm === "" ||
      internship.title.toLowerCase().includes(searchLower) ||
      internship.department.toLowerCase().includes(searchLower) ||
      internship.description.toLowerCase().includes(searchLower) ||
      internship.requirements.some((req) => req.toLowerCase().includes(searchLower)) ||
      internship.responsibilities.some((resp) => resp.toLowerCase().includes(searchLower))

    const matchesCampus = campusFilter === "all" || internship.campus === campusFilter
    const isActive = internship.status === "active"

    return matchesSearch && matchesCampus && isActive
  })

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

  const getCampusBadgeColor = (campus: string) => {
    switch (campus) {
      case "IRIT-RTF":
        return "bg-blue-100 text-blue-800"
      case "Novokoltcovsky":
        return "bg-green-100 text-green-800"
      case "GUK":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleSearch = () => {
    console.log(`Searching for: "${searchTerm}" in campus: "${campusFilter}"`)
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
              {isAuthenticated ? (
                <>
                  <Link href="/" className="text-blue-600 font-medium">
                    Стажировки
                  </Link>
                  {!isAdmin && (
                    <Link href="/applications" className="text-gray-700 hover:text-blue-600">
                      Мои заявки
                    </Link>
                  )}
                  {isAdmin && (
                    <Link href="/admin" className="text-gray-700 hover:text-blue-600">
                      Админ-панель
                    </Link>
                  )}
                  <Link href="/profile" className="text-gray-700 hover:text-blue-600">
                    {user?.firstName} {user?.lastName}
                  </Link>
                  <Link href="/logout">
                    <Button variant="outline">Выйти</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline">
                      <LogIn className="h-4 w-4 mr-2" />
                      Войти
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Регистрация
                    </Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Найди стажировку своей мечты</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Стажировки в ИРИТ-РТФ, Новокольцовском кампусе и ГУК</p>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto bg-white rounded-lg p-4 shadow-lg">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Поиск по названию, кафедре или описанию..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-gray-900"
                />
              </div>
              <Select value={campusFilter} onValueChange={setCampusFilter}>
                <SelectTrigger className="w-full md:w-64 h-12">
                  <SelectValue placeholder="Корпус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все корпуса</SelectItem>
                  <SelectItem value="IRIT-RTF">ИРИТ-РТФ</SelectItem>
                  <SelectItem value="Novokoltcovsky">Новокольцовский кампус</SelectItem>
                  <SelectItem value="GUK">ГУК</SelectItem>
                </SelectContent>
              </Select>
              <Button className="h-12 px-8" onClick={handleSearch}>
                <Filter className="h-5 w-5 mr-2" />
                Найти ({filteredInternships.length})
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Internships List */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-gray-900">
            {searchTerm || campusFilter !== "all"
              ? `Результаты поиска (${filteredInternships.length})`
              : `Доступные стажировки (${filteredInternships.length})`}
          </h3>
          {isAdmin && (
            <Link href="/admin/internships/create">
              <Button>
                <Building2 className="h-4 w-4 mr-2" />
                Создать стажировку
              </Button>
            </Link>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredInternships.map((internship) => (
            <Card key={internship.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 line-clamp-2">{internship.title}</CardTitle>
                    <CardDescription className="text-sm">{internship.department}</CardDescription>
                  </div>
                  <Badge className={getCampusBadgeColor(internship.campus)}>{getCampusLabel(internship.campus)}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 line-clamp-2">{internship.description}</p>

                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    {internship.location}
                  </div>

                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {internship.duration}
                  </div>

                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-1" />
                    {internship.applicants} заявок
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {internship.requirements.slice(0, 2).map((req, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {req}
                      </Badge>
                    ))}
                    {internship.requirements.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{internship.requirements.length - 2}
                      </Badge>
                    )}
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-green-600">{internship.salary}</span>
                    <Link href={`/jobs/${internship.id}`}>
                      <Button size="sm">Подробнее</Button>
                    </Link>
                  </div>

                  <div className="text-xs text-gray-500">Дедлайн: {formatDate(internship.deadline)}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredInternships.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Стажировки не найдены</h3>
            <p className="text-gray-500">Попробуйте изменить параметры поиска</p>
          </div>
        )}
      </section>

      {/* Campus Info */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">Наши корпуса</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  ИРИТ-РТФ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Институт радиоэлектроники и информационных технологий. Стажировки в области IT, разработки ПО,
                  искусственного интеллекта.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  Новокольцовский кампус
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Современный кампус с лабораториями материаловедения, физики, химии. Исследовательские стажировки.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                  ГУК
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Главный учебный корпус. Стажировки в административных отделах, маркетинге, управлении.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Building2 className="h-6 w-6" />
                <span className="text-xl font-bold">URFU Intern</span>
              </div>
              <p className="text-gray-400">Платформа для поиска стажировок в УрФУ</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Для студентов</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Поиск стажировок</li>
                <li>Подача заявок</li>
                <li>Отслеживание статуса</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Корпуса</h4>
              <ul className="space-y-2 text-gray-400">
                <li>ИРИТ-РТФ</li>
                <li>Новокольцовский кампус</li>
                <li>ГУК</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Контакты</h4>
              <ul className="space-y-2 text-gray-400">
                <li>info@urfu.ru</li>
                <li>+7 (343) 375-44-44</li>
                <li>ул. Мира, 19</li>
              </ul>
            </div>
          </div>
          <Separator className="my-8 bg-gray-700" />
          <div className="text-center text-gray-400">
            <p>&copy; 2024 URFU Intern. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
