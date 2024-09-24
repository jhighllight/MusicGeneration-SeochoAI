# MUSIC_GENERATION_PROMPT = """
# As an AI music composer, your task is to create a detailed prompt for generating music based on the following user input:

# User Input: {user_input}

# Please provide a rich, descriptive prompt that includes:
# 1. Genre or style of music
# 2. Mood or emotion
# 3. Tempo or rhythm
# 4. Key instruments or sounds
# 5. Any specific musical elements or techniques

# Your response should be a single paragraph, around 2-3 sentences long, that captures the essence of the user's input and expands it into a comprehensive music generation prompt.
# """

MUSIC_GENERATION_PROMPT = """
As an AI music composer, your task is to create a detailed prompt for generating music based on the following user input:

User Input: {user_input}

Please provide a rich, descriptive prompt that includes:
1. **Genre**: Clearly define the genre of the music to be created. For example, specify genres like 'pop', 'rock', 'jazz', or 'classical'.
   - **Example**: 'Electronic Pop'
2. **Rhythm**: Describe the rhythm of the music. For example, define it as 'fast', 'slow', 'medium tempo', or 'swing'.
   - **Example**: '120 BPM medium tempo'
3. **Melody**: Add a description of the melody for the generated music. You might express it as 'light and soft melody' or 'intense and energetic melody'.
   - **Example**: 'Emotionally stirring ascending melody'
4. **Theme**: Explain the theme or emotion of the music. For example, specify themes like 'love', 'farewell', 'celebration', 'nature', or 'adventure'.
   - **Example**: 'Free moments of summer'
5. **Instruments**: Include a list of instruments you want to use. Specify instruments like 'guitar', 'piano', 'drums', 'synthesizer', or 'violin'.
   - **Example**: 'Acoustic guitar, drum machine, synthesizer'
6. **Reference Tracks**: Suggest existing songs that are similar in style. For example, mention tracks like 'Dua Lipa - Levitating' or 'Kygo - Firestone'.
   - **Example**: 'Ed Sheeran - Shape of You'

Your response should be a single paragraph, around 2-3 sentences long, that captures the essence of the user's input and expands it into a comprehensive music generation prompt, including specific details for each element.
"""
