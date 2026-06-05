from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app import models
from app.gst import compute_invoice_totals
from app.invoice_number import generate_invoice_number
from pydantic import BaseModel
from typing import List, Optional
from datetime import date

router = APIRouter()

class InvoiceItemInput(BaseModel):
    description: str
    quantity: float
    rate: float
    sac_code: str = "998314"

class InvoiceInput(BaseModel):
    client_id: int
    invoice_date: date
    due_date: date
    items: List[InvoiceItemInput]

@router.post("/")
def create_invoice(data: InvoiceInput, db: Session = Depends(get_db), user=Depends(get_current_user)):
    
    # Get client
    client = db.query(models.Client).filter(
        models.Client.id == data.client_id,
        models.Client.user_id == user.id
    ).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Compute totals
    items_raw = [{"quantity": i.quantity, "rate": i.rate} for i in data.items]
    totals = compute_invoice_totals(items_raw, client)
    
    # Generate invoice number
    invoice_number = generate_invoice_number(user, db)
    
    # Create invoice
    invoice = models.Invoice(
        user_id=user.id,
        client_id=client.id,
        invoice_number=invoice_number,
        invoice_date=data.invoice_date,
        due_date=data.due_date,
        subtotal=totals["subtotal"],
        cgst=totals["cgst"],
        sgst=totals["sgst"],
        igst=totals["igst"],
        tds_deducted=totals["tds_deducted"],
        total_payable=totals["total_payable"],
        status="unpaid"
    )
    db.add(invoice)
    db.flush()
    
    # Create invoice items
    for item in data.items:
        db.add(models.InvoiceItem(
            invoice_id=invoice.id,
            description=item.description,
            quantity=item.quantity,
            rate=item.rate,
            amount=round(item.quantity * item.rate, 2),
            sac_code=item.sac_code
        ))
    
    db.commit()
    db.refresh(invoice)
    return {
        "invoice_number": invoice.invoice_number,
        "subtotal": invoice.subtotal,
        "cgst": invoice.cgst,
        "sgst": invoice.sgst,
        "igst": invoice.igst,
        "tds_deducted": invoice.tds_deducted,
        "total_payable": invoice.total_payable,
        "status": invoice.status
    }

@router.get("/")
def get_invoices(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(models.Invoice).filter(models.Invoice.user_id == user.id).all()

@router.get("/{invoice_id}")
def get_invoice(invoice_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    invoice = db.query(models.Invoice).filter(
        models.Invoice.id == invoice_id,
        models.Invoice.user_id == user.id
    ).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice

@router.patch("/{invoice_id}/mark-paid")
def mark_paid(invoice_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    invoice = db.query(models.Invoice).filter(
        models.Invoice.id == invoice_id,
        models.Invoice.user_id == user.id
    ).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    invoice.status = "paid"
    db.commit()
    return {"message": "Marked as paid"}