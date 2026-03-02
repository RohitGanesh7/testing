from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from app.core.database import get_db
from app.core.redis import RedisCache
from app.models.product import Product
from app.models.user import User
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse, ProductListResponse
from app.api.dependencies import get_current_user, get_current_active_superuser

router = APIRouter(prefix="/products", tags=["Products"])


@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_in: ProductCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Create a new product (admin only)"""
    
    product = Product(**product_in.model_dump())
    db.add(product)
    await db.commit()
    await db.refresh(product)
    
    # Clear products cache
    await RedisCache.clear_pattern("products:*")
    
    return product


@router.get("/", response_model=ProductListResponse)
async def get_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get all products with pagination and optional category filter"""
    
    # Try to get from cache
    cache_key = f"products:page:{page}:size:{page_size}:category:{category}"
    cached_data = await RedisCache.get(cache_key)
    if cached_data:
        return cached_data
    
    # Build query
    query = select(Product).where(Product.is_active == True)
    if category:
        query = query.where(Product.category == category)
    
    # Get total count
    count_query = select(func.count()).select_from(Product).where(Product.is_active == True)
    if category:
        count_query = count_query.where(Product.category == category)
    
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    products = result.scalars().all()
    
    response_data = {
        "items": products,
        "total": total,
        "page": page,
        "page_size": page_size
    }
    
    # Cache the result
    await RedisCache.set(cache_key, response_data, ttl=300)
    
    return response_data


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get product by ID"""
    
    # Try cache first
    cache_key = f"product:{product_id}"
    cached_product = await RedisCache.get(cache_key)
    if cached_product:
        return cached_product
    
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Cache the product
    product_dict = {
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "price": product.price,
        "stock_quantity": product.stock_quantity,
        "category": product.category,
        "is_active": product.is_active,
        "created_at": product.created_at.isoformat(),
        "updated_at": product.updated_at.isoformat() if product.updated_at else None
    }
    await RedisCache.set(cache_key, product_dict, ttl=600)
    
    return product


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_update: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Update product (admin only)"""
    
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Update fields
    update_data = product_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
    
    await db.commit()
    await db.refresh(product)
    
    # Clear cache
    await RedisCache.delete(f"product:{product_id}")
    await RedisCache.clear_pattern("products:*")
    
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Soft delete product (admin only)"""
    
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    product.is_active = False
    await db.commit()
    
    # Clear cache
    await RedisCache.delete(f"product:{product_id}")
    await RedisCache.clear_pattern("products:*")