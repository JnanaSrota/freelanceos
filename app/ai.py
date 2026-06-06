import google.generativeai as genai
from fastapi import APIRouter, Depends
from app.dependencies import get_current_user
import os
import json

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
router = APIRouter()

@router.post("/parse-invoice")
def parse_invoice(prompt: dict, user=Depends(get_current_user)):
    model = genai.GenerativeModel("gemini-1.5-flash")
    
    response = model.generate_content(f"""
    Extract invoice details from this text and return ONLY valid JSON.
    No explanation, no markdown, just JSON.
    
    Text: "{prompt['text']}"
    
    Return this exact structure:
    {{
        "client_name": "",
        "items": [
            {{
                "description": "",
                "quantity": 0,
                "rate": 0
            }}
        ]
    }}
    """)
    
    raw = response.text.strip()
    raw = raw.replace("```json", "").replace("```", "").strip()
    return json.loads(raw)