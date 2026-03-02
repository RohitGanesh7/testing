from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
import time
from app.core.redis import get_redis
from app.core.config import settings


class RateLimiter:
    """Redis-based rate limiter"""
    
    def __init__(self, requests: int = None, period: int = None):
        self.requests = requests or settings.RATE_LIMIT_REQUESTS
        self.period = period or settings.RATE_LIMIT_PERIOD
    
    async def __call__(self, request: Request):
        """Check rate limit for request"""
        redis = await get_redis()
        
        # Get client identifier (IP address or user ID if authenticated)
        client_id = request.client.host
        if hasattr(request.state, "user_id"):
            client_id = f"user:{request.state.user_id}"
        
        # Create rate limit key
        key = f"rate_limit:{client_id}:{request.url.path}"
        
        try:
            # Get current count
            current = await redis.get(key)
            
            if current is None:
                # First request, set counter
                await redis.setex(key, self.period, 1)
            elif int(current) >= self.requests:
                # Rate limit exceeded
                ttl = await redis.ttl(key)
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail={
                        "error": "Rate limit exceeded",
                        "retry_after": ttl
                    }
                )
            else:
                # Increment counter
                await redis.incr(key)
        
        except HTTPException:
            raise
        except Exception as e:
            # If Redis fails, allow request but log error
            print(f"❌ Rate limiter error: {e}")


async def rate_limit_middleware(request: Request, call_next):
    """Middleware to apply rate limiting"""
    # Skip rate limiting for health check
    if request.url.path == "/health":
        response = await call_next(request)
        return response
    
    try:
        rate_limiter = RateLimiter()
        await rate_limiter(request)
        response = await call_next(request)
        return response
    except HTTPException as e:
        return JSONResponse(
            status_code=e.status_code,
            content=e.detail
        )