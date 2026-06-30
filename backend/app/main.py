import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta

app = FastAPI(
    title="DeadlinePilot AI API",
    description="Backend API for DeadlinePilot AI, providing predictive deadline management and project analytics.",
    version="1.0.0"
)

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific frontend origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models
class Deadline(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    due_date: datetime
    status: str  # pending, completed, overdue
    confidence_score: float  # AI prediction confidence (0.0 to 1.0)
    risk_level: str  # low, medium, high

# Mock Data
MOCK_DEADLINES = [
    Deadline(
        id="1",
        title="Database Migration",
        description="Migrate legacy user records to Supabase PostgreSQL.",
        due_date=datetime.now() + timedelta(days=5),
        status="pending",
        confidence_score=0.92,
        risk_level="low"
    ),
    Deadline(
        id="2",
        title="Stripe Integration",
        description="Implement payment flows and subscription plans.",
        due_date=datetime.now() + timedelta(days=12),
        status="pending",
        confidence_score=0.78,
        risk_level="medium"
    ),
    Deadline(
        id="3",
        title="AI Pilot Feature Release",
        description="Deploy predictive scheduling algorithm to production.",
        due_date=datetime.now() + timedelta(days=20),
        status="pending",
        confidence_score=0.45,
        risk_level="high"
    )
]

@app.get("/")
def read_root():
    return {
        "message": "Welcome to DeadlinePilot AI API!",
        "status": "online",
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/deadlines", response_model=List[Deadline])
def get_deadlines():
    """
    Retrieve all project deadlines with AI prediction risk and confidence scores.
    """
    return MOCK_DEADLINES

@app.post("/api/deadlines", response_model=Deadline)
def create_deadline(deadline: Deadline):
    """
    Create a new deadline and calculate risk/confidence.
    """
    MOCK_DEADLINES.append(deadline)
    return deadline
