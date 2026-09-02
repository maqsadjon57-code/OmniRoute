import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../config/database';
import { generateTokens } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.post('/register', async (req, res) => {
  const { email, password, displayName, referralCode } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const client = await pool.connect();
  try {
    const existing = await client.query('SELECT id FROM users WHERE email=$1', [email]);
    if (existing.rows.length > 0) return res.status(409).json({ error: 'Email already exists' });

    const hash = await bcrypt.hash(password, 10);
    const refCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    let referredBy = null;
    if (referralCode) {
      const ref = await client.query('SELECT id FROM users WHERE referral_code=$1', [referralCode]);
      if (ref.rows.length > 0) referredBy = ref.rows[0].id;
    }

    const result = await client.query(
      `INSERT INTO users (email, password_hash, display_name, referral_code, referred_by) VALUES ($1,$2,$3,$4,$5) RETURNING id, email, display_name, balance, total_reps, level, is_premium`,
      [email, hash, displayName || email.split('@')[0], refCode, referredBy]
    );

    const user = result.rows[0];

    if (referredBy) {
      // Reward referrer +10 rub
      await client.query(`UPDATE users SET balance = balance + 10 WHERE id=$1`, [referredBy]);
      await client.query(`INSERT INTO balance_transactions (user_id, amount, type, description) VALUES ($1, 10, 'REFERRAL', $2)`, [referredBy, `Referral ${email}`]);
      await client.query(`INSERT INTO referrals (referrer_id, referred_id) VALUES ($1,$2)`, [referredBy, user.id]);
      // Reward new user +5?
      await client.query(`UPDATE users SET balance = balance + 5 WHERE id=$1`, [user.id]);
    }

    const tokens = generateTokens({ id: user.id, email: user.email, isPremium: user.is_premium });

    res.json({ token: tokens.token, refreshToken: tokens.refreshToken, user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal error' });
  } finally {
    client.release();
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const client = await pool.connect();
  try {
    const { rows } = await client.query('SELECT * FROM users WHERE email=$1', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const user = rows[0];
    if (user.is_blocked) return res.status(403).json({ error: 'Account blocked' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const tokens = generateTokens({ id: user.id, email: user.email, isPremium: user.is_premium });
    res.json({
      token: tokens.token,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        balance: parseFloat(user.balance),
        totalReps: user.total_reps,
        level: user.level,
        isPremium: user.is_premium
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal error' });
  } finally {
    client.release();
  }
});

router.post('/refresh', async (req, res) => {
  // Simplified
  res.json({ token: 'new-token' });
});

export default router;
