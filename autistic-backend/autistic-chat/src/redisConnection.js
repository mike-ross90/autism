import Redis from "ioredis";

const redis = new Redis({
  host: "localhost", // Redis server host
  port: 6379, // Redis server port
});

(async () => {
  try {
    await redis.ping();
    console.log("Connected to Redis.");
  } catch (error) {
    console.error("Error connecting to Redis:", error);
  } finally {
    redis.quit(); // Close the Redis connection
  }
})();

export { redis };
