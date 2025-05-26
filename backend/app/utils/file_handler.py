import os
import uuid
from typing import Optional
from fastapi import UploadFile
import aiofiles

from ..config import settings

async def save_uploaded_file(file: UploadFile, subfolder: str = "") -> str:
    """Сохранить загруженный файл и вернуть путь"""
    
    # Создаем уникальное имя файла
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    
    # Создаем путь для сохранения
    save_dir = os.path.join(settings.UPLOAD_DIR, subfolder)
    os.makedirs(save_dir, exist_ok=True)
    
    file_path = os.path.join(save_dir, unique_filename)
    relative_path = os.path.join(subfolder, unique_filename)
    
    # Сохраняем файл
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    return relative_path

def delete_file(file_path: str) -> bool:
    """Удалить файл с диска"""
    full_path = os.path.join(settings.UPLOAD_DIR, file_path)
    try:
        if os.path.exists(full_path):
            os.remove(full_path)
            return True
    except Exception:
        pass
    return False

def get_file_size(file_path: str) -> Optional[int]:
    """Получить размер файла"""
    full_path = os.path.join(settings.UPLOAD_DIR, file_path)
    try:
        return os.path.getsize(full_path)
    except Exception:
        return None
