# API Спецификация

Base URL: https://api.aifitness.pro

## Auth
POST /api/auth/register {email, password, displayName, referralCode?} -> {token, refreshToken, user}
POST /api/auth/login {email, password} -> {token, refreshToken, user}

Header: Authorization: Bearer <jwt>
Headers for anti-fraud: X-Signature, X-Timestamp

## Reps Verification (ключевой эндпоинт)
POST /api/reps/verify
Body:
{
  exerciseType: "PUSHUP",
  workoutId: "uuid",
  timestamp: 1710000000000,
  signature: "hmac_sha256_hex",
  reps: [
    {
      index: 0,
      startTs: 1710000000000,
      endTs: 1710000001500,
      minElbowAngle: 75,
      maxElbowAngle: 170,
      backDeviation: 8,
      depthScore: 85,
      durationMs: 1500,
      keypoints: [{x,y,z,visibility,type}, ...] // sampled
    }
  ]
}
Response:
{
  verifiedCount: 1,
  rejectedCount: 0,
  earnedRub: 0.1,
  newBalance: 23.6,
  achievementsUnlocked: ["first_10"],
  techniqueFeedback: "Отличная техника!"
}

Логика сервера:
- checkLimits: daily 1000, weekly 5000, is_blocked
- detectAnomalies: avg duration, variance
- validateReps: min ≤90, max ≥160, back <20, duration 400-5000, interval 500ms
- Начисление: verified * (isPremium?0.15:0.1)
- Обновление competitions, achievements, xp

## Balance
GET /api/balance -> {balance, pendingWithdraw, history: []}
POST /api/balance/withdraw {amount, method: "yookassa|stripe", details} -> {success, finalAmount, commission}
POST /api/ads/reward -> {balance, earned: 0.5} (лимит 5/день)

## Competitions
GET /api/competitions -> [{id, title, description, prizePool, participants, endsAt, joined}]
POST /api/competitions/:id/join -> {joined:true}
GET /api/competitions/:id/leaderboard -> [{rank, userId, displayName, reps}]

## Stats
GET /api/stats -> {total_workouts, total_reps, total_earned, avg_technique, max_reps, weekly: [{date, reps}]}
GET /api/leaderboard?period=week|month|all -> [{rank, userId, displayName, reps}]

## WebSocket
URL: wss://api.aifitness.pro
Auth: {token}
Events:
- join-competition (competitionId)
- rep-update {competitionId, reps}
- leaderboard-update {userId, reps, timestamp} (broadcast)

## Errors
400 - Bad request, missing signature, stale timestamp
401 - No token / Invalid token
403 - Limit exceeded, blocked, anomaly, verification required
429 - Rate limit
