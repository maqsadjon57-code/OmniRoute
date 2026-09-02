import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { pool } from '../config/database';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res) => {
  const client = await pool.connect();
  try {
    const userId = req.user!.id;
    const stats = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM workouts WHERE user_id=$1) as total_workouts,
        (SELECT COALESCE(SUM(reps),0) FROM workouts WHERE user_id=$1) as total_reps,
        (SELECT COALESCE(SUM(earned_rub),0) FROM workouts WHERE user_id=$1) as total_earned,
        (SELECT COALESCE(AVG(technique_score),0) FROM workouts WHERE user_id=$1) as avg_technique,
        (SELECT COALESCE(MAX(reps),0) FROM workouts WHERE user_id=$1) as max_reps
    `, [userId]);

    const weekly = await client.query(`
      SELECT DATE(created_at) as date, SUM(reps) as reps
      FROM workouts WHERE user_id=$1 AND created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at) ORDER BY date
    `, [userId]);

    res.json({ ...stats.rows[0], weekly: weekly.rows });
  } finally {
    client.release();
  }
});

router.get('/leaderboard', async (req: AuthRequest, res) => {
  const period = req.query.period as string || 'week';
  const client = await pool.connect();
  try {
    let interval = "7 days";
    if (period === 'month') interval = "30 days";
    if (period === 'all') interval = "3650 days";

    const { rows } = await client.query(`
      SELECT u.id as user_id, u.display_name, SUM(w.reps) as reps,
        ROW_NUMBER() OVER (ORDER BY SUM(w.reps) DESC) as rank
      FROM workouts w
      JOIN users u ON u.id=w.user_id
      WHERE w.created_at >= NOW() - INTERVAL '${interval}'
      GROUP BY u.id, u.display_name
      ORDER BY reps DESC LIMIT 50
    `);
    res.json(rows);
  } finally {
    client.release();
  }
});

export default router;
