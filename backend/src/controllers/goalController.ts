import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AIService } from '../services/aiService';
import { RiskService } from '../services/riskService';

export class GoalController {
  
  public static async listGoals(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      
      const goals = await prisma.goal.findMany({
        where: {
          userId,
          deletedAt: null
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Map response format to support camel-to-snake expected properties
      const mappedGoals = goals.map(g => ({
        id: g.id,
        user_id: g.userId,
        title: g.title,
        description: g.description,
        duration_months: g.durationMonths,
        knowledge_level: g.knowledgeLevel,
        daily_time_commitment: g.dailyTimeCommitment,
        completion_percentage: g.completionPercentage,
        risk_score: g.riskScore,
        status: g.status,
        created_at: g.createdAt
      }));

      res.status(200).json({ success: true, goals: mappedGoals });
    } catch (error) {
      next(error);
    }
  }

  public static async createGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const { title, durationMonths, knowledgeLevel, dailyTimeCommitment } = req.body;

      // 1. Get user configuration preferences
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { learningStyle: true, hoursPerDay: true }
      });

      if (!user) {
        return res.status(404).json({ success: false, message: 'User profile not found' });
      }

      // 2. Query AI model for roadmap syllabus mapping
      const roadmap = await AIService.generateRoadmap(
        title,
        durationMonths,
        knowledgeLevel,
        dailyTimeCommitment || user.hoursPerDay || 2,
        user.learningStyle || 'visual'
      );

      // 3. Write data to DB in a nested transaction using Prisma
      const newGoal = await prisma.goal.create({
        data: {
          userId,
          title: roadmap.title,
          description: roadmap.description || '',
          durationMonths: parseInt(durationMonths),
          knowledgeLevel,
          dailyTimeCommitment: dailyTimeCommitment ? parseInt(dailyTimeCommitment) : user.hoursPerDay,
          milestones: {
            create: roadmap.milestones.map((mil, i) => {
              const targetDate = new Date();
              targetDate.setDate(targetDate.getDate() + (mil.weeksDuration * 7));
              
              return {
                title: mil.title,
                description: mil.description || '',
                orderIndex: mil.orderIndex,
                targetDate,
                status: i === 0 ? 'in_progress' : 'pending',
                tasks: {
                  create: mil.tasks.map(t => ({
                    title: t.title,
                    description: t.description || '',
                    estimatedMinutes: t.estimatedMinutes,
                    orderIndex: t.orderIndex
                  }))
                },
                resources: {
                  create: mil.resources?.map(r => ({
                    title: r.title,
                    type: r.type,
                    url: r.url,
                    rationale: r.rationale || ''
                  })) || []
                }
              };
            })
          }
        }
      });

      // 4. Trigger initial risk calculation in background
      await RiskService.calculateGoalRisk(newGoal.id);

      res.status(202).json({
        success: true,
        message: 'Goal registered and roadmap decomposed successfully',
        goalId: newGoal.id
      });

    } catch (error) {
      next(error);
    }
  }

  public static async getGoalDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.userId;

      const goal = await prisma.goal.findFirst({
        where: {
          id,
          userId,
          deletedAt: null
        },
        include: {
          milestones: {
            orderBy: { orderIndex: 'asc' },
            include: {
              tasks: { orderBy: { orderIndex: 'asc' } },
              resources: true
            }
          }
        }
      });

      if (!goal) {
        return res.status(404).json({ success: false, message: 'Goal not found' });
      }

      // Map database schema response to frontend snake_case attributes
      const mappedGoal = {
        id: goal.id,
        user_id: goal.userId,
        title: goal.title,
        description: goal.description,
        duration_months: goal.durationMonths,
        knowledge_level: goal.knowledgeLevel,
        daily_time_commitment: goal.dailyTimeCommitment,
        completion_percentage: goal.completionPercentage,
        risk_score: goal.riskScore,
        status: goal.status,
        created_at: goal.createdAt,
        milestones: goal.milestones.map(m => ({
          id: m.id,
          goal_id: m.goalId,
          title: m.title,
          description: m.description,
          order_index: m.orderIndex,
          target_date: m.targetDate,
          status: m.status,
          completed_at: m.completedAt,
          tasks: m.tasks.map(t => ({
            id: t.id,
            milestone_id: t.milestoneId,
            title: t.title,
            description: t.description,
            estimated_minutes: t.estimatedMinutes,
            order_index: t.orderIndex,
            is_completed: t.isCompleted,
            completed_at: t.completedAt
          })),
          resources: m.resources.map(r => ({
            id: r.id,
            milestone_id: r.milestoneId,
            title: r.title,
            type: r.type,
            url: r.url,
            rationale: r.rationale
          }))
        }))
      };

      res.status(200).json({
        success: true,
        goal: mappedGoal
      });

    } catch (error) {
      next(error);
    }
  }

  public static async deleteGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.userId;

      const goal = await prisma.goal.findFirst({
        where: { id, userId, deletedAt: null }
      });

      if (!goal) {
        return res.status(404).json({ success: false, message: 'Goal not found or already deleted' });
      }

      // Soft delete
      await prisma.goal.update({
        where: { id: goal.id },
        data: { deletedAt: new Date() }
      });

      res.status(200).json({ success: true, message: 'Goal soft-deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  public static async adaptGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.userId;

      // 1. Verify goal ownership
      const goal = await prisma.goal.findFirst({
        where: { id, userId, deletedAt: null }
      });

      if (!goal) {
        return res.status(404).json({ success: false, message: 'Goal not found' });
      }

      // 2. Fetch pending tasks counts
      const pendingTasksCount = await prisma.task.count({
        where: {
          milestone: { goalId: id },
          isCompleted: false
        }
      });

      // 3. Request recovery suggestions from AI
      const recoveryMessage = await AIService.suggestRecoveryStrategy(
        goal.title,
        pendingTasksCount,
        7 // simulated delay of 7 days
      );

      // 4. Shift target dates of unfinished milestones forward
      const pendingMilestones = await prisma.milestone.findMany({
        where: {
          goalId: id,
          NOT: { status: 'completed' }
        }
      });

      for (const mil of pendingMilestones) {
        const shiftedDate = new Date(mil.targetDate);
        shiftedDate.setDate(shiftedDate.getDate() + 14); // Delay by 14 days
        
        await prisma.milestone.update({
          where: { id: mil.id },
          data: { targetDate: shiftedDate }
        });
      }

      // 5. Create a system notification alerting the user of the recalculated path
      await prisma.notification.create({
        data: {
          userId,
          type: 'risk_alert',
          message: `AI recalibrated plan: "${recoveryMessage}"`
        }
      });

      // 6. Recalculate Risk Score
      const newRisk = await RiskService.calculateGoalRisk(id);

      res.status(200).json({
        success: true,
        message: 'Plan successfully adapted by AI Mentor.',
        recoveryStrategy: recoveryMessage,
        newRiskScore: newRisk
      });

    } catch (error) {
      next(error);
    }
  }
}
