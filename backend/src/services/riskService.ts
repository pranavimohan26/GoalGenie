import { prisma } from '../config/db';

export class RiskService {
  
  public static async calculateGoalRisk(goalId: string): Promise<number> {
    try {
      // 1. Fetch goal details
      const goal = await prisma.goal.findFirst({
        where: {
          id: goalId,
          deletedAt: null
        },
        select: {
          id: true,
          dailyTimeCommitment: true,
          createdAt: true,
          durationMonths: true
        }
      });

      if (!goal) return 0;

      // 2. Fetch task counts and details
      const tasks = await prisma.task.findMany({
        where: {
          milestone: {
            goalId
          }
        },
        select: {
          isCompleted: true,
          estimatedMinutes: true
        }
      });

      if (tasks.length === 0) return 0;

      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.isCompleted).length;
      
      // Basic execution efficiency E
      const efficiency = totalTasks > 0 ? (completedTasks / totalTasks) : 1;
      const adaptiveEfficiency = Math.max(0.1, efficiency);

      // 3. Compute remaining estimate hours (T_est)
      const pendingTasks = tasks.filter(t => !t.isCompleted);
      const totalEstimatedMinutes = pendingTasks.reduce((acc, t) => acc + t.estimatedMinutes, 0);
      const remainingHours = totalEstimatedMinutes / 60;

      if (remainingHours === 0) return 0; // Completed or no tasks

      // 4. Calculate days remaining (T_rem)
      const creationDate = new Date(goal.createdAt);
      const targetDate = new Date(creationDate);
      targetDate.setMonth(targetDate.getMonth() + goal.durationMonths);
      
      const today = new Date();
      const timeDiff = targetDate.getTime() - today.getTime();
      const daysRemaining = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));

      // 5. Calculate required daily hours
      const requiredHoursPerDay = remainingHours / daysRemaining;

      // Available daily hours
      const availableHours = goal.dailyTimeCommitment || 2;

      // Risk score: 1 - (availableHours * efficiency / requiredHoursPerDay)
      let riskScore = 1 - ((availableHours * adaptiveEfficiency) / requiredHoursPerDay);
      riskScore = Math.max(0, Math.min(0.99, riskScore));

      // Update goal risk status
      await prisma.goal.update({
        where: { id: goalId },
        data: { riskScore }
      });

      return parseFloat(riskScore.toFixed(3));

    } catch (error) {
      console.error('Error in RiskService.calculateGoalRisk:', error);
      return 0.1; // Baseline risk
    }
  }
}
