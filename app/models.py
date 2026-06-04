from sqlalchemy import Column, Integer, String, Date, ForeignKey, Float, Boolean
from app.database import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__= "users"
    id= Column(Integer, primary_key=True, index=True)
    name= Column(String)
    email=Column(String, unique=True, index=True)
    password= Column(String)
    gstin= Column(String, nullable=True)
    state_code= Column(String)
    initials= Column(String)
    clients= relationship("Client", back_populates="owner")
    invoices=relationship("Invoice", back_populates="owner")

class Client(Base):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    email = Column(String)
    gstin = Column(String, nullable=True)
    state_code = Column(String, nullable=True)
    is_foreign = Column(Boolean, default=False)
    tds_applicable = Column(Boolean, default=False)
    owner = relationship("User", back_populates="clients")
    invoices = relationship("Invoice", back_populates="client")

class Invoice(Base):
    __tablename__ = "invoices"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    client_id = Column(Integer, ForeignKey("clients.id"))
    invoice_number = Column(String)
    invoice_date = Column(Date)
    due_date = Column(Date)
    status = Column(String, default="unpaid")
    subtotal = Column(Float)
    cgst = Column(Float, default=0)
    sgst = Column(Float, default=0)
    igst = Column(Float, default=0)
    tds_deducted = Column(Float, default=0)
    total_payable = Column(Float)
    owner = relationship("User", back_populates="invoices")
    client = relationship("Client", back_populates="invoices")
    items = relationship("InvoiceItem", back_populates="invoice")

class InvoiceItem(Base):
    __tablename__ = "invoice_items"
    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"))
    description = Column(String)
    quantity = Column(Float)
    rate = Column(Float)
    amount = Column(Float)
    sac_code = Column(String, default="998314")
    invoice = relationship("Invoice", back_populates="items") 