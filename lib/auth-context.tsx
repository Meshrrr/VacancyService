"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { apiClient } from "./api-client"

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: "student" | "admin"
  course?: string
  gpa?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  course: string
  gpa: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Проверяем токен при загрузке
    const token = localStorage.getItem("auth_token")
    if (token) {
      apiClient.setAuthToken(token)
      // Имитация проверки токена
      setTimeout(() => {
        const mockUser: User = {
          id: "1",
          email: "student@university.edu",
          firstName: "Иван",
          lastName: "Петров",
          role: "student",
          course: "3 курс бакалавриата",
          gpa: "4.5",
        }
        setUser(mockUser)
        setIsLoading(false)
      }, 1000)
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)

      // Имитация API запроса
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Проверяем учетные данные
      if (email === "admin@university.edu" && password === "admin123") {
        const adminUser: User = {
          id: "admin1",
          email: "admin@university.edu",
          firstName: "Анна",
          lastName: "Администратор",
          role: "admin",
        }
        const token = "mock_admin_jwt_token"
        localStorage.setItem("auth_token", token)
        apiClient.setAuthToken(token)
        setUser(adminUser)
        return { success: true }
      } else if (email === "student@university.edu" && password === "student123") {
        const studentUser: User = {
          id: "student1",
          email: "student@university.edu",
          firstName: "Иван",
          lastName: "Петров",
          role: "student",
          course: "3 курс бакалавриата",
          gpa: "4.5",
        }
        const token = "mock_student_jwt_token"
        localStorage.setItem("auth_token", token)
        apiClient.setAuthToken(token)
        setUser(studentUser)
        return { success: true }
      } else {
        return { success: false, error: "Неверный email или пароль" }
      }
    } catch (error) {
      return { success: false, error: "Ошибка сервера. Попробуйте позже." }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true)

      // Имитация API запроса
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Проверяем, не существует ли уже пользователь
      if (data.email === "admin@university.edu" || data.email === "student@university.edu") {
        return { success: false, error: "Пользователь с таким email уже существует" }
      }

      const newUser: User = {
        id: `user_${Date.now()}`,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: "student",
        course: data.course,
        gpa: data.gpa,
      }

      const token = `mock_jwt_token_${Date.now()}`
      localStorage.setItem("auth_token", token)
      apiClient.setAuthToken(token)
      setUser(newUser)

      return { success: true }
    } catch (error) {
      return { success: false, error: "Ошибка сервера. Попробуйте позже." }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    apiClient.removeAuthToken()
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
