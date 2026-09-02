import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { pool } from '../config/database';
import { validateReps, calculateTechniqueScore, calculateCalories } from '../services/repValidator';
import { checkLimits, detectAnomalies, rateLimitByUser } from '../middleware/antifraud';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.use(authMiddleware);
router.use(rateLimitByUser);

router.post('/verify', async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { exerciseType = 'PUSHUP', reps, workoutId } = req.body;

  if (!reps || !Array.isArray(reps) || reps.length === 0) {
    return res.status(400).json({ error: 'Reps required' });
  }

  // Anomaly detection first
  const anomaly = detectAnomalies(reps);
  if (!anomaly.valid && anomaly.score < 0.5) {
    console.warn(`Anomaly detected for user ${userId}: ${anomaly.reason}`);
    // For high severity, block temporarily?
    // return res.status(403).json({ error: `Anomaly: ${anomaly.reason}` });
  }

  const limits = await checkLimits(userId, reps.length);
  if (!limits.allowed) {
    return res.status(403).json({ error: limits.reason });
  }

  const client = await pool.connect();
  try {
    const userRes = await client.query('SELECT is_premium, balance FROM users WHERE id=$1', [userId]);
    const isPremium = userRes.rows[0]?.is_premium || false;

    const result = validateReps(reps, isPremium);

    // Save verified reps
    const workoutIdFinal = workoutId || uuidv4();
    await client.query('BEGIN');

    // Ensure workout exists
    const existingWorkout = await client.query('SELECT id FROM workouts WHERE id=$1', [workoutIdFinal]);
    if (existingWorkout.rows.length === 0) {
      await client.query(
        `INSERT INTO workouts (id, user_id, exercise_type, reps, duration_sec, calories, earned_rub, technique_score) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          workoutIdFinal,
          userId,
          exerciseType,
          result.verified.length,
          Math.round(result.verified.reduce((s, r) => s + (r.durationMs || 1000), 0) / 1000),
          calculateCalories(result.verified.length, exerciseType),
          result.earnedRub,
          calculateTechniqueScore(result.verified)
        ]
      );
    } else {
      await client.query(`UPDATE workouts SET reps = reps + $1, earned_rub = earned_rub + $2 WHERE id=$3`, [result.verified.length, result.earnedRub, workoutIdFinal]);
    }

    // Insert reps
    for (const rep of result.verified) {
      await client.query(
        `INSERT INTO reps (workout_id, user_id, index, start_ts, end_ts, min_elbow_angle, max_elbow_angle, back_deviation, depth_score, duration_ms, is_valid) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [workoutIdFinal, userId, rep.index, rep.startTs, rep.endTs, rep.minElbowAngle, rep.maxElbowAngle, rep.backDeviation, rep.depthScore, rep.durationMs, true]
      );
    }

    // Update user balance and stats
    if (result.earnedRub > 0) {
      await client.query(`UPDATE users SET balance = balance + $1, total_reps = total_reps + $2, daily_reps = daily_reps + $2, weekly_reps = weekly_reps + $2, last_rep_date = CURRENT_DATE, xp = xp + $2 WHERE id=$3`, [result.earnedRub, result.verified.length, userId]);
      await client.query(`INSERT INTO balance_transactions (user_id, amount, type, description) VALUES ($1,$2,'REP',$3)`, [userId, result.earnedRub, `${result.verified.length} ${exerciseType}`]);

      // Update competition participants
      await client.query(`UPDATE competition_participants SET reps = reps + $1 WHERE user_id=$2 AND competition_id IN (SELECT id FROM competitions WHERE end_at > NOW())`, [result.verified.length, userId]);
    }

    // Check achievements
    const achievementsUnlocked: string[] = [];
    const totalRes = await client.query('SELECT total_reps FROM users WHERE id=$1', [userId]);
    const totalReps = totalRes.rows[0].total_reps;

    const achChecks = [
      { id: 'first_10', need: 10 },
      { id: 'daily_50', need: 50 },
      { id: 'hundred_club', need: 100 },
      { id: 'marathon', need: 1000 }
    ];

    for (const ach of achChecks) {
      if (totalReps >= ach.need) {
        const exists = await client.query('SELECT unlocked FROM user_achievements WHERE user_id=$1 AND achievement_id=$2', [userId, ach.id]);
        if (exists.rows.length === 0 || !exists.rows[0].unlocked) {
          await client.query(`INSERT INTO user_achievements (user_id, achievement_id, progress, unlocked, unlocked_at) VALUES ($1,$2,$3,true,NOW()) ON CONFLICT (user_id, achievement_id) DO UPDATE SET unlocked=true, progress=$3`, [userId, ach.id, totalReps]);
          achievementsUnlocked.push(ach.id);
        }
      }
    }

    await client.query('COMMIT');

    const balanceRes = await client.query('SELECT balance FROM users WHERE id=$1', [userId]);
    const newBalance = parseFloat(balanceRes.rows[0].balance);

    res.json({
      verifiedCount: result.verified.length,
      rejectedCount: result.rejected.length,
      earnedRub: result.earnedRub,
      newBalance,
      achievementsUnlocked,
      techniqueFeedback: result.techniqueFeedback
    });

  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
    res.status(500).json({ error: 'Verification failed' });
  } finally {
    client.release();
  }
});

router.post('/workout/finish', async (req: AuthRequest, res) => {
  // Finalize workout, return summary
  res.json({ ok: true });
});

export default router;
