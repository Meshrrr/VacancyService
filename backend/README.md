# UniInternships Backend

FastAPI backend для платформы поиска стажировок в университете.

## 🚀 Быстрый старт

### Локальная разработка

1. **Клонируйте репозиторий и перейдите в папку backend**
\`\`\`bash
cd backend
\`\`\`

2. **Создайте виртуальное окружение**
\`\`\`bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# или
venv\Scripts\activate     # Windows
\`\`\`

3. **Установите зависимости**
\`\`\`bash
pip install -r requirements.txt
\`\`\`

4. **Настройте переменные окружения**
\`\`\`bash
cp .env.example .env
# Отредактируйте .env файл с вашими настройками
\`\`\`

5. **Запустите PostgreSQL**
\`\`\`bash
# Используя Docker
docker run --name postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=uni_internships -p 5432:5432 -d postgres:15

# Или используйте локальную установку PostgreSQL
\`\`\`

6. **Примените миграции и создайте начальные данные**
\`\`\`bash
alembic upgrade head
python create_initial_data.py
\`\`\`

7. **Запустите сервер**
\`\`\`bash
uvicorn app.main:app --reload
\`\`\`

### Docker (рекомендуется)

\`\`\`bash
docker-compose up --build
\`\`\`

## 📚 API Документация

После запуска сервера документация доступна по адресам:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔐 Тестовые аккаунты

- **Админ**: `admin@university.edu` / `admin123`
- **Студент**: `student@university.edu` / `student123`

## 🏗️ Архитектура

### Структура проекта
\`\`\`
backend/
├── app/
│   ├── api/           # API endpoints
│   ├── auth/          # Аутентификация
│   ├── models/        # SQLAlchemy модели
│   ├── schemas/       # Pydantic схемы
│   ├── utils/         # Утилиты
│   ├── config.py      # Конфигурация
│   ├── database.py    # Подключение к БД
│   └── main.py        # FastAPI приложение
├── alembic/           # Миграции БД
├── uploads/           # Загруженные файлы
└── requirements.txt   # Зависимости
\`\`\`

### База данных (12 сущностей)

1. **User** - пользователи (студенты/админы)
2. **Campus** - корпуса университета
3. **Department** - кафедры/отделы
4. **Tag** - теги/навыки
5. **Internship** - стажировки
6. **Application** - заявки студентов
7. **File** - загруженные файлы
8. **Notification** - уведомления
9. **Review** - отзывы на заявки
10. **InternshipTag** - связь стажировок и тегов
11. **UserTag** - навыки пользователей

## 🔧 API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Текущий пользователь
- `POST /api/auth/refresh` - Обновление токена

### Стажировки
- `GET /api/internships/` - Список стажировок
- `GET /api/internships/{id}` - Детали стажировки
- `POST /api/internships/` - Создать стажировку (админ)
- `PUT /api/internships/{id}` - Обновить стажировку (админ)
- `DELETE /api/internships/{id}` - Удалить стажировку (админ)

### Заявки
- `GET /api/applications/` - Мои заявки
- `GET /api/applications/{id}` - Детали заявки
- `POST /api/applications/` - Подать заявку
- `PUT /api/applications/{id}` - Обновить заявку
- `DELETE /api/applications/{id}` - Отозвать заявку
- `POST /api/applications/{id}/files` - Загрузить файл

### Админ-панель
- `GET /api/admin/applications` - Все заявки
- `PUT /api/admin/applications/{id}/status` - Изменить статус
- `GET /api/admin/users` - Все пользователи
- `GET /api/admin/stats/dashboard` - Статистика

### Файлы
- `GET /api/files/{id}` - Скачать файл
- `DELETE /api/files/{id}` - Удалить файл

## 🛠️ Разработка

### Создание миграции
\`\`\`bash
alembic revision --autogenerate -m "Описание изменений"
alembic upgrade head
\`\`\`

### Тестирование
\`\`\`bash
pytest
\`\`\`

### Линтинг
\`\`\`bash
black app/
isort app/
flake8 app/
\`\`\`

## 🚀 Деплой

### Production настройки
1. Измените `SECRET_KEY` в .env
2. Настройте PostgreSQL
3. Настройте CORS для фронтенда
4. Используйте HTTPS
5. Настройте логирование

### Переменные окружения
\`\`\`env
DATABASE_URL=postgresql://user:password@localhost/dbname
SECRET_KEY=your-super-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30
UPLOAD_DIR=./uploads
CORS_ORIGINS=["http://localhost:3000"]
\`\`\`

## 📝 Лицензия

MIT License
\`\`\`

## ✅ **Полноценный FastAPI Backend готов!**

### 🎯 **Что реализовано:**

1. **🔐 JWT Аутентификация** - регистрация, вход, защищенные роуты
2. **📊 База данных** - 12 сущностей с отношениями
3. **🚀 API Endpoints** - полный CRUD для всех операций
4. **📁 Загрузка файлов** - резюме, портфолио с валидацией
5. **👨‍💼 Админ-панель** - управление заявками и статистика
6. **🔍 Поиск и фильтрация** - по корпусам, кафедрам, тексту
7. **📈 Статистика** - дашборд для админов
8. **🐳 Docker** - готовая конфигурация для деплоя

### 🚀 **Запуск:**
\`\`\`bash
cd backend
docker-compose up --build
\`\`\`

**API доступно:** http://localhost:8000/docs

Теперь нужно обновить frontend для работы с реальным API!
