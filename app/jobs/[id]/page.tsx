"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, MapPin, Clock, Users, DollarSign, Building2, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

interface Job {
  id: string
  title: string
  department: string
  type: "part-time" | "internship" | "research"
  location: string
  duration: string
  salary: string
  description: string
  requirements: string[]
  responsibilities: string[]
  benefits: string[]
  posted: string
  deadline: string
  applicants: number
  contact: {
    name: string
    email: string
    phone: string
  }
}

const mockJob: Job = {
  id: "1",
  title: "Ассистент преподавателя по математике",
  department: "Математический факультет",
  type: "part-time",
  location: "Главный корпус, ауд. 205",
  duration: "Семестр",
  salary: "15 000 ₽/месяц",
  description:
    "Мы ищем мотивированного студента для работы ассистентом преподавателя на кафедре высшей математики. Это отличная возможность получить педагогический опыт, углубить знания в математике и помочь младшим курсам в освоении сложного материала.",
  requirements: [
    "Студент 3-4 курса математического или физического факультета",
    "Средний балл не ниже 4.5",
    "Отличное знание высшей математики",
    "Опыт объяснения материала (репетиторство приветствуется)",
    "Коммуникативные навыки",
    "Ответственность и пунктуальность",
  ],
  responsibilities: [
    "Проведение семинарских занятий для студентов 1-2 курсов",
    "Проверка домашних заданий и контрольных работ",
    "Консультации студентов по сложным темам",
    "Помощь в подготовке учебных материалов",
    "Участие в организации экзаменов",
    "Ведение учета успеваемости студентов",
  ],
  benefits: [
    "Гибкий график работы",
    "Возможность совмещения с учебой",
    "Педагогический опыт для резюме",
    "Рекомендательные письма от преподавателей",
    "Возможность продления контракта",
    "Доступ к дополнительным образовательным ресурсам",
  ],
  posted: "2024-01-15",
  deadline: "2024-02-01",
  applicants: 12,
  contact: {
    name: "Профессор Иванова Елена Петровна",
    email: "e.ivanova@university.edu",
    phone: "+7 (495) 123-45-67",
  },
}

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Имитация загрузки данных
    const loadJob = async () => {
      try {
        setIsLoading(true)
        // Имитация API запроса
        await new Promise((resolve) => setTimeout(resolve, 1000))

        if (params.id === "1") {
          setJob(mockJob)
        } else {
          setError("Вакансия не найдена")
        }
      } catch (err) {
        setError("Ошибка загрузки данных")
      } finally {
        setIsLoading(false)
      }
    }

    loadJob()
  }, [params.id])

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "part-time":
        return "Подработка"
      case "internship":
        return "Стажировка"
      case "research":
        return "Исследования"
      default:
        return type
    }
  }

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "part-time":
        return "secondary"
      case "internship":
        return "default"
      case "research":
        return "outline"
      default:
        return "secondary"
    }
  }

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

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || "Вакансия не найдена"}</AlertDescription>
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
              <h1 className="text-2xl font-bold text-gray-900">UniJobs</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-gray-700 hover:text-blue-600">
                Вакансии
              </Link>
              <Link href="/profile" className="text-gray-700 hover:text-blue-600">
                Мой профиль
              </Link>
              <Link href="/applications" className="text-gray-700 hover:text-blue-600">
                Мои заявки
              </Link>
              <Button>Войти</Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад к вакансиям
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                    <CardDescription className="text-lg">{job.department}</CardDescription>
                  </div>
                  <Badge variant={getTypeBadgeVariant(job.type) as any} className="text-sm">
                    {getTypeLabel(job.type)}
                  </Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {job.location}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    {job.duration}
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    {job.salary}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    {job.applicants} заявок
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Описание</h3>
                  <p className="text-gray-700 leading-relaxed">{job.description}</p>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">Требования</h3>
                  <ul className="space-y-2">
                    {job.requirements.map((req, index) => (
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
                    {job.responsibilities.map((resp, index) => (
                      <li key={index} className="flex items-start">
                        <div className="h-2 w-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">Что мы предлагаем</h3>
                  <ul className="space-y-2">
                    {job.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Application Card */}
            <Card>
              <CardHeader>
                <CardTitle>Подать заявку</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isDeadlineSoon(job.deadline) && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Срок подачи заявок истекает через несколько дней!</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Опубликовано:</span>
                    <span>{formatDate(job.posted)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Дедлайн:</span>
                    <span className={isDeadlineSoon(job.deadline) ? "text-red-600 font-medium" : ""}>
                      {formatDate(job.deadline)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Заявок:</span>
                    <span>{job.applicants}</span>
                  </div>
                </div>

                <Separator />

                <Link href={`/jobs/${job.id}/apply`}>
                  <Button className="w-full" size="lg">
                    Подать заявку
                  </Button>
                </Link>

                <Button variant="outline" className="w-full">
                  Сохранить в избранное
                </Button>
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle>Контактная информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{job.contact.name}</p>
                  <p className="text-sm text-gray-600">Контактное лицо</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Email: </span>
                    <a href={`mailto:${job.contact.email}`} className="text-blue-600 hover:underline">
                      {job.contact.email}
                    </a>
                  </div>
                  <div>
                    <span className="text-gray-600">Телефон: </span>
                    <a href={`tel:${job.contact.phone}`} className="text-blue-600 hover:underline">
                      {job.contact.phone}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Similar Jobs */}
            <Card>
              <CardHeader>
                <CardTitle>Похожие вакансии</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="border-l-4 border-blue-500 pl-3">
                    <h4 className="font-medium text-sm">Стажер в IT-отделе</h4>
                    <p className="text-xs text-gray-600">Управление информационных технологий</p>
                    <p className="text-xs text-green-600 font-medium">20 000 ₽/месяц</p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-3">
                    <h4 className="font-medium text-sm">Исследователь в лаборатории</h4>
                    <p className="text-xs text-gray-600">Физический факультет</p>
                    <p className="text-xs text-green-600 font-medium">25 000 ₽/месяц</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Смотреть все
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
