from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, List

class MusicGenerationRequest(BaseModel):
    free_input: str
    duration: int = Field(..., ge=1, le=300)  # 1초에서 5분(300초) 사이로 제한
    repeat_count: int = Field(..., ge=1, le=10)
    structured_input: Optional[Dict[str, str]] = None

class MusicGenerationResponse(BaseModel):
    task_id: str

class GeneratedFile(BaseModel):
    wav_file_name: str
    wav_file_url: str
    optimized_prompt: str

class TaskStatusResponse(BaseModel):
    status: str
    message: str
    progress: int
    files: List[GeneratedFile]

class AIModelResult(BaseModel):
    audio_data: bytes
    optimized_prompt: str