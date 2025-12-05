from datetime import datetime
from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship

class Customer(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None

    invoices: List["Invoice"] = Relationship(back_populates="customer")

class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    price: float
    tax_rate: float = 0.0
    description: Optional[str] = None

class InvoiceItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    invoice_id: Optional[int] = Field(default=None, foreign_key="invoice.id")
    product_id: int = Field(foreign_key="product.id")
    quantity: int
    price: float  # Stored price at time of purchase
    amount: float  # quantity * price

    invoice: Optional["Invoice"] = Relationship(back_populates="items")
    product: Product = Relationship()

class Invoice(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    customer_id: int = Field(foreign_key="customer.id")
    date: datetime = Field(default_factory=datetime.utcnow)
    total_amount: float
    status: str = "PENDING"  # PAID, PENDING, CANCELLED
    payment_method: str = "CASH" # CASH, CARD, UPI, WALLET

    customer: Customer = Relationship(back_populates="invoices")
    items: List[InvoiceItem] = Relationship(back_populates="invoice")
