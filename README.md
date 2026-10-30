# ResumeCraft – AI-Powered Resume Generation & Intelligent Career Recommendation Platform

> **"Build Your Future, One Resume at a Time."**

ResumeCraft is a production-grade, full-stack career platform combining an intelligent ATS-compliant resume builder, Google Gemini 3.8 Flash AI content optimization, dynamic MySQL-backed job role requirements matching, transparent skill gap analysis, and personalized learning roadmaps.

---

## 🌟 Key Features

### 1. Public Landing Page
- Modern SaaS aesthetic with Navy Blue (`#0f172a`), Clean White, and Purple (`#7c3aed`) accents.
- Hero section, Feature breakdown, 4-step workflow, FAQ accordion, and interactive 8-template showcase.
- One-click quick test logins for candidate and administrator accounts.

### 2. User Authentication & Authorization (RBAC)
- Strict role-based access control separating `USER` and `ADMIN` privileges.
- Password hashing using `bcryptjs` (salt rounds: 10).
- HTTP-only session cookies and Bearer token fallback.
- Server-side validation on every protected route.

### 3. Complete Resume Builder
- Multi-section inputs:
  - Personal Details (Name, Phone, Email, Location, LinkedIn, GitHub, Portfolio)
  - Career Details (Target Job Role, Professional Summary, Career Objective)
  - Education (multiple degrees, institution, branch, year, CGPA)
  - Skills (Categorized into Programming Languages, Frameworks, Databases, DevTools, Soft Skills)
  - Technical Projects (title, description, technologies, live/repo links, responsibilities)
  - Work Experience (company, title, duration, responsibilities, metric achievements)
  - Certifications & Additional Sections (languages, honors, extracurricular)
- **Zero Data Loss Switching**: Seamlessly switch between all 8 resume templates in real-time without losing user input.
- **Live Document Preview**: Real-time side-by-side rendering with zoom and page layout.
- **Instant PDF Export**: High-resolution client-side multi-page PDF generation via `html2pdf.js` and print styling.
- **Completion Percentage**: Dynamic score evaluating resume section completeness.

### 4. Eight Curated Resume Templates
1. **Professional Classic**: Authoritative navy section headers, balanced two-column contact and skill blocks.
2. **Modern Purple**: Sleek deep purple gradient accent bar, modern card tags, and timeline markers.
3. **Minimalist Clean**: Ample whitespace, high signal-to-noise ratio, and understated typography.
4. **Creative Portfolio**: Dark sidebar with graphic proficiency meters, bold headings, and portfolio showcase.
5. **ATS-Friendly Standard**: Single-column layout compliant with applicant tracking system parsers.
6. **Fresher / Student**: Education-first hierarchy highlighting capstone projects, academic honors, and coursework.
7. **Technical Developer**: Monospace code font accents, categorized tech stack matrices, and repository links.
8. **Executive Leadership**: Strategic milestones, executive competencies grid, and board impact.

### 5. Google Gemini 3.8 Flash AI Integration
- **Server-Side Exclusivity**: All Gemini calls run through backend Express routes via `@google/genai` (SDK >= 2.25.0) with telemetry headers (`User-Agent: aistudio-build`).
- **AI Summary Generation**: Tailored 3-4 sentence summaries based on user skills and target role.
- **AI Career Objective Generation**: Formulates crisp career objectives for students and freshers.
- **AI Bullet Point Polish**: Restructures project and job descriptions with action verbs and quantifiable results.
- **ATS Keyword Suggestions**: Suggests missing high-demand technical keywords and action verbs.
- **Encouraging Match Explanations**: Contextual rationale explaining candidate alignment with target roles.
- **Curated Learning Roadmaps**: Step-by-step curriculum with practical projects for missing skills.

### 6. Dynamic MySQL Job Role & Skill Matching Engine
- **No Hardcoded Rules**: Job requirements are pulled directly from MySQL relational tables (`job_roles`, `skills`, `role_skills`).
- **Transparent Weighted Algorithm**:
  - Mandatory skills: 1.8x weight
  - Preferred skills: 1.2x weight
  - Optional skills: 0.6x weight
  - Calculated Match Percentage: `(Earned Weight / Total Possible Weight) * 100`
- **Dynamic Updates**: When an administrator updates a job role or adds required skills in the Admin Portal, user recommendations immediately recalculate against the latest requirements.

### 7. AI Skill Gap Analysis & Learning Roadmap
- Compare candidate profile against target job role.
- Explains what missing skills are, why they are important, and where they are used.
- Allows marking skills as `Not Started`, `Learning`, or `Completed` with proficiency tracking persisted in MySQL.
- Personalized learning roadmaps with practical laboratory exercises and capstone projects.

