import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { pool } from '../config/database';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res) => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM competition_participants WHERE competition_id=c.id) as participants,
        EXISTS(SELECT 1 FROM competition_participants WHERE competition_id=c.id AND user_id=$1) as joined
      FROM competitions c WHERE c.end_at > NOW() ORDER BY c.end_at ASC
    `, [req.user!.id]);
    res.json(rows);
  } finally {
    client.release();
  }
});

router.post('/:id/join', async (req: AuthRequest, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('INSERT INTO competition_participants (competition_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [id, req.user!.id]);
    res.json({ joined: true });
  } finally {
    client.release();
  }
});

router.get('/:id/leaderboard', async (req: AuthRequest, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    const { rows } = await client.query(`
      SELECT u.id as user_id, u.display_name, u.total_reps as reps, cp.reps as comp_reps,
        ROW_NUMBER() OVER (ORDER BY cp.reps DESC) as rank
      FROM competition_participants cp
      JOIN users u ON u.id=cp.user_id
      WHERE cp.competition_id=$1
      ORDER BY cp.reps DESC LIMIT 100
    `, [id]);
    res.json(rows);
  } finally {
    client.release();
  }
});

export default router;
