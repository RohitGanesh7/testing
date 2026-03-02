from fastapi import APIRouter
from app.api.endpoints import auth, users, products, orders, health

api_router = APIRouter()

# Include all routers
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(products.router)
api_router.include_router(orders.router)