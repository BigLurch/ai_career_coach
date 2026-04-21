from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.cv import router as cv_router

from app.core.config import get_settings
from app.api.routes.health import router as health_router

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    debug=settings.app_debug,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(cv_router)


@app.get("/")
def root():
    return {
        "message": f"{settings.app_name} is running"
    }