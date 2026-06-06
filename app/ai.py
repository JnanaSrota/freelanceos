from groq import Groq
from fastapi import APIRouter, Depends
from app.dependencies import get_current_user
import os
import json

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
router = APIRouter()

@router.post("/parse-invoice")
def parse_invoice(prompt: dict, user=Depends(get_current_user)):
    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[
            {
                "role": "user",
                "content": f"""
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
                """
            }
        ],
        temperature=0.1
    )
    raw = response.choices[0].message.content.strip()
    raw = raw.replace("```json", "").replace("```", "").strip()
    return json.loads(raw)