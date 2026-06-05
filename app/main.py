from fastapi import FastAPI
from app import models
from app.database import engine
from app.auth import router as auth_router
from app.clients import router as clients_router
from app.invoices import router as invoices_router

models.Base.metadata.create_all(bind=engine)
app=FastAPI()
app.include_router(auth_router,prefix="/auth")
app.include_router(client_router,prefix="/clients")
app.include_router(invoices_router,prefix="/invoices")

@app.get("/")
def get_root():
    return {"message":"Running"}