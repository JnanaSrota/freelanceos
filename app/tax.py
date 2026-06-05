from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app import models
from datetime import date

router = APIRouter()

def get_financial_year_range():
    today = date.today()
    if today.month >= 4:
        return date(today.year, 4, 1), date(today.year + 1, 3, 31)
    else:
        return date(today.year - 1, 4, 1), date(today.year, 3, 31)

def compute_slab_tax(income: float) -> float:
    # New tax regime slabs FY 2026-27
    if income <= 300000:
        return 0
    elif income <= 700000:
        return (income - 300000) * 0.05
    elif income <= 1000000:
        return 20000 + (income - 700000) * 0.10
    elif income <= 1200000:
        return 50000 + (income - 1000000) * 0.15
    elif income <= 1500000:
        return 80000 + (income - 1200000) * 0.20
    else:
        return 140000 + (income - 1500000) * 0.30

def get_quarter_percentage(today: date) -> float:
    # What % should have been paid by now
    if today >= date(today.year, 3, 15):
        return 1.0
    elif today >= date(today.year - 1 if today.month < 4 else today.year, 12, 15):
        return 0.75
    elif today >= date(today.year, 9, 15) if today.month >= 9 else date(today.year - 1, 9, 15):
        return 0.45
    elif today >= date(today.year, 6, 15) if today.month >= 6 else date(today.year - 1, 6, 15):
        return 0.15
    return 0.0

def get_next_deadline(today: date) -> str:
    year = today.year
    deadlines = [
        date(year, 6, 15),
        date(year, 9, 15),
        date(year, 12, 15),
        date(year + 1, 3, 15)
    ]
    for d in deadlines:
        if today < d:
            return str(d)
    return str(date(year + 1, 3, 15))

@router.get("/summary")
def tax_summary(db: Session = Depends(get_db), user=Depends(get_current_user)):
    fy_start, fy_end = get_financial_year_range()
    today = date.today()

    # All paid invoices this FY
    invoices = db.query(models.Invoice).filter(
        models.Invoice.user_id == user.id,
        models.Invoice.invoice_date >= fy_start,
        models.Invoice.invoice_date <= fy_end
    ).all()

    gross_income = sum(i.subtotal for i in invoices)
    tds_credited = sum(i.tds_deducted for i in invoices)

    # Estimate taxable income after 30% expenses
    estimated_expenses = round(gross_income * 0.30, 2)
    taxable_income = round(gross_income - estimated_expenses, 2)

    tax_liability = round(compute_slab_tax(taxable_income), 2)
    net_tax = round(max(0, tax_liability - tds_credited), 2)

    expected_paid = round(net_tax * get_quarter_percentage(today), 2)

    # What user has actually paid
    actually_paid = db.query(models.TaxPayment).filter(
        models.TaxPayment.user_id == user.id,
        models.TaxPayment.payment_date >= fy_start,
        models.TaxPayment.payment_date <= fy_end
    ).all()
    total_paid = round(sum(p.amount_paid for p in actually_paid), 2)

    shortfall = round(max(0, expected_paid - total_paid), 2)

    return {
        "gross_income_ytd": gross_income,
        "estimated_expenses": estimated_expenses,
        "taxable_income": taxable_income,
        "estimated_annual_tax": tax_liability,
        "tds_credited": tds_credited,
        "net_tax_payable": net_tax,
        "should_have_paid_by_now": expected_paid,
        "actually_paid": total_paid,
        "shortfall": shortfall,
        "next_deadline": get_next_deadline(today)
    }

@router.post("/payment")
def log_tax_payment(amount: float, challan: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    payment = models.TaxPayment(
        user_id=user.id,
        amount_paid=amount,
        payment_date=date.today(),
        challan_number=challan,
        quarter=f"Q-{date.today().month}"
    )
    db.add(payment)
    db.commit()
    return {"message": "Payment logged"}