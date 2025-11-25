// src/lib/cache.ts
import redis from './redis'  // Change this line - remove the curly braces

export async function cacheGet(key: string) {
    if (!redis) {
        console.warn('Redis not configured, skipping cache');
        return null;
    }
    
    try {
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Cache get error:', error);
        return null;
    }
}

export async function cacheSet(key: string, value: unknown, expiry = 120) {
    if (!redis) return;
    
    try {
        await redis.set(key, JSON.stringify(value), "EX", expiry);
    } catch (error) {
        console.error('Cache set error:', error);
    }
}

export async function cacheDelete(key: string) {
    if (!redis) return;
    
    try {
        await redis.del(key);
    } catch (error) {
        console.error('Cache delete error:', error);
    }
}