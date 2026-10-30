import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

// Types representing our MySQL relational tables
export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: 'USER' | 'ADMIN';
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
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

export interface EducationEntry {
  institution: string;
  degree: string;
  branch: string;
  startYear?: string;
  graduationYear: string;
  cgpa: string;
  coursework?: string;
}

export interface ProjectEntry {
  title: string;
  description: string;
  technologies: string;
  link?: string;
  responsibilities?: string;
  achievements?: string;
}

export interface ExperienceEntry {
  company: string;
  jobTitle: string;
  duration: string;
  responsibilities: string;
  achievements?: string;
  technologies?: string;
}

export interface CertificationEntry {
  name: string;
  issuer: string;
  year: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
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
}

export interface Skill {
  id: number;
  name: string;
  category: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface RoleSkill {
  id: number;
  job_role_id: number;
  skill_id: number;
  requirement_type: 'mandatory' | 'preferred' | 'optional';
  required_proficiency: 'Beginner' | 'Intermediate' | 'Advanced';
  importance_weight: number;
  created_at: string;
  // Joined fields
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
  created_at: string;
  updated_at: string;
}

export interface UserSkill {
  id: number;
  user_id: number;
  skill_name: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced';
  source: 'resume' | 'manual' | 'verified';
  created_at: string;
  updated_at: string;
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

export interface UserRecommendation {
  id: number;
  user_id: number;
  job_role_id: number;
  match_percentage: number;
  matching_skills: string[];
  missing_mandatory: string[];
  missing_preferred: string[];
  ai_explanation: string;
  is_stale: boolean;
  created_at: string;
  updated_at: string;
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

export interface AiUsageLog {
  id: number;
  user_id: number | null;
  user_email?: string;
  feature_used: string;
  prompt_tokens: number;
  completion_tokens: number;
  status: 'success' | 'failed';
  error_message?: string;
  created_at: string;
}

interface DatabaseSchema {
  users: User[];
  resumes: Resume[];
  resume_templates: ResumeTemplate[];
  job_roles: JobRole[];
  skills: Skill[];
  role_skills: RoleSkill[];
  user_skills: UserSkill[];
  skill_progress: SkillProgress[];
  user_recommendations: UserRecommendation[];
  admin_activity_logs: AdminActivityLog[];
  ai_usage_logs: AiUsageLog[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'resumecraft_store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
    if (!this.data.users || this.data.users.length === 0) {
      this.seedInitialData();
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Failed to parse database file, re-initializing...', err);
    }
    return {
      users: [],
      resumes: [],
      resume_templates: [],
      job_roles: [],
      skills: [],
      role_skills: [],
      user_skills: [],
      skill_progress: [],
      user_recommendations: [],
      admin_activity_logs: [],
      ai_usage_logs: []
    };
  }

  private save(): void {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Database write error:', err);
    }
  }

