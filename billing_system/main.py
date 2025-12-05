from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlmodel import Session, select
from typing import List
from contextlib import asynccontextmanager
from pydantic import BaseModel
from datetime import datetime

from .database import create_db_and_tables, engine
from .models import Customer, Product, Invoice, InvoiceItem
from .services.pdf_service import generate_invoice_pdf
from .services.whatsapp_service import send_whatsapp_message
from fastapi.responses import FileResponse

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)

app.mount("/static", StaticFiles(directory="billing_system/static"), name="static")
templates = Jinja2Templates(directory="billing_system/templates")

def get_session():
    with Session(engine) as session:
        yield session

# --- Response Models ---
class InvoiceItemRead(BaseModel):
    product_id: int
    quantity: int
    price: float
    amount: float
    product: Product

class InvoiceRead(BaseModel):
    id: int
    customer_id: int
    date: datetime
    total_amount: float
    status: str
    payment_method: str
    items: List[InvoiceItemRead]
    customer: Customer

def _prepare_invoice_data(invoice: Invoice) -> dict:
    invoice_data = {
        "id": invoice.id,
        "customer_name": invoice.customer.name,
        "date": str(invoice.date),
        "total_amount": invoice.total_amount,
        "payment_method": invoice.payment_method,
        "items": []
    }

    for item in invoice.items:
        invoice_data["items"].append({
            "product_name": item.product.name,
            "price": item.price,
            "quantity": item.quantity,
            "amount": item.amount
        })
    return invoice_data

# --- Endpoints ---

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# Customer Endpoints
@app.post("/customers/", response_model=Customer)
def create_customer(customer: Customer, session: Session = Depends(get_session)):
    session.add(customer)
    session.commit()
    session.refresh(customer)
    return customer

@app.get("/customers/", response_model=List[Customer])
def read_customers(session: Session = Depends(get_session)):
    customers = session.exec(select(Customer)).all()
    return customers

# Product Endpoints
@app.post("/products/", response_model=Product)
def create_product(product: Product, session: Session = Depends(get_session)):
    session.add(product)
    session.commit()
    session.refresh(product)
    return product

@app.get("/products/", response_model=List[Product])
def read_products(session: Session = Depends(get_session)):
    products = session.exec(select(Product)).all()
    return products

# Invoice Endpoints

class InvoiceItemCreate(BaseModel):
    product_id: int
    quantity: int

class InvoiceCreate(BaseModel):
    customer_id: int
    items: List[InvoiceItemCreate]
    payment_method: str = "CASH"

@app.post("/invoices/", response_model=InvoiceRead)
def create_invoice(invoice_data: InvoiceCreate, session: Session = Depends(get_session)):
    # Calculate total and verify products
    total_amount = 0.0
    invoice_items = []

    for item in invoice_data.items:
        product = session.get(Product, item.product_id)
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")

        amount = product.price * item.quantity
        total_amount += amount

        invoice_item = InvoiceItem(
            product_id=product.id,
            quantity=item.quantity,
            price=product.price,
            amount=amount
        )
        invoice_items.append(invoice_item)

    invoice = Invoice(
        customer_id=invoice_data.customer_id,
        total_amount=total_amount,
        payment_method=invoice_data.payment_method,
        items=invoice_items
    )

    session.add(invoice)
    session.commit()
    session.refresh(invoice)

    # Reload invoice with items and customer
    invoice_with_data = session.exec(select(Invoice).where(Invoice.id == invoice.id)).first()
    return invoice_with_data

@app.get("/invoices/", response_model=List[InvoiceRead])
def read_invoices(session: Session = Depends(get_session)):
    invoices = session.exec(select(Invoice)).all()
    return invoices

@app.get("/invoices/{invoice_id}", response_model=InvoiceRead)
def read_invoice(invoice_id: int, session: Session = Depends(get_session)):
    invoice = session.get(Invoice, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice

@app.get("/invoices/{invoice_id}/pdf")
def get_invoice_pdf(invoice_id: int, session: Session = Depends(get_session)):
    invoice = session.get(Invoice, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    # Prepare data for PDF service
    invoice_data = _prepare_invoice_data(invoice)

    pdf_path = generate_invoice_pdf(invoice_data)
    return FileResponse(pdf_path, media_type='application/pdf', filename=f"invoice_{invoice_id}.pdf")

@app.post("/invoices/{invoice_id}/send_whatsapp")
def send_invoice_whatsapp(invoice_id: int, session: Session = Depends(get_session)):
    invoice = session.get(Invoice, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    # Assume PDF is already generated or generate it on fly
    # For MVP simplicity, we regenerate it to get the path
    invoice_data = _prepare_invoice_data(invoice)
    pdf_path = generate_invoice_pdf(invoice_data)

    success = send_whatsapp_message(
        phone_number=invoice.customer.phone,
        message=f"Hello {invoice.customer.name}, here is your invoice #{invoice.id}",
        attachment_path=pdf_path
    )

    return {"success": success, "message": "WhatsApp sent (mock)"}
