import Redis from 'ioredis';

// Determine the connection string or options
let redis: Redis | null = null;

if (process.env.REDIS_HOST && process.env.REDIS_PORT) {
  redis = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10),
  });
} else if (process.env.UPSTASH_REDIS_URL) {

  redis = new Redis(process.env.UPSTASH_REDIS_URL as string);
}

if (redis) {
  redis.on('error', (err) => console.error('Redis Client Error', err));
} else {
  console.error('No Redis configuration found. Please set REDIS_HOST/REDIS_PORT or UPSTASH_REDIS_URL.');
}

export default redis;