from fastapi import HTTPException,Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.database import get_db
import os
from dotenv import load_dotenv
from jose import jwt,JWTError
from . import models
from sqlalchemy.orm import Session

Bearer=HTTPBearer()

SECRET_KEY=os.getenv("JWT_SECRET")
ALGORITHM=os.getenv("ALGORITHM")
def get_current_user(credentials:HTTPAuthorizationCredentials=Depends(Bearer), db:Session=Depends(get_db)):
    token=credentials.credentials
    try:
        payload=jwt.decode(token,SECRET_KEY,algorithms=[ALGORITHM])
        user_id=int(payload.get("sub"))
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid Credentials")
    
    user=db.query(models.User).filter(models.User.id==user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found!")
    return user
