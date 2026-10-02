from fastapi import FastAPI

from app.routes import account, orders, profile

app = FastAPI()
app.include_router(profile.router)
app.include_router(orders.router)
app.include_router(account.router)
