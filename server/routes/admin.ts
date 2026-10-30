import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

export const adminRouter = Router();

// Apply requireAdmin to all admin endpoints
adminRouter.use(requireAdmin);

// GET /api/admin/me - Verify admin identity
adminRouter.get('/me', (req: Request, res: Response) => {
  const { password_hash: _, ...safeAdmin } = req.user!;
  res.json({ admin: safeAdmin });
});

// GET /api/admin/dashboard - Real statistics and chart metrics
adminRouter.get('/dashboard', (_req: Request, res: Response) => {
  const stats = db.getAdminDashboardStats();
  res.json({ stats });
});

// --- USER MANAGEMENT ---
// GET /api/admin/users
adminRouter.get('/users', (req: Request, res: Response) => {
  const search = (req.query.search as string || '').toLowerCase().trim();
  const roleFilter = req.query.role as string;
  const statusFilter = req.query.status as string;

  let users = db.getAllUsers().map(({ password_hash: _, ...u }) => {
    const resumeCount = db.getResumesByUserId(u.id).length;
    return {
      ...u,
      resume_count: resumeCount
    };
  });

  if (search) {
    users = users.filter(u => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search));
  }
  if (roleFilter && roleFilter !== 'all') {
    users = users.filter(u => u.role === roleFilter);
  }
  if (statusFilter && statusFilter !== 'all') {
    users = users.filter(u => u.status === statusFilter);
  }

  res.json({ users });
});

// PUT /api/admin/users/:id/status
adminRouter.put('/users/:id/status', (req: Request, res: Response) => {
  const targetId = parseInt(req.params.id, 10);
  const { status } = req.body;

  if (status !== 'active' && status !== 'inactive') {
    res.status(400).json({ error: 'Status must be active or inactive.' });
    return;
  }

  // Prevent admin from deactivating self
  if (targetId === req.user!.id && status === 'inactive') {
    res.status(400).json({ error: 'You cannot deactivate your own administrative account.' });
    return;
  }

  const success = db.updateUserStatus(targetId, status);
  if (!success) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  db.logAdminActivity(req.user!.id, 'UPDATE_USER_STATUS', 'USER', String(targetId), `Changed status to ${status}`, req.ip);
  res.json({ message: `User status changed to ${status}.` });
});

// DELETE /api/admin/users/:id
adminRouter.delete('/users/:id', (req: Request, res: Response) => {
  const targetId = parseInt(req.params.id, 10);

  // Prevent admin from deleting own account
  if (targetId === req.user!.id) {
    res.status(400).json({ error: 'You cannot delete your own account while logged in.' });
    return;
  }

  // Prevent deleting the last remaining ADMIN account
  const allAdmins = db.getAllUsers().filter(u => u.role === 'ADMIN');
  const targetUser = db.findUserById(targetId);
  if (targetUser?.role === 'ADMIN' && allAdmins.length <= 1) {
    res.status(400).json({ error: 'Cannot delete the only remaining administrator account.' });
    return;
  }

  const success = db.deleteUser(targetId);
  if (!success) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  db.logAdminActivity(req.user!.id, 'DELETE_USER', 'USER', String(targetId), `Deleted user account: ${targetUser?.email}`, req.ip);
  res.json({ message: 'User deleted successfully.' });
});

// --- RESUME MANAGEMENT ---
// GET /api/admin/resumes
adminRouter.get('/resumes', (req: Request, res: Response) => {
  const search = (req.query.search as string || '').toLowerCase().trim();
  let resumes = db.getAllResumesAdmin();

  if (search) {
    resumes = resumes.filter(r =>
      r.title.toLowerCase().includes(search) ||
      r.target_job_role.toLowerCase().includes(search) ||
      (r.user_name && r.user_name.toLowerCase().includes(search)) ||
      (r.user_email && r.user_email.toLowerCase().includes(search))
    );
  }

  res.json({ resumes });
});

// DELETE /api/admin/resumes/:id
adminRouter.delete('/resumes/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const resume = db.getResumeById(id);
  if (!resume) {
    res.status(404).json({ error: 'Resume not found.' });
    return;
  }

  db.deleteResume(id);
  db.logAdminActivity(req.user!.id, 'DELETE_RESUME', 'RESUME', String(id), `Deleted resume "${resume.title}" of user ID ${resume.user_id}`, req.ip);
  res.json({ message: 'Resume deleted successfully.' });
});

