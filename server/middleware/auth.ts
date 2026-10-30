import { Request, Response, NextFunction } from 'express';
import { db, User } from '../db.js';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Check session first
  const sessionUserId = (req.session as any)?.userId;
  // Also support Bearer token or custom header for flexible client API calls
  const authHeader = req.headers.authorization;
  let tokenUserId: number | null = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const raw = authHeader.replace('Bearer ', '').trim();
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed)) {
      tokenUserId = parsed;
    }
  }

  const userId = sessionUserId || tokenUserId;

  if (userId) {
    const user = db.findUserById(userId);
    if (user && user.status === 'active') {
      req.user = user;
    }
  }

  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return;
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return;
  }
  if (req.user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    return;
  }
  next();
}