### 8. Comprehensive Admin Portal
- **Dashboard Analytics**: Real-time stats on registered users, active resumes, template popularity, job role categories, and audit logs.
- **Job Role Management**: Add, edit, activate, deactivate, and delete job roles.
- **Dynamic Job Requirements Management**: Add, update, or remove required skills for any job role with proficiency and importance weight.
- **Skills Catalog**: Add and categorize technical skills.
- **User Management**: View, filter, activate/deactivate accounts, and delete with safety guards preventing removal of the last admin.
- **Resume Management**: Inspect resume metadata and manage records.
- **Template Configuration**: Activate or deactivate templates for public view.

---

## 🗄️ Database Architecture (MySQL)

Database Name: `resumecraft_db`

### Tables:
1. `users`: Account credentials, bcrypt hash, role (`USER`, `ADMIN`), status (`active`, `inactive`).
2. `resume_templates`: Template identifiers, categories, descriptions, active status.
3. `resumes`: Normalized resume documents with JSON fields for personal info, education, skills, projects, experience, certs.
4. `job_roles`: Industry specifications, education requirements, experience range, status.
5. `skills`: Master catalog of technical and soft skills grouped into 9 categories.
6. `role_skills`: Bridge table mapping job roles to skills with `requirement_type` (`mandatory`, `preferred`, `optional`), `required_proficiency`, and `importance_weight`.
7. `user_skills`: Candidate skills extracted from saved resumes or added manually.
8. `skill_progress`: Tracks user learning status (`Not Started`, `Learning`, `Completed`) and notes.
9. `user_recommendations`: Cached recommendation scores and AI explanations.
10. `admin_activity_logs`: Audit trail of administrative actions with IP addresses and timestamps.
11. `ai_usage_logs`: Token counts, features used, and API statuses.

SQL DDL & Seed Scripts:
- `database/schema.sql`: Full table definitions and foreign keys.
- `database/seed.sql`: Pre-loaded with 2 users, 8 templates, 9 job roles, 40+ skills, and skill mappings.

---

## 🔑 Test Credentials

| Account Role | Email | Password | Access Level |
|---|---|---|---|
| **System Administrator** | `admin@resumecraft.com` | `Admin@123456` | Full Admin Portal & User Portal |
| **Demo Candidate (Alex)** | `alex@example.com` | `User@123456` | User Portal & Resume Builder |

*One-click login buttons are also provided on the sign-in modal for quick evaluation.*

---

## 💻 Local Setup & Running in VS Code (Windows / Mac / Linux)

### Prerequisites:
- **Node.js** (v18 or v20+ recommended)
- **npm** (v9+)
- *(Optional)* **MySQL Server** (v8.0+). If MySQL is not running locally, ResumeCraft automatically uses its zero-configuration embedded relational engine in `data/resumecraft_store.json`, ensuring the app runs immediately with zero errors!

### Steps:

1. **Clone or Download the Project**:
   ```bash
   git clone <repository_url>
   cd resumecraft
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables (`.env`)**:
   The repository already includes `.env` with predefined empty variables. You only need to open `.env` and fill in the values:

   ```env
   PORT=3000
   SESSION_SECRET=your_secret_key_here
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_USER=root
   MYSQL_PASSWORD=your_mysql_password
   MYSQL_DATABASE=resumecraft_db
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

   - **`PORT`**: Pre-set to `3000`.
   - **`SESSION_SECRET`**: Any random string to secure session cookies.
   - **`GEMINI_API_KEY`**: Obtain a free API key at [Google AI Studio](https://aistudio.google.com/).
   - **`MYSQL_*`**: Fill in your local MySQL credentials. If left empty, ResumeCraft automatically falls back to its persistent zero-config database in `data/resumecraft_store.json` without requiring any source code changes.
   - Refer to `.env.example` for reference guidance.
   - `.env` is listed in `.gitignore` so your credentials are never committed.

4. *(Optional) Import MySQL Schema & Seed Data*:
   If running a local MySQL server:
   ```bash
   mysql -u root -p < database/schema.sql
   mysql -u root -p resumecraft_db < database/seed.sql
   ```

5. **Start the Application**:
   ```bash
   npm start
   ```
   *Or for development mode:*
   ```bash
   npm run dev
   ```

6. **Open in Browser**:
   Navigate to:
   ```
   http://localhost:3000
   ```

---

## 🛡️ Cybersecurity & Verification Highlights
- Zero API keys exposed on client side.
- Passwords salted and hashed with bcrypt.
- SQL parameterized querying patterns.
- Protected admin endpoints verified on the backend (`req.user.role === 'ADMIN'`).
- Resume ownership verification on every update and delete request.
