-- ResumeCraft Database Seed Data
-- Database: resumecraft_db

USE resumecraft_db;

-- 1. Insert Initial Users
-- Passwords:
-- admin@resumecraft.com -> Admin@123456 (bcrypt hash: $2a$10$w09Zf6P.y0b/5rW7qBfq8epXW0p9Zc2mF5qN.N5iQz9n/C.pGsm9m or generated via standard bcrypt)
-- alex@example.com -> User@123456
INSERT INTO users (id, name, email, password_hash, role, status) VALUES
(1, 'System Administrator', 'admin@resumecraft.com', '$2a$10$s9v4T7.c4r0x8zGkM1uCg.5fLwZ2mF5qN.N5iQz9n/C.pGsm9m.', 'ADMIN', 'active'),
(2, 'Alex Johnson', 'alex@example.com', '$2a$10$s9v4T7.c4r0x8zGkM1uCg.5fLwZ2mF5qN.N5iQz9n/C.pGsm9m.', 'USER', 'active')
ON DUPLICATE KEY UPDATE id=id;

-- 2. Insert Resume Templates (8 distinct styles)
INSERT INTO resume_templates (id, name, category, description, preview_image, is_active) VALUES
('professional', 'Professional Classic', 'Corporate', 'Structured, authoritative executive format with navy accents and balanced sections.', '/templates/professional.png', 1),
('modern', 'Modern Purple', 'Modern', 'Contemporary card styling, sleek purple gradient header badges, and timeline indicators.', '/templates/modern.png', 1),
('minimal', 'Minimalist Clean', 'Clean', 'Maximum whitespace, understated typography, and effortless reading flow.', '/templates/minimal.png', 1),
('creative', 'Creative Portfolio', 'Design', 'Bold sidebar profile, visual skill proficiency meters, and highlighted project links.', '/templates/creative.png', 1),
('ats_friendly', 'ATS-Friendly Standard', 'ATS', 'Single-column plain text parsing optimized format compliant with applicant tracking systems.', '/templates/ats.png', 1),
('fresher', 'Fresher / Student', 'Academic', 'Prioritizes academic coursework, degree highlights, internships, and capstone projects.', '/templates/fresher.png', 1),
('tech_developer', 'Technical Developer', 'Engineering', 'Monospace accents, GitHub repository callouts, categorized tech stack badges.', '/templates/developer.png', 1),
('executive', 'Executive Leadership', 'Leadership', 'Metrics-oriented, strategic highlights, organizational leadership and board impact.', '/templates/executive.png', 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- 3. Insert Skills across diverse categories
INSERT INTO skills (id, name, category, description) VALUES
(1, 'Java', 'Programming Languages', 'Core Java, Collections framework, Multi-threading and JVM fundamentals.'),
(2, 'Python', 'Programming Languages', 'General-purpose programming, scripting, data manipulation and backend APIs.'),
(3, 'JavaScript', 'Programming Languages', 'Modern ES6+ syntax, asynchronous programming, DOM and event loop.'),
(4, 'TypeScript', 'Programming Languages', 'Statically typed superset of JavaScript for large-scale enterprise apps.'),
(5, 'C++', 'Programming Languages', 'Low-level memory management, pointers, STL, and algorithmic efficiency.'),
(6, 'SQL', 'Databases', 'Relational querying, joins, indexing, query optimization, and transactions.'),
(7, 'React.js', 'Frameworks', 'Component lifecycle, hooks, state management, and virtual DOM architecture.'),
(8, 'Node.js', 'Frameworks', 'Event-driven asynchronous server runtime, HTTP servers, and microservices.'),
(9, 'Express.js', 'Frameworks', 'Fast, unopinionated, minimalist web framework for Node.js REST APIs.'),
(10, 'Spring Boot', 'Frameworks', 'Enterprise Java framework, dependency injection, Spring Security & Data.'),
(11, 'Hibernate / JPA', 'Frameworks', 'Object-Relational Mapping (ORM) for Java applications and query criteria.'),
(12, 'RESTful APIs', 'Developer Tools', 'Architectural style for networked hypermedia applications and JSON endpoints.'),
(13, 'Git / GitHub', 'Developer Tools', 'Distributed version control, branching strategies, and CI/CD pull requests.'),
(14, 'Docker', 'Cloud Platforms', 'Containerization of applications, Dockerfile authoring, and container registry.'),
(15, 'Kubernetes', 'Cloud Platforms', 'Container orchestration, pod management, deployments, and service discovery.'),
(16, 'AWS', 'Cloud Platforms', 'Amazon Web Services including EC2, S3, RDS, Lambda, and IAM security.'),
(17, 'PostgreSQL', 'Databases', 'Advanced open-source relational database with ACID compliance and JSON support.'),
(18, 'MongoDB', 'Databases', 'Document-oriented NoSQL database with flexible JSON-like schemas.'),
(19, 'Redis', 'Databases', 'In-memory key-value data structure store used for caching and pub/sub.'),
(20, 'Machine Learning', 'Data Science', 'Supervised/unsupervised algorithms, scikit-learn, cross-validation, and metrics.'),
(21, 'Deep Learning', 'Artificial Intelligence', 'Neural networks, PyTorch, TensorFlow, backpropagation, and CNNs/RNNs.'),
(22, 'Large Language Models (LLMs)', 'Artificial Intelligence', 'Prompt engineering, fine-tuning, embeddings, RAG, and generative AI.'),
(23, 'Pandas / NumPy', 'Data Science', 'Data manipulation, statistical analysis, matrices, and vectorized computing.'),
(24, 'Data Visualization', 'Data Science', 'Communicating analytical insights using Matplotlib, Seaborn, Tableau, or D3.js.'),
(25, 'CI/CD Pipelines', 'Cloud Platforms', 'Automated testing and deployment workflows using GitHub Actions or Jenkins.'),
(26, 'Linux / Bash', 'Developer Tools', 'Command-line scripting, system administration, and process monitoring.'),
(27, 'Cybersecurity Fundamentals', 'Cybersecurity', 'CIA triad, threat modeling, vulnerability assessment, and OWASP Top 10.'),
(28, 'Network Security', 'Cybersecurity', 'Firewalls, TCP/IP protocol inspection, VPNs, and packet analysis.'),
(29, 'GraphQL', 'Frameworks', 'Declarative data querying language for APIs and schema definition.'),
(30, 'Unit Testing (Jest/JUnit)', 'Developer Tools', 'Test-driven development, test suites, mock assertions, and code coverage.'),
(31, 'Tailwind CSS', 'Frameworks', 'Utility-first CSS framework for rapid and maintainable responsive UI.'),
(32, 'HTML5 & CSS3', 'Programming Languages', 'Semantic document structure, accessibility (a11y), flexbox and CSS grid.'),
(33, 'Next.js', 'Frameworks', 'React framework for server-rendered apps, API routes, and static generation.'),
(34, 'Maven / Gradle', 'Developer Tools', 'Build automation tools and dependency managers for Java/JVM applications.'),
(35, 'Problem Solving', 'Soft Skills', 'Analytical thinking, decomposing complex challenges, and root-cause debugging.'),
(36, 'Team Collaboration', 'Soft Skills', 'Cross-functional communication, code reviews, and Agile/Scrum ceremonies.'),
(37, 'System Architecture', 'Soft Skills', 'High-level software design, scalability, microservices, and design patterns.'),
(38, 'Flutter', 'Frameworks', 'Cross-platform mobile and web application development framework using Dart.'),
(39, 'React Native', 'Frameworks', 'Mobile application development using React for iOS and Android.'),
(40, 'TensorFlow / PyTorch', 'Artificial Intelligence', 'Deep learning framework for training and deploying neural network architectures.')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 4. Insert Comprehensive Job Roles
INSERT INTO job_roles (id, title, category, description, education_requirements, experience_level, minimum_experience, maximum_experience, recommended_certifications, recommended_projects, additional_requirements, status) VALUES
(1, 'Full Stack Developer', 'Software Engineering', 'Architects and builds responsive end-to-end web applications combining robust backend services with modern reactive frontend interfaces.', 'B.Tech / B.E. / B.Sc in Computer Science, IT, or related degree', 'Mid-Level', 1, 4,
 '["AWS Certified Developer", "Meta Front-End & Back-End Professional Certificate"]',
 '["E-Commerce Full Stack Platform with Stripe Checkout", "Real-time Collaboration Workspace with WebSockets", "SaaS Task Management with RBAC"]',
 'Strong grasp of data structures, RESTful design patterns, and cross-browser testing.', 'active'),

(2, 'Java Backend Developer', 'Software Engineering', 'Specializes in high-throughput enterprise systems, distributed microservices, REST APIs, and database persistence using Java ecosystem.', 'Bachelor in Computer Science, Information Technology, or equivalent', 'Mid-Level', 2, 5,
 '["Oracle Certified Professional: Java SE Programmer", "Spring Professional Certification"]',
 '["Banking Microservices API with Spring Boot & JWT", "High-Volume Order Processing System with Redis Cache", "Distributed Event Broker Consumer"]',
 'Understanding of JVM internals, garbage collection tuning, and transactional integrity.', 'active'),

(3, 'Frontend Developer', 'Software Engineering', 'Creates pixel-perfect, accessible, and high-performance user interfaces for modern web and mobile applications.', 'B.S. in Computer Science, Web Development, or equivalent bootcamp', 'Junior', 1, 3,
 '["Meta Front-End Developer Certificate", "Google UX Design Professional Certificate"]',
 '["Analytics Dashboard with Chart.js & Dark Mode", "Interactive Kanban Board with Drag & Drop", "Accessible Component Design System"]',
 'Proficiency in responsive design, CSS Grid/Flexbox, state management and Lighthouse metrics.', 'active'),

(4, 'Python Developer', 'Software Engineering', 'Builds scalable backend services, automated workflows, web scrapers, and data pipelines using Python frameworks.', 'Degree in Computer Science, Software Engineering, or related quantitative field', 'Junior', 1, 3,
 '["PCAP - Certified Associate in Python Programming", "AWS Solutions Architect Associate"]',
 '["FastAPI Microservice with PostgreSQL & Docker", "Automated Web Scraping and ETL Pipeline", "Job Search Aggregator with Celery Workers"]',
 'Comfortable with asynchronous programming, package management with Poetry/Pipenv.', 'active'),

(5, 'Data Scientist', 'Data & Analytics', 'Extracts actionable business insights, constructs predictive machine learning models, and interprets massive datasets.', 'B.S. / M.S. in Computer Science, Statistics, Mathematics, or Data Science', 'Mid-Level', 2, 5,
 '["IBM Data Science Professional Certificate", "Google Data Analytics Professional Certificate"]',
 '["Customer Churn Prediction with Scikit-Learn", "Financial Fraud Detection using Ensemble Models", "Interactive Exploratory Data Analysis Report"]',
 'Solid grounding in probability, hypothesis testing, linear algebra, and data wrangling.', 'active'),

(6, 'AI Application Developer', 'Artificial Intelligence', 'Designs and deploys generative AI applications integrating Large Language Models, embeddings, RAG pipelines, and vector databases.', 'B.Tech / M.S. in Computer Science, AI, or Software Engineering', 'Mid-Level', 1, 4,
 '["DeepLearning.AI Prompt Engineering", "AWS Certified Machine Learning - Specialty"]',
 '["Context-Aware Enterprise RAG Knowledge Assistant", "Automated Code Review Agent with Gemini API", "Multimodal Document Intelligence Pipeline"]',
 'Hands-on familiarity with vector stores (Chroma, Pinecone, pgvector) and prompt optimization.', 'active'),

(7, 'DevOps & Cloud Engineer', 'Cloud & Infrastructure', 'Automates cloud infrastructure, manages container orchestration, sets up CI/CD pipelines, and guarantees site reliability.', 'B.S. in Computer Science, IT, Systems Engineering or equivalent', 'Mid-Level', 2, 5,
 '["AWS Certified Solutions Architect Associate", "CKA: Certified Kubernetes Administrator"]',
 '["Zero-Downtime CI/CD Pipeline with GitHub Actions", "Kubernetes Multi-Tier Microservices Deployment", "Terraform Infrastructure as Code on AWS"]',
 'Familiarity with monitoring tools (Prometheus, Grafana), SSL certificates, and zero-trust networking.', 'active'),

(8, 'Cybersecurity Analyst', 'Security & Compliance', 'Monitors network perimeters, detects intrusions, conducts vulnerability assessments, and enforces compliance policies.', 'Degree in Cybersecurity, Information Assurance, Computer Science', 'Junior', 1, 3,
 '["CompTIA Security+", "Certified Ethical Hacker (CEH)"]',
 '["Vulnerability Assessment & Remediation Report", "SIEM Log Analysis & Incident Response Playbook", "Network Penetration Lab Setup"]',
 'Knowledge of ISO 27001, NIST framework, Wireshark, and threat defense fundamentals.', 'active'),

(9, 'Mobile Application Developer', 'Mobile Development', 'Develops fluid, native and cross-platform mobile apps for iOS and Android platforms with intuitive UX and offline caching.', 'Bachelor in Computer Science, Software Engineering, or equivalent', 'Junior', 1, 4,
 '["Google Associate Android Developer", "Meta React Native Specialization"]',
 '["Fitness Tracker App with Offline SQLite Sync", "Social Media Feed App with Push Notifications", "E-Commerce Mobile App with Payment Gateway"]',
 'Familiarity with App Store & Google Play deployment workflows and mobile lifecycle.', 'active')
ON DUPLICATE KEY UPDATE title=VALUES(title), description=VALUES(description);

-- 5. Map Skills to Job Roles (role_skills)
-- Full Stack Developer (Job Role 1)
INSERT INTO role_skills (job_role_id, skill_id, requirement_type, required_proficiency, importance_weight) VALUES
(1, 3, 'mandatory', 'Advanced', 9),     -- JavaScript
(1, 4, 'preferred', 'Intermediate', 7), -- TypeScript
(1, 7, 'mandatory', 'Advanced', 9),     -- React.js
(1, 8, 'mandatory', 'Intermediate', 8), -- Node.js
(1, 9, 'mandatory', 'Intermediate', 7), -- Express.js
(1, 6, 'mandatory', 'Intermediate', 8), -- SQL
(1, 13, 'mandatory', 'Intermediate', 7), -- Git / GitHub
(1, 12, 'mandatory', 'Advanced', 8),    -- RESTful APIs
(1, 14, 'preferred', 'Beginner', 6),    -- Docker
(1, 31, 'preferred', 'Intermediate', 6), -- Tailwind CSS
(1, 35, 'mandatory', 'Intermediate', 7), -- Problem Solving
(1, 36, 'mandatory', 'Intermediate', 7); -- Team Collaboration

-- Java Backend Developer (Job Role 2)
INSERT INTO role_skills (job_role_id, skill_id, requirement_type, required_proficiency, importance_weight) VALUES
(2, 1, 'mandatory', 'Advanced', 10),    -- Java
(2, 6, 'mandatory', 'Advanced', 9),     -- SQL
(2, 10, 'mandatory', 'Advanced', 9),    -- Spring Boot
(2, 11, 'preferred', 'Intermediate', 8), -- Hibernate / JPA
(2, 12, 'mandatory', 'Advanced', 9),    -- RESTful APIs
(2, 13, 'mandatory', 'Intermediate', 7), -- Git / GitHub
(2, 34, 'preferred', 'Intermediate', 6), -- Maven / Gradle
(2, 14, 'preferred', 'Intermediate', 7), -- Docker
(2, 19, 'optional', 'Beginner', 5),     -- Redis
(2, 37, 'preferred', 'Intermediate', 8); -- System Architecture

-- Frontend Developer (Job Role 3)
INSERT INTO role_skills (job_role_id, skill_id, requirement_type, required_proficiency, importance_weight) VALUES
(3, 3, 'mandatory', 'Advanced', 10),    -- JavaScript
(3, 32, 'mandatory', 'Advanced', 9),    -- HTML5 & CSS3
(3, 7, 'mandatory', 'Advanced', 10),    -- React.js
(3, 4, 'preferred', 'Intermediate', 7), -- TypeScript
(3, 31, 'preferred', 'Advanced', 8),    -- Tailwind CSS
(3, 12, 'mandatory', 'Intermediate', 7), -- RESTful APIs
(3, 13, 'mandatory', 'Intermediate', 7), -- Git / GitHub
(3, 30, 'preferred', 'Intermediate', 6); -- Unit Testing

-- Python Developer (Job Role 4)
INSERT INTO role_skills (job_role_id, skill_id, requirement_type, required_proficiency, importance_weight) VALUES
(4, 2, 'mandatory', 'Advanced', 10),    -- Python
(4, 6, 'mandatory', 'Intermediate', 8), -- SQL
(4, 12, 'mandatory', 'Advanced', 8),    -- RESTful APIs
(4, 13, 'mandatory', 'Intermediate', 7), -- Git / GitHub
(4, 14, 'preferred', 'Intermediate', 6), -- Docker
(4, 17, 'preferred', 'Intermediate', 7), -- PostgreSQL
(4, 26, 'preferred', 'Intermediate', 6); -- Linux / Bash

-- Data Scientist (Job Role 5)
INSERT INTO role_skills (job_role_id, skill_id, requirement_type, required_proficiency, importance_weight) VALUES
(5, 2, 'mandatory', 'Advanced', 10),    -- Python
(5, 20, 'mandatory', 'Advanced', 10),   -- Machine Learning
(5, 23, 'mandatory', 'Advanced', 9),    -- Pandas / NumPy
(5, 24, 'mandatory', 'Intermediate', 8), -- Data Visualization
(5, 6, 'mandatory', 'Advanced', 8),     -- SQL
(5, 21, 'preferred', 'Intermediate', 7), -- Deep Learning
(5, 35, 'mandatory', 'Advanced', 8);    -- Problem Solving

-- AI Application Developer (Job Role 6)
INSERT INTO role_skills (job_role_id, skill_id, requirement_type, required_proficiency, importance_weight) VALUES
(6, 2, 'mandatory', 'Advanced', 9),     -- Python
(6, 22, 'mandatory', 'Advanced', 10),   -- Large Language Models (LLMs)
(6, 12, 'mandatory', 'Advanced', 8),    -- RESTful APIs
(6, 20, 'preferred', 'Intermediate', 7), -- Machine Learning
(6, 14, 'preferred', 'Intermediate', 6), -- Docker
(6, 4, 'preferred', 'Intermediate', 6), -- TypeScript
(6, 18, 'optional', 'Intermediate', 5); -- MongoDB

-- DevOps & Cloud Engineer (Job Role 7)
INSERT INTO role_skills (job_role_id, skill_id, requirement_type, required_proficiency, importance_weight) VALUES
(7, 26, 'mandatory', 'Advanced', 9),    -- Linux / Bash
(7, 14, 'mandatory', 'Advanced', 10),   -- Docker
(7, 15, 'mandatory', 'Intermediate', 9), -- Kubernetes
(7, 16, 'mandatory', 'Advanced', 9),    -- AWS
(7, 25, 'mandatory', 'Advanced', 9),    -- CI/CD Pipelines
(7, 13, 'mandatory', 'Advanced', 8),    -- Git / GitHub
(7, 2, 'preferred', 'Intermediate', 6); -- Python

-- Cybersecurity Analyst (Job Role 8)
INSERT INTO role_skills (job_role_id, skill_id, requirement_type, required_proficiency, importance_weight) VALUES
(8, 27, 'mandatory', 'Advanced', 10),   -- Cybersecurity Fundamentals
(8, 28, 'mandatory', 'Advanced', 9),    -- Network Security
(8, 26, 'mandatory', 'Intermediate', 8), -- Linux / Bash
(8, 2, 'preferred', 'Intermediate', 6), -- Python
(8, 35, 'mandatory', 'Advanced', 8);    -- Problem Solving

-- Mobile Application Developer (Job Role 9)
INSERT INTO role_skills (job_role_id, skill_id, requirement_type, required_proficiency, importance_weight) VALUES
(9, 3, 'mandatory', 'Advanced', 9),     -- JavaScript
(9, 39, 'mandatory', 'Advanced', 9),    -- React Native
(9, 38, 'preferred', 'Intermediate', 7), -- Flutter
(9, 12, 'mandatory', 'Intermediate', 8), -- RESTful APIs
(9, 13, 'mandatory', 'Intermediate', 7); -- Git / GitHub

-- 6. Insert Sample Resume for Demo User
INSERT INTO resumes (id, user_id, template_id, title, target_job_role, personal_info, career_summary, career_objective, education, skills, projects, experience, certifications, additional_sections, completion_percentage) VALUES
(1, 2, 'professional', 'Alex Johnson - Full Stack Engineer Resume', 'Full Stack Developer',
'{"fullName": "Alex Johnson", "email": "alex.johnson@example.com", "phone": "+1 (555) 382-9104", "location": "San Francisco, CA", "linkedin": "linkedin.com/in/alexjohnson-dev", "github": "github.com/alexjohnson-dev", "portfolio": "alexjohnson.dev"}',
'Results-oriented Full Stack Software Engineer with 2+ years of experience designing and deploying high-performance web applications using React, Node.js, and SQL databases. Adept at translating complex product requirements into scalable RESTful architectures and responsive, user-friendly interfaces.',
'Aspiring to contribute to engineering excellence as a Senior Full Stack Developer, driving resilient cloud architectures and intuitive web solutions.',
'[{"institution": "University of California, Berkeley", "degree": "Bachelor of Science", "branch": "Computer Science", "graduationYear": "2024", "cgpa": "3.85 / 4.00"}]',
'{"programmingLanguages": ["JavaScript", "TypeScript", "Python", "SQL"], "frameworks": ["React.js", "Node.js", "Express.js", "Tailwind CSS"], "databases": ["PostgreSQL", "MongoDB", "Redis"], "tools": ["Git", "GitHub", "Docker", "VS Code"], "softSkills": ["Problem Solving", "Agile Collaboration", "Technical Writing"]}',
'[{"title": "DevPulse - Team Task & Sprint Platform", "description": "Developed full-stack agile project workspace with real-time sprint boards, drag-and-drop ticket workflows, and automated email notifications.", "technologies": "React, Node.js, Express, PostgreSQL, Tailwind CSS", "link": "https://github.com/alexjohnson-dev/devpulse", "responsibilities": "Engineered REST APIs with JWT authentication and designed normalized relational database schema with indexed search queries."}]',
'[{"company": "Apex Software Labs", "jobTitle": "Associate Full Stack Developer", "duration": "June 2024 - Present", "responsibilities": "Built and maintained customer-facing responsive dashboard portals using React and Express. Reduced API latency by 32% through PostgreSQL query optimization and caching.", "achievements": "Spearheaded migration to TypeScript, reducing runtime production exceptions by 45%."}]',
'[{"name": "AWS Certified Cloud Practitioner", "issuer": "Amazon Web Services", "year": "2024"}, {"name": "Meta Front-End Developer Certificate", "issuer": "Coursera / Meta", "year": "2023"}]',
'{"languages": ["English (Native)", "Spanish (Conversational)"], "awards": ["First Place - Golden Gate Hackathon 2023"], "extracurricular": ["Organizer, University Open Source Club"]}',
92)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 7. Insert Initial User Skills for Alex
INSERT INTO user_skills (user_id, skill_name, proficiency, source) VALUES
(2, 'JavaScript', 'Advanced', 'resume'),
(2, 'React.js', 'Advanced', 'resume'),
(2, 'Node.js', 'Intermediate', 'resume'),
(2, 'Express.js', 'Intermediate', 'resume'),
(2, 'SQL', 'Intermediate', 'resume'),
(2, 'Git / GitHub', 'Intermediate', 'resume'),
(2, 'RESTful APIs', 'Advanced', 'resume'),
(2, 'Tailwind CSS', 'Intermediate', 'resume'),
(2, 'TypeScript', 'Intermediate', 'resume'),
(2, 'Python', 'Beginner', 'resume'),
(2, 'Problem Solving', 'Intermediate', 'resume'),
(2, 'Team Collaboration', 'Intermediate', 'resume')
ON DUPLICATE KEY UPDATE proficiency=VALUES(proficiency);

-- 8. Insert Initial Skill Progress for Alex
INSERT INTO skill_progress (user_id, job_role_id, skill_name, status, current_proficiency, notes) VALUES
(2, 1, 'Docker', 'Learning', 'Beginner', 'Going through containerization fundamentals and Dockerfile commands.'),
(2, 1, 'AWS', 'Learning', 'Beginner', 'Studying S3 bucket policies and EC2 instance deployments.'),
(2, 2, 'Spring Boot', 'Not Started', 'None', 'Planning to learn after completing Java OOP refresher.')
ON DUPLICATE KEY UPDATE status=VALUES(status);
