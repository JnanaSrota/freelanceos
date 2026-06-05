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
from fastapi.responses import Response
from app.pdf import generate_invoice_pdf
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


@router.get("/{invoice_id}/pdf")
def download_invoice_pdf(invoice_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    
    invoice = db.query(models.Invoice).filter(
        models.Invoice.id == invoice_id,
        models.Invoice.user_id == user.id
    ).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    client = db.query(models.Client).filter(models.Client.id == invoice.client_id).first()
    items = db.query(models.InvoiceItem).filter(models.InvoiceItem.invoice_id == invoice.id).all()

    data = {
        "user_name": user.name,
        "user_gstin": user.gstin,
        "user_state": user.state_code,
        "client_name": client.name,
        "client_email": client.email,
        "client_gstin": client.gstin,
        "invoice_number": invoice.invoice_number,
        "invoice_date": invoice.invoice_date,
        "due_date": invoice.due_date,
        "items": items,
        "subtotal": invoice.subtotal,
        "cgst": invoice.cgst,
        "sgst": invoice.sgst,
        "igst": invoice.igst,
        "tds_deducted": invoice.tds_deducted,
        "total_payable": invoice.total_payable,
        "export": client.is_foreign
    }

    pdf = generate_invoice_pdf(data)

    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={invoice.invoice_number}.pdf"}
    )