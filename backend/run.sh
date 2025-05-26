#!/bin/bash

# Скрипт для запуска приложения

echo "🚀 Запуск UniInternships Backend..."

# Проверяем виртуальное окружение
if [[ "$VIRTUAL_ENV" == "" ]]; then
    echo "⚠️  Рекомендуется использовать виртуальное окружение"
    echo "Создайте его командой: python -m venv venv"
    echo "Активируйте: source venv/bin/activate (Linux/Mac) или venv\\Scripts\\activate (Windows)"
fi

# Устанавливаем зависимости
echo "📦 Установка зависимостей..."
pip install -r requirements.txt

# Проверяем .env файл
if [ ! -f .env ]; then
    echo "⚠️  Файл .env не найден!"
    echo "Создайте файл .env на основе .env.example"
    exit 1
fi

# Создаем директорию для загрузок
mkdir -p uploads

# Применяем миграции
echo "🗄️  Применение миграций..."
alembic upgrade head

# Создаем начальные данные
echo "🌱 Создание начальных данных..."
python create_initial_data.py

# Запускаем сервер
echo "🎯 Запуск сервера..."
echo "API будет доступно по адресу: http://localhost:8000"
echo "Документация: http://localhost:8000/docs"
echo ""
echo "Тестовые аккаунты:"
echo "👨‍💼 Админ: admin@university.edu / admin123"
echo "🎓 Студент: student@university.edu / student123"
echo ""

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
