-- ResumeCraft Database Schema
-- Database: resumecraft_db

CREATE DATABASE IF NOT EXISTS resumecraft_db;
USE resumecraft_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Resume Templates Table
CREATE TABLE IF NOT EXISTS resume_templates (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'General',
  description TEXT,
  preview_image VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Resumes Table
CREATE TABLE IF NOT EXISTS resumes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  template_id VARCHAR(50) NOT NULL DEFAULT 'professional',
  title VARCHAR(150) NOT NULL DEFAULT 'Untitled Resume',
  target_job_role VARCHAR(150),
  personal_info JSON NOT NULL,
  career_summary TEXT,
  career_objective TEXT,
  education JSON,
  skills JSON,
  projects JSON,
  experience JSON,
  certifications JSON,
  additional_sections JSON,
  completion_percentage INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (template_id) REFERENCES resume_templates(id) ON UPDATE CASCADE
);

-- 4. Job Roles Table
CREATE TABLE IF NOT EXISTS job_roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL UNIQUE,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  education_requirements VARCHAR(255) NOT NULL,
  experience_level ENUM('Fresher', 'Junior', 'Mid-Level', 'Senior', 'Lead') NOT NULL DEFAULT 'Mid-Level',
  minimum_experience INT NOT NULL DEFAULT 0,
  maximum_experience INT DEFAULT NULL,
  recommended_certifications JSON,
  recommended_projects JSON,
  additional_requirements TEXT,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 5. Skills Table
CREATE TABLE IF NOT EXISTS skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(80) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 6. Role Skills Table (Bridge table between Job Roles and Skills)
CREATE TABLE IF NOT EXISTS role_skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_role_id INT NOT NULL,
  skill_id INT NOT NULL,
  requirement_type ENUM('mandatory', 'preferred', 'optional') NOT NULL DEFAULT 'mandatory',
  required_proficiency ENUM('Beginner', 'Intermediate', 'Advanced') NOT NULL DEFAULT 'Intermediate',
  importance_weight INT NOT NULL DEFAULT 5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_role_id) REFERENCES job_roles(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
  UNIQUE KEY unique_role_skill (job_role_id, skill_id)
);

-- 7. User Skills Table
CREATE TABLE IF NOT EXISTS user_skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  skill_name VARCHAR(100) NOT NULL,
  proficiency ENUM('Beginner', 'Intermediate', 'Advanced') NOT NULL DEFAULT 'Intermediate',
  source ENUM('resume', 'manual', 'verified') DEFAULT 'resume',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_skill (user_id, skill_name)
);

-- 8. Skill Progress Tracking Table
CREATE TABLE IF NOT EXISTS skill_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  job_role_id INT NOT NULL,
  skill_name VARCHAR(100) NOT NULL,
  status ENUM('Not Started', 'Learning', 'Completed') NOT NULL DEFAULT 'Not Started',
  current_proficiency ENUM('None', 'Beginner', 'Intermediate', 'Advanced') NOT NULL DEFAULT 'None',
  notes TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (job_role_id) REFERENCES job_roles(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_role_skill_progress (user_id, job_role_id, skill_name)
);

-- 9. User Recommendations Table
CREATE TABLE IF NOT EXISTS user_recommendations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  job_role_id INT NOT NULL,
  match_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  matching_skills JSON,
  missing_mandatory JSON,
  missing_preferred JSON,
  ai_explanation TEXT,
  is_stale BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (job_role_id) REFERENCES job_roles(id) ON DELETE CASCADE
);

-- 10. Admin Activity Logs Table
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(50),
  details TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 11. AI Usage Logs Table
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  feature_used VARCHAR(80) NOT NULL,
  prompt_tokens INT DEFAULT 0,
  completion_tokens INT DEFAULT 0,
  status ENUM('success', 'failed') NOT NULL DEFAULT 'success',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
