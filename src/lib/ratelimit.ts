import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Configuración de Rate Limiting con Upstash Redis.
 */
export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 solicitudes por minuto
  analytics: true,
  prefix: "@upstash/ratelimit",
});
