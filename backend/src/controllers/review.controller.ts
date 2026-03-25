import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma';
import { runReviewStage } from '../services/gemini.service';

const analyzeSchema = z.object({
  code: z.string().min(1),
  language: z.string().min(1),
  filename: z.string().optional(),
});

export const analyzeCode = async (req: Request, res: Response) => {
  try {
    const parsed = analyzeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input', code: 'VALIDATION_ERROR' });
    }

    const { code, language, filename } = parsed.data;
    const userId = (req.user as any).id;

    // Create session
    const session = await prisma.reviewSession.create({
      data: {
        userId,
        language,
        codeSnippet: code,
        filename
      }
    });

    // Run 4 stages sequentially
    const stages = ['DEV', 'SECURITY', 'DEPLOY', 'PRODUCTION'];
    const reports = [];

    for (const stage of stages) {
      const result = await runReviewStage(stage, code, language);
      
      const report = await prisma.reviewReport.create({
        data: {
          sessionId: session.id,
          stage: stage as any,
          overallScore: result.score || 0,
          findings: result.findings || [],
          suggestions: result.suggestions || []
        }
      });
      reports.push({ ...report, summary: result.summary });
    }

    const overallScore = Math.round(reports.reduce((acc, curr) => acc + curr.overallScore, 0) / 4);

    return res.json({
      session: { ...session, overallScore },
      reports
    });
  } catch (error) {
    console.error('Analyze Error:', error);
    return res.status(500).json({ error: 'Failed to analyze code', code: 'INTERNAL_ERROR' });
  }
};

export const getHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const sessions = await prisma.reviewSession.findMany({
      where: { userId },
      select: {
        id: true,
        language: true,
        filename: true,
        createdAt: true,
        reports: {
          select: { overallScore: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    const formattedSessions = sessions.map((session: any) => {
      const avg = session.reports.length > 0 
        ? Math.round(session.reports.reduce((acc: number, curr: any) => acc + curr.overallScore, 0) / session.reports.length) 
        : 0;
      return {
        id: session.id,
        language: session.language,
        filename: session.filename,
        createdAt: session.createdAt,
        overallScore: avg
      };
    });

    return res.json(formattedSessions);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch history', code: 'INTERNAL_ERROR' });
  }
};

export const getHistoryDetail = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const sessionId = req.params.sessionId as string;

    const session = await prisma.reviewSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        reports: true
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found', code: 'NOT_FOUND' });
    }

    const overallScore = (session as any).reports.length > 0 
        ? Math.round((session as any).reports.reduce((acc: number, curr: any) => acc + curr.overallScore, 0) / (session as any).reports.length) 
        : 0;

    return res.json({
      ...session,
      overallScore
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch history detail', code: 'INTERNAL_ERROR' });
  }
};

export const deleteHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const sessionId = req.params.sessionId as string;

    const session = await prisma.reviewSession.findFirst({
      where: { id: sessionId, userId }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found', code: 'NOT_FOUND' });
    }

    await prisma.reviewSession.delete({
      where: { id: sessionId as string }
    });

    return res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete session', code: 'INTERNAL_ERROR' });
  }
};
