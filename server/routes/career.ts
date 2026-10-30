import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { GeminiService } from '../gemini.js';

export const careerRouter = Router();

// Helper to extract candidate skills from resumes and user_skills table
function getCandidateSkills(userId: number, explicitSkills?: string[]): { skillNames: Set<string>; skillsMap: Map<string, string> } {
  const skillNames = new Set<string>();
  const skillsMap = new Map<string, string>(); // skill name lower -> proficiency

  if (explicitSkills && Array.isArray(explicitSkills)) {
    for (const s of explicitSkills) {
      if (s && s.trim()) {
        const clean = s.trim();
        skillNames.add(clean.toLowerCase());
        skillsMap.set(clean.toLowerCase(), 'Intermediate');
      }
    }
  }

  // Also query user_skills table
  const userSkills = db.getUserSkills(userId);
  for (const us of userSkills) {
    skillNames.add(us.skill_name.toLowerCase());
    skillsMap.set(us.skill_name.toLowerCase(), us.proficiency);
  }

  // Also scan all saved resumes for the user
  const resumes = db.getResumesByUserId(userId);
  for (const r of resumes) {
    if (r.skills) {
      const allLists = [
        ...(r.skills.programmingLanguages || []),
        ...(r.skills.frameworks || []),
        ...(r.skills.databases || []),
        ...(r.skills.tools || []),
        ...(r.skills.technicalSkills || []),
        ...(r.skills.softSkills || [])
      ];
      for (const item of allLists) {
        if (item && item.trim()) {
          skillNames.add(item.trim().toLowerCase());
          if (!skillsMap.has(item.trim().toLowerCase())) {
            skillsMap.set(item.trim().toLowerCase(), 'Intermediate');
          }
        }
      }
    }
  }

  return { skillNames, skillsMap };
}

// GET /api/career/roles
careerRouter.get('/roles', (_req: Request, res: Response) => {
  const roles = db.getActiveJobRoles();
  const detailed = roles.map(role => {
    const roleSkills = db.getRoleSkills(role.id);
    return {
      ...role,
      skills: roleSkills
    };
  });
  res.json({ roles: detailed });
});

// POST /api/career/analyze
careerRouter.post('/analyze', requireAuth, async (req: Request, res: Response) => {
  try {
    const { targetRoleId, candidateSkills } = req.body;
    const userId = req.user!.id;

    const { skillNames, skillsMap } = getCandidateSkills(userId, candidateSkills);

    // Fetch ALL active job roles dynamically from DB
    const activeRoles = db.getActiveJobRoles();

    if (activeRoles.length === 0) {
      res.json({ recommendations: [] });
      return;
    }

    const recommendations = [];

    for (const role of activeRoles) {
      // Fetch latest role_skills dynamically from DB for this role
      const roleSkills = db.getRoleSkills(role.id);

      if (roleSkills.length === 0) continue;

      let totalPossibleWeight = 0;
      let earnedWeight = 0;

      const matchingSkills: string[] = [];
      const missingMandatory: Array<{ name: string; proficiency: string; category?: string; description?: string }> = [];
      const missingPreferred: Array<{ name: string; proficiency: string; category?: string; description?: string }> = [];
      const missingOptional: Array<{ name: string; proficiency: string; category?: string; description?: string }> = [];

      for (const rs of roleSkills) {
        const skillName = rs.skill_name || '';
        const lowerName = skillName.toLowerCase();
        const baseWeight = rs.importance_weight || 5;

        let multiplier = 1.0;
        if (rs.requirement_type === 'mandatory') multiplier = 1.8;
        else if (rs.requirement_type === 'preferred') multiplier = 1.2;
        else multiplier = 0.6;

        const skillTotalPoints = baseWeight * multiplier;
        totalPossibleWeight += skillTotalPoints;

        // Check if candidate has this skill
        let hasSkill = skillNames.has(lowerName);
        if (!hasSkill) {
          // Check substring match (e.g. "React" matching "React.js" or "Git" matching "Git / GitHub")
          for (const s of skillNames) {
            if (s.includes(lowerName) || lowerName.includes(s)) {
              hasSkill = true;
              break;
            }
          }
        }

        if (hasSkill) {
          earnedWeight += skillTotalPoints;
          matchingSkills.push(skillName);
        } else {
          const missingItem = {
            name: skillName,
            proficiency: rs.required_proficiency,
            category: rs.skill_category,
            description: rs.skill_description || `Core proficiency in ${skillName} required for this role.`
          };

          if (rs.requirement_type === 'mandatory') {
            missingMandatory.push(missingItem);
          } else if (rs.requirement_type === 'preferred') {
            missingPreferred.push(missingItem);
          } else {
            missingOptional.push(missingItem);
          }
        }
      }

      const matchPercentage = totalPossibleWeight > 0
        ? Math.round((earnedWeight / totalPossibleWeight) * 100)
        : 50;

      recommendations.push({
        roleId: role.id,
        roleTitle: role.title,
        category: role.category,
        description: role.description,
        experienceLevel: role.experience_level,
        minimumExperience: role.minimum_experience,
        recommendedCertifications: role.recommended_certifications || [],
        recommendedProjects: role.recommended_projects || [],
        additionalRequirements: role.additional_requirements || '',
        matchPercentage,
        matchingSkills,
        missingMandatory,
        missingPreferred,
        missingOptional,
        totalRequiredSkills: roleSkills.length
      });
    }

    // Sort by match percentage descending
    recommendations.sort((a, b) => b.matchPercentage - a.matchPercentage);

    // If specific target role requested or top match, generate Gemini explanation
    const topRole = targetRoleId
      ? recommendations.find(r => r.roleId === parseInt(targetRoleId, 10)) || recommendations[0]
      : recommendations[0];

    let aiExplanation = '';
    if (topRole) {
      aiExplanation = await GeminiService.explainRoleMatch(userId, {
        jobRoleTitle: topRole.roleTitle,
        matchPercentage: topRole.matchPercentage,
        matchingSkills: topRole.matchingSkills,
        missingMandatory: topRole.missingMandatory.map(m => m.name),
        missingPreferred: topRole.missingPreferred.map(m => m.name)
      });
    }

    // Fetch existing skill progress for this user
    const progressList = db.getUserSkillProgress(userId);

    res.json({
      recommendations,
      topRoleExplanation: aiExplanation,
      targetRole: topRole,
      candidateSkillsCount: skillNames.size,
      progressList
    });
  } catch (err: any) {
    console.error('Career analyze error:', err);
    res.status(500).json({ error: 'Failed to analyze career recommendations.' });
  }
});

