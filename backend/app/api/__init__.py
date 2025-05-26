from fastapi import APIRouter

api_router = APIRouter()

from .auth import router as auth_router
from .internships import router as internships_router
from .applications import router as applications_router
from .admin import router as admin_router
from .files import router as files_router
from .users import router as users_router

api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(internships_router, prefix="/internships", tags=["internships"])
api_router.include_router(applications_router, prefix="/applications", tags=["applications"])
api_router.include_router(admin_router, prefix="/admin", tags=["admin"])
api_router.include_router(files_router, prefix="/files", tags=["files"])
api_router.include_router(users_router, prefix="/users", tags=["users"])
