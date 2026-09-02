import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { pool } from '../config/database';
import { redis } from '../config/redis';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res) => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query('SELECT balance FROM users WHERE id=$1', [req.user!.id]);
    const balance = parseFloat(rows[0]?.balance || '0');
    const tx = await client.query('SELECT * FROM balance_transactions WHERE user_id=$1 ORDER BY created_at DESC LIMIT 20', [req.user!.id]);
    res.json({ balance, pendingWithdraw: 0, history: tx.rows });
  } finally {
    client.release();
  }
});

router.post('/withdraw', async (req: AuthRequest, res) => {
  const { amount, method, details } = req.body;
  if (!amount || amount < 100) return res.status(400).json({ error: 'Min withdraw 100 RUB' });

  const client = await pool.connect();
  try {
    const { rows } = await client.query('SELECT balance, phone_verified, email_verified FROM users WHERE id=$1', [req.user!.id]);
    const user = rows[0];
    if (parseFloat(user.balance) < amount) return res.status(400).json({ error: 'Insufficient balance' });
    if (!user.phone_verified && !user.email_verified) return res.status(403).json({ error: 'Verification required' });

    // Commission 5-10%
    const commission = amount >= 1000 ? 0.05 : 0.10;
    const finalAmount = amount * (1 - commission);

    // Here integrate YooKassa/Stripe
    // For demo, mock success
    await client.query('BEGIN');
    await client.query('UPDATE users SET balance = balance - $1 WHERE id=$2', [amount, req.user!.id]);
    await client.query(`INSERT INTO balance_transactions (user_id, amount, type, description, status) VALUES ($1,$2,'WITHDRAW',$3,'pending')`, [req.user!.id, -amount, `${method} ${finalAmount} RUB (fee ${commission*100}%)`]);
    await client.query('COMMIT');

    res.json({ success: true, finalAmount, commission: amount * commission });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
    res.status(500).json({ error: 'Withdraw failed' });
  } finally {
    client.release();
  }
});

router.post('/ads/reward', async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const today = new Date().toISOString().split('T')[0];
  const key = `ad:${userId}:${today}`;

  const client = await pool.connect();
  try {
    // Check daily limit 5
    const adRes = await client.query('SELECT count FROM ad_watches WHERE user_id=$1 AND watched_at=CURRENT_DATE', [userId]);
    const count = adRes.rows[0]?.count || 0;
    if (count >= 5) return res.status(403).json({ error: 'Daily ad limit reached' });

    await client.query('BEGIN');
    await client.query(`INSERT INTO ad_watches (user_id, watched_at, count) VALUES ($1,CURRENT_DATE,1) ON CONFLICT (user_id, watched_at) DO UPDATE SET count = ad_watches.count + 1`, [userId]);
    await client.query('UPDATE users SET balance = balance + 0.5 WHERE id=$1', [userId]);
    await client.query(`INSERT INTO balance_transactions (user_id, amount, type, description) VALUES ($1,0.5,'AD','Rewarded video')`, [userId]);
    await client.query('COMMIT');

    const bal = await client.query('SELECT balance FROM users WHERE id=$1', [userId]);
    res.json({ balance: parseFloat(bal.rows[0].balance), earned: 0.5 });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
    res.status(500).json({ error: 'Ad reward failed' });
  } finally {
    client.release();
  }
});

export default router;