// --- TEMPLATE MANAGEMENT ---
// GET /api/admin/templates
adminRouter.get('/templates', (_req: Request, res: Response) => {
  const templates = db.getAllTemplatesAdmin();
  res.json({ templates });
});

// POST /api/admin/templates
adminRouter.post('/templates', (req: Request, res: Response) => {
  const { id, name, category, description, preview_image, is_active } = req.body;
  if (!id || !name) {
    res.status(400).json({ error: 'Template ID and Name are required.' });
    return;
  }

  const existing = db.getTemplateById(id);
  if (existing) {
    res.status(409).json({ error: 'A template with this ID already exists.' });
    return;
  }

  const created = db.createTemplate({
    id: id.toLowerCase().trim().replace(/\s+/g, '_'),
    name: name.trim(),
    category: category || 'General',
    description: description || '',
    preview_image: preview_image || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&q=80',
    is_active: is_active !== false
  });

  db.logAdminActivity(req.user!.id, 'CREATE_TEMPLATE', 'TEMPLATE', created.id, `Created template "${created.name}"`, req.ip);
  res.status(201).json({ message: 'Template created successfully.', template: created });
});

// PUT /api/admin/templates/:id
adminRouter.put('/templates/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = db.updateTemplate(id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Template not found.' });
    return;
  }

  db.logAdminActivity(req.user!.id, 'UPDATE_TEMPLATE', 'TEMPLATE', id, `Updated template "${updated.name}"`, req.ip);
  res.json({ message: 'Template updated successfully.', template: updated });
});

// DELETE /api/admin/templates/:id
adminRouter.delete('/templates/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const success = db.deleteTemplate(id);
  if (!success) {
    res.status(404).json({ error: 'Template not found.' });
    return;
  }

  db.logAdminActivity(req.user!.id, 'DELETE_TEMPLATE', 'TEMPLATE', id, `Deleted template ${id}`, req.ip);
  res.json({ message: 'Template deleted successfully.' });
});

// --- JOB ROLE MANAGEMENT (CRITICAL FEATURE) ---
// GET /api/admin/job-roles
adminRouter.get('/job-roles', (req: Request, res: Response) => {
  const search = (req.query.search as string || '').toLowerCase().trim();
  const categoryFilter = req.query.category as string;
  const statusFilter = req.query.status as string;

  let roles = db.getAllJobRolesAdmin();

  if (search) {
    roles = roles.filter(r => r.title.toLowerCase().includes(search) || r.category.toLowerCase().includes(search));
  }
  if (categoryFilter && categoryFilter !== 'all') {
    roles = roles.filter(r => r.category === categoryFilter);
  }
  if (statusFilter && statusFilter !== 'all') {
    roles = roles.filter(r => r.status === statusFilter);
  }

  res.json({ roles });
});

// POST /api/admin/job-roles
adminRouter.post('/job-roles', (req: Request, res: Response) => {
  try {
    const {
      title,
      category,
      description,
      education_requirements,
      experience_level,
      minimum_experience,
      maximum_experience,
      recommended_certifications,
      recommended_projects,
      additional_requirements,
      status,
      skills // Optional array of skills to assign immediately
    } = req.body;

    if (!title || !category || !description) {
      res.status(400).json({ error: 'Title, category, and description are required.' });
      return;
    }

    const newRole = db.createJobRole({
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
      education_requirements: education_requirements || 'Bachelor degree in relevant domain',
      experience_level: experience_level || 'Junior',
      minimum_experience: Number(minimum_experience) || 0,
      maximum_experience: maximum_experience ? Number(maximum_experience) : null,
      recommended_certifications: Array.isArray(recommended_certifications) ? recommended_certifications : [],
      recommended_projects: Array.isArray(recommended_projects) ? recommended_projects : [],
      additional_requirements: additional_requirements || '',
      status: status || 'active'
    });

    // If initial skills provided, map them
    if (Array.isArray(skills)) {
      for (const item of skills) {
        let skillId = item.skill_id;
        if (!skillId && item.skill_name) {
          const createdSkill = db.createSkill({
            name: item.skill_name,
            category: item.category || 'General'
          });
          skillId = createdSkill.id;
        }
        if (skillId) {
          db.addSkillToJobRole(
            newRole.id,
            skillId,
            item.requirement_type || 'mandatory',
            item.required_proficiency || 'Intermediate',
            Number(item.importance_weight) || 5
          );
        }
      }
    }

    db.logAdminActivity(req.user!.id, 'CREATE_JOB_ROLE', 'JOB_ROLE', String(newRole.id), `Created job role "${newRole.title}"`, req.ip);
    res.status(201).json({ message: 'Job role created successfully.', role: newRole });
  } catch (err: any) {
    console.error('Create job role error:', err);
    res.status(500).json({ error: 'Failed to create job role.' });
  }
});

