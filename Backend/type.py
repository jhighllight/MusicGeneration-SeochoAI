from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum

class MusicGenerationRequest(BaseModel):
    prompt: str
    duration: int = 10
    num_generations: int

class MusicGenerationResponse(BaseModel):
    task_id: str

class TaskStatusResponse(BaseModel):
    status: str
    message: str = ""
    progress: int = 0
    file_url: str = ""