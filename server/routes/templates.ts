import { Router, Request, Response } from 'express';
import { db } from '../db.js';

export const templateRouter = Router();

// GET /api/templates
templateRouter.get('/', (_req: Request, res: Response) => {
  const templates = db.getActiveTemplates();
  res.json({ templates });
});
