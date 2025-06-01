"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Building2, TrendingUp, Users, FileText, Calendar, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

interface AnalyticsData {
  totalInternships: number
  totalApplications: number
  totalStudents: number
  averageApplicationsPerInternship: number
  topInternships: Array<{
    title: string
    applications: number
  }>
  campusDistribution: Array<{
    campus: string
    internships: number
    applications: number
  }>
  monthlyStats: Array<{
    month: string
    internships: number
    applications: number
  }>
}

const mockAnalytics: AnalyticsData = {
  totalInternships: 1,
  totalApplications: 2,
  totalStudents: 2,
  averageApplicationsPerInternship: 2,
  topInternships: [
    {
      title: "Стажер-разработчик в лаборатории ИИ",
      applications: 2,
    },
  ],
  campusDistribution: [
    {
      campus: "ИРИТ-РТФ",
      internships: 1,
      applications: 2,
    },
    {
      campus: "Новокольцовский кампус",
      internships: 0,
      applications: 0,
    },
    {
      campus: "ГУК",
      internships: 0,
      applications: 0,
    },
  ],
  monthlyStats: [
    {
      month: "Январь 2024",
      internships: 1,
      applications: 2,
    },
  ],
}

export default function AnalyticsPage() {
  const router = useRouter()
  const { isAdmin } = useAuth()
  const [timeRange, setTimeRange] = useState("month")
  const [analytics] = useState<AnalyticsData>(mockAnalytics)

  const exportData = () => {
    // Имитация экспорта данных
    const data = {
      exportDate: new Date().toISOString(),
      timeRange,
      ...analytics,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `analytics-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Аналитика и отчеты</h2>
            <p className="text-gray-600">Статистика по стажировкам и заявкам студентов</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Последняя неделя</SelectItem>
                <SelectItem value="month">Последний месяц</SelectItem>
                <SelectItem value="quarter">Последний квартал</SelectItem>
                <SelectItem value="year">Последний год</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Экспорт данных
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего стажировок</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalInternships}</div>
              <p className="text-xs text-muted-foreground">+0% от прошлого периода</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего заявок</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalApplications}</div>
              <p className="text-xs text-muted-foreground">+100% от прошлого периода</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Активных студентов</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalStudents}</div>
              <p className="text-xs text-muted-foreground">+100% от прошлого периода</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Среднее заявок на стажировку</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.averageApplicationsPerInternship}</div>
              <p className="text-xs text-muted-foreground">+100% от прошлого периода</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Detailed Analytics */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Top Internships */}
          <Card>
            <CardHeader>
              <CardTitle>Популярные стажировки</CardTitle>
              <CardDescription>Стажировки с наибольшим количеством заявок</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topInternships.map((internship, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{internship.title}</h4>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(internship.applications / Math.max(...analytics.topInternships.map((i) => i.applications))) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="ml-4 text-sm font-medium">{internship.applications} заявок</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Campus Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Распределение по корпусам</CardTitle>
              <CardDescription>Статистика стажировок и заявок по корпусам</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.campusDistribution.map((campus, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{campus.campus}</h4>
                      <div className="flex gap-4 text-sm">
                        <span>{campus.internships} стажировок</span>
                        <span>{campus.applications} заявок</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${campus.internships > 0 ? (campus.internships / analytics.totalInternships) * 100 : 0}%`,
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Стажировки</p>
                      </div>
                      <div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${campus.applications > 0 ? (campus.applications / analytics.totalApplications) * 100 : 0}%`,
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Заявки</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Статистика по месяцам</CardTitle>
            <CardDescription>Динамика создания стажировок и подачи заявок</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.monthlyStats.map((month, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <h4 className="font-medium">{month.month}</h4>
                      <p className="text-sm text-gray-600">
                        {month.internships} стажировок, {month.applications} заявок
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {month.internships} стажировок
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      {month.applications} заявок
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Экспорт отчетов</CardTitle>
            <CardDescription>Скачайте детальные отчеты в различных форматах</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                onClick={exportData}
                className="h-auto p-4 flex flex-col items-center space-y-2"
              >
                <Download className="h-6 w-6" />
                <span>Экспорт в JSON</span>
                <span className="text-xs text-gray-500">Полные данные аналитики</span>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <FileText className="h-6 w-6" />
                <span>Отчет по стажировкам</span>
                <span className="text-xs text-gray-500">Детальная статистика</span>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <Users className="h-6 w-6" />
                <span>Отчет по студентам</span>
                <span className="text-xs text-gray-500">Активность пользователей</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
