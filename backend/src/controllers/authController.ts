import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_change_me_in_production';

export class AuthController {
  
  public static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        email,
        password,
        fullName,
        age,
        education,
        skillLevel,
        hoursPerDay,
        learningStyle,
        interests
      } = req.body;

      // 1. Check if email already registered
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });
      
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email address already in use' });
      }

      // 2. Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // 3. Create user in database
      const newUser = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          fullName,
          age: age ? parseInt(age) : null,
          education: education || null,
          skillLevel: skillLevel || 'beginner',
          hoursPerDay: hoursPerDay ? parseInt(hoursPerDay) : 2,
          learningStyle: learningStyle || 'visual',
          interests: interests || null,
          xp: 10,
          role: 'user',
          achievements: {
            create: {
              badgeName: 'First Steps',
              description: 'Successfully set up your AI Life Navigator profile',
              iconKey: 'award'
            }
          }
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true
        }
      });

      // 4. Generate JWT token
      const token = jwt.sign(
        { userId: newUser.id, role: newUser.role, email: newUser.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        success: true,
        message: 'Account registered successfully',
        token,
        user: newUser
      });

    } catch (error) {
      next(error);
    }
  }

  public static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      // 1. Find user
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      // 2. Verify password
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      // 3. Update login streak
      const now = new Date();
      const lastUpdate = new Date(user.updatedAt);
      const diffTime = Math.abs(now.getTime() - lastUpdate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let newStreak = user.currentStreak;
      if (diffDays <= 1) {
        if (diffDays === 1) newStreak += 1;
      } else {
        newStreak = 1;
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { currentStreak: newStreak },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          currentStreak: true,
          xp: true
        }
      });

      // 4. Generate JWT
      const token = jwt.sign(
        { userId: updatedUser.id, role: updatedUser.role, email: updatedUser.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(200).json({
        success: true,
        token,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          fullName: updatedUser.fullName,
          role: updatedUser.role,
          streak: updatedUser.currentStreak,
          xp: updatedUser.xp
        }
      });

    } catch (error) {
      next(error);
    }
  }

  public static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;

      const profile = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          achievements: {
            select: {
              id: true,
              badgeName: true,
              description: true,
              iconKey: true,
              unlockedAt: true
            }
          }
        }
      });

      if (!profile) {
        return res.status(404).json({ success: false, message: 'User profile not found' });
      }

      // Map snake case fields to support frontend expectations
      res.status(200).json({
        success: true,
        profile: {
          id: profile.id,
          email: profile.email,
          fullName: profile.fullName,
          age: profile.age,
          education: profile.education,
          skillLevel: profile.skillLevel,
          hoursPerDay: profile.hoursPerDay,
          learningStyle: profile.learningStyle,
          interests: profile.interests,
          xp: profile.xp,
          current_streak: profile.currentStreak,
          role: profile.role,
          created_at: profile.createdAt,
          achievements: profile.achievements.map(a => ({
            id: a.id,
            badge_name: a.badgeName,
            description: a.description,
            icon_key: a.iconKey,
            unlocked_at: a.unlockedAt
          }))
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
