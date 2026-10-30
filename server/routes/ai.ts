import { Router, Request, Response } from 'express';
import { GeminiService } from '../gemini.js';
import { requireAuth } from '../middleware/auth.js';

export const aiRouter = Router();

// POST /api/ai/generate - Generate summary or objective
aiRouter.post('/generate', async (req: Request, res: Response) => {
  try {
    const { type, fullName, targetJobRole, yearsOfExperience, skills, education, existingSummary, tone } = req.body;
    const userId = req.user?.id || null;

    if (type === 'objective') {
      const text = await GeminiService.generateCareerObjective(userId, {
        targetJobRole: targetJobRole || 'Software Professional',
        topSkills: skills
      });
      res.json({ result: text });
      return;
    }

    const summary = await GeminiService.generateSummary(userId, {
      fullName,
      targetJobRole,
      yearsOfExperience,
      skills,
      education,
      existingSummary,
      tone
    });

    res.json({ result: summary });
  } catch (err: any) {
    console.error('AI generate error:', err);
    res.status(500).json({ error: 'Failed to generate AI content.' });
  }
});

// POST /api/ai/improve - Improve text with active verbs and impact
aiRouter.post('/improve', async (req: Request, res: Response) => {
  try {
    const { roleOrProject, rawText, technologies } = req.body;
    const userId = req.user?.id || null;

    if (!rawText || !rawText.trim()) {
      res.status(400).json({ error: 'Text to improve is required.' });
      return;
    }

    const improved = await GeminiService.improveBulletPoints(userId, {
      roleOrProject: roleOrProject || 'Professional Experience',
      rawText,
      technologies
    });

    res.json({ result: improved });
  } catch (err: any) {
    console.error('AI improve error:', err);
    res.status(500).json({ error: 'Failed to improve text.' });
  }
});

// POST /api/ai/suggest-skills - Suggest ATS keywords & action verbs
aiRouter.post('/suggest-skills', async (req: Request, res: Response) => {
  try {
    const { targetJobRole, currentSkills } = req.body;
    const userId = req.user?.id || null;

    if (!targetJobRole) {
      res.status(400).json({ error: 'targetJobRole is required.' });
      return;
    }

    const suggestions = await GeminiService.suggestSkillsAndKeywords(userId, {
      targetJobRole,
      currentSkills: Array.isArray(currentSkills) ? currentSkills : []
    });

    res.json(suggestions);
  } catch (err: any) {
    console.error('AI suggest skills error:', err);
    res.status(500).json({ error: 'Failed to suggest skills.' });
  }
});
