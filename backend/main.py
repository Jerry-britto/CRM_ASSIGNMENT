from fastapi import FastAPI, Depends, HTTPException
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import engine, Base, get_db
import app.models

# Create SQLite database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    """
    Root endpoint to verify basic server functionality.
    """
    return {"message": "Hello World", "status": "active", "database": "sqlite"}


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
        raise HTTPException(
            status_code=500,
            detail=f"Database connection failed: {str(e)}"
        )


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

