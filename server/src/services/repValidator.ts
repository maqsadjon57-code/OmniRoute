/**
 * Server-side rep validation - mirrors client logic but authoritative
 * Each rep must satisfy:
 * - min elbow <=90, max >=160
 * - back deviation <20
 * - duration 0.4-5 sec
 * - timestamps sequential
 * - min interval 0.5 sec between reps
 */

export interface RepInput {
  index: number;
  startTs: number;
  endTs: number;
  minElbowAngle: number;
  maxElbowAngle: number;
  backDeviation: number;
  depthScore: number;
  durationMs: number;
  keypoints?: any[];
}

export interface ValidationResult {
  verified: RepInput[];
  rejected: { rep: RepInput; reason: string }[];
  earnedRub: number;
  techniqueFeedback?: string;
}

export function validateReps(reps: RepInput[], isPremium: boolean = false): ValidationResult {
  const verified: RepInput[] = [];
  const rejected: { rep: RepInput; reason: string }[] = [];

  let lastEndTs = 0;

  for (const rep of reps) {
    const duration = rep.durationMs || (rep.endTs - rep.startTs);

    if (duration < 400) {
      rejected.push({ rep, reason: 'Too fast <400ms' });
      continue;
    }
    if (duration > 5000) {
      rejected.push({ rep, reason: 'Too slow >5s' });
      continue;
    }
    if (rep.minElbowAngle > 90) {
      rejected.push({ rep, reason: `Not deep enough ${rep.minElbowAngle} >90` });
      continue;
    }
    if (rep.maxElbowAngle < 160) {
      rejected.push({ rep, reason: `Not fully extended ${rep.maxElbowAngle} <160` });
      continue;
    }
    if (rep.backDeviation > 20) {
      rejected.push({ rep, reason: `Back deviation ${rep.backDeviation} >20` });
      continue;
    }
    if (lastEndTs && rep.startTs - lastEndTs < 500) {
      rejected.push({ rep, reason: 'Interval <500ms' });
      continue;
    }
    if (rep.startTs >= rep.endTs) {
      rejected.push({ rep, reason: 'Invalid timestamps' });
      continue;
    }

    // All good
    verified.push(rep);
    lastEndTs = rep.endTs;
  }

  const rate = isPremium ? 0.15 : 0.1;
  const earnedRub = verified.length * rate;

  let feedback: string | undefined;
  if (rejected.length > verified.length) {
    feedback = 'Попробуйте улучшить технику: глубже и прямее спина';
  } else if (verified.length > 0) {
    feedback = 'Отличная техника! Так держать!';
  }

  return { verified, rejected, earnedRub, techniqueFeedback: feedback };
}

export function calculateCalories(reps: number, exerciseType: string = 'PUSHUP'): number {
  const map: Record<string, number> = {
    PUSHUP: 0.5,
    SQUAT: 0.4,
    LUNGE: 0.6,
    PLANK: 0.3,
    SITUP: 0.35
  };
  return reps * (map[exerciseType] || 0.5);
}

export function calculateTechniqueScore(reps: RepInput[]): number {
  if (reps.length === 0) return 0;
  const avgDepth = reps.reduce((s, r) => s + (90 - r.minElbowAngle), 0) / reps.length;
  const avgBack = reps.reduce((s, r) => s + r.backDeviation, 0) / reps.length;
  const depthScore = Math.min(100, Math.max(0, (avgDepth / 30) * 100 + 50));
  const backScore = Math.max(0, 100 - avgBack * 3);
  return (depthScore * 0.6 + backScore * 0.4);
}
