from fastapi import FastAPI, File, UploadFile, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import shutil
from dotenv import load_dotenv

from cosmos_client import analyze_video_threat

load_dotenv()

app = FastAPI(title="Cyber-to-Physical Threat Detector API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class AssessmentResponse(BaseModel):
    filename: str
    assessment: str

@app.post("/api/analyze", response_model=AssessmentResponse)
async def analyze_video(file: UploadFile = File(...)):
    # Save the file temporarily
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    api_key = os.getenv("RUNPOD_API_KEY", "")
    if not api_key:
        return {"filename": file.filename, "assessment": "Error: RUNPOD_API_KEY environment variable is not set."}

    # Analyze the fast/temp file using cosmos client
    result = analyze_video_threat(file_path, api_key)
    
    # We could delete the file here if needed, but for the hackathon we can keep it inside uploads/
    
    return {"filename": file.filename, "assessment": result}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
