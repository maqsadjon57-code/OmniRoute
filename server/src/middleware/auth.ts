import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; isPremium: boolean };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token' });
  const token = header.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    req.user = { id: payload.id, email: payload.email, isPremium: payload.isPremium || false };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function generateTokens(user: { id: string; email: string; isPremium?: boolean }) {
  const secret = process.env.JWT_SECRET || 'secret';
  const refreshSecret = process.env.JWT_REFRESH_SECRET || 'refresh-secret';
  const token = jwt.sign({ id: user.id, email: user.email, isPremium: user.isPremium }, secret, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user.id }, refreshSecret, { expiresIn: '7d' });
  return { token, refreshToken };
}
