from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Data Entry 123 - Student Data Entry API")

# CORS middleware to allow React frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase configuration
SUPABASE_URL = (os.getenv("SUPABASE_URL") or "").strip()
SUPABASE_KEY = (os.getenv("SUPABASE_KEY") or "").strip()

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Please set SUPABASE_URL and SUPABASE_KEY environment variables")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


class StudentCreate(BaseModel):
    name: str
    father_name: str
    email: EmailStr


class StudentResponse(BaseModel):
    id: int
    name: str
    father_name: str
    email: str
    created_at: str


@app.get("/")
def read_root():
    return {"message": "Student Data Entry API is running"}


@app.post("/api/students", response_model=StudentResponse)
async def create_student(student: StudentCreate):
    try:
        # Insert student data into Supabase
        response = supabase.table("students").insert({
            "name": student.name,
            "father_name": student.father_name,
            "email": student.email
        }).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create student")
        
        created_student = response.data[0]
        return StudentResponse(
            id=created_student["id"],
            name=created_student["name"],
            father_name=created_student["father_name"],
            email=created_student["email"],
            created_at=created_student.get("created_at", "")
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/students", response_model=list[StudentResponse])
async def get_students():
    try:
        response = supabase.table("students").select("*").order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
