import os
import logging
from dotenv import load_dotenv
import torch
from transformers import AutoProcessor, MusicgenForConditionalGeneration
import numpy as np
from pydub import AudioSegment
from typing import Optional, Tuple
from prompt import LIVE_STREAMER_MUSIC_PROMPT
from openai import OpenAI
import asyncio

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AIModelHandler:
    def __init__(self):
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        if not self.openai_api_key:
            raise ValueError("OPENAI_API_KEY is not set in the environment variables")
        
        self.client = OpenAI(api_key=self.openai_api_key)
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        logger.info(f"Using device: {self.device}")

        self.processor = AutoProcessor.from_pretrained("facebook/musicgen-small")
        self.model = MusicgenForConditionalGeneration.from_pretrained("facebook/musicgen-small").to(self.device)

        self.sampling_rate = self.model.config.audio_encoder.sampling_rate
        logger.info(f"Model initialized with sampling rate: {self.sampling_rate}")

    async def generate_optimized_prompt(self, free_input: str, structured_input: Optional[dict]) -> str:
        try:
            combined_input = f"Free-form description: {free_input}\n"
            if structured_input:
                combined_input += "Additional details:\n"
                for key, value in structured_input.items():
                    if value:
                        combined_input += f"- {key}: {value}\n"

            response = await asyncio.to_thread(
                self.client.chat.completions.create,
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "Generate a music description"},
                    {"role": "user", "content": LIVE_STREAMER_MUSIC_PROMPT.format(user_input=combined_input)}
                ],
                max_tokens=50,
                n=1,
                temperature=0.7,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Error in generate_optimized_prompt: {str(e)}")
            return free_input  # 오류 시 원본 입력 반환

    async def generate_music(self, prompt: str, duration: int = 10) -> AudioSegment:
        try:
            inputs = self.processor(
                text=[prompt],
                padding=True,
                return_tensors="pt",
            ).to(self.device)

            # Calculate the number of tokens needed for the desired duration
            tokens_per_second = 50  # This is an approximation, adjust if needed
            max_new_tokens = int(duration * tokens_per_second)

            audio_values = self.model.generate(
                **inputs,
                do_sample=True,
                guidance_scale=3,
                max_new_tokens=max_new_tokens,
            )
            
            audio_data = audio_values[0, 0].cpu().numpy()
            
            volume_factor = 0.13
            audio_data = audio_data / np.max(np.abs(audio_data)) * 32767 * volume_factor
            audio_data = np.int16(audio_data)
            
            audio_segment = AudioSegment(
                audio_data.tobytes(),
                frame_rate=self.sampling_rate,
                sample_width=2,
                channels=1
            )

            # Trim or extend the audio to match the exact duration
            target_duration_ms = duration * 1000
            if len(audio_segment) < target_duration_ms:
                audio_segment = audio_segment * (target_duration_ms // len(audio_segment) + 1)
            audio_segment = audio_segment[:target_duration_ms]

            return audio_segment
        except Exception as e:
            logger.error(f"Error in generate_music: {str(e)}")
            raise

    def get_sampling_rate(self) -> int:
        return self.sampling_rate

    async def process_music_generation(self, free_input: str, structured_input: Optional[dict], duration: int = 10, repeat_count: int = 1) -> Tuple[str, AudioSegment]:
        try:
            optimized_prompt = await self.generate_optimized_prompt(free_input, structured_input)
            logger.info(f"Optimized prompt: {optimized_prompt}")
            
            audio_segment = await self.generate_music(optimized_prompt, duration)
            logger.info(f"Generated audio of length: {len(audio_segment)}ms")
            
            # Apply repeat_count
            audio_segment = audio_segment * repeat_count
            
            logger.info(f"Final audio length after repetition: {len(audio_segment)}ms")
            return optimized_prompt, audio_segment
        except Exception as e:
            logger.error(f"Error in process_music_generation: {str(e)}")
            raise