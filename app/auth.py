from fastapi import APIRouter,HTTPException,Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime,timedelta
from jose import jwt
from app.database import get_db
import os
from dotenv import load_dotenv
from app import models

load_dotenv()

router=APIRouter()
SECRET_KEY=os.getenv("JWT_SECRET")
ALGORITHM=os.getenv("ALGORITHM")
pwd_context=CryptContext(schemes=["bcrypt"],deprecated="auto")


class RegisterInput(BaseModel):
    name:str
    email:str
    password:str
    state_code:str
    initials:str
    gstin:str=None

class LoginInput(BaseModel):
    email:str
    password:str

def create_token(user_id:int):
    payload={
        "sub":str(user_id),
        "exp":datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload,SECRET_KEY,ALGORITHM)


@router.post("/register")
def register(data:RegisterInput,db:Session=Depends(get_db)):
    existing=db.query(models.User).filter(models.User.email==data.email).first()
    if existing:
        raise HTTPException(status_code=404,detail="Email already registered")

    user=models.User(
        name=data.name,
        email=data.email,
        password=pwd_context.hash(data.password),
        state_code=data.state_code,
        initials=data.initials,
        gstin=data.gstin
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message":"Registered Successfully","token": create_token(user.id)}
 


@router.post("/login")
def login(data:LoginInput,db:Session=Depends(get_db)):
    user=db.query(models.User).filter(models.User.email==data.email).first()
    if not user or not pwd_context.verify(data.password,user.password):
        raise HTTPException(status_code=401, details="Invalid Credentials")
    return {"token":create_token(user.id)}
