import os
from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, Form
from fastapi.responses import StreamingResponse
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

<<<<<<< HEAD
=======
        music_request = MusicGenerationRequest(
            free_input=free_input,
            duration=duration,
            repeat_count=repeat_count,
            structured_input=structured_input_dict
        )

        task_id = str(uuid.uuid4())
        background_tasks.add_task(generate_music_task, task_id, music_request, melody_file)
        return MusicGenerationResponse(task_id=task_id)
    except Exception as e:
        logger.error(f"Error in generate_music: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def generate_music_task(task_id: str, music_request: MusicGenerationRequest, melody_file: Optional[UploadFile]):
    try:
        tasks[task_id] = TaskStatusResponse(status="processing", message="Starting music generation", progress=0, files=[])
        
        melody_data = await melody_file.read() if melody_file else None
        result = await model_handler.generate_music(music_request, melody_data)
        
        file_name = f"generated_music_{task_id}.wav"
        file_path = os.path.join(temp_dir, file_name)
        with open(file_path, "wb") as f:
            f.write(result.audio_data)
        
        tasks[task_id] = TaskStatusResponse(
            status="completed",
            message="Music generated successfully",
            progress=100,
            files=[GeneratedFile(
                wav_file_name=file_name,
                wav_file_url=f"/api/stream/{task_id}",
                optimized_prompt=result.optimized_prompt
            )]
        )
    except asyncio.CancelledError:
        logger.info(f"Task {task_id} was cancelled")
        tasks[task_id] = TaskStatusResponse(status="cancelled", message="Task was cancelled", progress=0, files=[])
    except Exception as e:
        logger.error(f"Error in generate_music_task: {str(e)}")
        tasks[task_id] = TaskStatusResponse(status="failed", message=str(e), progress=0, files=[])

>>>>>>> 2fba818debdb19ba085308a870d719b38b5aa83f
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

@app.get("/api/download/{task_id}")
async def download_audio(task_id: str):
    file_path = os.path.join(temp_dir, f"generated_music_{task_id}.wav")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Audio not found")
    return StreamingResponse(
        open(file_path, "rb"),
        media_type="audio/wav",
        headers={"Content-Disposition": f"attachment; filename=generated_music_{task_id}.wav"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)