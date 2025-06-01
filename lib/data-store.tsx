"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface Internship {
  id: string
  title: string
  department: string
  campus?: "IRIT-RTF" | "Novokoltcovsky" | "GUK"
  type?: "part-time" | "internship" | "research"
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
  createdBy?: string
  status?: "draft" | "active" | "expired"
}

export interface Application {
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
  applicantName: string
  applicantEmail: string
  coverLetter: string
  course?: string
  studentName?: string
  studentEmail?: string
}

export interface Activity {
  id: string
  type:
    | "application_submitted"
    | "application_accepted"
    | "application_rejected"
    | "internship_created"
    | "internship_updated"
  description: string
  timestamp: string
}

interface DataStoreContextType {
  internships: Internship[]
  applications: Application[]
  activities: Activity[]
  addInternship: (internship: Omit<Internship, "id" | "posted" | "applicants">) => void
  updateInternship: (id: string, internship: Omit<Internship, "id" | "posted" | "applicants">) => void
  addApplication: (application: Omit<Application, "id" | "appliedDate" | "lastUpdate">) => void
  updateApplicationStatus: (
    id: string,
    status: Application["status"],
    feedback?: string,
    interviewDate?: string,
    nextSteps?: string,
  ) => void
  getInternshipById: (id: string) => Internship | undefined
  getApplicationById: (id: string) => Application | undefined
  getApplicationsByJobId: (jobId: string) => Application[]
  getApplicationsByUser: (userEmail: string) => Application[]
  getApplicationsByStatus: (status: Application["status"]) => Application[]
  getRecentApplications: () => Application[]
  getStats: () => {
    totalInternships: number
    totalApplications: number
    pendingApplications: number
    acceptedApplications: number
    rejectedApplications: number
  }
}

const DataStoreContext = createContext<DataStoreContextType | undefined>(undefined)

// Начальные данные
const INITIAL_INTERNSHIP: Internship = {
  id: "1",
  title: "Frontend Developer Intern",
  department: "Информационные технологии",
  campus: "IRIT-RTF",
  type: "internship",
  location: "ИРИТ-РТФ, ауд. 405",
  duration: "3 месяца",
  salary: "25,000 ₽/месяц",
  description:
    "Присоединяйтесь к нашей команде разработки в качестве стажера Frontend Developer. Вы будете работать с современными технологиями React, TypeScript и Next.js, участвовать в создании пользовательских интерфейсов для веб-приложений университета.",
  requirements: [
    "Знание HTML, CSS, JavaScript",
    "Опыт работы с React",
    "Понимание принципов responsive design",
    "Знание Git",
    "Английский язык на уровне чтения технической документации",
  ],
  responsibilities: [
    "Разработка компонентов пользовательского интерфейса",
    "Участие в code review",
    "Тестирование и отладка приложений",
    "Работа с дизайн-системой",
    "Оптимизация производительности",
  ],
  benefits: [
    "Гибкий график работы",
    "Возможность удаленной работы",
    "Менторство от опытных разработчиков",
    "Доступ к корпоративным курсам",
    "Возможность трудоустройства после стажировки",
  ],
  posted: new Date().toISOString(),
  deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  applicants: 2,
  contact: {
    name: "Анна Смирнова",
    email: "a.smirnova@urfu.ru",
    phone: "+7 (343) 123-45-67",
  },
  status: "active",
}

const INITIAL_APPLICATIONS: Application[] = [
  {
    id: "1",
    jobId: "1",
    jobTitle: "Frontend Developer Intern",
    department: "Информационные технологии",
    appliedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: "pending",
    lastUpdate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    applicantName: "Мария Иванова",
    applicantEmail: "maria.ivanova@student.urfu.ru",
    studentName: "Мария Иванова",
    studentEmail: "maria.ivanova@student.urfu.ru",
    coverLetter:
      "Здравствуйте! Меня очень интересует позиция Frontend Developer Intern. У меня есть опыт работы с React и JavaScript, и я готова изучать новые технологии. Буду рада возможности применить свои знания на практике.",
    course: "3 курс бакалавриата",
  },
  {
    id: "2",
    jobId: "1",
    jobTitle: "Frontend Developer Intern",
    department: "Информационные технологии",
    appliedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: "reviewed",
    lastUpdate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    applicantName: "Алексей Петров",
    applicantEmail: "alexey.petrov@student.urfu.ru",
    studentName: "Алексей Петров",
    studentEmail: "alexey.petrov@student.urfu.ru",
    coverLetter:
      "Добрый день! Хочу подать заявку на стажировку Frontend Developer. Имею опыт создания веб-приложений на React, знаком с TypeScript и современными инструментами разработки.",
    course: "4 курс бакалавриата",
  },
]

