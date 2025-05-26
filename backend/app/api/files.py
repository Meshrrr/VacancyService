from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os

from ..database import get_db
from ..models.user import User
from ..models.file import FileModel
from ..auth.dependencies import get_current_user, require_admin
from ..config import settings

router = APIRouter()

@router.get("/{file_id}")
async def download_file(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Скачать файл"""
    
    file_record = db.query(FileModel).filter(FileModel.id == file_id).first()
    if not file_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Файл не найден"
        )
    
    # Проверяем права доступа
    if current_user.role != "admin":
        # Студент может скачивать только свои файлы
        if file_record.uploaded_by_id != current_user.id:
            # Или файлы из своих заявок
            if not file_record.application or file_record.application.user_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Нет прав для скачивания этого файла"
                )
    
    # Проверяем существование файла
    file_path = os.path.join(settings.UPLOAD_DIR, file_record.file_path)
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Файл не найден на сервере"
        )
    
    return FileResponse(
        path=file_path,
        filename=file_record.filename,
        media_type=file_record.content_type
    )

@router.delete("/{file_id}")
async def delete_file(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Удалить файл"""
    
    file_record = db.query(FileModel).filter(FileModel.id == file_id).first()
    if not file_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Файл не найден"
        )
    
    # Проверяем права доступа
    if current_user.role != "admin" and file_record.uploaded_by_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Нет прав для удаления этого файла"
        )
    
    # Удаляем файл с диска
    file_path = os.path.join(settings.UPLOAD_DIR, file_record.file_path)
    if os.path.exists(file_path):
        os.remove(file_path)
    
    # Удаляем запись из БД
    db.delete(file_record)
    db.commit()
    
    return {"message": "Файл успешно удален"}

@router.get("/application/{application_id}")
async def get_application_files(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получить список файлов заявки"""
    
    files = db.query(FileModel).filter(FileModel.application_id == application_id).all()
    
    # Проверяем права доступа к заявке
    if files and current_user.role != "admin":
        application = files[0].application
        if application.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Нет прав для просмотра файлов этой заявки"
            )
    
    return [
        {
            "id": file.id,
            "filename": file.filename,
            "file_type": file.file_type,
            "file_size": file.file_size,
            "uploaded_at": file.uploaded_at
        }
        for file in files
    ]