  private seedInitialData(): void {
    console.log('Seeding initial ResumeCraft relational database...');
    const now = new Date().toISOString();

    const adminHash = bcrypt.hashSync('Admin@123456', 10);
    const userHash = bcrypt.hashSync('User@123456', 10);

    this.data.users = [
      {
        id: 1,
        name: 'System Administrator',
        email: 'admin@resumecraft.com',
        password_hash: adminHash,
        role: 'ADMIN',
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        id: 2,
        name: 'Alex Johnson',
        email: 'alex@example.com',
        password_hash: userHash,
        role: 'USER',
        status: 'active',
        created_at: now,
        updated_at: now
      }
    ];

    this.data.resume_templates = [
      {
        id: 'professional',
        name: 'Professional Classic',
        category: 'Corporate',
        description: 'Structured, authoritative executive format with navy accents, balanced columns, and clean section dividers.',
        preview_image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&q=80',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        id: 'modern',
        name: 'Modern Purple',
        category: 'Modern',
        description: 'Contemporary card styling, sleek purple gradient header badges, and modern timeline indicators.',
        preview_image: 'https://images.unsplash.com/photo-1586282391129-76a6df230234?w=400&q=80',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        id: 'minimal',
        name: 'Minimalist Clean',
        category: 'Clean',
        description: 'Maximum whitespace, understated typography, and effortless reading flow with high signal-to-noise ratio.',
        preview_image: 'https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?w=400&q=80',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        id: 'creative',
        name: 'Creative Portfolio',
        category: 'Design',
        description: 'Bold sidebar profile, visual skill proficiency meters, and prominent project and portfolio link callouts.',
        preview_image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=80',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        id: 'ats_friendly',
        name: 'ATS-Friendly Standard',
        category: 'ATS',
        description: 'Single-column plain text parsing optimized layout strictly compliant with Applicant Tracking Systems.',
        preview_image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=400&q=80',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        id: 'fresher',
        name: 'Fresher / Student',
        category: 'Academic',
        description: 'Prioritizes academic coursework, degree highlights, internships, university projects, and extracurricular leadership.',
        preview_image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&q=80',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        id: 'tech_developer',
        name: 'Technical Developer',
        category: 'Engineering',
        description: 'Monospace code font accents, GitHub repository callouts, and categorized tech stack tags.',
        preview_image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        id: 'executive',
        name: 'Executive Leadership',
        category: 'Leadership',
        description: 'Metrics-driven summaries, organizational leadership achievements, strategic transformations, and board impact.',
        preview_image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
        is_active: true,
        created_at: now,
        updated_at: now
      }
    ];

    const initialSkills: Array<{ id: number; name: string; category: string; description: string }> = [
      { id: 1, name: 'Java', category: 'Programming Languages', description: 'Core Java, Collections framework, Multi-threading and JVM fundamentals.' },
      { id: 2, name: 'Python', category: 'Programming Languages', description: 'General-purpose programming, scripting, data manipulation and backend APIs.' },
      { id: 3, name: 'JavaScript', category: 'Programming Languages', description: 'Modern ES6+ syntax, asynchronous programming, DOM and event loop.' },
      { id: 4, name: 'TypeScript', category: 'Programming Languages', description: 'Statically typed superset of JavaScript for large-scale enterprise apps.' },
      { id: 5, name: 'C++', category: 'Programming Languages', description: 'Low-level memory management, pointers, STL, and algorithmic efficiency.' },
      { id: 6, name: 'SQL', category: 'Databases', description: 'Relational querying, joins, indexing, query optimization, and transactions.' },
      { id: 7, name: 'React.js', category: 'Frameworks', description: 'Component lifecycle, hooks, state management, and virtual DOM architecture.' },
      { id: 8, name: 'Node.js', category: 'Frameworks', description: 'Event-driven asynchronous server runtime, HTTP servers, and microservices.' },
      { id: 9, name: 'Express.js', category: 'Frameworks', description: 'Fast, unopinionated, minimalist web framework for Node.js REST APIs.' },
      { id: 10, name: 'Spring Boot', category: 'Frameworks', description: 'Enterprise Java framework, dependency injection, Spring Security & Data.' },
      { id: 11, name: 'Hibernate / JPA', category: 'Frameworks', description: 'Object-Relational Mapping (ORM) for Java applications and query criteria.' },
      { id: 12, name: 'RESTful APIs', category: 'Developer Tools', description: 'Architectural style for networked hypermedia applications and JSON endpoints.' },
      { id: 13, name: 'Git / GitHub', category: 'Developer Tools', description: 'Distributed version control, branching strategies, and CI/CD pull requests.' },
      { id: 14, name: 'Docker', category: 'Cloud Platforms', description: 'Containerization of applications, Dockerfile authoring, and container registry.' },
      { id: 15, name: 'Kubernetes', category: 'Cloud Platforms', description: 'Container orchestration, pod management, deployments, and service discovery.' },
      { id: 16, name: 'AWS', category: 'Cloud Platforms', description: 'Amazon Web Services including EC2, S3, RDS, Lambda, and IAM security.' },
      { id: 17, name: 'PostgreSQL', category: 'Databases', description: 'Advanced open-source relational database with ACID compliance and JSON support.' },
      { id: 18, name: 'MongoDB', category: 'Databases', description: 'Document-oriented NoSQL database with flexible JSON-like schemas.' },
      { id: 19, name: 'Redis', category: 'Databases', description: 'In-memory key-value data structure store used for caching and pub/sub.' },
      { id: 20, name: 'Machine Learning', category: 'Data Science', description: 'Supervised/unsupervised algorithms, scikit-learn, cross-validation, and metrics.' },
      { id: 21, name: 'Deep Learning', category: 'Artificial Intelligence', description: 'Neural networks, PyTorch, TensorFlow, backpropagation, and CNNs/RNNs.' },
      { id: 22, name: 'Large Language Models (LLMs)', category: 'Artificial Intelligence', description: 'Prompt engineering, fine-tuning, embeddings, RAG, and generative AI.' },
      { id: 23, name: 'Pandas / NumPy', category: 'Data Science', description: 'Data manipulation, statistical analysis, matrices, and vectorized computing.' },
      { id: 24, name: 'Data Visualization', category: 'Data Science', description: 'Communicating analytical insights using Matplotlib, Seaborn, Tableau, or D3.js.' },
      { id: 25, name: 'CI/CD Pipelines', category: 'Cloud Platforms', description: 'Automated testing and deployment workflows using GitHub Actions or Jenkins.' },
      { id: 26, name: 'Linux / Bash', category: 'Developer Tools', description: 'Command-line scripting, system administration, and process monitoring.' },
      { id: 27, name: 'Cybersecurity Fundamentals', category: 'Cybersecurity', description: 'CIA triad, threat modeling, vulnerability assessment, and OWASP Top 10.' },
      { id: 28, name: 'Network Security', category: 'Cybersecurity', description: 'Firewalls, TCP/IP protocol inspection, VPNs, and packet analysis.' },
      { id: 29, name: 'GraphQL', category: 'Frameworks', description: 'Declarative data querying language for APIs and schema definition.' },
      { id: 30, name: 'Unit Testing (Jest/JUnit)', category: 'Developer Tools', description: 'Test-driven development, test suites, mock assertions, and code coverage.' },
      { id: 31, name: 'Tailwind CSS', category: 'Frameworks', description: 'Utility-first CSS framework for rapid and maintainable responsive UI.' },
      { id: 32, name: 'HTML5 & CSS3', category: 'Programming Languages', description: 'Semantic document structure, accessibility (a11y), flexbox and CSS grid.' },
      { id: 33, name: 'Next.js', category: 'Frameworks', description: 'React framework for server-rendered apps, API routes, and static generation.' },
      { id: 34, name: 'Maven / Gradle', category: 'Developer Tools', description: 'Build automation tools and dependency managers for Java/JVM applications.' },
      { id: 35, name: 'Problem Solving', category: 'Soft Skills', description: 'Analytical thinking, decomposing complex challenges, and root-cause debugging.' },
      { id: 36, name: 'Team Collaboration', category: 'Soft Skills', description: 'Cross-functional communication, code reviews, and Agile/Scrum ceremonies.' },
      { id: 37, name: 'System Architecture', category: 'Soft Skills', description: 'High-level software design, scalability, microservices, and design patterns.' },
      { id: 38, name: 'Flutter', category: 'Frameworks', description: 'Cross-platform mobile and web application development framework using Dart.' },
      { id: 39, name: 'React Native', category: 'Frameworks', description: 'Mobile application development using React for iOS and Android.' },
      { id: 40, name: 'TensorFlow / PyTorch', category: 'Artificial Intelligence', description: 'Deep learning framework for training and deploying neural network architectures.' }
    ];

    this.data.skills = initialSkills.map(s => ({
      ...s,
      created_at: now,
      updated_at: now
    }));

    this.data.job_roles = [
      {
        id: 1,
        title: 'Full Stack Developer',
        category: 'Software Engineering',
        description: 'Architects and builds responsive end-to-end web applications combining robust backend services with modern reactive frontend interfaces.',
        education_requirements: 'B.Tech / B.E. / B.Sc in Computer Science, IT, or related degree',
        experience_level: 'Mid-Level',
        minimum_experience: 1,
        maximum_experience: 4,
        recommended_certifications: ['AWS Certified Developer - Associate', 'Meta Front-End & Back-End Professional Certificate'],
        recommended_projects: ['E-Commerce Full Stack Platform with Stripe Checkout', 'Real-time Collaboration Workspace with WebSockets', 'SaaS Task Management with RBAC'],
        additional_requirements: 'Strong grasp of data structures, RESTful design patterns, and cross-browser testing.',
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        id: 2,
        title: 'Java Backend Developer',
        category: 'Software Engineering',
        description: 'Specializes in high-throughput enterprise systems, distributed microservices, REST APIs, and database persistence using the Java ecosystem.',
        education_requirements: 'Bachelor in Computer Science, Information Technology, or equivalent',
        experience_level: 'Mid-Level',
        minimum_experience: 2,
        maximum_experience: 5,
        recommended_certifications: ['Oracle Certified Professional: Java SE Programmer', 'Spring Professional Certification'],
        recommended_projects: ['Banking Microservices API with Spring Boot & JWT', 'High-Volume Order Processing System with Redis Cache', 'Distributed Event Broker Consumer'],
        additional_requirements: 'Understanding of JVM internals, garbage collection tuning, and transactional integrity.',
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        id: 3,
        title: 'Frontend Developer',
        category: 'Software Engineering',
        description: 'Creates pixel-perfect, accessible, and high-performance user interfaces for modern web and mobile applications.',
        education_requirements: 'B.S. in Computer Science, Web Development, or equivalent bootcamp',
        experience_level: 'Junior',
        minimum_experience: 1,
        maximum_experience: 3,
        recommended_certifications: ['Meta Front-End Developer Certificate', 'Google UX Design Professional Certificate'],
        recommended_projects: ['Analytics Dashboard with Chart.js & Dark Mode', 'Interactive Kanban Board with Drag & Drop', 'Accessible Component Design System'],
        additional_requirements: 'Proficiency in responsive design, CSS Grid/Flexbox, state management and Lighthouse metrics.',
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        id: 4,
        title: 'Python Developer',
        category: 'Software Engineering',
        description: 'Builds scalable backend services, automated workflows, web scrapers, and data pipelines using Python frameworks.',
        education_requirements: 'Degree in Computer Science, Software Engineering, or related quantitative field',
        experience_level: 'Junior',
        minimum_experience: 1,
        maximum_experience: 3,
        recommended_certifications: ['PCAP - Certified Associate in Python Programming', 'AWS Solutions Architect Associate'],
        recommended_projects: ['FastAPI Microservice with PostgreSQL & Docker', 'Automated Web Scraping and ETL Pipeline', 'Job Search Aggregator with Celery Workers'],
        additional_requirements: 'Comfortable with asynchronous programming, package management with Poetry/Pipenv.',
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        id: 5,
        title: 'Data Scientist',
        category: 'Data & Analytics',
        description: 'Extracts actionable business insights, constructs predictive machine learning models, and interprets massive datasets.',
        education_requirements: 'B.S. / M.S. in Computer Science, Statistics, Mathematics, or Data Science',
        experience_level: 'Mid-Level',
        minimum_experience: 2,
        maximum_experience: 5,
        recommended_certifications: ['IBM Data Science Professional Certificate', 'Google Data Analytics Professional Certificate'],
        recommended_projects: ['Customer Churn Prediction with Scikit-Learn', 'Financial Fraud Detection using Ensemble Models', 'Interactive Exploratory Data Analysis Report'],
        additional_requirements: 'Solid grounding in probability, hypothesis testing, linear algebra, and data wrangling.',
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        id: 6,
        title: 'AI Application Developer',
        category: 'Artificial Intelligence',
        description: 'Designs and deploys generative AI applications integrating Large Language Models, embeddings, RAG pipelines, and vector databases.',
        education_requirements: 'B.Tech / M.S. in Computer Science, AI, or Software Engineering',
        experience_level: 'Mid-Level',
        minimum_experience: 1,
        maximum_experience: 4,
        recommended_certifications: ['DeepLearning.AI Prompt Engineering', 'AWS Certified Machine Learning - Specialty'],
        recommended_projects: ['Context-Aware Enterprise RAG Knowledge Assistant', 'Automated Code Review Agent with Gemini API', 'Multimodal Document Intelligence Pipeline'],
        additional_requirements: 'Hands-on familiarity with vector stores (Chroma, Pinecone, pgvector) and prompt optimization.',
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        id: 7,
        title: 'DevOps & Cloud Engineer',
        category: 'Cloud & Infrastructure',
        description: 'Automates cloud infrastructure, manages container orchestration, sets up CI/CD pipelines, and guarantees site reliability.',
        education_requirements: 'B.S. in Computer Science, IT, Systems Engineering or equivalent',
        experience_level: 'Mid-Level',
        minimum_experience: 2,
        maximum_experience: 5,
        recommended_certifications: ['AWS Certified Solutions Architect Associate', 'CKA: Certified Kubernetes Administrator'],
        recommended_projects: ['Zero-Downtime CI/CD Pipeline with GitHub Actions', 'Kubernetes Multi-Tier Microservices Deployment', 'Terraform Infrastructure as Code on AWS'],
        additional_requirements: 'Familiarity with monitoring tools (Prometheus, Grafana), SSL certificates, and zero-trust networking.',
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        id: 8,
        title: 'Cybersecurity Analyst',
        category: 'Security & Compliance',
        description: 'Monitors network perimeters, detects intrusions, conducts vulnerability assessments, and enforces compliance policies.',
        education_requirements: 'Degree in Cybersecurity, Information Assurance, Computer Science',
        experience_level: 'Junior',
        minimum_experience: 1,
        maximum_experience: 3,
        recommended_certifications: ['CompTIA Security+', 'Certified Ethical Hacker (CEH)'],
        recommended_projects: ['Vulnerability Assessment & Remediation Report', 'SIEM Log Analysis & Incident Response Playbook', 'Network Penetration Lab Setup'],
        additional_requirements: 'Knowledge of ISO 27001, NIST framework, Wireshark, and threat defense fundamentals.',
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        id: 9,
        title: 'Mobile Application Developer',
        category: 'Mobile Development',
        description: 'Develops fluid, native and cross-platform mobile apps for iOS and Android platforms with intuitive UX and offline caching.',
        education_requirements: 'Bachelor in Computer Science, Software Engineering, or equivalent',
        experience_level: 'Junior',
        minimum_experience: 1,
        maximum_experience: 4,
        recommended_certifications: ['Google Associate Android Developer', 'Meta React Native Specialization'],
        recommended_projects: ['Fitness Tracker App with Offline SQLite Sync', 'Social Media Feed App with Push Notifications', 'E-Commerce Mobile App with Payment Gateway'],
        additional_requirements: 'Familiarity with App Store & Google Play deployment workflows and mobile lifecycle.',
        status: 'active',
        created_at: now,
        updated_at: now
      }
    ];

    // Seed role_skills
    const roleSkillsMap: Array<{ roleId: number; skillId: number; type: 'mandatory' | 'preferred' | 'optional'; prof: 'Beginner' | 'Intermediate' | 'Advanced'; weight: number }> = [
      // Full Stack (1)
      { roleId: 1, skillId: 3, type: 'mandatory', prof: 'Advanced', weight: 9 }, // JavaScript
      { roleId: 1, skillId: 4, type: 'preferred', prof: 'Intermediate', weight: 7 }, // TypeScript
      { roleId: 1, skillId: 7, type: 'mandatory', prof: 'Advanced', weight: 9 }, // React.js
      { roleId: 1, skillId: 8, type: 'mandatory', prof: 'Intermediate', weight: 8 }, // Node.js
      { roleId: 1, skillId: 9, type: 'mandatory', prof: 'Intermediate', weight: 7 }, // Express.js
      { roleId: 1, skillId: 6, type: 'mandatory', prof: 'Intermediate', weight: 8 }, // SQL
      { roleId: 1, skillId: 13, type: 'mandatory', prof: 'Intermediate', weight: 7 }, // Git
      { roleId: 1, skillId: 12, type: 'mandatory', prof: 'Advanced', weight: 8 }, // RESTful APIs
      { roleId: 1, skillId: 14, type: 'preferred', prof: 'Beginner', weight: 6 }, // Docker
      { roleId: 1, skillId: 31, type: 'preferred', prof: 'Intermediate', weight: 6 }, // Tailwind CSS
      { roleId: 1, skillId: 35, type: 'mandatory', prof: 'Intermediate', weight: 7 }, // Problem Solving
      { roleId: 1, skillId: 36, type: 'mandatory', prof: 'Intermediate', weight: 7 }, // Teamwork

      // Java Backend (2)
      { roleId: 2, skillId: 1, type: 'mandatory', prof: 'Advanced', weight: 10 }, // Java
      { roleId: 2, skillId: 6, type: 'mandatory', prof: 'Advanced', weight: 9 }, // SQL
      { roleId: 2, skillId: 10, type: 'mandatory', prof: 'Advanced', weight: 9 }, // Spring Boot
      { roleId: 2, skillId: 11, type: 'preferred', prof: 'Intermediate', weight: 8 }, // Hibernate
      { roleId: 2, skillId: 12, type: 'mandatory', prof: 'Advanced', weight: 9 }, // RESTful APIs
      { roleId: 2, skillId: 13, type: 'mandatory', prof: 'Intermediate', weight: 7 }, // Git
      { roleId: 2, skillId: 34, type: 'preferred', prof: 'Intermediate', weight: 6 }, // Maven
      { roleId: 2, skillId: 14, type: 'preferred', prof: 'Intermediate', weight: 7 }, // Docker
      { roleId: 2, skillId: 19, type: 'optional', prof: 'Beginner', weight: 5 }, // Redis
      { roleId: 2, skillId: 37, type: 'preferred', prof: 'Intermediate', weight: 8 }, // System Architecture

      // Frontend (3)
      { roleId: 3, skillId: 3, type: 'mandatory', prof: 'Advanced', weight: 10 }, // JavaScript
      { roleId: 3, skillId: 32, type: 'mandatory', prof: 'Advanced', weight: 9 }, // HTML5/CSS3
      { roleId: 3, skillId: 7, type: 'mandatory', prof: 'Advanced', weight: 10 }, // React.js
      { roleId: 3, skillId: 4, type: 'preferred', prof: 'Intermediate', weight: 7 }, // TypeScript
      { roleId: 3, skillId: 31, type: 'preferred', prof: 'Advanced', weight: 8 }, // Tailwind CSS
      { roleId: 3, skillId: 12, type: 'mandatory', prof: 'Intermediate', weight: 7 }, // RESTful APIs
      { roleId: 3, skillId: 13, type: 'mandatory', prof: 'Intermediate', weight: 7 }, // Git
      { roleId: 3, skillId: 30, type: 'preferred', prof: 'Intermediate', weight: 6 }, // Unit Testing

      // Python Dev (4)
      { roleId: 4, skillId: 2, type: 'mandatory', prof: 'Advanced', weight: 10 }, // Python
      { roleId: 4, skillId: 6, type: 'mandatory', prof: 'Intermediate', weight: 8 }, // SQL
      { roleId: 4, skillId: 12, type: 'mandatory', prof: 'Advanced', weight: 8 }, // RESTful APIs
      { roleId: 4, skillId: 13, type: 'mandatory', prof: 'Intermediate', weight: 7 }, // Git
      { roleId: 4, skillId: 14, type: 'preferred', prof: 'Intermediate', weight: 6 }, // Docker
      { roleId: 4, skillId: 17, type: 'preferred', prof: 'Intermediate', weight: 7 }, // PostgreSQL
      { roleId: 4, skillId: 26, type: 'preferred', prof: 'Intermediate', weight: 6 }, // Linux/Bash

      // Data Scientist (5)
      { roleId: 5, skillId: 2, type: 'mandatory', prof: 'Advanced', weight: 10 }, // Python
      { roleId: 5, skillId: 20, type: 'mandatory', prof: 'Advanced', weight: 10 }, // Machine Learning
      { roleId: 5, skillId: 23, type: 'mandatory', prof: 'Advanced', weight: 9 }, // Pandas/NumPy
      { roleId: 5, skillId: 24, type: 'mandatory', prof: 'Intermediate', weight: 8 }, // Data Viz
      { roleId: 5, skillId: 6, type: 'mandatory', prof: 'Advanced', weight: 8 }, // SQL
      { roleId: 5, skillId: 21, type: 'preferred', prof: 'Intermediate', weight: 7 }, // Deep Learning
      { roleId: 5, skillId: 35, type: 'mandatory', prof: 'Advanced', weight: 8 }, // Problem Solving

      // AI Application Developer (6)
      { roleId: 6, skillId: 2, type: 'mandatory', prof: 'Advanced', weight: 9 }, // Python
      { roleId: 6, skillId: 22, type: 'mandatory', prof: 'Advanced', weight: 10 }, // LLMs
      { roleId: 6, skillId: 12, type: 'mandatory', prof: 'Advanced', weight: 8 }, // RESTful APIs
      { roleId: 6, skillId: 20, type: 'preferred', prof: 'Intermediate', weight: 7 }, // Machine Learning
      { roleId: 6, skillId: 14, type: 'preferred', prof: 'Intermediate', weight: 6 }, // Docker
      { roleId: 6, skillId: 4, type: 'preferred', prof: 'Intermediate', weight: 6 }, // TypeScript
      { roleId: 6, skillId: 18, type: 'optional', prof: 'Intermediate', weight: 5 }, // MongoDB

      // DevOps & Cloud (7)
      { roleId: 7, skillId: 26, type: 'mandatory', prof: 'Advanced', weight: 9 }, // Linux/Bash
      { roleId: 7, skillId: 14, type: 'mandatory', prof: 'Advanced', weight: 10 }, // Docker
      { roleId: 7, skillId: 15, type: 'mandatory', prof: 'Intermediate', weight: 9 }, // Kubernetes
      { roleId: 7, skillId: 16, type: 'mandatory', prof: 'Advanced', weight: 9 }, // AWS
      { roleId: 7, skillId: 25, type: 'mandatory', prof: 'Advanced', weight: 9 }, // CI/CD
      { roleId: 7, skillId: 13, type: 'mandatory', prof: 'Advanced', weight: 8 }, // Git
      { roleId: 7, skillId: 2, type: 'preferred', prof: 'Intermediate', weight: 6 }, // Python

      // Cybersecurity Analyst (8)
      { roleId: 8, skillId: 27, type: 'mandatory', prof: 'Advanced', weight: 10 }, // Security Fundamentals
      { roleId: 8, skillId: 28, type: 'mandatory', prof: 'Advanced', weight: 9 }, // Network Security
      { roleId: 8, skillId: 26, type: 'mandatory', prof: 'Intermediate', weight: 8 }, // Linux/Bash
      { roleId: 8, skillId: 2, type: 'preferred', prof: 'Intermediate', weight: 6 }, // Python
      { roleId: 8, skillId: 35, type: 'mandatory', prof: 'Advanced', weight: 8 }, // Problem Solving

      // Mobile Dev (9)
      { roleId: 9, skillId: 3, type: 'mandatory', prof: 'Advanced', weight: 9 }, // JavaScript
      { roleId: 9, skillId: 39, type: 'mandatory', prof: 'Advanced', weight: 9 }, // React Native
      { roleId: 9, skillId: 38, type: 'preferred', prof: 'Intermediate', weight: 7 }, // Flutter
      { roleId: 9, skillId: 12, type: 'mandatory', prof: 'Intermediate', weight: 8 }, // RESTful APIs
      { roleId: 9, skillId: 13, type: 'mandatory', prof: 'Intermediate', weight: 7 } // Git
    ];

    let roleSkillId = 1;
    this.data.role_skills = roleSkillsMap.map(m => ({
      id: roleSkillId++,
      job_role_id: m.roleId,
      skill_id: m.skillId,
      requirement_type: m.type,
      required_proficiency: m.prof,
      importance_weight: m.weight,
      created_at: now
    }));

    // Seed Sample Resume for Alex Johnson
    this.data.resumes = [
      {
        id: 1,
        user_id: 2,
        template_id: 'professional',
        title: 'Alex Johnson - Full Stack Engineer Resume',
        target_job_role: 'Full Stack Developer',
        personal_info: {
          fullName: 'Alex Johnson',
          email: 'alex.johnson@example.com',
          phone: '+1 (555) 382-9104',
          location: 'San Francisco, CA',
          linkedin: 'linkedin.com/in/alexjohnson-dev',
          github: 'github.com/alexjohnson-dev',
          portfolio: 'alexjohnson.dev'
        },
        career_summary: 'Results-oriented Full Stack Software Engineer with 2+ years of experience designing and deploying high-performance web applications using React, Node.js, and SQL databases. Adept at translating complex product requirements into scalable RESTful architectures and responsive, user-friendly interfaces.',
        career_objective: 'Aspiring to contribute to engineering excellence as a Senior Full Stack Developer, driving resilient cloud architectures and intuitive web solutions.',
        education: [
          {
            institution: 'University of California, Berkeley',
            degree: 'Bachelor of Science',
            branch: 'Computer Science',
            graduationYear: '2024',
            cgpa: '3.85 / 4.00'
          }
        ],
        skills: {
          programmingLanguages: ['JavaScript', 'TypeScript', 'Python', 'SQL'],
          frameworks: ['React.js', 'Node.js', 'Express.js', 'Tailwind CSS'],
          databases: ['PostgreSQL', 'MongoDB', 'Redis'],
          tools: ['Git', 'GitHub', 'Docker', 'VS Code'],
          softSkills: ['Problem Solving', 'Agile Collaboration', 'Technical Writing'],
          technicalSkills: ['RESTful APIs', 'Data Structures', 'WebSockets', 'JWT Authentication']
        },
        projects: [
          {
            title: 'DevPulse - Team Task & Sprint Platform',
            description: 'Developed full-stack agile project workspace with real-time sprint boards, drag-and-drop ticket workflows, and automated email notifications.',
            technologies: 'React, Node.js, Express, PostgreSQL, Tailwind CSS',
            link: 'https://github.com/alexjohnson-dev/devpulse',
            responsibilities: 'Engineered REST APIs with JWT authentication and designed normalized relational database schema with indexed search queries.'
          },
          {
            title: 'CloudMetrics - Distributed Server Health Monitor',
            description: 'Architected time-series telemetry telemetry dashboard tracking CPU, memory, and disk I/O metrics across virtual machines.',
            technologies: 'Node.js, Express, Redis, Chart.js, Docker',
            link: 'https://github.com/alexjohnson-dev/cloudmetrics',
            responsibilities: 'Implemented pub/sub caching layer with Redis and built responsive visualization panels with Chart.js.'
          }
        ],
        experience: [
          {
            company: 'Apex Software Labs',
            jobTitle: 'Associate Full Stack Developer',
            duration: 'June 2024 - Present',
            responsibilities: 'Built and maintained customer-facing responsive dashboard portals using React and Express. Reduced API latency by 32% through PostgreSQL query optimization and caching.',
            achievements: 'Spearheaded migration to TypeScript, reducing runtime production exceptions by 45%.'
          }
        ],
        certifications: [
          {
            name: 'AWS Certified Cloud Practitioner',
            issuer: 'Amazon Web Services',
            year: '2024'
          },
          {
            name: 'Meta Front-End Developer Certificate',
            issuer: 'Coursera / Meta',
            year: '2023'
          }
        ],
        additional_sections: {
          languages: ['English (Native)', 'Spanish (Conversational)'],
          awards: ['First Place - Golden Gate Hackathon 2023'],
          extracurricular: ['Lead Organizer, University Open Source Club']
        },
        completion_percentage: 92,
        created_at: now,
        updated_at: now
      }
    ];

    // Seed User Skills for Alex
    const alexSkills = [
      { name: 'JavaScript', prof: 'Advanced' as const },
      { name: 'React.js', prof: 'Advanced' as const },
      { name: 'Node.js', prof: 'Intermediate' as const },
      { name: 'Express.js', prof: 'Intermediate' as const },
      { name: 'SQL', prof: 'Intermediate' as const },
      { name: 'Git / GitHub', prof: 'Intermediate' as const },
      { name: 'RESTful APIs', prof: 'Advanced' as const },
      { name: 'Tailwind CSS', prof: 'Intermediate' as const },
      { name: 'TypeScript', prof: 'Intermediate' as const },
      { name: 'Python', prof: 'Beginner' as const },
      { name: 'Problem Solving', prof: 'Intermediate' as const },
      { name: 'Team Collaboration', prof: 'Intermediate' as const }
    ];

    let userSkillId = 1;
    this.data.user_skills = alexSkills.map(s => ({
      id: userSkillId++,
      user_id: 2,
      skill_name: s.name,
      proficiency: s.prof,
      source: 'resume',
      created_at: now,
      updated_at: now
    }));

    // Seed Skill Progress
    this.data.skill_progress = [
      {
        id: 1,
        user_id: 2,
        job_role_id: 1,
        skill_name: 'Docker',
        status: 'Learning',
        current_proficiency: 'Beginner',
        notes: 'Studying multi-stage Dockerfiles and containerization best practices.',
        updated_at: now
      },
      {
        id: 2,
        user_id: 2,
        job_role_id: 1,
        skill_name: 'AWS',
        status: 'Learning',
        current_proficiency: 'Beginner',
        notes: 'Hands-on practice configuring S3 buckets, Lambda functions, and CloudWatch alarms.',
        updated_at: now
      },
      {
        id: 3,
        user_id: 2,
        job_role_id: 2,
        skill_name: 'Spring Boot',
        status: 'Not Started',
        current_proficiency: 'None',
        notes: 'Targeting next quarter after completing Java OOP refresher.',
        updated_at: now
      }
    ];

    // Seed Admin Activity Log
    this.data.admin_activity_logs = [
      {
        id: 1,
        admin_id: 1,
        admin_name: 'System Administrator',
        action: 'SYSTEM_INITIALIZATION',
        entity_type: 'SYSTEM',
        entity_id: '0',
        details: 'Initial database schema created and seeded with 9 job roles and 40 technical skills.',
        ip_address: '127.0.0.1',
        created_at: now
      }
    ];

    this.save();
    console.log('Database successfully initialized with full relational data.');
  }

