from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os
import logging
import numpy as np
import uuid
import asyncio
import soundfile as sf
from type import MusicGenerationRequest, MusicGenerationResponse, TaskStatusResponse
from model import AIModelHandler

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

AUDIO_DIR = "generated_music"

os.makedirs(AUDIO_DIR, exist_ok=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 정적 파일 서빙을 위한 설정
app.mount("/audio", StaticFiles(directory=AUDIO_DIR), name="audio")

model_handler = AIModelHandler()

tasks = {}

@app.post("/api/generate-music", response_model=MusicGenerationResponse)
async def generate_music(request: MusicGenerationRequest, background_tasks: BackgroundTasks):
    task_id = str(uuid.uuid4())
    tasks[task_id] = {"status": "pending", "progress": 0}
    background_tasks.add_task(generate_music_task, task_id, request.prompt, request.duration, request.num_generations)
    return MusicGenerationResponse(task_id=task_id)

@app.get("/api/task/{task_id}", response_model=TaskStatusResponse)
async def get_task_status(task_id: str):
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    task = tasks[task_id]
    return TaskStatusResponse(
        status=task["status"],
        message=task.get("message", ""),
        progress=task["progress"],
        file_url=task.get("file_url", "")
    )

@app.get("/download/{file_name}")
async def download_music(file_name: str):
    file_path = os.path.join(AUDIO_DIR, file_name)
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type="audio/wav", filename=file_name)
    raise HTTPException(status_code=404, detail="File not found")

async def generate_music_task(task_id: str, prompt: str, duration: int, num_generations: int):
    try:
        tasks[task_id]["status"] = "processing"
        combined_audio = np.array([])

        optimized_prompt = await model_handler.generate_optimized_prompt(prompt)
        logger.info(f"Optimized prompt: {optimized_prompt}")

        for i in range(num_generations):
            tasks[task_id]["progress"] = int((i / num_generations) * 100)
            varied_prompt = f"{optimized_prompt}, variation {i+1}"
            audio_segment = await model_handler.generate_music(varied_prompt, duration)
            audio_array = np.array(audio_segment.get_array_of_samples())
            combined_audio = np.concatenate([combined_audio, audio_array])
            await asyncio.sleep(0.1)

        file_name = f"generated_music_{task_id}.wav"
        file_path = os.path.join(AUDIO_DIR, file_name)
        os.makedirs(os.path.dirname(file_path), exist_ok=True)

        sf.write(file_path, combined_audio, model_handler.get_sampling_rate(), subtype='PCM_24')

        tasks[task_id]["status"] = "completed"
        tasks[task_id]["progress"] = 100
        tasks[task_id]["file_url"] = f"/audio/{file_name}"  # URL 경로 수정
        tasks[task_id]["message"] = f"Music generated successfully ({num_generations} variations)"

        logger.info(f"Music generated successfully: {file_path}")
    except Exception as e:
        logger.error(f"Error generating music: {str(e)}")
        tasks[task_id]["status"] = "failed"
        tasks[task_id]["message"] = f"Error generating music: {str(e)}"

@app.get("/")
async def root():
    return {"message": "Welcome to the Music Generation API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
