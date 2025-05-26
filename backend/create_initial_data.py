"""
Скрипт для создания начальных данных в базе
"""
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import Base
from app.models.user import User
from app.models.campus import Campus
from app.models.department import Department
from app.models.tag import Tag
from app.models.internship import Internship
from app.auth.jwt import get_password_hash
from datetime import datetime, timedelta

def create_initial_data():
    """Создать начальные данные"""
    
    # Создаем таблицы
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Создаем корпуса
        campuses = [
            Campus(name="ИРИТ-РТФ", code="IRIT-RTF", address="ул. Мира, 19", description="Институт радиоэлектроники и информационных технологий"),
            Campus(name="Новокольцовский кампус", code="Novokoltcovsky", address="Новокольцовский тракт, 1", description="Современный кампус с лабораториями"),
            Campus(name="ГУК", code="GUK", address="ул. Ленина, 51", description="Главный учебный корпус")
        ]
        
        for campus in campuses:
            existing = db.query(Campus).filter(Campus.code == campus.code).first()
            if not existing:
                db.add(campus)
        
        db.commit()
        
        # Получаем созданные корпуса
        irit = db.query(Campus).filter(Campus.code == "IRIT-RTF").first()
        novo = db.query(Campus).filter(Campus.code == "Novokoltcovsky").first()
        guk = db.query(Campus).filter(Campus.code == "GUK").first()
        
        # Создаем кафедры
        departments = [
            Department(name="Кафедра информационных систем", campus_id=irit.id),
            Department(name="Кафедра программной инженерии", campus_id=irit.id),
            Department(name="Управление информационных технологий", campus_id=guk.id),
            Department(name="Кафедра материаловедения", campus_id=novo.id),
            Department(name="Кафедра физики", campus_id=novo.id),
            Department(name="Управление по связям с общественностью", campus_id=guk.id),
            Department(name="Отдел кадров", campus_id=guk.id),
        ]
        
        for dept in departments:
            existing = db.query(Department).filter(
                Department.name == dept.name, 
                Department.campus_id == dept.campus_id
            ).first()
            if not existing:
                db.add(dept)
        
        db.commit()
        
        # Создаем теги
        tags = [
            Tag(name="Python", category="programming"),
            Tag(name="JavaScript", category="programming"),
            Tag(name="React", category="programming"),
            Tag(name="Node.js", category="programming"),
            Tag(name="Machine Learning", category="technology"),
            Tag(name="Data Science", category="technology"),
            Tag(name="Web Development", category="technology"),
            Tag(name="Mobile Development", category="technology"),
            Tag(name="UI/UX Design", category="design"),
            Tag(name="Marketing", category="business"),
            Tag(name="SMM", category="business"),
            Tag(name="Project Management", category="business"),
            Tag(name="Research", category="academic"),
            Tag(name="Laboratory Work", category="academic"),
            Tag(name="Technical Writing", category="communication"),
        ]
        
        for tag in tags:
            existing = db.query(Tag).filter(Tag.name == tag.name).first()
            if not existing:
                db.add(tag)
        
        db.commit()
        
        # Создаем админа
        admin_email = "admin@university.edu"
        existing_admin = db.query(User).filter(User.email == admin_email).first()
        if not existing_admin:
            admin = User(
                email=admin_email,
                first_name="Анна",
                last_name="Администратор",
                hashed_password=get_password_hash("admin123"),
                role="admin",
                is_active=True
            )
            db.add(admin)
            db.commit()
            print(f"Создан админ: {admin_email} / admin123")
        
        # Создаем тестового студента
        student_email = "student@university.edu"
        existing_student = db.query(User).filter(User.email == student_email).first()
        if not existing_student:
            student = User(
                email=student_email,
                first_name="Иван",
                last_name="Петров",
                student_id="2021001234",
                course="3 курс бакалавриата",
                gpa=4.5,
                phone="+7 (999) 123-45-67",
                hashed_password=get_password_hash("student123"),
                role="student",
                is_active=True
            )
            db.add(student)
            db.commit()
            print(f"Создан студент: {student_email} / student123")
        
        # Создаем несколько тестовых стажировок
        admin = db.query(User).filter(User.email == admin_email).first()
        dept_is = db.query(Department).filter(Department.name == "Кафедра информационных систем").first()
        dept_it = db.query(Department).filter(Department.name == "Управление информационных технологий").first()
        
        if admin and dept_is and dept_it:
            internships = [
                Internship(
                    title="Стажер-разработчик в лаборатории ИИ",
                    description="Разработка алгоритмов машинного обучения для анализа данных, участие в исследовательских проектах.",
                    requirements="Python, машинное обучение, студент 3-4 курса",
                    responsibilities="Разработка алгоритмов, анализ данных, участие в исследованиях",
                    benefits="Гибкий график, опыт работы с ИИ, менторство",
                    location="ИРИТ-РТФ, ауд. 405",
                    duration="3 месяца",
                    salary="25000",
                    deadline=datetime.now() + timedelta(days=30),
                    contact_name="Профессор Иванов И.И.",
                    contact_email="ivanov@university.edu",
                    contact_phone="+7 (343) 123-45-67",
                    campus_id=irit.id,
                    department_id=dept_is.id,
                    created_by_id=admin.id,
                    status="active"
                ),
                Internship(
                    title="Стажер в IT-отделе",
                    description="Поддержка внутренних систем университета, разработка веб-приложений.",
                    requirements="JavaScript, React, Node.js, опыт веб-разработки",
                    responsibilities="Поддержка систем, разработка веб-приложений, тестирование",
                    benefits="Работа с современными технологиями, команда профессионалов",
                    location="ГУК, корпус А, каб. 301",
                    duration="4 месяца",
                    salary="20000",
                    deadline=datetime.now() + timedelta(days=20),
                    contact_name="Петрова А.В.",
                    contact_email="petrova@university.edu",
                    contact_phone="+7 (343) 234-56-78",
                    campus_id=guk.id,
                    department_id=dept_it.id,
                    created_by_id=admin.id,
                    status="active"
                )
            ]
            
            for internship in internships:
                existing = db.query(Internship).filter(Internship.title == internship.title).first()
                if not existing:
                    db.add(internship)
            
            db.commit()
        
        print("Начальные данные успешно созданы!")
        
    except Exception as e:
        print(f"Ошибка при создании данных: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_initial_data()
