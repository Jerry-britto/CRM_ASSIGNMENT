from fastapi import FastAPI, Depends, HTTPException
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

# Import database and models configuration
from app.database import engine, Base, get_db
import app.models  # Registers models to Base

# Import router and utilities
from app.routers import router as ticket_router
from app.utils.exceptions import register_exception_handlers
from app.utils.logger import logger

# Create SQLite database tables on startup
logger.info("Initializing SQLite database tables...")
Base.metadata.create_all(bind=engine)
logger.info("Database tables initialized successfully.")

app = FastAPI(
    title="CRM Ticket Management System",
    description="Backend API for customer ticket and notes management"
)

# Register custom global exceptions and handlers
register_exception_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the modular ticket router
app.include_router(ticket_router)

@app.get("/")
def read_root():
    """
    Root endpoint to verify basic server functionality.
    """
    return {
        "message": "Welcome to the CRM Ticket System API!",
        "status": "active",
        "database": "sqlite",
        "docs_url": "/docs"
    }


@app.get("/db-status")
def check_db_status(db: Session = Depends(get_db)):
    """
    Diagnostic endpoint to test and verify the SQLite database connection.
    Executes a simple raw select query against the database.
    """
    try:
        db.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "message": "SQLite connection and initialization completed successfully!"
        }
    except Exception as e:
        logger.critical(f"Database diagnostics failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Database connection failed: {str(e)}"
        )


if __name__ == "__main__":
    logger.info("Starting development server...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
