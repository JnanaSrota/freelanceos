from fastapi import FastAPI
from app import models
from app.database import engine
from app.auth import router as auth_router
from app.clients import router as clients_router
from app.invoices import router as invoices_router
from app.tax import router as tax_router
from fastapi.staticfiles import StaticFiles
from app.ai import router as ai_router
from fastapi.middleware.cors import CORSMiddleware

models.Base.metadata.create_all(bind=engine)
app=FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://freelanceos-neon.vercel.app",
        "http://localhost:5500",
        "http://127.0.0.1:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/app", StaticFiles(directory="frontend", html=True), name="frontend")

app.include_router(auth_router,prefix="/auth")
app.include_router(clients_router,prefix="/clients")
app.include_router(invoices_router,prefix="/invoices")
app.include_router(tax_router,prefix="/tax")
app.include_router(ai_router,prefix="/ai")

@app.get("/")
def get_root():
    return {"message":"Running"}

