import json
from typing import Optional, Any
from redis import asyncio as aioredis
from app.core.config import settings

redis_client: Optional[aioredis.Redis] = None


async def get_redis() -> aioredis.Redis:
    """Get Redis connection"""
    return redis_client


async def init_redis():
    """Initialize Redis connection"""
    global redis_client
    redis_client = await aioredis.from_url(
        settings.REDIS_URL,
        encoding="utf-8",
        decode_responses=True,
        max_connections=50,
    )
    print("✅ Redis connected")


async def close_redis():
    """Close Redis connection"""
    global redis_client
    if redis_client:
        await redis_client.close()
        print("✅ Redis connection closed")


class RedisCache:
    """Redis cache helper"""
    
    @staticmethod
    async def get(key: str) -> Optional[Any]:
        """Get value from cache"""
        try:
            value = await redis_client.get(key)
            if value:
                return json.loads(value)
        except Exception as e:
            print(f"❌ Redis GET error: {e}")
        return None
    
    @staticmethod
    async def set(key: str, value: Any, ttl: int = None) -> bool:
        """Set value in cache"""
        try:
            ttl = ttl or settings.REDIS_CACHE_TTL
            await redis_client.setex(
                key,
                ttl,
                json.dumps(value)
            )
            return True
        except Exception as e:
            print(f"❌ Redis SET error: {e}")
            return False
    
    @staticmethod
    async def delete(key: str) -> bool:
        """Delete key from cache"""
        try:
            await redis_client.delete(key)
            return True
        except Exception as e:
            print(f"❌ Redis DELETE error: {e}")
            return False
    
    @staticmethod
    async def clear_pattern(pattern: str) -> bool:
        """Clear all keys matching pattern"""
        try:
            keys = await redis_client.keys(pattern)
            if keys:
                await redis_client.delete(*keys)
            return True
        except Exception as e:
            print(f"❌ Redis CLEAR error: {e}")
            return False