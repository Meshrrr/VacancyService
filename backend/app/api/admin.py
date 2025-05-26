from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func, desc

from ..database import get_db
from ..models.user import User
from ..models.internship import Internship
from ..models.application import Application
from ..models.campus import Campus
from ..models.department import Department
from ..schemas.application import ApplicationResponse, ApplicationStatusUpdate
from ..schemas.user import UserResponse
from ..schemas.internship import InternshipResponse
from ..auth.dependencies import require_admin

router = APIRouter()

@router.get("/applications", response_model=List[ApplicationResponse])
async def get_all_applications(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status_filter: Optional[str] = Query(None),
    internship_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Получить все заявки (только для админов)"""
    
    query = db.query(Application).options(
        joinedload(Application.user),
        joinedload(Application.internship),
        joinedload(Application.files)
    )
    
    # Фильтр по статусу
    if status_filter:
        query = query.filter(Application.status == status_filter)
    
    # Фильтр по стажировке
    if internship_id:
        query = query.filter(Application.internship_id == internship_id)
    
    # Поиск по имени студента или email
    if search:
        query = query.join(User).filter(
            or_(
                User.first_name.ilike(f"%{search}%"),
                User.last_name.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%")
            )
        )
    
    applications = query.order_by(Application.created_at.desc()).offset(skip).limit(limit).all()
    
    return applications

@router.put("/applications/{application_id}/status")
async def update_application_status(
    application_id: int,
    status_data: ApplicationStatusUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Обновить статус заявки (только для админов)"""
    
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Заявка не найдена"
        )
    
    # Обновляем статус
    application.status = status_data.status
    if status_data.feedback:
        application.feedback = status_data.feedback
    if status_data.interview_date:
        application.interview_date = status_data.interview_date
    if status_data.next_steps:
        application.next_steps = status_data.next_steps
    
    application.reviewed_by_id = current_user.id
    
    db.commit()
    db.refresh(application)
    
    # TODO: Отправить уведомление студенту
    
    return {"message": "Статус заявки обновлен", "application": application}

@router.get("/applications/{application_id}", response_model=ApplicationResponse)
async def get_application_admin(
    application_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Получить заявку для админа"""
    
    application = db.query(Application).options(
        joinedload(Application.user),
        joinedload(Application.internship),
        joinedload(Application.files),
        joinedload(Application.reviews)
    ).filter(Application.id == application_id).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Заявка не найдена"
        )
    
    return application

@router.get("/users", response_model=List[UserResponse])
async def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    role_filter: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Получить всех пользователей (только для админов)"""
    
    query = db.query(User)
    
    # Фильтр по роли
    if role_filter:
        query = query.filter(User.role == role_filter)
    
    # Поиск
    if search:
        query = query.filter(
            or_(
                User.first_name.ilike(f"%{search}%"),
                User.last_name.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%"),
                User.student_id.ilike(f"%{search}%")
            )
        )
    
    users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    
    return users

@router.get("/stats/dashboard")
async def get_admin_dashboard_stats(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Получить статистику для админ-панели"""
    
    # Статистика стажировок
    internship_stats = {
        "total": db.query(Internship).count(),
        "active": db.query(Internship).filter(Internship.status == "active").count(),
        "draft": db.query(Internship).filter(Internship.status == "draft").count(),
        "expired": db.query(Internship).filter(Internship.status == "expired").count(),
    }
    
    # Статистика заявок
    application_stats = {
        "total": db.query(Application).count(),
        "pending": db.query(Application).filter(Application.status == "pending").count(),
        "reviewed": db.query(Application).filter(Application.status == "reviewed").count(),
        "accepted": db.query(Application).filter(Application.status == "accepted").count(),
        "rejected": db.query(Application).filter(Application.status == "rejected").count(),
    }
    
    # Статистика пользователей
    user_stats = {
        "total": db.query(User).count(),
        "students": db.query(User).filter(User.role == "student").count(),
        "admins": db.query(User).filter(User.role == "admin").count(),
        "active": db.query(User).filter(User.is_active == True).count(),
    }
    
    # Топ стажировок по количеству заявок
    top_internships = db.query(
        Internship.title,
        func.count(Application.id).label("application_count")
    ).join(Application).group_by(Internship.id, Internship.title).order_by(
        desc("application_count")
    ).limit(5).all()
    
    # Статистика по корпусам
    campus_stats = db.query(
        Campus.name,
        func.count(Internship.id).label("internship_count")
    ).join(Internship).group_by(Campus.id, Campus.name).all()
    
    return {
        "internships": internship_stats,
        "applications": application_stats,
        "users": user_stats,
        "top_internships": [
            {"title": title, "applications": count} 
            for title, count in top_internships
        ],
        "campus_distribution": [
            {"campus": name, "internships": count}
            for name, count in campus_stats
        ]
    }

@router.get("/internships/{internship_id}/applications", response_model=List[ApplicationResponse])
async def get_internship_applications(
    internship_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Получить все заявки на конкретную стажировку"""
    
    internship = db.query(Internship).filter(Internship.id == internship_id).first()
    if not internship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Стажировка не найдена"
        )
    
    applications = db.query(Application).options(
        joinedload(Application.user),
        joinedload(Application.files)
    ).filter(Application.internship_id == internship_id).order_by(
        Application.created_at.desc()
    ).all()
    
    return applications

@router.post("/users/{user_id}/toggle-status")
async def toggle_user_status(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Активировать/деактивировать пользователя"""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден"
        )
    
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Нельзя изменить статус собственного аккаунта"
        )
    
    user.is_active = not user.is_active
    db.commit()
    
    status_text = "активирован" if user.is_active else "деактивирован"
    return {"message": f"Пользователь {status_text}"}
