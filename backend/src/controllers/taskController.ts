import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { RiskService } from '../services/riskService';

export class TaskController {
  
  public static async updateTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { isCompleted } = req.body;
      const userId = (req as any).user.userId;

      // 1. Fetch task and check ownership
      const task = await prisma.task.findFirst({
        where: {
          id,
          milestone: {
            goal: { userId, deletedAt: null }
          }
        },
        include: {
          milestone: {
            include: { goal: true }
          }
        }
      });

      if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found or unauthorized access' });
      }

      // 2. Perform transaction sequence using prisma.$transaction
      const result = await prisma.$transaction(async tx => {
        // Update task completion
        await tx.task.update({
          where: { id },
          data: {
            isCompleted,
            completedAt: isCompleted ? new Date() : null
          }
        });

        // Query sibling tasks to check milestone status
        const siblingTasks = await tx.task.findMany({
          where: { milestoneId: task.milestoneId }
        });
        const allCompleted = siblingTasks.every(t => t.isCompleted);
        
        let milestoneCompletedUnlocked = false;

        if (allCompleted && siblingTasks.length > 0) {
          await tx.milestone.update({
            where: { id: task.milestoneId },
            data: {
              status: 'completed',
              completedAt: new Date()
            }
          });
          milestoneCompletedUnlocked = true;

          // Activate next milestone in line
          const nextMilestone = await tx.milestone.findFirst({
            where: {
              goalId: task.milestone.goalId,
              orderIndex: task.milestone.orderIndex + 1,
              status: 'pending'
            }
          });

          if (nextMilestone) {
            await tx.milestone.update({
              where: { id: nextMilestone.id },
              data: { status: 'in_progress' }
            });
          }
        } else {
          await tx.milestone.update({
            where: { id: task.milestoneId },
            data: {
              status: 'in_progress',
              completedAt: null
            }
          });
        }

        // Calculate Goal Completion Percentage
        const goalTasks = await tx.task.findMany({
          where: {
            milestone: { goalId: task.milestone.goalId }
          }
        });
        const totalTasks = goalTasks.length;
        const completedTasks = goalTasks.filter(t => t.isCompleted).length;
        const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        await tx.goal.update({
          where: { id: task.milestone.goalId },
          data: { completionPercentage }
        });

        // XP updates calculations
        let xpGranted = isCompleted ? 15 : -15;
        if (milestoneCompletedUnlocked && isCompleted) xpGranted += 100;

        // Apply XP updates to user
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            xp: { increment: xpGranted }
          }
        });

        // Award achievements
        let newBadge = null;
        if (milestoneCompletedUnlocked && isCompleted) {
          const hasBadge = await tx.achievement.findFirst({
            where: { userId, badgeName: 'Milestone Crusher' }
          });
          if (!hasBadge) {
            newBadge = {
              badgeName: 'Milestone Crusher',
              description: 'Completed your first full learning roadmap milestone!',
              iconKey: 'shield'
            };
            await tx.achievement.create({
              data: {
                userId,
                badgeName: newBadge.badgeName,
                description: newBadge.description,
                iconKey: newBadge.iconKey
              }
            });
          }
        }

        if (updatedUser.currentStreak >= 5) {
          const hasStreakBadge = await tx.achievement.findFirst({
            where: { userId, badgeName: 'Streak Master' }
          });
          if (!hasStreakBadge) {
            newBadge = {
              badgeName: 'Streak Master',
              description: 'Maintain a study streak of 5 or more consecutive days!',
              iconKey: 'flame'
            };
            await tx.achievement.create({
              data: {
                userId,
                badgeName: newBadge.badgeName,
                description: newBadge.description,
                iconKey: newBadge.iconKey
              }
            });
          }
        }

        return {
          completionPercentage,
          newXp: updatedUser.xp,
          xpGained: xpGranted,
          newBadge
        };
      });

      // 3. Trigger async risk calculation update
      await RiskService.calculateGoalRisk(task.milestone.goalId);

      res.status(200).json({
        success: true,
        message: 'Task progress updated successfully',
        task: {
          id,
          isCompleted
        },
        metrics: result
      });

    } catch (error) {
      next(error);
    }
  }
}
