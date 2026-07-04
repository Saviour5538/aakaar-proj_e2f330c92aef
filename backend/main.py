import os
from datetime import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session

from backend.routes.auth import router as auth_router
from backend.routes.matches import router as matches_router
from backend.routes.stats import router as stats_router
from database.config import Base, get_db_url

# Database engine and session
engine = None
SessionLocal = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global engine, SessionLocal
    try:
        # Create engine and tables
        db_url = get_db_url()
        engine = create_engine(db_url)
        # Ensure pgvector extension is created before tables
        with engine.connect() as conn:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
            conn.commit()
        Base.metadata.create_all(bind=engine)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        print("Database initialized successfully")
    except Exception as e:
        raise RuntimeError(f"Database initialization failed: {str(e)}")
    
    yield
    
    # Shutdown
    if engine:
        engine.dispose()

# Initialize FastAPI app with lifespan
app = FastAPI(
    title="TicTacToe API",
    description="API for TicTacToe game backend",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db() -> Session:
    if SessionLocal is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Include routers
app.include_router(auth_router, prefix="/api")
app.include_router(matches_router, prefix="/api")
app.include_router(stats_router, prefix="/api")

# Global exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}