import anthropic
from fastapi import APIRouter, Depends
from app.dependencies import get_current_user
import os
import json

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
router = APIRouter()

@router.post("/parse-invoice")
def parse_invoice(prompt: dict, user=Depends(get_current_user)):
    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=500,
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
        ]
    )
    raw = message.content[0].text.strip()
    raw = raw.replace("```json", "").replace("```", "").strip()
    return json.loads(raw)