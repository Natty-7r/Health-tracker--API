import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtAuthPayload, RequestWithUser } from '../types/api';
import config from '../config/config';
import ApiService from '../api/service';

// Middleware to extract and verify token

export const authGuard = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  console.log(req.path);
  const authHeader = req.headers.authorization;
  const escapedRoutes = [
    '/auth/forgot',
    '/auth/login',
    '/auth/reset',
    '/auth/verify',
    '/auth/verify-account',
    '/auth/doctor/login',
    '/auth/user/login',
    '/auth/create-doctor',
    '/user/add-data',
  ];

  if (escapedRoutes.includes(req.path)) return next();

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret as string) as JwtAuthPayload;

    console.log(decoded);
    const { status, data } = await ApiService.findUserOrDoctorWithId(decoded.id);

    console.log(status, data);
    if (status == 'fail') return res.status(401).json({ message: 'Unauthorized' });

    req.user = { ...data, role: decoded.role }; // Attach user info to request object
    next();
  } catch (err: any) {
    console.log(err.message);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

// Middleware to check user role
export const roleGuard = (requiredRole: string) => {
  return (req: RequestWithUser, res: Response, next: NextFunction) => {
    const user = req.user as JwtAuthPayload;
    if (user.role !== requiredRole) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    next();
  };
};
