from fpdf import FPDF
import os

class InvoicePDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 12)
        self.cell(0, 10, 'INVOICE', 0, 1, 'C')

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

def generate_invoice_pdf(invoice_data):
    pdf = InvoicePDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)

    # Customer Info
    pdf.cell(200, 10, txt=f"Customer: {invoice_data['customer_name']}", ln=1)
    pdf.cell(200, 10, txt=f"Date: {invoice_data['date']}", ln=1)
    pdf.cell(200, 10, txt=f"Invoice ID: {invoice_data['id']}", ln=1)
    pdf.cell(200, 10, txt=f"Payment Method: {invoice_data['payment_method']}", ln=1)

    pdf.ln(10)

    # Table Header
    pdf.cell(80, 10, "Item", 1)
    pdf.cell(30, 10, "Price", 1)
    pdf.cell(30, 10, "Qty", 1)
    pdf.cell(40, 10, "Amount", 1)
    pdf.ln()

    # Items
    for item in invoice_data['items']:
        pdf.cell(80, 10, item['product_name'], 1)
        pdf.cell(30, 10, str(item['price']), 1)
        pdf.cell(30, 10, str(item['quantity']), 1)
        pdf.cell(40, 10, str(item['amount']), 1)
        pdf.ln()

    pdf.ln(10)
    pdf.cell(200, 10, txt=f"Total Amount: {invoice_data['total_amount']}", ln=1)

    # Ensure directory exists
    output_dir = "invoices"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    filename = f"{output_dir}/invoice_{invoice_data['id']}.pdf"
    pdf.output(filename)
    return filename