// POST /api/career/skill-progress
careerRouter.post('/skill-progress', requireAuth, (req: Request, res: Response) => {
  try {
    const { jobRoleId, skillName, status, currentProficiency, notes } = req.body;

    if (!jobRoleId || !skillName || !status) {
      res.status(400).json({ error: 'jobRoleId, skillName, and status are required.' });
      return;
    }

    const updated = db.updateSkillProgress(
      req.user!.id,
      parseInt(jobRoleId, 10),
      skillName.trim(),
      status,
      currentProficiency || 'None',
      notes || ''
    );

    res.json({ message: 'Skill progress updated successfully.', progress: updated });
  } catch (err: any) {
    console.error('Skill progress error:', err);
    res.status(500).json({ error: 'Failed to update skill progress.' });
  }
});

// GET /api/career/roadmap
careerRouter.get('/roadmap', requireAuth, async (req: Request, res: Response) => {
  try {
    const jobRoleId = req.query.jobRoleId ? parseInt(req.query.jobRoleId as string, 10) : 1;
    const role = db.getJobRoleById(jobRoleId);

    if (!role) {
      res.status(404).json({ error: 'Job role not found.' });
      return;
    }

    const { skillNames } = getCandidateSkills(req.user!.id);
    const roleSkills = db.getRoleSkills(role.id);

    const missingSkills = roleSkills
      .filter(rs => !skillNames.has((rs.skill_name || '').toLowerCase()))
      .map(rs => rs.skill_name || '')
      .filter(Boolean);

    const skillsToPlan = missingSkills.length > 0
      ? missingSkills
      : roleSkills.slice(0, 4).map(rs => rs.skill_name || '');

    const roadmap = await GeminiService.generateLearningRoadmap(req.user!.id, {
      targetJobRole: role.title,
      missingSkills: skillsToPlan,
      currentLevel: role.experience_level
    });

    const userProgress = db.getUserSkillProgress(req.user!.id, role.id);

    res.json({
      roleTitle: role.title,
      experienceLevel: role.experience_level,
      roadmap,
      userProgress
    });
  } catch (err: any) {
    console.error('Roadmap generation error:', err);
    res.status(500).json({ error: 'Failed to generate roadmap.' });
  }
});
