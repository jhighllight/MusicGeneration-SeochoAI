import os
from openai import OpenAI
import torch
import torchaudio
from transformers import AutoProcessor, MusicgenForConditionalGeneration
import numpy as np
import io
import soundfile as sf
from scipy.io import wavfile
import librosa
from pydantic import BaseModel, Field
from pydub import AudioSegment
from typing import Optional, Dict, List, Tuple
import logging
from type import MusicGenerationRequest, AIModelResult, GeneratedFile, TaskStatusResponse
from prompt import LIVE_STREAMER_MUSIC_PROMPT
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

class AIModelHandler:
    def __init__(self):
        self.openai_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        logger.info(f"Using device: {self.device}")
        self.processor = AutoProcessor.from_pretrained("facebook/musicgen-melody")
        self.model = MusicgenForConditionalGeneration.from_pretrained("facebook/musicgen-melody").to(self.device)
        self.sampling_rate = 32000  # MusicGen uses 32kHz sampling rate

    def _generate_optimized_prompt(self, free_input: str, structured_input: Optional[dict]) -> str:
        try:
            combined_input = f"Free-form description: {free_input}\n"

            if structured_input:
                combined_input += "Additional details:\n"
                for key, value in structured_input.items():
                    if value:
                        combined_input += f"- {key}: {value}\n"

            response = self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": LIVE_STREAMER_MUSIC_PROMPT},
                    {"role": "user", "content": combined_input}
                ],
                max_tokens=50,
                n=1,
                temperature=0.7,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Error in _generate_optimized_prompt: {str(e)}")
            return free_input  # 오류 시 원본 입력 반환

    async def generate_music(self, request: MusicGenerationRequest, melody_data: Optional[bytes] = None) -> AIModelResult: # struct.error: ushort format requires 0 <= number <= 65535
        try:
            optimized_prompt = self._generate_optimized_prompt(request.free_input, request.structured_input)
            logger.info(f"Optimized prompt: {optimized_prompt}")

            inputs = self.processor(
                text=[optimized_prompt],
                padding=True,
                return_tensors="pt",
            ).to(self.device)

            audio_values = self.model.generate(**inputs, max_new_tokens=256 * request.duration)

            audio_data = audio_values[0].cpu().numpy()
            audio_data = self._postprocess_audio(audio_data)

            byte_io = io.BytesIO()
            wavfile.write(byte_io, self.sampling_rate, audio_data)
            audio_bytes = byte_io.getvalue()
            
            return AIModelResult(audio_data=audio_bytes, optimized_prompt=optimized_prompt)
        except Exception as e:
            logger.error(f"Error in generate_music: {str(e)}", exc_info=True)
            return self._generate_fallback_audio(request.duration)

    def _preprocess_melody(self, melody_data: bytes) -> torch.Tensor:
        try:
            melody_np = np.frombuffer(melody_data, dtype=np.float32)
            melody_tensor = torch.from_numpy(melody_np)

            if self.sampling_rate != 32000:
                melody_tensor = torchaudio.functional.resample(melody_tensor, self.sampling_rate, 32000)

            # 모델 입력 형태로 변환
            melody_tensor = melody_tensor.unsqueeze(0)
            return melody_tensor
        except Exception as e:
            logger.error(f"Error preprocessing melody: {str(e)}")
            return torch.zeros(1, 1, 30 * 32000)

    def _postprocess_audio(self, audio_data: np.ndarray) -> np.ndarray:
        audio_data = audio_data / np.max(np.abs(audio_data))
        audio_data = (audio_data * 32767).astype(np.int16)
        
        return audio_data

    def _generate_fallback_audio(self, duration: int) -> AIModelResult:
        t = np.linspace(0, duration, int(self.sampling_rate * duration), False)
        audio_data = np.sin(440 * 2 * np.pi * t)
        audio_data = self._postprocess_audio(audio_data)
        byte_io = io.BytesIO()
        wavfile.write(byte_io, self.sampling_rate, audio_data)
        return AIModelResult(audio_data=byte_io.getvalue(), optimized_prompt="Fallback audio generated")

    def get_sampling_rate(self) -> int:
        return self.sampling_rate

    async def process_music_generation(self, free_input: str, duration: int = 10) -> Tuple[str, AudioSegment]:
        try:
            optimized_prompt = await self.generate_optimized_prompt(free_input)
            audio_segment = await self.generate_music(optimized_prompt, duration)
            
            return optimized_prompt, audio_segment
        except Exception as e:
            logger.error(f"Error in process_music_generation: {str(e)}")
            raise