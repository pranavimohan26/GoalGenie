import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AIService } from '../services/aiService';

export class MentorController {
  
  public static async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { goalId, message } = req.body;
      const userId = (req as any).user.userId;

      // 1. Fetch goal details
      const goal = await prisma.goal.findFirst({
        where: { id: goalId, userId, deletedAt: null },
        select: { title: true }
      });

      if (!goal) {
        return res.status(404).json({ success: false, message: 'Active goal context not found' });
      }

      // 2. Fetch milestone details
      const activeMilestone = await prisma.milestone.findFirst({
        where: { goalId, status: 'in_progress' },
        orderBy: { orderIndex: 'asc' },
        select: { id: true, title: true }
      });
      
      const activeMilestoneTitle = activeMilestone ? activeMilestone.title : 'General Overview';

      // 3. Fetch completed and pending tasks within active milestone for context
      const completedTasks: string[] = [];
      const pendingTasks: string[] = [];

      if (activeMilestone) {
        const tasks = await prisma.task.findMany({
          where: { milestoneId: activeMilestone.id },
          select: { title: true, isCompleted: true }
        });
        
        tasks.forEach(t => {
          if (t.isCompleted) {
            completedTasks.push(t.title);
          } else {
            pendingTasks.push(t.title);
          }
        });
      }

      // 4. Request advice from AI Mentor
      const mentorReply = await AIService.getMentorResponse(
        goal.title,
        activeMilestoneTitle,
        completedTasks,
        pendingTasks,
        message
      );

      res.status(200).json({
        success: true,
        reply: mentorReply
      });

    } catch (error) {
      next(error);
    }
  }
}
