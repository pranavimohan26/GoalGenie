import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { AIService } from '../services/aiService';

export const getLearningSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { milestoneId } = req.params;

    let session = await prisma.learningSession.findUnique({
      where: { milestoneId }
    });

    if (session) {
      res.status(200).json({ success: true, session });
      return;
    }

    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: { goal: true }
    });

    if (!milestone) {
      res.status(404).json({ success: false, message: 'Milestone not found' });
      return;
    }

    const aiContent = await AIService.generateLearningContent(milestone.title, milestone.goal.title);

    session = await prisma.learningSession.create({
      data: {
        milestoneId,
        content: aiContent.content,
        practiceTasks: JSON.stringify(aiContent.practiceTasks),
        quiz: JSON.stringify(aiContent.quiz),
      }
    });

    res.status(200).json({ success: true, session });
  } catch (error) {
    console.error('Learning session error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve learning session' });
  }
};

export const submitQuiz = async (req: Request, res: Response): Promise<void> => {
  try {
    const { milestoneId } = req.params;
    const { score } = req.body;

    const session = await prisma.learningSession.update({
      where: { milestoneId },
      data: {
        quizScore: score,
        isCompleted: true
      }
    });

    res.status(200).json({ success: true, session });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit quiz score' });
  }
};
