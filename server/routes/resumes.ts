import { Router, Request, Response } from 'express';
import { db, Resume } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

export const resumeRouter = Router();

// Helper to calculate resume completeness percentage
function calculateCompleteness(resume: Partial<Resume>): number {
  let score = 0;
  if (resume.personal_info?.fullName) score += 10;
  if (resume.personal_info?.email) score += 10;
  if (resume.personal_info?.phone) score += 5;
  if (resume.personal_info?.location) score += 5;
  if (resume.target_job_role) score += 10;
  if (resume.career_summary && resume.career_summary.length > 20) score += 15;
  if (resume.education && resume.education.length > 0) score += 15;
  if (resume.skills && (
    (resume.skills.programmingLanguages && resume.skills.programmingLanguages.length > 0) ||
    (resume.skills.technicalSkills && resume.skills.technicalSkills.length > 0) ||
    (resume.skills.frameworks && resume.skills.frameworks.length > 0)
  )) score += 15;
  if (resume.projects && resume.projects.length > 0) score += 10;
  if (resume.experience && resume.experience.length > 0) score += 5;
  return Math.min(score, 100);
}

// Helper to sync resume skills into user_skills table
function syncResumeSkills(userId: number, resume: Partial<Resume>) {
  if (!resume.skills) return;
  const extracted: Array<{ skill_name: string; proficiency: 'Beginner' | 'Intermediate' | 'Advanced'; source: 'resume' }> = [];

  const add = (names?: string[]) => {
    if (!names) return;
    for (const name of names) {
      if (name && name.trim()) {
        extracted.push({
          skill_name: name.trim(),
          proficiency: 'Intermediate',
          source: 'resume'
        });
      }
    }
  };

  add(resume.skills.programmingLanguages);
  add(resume.skills.frameworks);
  add(resume.skills.databases);
  add(resume.skills.tools);
  add(resume.skills.technicalSkills);
  add(resume.skills.softSkills);

  if (extracted.length > 0) {
    db.setUserSkills(userId, extracted);
  }
}

// GET /api/resumes
resumeRouter.get('/', requireAuth, (req: Request, res: Response) => {
  const resumes = db.getResumesByUserId(req.user!.id);
  res.json({ resumes });
});

// POST /api/resumes
resumeRouter.post('/', requireAuth, (req: Request, res: Response) => {
  try {
    const {
      title,
      template_id,
      target_job_role,
      personal_info,
      career_summary,
      career_objective,
      education,
      skills,
      projects,
      experience,
      certifications,
      additional_sections
    } = req.body;

    const resumePayload = {
      user_id: req.user!.id,
      title: title?.trim() || 'My Professional Resume',
      template_id: template_id || 'professional',
      target_job_role: target_job_role?.trim() || 'Software Engineer',
      personal_info: personal_info || {
        fullName: req.user!.name,
        email: req.user!.email,
        phone: '',
        location: ''
      },
      career_summary: career_summary || '',
      career_objective: career_objective || '',
      education: education || [],
      skills: skills || {
        programmingLanguages: [],
        frameworks: [],
        databases: [],
        tools: [],
        softSkills: [],
        technicalSkills: []
      },
      projects: projects || [],
      experience: experience || [],
      certifications: certifications || [],
      additional_sections: additional_sections || { languages: [], awards: [], extracurricular: [] },
      completion_percentage: 0
    };

    resumePayload.completion_percentage = calculateCompleteness(resumePayload);

    const created = db.createResume(resumePayload);
    syncResumeSkills(req.user!.id, created);

    res.status(201).json({ message: 'Resume created successfully.', resume: created });
  } catch (err: any) {
    console.error('Create resume error:', err);
    res.status(500).json({ error: 'Failed to create resume.' });
  }
});

// GET /api/resumes/:id
resumeRouter.get('/:id', requireAuth, (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const resume = db.getResumeById(id);

  if (!resume) {
    res.status(404).json({ error: 'Resume not found.' });
    return;
  }

  // Ownership verification
  if (resume.user_id !== req.user!.id && req.user!.role !== 'ADMIN') {
    res.status(403).json({ error: 'Access denied. You do not own this resume.' });
    return;
  }

  res.json({ resume });
});

// PUT /api/resumes/:id
resumeRouter.put('/:id', requireAuth, (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const existing = db.getResumeById(id);

  if (!existing) {
    res.status(404).json({ error: 'Resume not found.' });
    return;
  }

  if (existing.user_id !== req.user!.id && req.user!.role !== 'ADMIN') {
    res.status(403).json({ error: 'Access denied. You do not own this resume.' });
    return;
  }

  const updates = { ...req.body };
  delete updates.id;
  delete updates.user_id;
  delete updates.created_at;

  const merged = { ...existing, ...updates };
  merged.completion_percentage = calculateCompleteness(merged);

  const updated = db.updateResume(id, merged);
  if (updated) {
    syncResumeSkills(existing.user_id, updated);
  }

  res.json({ message: 'Resume updated successfully.', resume: updated });
});

// DELETE /api/resumes/:id
resumeRouter.delete('/:id', requireAuth, (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const existing = db.getResumeById(id);

  if (!existing) {
    res.status(404).json({ error: 'Resume not found.' });
    return;
  }

  if (existing.user_id !== req.user!.id && req.user!.role !== 'ADMIN') {
    res.status(403).json({ error: 'Access denied. You do not own this resume.' });
    return;
  }

  db.deleteResume(id);
  res.json({ message: 'Resume deleted successfully.' });
});

// POST /api/resumes/:id/duplicate
resumeRouter.post('/:id/duplicate', requireAuth, (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const existing = db.getResumeById(id);

  if (!existing) {
    res.status(404).json({ error: 'Resume not found.' });
    return;
  }

  if (existing.user_id !== req.user!.id && req.user!.role !== 'ADMIN') {
    res.status(403).json({ error: 'Access denied.' });
    return;
  }

  const { id: _, created_at: __, updated_at: ___, ...cloneData } = existing;
  cloneData.title = `${existing.title} (Copy)`;
  cloneData.user_id = req.user!.id;

  const cloned = db.createResume(cloneData);
  res.status(201).json({ message: 'Resume duplicated successfully.', resume: cloned });
});
