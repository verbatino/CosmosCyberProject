# Cyber-to-Physical Threat Detector

This application analyzes video messages to detect physical aggression and threats. It uses NVIDIA Cosmos Reason 2 models to perform forensic analysis of movements, power dynamics, and physical interactions.

## Project Structure

- `backend/`: FastAPI server for video processing and vLLM integration.
- `frontend/`: Vite-based web interface (Vanilla JS/CSS).

## Prerequisites

- Python 3.10+
- Node.js and npm
- Access to an NVIDIA Cosmos Reason 2 model endpoint.

*Note: This project was prepared and tested using **RunPod**, but it is also compatible with **Nebius** or any other provider offering a vLLM OpenAI-compatible API for Cosmos Reason 2.*

## Setup and Running

### 1. Backend

1. Navigate to the backend directory:
   ```cmd
   cd backend
   ```
2. Activate the virtual environment:
   ```cmd
   .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```cmd
   pip install -r requirements.txt
   ```
4. Configure environment variables in `.env`:
   - `RUNPOD_API_KEY`: Your model authorization key (e.g., `sk-PODID`).
   - `VLLM_ENDPOINT`: The OpenAI-compatible completion endpoint (e.g., `https://.../v1/chat/completions`).
5. Start the server:
   ```cmd
   uvicorn main:app --reload
   ```

### 2. Frontend

1. Navigate to the frontend directory:
   ```cmd
   cd frontend
   ```
2. Install dependencies:
   ```cmd
   npm install
   ```
3. Start the development server:
   ```cmd
   npm run dev
   ```
4. Open the application in your browser (typically at http://localhost:5173).

## Features

- **Forensic AI Analysis**: Detects physical restraint, joint manipulation, and aggressive posturing.
- **Base64 Processing**: Efficiently handles video data transmission to vLLM.
- **Modern UI**: Dark-themed glassmorphism interface for triage reporting.