// GET /api/admin/job-roles/:id
adminRouter.get('/job-roles/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const role = db.getJobRoleById(id);
  if (!role) {
    res.status(404).json({ error: 'Job role not found.' });
    return;
  }

  const roleSkills = db.getRoleSkills(id);
  res.json({ role: { ...role, skills: roleSkills } });
});

// PUT /api/admin/job-roles/:id
adminRouter.put('/job-roles/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const existing = db.getJobRoleById(id);
  if (!existing) {
    res.status(404).json({ error: 'Job role not found.' });
    return;
  }

  const updates = { ...req.body };
  delete updates.id;
  delete updates.skills; // Skills handled separately or via bulk update

  const updated = db.updateJobRole(id, updates);
  db.logAdminActivity(req.user!.id, 'UPDATE_JOB_ROLE', 'JOB_ROLE', String(id), `Updated job role details for "${existing.title}"`, req.ip);
  res.json({ message: 'Job role updated successfully.', role: updated });
});

// PUT /api/admin/job-roles/:id/status
adminRouter.put('/job-roles/:id/status', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;

  if (status !== 'active' && status !== 'inactive') {
    res.status(400).json({ error: 'Status must be active or inactive.' });
    return;
  }

  const success = db.updateJobRoleStatus(id, status);
  if (!success) {
    res.status(404).json({ error: 'Job role not found.' });
    return;
  }

  db.logAdminActivity(req.user!.id, 'UPDATE_JOB_ROLE_STATUS', 'JOB_ROLE', String(id), `Changed status to ${status}`, req.ip);
  res.json({ message: `Job role status changed to ${status}.` });
});

// DELETE /api/admin/job-roles/:id
adminRouter.delete('/job-roles/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const existing = db.getJobRoleById(id);
  if (!existing) {
    res.status(404).json({ error: 'Job role not found.' });
    return;
  }

  db.deleteJobRole(id);
  db.logAdminActivity(req.user!.id, 'DELETE_JOB_ROLE', 'JOB_ROLE', String(id), `Deleted job role "${existing.title}" and associated role_skills`, req.ip);
  res.json({ message: 'Job role deleted successfully.' });
});

// --- ROLE SKILLS MANAGEMENT (CRITICAL FEATURE) ---
// GET /api/admin/job-roles/:id/skills
adminRouter.get('/job-roles/:id/skills', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const skills = db.getRoleSkills(id);
  res.json({ skills });
});

// POST /api/admin/job-roles/:id/skills
adminRouter.post('/job-roles/:id/skills', (req: Request, res: Response) => {
  const jobRoleId = parseInt(req.params.id, 10);
  const { skill_id, skill_name, category, requirement_type, required_proficiency, importance_weight } = req.body;

  let targetSkillId = skill_id ? parseInt(skill_id, 10) : null;

  // If skill_name is given without ID, find or create the skill
  if (!targetSkillId && skill_name) {
    let existingSkill = db.getSkillByName(skill_name);
    if (!existingSkill) {
      existingSkill = db.createSkill({
        name: skill_name,
        category: category || 'Developer Tools'
      });
    }
    targetSkillId = existingSkill.id;
  }

  if (!targetSkillId) {
    res.status(400).json({ error: 'A valid skill ID or skill name is required.' });
    return;
  }

  const assigned = db.addSkillToJobRole(
    jobRoleId,
    targetSkillId,
    requirement_type || 'mandatory',
    required_proficiency || 'Intermediate',
    Number(importance_weight) || 5
  );

  db.logAdminActivity(req.user!.id, 'ASSIGN_ROLE_SKILL', 'ROLE_SKILL', `${jobRoleId}-${targetSkillId}`, `Added ${assigned.skill_name} (${requirement_type}) to job role ${jobRoleId}`, req.ip);
  res.status(201).json({ message: 'Skill requirement added to role.', roleSkill: assigned });
});

