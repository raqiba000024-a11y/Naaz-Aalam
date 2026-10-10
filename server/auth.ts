import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { db } from './db.js';
import { User } from '../src/types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'aura-atelier-super-secure-luxury-jwt-secret-key-2026';

export interface AuthRequest extends Request {
  user?: User;
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Please sign in.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: 'customer' | 'admin' };
    const user = db.getUserById(decoded.id);
    if (!user) {
      res.status(401).json({ error: 'User session expired or invalid.' });
      return;
    }
    const { passwordHash, ...cleanUser } = user;
    req.user = cleanUser;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const user = db.getUserById(decoded.id);
      if (user) {
        const { passwordHash, ...cleanUser } = user;
        req.user = cleanUser;
      }
    } catch {
      // Ignore token failure for optional auth
    }
  }
  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  authenticate(req, res, () => {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Access forbidden. Administrator privileges required.' });
      return;
    }
    next();
  });
}
