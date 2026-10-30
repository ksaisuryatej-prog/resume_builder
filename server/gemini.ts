import { GoogleGenAI } from '@google/genai';
import { db } from './db.js';

let aiInstance: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured. Please configure your key in Settings > Secrets to enable live AI generation.');
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

function withTimeout<T>(promise: Promise<T>, ms = 15000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('AI request timeout')), ms))
  ]);
}

/**
 * Executes a Gemini model call with automatic fallback from gemini-3.8-flash
 * to gemini-3.1-flash-lite if rate limits or quota exhaustion (429) occur.
 */
async function generateWithCascade(
  ai: GoogleGenAI,
  params: { contents: string; config?: any }
): Promise<string> {
  const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];

  for (let i = 0; i < modelsToTry.length; i++) {
    const model = modelsToTry[i];
    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        })
      );
      const text = response.text?.trim() || '';
      if (text) return text;
    } catch (err: any) {
      const isQuotaOrLimit =
        err?.status === 429 ||
        err?.message?.includes('429') ||
        err?.message?.includes('RESOURCE_EXHAUSTED') ||
        err?.message?.includes('quota');

      console.warn(`[Gemini Cascade] Model ${model} encountered ${err?.message?.slice(0, 80)}. Falling back to next model...`);

      if (i === modelsToTry.length - 1) {
        throw err;
      }
    }
  }

  throw new Error('All AI models failed to return content.');
}

