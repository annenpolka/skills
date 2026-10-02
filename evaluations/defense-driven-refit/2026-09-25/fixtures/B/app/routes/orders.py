from fastapi import APIRouter, Depends

from app import db
from app.auth import current_user

router = APIRouter()


@router.get("/v1/orders")
def list_orders(user=Depends(current_user)):
    return db.fetch_all("SELECT * FROM orders WHERE user_id = %s ORDER BY id DESC", (user.id,))


@router.post("/v1/orders", status_code=201)
def create_order(body: dict, user=Depends(current_user)):
    return db.fetch_one(
        "INSERT INTO orders (user_id, item_id, quantity) VALUES (%s, %s, %s) RETURNING *",
        (user.id, body["item_id"], body["quantity"]),
    )
