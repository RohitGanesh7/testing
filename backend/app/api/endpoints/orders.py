from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.models.order import Order, OrderStatus
from app.models.product import Product
from app.models.user import User
from app.schemas.order import OrderCreate, OrderUpdate, OrderResponse, OrderListResponse
from app.api.dependencies import get_current_user
from app.tasks.order_tasks import process_order_notification

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_in: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new order"""
    
    # Check if product exists and has enough stock
    result = await db.execute(select(Product).where(Product.id == order_in.product_id))
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    if not product.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product is not available"
        )
    
    if product.stock_quantity < order_in.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient stock. Available: {product.stock_quantity}"
        )
    
    # Calculate total price
    total_price = product.price * order_in.quantity
    
    # Create order
    order = Order(
        user_id=current_user.id,
        product_id=order_in.product_id,
        quantity=order_in.quantity,
        total_price=total_price,
        status=OrderStatus.PENDING
    )
    
    # Update product stock
    product.stock_quantity -= order_in.quantity
    
    db.add(order)
    await db.commit()
    await db.refresh(order)
    
    # Send order notification asynchronously
    process_order_notification.delay(order.id, current_user.email)
    # also schedule background progression of order status
    from app.tasks.order_tasks import auto_progress_order
    auto_progress_order.delay(order.id)
    
    return order


@router.get("/", response_model=OrderListResponse)
async def get_my_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user's orders"""
    
    # Get total count
    count_result = await db.execute(
        select(func.count()).select_from(Order).where(Order.user_id == current_user.id)
    )
    total = count_result.scalar()
    
    # Get orders with pagination
    result = await db.execute(
        select(Order)
        .where(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    orders = result.scalars().all()
    
    return {
        "items": orders,
        "total": total,
        "page": page,
        "page_size": page_size
    }


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get order by ID"""
    
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check ownership
    if order.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this order"
        )
    
    return order


@router.patch("/{order_id}/cancel", response_model=OrderResponse)
async def cancel_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Cancel an order"""
    
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check ownership
    if order.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to cancel this order"
        )
    
    # Check if order can be cancelled
    if order.status in [OrderStatus.COMPLETED, OrderStatus.CANCELLED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel order with status: {order.status.value}"
        )
    
    # Restore product stock
    product_result = await db.execute(select(Product).where(Product.id == order.product_id))
    product = product_result.scalar_one()
    product.stock_quantity += order.quantity
    
    # Update order status
    order.status = OrderStatus.CANCELLED
    
    await db.commit()
    await db.refresh(order)
    
    return order