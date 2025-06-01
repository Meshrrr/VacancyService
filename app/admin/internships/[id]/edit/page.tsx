"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Plus, X, Save, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { useDataStore } from "@/lib/data-store"
import Link from "next/link"

export default function EditInternshipPage() {
  const router = useRouter()
  const params = useParams()
  const { isAdmin } = useAuth()
  const { getInternshipById, updateInternship } = useDataStore()

  const internshipId = params.id as string
  const internship = getInternshipById(internshipId)

  const [formData, setFormData] = useState({
    title: "",
    department: "",
    campus: "IRIT-RTF" as "IRIT-RTF" | "Novokoltcovsky" | "GUK",
    type: "internship" as "part-time" | "internship" | "research",
    location: "",
    duration: "",
    salary: "",
    description: "",
    deadline: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    status: "active" as "draft" | "active" | "expired",
  })

  const [requirements, setRequirements] = useState<string[]>([])
  const [responsibilities, setResponsibilities] = useState<string[]>([])
  const [benefits, setBenefits] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isAdmin) {
      router.push("/")
      return
    }

    if (!internship) {
      router.push("/admin/internships")
      return
    }

    // Заполняем форму данными стажировки
    setFormData({
      title: internship.title,
      department: internship.department,
      campus: internship.campus || "IRIT-RTF",
      type: internship.type || "internship",
      location: internship.location,
      duration: internship.duration,
      salary: internship.salary,
      description: internship.description,
      deadline: internship.deadline.split("T")[0], // Преобразуем в формат YYYY-MM-DD
      contactName: internship.contact.name,
      contactEmail: internship.contact.email,
      contactPhone: internship.contact.phone,
      status: internship.status || "active",
    })

    setRequirements([...internship.requirements])
    setResponsibilities([...internship.responsibilities])
    setBenefits([...internship.benefits])
  }, [internship, isAdmin, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addListItem = (list: string[], setList: (items: string[]) => void, item: string) => {
    if (item.trim()) {
      setList([...list, item.trim()])
    }
  }

  const removeListItem = (list: string[], setList: (items: string[]) => void, index: number) => {
    setList(list.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const updatedInternship = {
        title: formData.title,
        department: formData.department,
        campus: formData.campus,
        type: formData.type,
        location: formData.location,
        duration: formData.duration,
        salary: formData.salary,
        description: formData.description,
        requirements,
        responsibilities,
        benefits,
        deadline: new Date(formData.deadline).toISOString(),
        contact: {
          name: formData.contactName,
          email: formData.contactEmail,
          phone: formData.contactPhone,
        },
        status: formData.status,
      }

      updateInternship(internshipId, updatedInternship)
      router.push("/admin/internships")
    } catch (error) {
      console.error("Ошибка при обновлении стажировки:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAdmin || !internship) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin/internships">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Назад к стажировкам
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Building2 className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Редактирование стажировки</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Основная информация */}
          <Card>
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
              <CardDescription>Основные данные о стажировке</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Название стажировки *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="department">Кафедра/Отдел *</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleInputChange("department", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="campus">Корпус *</Label>
                  <Select value={formData.campus} onValueChange={(value) => handleInputChange("campus", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IRIT-RTF">ИРИТ-РТФ</SelectItem>
                      <SelectItem value="Novokoltcovsky">Новокольцовский кампус</SelectItem>
                      <SelectItem value="GUK">ГУК</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type">Тип стажировки *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internship">Стажировка</SelectItem>
                      <SelectItem value="part-time">Частичная занятость</SelectItem>
                      <SelectItem value="research">Исследовательская работа</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Статус *</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Черновик</SelectItem>
                      <SelectItem value="active">Активная</SelectItem>
                      <SelectItem value="expired">Завершена</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="location">Место проведения *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Продолжительность *</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => handleInputChange("duration", e.target.value)}
                    placeholder="3 месяца"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="salary">Оплата *</Label>
                  <Input
                    id="salary"
                    value={formData.salary}
                    onChange={(e) => handleInputChange("salary", e.target.value)}
                    placeholder="25,000 ₽/месяц"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="deadline">Дедлайн подачи заявок *</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => handleInputChange("deadline", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Описание стажировки *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Требования */}
          <Card>
            <CardHeader>
              <CardTitle>Требования к кандидатам</CardTitle>
              <CardDescription>Навыки и знания, необходимые для стажировки</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {requirements.map((req, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {req}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeListItem(requirements, setRequirements, index)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Добавить требование"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addListItem(requirements, setRequirements, e.currentTarget.value)
                        e.currentTarget.value = ""
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement
                      addListItem(requirements, setRequirements, input.value)
                      input.value = ""
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Обязанности */}
          <Card>
            <CardHeader>
              <CardTitle>Обязанности стажера</CardTitle>
              <CardDescription>Что будет делать стажер во время работы</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {responsibilities.map((resp, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {resp}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeListItem(responsibilities, setResponsibilities, index)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Добавить обязанность"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addListItem(responsibilities, setResponsibilities, e.currentTarget.value)
                        e.currentTarget.value = ""
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement
                      addListItem(responsibilities, setResponsibilities, input.value)
                      input.value = ""
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Преимущества */}
          <Card>
            <CardHeader>
              <CardTitle>Что мы предлагаем</CardTitle>
              <CardDescription>Преимущества и бонусы для стажера</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {benefits.map((benefit, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {benefit}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeListItem(benefits, setBenefits, index)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Добавить преимущество"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addListItem(benefits, setBenefits, e.currentTarget.value)
                        e.currentTarget.value = ""
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement
                      addListItem(benefits, setBenefits, input.value)
                      input.value = ""
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Контактная информация */}
          <Card>
            <CardHeader>
              <CardTitle>Контактная информация</CardTitle>
              <CardDescription>Контакты для связи с кандидатами</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="contactName">Контактное лицо *</Label>
                  <Input
                    id="contactName"
                    value={formData.contactName}
                    onChange={(e) => handleInputChange("contactName", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactEmail">Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactPhone">Телефон *</Label>
                  <Input
                    id="contactPhone"
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Кнопки действий */}
          <div className="flex justify-end space-x-4">
            <Link href="/admin/internships">
              <Button type="button" variant="outline">
                Отмена
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Сохранение..." : "Сохранить изменения"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
