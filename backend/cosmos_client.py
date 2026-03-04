import os
import requests
import json
import base64
from typing import Tuple, Dict, Any

MODEL_NAME = "nvidia/Cosmos-Reason2-8B"

def encode_video_base64(video_path: str) -> str:
    """Encodes a video file to base64 string."""
    with open(video_path, "rb") as video_file:
        return base64.b64encode(video_file.read()).decode("utf-8")

def analyze_video_threat(video_path: str, api_key: str) -> str:
    """
    Calls RunPod vLLM endpoint to analyze if the video shows a physical threat.
    """
    # Get endpoint from environment
    vllm_endpoint = os.getenv("VLLM_ENDPOINT")
    if not vllm_endpoint:
        return "Error: VLLM_ENDPOINT environment variable is not set."

    try:
        # Encode video to base64
        base64_video = encode_video_base64(video_path)
        
        prompt = (
            "You are a highly specialized safety and forensic analyst expert in detecting physical aggression and imminent threats in videos. "
            "Your goal is to perform a deep behavioral and spatial analysis of the footage provided.\n\n"
            "### ANALYSIS PROTOCOL:\n"
            "1. **Behavioral Analysis**: Look for aggressive body language (clenched fists, lunging), sudden violent movements, and specifically **physical restraint** (twisting arms, grabbing necks, forceful gripping, or joint manipulation).\n"
            "2. **Physical Distress & Forced Compliance**: Identify if one person is being forced into a position of pain or submission. Look for signs of physical struggle or one-person exerting total control over another's movement.\n"
            "3. **Power Dynamics**: Identify the 'aggressor' and the 'potential victim'. Recognize intimidation, even if the situation appears 'de-escalated' but involves physical force.\n"
            "4. **Physical Proximity & Blocking**: Analyze if one person is cornering another or blocking their path.\n"
            "5. **Physical Plausibility**: Based on the movement and reactions, determine the likelihood of pain or injury occurring.\n\n"
            "### RATING CRITERIA:\n"
            "- **Danger Level: High**: Active physical violence, physical assault, or brandishing a weapon.\n"
            "- **Danger Level: Medium**: Clear aggressive posturing, intimidation, cornering someone, or preparing to strike. Any behavior that looks like 'bullying with physical intent'.\n"
            "- **Danger Level: Low**: No visible aggression, neutral/friendly interaction, or clearly safe environments.\n\n"
            "**INSTRUCTIONS**: Provide a step-by-step 'Physical & Spatial Reasoning' analysis first. Then state the 'Danger Level' clearly and conclude with a summary assessment."
        )

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
        payload = {
            "model": MODEL_NAME,
            "max_tokens": 1024,
            "temperature": 0.2,
            "top_p": 0.7,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        },
                        {
                            "type": "video_url",
                            "video_url": {
                                "url": f"data:video/mp4;base64,{base64_video}"
                            }
                        }
                    ]
                }
            ],
            "stream": False,
        }

        print(f"Calling RunPod vLLM API: {vllm_endpoint}")
        req = requests.post(vllm_endpoint, json=payload, headers=headers)
        req.raise_for_status()
        data = req.json()
        
        return data["choices"][0]["message"]["content"]

    except requests.exceptions.HTTPError as he:
        err_msg = f"HTTP Error: {he}"
        if he.response is not None:
            err_msg += f"\nResponse: {he.response.text}"
        print(err_msg)
        return "Error calling AI Model API. Status code issue. Check backend terminal for logs."
    except Exception as e:
         print(f"Error accessing RunPod API: {e}")
         return "Error calling AI Model API. Check backend terminal for logs."
