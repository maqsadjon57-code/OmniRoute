# Архитектура AI Fitness Camera Pro

## Диаграмма потока

```
[CameraX] -> [YUV -> RGB] -> [MediaPipe Pose Landmarker 33 точки]
   -> [AngleCalculator + KalmanFilter] -> [RepCounter State Machine UP/DOWN]
   -> [VoiceCoach TTS + UI Overlay]
   -> [RepDto + HMAC signature] -> [Retrofit -> Server]
   -> [Server: antifraud + repValidator + limits] -> [PostgreSQL + Redis]
   -> [Balance + Achievements + Leaderboard] -> [Client]
```

## Клиентская валидация (Kotlin)
- `RepCounter`: отслеживает угол локтя (11-13-15, 12-14-16), back deviation (shoulder-hip-ankle)
- Состояния: UP (≥160°) -> DOWN (≤90°) -> UP (≥160°) = 1 повтор
- Фильтр Калмана q=0.01 r=0.1 для сглаживания
- Debounce 500мс, длительность 400-5000мс

## Серверная валидация (TypeScript)
- `validateReps()`: повторяет проверки клиента, авторитетная
- `detectAnomalies()`: variance углов, avg duration, back deviation ratio
- `checkLimits()`: daily 1000, weekly 5000, Redis rate limit 30/min
- HMAC подпись: payload + timestamp, окно 5 минут

## База данных
- users: balance, daily_reps, weekly_reps, is_blocked, referral_code
- workouts: exercise_type, reps, earned_rub, technique_score
- reps: min/max elbow, back_deviation, duration
- balance_transactions: REP, AD, BONUS, WITHDRAW, REFERRAL
- competitions + participants (для WebSocket live)
- achievements + user_achievements

## Монетизация
- Базовая ставка 0.1₽, премиум 0.15₽ (проверяется is_premium из JWT)
- Ad: +0.5₽, лимит 5/день (ad_watches таблица)
- Реферал: +10₽ рефереру, +5₽ новому
- Вывод: комиссия 5% >=1000₽ иначе 10%, требует верификации

## WebSocket
- Аутентификация по JWT в handshake.auth.token
- Комнаты competition:{id}
- События: join-competition, rep-update -> leaderboard-update

## Безопасность
- JWT 15m + refresh 7d
- HTTPS, helmet, rateLimit
- Видео не покидает устройство
- GDPR: удаление аккаунта каскадом

## Масштабирование
- Stateless API за балансировщиком
- Redis для rate limiting и pub/sub
- PostgreSQL с индексами по user_id
- Prometheus + Grafana мониторинг
