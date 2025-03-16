import streamlit as st
from transformers import pipeline
import torch
from gtts import gTTS
from pydub import AudioSegment
import os

# --- Title ---
st.title("📖 Urdu Story Generator with Voiceover")

# --- User Input ---
story_title = st.text_input("🔤 Enter a Story Title:", "")

# --- Generate Story ---
def generate_story(title):
    generator = pipeline("text-generation", model="Qasim-Ali/Urdu-Story-Generator", torch_dtype=torch.float32)
    story = generator(title, max_length=500, num_return_sequences=1)
    return story[0]['generated_text']

# --- Convert to Speech ---
def text_to_speech(text):
    tts = gTTS(text=text, lang='ur')
    tts.save("story.mp3")
    sound = AudioSegment.from_mp3("story.mp3")

    # Add Background Music
    bg_music = AudioSegment.from_file("background.mp3")  # Make sure this file is uploaded
    final_audio = sound.overlay(bg_music - 10)
    final_audio.export("final_story.mp3", format="mp3")

# --- Button ---
if st.button("Generate Story & Voiceover"):
    if story_title:
        with st.spinner("Generating... Please wait ⏳"):
            story_text = generate_story(story_title)
            st.write("📖 **Generated Story:**")
            st.write(story_text)

            text_to_speech(story_text)

            # Play Audio
            audio_file = open("final_story.mp3", "rb")
            audio_bytes = audio_file.read()
            st.audio(audio_bytes, format="audio/mp3")
    else:
        st.warning("⚠️ Please enter a story title first.")

