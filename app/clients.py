from fastapi import HTTPException, Depends, APIRouter
from pydantic import BaseModel
from .database import get_db
from sqlalchemy.orm import Session
from .dependencies import get_current_user
from typing import Optional

router= APIRouter()

class ClientInput(BaseModel):
    name:str
    email:str
    gstin:Optional[str]=None
    state_code:Optional[str]=None
    is_foreign:bool=False
    tds_applicable:bool=False

@router.post("/")
def create_client(data:ClientInput,db:Session=Depends(get_db),user=Depends(get_current_user)):
    client= models.Client( user_id=user.id,
    name=data.name,
    email=data.email,
    gstin=data.gstin,
    state_code=data.state_code,
    tds_applicable=data.tds_applicable,
    is_foreign=data.is_foreign)
    db.add(client)
    db.commt()
    db.refresh(client)
    return client

@router.get("/")
def get_client(db:Session=Depends(get_db),user=Depends(get_current_user)):
    return db.query(models.Client).filter(models.Client.user_id==user.id).all()

@router.delete("/{client_id}")
def delete_client(client_id:int,db:Session=Depends(get_db),user=Depends(get_current_user)):
    client=db.query(models.Client).filter(
        models.Client.id==client_id,
        models.Client.user_id==user.id
    ).first()
    if not client:
        raise HTTPException(status_code=401,detail="Client Not Found!")
        db.delete(client)
        db.commit
        return {"message":"Client Deleted Successfully"}
        