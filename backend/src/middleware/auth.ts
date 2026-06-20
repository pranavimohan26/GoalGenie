import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_change_me_in_production';

export interface TokenPayload {
  userId: string;
  role: string;
  email: string;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
    
    // Attach user information to request
    (req as any).user = decoded as TokenPayload;
    next();
  });
};

export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as TokenPayload | undefined;
    
    if (!user || user.role !== role) {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden: This action requires an administrator role` 
      });
    }
    
    next();
  };
};
