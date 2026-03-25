import rateLimit from 'express-rate-limit';

export const reviewRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 10, // Max 10 review requests per user per hour
  message: { error: 'Too many review requests created from this IP, please try again after an hour', code: 'RATE_LIMIT_EXCEEDED' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per 15 minutes
  message: { error: 'Too many authentication attempts, try again later', code: 'RATE_LIMIT_EXCEEDED' }
});
