from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_

from ..database import get_db
from ..models.user import User
from ..models.internship import Internship
from ..models.campus import Campus
from ..models.department import Department
from ..models.tag import Tag
from ..schemas.internship import (
    InternshipCreate, InternshipUpdate, InternshipResponse, 
    InternshipListResponse, InternshipSearchParams
)
from ..auth.dependencies import get_current_user, require_admin

router = APIRouter()

@router.get("/", response_model=List[InternshipListResponse])
async def get_internships(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = Query(None),
    campus_id: Optional[int] = Query(None),
    department_id: Optional[int] = Query(None),
    is_active: bool = Query(True),
    db: Session = Depends(get_db)
):
    """Получить список стажировок с фильтрацией"""
    
    query = db.query(Internship).options(
        joinedload(Internship.campus),
        joinedload(Internship.department),
        joinedload(Internship.tags)
    )
    
    # Фильтр по активности
    if is_active:
        query = query.filter(Internship.status == "active")
    
    # Поиск по тексту
    if search:
        search_filter = or_(
            Internship.title.ilike(f"%{search}%"),
            Internship.description.ilike(f"%{search}%"),
            Internship.requirements.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    # Фильтр по корпусу
    if campus_id:
        query = query.filter(Internship.campus_id == campus_id)
    
    # Фильтр по кафедре
    if department_id:
        query = query.filter(Internship.department_id == department_id)
    
    # Сортировка по дате создания (новые первыми)
    query = query.order_by(Internship.created_at.desc())
    
    internships = query.offset(skip).limit(limit).all()
    
    return internships

@router.get("/{internship_id}", response_model=InternshipResponse)
async def get_internship(internship_id: int, db: Session = Depends(get_db)):
    """Получить детальную информацию о стажировке"""
    
    internship = db.query(Internship).options(
        joinedload(Internship.campus),
        joinedload(Internship.department),
        joinedload(Internship.tags),
        joinedload(Internship.applications)
    ).filter(Internship.id == internship_id).first()
    
    if not internship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Стажировка не найдена"
        )
    
    return internship

@router.post("/", response_model=InternshipResponse)
async def create_internship(
    internship_data: InternshipCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Создать новую стажировку (только для админов)"""
    
    # Проверяем существование корпуса и кафедры
    campus = db.query(Campus).filter(Campus.id == internship_data.campus_id).first()
    if not campus:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Корпус не найден"
        )
    
    department = db.query(Department).filter(Department.id == internship_data.department_id).first()
    if not department:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Кафедра не найдена"
        )
    
    # Создаем стажировку
    db_internship = Internship(
        **internship_data.dict(exclude={"tag_ids"}),
        created_by_id=current_user.id
    )
    
    db.add(db_internship)
    db.flush()  # Получаем ID без коммита
    
    # Добавляем теги
    if internship_data.tag_ids:
        tags = db.query(Tag).filter(Tag.id.in_(internship_data.tag_ids)).all()
        db_internship.tags = tags
    
    db.commit()
    db.refresh(db_internship)
    
    return db_internship

@router.put("/{internship_id}", response_model=InternshipResponse)
async def update_internship(
    internship_id: int,
    internship_data: InternshipUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Обновить стажировку (только для админов)"""
    
    internship = db.query(Internship).filter(Internship.id == internship_id).first()
    if not internship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Стажировка не найдена"
        )
    
    # Обновляем поля
    update_data = internship_data.dict(exclude_unset=True, exclude={"tag_ids"})
    for field, value in update_data.items():
        setattr(internship, field, value)
    
    # Обновляем теги
    if internship_data.tag_ids is not None:
        tags = db.query(Tag).filter(Tag.id.in_(internship_data.tag_ids)).all()
        internship.tags = tags
    
    db.commit()
    db.refresh(internship)
    
    return internship

@router.delete("/{internship_id}")
async def delete_internship(
    internship_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Удалить стажировку (только для админов)"""
    
    internship = db.query(Internship).filter(Internship.id == internship_id).first()
    if not internship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Стажировка не найдена"
        )
    
    # Проверяем, есть ли заявки
    if internship.applications:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Нельзя удалить стажировку с поданными заявками"
        )
    
    db.delete(internship)
    db.commit()
    
    return {"message": "Стажировка успешно удалена"}

@router.get("/campus/{campus_id}", response_model=List[InternshipListResponse])
async def get_internships_by_campus(
    campus_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Получить стажировки по корпусу"""
    
    campus = db.query(Campus).filter(Campus.id == campus_id).first()
    if not campus:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Корпус не найден"
        )
    
    internships = db.query(Internship).options(
        joinedload(Internship.campus),
        joinedload(Internship.department),
        joinedload(Internship.tags)
    ).filter(
        and_(
            Internship.campus_id == campus_id,
            Internship.status == "active"
        )
    ).order_by(Internship.created_at.desc()).offset(skip).limit(limit).all()
    
    return internships

@router.get("/stats/summary")
async def get_internships_stats(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Получить статистику по стажировкам (только для админов)"""
    
    total = db.query(Internship).count()
    active = db.query(Internship).filter(Internship.status == "active").count()
    draft = db.query(Internship).filter(Internship.status == "draft").count()
    expired = db.query(Internship).filter(Internship.status == "expired").count()
    
    return {
        "total": total,
        "active": active,
        "draft": draft,
        "expired": expired
    }
