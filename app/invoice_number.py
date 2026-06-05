from datetime import date
from sqlalchemy.orm import Session
from app import models

def get_financial_year() -> str:
    today = date.today()
    if today.month >= 4:
        return f"{today.year}-{str(today.year + 1)[-2:]}"
    else:
        return f"{today.year - 1}-{str(today.year)[-2:]}"

def generate_invoice_number(user: models.User, db: Session) -> str:
    fy = get_financial_year()
    
    # Count existing invoices this financial year
    prefix = f"{user.initials}/{fy}/"
    count = db.query(models.Invoice).filter(
        models.Invoice.user_id == user.id,
        models.Invoice.invoice_number.like(f"{prefix}%")
    ).count()
    
    sequence = str(count + 1).zfill(3)
    return f"{prefix}{sequence}"