import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';

const app = express();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  message: { error: 'Too many requests' }
});
app.use(limiter);

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: Date.now(), version: '1.0.0', mode: 'AI Fitness Camera Pro' }));

// Try to load real routes, fallback to mocks if DB not available
let realRoutesLoaded = false;
try {
  // Dynamic import to avoid crash if DB module fails
  const authRoutes = require('./routes/auth').default;
  const repRoutes = require('./routes/reps').default;
  const balanceRoutes = require('./routes/balance').default;
  const competitionRoutes = require('./routes/competitions').default;
  const statsRoutes = require('./routes/stats').default;

  app.use('/api/auth', authRoutes);
  app.use('/api/reps', repRoutes);
  app.use('/api/balance', balanceRoutes);
  app.use('/api/competitions', competitionRoutes);
  app.use('/api/stats', statsRoutes);
  app.use('/api/leaderboard', statsRoutes);
  realRoutesLoaded = true;
} catch (e) {
  console.warn('Real routes not loaded, using mocks', (e as Error).message);
}

// Mock fallbacks (always available for demo)
app.post('/api/reps/verify', (req, res) => {
  const reps = req.body.reps || [];
  const isPremium = false;
  const rate = isPremium ? 0.15 : 0.1;
  // Simple validation same as server
  const verified = reps.filter((r: any) => r.minElbowAngle <= 90 && r.maxElbowAngle >= 160 && r.backDeviation <= 20);
  res.json({
    verifiedCount: verified.length,
    rejectedCount: reps.length - verified.length,
    earnedRub: verified.length * rate,
    newBalance: 23.5 + verified.length * rate,
    achievementsUnlocked: verified.length > 0 ? ['first_10'] : [],
    techniqueFeedback: verified.length > 0 ? 'Отличная техника! Так держать!' : 'Попробуйте глубже'
  });
});

app.get('/api/balance', (req, res) => {
  res.json({ balance: 23.5, pendingWithdraw: 0, history: [
    { id: '1', amount: 0.1, type: 'REP', description: '1 PUSHUP', created_at: new Date().toISOString() },
    { id: '2', amount: 0.5, type: 'AD', description: 'Rewarded video', created_at: new Date().toISOString() }
  ]});
});

app.get('/api/competitions', (req, res) => {
  res.json([
    { id: '1', title: 'Челлендж: 1000 отжиманий', description: 'Кто больше за неделю', prize_pool: 500, participants: 42, ends_at: new Date(Date.now()+86400000*3).toISOString(), joined: false },
    { id: '2', title: 'Новичок: 100 за день', description: 'Для начинающих', prize_pool: 100, participants: 128, ends_at: new Date(Date.now()+86400000).toISOString(), joined: true }
  ]);
});

app.get('/api/stats', (req, res) => {
  res.json({ total_workouts: 12, total_reps: 342, total_earned: 34.2, avg_technique: 87, max_reps: 50, weekly: [{date: '2024-01-01', reps: 20}] });
});

app.get('/api/leaderboard', (req, res) => {
  res.json([
    { rank: 1, user_id: '1', display_name: 'Алексей', reps: 342 },
    { rank: 2, user_id: '2', display_name: 'Мария', reps: 298 },
    { rank: 3, user_id: '3', display_name: 'Иван', reps: 250 }
  ]);
});

// Static demo for web preview
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
