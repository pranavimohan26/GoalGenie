import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';

export class AdminController {
  
  public static async getPlatformMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. Gather counts
      const userCount = await prisma.user.count();
      const goalCount = await prisma.goal.count({ where: { deletedAt: null } });
      const activeGoals = await prisma.goal.count({ where: { status: 'active', deletedAt: null } });
      const completedGoals = await prisma.goal.count({ where: { status: 'completed', deletedAt: null } });
      
      const allActiveGoals = await prisma.goal.findMany({
        where: { deletedAt: null },
        select: { riskScore: true }
      });
      const avgRisk = allActiveGoals.length > 0 
        ? allActiveGoals.reduce((acc, g) => acc + g.riskScore, 0) / allActiveGoals.length
        : 0;

      // 2. Load recent signups
      const recentUsers = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          xp: true,
          createdAt: true
        }
      });

      // Map recentUsers key attributes to support frontend snake_case expectations
      const mappedRecentUsers = recentUsers.map(u => ({
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        role: u.role,
        xp: u.xp,
        created_at: u.createdAt
      }));

      // 3. Load high risk goals
      const highRiskGoals = await prisma.goal.findMany({
        where: {
          riskScore: { gt: 0.35 },
          deletedAt: null
        },
        orderBy: {
          riskScore: 'desc'
        },
        take: 10,
        include: {
          user: {
            select: {
              fullName: true,
              email: true
            }
          }
        }
      });

      const mappedHighRiskGoals = highRiskGoals.map(g => ({
        id: g.id,
        title: g.title,
        risk_score: g.riskScore,
        completion_percentage: g.completionPercentage,
        full_name: g.user.fullName,
        email: g.user.email
      }));

      res.status(200).json({
        success: true,
        stats: {
          totalUsers: userCount,
          totalGoals: goalCount,
          activeGoals,
          completedGoals,
          averageRiskScore: parseFloat(avgRisk.toFixed(3))
        },
        recentUsers: mappedRecentUsers,
        highRiskGoals: mappedHighRiskGoals
      });

    } catch (error) {
      next(error);
    }
  }

  public static async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      await prisma.user.delete({ where: { id } });

      res.status(200).json({ success: true, message: 'User account deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
