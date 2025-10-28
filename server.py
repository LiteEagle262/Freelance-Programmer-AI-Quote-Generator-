from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse, FileResponse
from pydantic import BaseModel
import google.generativeai as genai
import os
import uvicorn
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

def get_real_ip(request: Request) -> str:
    cf_ip = request.headers.get("CF-Connecting-IP")
    if cf_ip:
        return cf_ip
    
    x_forwarded_for = request.headers.get("X-Forwarded-For")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()
    
    return get_remote_address(request)

limiter = Limiter(key_func=get_real_ip)
app = FastAPI(docs_url=None, redoc_url=None)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

GEMINI_API_KEY = os.environ["GEMENI_KEY"]

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def load_system_prompt():
    try:
        with open("system_prompt.txt", "r", encoding="utf-8") as file:
            return file.read().strip()
    except FileNotFoundError:
        return "Return all responses as Error: system not loaded."

SYSTEM_PROMPT = load_system_prompt()

MY_PROJECTS = []

class ChatMessage(BaseModel):
    message: str

@app.get("/", response_class=HTMLResponse)
async def get_chat_interface():
    return FileResponse("index.html")

@app.get("/api/queue")
async def get_project_queue():
    total_projects = len(MY_PROJECTS)
    
    return {
        "queue_number": total_projects,
        "projects": MY_PROJECTS
    }

@app.post("/chat")
@limiter.limit("5/minute")
async def chat(request: Request, body: ChatMessage):
    try:
        with open('system_prompt.txt', 'r', encoding='utf-8') as f:
            system_prompt = f.read().strip()
            
        model = genai.GenerativeModel('gemini-2.5-flash-lite')
            
        full_prompt = f"{system_prompt}\n\nUser request: {body.message}"
            
        response = model.generate_content(full_prompt)
            
        return {"response": response.text}
            
    except RateLimitExceeded:
        raise HTTPException(
            status_code=429, 
            detail="Rate limit exceeded. Please wait before sending another message."
        )
    except Exception as e:
        print(f"Error generating response: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/style.css")
async def get_styles():
    return FileResponse("style.css")

@app.get("/script.js")
async def get_script():
    return FileResponse("script.js")

if __name__ == "__main__":

    uvicorn.run(app, host="0.0.0.0", port=8000)
