export interface User {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  resume_count?: number;
}

export interface EducationEntry {
  institution: string;
  degree: string;
  branch: string;
  graduationYear: string;
  cgpa: string;
}

export interface ProjectEntry {
  title: string;
  description: string;
  technologies: string;
  link?: string;
  responsibilities?: string;
}

export interface ExperienceEntry {
  company: string;
  jobTitle: string;
  duration: string;
  responsibilities: string;
  achievements?: string;
}

export interface CertificationEntry {
  name: string;
  issuer: string;
  year: string;
}

export interface ResumePersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface ResumeSkillsData {
  programmingLanguages?: string[];
  frameworks?: string[];
  databases?: string[];
  tools?: string[];
  softSkills?: string[];
  technicalSkills?: string[];
}

export interface Resume {
  id: number;
  user_id: number;
  template_id: string;
  title: string;
  target_job_role: string;
  personal_info: ResumePersonalInfo;
  career_summary: string;
  career_objective: string;
  education: EducationEntry[];
  skills: ResumeSkillsData;
  projects: ProjectEntry[];
  experience: ExperienceEntry[];
  certifications: CertificationEntry[];
  additional_sections: {
    languages?: string[];
    awards?: string[];
    extracurricular?: string[];
    publications?: string[];
  };
  completion_percentage: number;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_email?: string;
}

export interface ResumeTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  preview_image: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: number;
  name: string;
  category: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

export interface RoleSkill {
  id: number;
  job_role_id: number;
  skill_id: number;
  requirement_type: 'mandatory' | 'preferred' | 'optional';
  required_proficiency: 'Beginner' | 'Intermediate' | 'Advanced';
  importance_weight: number;
  skill_name?: string;
  skill_category?: string;
  skill_description?: string;
}

export interface JobRole {
  id: number;
  title: string;
  category: string;
  description: string;
  education_requirements: string;
  experience_level: 'Fresher' | 'Junior' | 'Mid-Level' | 'Senior' | 'Lead';
  minimum_experience: number;
  maximum_experience: number | null;
  recommended_certifications: string[];
  recommended_projects: string[];
  additional_requirements: string;
  status: 'active' | 'inactive';
  required_skills_count?: number;
  skills?: RoleSkill[];
  created_at?: string;
  updated_at?: string;
}

export interface SkillProgress {
  id: number;
  user_id: number;
  job_role_id: number;
  skill_name: string;
  status: 'Not Started' | 'Learning' | 'Completed';
  current_proficiency: 'None' | 'Beginner' | 'Intermediate' | 'Advanced';
  notes: string;
  updated_at: string;
}

export interface JobRecommendation {
  roleId: number;
  roleTitle: string;
  category: string;
  description: string;
  experienceLevel: string;
  minimumExperience: number;
  recommendedCertifications: string[];
  recommendedProjects: string[];
  additionalRequirements: string;
  matchPercentage: number;
  matchingSkills: string[];
  missingMandatory: Array<{ name: string; proficiency: string; category?: string; description?: string }>;
  missingPreferred: Array<{ name: string; proficiency: string; category?: string; description?: string }>;
  missingOptional: Array<{ name: string; proficiency: string; category?: string; description?: string }>;
  totalRequiredSkills: number;
}

export interface RoadmapStep {
  skill: string;
  order: number;
  level: string;
  objectives: string;
  practicalExercises: string;
  suggestedProject: string;
}

export interface AdminActivityLog {
  id: number;
  admin_id: number;
  admin_name?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  ip_address: string;
  created_at: string;
}
