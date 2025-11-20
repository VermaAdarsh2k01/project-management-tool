import Redis from "ioredis";

const globalForRedis = global as unknown as {
  redis: Redis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new Redis({
    host: process.env.REDIS_HOST ?? "127.0.0.1",
    port: Number(process.env.REDIS_PORT ?? 6379),
    password: process.env.REDIS_PASSWORD ?? undefined,
  });

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;