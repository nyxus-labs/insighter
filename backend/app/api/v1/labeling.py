from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Union

router = APIRouter()

class Box(BaseModel):
    x: float
    y: float
    w: float
    h: float
    label: str

class AudioRegion(BaseModel):
    start: float
    end: float
    label: str

@router.post("/image")
def save_bbox(project_id: str, boxes: List[Box]):
    # Save to Supabase 'annotations' table
    return {"status": "saved", "count": len(boxes)}

@router.post("/video")
def save_video_frame(project_id: str, timestamp: float, boxes: List[Box]):
    return {"status": "saved"}

@router.post("/audio")
def save_audio_segment(project_id: str, regions: List[AudioRegion]):
    return {"status": "saved"}