// PUT /api/admin/job-roles/:id/skills/:skillId
adminRouter.put('/job-roles/:id/skills/:skillId', (req: Request, res: Response) => {
  const jobRoleId = parseInt(req.params.id, 10);
  const skillId = parseInt(req.params.skillId, 10);

  const updated = db.updateRoleSkill(jobRoleId, skillId, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Role skill assignment not found.' });
    return;
  }

  db.logAdminActivity(req.user!.id, 'UPDATE_ROLE_SKILL', 'ROLE_SKILL', `${jobRoleId}-${skillId}`, `Updated requirements for skill ${skillId} in role ${jobRoleId}`, req.ip);
  res.json({ message: 'Skill requirements updated successfully.', roleSkill: updated });
});

// DELETE /api/admin/job-roles/:id/skills/:skillId
adminRouter.delete('/job-roles/:id/skills/:skillId', (req: Request, res: Response) => {
  const jobRoleId = parseInt(req.params.id, 10);
  const skillId = parseInt(req.params.skillId, 10);

  const success = db.removeSkillFromJobRole(jobRoleId, skillId);
  if (!success) {
    res.status(404).json({ error: 'Skill assignment not found.' });
    return;
  }

  db.logAdminActivity(req.user!.id, 'REMOVE_ROLE_SKILL', 'ROLE_SKILL', `${jobRoleId}-${skillId}`, `Removed skill ${skillId} from role ${jobRoleId}`, req.ip);
  res.json({ message: 'Skill removed from job role.' });
});

// --- SKILL MANAGEMENT ---
// GET /api/admin/skills
adminRouter.get('/skills', (req: Request, res: Response) => {
  const search = (req.query.search as string || '').toLowerCase().trim();
  const categoryFilter = req.query.category as string;

  let skills = db.getAllSkills();

  if (search) {
    skills = skills.filter(s => s.name.toLowerCase().includes(search) || s.category.toLowerCase().includes(search));
  }
  if (categoryFilter && categoryFilter !== 'all') {
    skills = skills.filter(s => s.category === categoryFilter);
  }

  res.json({ skills });
});

// POST /api/admin/skills
adminRouter.post('/skills', (req: Request, res: Response) => {
  const { name, category, description } = req.body;
  if (!name || !category) {
    res.status(400).json({ error: 'Skill name and category are required.' });
    return;
  }

  const existing = db.getSkillByName(name);
  if (existing) {
    res.status(409).json({ error: 'A skill with this name already exists.' });
    return;
  }

  const skill = db.createSkill({ name, category, description });
  db.logAdminActivity(req.user!.id, 'CREATE_SKILL', 'SKILL', String(skill.id), `Created skill "${skill.name}" in category "${skill.category}"`, req.ip);
  res.status(201).json({ message: 'Skill created successfully.', skill });
});

// PUT /api/admin/skills/:id
adminRouter.put('/skills/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const updated = db.updateSkill(id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Skill not found.' });
    return;
  }

  db.logAdminActivity(req.user!.id, 'UPDATE_SKILL', 'SKILL', String(id), `Updated skill "${updated.name}"`, req.ip);
  res.json({ message: 'Skill updated successfully.', skill: updated });
});

// DELETE /api/admin/skills/:id
adminRouter.delete('/skills/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const result = db.deleteSkill(id);
  if (!result.success) {
    res.status(400).json({ error: result.message || 'Cannot delete skill.' });
    return;
  }

  db.logAdminActivity(req.user!.id, 'DELETE_SKILL', 'SKILL', String(id), `Deleted skill ID ${id}`, req.ip);
  res.json({ message: 'Skill deleted successfully.' });
});

// --- ACTIVITY LOGS ---
// GET /api/admin/activity-logs
adminRouter.get('/activity-logs', (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
  const logs = db.getAdminActivityLogs(limit);
  res.json({ logs });
});
