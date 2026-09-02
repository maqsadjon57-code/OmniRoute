import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/aifitness',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20
});

pool.on('connect', () => console.log('✅ PostgreSQL connected'));
pool.on('error', (err) => console.error('PG error', err));

export async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        display_name VARCHAR(100),
        phone VARCHAR(20),
        email_verified BOOLEAN DEFAULT false,
        phone_verified BOOLEAN DEFAULT false,
        balance DECIMAL(10,2) DEFAULT 0,
        total_reps INT DEFAULT 0,
        level INT DEFAULT 1,
        xp INT DEFAULT 0,
        is_premium BOOLEAN DEFAULT false,
        premium_until TIMESTAMP,
        referral_code VARCHAR(20) UNIQUE,
        referred_by UUID REFERENCES users(id),
        daily_reps INT DEFAULT 0,
        weekly_reps INT DEFAULT 0,
        last_rep_date DATE,
        is_blocked BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS workouts (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        exercise_type VARCHAR(20) NOT NULL,
        reps INT NOT NULL,
        duration_sec INT,
        calories FLOAT,
        earned_rub DECIMAL(10,2),
        technique_score FLOAT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS reps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workout_id UUID REFERENCES workouts(id),
        user_id UUID REFERENCES users(id),
        index INT,
        start_ts BIGINT,
        end_ts BIGINT,
        min_elbow_angle FLOAT,
        max_elbow_angle FLOAT,
        back_deviation FLOAT,
        depth_score FLOAT,
        duration_ms INT,
        is_valid BOOLEAN,
        verified_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS balance_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        amount DECIMAL(10,2) NOT NULL,
        type VARCHAR(20) NOT NULL, -- REP, AD, BONUS, WITHDRAW, PURCHASE, REFERRAL, COMPETITION
        description TEXT,
        status VARCHAR(20) DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS achievements (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(100),
        description TEXT,
        target INT,
        reward_rub DECIMAL(10,2)
      );

      CREATE TABLE IF NOT EXISTS user_achievements (
        user_id UUID REFERENCES users(id),
        achievement_id VARCHAR(50) REFERENCES achievements(id),
        progress INT DEFAULT 0,
        unlocked BOOLEAN DEFAULT false,
        unlocked_at TIMESTAMP,
        PRIMARY KEY (user_id, achievement_id)
      );

      CREATE TABLE IF NOT EXISTS competitions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(200) NOT NULL,
        description TEXT,
        prize_pool DECIMAL(10,2),
        exercise_type VARCHAR(20) DEFAULT 'PUSHUP',
        target_reps INT,
        start_at TIMESTAMP DEFAULT NOW(),
        end_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS competition_participants (
        competition_id UUID REFERENCES competitions(id),
        user_id UUID REFERENCES users(id),
        reps INT DEFAULT 0,
        joined_at TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY (competition_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS referrals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        referrer_id UUID REFERENCES users(id),
        referred_id UUID REFERENCES users(id) UNIQUE,
        reward_claimed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS ad_watches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        watched_at DATE DEFAULT CURRENT_DATE,
        count INT DEFAULT 0,
        UNIQUE(user_id, watched_at)
      );

      CREATE INDEX IF NOT EXISTS idx_workouts_user ON workouts(user_id);
      CREATE INDEX IF NOT EXISTS idx_balance_user ON balance_transactions(user_id);
      CREATE INDEX IF NOT EXISTS idx_reps_user ON reps(user_id);
    `);

    // Seed achievements
    await client.query(`
      INSERT INTO achievements (id, title, description, target, reward_rub) VALUES
      ('first_10', 'Первые 10', 'Сделай 10 отжиманий', 10, 1),
      ('daily_50', '50 в день', '50 отжиманий за день', 50, 2),
      ('hundred_club', 'Сотка', '100 за тренировку', 100, 5),
      ('marathon', 'Марафонец', '1000 всего', 1000, 10),
      ('technician', 'Технарь', 'Средняя техника >90%', 90, 3)
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log('✅ DB migrated');
  } finally {
    client.release();
  }
}
