import os
from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, Form
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, Dict
import json
import uuid
import logging
import asyncio
import tempfile
import shutil
from type import MusicGenerationRequest, MusicGenerationResponse, TaskStatusResponse, GeneratedFile
from model import AIModelHandler

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(debug=True)
model_handler = AIModelHandler()
tasks: Dict[str, TaskStatusResponse] = {}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

temp_dir = tempfile.mkdtemp()

@app.on_event("shutdown")
async def shutdown_event():
    shutil.rmtree(temp_dir)

@app.post("/api/generate-music", response_model=MusicGenerationResponse)
async def generate_music(
    background_tasks: BackgroundTasks,
    free_input: str = Form(...),
    duration: int = Form(...),
    repeat_count: int = Form(...),
    structured_input: Optional[str] = Form(None),
    melody_file: Optional[UploadFile] = None
):
    try:
        structured_input_dict = json.loads(structured_input) if structured_input else None

        task_id = str(uuid.uuid4())
        background_tasks.add_task(generate_music_task, task_id, free_input, structured_input_dict, duration, repeat_count, melody_file)
        return MusicGenerationResponse(task_id=task_id)
    except Exception as e:
        logger.error(f"Error in generate_music: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def generate_music_task(task_id: str, free_input: str, structured_input: Optional[dict], duration: int, repeat_count: int, melody_file: Optional[UploadFile]):
    try:
        tasks[task_id] = TaskStatusResponse(status="processing", message="Starting music generation", progress=0, files=[])
        
        melody_data = await melody_file.read() if melody_file else None
        optimized_prompt, audio_segment = await model_handler.process_music_generation(
            free_input=free_input,
            structured_input=structured_input,
            duration=duration,
            repeat_count=repeat_count
        )
        
        file_name = f"generated_music_{task_id}.wav"
        file_path = os.path.join(temp_dir, file_name)
        audio_segment.export(file_path, format="wav")
        
        tasks[task_id] = TaskStatusResponse(
            status="completed",
            message="Music generated successfully",
            progress=100,
            files=[GeneratedFile(
                wav_file_name=file_name,
                wav_file_url=f"/api/stream/{task_id}",
                optimized_prompt=optimized_prompt
            )]
        )
    except asyncio.CancelledError:
        logger.info(f"Task {task_id} was cancelled")
        tasks[task_id] = TaskStatusResponse(status="cancelled", message="Task was cancelled", progress=0, files=[])
    except Exception as e:
        logger.error(f"Error in generate_music_task: {str(e)}")
        tasks[task_id] = TaskStatusResponse(status="failed", message=str(e), progress=0, files=[])

@app.get("/api/task/{task_id}", response_model=TaskStatusResponse)
async def get_task_status(task_id: str):
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    return tasks[task_id]

@app.get("/api/stream/{task_id}")
async def stream_audio(task_id: str):
    file_path = os.path.join(temp_dir, f"generated_music_{task_id}.wav")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Audio not found")
    return StreamingResponse(open(file_path, "rb"), media_type="audio/wav")

@app.get("/api/download/{file_name}")
async def download_audio(file_name: str):
    file_path = os.path.join(temp_dir, file_name)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Audio not found")
    return FileResponse(file_path, media_type="audio/wav", filename=file_name)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)