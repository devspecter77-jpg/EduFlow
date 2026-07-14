import { Router } from "express";
import { healthController } from "@/controllers";
import { authenticate, authorize } from "@/middleware";
import { rateLimiter } from "@/middleware/rateLimiter";
import { Role } from "@prisma/client";

const router = Router();

// Health rate limiter: 60 req/min (prevent abuse of public endpoint)
const healthRateLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: 'Juda ko\'p so\'rov.',
  keyPrefix: 'health',
});

router.get("/", healthRateLimiter, healthController.healthCheck);

router.get(
  "/detailed",
  authenticate,
  authorize(Role.ADMIN, Role.SUPER_ADMIN),
  healthController.detailedHealth
);

export default router;
