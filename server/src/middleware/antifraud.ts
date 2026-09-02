import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { redis } from '../config/redis';
import { pool } from '../config/database';

/**
 * Anti-fraud middleware:
 * - HMAC signature verification
 * - Rate limiting (Redis)
 * - Timestamp freshness
 * - Daily/weekly limits
 */

export function verifySignature(req: Request, res: Response, next: NextFunction) {
  const signature = req.headers['x-signature'] as string || (req.body.signature as string);
  const timestamp = req.headers['x-timestamp'] as string || req.body.timestamp?.toString();
  if (!signature || !timestamp) return res.status(400).json({ error: 'Missing signature' });

  const now = Date.now();
  const ts = parseInt(timestamp);
  if (Math.abs(now - ts) > 5 * 60 * 1000) { // 5 min window
    return res.status(400).json({ error: 'Stale timestamp' });
  }

  const secret = process.env.HMAC_SECRET || 'hmac-secret';
  const payload = JSON.stringify(req.body.reps || req.body) + timestamp;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  // In dev, allow missing but log
  if (process.env.NODE_ENV === 'production' && signature !== expected) {
    console.warn(`Invalid signature from ${req.ip}`);
    return res.status(403).json({ error: 'Invalid signature' });
  }
  next();
}

export async function checkLimits(userId: string, newReps: number): Promise<{ allowed: boolean; reason?: string }> {
  const client = await pool.connect();
  try {
    const { rows } = await client.query('SELECT daily_reps, weekly_reps, last_rep_date, is_blocked FROM users WHERE id=$1', [userId]);
    if (!rows[0]) return { allowed: false, reason: 'User not found' };
    const u = rows[0];
    if (u.is_blocked) return { allowed: false, reason: 'User blocked for fraud' };

    // Reset daily if date changed
    const today = new Date().toISOString().split('T')[0];
    let daily = u.daily_reps;
    if (u.last_rep_date?.toISOString?.().split('T')[0] !== today) daily = 0;

    if (daily + newReps > 1000) return { allowed: false, reason: 'Daily limit 1000 exceeded' };
    if (u.weekly_reps + newReps > 5000) return { allowed: false, reason: 'Weekly limit 5000 exceeded' };

    // Anomaly detection: too fast reps (avg < 0.5s)
    const key = `reps_speed:${userId}`;
    const recent = await redis.get(key);
    if (recent) {
      const data = JSON.parse(recent);
      if (data.avgDuration < 400) return { allowed: false, reason: 'Too fast - possible cheating' };
    }

    return { allowed: true };
  } finally {
    client.release();
  }
}

export async function rateLimitByUser(req: any, res: Response, next: NextFunction) {
  const userId = req.user?.id;
  if (!userId) return next();
  const key = `rate:${userId}:${req.path}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 60); // 60s window
  if (count > 30) return res.status(429).json({ error: 'Rate limit exceeded' });
  next();
}

export function detectAnomalies(reps: any[]): { valid: boolean; score: number; reason?: string } {
  if (reps.length === 0) return { valid: false, score: 0, reason: 'No reps' };

  // Check durations
  const durations = reps.map(r => r.durationMs || (r.endTs - r.startTs));
  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
  if (avgDuration < 400) return { valid: false, score: 0, reason: 'Avg duration too low' };
  if (avgDuration > 5000) return { valid: false, score: 0, reason: 'Avg duration too high' };

  // Check angle consistency - should have variation
  const angles = reps.map(r => r.minElbowAngle);
  const variance = Math.max(...angles) - Math.min(...angles);
  if (reps.length > 5 && variance < 5) return { valid: false, score: 0, reason: 'No angle variance - bot?' };

  // Back deviation check
  const badBack = reps.filter(r => r.backDeviation > 20).length;
  if (badBack / reps.length > 0.5) return { valid: false, score: 0.3, reason: 'Bad technique majority' };

  return { valid: true, score: 0.9 };
}
