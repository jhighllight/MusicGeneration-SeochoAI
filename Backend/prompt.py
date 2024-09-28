LIVE_STREAMER_MUSIC_PROMPT = """
As an AI music composer, create a detailed prompt for generating music that a live streamer can play during their broadcast. Consider the following aspects:

Streamer Input: {user_input}

Please provide a rich, descriptive prompt that includes:
1. Genre or style of music suitable for live streaming content
2. Mood or emotion that enhances the stream's atmosphere without overpowering the streamer's voice
3. Tempo or rhythm that maintains viewer engagement but allows for easy talking over
4. Key instruments or sounds that complement the stream's theme
5. Musical structure that allows for easy looping or fading in/out during the stream
6. Consideration for copyright-free or stream-safe music to avoid DMCA issues
7. Versatility for different segments of the stream (e.g., intro, background, high-energy moments, outro)

Your response should be a concise paragraph of 3-4 sentences that captures the essence of the streamer's input and expands it into a comprehensive music generation prompt. The goal is to create music that enhances the live stream experience, supports the streamer's content, and engages the audience without becoming a distraction.
"""

# LYRICS_GENERATION_PROMPT = """
# As a professional lyricist, your task is to create lyrics for a song based on the following parameters:

# 1. Theme: {theme}
# 2. Genre: {genre}
# 3. Season: {season}
# 4. Mood: {mood}
# 5. Length: {length} lines

# Please write lyrics that capture the essence of the theme, fit the specified genre, evoke the feeling of the given season, and match the desired mood. The lyrics should be exactly {length} lines long.

# Your lyrics should be creative, emotionally resonant, and suitable for the specified genre. Consider using appropriate metaphors, imagery, and song structure (verse, chorus, bridge) if applicable to the genre.

# Please provide only the lyrics, without any additional explanation or commentary.
# """