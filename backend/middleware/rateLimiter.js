// backend/middleware/rateLimiter.js
// Minimal in-memory sliding-window rate limiter — no external dependency
// needed for this app's scale. Each call to createRateLimiter() gets its
// own isolated bucket store, so limiters on different routes never
// interfere with each other, and routes that don't use this middleware are
// completely unaffected.
function createRateLimiter({ windowMs, max, keyGenerator, message }) {
  const hits = new Map();

  return function rateLimiter(req, res, next) {
    const key = keyGenerator ? keyGenerator(req) : req.ip;
    const now = Date.now();
    const timestamps = (hits.get(key) || []).filter((ts) => now - ts < windowMs);

    if (timestamps.length >= max) {
      const retryAfterSeconds = Math.max(1, Math.ceil((windowMs - (now - timestamps[0])) / 1000));
      res.set("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({
        success: false,
        message: message || "Too many requests. Please try again later.",
        retryAfterSeconds,
      });
    }

    timestamps.push(now);
    hits.set(key, timestamps);
    next();
  };
}

module.exports = createRateLimiter;
