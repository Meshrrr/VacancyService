"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: "student" | "teacher" | "admin"
  createdAt: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  role: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Демо пользователи
const DEMO_USERS = [
  {
    id: "1",
    email: "student@university.edu",
    password: "student123",
    firstName: "Иван",
    lastName: "Петров",
    role: "student" as const,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    email: "admin@university.edu",
    password: "admin123",
    firstName: "Анна",
    lastName: "Смирнова",
    role: "admin" as const,
    createdAt: new Date().toISOString(),
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  console.log("🔄 AuthProvider render:", { user, isLoading })

  // Вычисляемые значения
  const isAuthenticated = !!user
  const isAdmin = user?.role === "admin" || user?.role === "teacher"

  // Инициализация
  useEffect(() => {
    console.log("🚀 AuthProvider useEffect запущен")

    const initAuth = () => {
      try {
        // Инициализируем демо пользователей
        const storedUsers = localStorage.getItem("users")
        if (!storedUsers) {
          console.log("📝 Создаем демо пользователей")
          localStorage.setItem("users", JSON.stringify(DEMO_USERS))
        }

        // Проверяем сохраненную сессию
        const savedUser = localStorage.getItem("currentUser")
        console.log("💾 Проверяем сохраненного пользователя:", savedUser)

        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser)
            console.log("✅ Восстанавливаем пользователя:", parsedUser)
            setUser(parsedUser)
          } catch (error) {
            console.error("❌ Ошибка парсинга пользователя:", error)
            localStorage.removeItem("currentUser")
          }
        } else {
          console.log("👤 Нет сохраненного пользователя")
        }
      } catch (error) {
        console.error("❌ Ошибка инициализации:", error)
      } finally {
        setIsLoading(false)
        console.log("✅ Инициализация завершена")
      }
    }

    initAuth()
  }, [])

  // Отслеживаем изменения
  useEffect(() => {
    console.log("👤 Состояние изменилось:", {
      user: user ? `${user.firstName} ${user.lastName} (${user.role})` : null,
      isLoading,
      isAuthenticated,
      isAdmin,
    })
  }, [user, isLoading, isAuthenticated, isAdmin])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    console.log("🔐 Начинаем вход:", { email, password })
    setIsLoading(true)

    try {
      // Получаем пользователей
      const storedUsers = localStorage.getItem("users")
      const users = storedUsers ? JSON.parse(storedUsers) : DEMO_USERS

      console.log(
        "👥 Доступные пользователи:",
        users.map((u) => ({ email: u.email, role: u.role })),
      )

      // Ищем пользователя
      const foundUser = users.find(
        (u: any) => u.email.toLowerCase().trim() === email.toLowerCase().trim() && u.password === password,
      )

      console.log("🔍 Найденный пользователь:", foundUser)

      if (!foundUser) {
        console.log("❌ Пользователь не найден")
        setIsLoading(false)
        return { success: false, error: "Неверный email или пароль" }
      }

      // Создаем объект пользователя
      const userWithoutPassword = {
        id: foundUser.id,
        email: foundUser.email,
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        role: foundUser.role,
        createdAt: foundUser.createdAt,
      }

      console.log("💾 Сохраняем пользователя:", userWithoutPassword)

      // Сохраняем
      localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword))
      setUser(userWithoutPassword)
      setIsLoading(false)

      console.log("🎉 Вход успешен!")
      return { success: true }
    } catch (error) {
      console.error("❌ Ошибка входа:", error)
      setIsLoading(false)
      return { success: false, error: "Ошибка входа в систему" }
    }
  }

  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    console.log("📝 Регистрация:", userData)
    setIsLoading(true)

    try {
      const storedUsers = localStorage.getItem("users")
      const users = storedUsers ? JSON.parse(storedUsers) : DEMO_USERS

      // Проверяем существование
      const existingUser = users.find((u: any) => u.email.toLowerCase().trim() === userData.email.toLowerCase().trim())
      if (existingUser) {
        setIsLoading(false)
        return { success: false, error: "Пользователь с таким email уже существует" }
      }

      // Создаем нового пользователя
      const newUser = {
        id: Date.now().toString(),
        email: userData.email.toLowerCase().trim(),
        password: userData.password,
        firstName: userData.firstName.trim(),
        lastName: userData.lastName.trim(),
        role: userData.role as "student" | "teacher" | "admin",
        createdAt: new Date().toISOString(),
      }

      users.push(newUser)
      localStorage.setItem("users", JSON.stringify(users))

      // Автовход
      const userWithoutPassword = {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        createdAt: newUser.createdAt,
      }

      setUser(userWithoutPassword)
      localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword))
      setIsLoading(false)

      console.log("✅ Регистрация успешна!")
      return { success: true }
    } catch (error) {
      console.error("❌ Ошибка регистрации:", error)
      setIsLoading(false)
      return { success: false, error: "Ошибка регистрации" }
    }
  }

  const logout = () => {
    console.log("🚪 Выход из системы")
    setUser(null)
    localStorage.removeItem("currentUser")
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
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