const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: "1",
    type: "internship_created",
    description: "Создана стажировка Frontend Developer Intern",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    type: "application_submitted",
    description: "Мария Иванова подала заявку на Frontend Developer Intern",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    type: "application_submitted",
    description: "Алексей Петров подал заявку на Frontend Developer Intern",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export function DataStoreProvider({ children }: { children: ReactNode }) {
  const [internships, setInternships] = useState<Internship[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [activities, setActivities] = useState<Activity[]>([])

  // Загрузка данных из localStorage при инициализации
  useEffect(() => {
    const storedInternships = localStorage.getItem("internships")
    const storedApplications = localStorage.getItem("applications")
    const storedActivities = localStorage.getItem("activities")

    if (storedInternships) {
      setInternships(JSON.parse(storedInternships))
    } else {
      setInternships([INITIAL_INTERNSHIP])
      localStorage.setItem("internships", JSON.stringify([INITIAL_INTERNSHIP]))
    }

    if (storedApplications) {
      setApplications(JSON.parse(storedApplications))
    } else {
      setApplications(INITIAL_APPLICATIONS)
      localStorage.setItem("applications", JSON.stringify(INITIAL_APPLICATIONS))
    }

    if (storedActivities) {
      setActivities(JSON.parse(storedActivities))
    } else {
      setActivities(INITIAL_ACTIVITIES)
      localStorage.setItem("activities", JSON.stringify(INITIAL_ACTIVITIES))
    }
  }, [])

  // Сохранение в localStorage при изменении данных
  useEffect(() => {
    if (internships.length > 0) {
      localStorage.setItem("internships", JSON.stringify(internships))
    }
  }, [internships])

  useEffect(() => {
    if (applications.length > 0) {
      localStorage.setItem("applications", JSON.stringify(applications))
    }
  }, [applications])

  useEffect(() => {
    if (activities.length > 0) {
      localStorage.setItem("activities", JSON.stringify(activities))
    }
  }, [activities])

  const addActivity = (type: Activity["type"], description: string) => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      type,
      description,
      timestamp: new Date().toISOString(),
    }
    setActivities((prev) => [newActivity, ...prev])
  }

  const addInternship = (internshipData: Omit<Internship, "id" | "posted" | "applicants">) => {
    const newInternship: Internship = {
      ...internshipData,
      id: Date.now().toString(),
      posted: new Date().toISOString(),
      applicants: 0,
      status: internshipData.status || "active",
    }
    setInternships((prev) => [...prev, newInternship])
    addActivity("internship_created", `Создана стажировка ${newInternship.title}`)
  }

  const updateInternship = (id: string, internshipData: Omit<Internship, "id" | "posted" | "applicants">) => {
    setInternships((prev) =>
      prev.map((internship) =>
        internship.id === id
          ? {
              ...internshipData,
              id,
              posted: internship.posted,
              applicants: internship.applicants,
              status: internshipData.status || "active",
            }
          : internship,
      ),
    )
    addActivity("internship_updated", `Обновлена стажировка ${internshipData.title}`)
  }

  const addApplication = (applicationData: Omit<Application, "id" | "appliedDate" | "lastUpdate">) => {
    const newApplication: Application = {
      ...applicationData,
      id: Date.now().toString(),
      appliedDate: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      studentName: applicationData.applicantName,
      studentEmail: applicationData.applicantEmail,
    }

    setApplications((prev) => [...prev, newApplication])

    // Увеличиваем счетчик заявок для стажировки
    setInternships((prev) =>
      prev.map((internship) =>
        internship.id === applicationData.jobId ? { ...internship, applicants: internship.applicants + 1 } : internship,
      ),
    )

    addActivity("application_submitted", `${applicationData.applicantName} подал заявку на ${applicationData.jobTitle}`)
  }

  const updateApplicationStatus = (
    id: string,
    status: Application["status"],
    feedback?: string,
    interviewDate?: string,
    nextSteps?: string,
  ) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === id
          ? {
              ...app,
              status,
              lastUpdate: new Date().toISOString(),
              feedback: feedback || app.feedback,
              interviewDate: interviewDate || app.interviewDate,
              nextSteps: nextSteps || app.nextSteps,
            }
          : app,
      ),
    )

    // Добавляем активность
    const application = applications.find((app) => app.id === id)
    if (application) {
      if (status === "accepted") {
        addActivity("application_accepted", `Заявка ${application.applicantName} на ${application.jobTitle} принята`)
      } else if (status === "rejected") {
        addActivity("application_rejected", `Заявка ${application.applicantName} на ${application.jobTitle} отклонена`)
      }
    }
  }

  const getInternshipById = (id: string) => {
    return internships.find((internship) => internship.id === id)
  }

  const getApplicationById = (id: string) => {
    return applications.find((application) => application.id === id)
  }

  const getApplicationsByJobId = (jobId: string) => {
    return applications.filter((app) => app.jobId === jobId)
  }

  const getApplicationsByUser = (userEmail: string) => {
    return applications.filter((app) => app.applicantEmail === userEmail)
  }

  const getApplicationsByStatus = (status: Application["status"]) => {
    return applications.filter((app) => app.status === status)
  }

  const getRecentApplications = () => {
    return applications
      .filter((app) => app.status === "pending" || app.status === "reviewed")
      .sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime())
      .slice(0, 5)
  }

  const getStats = () => {
    return {
      totalInternships: internships.length,
      totalApplications: applications.length,
      pendingApplications: applications.filter((app) => app.status === "pending").length,
      acceptedApplications: applications.filter((app) => app.status === "accepted").length,
      rejectedApplications: applications.filter((app) => app.status === "rejected").length,
    }
  }

  const value: DataStoreContextType = {
    internships,
    applications,
    activities,
    addInternship,
    updateInternship,
    addApplication,
    updateApplicationStatus,
    getInternshipById,
    getApplicationById,
    getApplicationsByJobId,
    getApplicationsByUser,
    getApplicationsByStatus,
    getRecentApplications,
    getStats,
  }

  return <DataStoreContext.Provider value={value}>{children}</DataStoreContext.Provider>
}

export function useDataStore() {
  const context = useContext(DataStoreContext)
  if (context === undefined) {
    throw new Error("useDataStore must be used within a DataStoreProvider")
  }
  return context
}