export const GeminiService = {
  /**
   * Generates or improves a professional summary based on user details
   */
  async generateSummary(userId: number | null, params: {
    fullName?: string;
    targetJobRole?: string;
    yearsOfExperience?: string | number;
    skills?: string[];
    education?: string;
    existingSummary?: string;
    tone?: 'concise' | 'impactful' | 'executive' | 'impact' | 'ats';
  }): Promise<string> {
    const ai = getAiClient();
    const cleanTone = params.tone === 'impact' ? 'impactful' : (params.tone || 'impactful');
    const prompt = `You are an expert career strategist and executive resume writer.
Task: ${params.existingSummary ? 'Improve and optimize this existing resume summary' : 'Generate an impactful, ATS-optimized professional resume summary'}.

Candidate Context:
- Name: ${params.fullName || 'Candidate'}
- Target Job Role: ${params.targetJobRole || 'Software Engineering Professional'}
- Experience Level: ${params.yearsOfExperience || 'Mid-Level'}
- Core Skills: ${params.skills?.join(', ') || 'Modern full-stack development, database architecture'}
- Education: ${params.education || 'Computer Science / Engineering degree'}
${params.existingSummary ? `- Existing Summary Draft: "${params.existingSummary}"` : ''}
- Desired Tone: ${cleanTone}

Guidelines:
1. Return 3 to 4 punchy sentences with active verbs and quantifiable impact.
2. Emphasize high-value technical abilities without generic buzzwords or fluff.
3. NEVER fabricate specific companies or fake metrics; keep placeholders or authentic phrasing.
4. Output ONLY the polished summary paragraph directly without quotation marks or conversational commentary.`;

    try {
      const text = await generateWithCascade(ai, { contents: prompt });
      db.logAiUsage(userId, 'generate_summary', 120, 80, 'success');
      return text;
    } catch (error: any) {
      console.error('Gemini generateSummary error:', error);
      db.logAiUsage(userId, 'generate_summary', 0, 0, 'failed', error?.message);

      // Context-aware dynamic fallback reflecting the exact candidate inputs
      const skillsStr = params.skills?.length ? params.skills.slice(0, 4).join(', ') : 'modern software development and system architecture';
      if (params.existingSummary && params.existingSummary.trim().length > 15) {
        return `${params.existingSummary.trim()} Demonstrated expertise in ${skillsStr}, applying proactive problem-solving to deliver scalable and maintainable solutions.`;
      }
      return `Results-driven ${params.targetJobRole || 'Professional'} with hands-on expertise in ${skillsStr}. Adept at designing robust solutions, collaborating across cross-functional teams, and consistently delivering high-quality outcomes.`;
    }
  },

  /**
   * Generates an actionable career objective
   */
  async generateCareerObjective(userId: number | null, params: {
    targetJobRole: string;
    currentBackground?: string;
    topSkills?: string[];
  }): Promise<string> {
    const ai = getAiClient();
    const prompt = `Generate a concise 2-sentence career objective for a resume.
Target Job Role: ${params.targetJobRole}
Background: ${params.currentBackground || 'Computer Science graduate'}
Key Strengths: ${params.topSkills?.join(', ') || 'Analytical problem solving, software engineering'}

Rules:
- State value proposition and ambition to contribute to team excellence.
- Crisp, professional, without passive voice.
- Return ONLY the two sentences without preamble or quotes.`;

    try {
      const text = await generateWithCascade(ai, { contents: prompt });
      db.logAiUsage(userId, 'generate_objective', 90, 40, 'success');
      return text;
    } catch (error: any) {
      db.logAiUsage(userId, 'generate_objective', 0, 0, 'failed', error?.message);
      const skillsPart = params.topSkills?.length ? `proficiencies in ${params.topSkills.slice(0, 3).join(', ')}` : 'technical proficiencies';
      return `Dedicated and forward-thinking ${params.targetJobRole} seeking to leverage core ${skillsPart} to deliver high-impact enterprise solutions while continuing to expand engineering excellence.`;
    }
  },

  /**
   * Improves work experience bullet points or project descriptions
   */
  async improveBulletPoints(userId: number | null, params: {
    roleOrProject: string;
    rawText: string;
    technologies?: string;
  }): Promise<string> {
    const ai = getAiClient();
    const prompt = `You are a top-tier technical recruiter and resume editor.
Context:
Role or Project: ${params.roleOrProject}
Technologies: ${params.technologies || 'Modern engineering tools'}
Input Draft:
"${params.rawText}"

Instructions:
1. Rewrite this into strong, action-oriented resume bullet points or a cohesive impactful description.
2. Begin statements with strong action verbs (e.g., Engineered, Optimized, Spearheaded, Architected, Automated).
3. Emphasize technical problem-solving and outcomes.
4. Correct all grammar and punctuation errors.
5. Provide ONLY the improved text directly without conversational intro.`;

    try {
      const text = await generateWithCascade(ai, { contents: prompt });
      db.logAiUsage(userId, 'improve_bullet_points', 130, 90, 'success');
      return text;
    } catch (error: any) {
      db.logAiUsage(userId, 'improve_bullet_points', 0, 0, 'failed', error?.message);
      const clean = params.rawText.trim().replace(/^\s*[-•*]\s*/gm, '');
      const lines = clean.split('\n').filter(Boolean);
      if (lines.length > 0) {
        return lines.map(line => {
          let s = line.trim();
          s = s.charAt(0).toUpperCase() + s.slice(1);
          if (!s.endsWith('.')) s += '.';
          s = s
            .replace(/^(Wrote|Worked on|Did|Made|Helped with)\s+/i, 'Engineered high-performance ')
            .replace(/^(Fixed|Debugged)\s+/i, 'Resolved and optimized ')
            .replace(/^(Built)\s+/i, 'Architected and deployed ');
          return `• ${s}`;
        }).join('\n');
      }
      return `• Engineered responsive components and scalable REST endpoints for ${params.roleOrProject}, boosting system throughput and code quality.`;
    }
  },

  /**
   * Suggests high-demand ATS keywords and missing skills for a given target role
   */
  async suggestSkillsAndKeywords(userId: number | null, params: {
    targetJobRole: string;
    currentSkills: string[];
  }): Promise<{ suggestedSkills: string[]; actionVerbs: string[]; resumeAdvice: string }> {
    const ai = getAiClient();
    const prompt = `Analyze this target role and candidate skill set:
Target Role: ${params.targetJobRole}
Current Skills: ${params.currentSkills.join(', ')}

Provide:
1. 8 to 10 high-impact missing or recommended technical and domain skills for ATS optimization.
2. 6 strong action verbs relevant to this domain.
3. A 2-sentence piece of strategic resume advice.

Format strictly as JSON with keys:
{
  "suggestedSkills": ["Skill 1", "Skill 2"],
  "actionVerbs": ["Architected", "Accelerated"],
  "resumeAdvice": "Advice text here"
}`;

    try {
      const text = await generateWithCascade(ai, {
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      const parsed = JSON.parse(text);
      db.logAiUsage(userId, 'suggest_keywords', 150, 110, 'success');
      return {
        suggestedSkills: parsed.suggestedSkills || [],
        actionVerbs: parsed.actionVerbs || ['Architected', 'Engineered', 'Optimized', 'Deployed', 'Refactored', 'Automated'],
        resumeAdvice: parsed.resumeAdvice || 'Highlight quantitative business outcomes and link verified GitHub repositories for your key projects.'
      };
    } catch (error: any) {
      db.logAiUsage(userId, 'suggest_keywords', 0, 0, 'failed', error?.message);
      return {
        suggestedSkills: ['Docker', 'REST APIs', 'CI/CD Pipelines', 'Unit Testing', 'PostgreSQL', 'Redis'],
        actionVerbs: ['Architected', 'Engineered', 'Streamlined', 'Deployed', 'Spearheaded', 'Optimized'],
        resumeAdvice: 'Emphasize measurable performance improvements (e.g. latency, throughput, error reduction) in your project descriptions.'
      };
    }
  },

  /**
   * Explains why a job role fits a user and generates career gap advice
   */
  async explainRoleMatch(userId: number | null, params: {
    jobRoleTitle: string;
    matchPercentage: number;
    matchingSkills: string[];
    missingMandatory: string[];
    missingPreferred: string[];
  }): Promise<string> {
    const ai = getAiClient();
    const prompt = `Explain why a candidate with these matching skills is suited for "${params.jobRoleTitle}" and give encouragement.
Match percentage: ${params.matchPercentage}%.
Matching Skills: ${params.matchingSkills.join(', ')}
Missing Mandatory: ${params.missingMandatory.join(', ') || 'None'}
Missing Preferred: ${params.missingPreferred.join(', ') || 'None'}

Rules:
- Be encouraging, realistic, and constructive.
- Explicitly mention that match percentage is a skill alignment indicator, not a guaranteed hiring probability.
- Keep the response to 3 clear, motivating sentences. Output ONLY the response text.`;

    try {
      const text = await generateWithCascade(ai, { contents: prompt });
      db.logAiUsage(userId, 'explain_match', 140, 80, 'success');
      return text;
    } catch (error: any) {
      db.logAiUsage(userId, 'explain_match', 0, 0, 'failed', error?.message);
      return `You possess strong foundational alignment with ${params.jobRoleTitle} through your core competencies in ${params.matchingSkills.slice(0, 3).join(', ')}. Addressing key missing requirements like ${params.missingMandatory.slice(0, 2).join(', ') || 'advanced domain frameworks'} will significantly boost your competitive standing in the job market. Note that skill alignment scores provide learning direction rather than guaranteed employment outcomes.`;
    }
  },

  /**
   * Generates a personalized learning roadmap with practical projects
   */
  async generateLearningRoadmap(userId: number | null, params: {
    targetJobRole: string;
    missingSkills: string[];
    currentLevel: string;
  }): Promise<Array<{
    skill: string;
    order: number;
    level: string;
    objectives: string;
    practicalExercises: string;
    suggestedProject: string;
  }>> {
    const ai = getAiClient();
    const prompt = `Create a structured learning roadmap for a student aiming to become a "${params.targetJobRole}".
Missing Skills to cover: ${params.missingSkills.join(', ')}
Current Level: ${params.currentLevel}

Provide an ordered list of up to 5 learning modules.
Return strictly a JSON array of objects:
[
  {
    "skill": "Skill Name",
    "order": 1,
    "level": "Beginner / Intermediate / Advanced",
    "objectives": "2 clear bullet goals for this skill",
    "practicalExercises": "Hands-on laboratory or coding exercise",
    "suggestedProject": "Specific capstone mini-project title and brief description"
  }
]`;

    try {
      const text = await generateWithCascade(ai, {
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      const parsed = JSON.parse(text);
      db.logAiUsage(userId, 'generate_roadmap', 180, 220, 'success');
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : this.fallbackRoadmap(params.missingSkills);
    } catch (error: any) {
      db.logAiUsage(userId, 'generate_roadmap', 0, 0, 'failed', error?.message);
      return this.fallbackRoadmap(params.missingSkills);
    }
  },

  fallbackRoadmap(missingSkills: string[]) {
    return missingSkills.slice(0, 4).map((skill, index) => ({
      skill,
      order: index + 1,
      level: index === 0 ? 'Intermediate' : 'Beginner',
      objectives: `Understand foundational principles of ${skill} and build modular examples.`,
      practicalExercises: `Create a standalone GitHub repository implementing key ${skill} configurations and tests.`,
      suggestedProject: `${skill} Integration Dashboard - A hands-on project demonstrating practical implementation.`
    }));
  }
};
