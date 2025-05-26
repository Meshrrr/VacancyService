from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_

from ..database import get_db
from ..models.user import User
from ..models.internship import Internship
from ..models.application import Application
from ..models.file import FileModel
from ..schemas.application import (
    ApplicationCreate, ApplicationUpdate, ApplicationResponse,
    ApplicationListResponse, ApplicationStatusUpdate
)
from ..auth.dependencies import get_current_user, require_admin
from ..utils.file_handler import save_uploaded_file

router = APIRouter()

@router.get("/", response_model=List[ApplicationListResponse])
async def get_my_applications(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status_filter: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получить заявки текущего пользователя"""
    
    query = db.query(Application).options(
        joinedload(Application.internship),
        joinedload(Application.files)
    ).filter(Application.user_id == current_user.id)
    
    if status_filter:
        query = query.filter(Application.status == status_filter)
    
    applications = query.order_by(Application.created_at.desc()).offset(skip).limit(limit).all()
    
    return applications

@router.get("/{application_id}", response_model=ApplicationResponse)
async def get_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получить детальную информацию о заявке"""
    
    application = db.query(Application).options(
        joinedload(Application.internship),
        joinedload(Application.user),
        joinedload(Application.files),
        joinedload(Application.reviews)
    ).filter(Application.id == application_id).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Заявка не найдена"
        )
    
    # Проверяем права доступа
    if current_user.role != "admin" and application.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Нет прав для просмотра этой заявки"
        )
    
    return application

@router.post("/", response_model=ApplicationResponse)
async def create_application(
    application_data: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Подать заявку на стажировку"""
    
    # Проверяем существование стажировки
    internship = db.query(Internship).filter(Internship.id == application_data.internship_id).first()
    if not internship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Стажировка не найдена"
        )
    
    if internship.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Стажировка неактивна"
        )
    
    # Проверяем, не подавал ли пользователь уже заявку
    existing_application = db.query(Application).filter(
        and_(
            Application.user_id == current_user.id,
            Application.internship_id == application_data.internship_id
        )
    ).first()
    
    if existing_application:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Вы уже подали заявку на эту стажировку"
        )
    
    # Создаем заявку
    db_application = Application(
        **application_data.dict(),
        user_id=current_user.id,
        status="pending"
    )
    
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    
    return db_application

@router.put("/{application_id}", response_model=ApplicationResponse)
async def update_application(
    application_id: int,
    application_data: ApplicationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Обновить заявку (только если статус pending)"""
    
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Заявка не найдена"
        )
    
    # Проверяем права
    if application.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Нет прав для редактирования этой заявки"
        )
    
    if application.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Можно редактировать только заявки со статусом 'На рассмотрении'"
        )
    
    # Обновляем поля
    update_data = application_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(application, field, value)
    
    db.commit()
    db.refresh(application)
    
    return application

@router.delete("/{application_id}")
async def withdraw_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Отозвать заявку"""
    
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Заявка не найдена"
        )
    
    # Проверяем права
    if application.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Нет прав для отзыва этой заявки"
        )
    
    if application.status in ["accepted", "rejected"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Нельзя отозвать заявку с финальным статусом"
        )
    
    db.delete(application)
    db.commit()
    
    return {"message": "Заявка успешно отозвана"}

@router.post("/{application_id}/files")
async def upload_application_file(
    application_id: int,
    file: UploadFile = File(...),
    file_type: str = Query(..., regex="^(resume|portfolio|cover_letter)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Загрузить файл к заявке"""
    
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Заявка не найдена"
        )
    
    if application.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Нет прав для загрузки файлов к этой заявке"
        )
    
    # Проверяем тип файла
    allowed_types = ["application/pdf", "application/msword", 
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Поддерживаются только файлы PDF, DOC, DOCX"
        )
    
    # Проверяем размер файла (5MB)
    if file.size > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Размер файла не должен превышать 5MB"
        )
    
    # Сохраняем файл
    file_path = await save_uploaded_file(file, f"applications/{application_id}")
    
    # Создаем запись в БД
    db_file = FileModel(
        filename=file.filename,
        file_path=file_path,
        file_type=file_type,
        content_type=file.content_type,
        file_size=file.size,
        application_id=application_id,
        uploaded_by_id=current_user.id
    )
    
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    
    return {"message": "Файл успешно загружен", "file_id": db_file.id}

@router.get("/stats/my")
async def get_my_application_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получить статистику заявок пользователя"""
    
    total = db.query(Application).filter(Application.user_id == current_user.id).count()
    pending = db.query(Application).filter(
        and_(Application.user_id == current_user.id, Application.status == "pending")
    ).count()
    reviewed = db.query(Application).filter(
        and_(Application.user_id == current_user.id, Application.status == "reviewed")
    ).count()
    accepted = db.query(Application).filter(
        and_(Application.user_id == current_user.id, Application.status == "accepted")
    ).count()
    rejected = db.query(Application).filter(
        and_(Application.user_id == current_user.id, Application.status == "rejected")
    ).count()
    
    return {
        "total": total,
        "pending": pending,
        "reviewed": reviewed,
        "accepted": accepted,
        "rejected": rejected
    }
