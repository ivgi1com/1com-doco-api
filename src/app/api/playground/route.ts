import { getPlaygroundConfig } from "@/server/playground/config";
import { handleLiveRequest } from "@/server/playground/handler";
import { createMemoryRateLimiter } from "@/server/playground/rate-limit";

// Live Playground proxy: Browser -> this route -> allowlisted 1com endpoint.
// POST only; Next.js answers every other method with 405.
const config = getPlaygroundConfig();
const limiter = createMemoryRateLimiter({ limit: config.rateLimitPerMinute, windowMs: 60_000 });

export async function POST(request: Request) {
  return handleLiveRequest(request, { config, limiter });
}