  // --- Users Operations ---
  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  }

  public findUserById(id: number): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(userData: { name: string; email: string; password_hash: string; role?: 'USER' | 'ADMIN' }): User {
    const now = new Date().toISOString();
    const newUser: User = {
      id: this.data.users.length ? Math.max(...this.data.users.map(u => u.id)) + 1 : 1,
      name: userData.name.trim(),
      email: userData.email.toLowerCase().trim(),
      password_hash: userData.password_hash,
      role: userData.role || 'USER',
      status: 'active',
      created_at: now,
      updated_at: now
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  public getAllUsers(): User[] {
    return this.data.users;
  }

  public updateUserStatus(id: number, status: 'active' | 'inactive'): boolean {
    const user = this.data.users.find(u => u.id === id);
    if (!user) return false;
    user.status = status;
    user.updated_at = new Date().toISOString();
    this.save();
    return true;
  }

  public updateUserProfile(id: number, updates: { name?: string; email?: string; password_hash?: string }): User | null {
    const user = this.data.users.find(u => u.id === id);
    if (!user) return null;
    if (updates.name) user.name = updates.name.trim();
    if (updates.email) user.email = updates.email.toLowerCase().trim();
    if (updates.password_hash) user.password_hash = updates.password_hash;
    user.updated_at = new Date().toISOString();
    this.save();
    return user;
  }

  public deleteUser(id: number): boolean {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return false;
    this.data.users.splice(index, 1);
    // Cascade delete related records
    this.data.resumes = this.data.resumes.filter(r => r.user_id !== id);
    this.data.user_skills = this.data.user_skills.filter(s => s.user_id !== id);
    this.data.skill_progress = this.data.skill_progress.filter(p => p.user_id !== id);
    this.data.user_recommendations = this.data.user_recommendations.filter(r => r.user_id !== id);
    this.save();
    return true;
  }

  // --- Resumes Operations ---
  public getResumesByUserId(userId: number): Resume[] {
    return this.data.resumes.filter(r => r.user_id === userId);
  }

  public getResumeById(id: number): Resume | undefined {
    return this.data.resumes.find(r => r.id === id);
  }

  public createResume(resumeData: Omit<Resume, 'id' | 'created_at' | 'updated_at'>): Resume {
    const now = new Date().toISOString();
    const newResume: Resume = {
      ...resumeData,
      id: this.data.resumes.length ? Math.max(...this.data.resumes.map(r => r.id)) + 1 : 1,
      created_at: now,
      updated_at: now
    };
    this.data.resumes.push(newResume);
    this.save();
    return newResume;
  }

  public updateResume(id: number, updates: Partial<Resume>): Resume | null {
    const resume = this.data.resumes.find(r => r.id === id);
    if (!resume) return null;
    Object.assign(resume, updates, { updated_at: new Date().toISOString() });
    this.save();
    return resume;
  }

  public deleteResume(id: number): boolean {
    const index = this.data.resumes.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.data.resumes.splice(index, 1);
    this.save();
    return true;
  }

  public getAllResumesAdmin(): (Resume & { user_name?: string; user_email?: string })[] {
    return this.data.resumes.map(r => {
      const user = this.data.users.find(u => u.id === r.user_id);
      return {
        ...r,
        user_name: user?.name,
        user_email: user?.email
      };
    });
  }

  // --- Resume Templates Operations ---
  public getActiveTemplates(): ResumeTemplate[] {
    return this.data.resume_templates.filter(t => t.is_active);
  }

  public getAllTemplatesAdmin(): ResumeTemplate[] {
    return this.data.resume_templates;
  }

  public getTemplateById(id: string): ResumeTemplate | undefined {
    return this.data.resume_templates.find(t => t.id === id);
  }

  public createTemplate(templateData: Omit<ResumeTemplate, 'created_at' | 'updated_at'>): ResumeTemplate {
    const now = new Date().toISOString();
    const newTemplate: ResumeTemplate = {
      ...templateData,
      created_at: now,
      updated_at: now
    };
    this.data.resume_templates.push(newTemplate);
    this.save();
    return newTemplate;
  }

  public updateTemplate(id: string, updates: Partial<ResumeTemplate>): ResumeTemplate | null {
    const tpl = this.data.resume_templates.find(t => t.id === id);
    if (!tpl) return null;
    Object.assign(tpl, updates, { updated_at: new Date().toISOString() });
    this.save();
    return tpl;
  }

  public deleteTemplate(id: string): boolean {
    const index = this.data.resume_templates.findIndex(t => t.id === id);
    if (index === -1) return false;
    this.data.resume_templates.splice(index, 1);
    this.save();
    return true;
  }

  // --- Skills Operations ---
  public getAllSkills(): Skill[] {
    return this.data.skills.sort((a, b) => a.name.localeCompare(b.name));
  }

  public getSkillById(id: number): Skill | undefined {
    return this.data.skills.find(s => s.id === id);
  }

  public getSkillByName(name: string): Skill | undefined {
    return this.data.skills.find(s => s.name.toLowerCase() === name.toLowerCase().trim());
  }

  public createSkill(skillData: { name: string; category: string; description?: string }): Skill {
    const now = new Date().toISOString();
    const existing = this.getSkillByName(skillData.name);
    if (existing) return existing;

    const newSkill: Skill = {
      id: this.data.skills.length ? Math.max(...this.data.skills.map(s => s.id)) + 1 : 1,
      name: skillData.name.trim(),
      category: skillData.category.trim(),
      description: skillData.description || '',
      created_at: now,
      updated_at: now
    };
    this.data.skills.push(newSkill);
    this.save();
    return newSkill;
  }

  public updateSkill(id: number, updates: Partial<Skill>): Skill | null {
    const skill = this.data.skills.find(s => s.id === id);
    if (!skill) return null;
    Object.assign(skill, updates, { updated_at: new Date().toISOString() });
    this.save();
    return skill;
  }

  public deleteSkill(id: number): { success: boolean; message?: string } {
    // Check if skill is used in any role_skills
    const inUse = this.data.role_skills.some(rs => rs.skill_id === id);
    if (inUse) {
      return { success: false, message: 'Skill is currently required by one or more job roles. Remove it from job roles first.' };
    }
    const index = this.data.skills.findIndex(s => s.id === id);
    if (index === -1) return { success: false, message: 'Skill not found' };
    this.data.skills.splice(index, 1);
    this.save();
    return { success: true };
  }

  // --- Job Roles & Dynamic Requirements Operations ---
  public getActiveJobRoles(): JobRole[] {
    return this.data.job_roles.filter(r => r.status === 'active');
  }

  public getAllJobRolesAdmin(): (JobRole & { required_skills_count?: number })[] {
    return this.data.job_roles.map(r => {
      const skillsCount = this.data.role_skills.filter(rs => rs.job_role_id === r.id).length;
      return {
        ...r,
        required_skills_count: skillsCount
      };
    });
  }

  public getJobRoleById(id: number): JobRole | undefined {
    return this.data.job_roles.find(r => r.id === id);
  }

  public createJobRole(roleData: Omit<JobRole, 'id' | 'created_at' | 'updated_at'>): JobRole {
    const now = new Date().toISOString();
    const newRole: JobRole = {
      ...roleData,
      id: this.data.job_roles.length ? Math.max(...this.data.job_roles.map(r => r.id)) + 1 : 1,
      created_at: now,
      updated_at: now
    };
    this.data.job_roles.push(newRole);
    this.save();
    return newRole;
  }

  public updateJobRole(id: number, updates: Partial<JobRole>): JobRole | null {
    const role = this.data.job_roles.find(r => r.id === id);
    if (!role) return null;
    Object.assign(role, updates, { updated_at: new Date().toISOString() });
    this.save();
    return role;
  }

  public updateJobRoleStatus(id: number, status: 'active' | 'inactive'): boolean {
    const role = this.data.job_roles.find(r => r.id === id);
    if (!role) return false;
    role.status = status;
    role.updated_at = new Date().toISOString();
    this.save();
    return true;
  }

  public deleteJobRole(id: number): boolean {
    const index = this.data.job_roles.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.data.job_roles.splice(index, 1);
    // Cascade delete role_skills
    this.data.role_skills = this.data.role_skills.filter(rs => rs.job_role_id !== id);
    this.save();
    return true;
  }

  // --- Role Skills Operations (CRITICAL FOR DYNAMIC CAREER REQUIREMENTS) ---
  public getRoleSkills(jobRoleId: number): RoleSkill[] {
    return this.data.role_skills
      .filter(rs => rs.job_role_id === jobRoleId)
      .map(rs => {
        const skill = this.data.skills.find(s => s.id === rs.skill_id);
        return {
          ...rs,
          skill_name: skill?.name,
          skill_category: skill?.category,
          skill_description: skill?.description
        };
      });
  }

  public addSkillToJobRole(jobRoleId: number, skillId: number, requirement_type: 'mandatory' | 'preferred' | 'optional', required_proficiency: 'Beginner' | 'Intermediate' | 'Advanced', importance_weight = 5): RoleSkill {
    const existing = this.data.role_skills.find(rs => rs.job_role_id === jobRoleId && rs.skill_id === skillId);
    if (existing) {
      existing.requirement_type = requirement_type;
      existing.required_proficiency = required_proficiency;
      existing.importance_weight = importance_weight;
      this.save();
      const skill = this.data.skills.find(s => s.id === skillId);
      return {
        ...existing,
        skill_name: skill?.name,
        skill_category: skill?.category
      };
    }

    const now = new Date().toISOString();
    const newRoleSkill: RoleSkill = {
      id: this.data.role_skills.length ? Math.max(...this.data.role_skills.map(rs => rs.id)) + 1 : 1,
      job_role_id: jobRoleId,
      skill_id: skillId,
      requirement_type,
      required_proficiency,
      importance_weight,
      created_at: now
    };
    this.data.role_skills.push(newRoleSkill);
    this.save();

    const skill = this.data.skills.find(s => s.id === skillId);
    return {
      ...newRoleSkill,
      skill_name: skill?.name,
      skill_category: skill?.category
    };
  }

  public updateRoleSkill(jobRoleId: number, skillId: number, updates: Partial<RoleSkill>): RoleSkill | null {
    const roleSkill = this.data.role_skills.find(rs => rs.job_role_id === jobRoleId && rs.skill_id === skillId);
    if (!roleSkill) return null;
    Object.assign(roleSkill, updates);
    this.save();
    const skill = this.data.skills.find(s => s.id === skillId);
    return {
      ...roleSkill,
      skill_name: skill?.name,
      skill_category: skill?.category
    };
  }

  public removeSkillFromJobRole(jobRoleId: number, skillId: number): boolean {
    const index = this.data.role_skills.findIndex(rs => rs.job_role_id === jobRoleId && rs.skill_id === skillId);
    if (index === -1) return false;
    this.data.role_skills.splice(index, 1);
    this.save();
    return true;
  }

  // --- User Skills & Progress Operations ---
  public getUserSkills(userId: number): UserSkill[] {
    return this.data.user_skills.filter(s => s.user_id === userId);
  }

  public setUserSkills(userId: number, skillsList: Array<{ skill_name: string; proficiency: 'Beginner' | 'Intermediate' | 'Advanced'; source?: 'resume' | 'manual' | 'verified' }>): void {
    const now = new Date().toISOString();
    // Remove existing
    this.data.user_skills = this.data.user_skills.filter(s => s.user_id !== userId);
    let nextId = this.data.user_skills.length ? Math.max(...this.data.user_skills.map(s => s.id)) + 1 : 1;

    for (const item of skillsList) {
      if (!item.skill_name?.trim()) continue;
      this.data.user_skills.push({
        id: nextId++,
        user_id: userId,
        skill_name: item.skill_name.trim(),
        proficiency: item.proficiency || 'Intermediate',
        source: item.source || 'resume',
        created_at: now,
        updated_at: now
      });
    }
    this.save();
  }

  public getUserSkillProgress(userId: number, jobRoleId?: number): SkillProgress[] {
    if (jobRoleId) {
      return this.data.skill_progress.filter(p => p.user_id === userId && p.job_role_id === jobRoleId);
    }
    return this.data.skill_progress.filter(p => p.user_id === userId);
  }

  public updateSkillProgress(userId: number, jobRoleId: number, skillName: string, status: 'Not Started' | 'Learning' | 'Completed', currentProficiency: 'None' | 'Beginner' | 'Intermediate' | 'Advanced', notes = ''): SkillProgress {
    const now = new Date().toISOString();
    let entry = this.data.skill_progress.find(p => p.user_id === userId && p.job_role_id === jobRoleId && p.skill_name.toLowerCase() === skillName.toLowerCase());

    if (entry) {
      entry.status = status;
      entry.current_proficiency = currentProficiency;
      entry.notes = notes;
      entry.updated_at = now;
    } else {
      entry = {
        id: this.data.skill_progress.length ? Math.max(...this.data.skill_progress.map(p => p.id)) + 1 : 1,
        user_id: userId,
        job_role_id: jobRoleId,
        skill_name: skillName,
        status,
        current_proficiency: currentProficiency,
        notes,
        updated_at: now
      };
      this.data.skill_progress.push(entry);
    }
    this.save();
    return entry;
  }

  // --- Admin Analytics & Logs Operations ---
  public logAdminActivity(adminId: number, action: string, entityType: string, entityId: string, details: string, ip = '127.0.0.1'): void {
    const admin = this.findUserById(adminId);
    const newLog: AdminActivityLog = {
      id: this.data.admin_activity_logs.length ? Math.max(...this.data.admin_activity_logs.map(l => l.id)) + 1 : 1,
      admin_id: adminId,
      admin_name: admin?.name || 'Administrator',
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
      ip_address: ip,
      created_at: new Date().toISOString()
    };
    this.data.admin_activity_logs.unshift(newLog);
    // Keep max 200 logs
    if (this.data.admin_activity_logs.length > 200) {
      this.data.admin_activity_logs.pop();
    }
    this.save();
  }

  public getAdminActivityLogs(limit = 50): AdminActivityLog[] {
    return this.data.admin_activity_logs.slice(0, limit);
  }

  public logAiUsage(userId: number | null, feature: string, promptTokens: number, completionTokens: number, status: 'success' | 'failed', errorMsg?: string): void {
    const user = userId ? this.findUserById(userId) : null;
    const newLog: AiUsageLog = {
      id: this.data.ai_usage_logs.length ? Math.max(...this.data.ai_usage_logs.map(l => l.id)) + 1 : 1,
      user_id: userId,
      user_email: user?.email,
      feature_used: feature,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      status,
      error_message: errorMsg,
      created_at: new Date().toISOString()
    };
    this.data.ai_usage_logs.unshift(newLog);
    if (this.data.ai_usage_logs.length > 300) {
      this.data.ai_usage_logs.pop();
    }
    this.save();
  }

  public getAdminDashboardStats() {
    const totalUsers = this.data.users.length;
    const activeUsers = this.data.users.filter(u => u.status === 'active').length;
    const totalResumes = this.data.resumes.length;
    const totalTemplates = this.data.resume_templates.length;
    const activeTemplates = this.data.resume_templates.filter(t => t.is_active).length;
    const totalJobRoles = this.data.job_roles.length;
    const activeJobRoles = this.data.job_roles.filter(r => r.status === 'active').length;
    const totalSkills = this.data.skills.length;
    const totalAiRequests = this.data.ai_usage_logs.length;

    // Popular templates
    const templateCounts: Record<string, number> = {};
    for (const r of this.data.resumes) {
      templateCounts[r.template_id] = (templateCounts[r.template_id] || 0) + 1;
    }
    const popularTemplates = this.data.resume_templates.map(t => ({
      template_id: t.id,
      template_name: t.name,
      usage_count: templateCounts[t.id] || 0
    })).sort((a, b) => b.usage_count - a.usage_count);

    // Job role categories breakdown
    const categoryCounts: Record<string, number> = {};
    for (const r of this.data.job_roles) {
      categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
    }

    // Skills category breakdown
    const skillCategoryCounts: Record<string, number> = {};
    for (const s of this.data.skills) {
      skillCategoryCounts[s.category] = (skillCategoryCounts[s.category] || 0) + 1;
    }

    // Recent registrations
    const recentUsers = [...this.data.users]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map(({ password_hash, ...u }) => u);

    // Recent activity
    const recentActivity = this.getAdminActivityLogs(10);

    return {
      totalUsers,
      activeUsers,
      totalResumes,
      totalTemplates,
      activeTemplates,
      totalJobRoles,
      activeJobRoles,
      totalSkills,
      totalAiRequests,
      popularTemplates,
      jobRoleCategories: categoryCounts,
      skillCategories: skillCategoryCounts,
      recentUsers,
      recentActivity
    };
  }
}

export const db = new Database();
