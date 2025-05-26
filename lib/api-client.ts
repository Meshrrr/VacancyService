// Клиент для работы с API с обработкой ошибок

export interface ApiError {
  code: string
  message: string
  details?: any
  field?: string
  timestamp: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: {
    page?: number
    limit?: number
    total?: number
  }
}

class ApiClient {
  private baseUrl: string
  private defaultHeaders: Record<string, string>

  constructor(baseUrl = "/api") {
    this.baseUrl = baseUrl
    this.defaultHeaders = {
      "Content-Type": "application/json",
    }
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get("content-type")
    const isJson = contentType?.includes("application/json")

    let data: any
    try {
      data = isJson ? await response.json() : await response.text()
    } catch (error) {
      throw new Error("Ошибка парсинга ответа сервера")
    }

    if (!response.ok) {
      const apiError: ApiError = {
        code: data.code || `HTTP_${response.status}`,
        message: data.message || this.getDefaultErrorMessage(response.status),
        details: data.details,
        field: data.field,
        timestamp: new Date().toISOString(),
      }

      return {
        success: false,
        error: apiError,
      }
    }

    return {
      success: true,
      data: data.data || data,
      meta: data.meta,
    }
  }

  private getDefaultErrorMessage(status: number): string {
    switch (status) {
      case 400:
        return "Некорректный запрос. Проверьте введенные данные."
      case 401:
        return "Необходима авторизация для выполнения этого действия."
      case 403:
        return "У вас нет прав для выполнения этого действия."
      case 404:
        return "Запрашиваемый ресурс не найден."
      case 409:
        return "Конфликт данных. Возможно, ресурс уже существует."
      case 422:
        return "Ошибка валидации данных."
      case 429:
        return "Слишком много запросов. Попробуйте позже."
      case 500:
        return "Внутренняя ошибка сервера. Мы уже работаем над её исправлением."
      case 502:
        return "Сервер временно недоступен. Попробуйте позже."
      case 503:
        return "Сервис временно недоступен. Ведутся технические работы."
      default:
        return "Произошла неожиданная ошибка. Попробуйте позже."
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`

    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      return await this.handleResponse<T>(response)
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        return {
          success: false,
          error: {
            code: "NETWORK_ERROR",
            message: "Ошибка сети. Проверьте подключение к интернету.",
            timestamp: new Date().toISOString(),
          },
        }
      }

      return {
        success: false,
        error: {
          code: "UNKNOWN_ERROR",
          message: error instanceof Error ? error.message : "Неизвестная ошибка",
          timestamp: new Date().toISOString(),
        },
      }
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.baseUrl)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    return this.request<T>(url.pathname + url.search)
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    })
  }

  // Загрузка файлов
  async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append("file", file)

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value))
      })
    }

    return this.request<T>(endpoint, {
      method: "POST",
      body: formData,
      headers: {
        // Не устанавливаем Content-Type для FormData - браузер сделает это автоматически
      },
    })
  }

  setAuthToken(token: string) {
    this.defaultHeaders["Authorization"] = `Bearer ${token}`
  }

  removeAuthToken() {
    delete this.defaultHeaders["Authorization"]
  }
}

export const apiClient = new ApiClient()

// Типы для API endpoints
export interface Job {
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
}

export interface ApplicationForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  course: string
  gpa: string
  coverLetter: string
  resume: File
  portfolio?: File
}

// API методы
export const jobsApi = {
  getJobs: (params?: { search?: string; type?: string; department?: string; page?: number; limit?: number }) =>
    apiClient.get<Job[]>("/jobs", params),

  getJob: (id: string) => apiClient.get<Job>(`/jobs/${id}`),

  applyToJob: (jobId: string, application: ApplicationForm) =>
    apiClient.post<{ applicationId: string }>(`/jobs/${jobId}/apply`, application),
}

export const applicationsApi = {
  getApplications: (params?: { status?: string; page?: number; limit?: number }) =>
    apiClient.get<Application[]>("/applications", params),

  getApplication: (id: string) => apiClient.get<Application>(`/applications/${id}`),

  withdrawApplication: (id: string) => apiClient.delete(`/applications/${id}`),
}
