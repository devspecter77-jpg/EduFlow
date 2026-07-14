/**
 * Health & Monitoring Controller — Step 13
 * Provides detailed system status: DB, memory, uptime, cron jobs, etc.
 */

import { Request, Response } from "express";
import { prisma } from "@/config";
import { asyncHandler } from "@/middleware";
import os from "os";

const startTime = Date.now();

function formatBytes(bytes: number): string {
  const mb = bytes / 1024 / 1024;
  return `${mb.toFixed(1)} MB`;
}

function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

/** GET /health — Basic health check (used by load balancers) */
export const healthCheck = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  let dbStatus = 'disconnected';
  let dbLatencyMs = -1;

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
    dbStatus = 'connected';
  } catch {
    // DB check failed
  }

  const isHealthy = dbStatus === 'connected';

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    status: isHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: formatUptime(Date.now() - startTime),
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
    },
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV,
  });
});

/** GET /health/detailed — Full system status (protected, admin only) */
export const detailedHealth = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;

  let dbStatus = 'disconnected';
  let dbLatencyMs = -1;
  let dbStats: Record<string, unknown> = {};

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
    dbStatus = 'connected';

    // Get quick counts for monitoring
    const [userCount, studentCount, centerCount] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.student.count({ where: { isDeleted: false } }),
      prisma.center.count({ where: { isDeleted: false } }),
    ]);
    dbStats = { activeUsers: userCount, totalStudents: studentCount, totalCenters: centerCount };
  } catch (error) {
    dbStats = { error: String(error) };
  }

  res.json({
    success: true,
    status: dbStatus === 'connected' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    server: {
      uptime: formatUptime(Date.now() - startTime),
      uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
      nodeVersion: process.version,
      platform: process.platform,
      pid: process.pid,
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
    },
    memory: {
      process: {
        heapUsed: formatBytes(memUsage.heapUsed),
        heapTotal: formatBytes(memUsage.heapTotal),
        rss: formatBytes(memUsage.rss),
        external: formatBytes(memUsage.external),
        heapUsedPercent: `${((memUsage.heapUsed / memUsage.heapTotal) * 100).toFixed(1)}%`,
      },
      system: {
        total: formatBytes(totalMem),
        free: formatBytes(freeMem),
        used: formatBytes(usedMem),
        usedPercent: `${((usedMem / totalMem) * 100).toFixed(1)}%`,
      },
    },
    cpu: {
      cores: os.cpus().length,
      model: os.cpus()[0]?.model,
      userUs: cpuUsage.user,
      systemUs: cpuUsage.system,
      loadAvg: os.loadavg(),
    },
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
      stats: dbStats,
    },
  });
});
