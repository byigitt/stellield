"""Simple caching utilities."""

import time
from typing import Any, Optional, Dict, Callable
from loguru import logger


class SimpleCache:
    """Simple in-memory TTL cache."""
    
    def __init__(self, default_ttl: int = 600):
        """
        Initialize cache.
        
        Args:
            default_ttl: Default time-to-live in seconds
        """
        self.default_ttl = default_ttl
        self._cache: Dict[str, tuple[Any, float]] = {}
        
        logger.debug(f"SimpleCache initialized with TTL={default_ttl}s")
    
    def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache.
        
        Args:
            key: Cache key
            
        Returns:
            Cached value or None if not found/expired
        """
        if key not in self._cache:
            return None
        
        value, expiry = self._cache[key]
        
        if time.time() > expiry:
            # Expired
            del self._cache[key]
            logger.debug(f"Cache miss (expired): {key}")
            return None
        
        logger.debug(f"Cache hit: {key}")
        return value
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None):
        """
        Set value in cache.
        
        Args:
            key: Cache key
            value: Value to cache
            ttl: Optional custom TTL (defaults to default_ttl)
        """
        ttl = ttl if ttl is not None else self.default_ttl
        expiry = time.time() + ttl
        
        self._cache[key] = (value, expiry)
        logger.debug(f"Cache set: {key} (TTL={ttl}s)")
    
    def delete(self, key: str):
        """Delete key from cache."""
        if key in self._cache:
            del self._cache[key]
            logger.debug(f"Cache delete: {key}")
    
    def clear(self):
        """Clear all cache entries."""
        count = len(self._cache)
        self._cache.clear()
        logger.info(f"Cache cleared: {count} entries removed")
    
    def cleanup_expired(self):
        """Remove all expired entries."""
        now = time.time()
        expired = [
            key for key, (_, expiry) in self._cache.items()
            if now > expiry
        ]
        
        for key in expired:
            del self._cache[key]
        
        if expired:
            logger.debug(f"Cleaned up {len(expired)} expired cache entries")
    
    def cached(self, ttl: Optional[int] = None):
        """
        Decorator for caching function results.
        
        Args:
            ttl: Optional custom TTL
            
        Example:
            @cache.cached(ttl=300)
            async def expensive_function(arg1, arg2):
                ...
        """
        def decorator(func: Callable):
            async def wrapper(*args, **kwargs):
                # Create cache key from function name and arguments
                cache_key = f"{func.__name__}:{args}:{kwargs}"
                
                # Check cache
                cached_value = self.get(cache_key)
                if cached_value is not None:
                    return cached_value
                
                # Call function
                result = await func(*args, **kwargs)
                
                # Cache result
                self.set(cache_key, result, ttl=ttl)
                
                return result
            
            return wrapper
        
        return decorator


# Global cache instance
_global_cache = SimpleCache()


def get_cache() -> SimpleCache:
    """Get global cache instance."""
    return _global_cache
