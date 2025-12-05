from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
import pytest

from billing_system.main import app, get_session
from billing_system.models import Customer, Product, Invoice

# Create a test database
@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session

@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()

def test_create_customer(client: TestClient):
    response = client.post(
        "/customers/",
        json={"name": "Alice", "phone": "1234567890", "email": "alice@example.com"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Alice"
    assert data["id"] is not None

def test_create_product(client: TestClient):
    response = client.post(
        "/products/",
        json={"name": "Apple", "price": 1.5, "tax_rate": 0.1}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Apple"
    assert data["price"] == 1.5

def test_create_invoice(client: TestClient):
    # Setup
    client.post("/customers/", json={"name": "Bob", "phone": "9876543210"})
    client.post("/products/", json={"name": "Banana", "price": 0.5})

    # Create Invoice
    response = client.post(
        "/invoices/",
        json={
            "customer_id": 1,
            "items": [{"product_id": 1, "quantity": 10}],
            "payment_method": "CARD"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["customer_id"] == 1
    assert data["total_amount"] == 5.0 # 0.5 * 10
    assert data["payment_method"] == "CARD"

    # Verify Invoice Item Details
    assert len(data["items"]) == 1
    assert data["items"][0]["amount"] == 5.0
