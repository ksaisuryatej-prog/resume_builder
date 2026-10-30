import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Resume, JobRecommendation, SkillProgress, RoadmapStep, User } from '../types';
import { ResumeRenderer } from '../components/templates/ResumeRenderer';
import { generateResumePdf } from '../utils/pdfGenerator';
import {
  LayoutDashboard,
  FilePlus,
  Files,
  Sparkles,
  Compass,
  BarChart2,
  Route,
  User as UserIcon,
  LogOut,
  Save,
  Download,
  Printer,
  Copy,
  Trash2,
  Edit3,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Layers,
  ChevronRight,
  ExternalLink,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Eye,
  Key,
  Shield,
  Briefcase,
  GraduationCap,
  Code2,
  Award,
  Globe,
  Mail,
  Phone,
  MapPin,
  Check,
  FileText
} from 'lucide-react';

interface AiReviewModalState {
  isOpen: boolean;
  title: string;
  fieldLabel: string;
  originalText: string;
  suggestedText: string;
  onApply: (approvedText: string) => void;
}

export const UserPortal: React.FC = () => {
  const { user, token, userTab, setUserTab, currentResumeId, setCurrentResumeId, logout, setActiveView, refreshUser } = useAuth();

  // Resume state
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [currentResume, setCurrentResume] = useState<Resume | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('professional');
  const [builderTab, setBuilderTab] = useState<'personal' | 'career' | 'education' | 'skills' | 'projects' | 'experience' | 'certifications' | 'additional'>('personal');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activePreviewZoom, setActivePreviewZoom] = useState(100);

  // Dedicated PDF Export state
  const [exportingResume, setExportingResume] = useState<Resume | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Career recommendations state
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [topRoleExplanation, setTopRoleExplanation] = useState<string>('');
  const [isLoadingCareer, setIsLoadingCareer] = useState(false);
  const [selectedAnalysisRole, setSelectedAnalysisRole] = useState<number | null>(null);
  const [skillProgressList, setSkillProgressList] = useState<SkillProgress[]>([]);

  // Roadmap state
  const [roadmap, setRoadmap] = useState<RoadmapStep[]>([]);
  const [roadmapRoleTitle, setRoadmapRoleTitle] = useState<string>('');
  const [isLoadingRoadmap, setIsLoadingRoadmap] = useState(false);

  // AI Review Modal State
  const [aiReviewModal, setAiReviewModal] = useState<AiReviewModalState>({
    isOpen: false,
    title: '',
    fieldLabel: '',
    originalText: '',
    suggestedText: '',
    onApply: () => {}
  });

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [profileMessage, setProfileMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Dedicated AI Polish Tab State
  const [aiPolishSection, setAiPolishSection] = useState<'summary' | 'objective' | 'experience' | 'projects' | 'skills'>('summary');
  const [aiPolishTone, setAiPolishTone] = useState<'impact' | 'executive' | 'ats' | 'concise'>('impact');

  // Templates definition
  const templates = [
    { id: 'professional', name: 'Professional Classic', category: 'Corporate', desc: 'Balanced dual-column format with authoritative navy styling. Recommended for corporate, tech, and engineering positions.' },
    { id: 'modern', name: 'Modern Purple', category: 'Modern', desc: 'Contemporary card layout with vibrant purple accents, timeline indicators, and skill tags.' },
    { id: 'minimal', name: 'Minimalist Clean', category: 'Clean', desc: 'Understated elegance emphasizing ample whitespace and stark typography for effortless scanning.' },
    { id: 'creative', name: 'Creative Portfolio', category: 'Creative', desc: 'Dark sidebar layout with proficiency indicators, bold title typography, and prominent portfolio links.' },
    { id: 'ats_friendly', name: 'ATS-Friendly Standard', category: 'ATS', desc: 'Single-column structure rigorously engineered for automated parsers, HR screening bots, and high ATS scores.' },
    { id: 'fresher', name: 'Fresher / Student', category: 'Academic', desc: 'Education-first hierarchy showcasing capstone projects, academic honors, coursework, and campus leadership.' },
    { id: 'tech_developer', name: 'Technical Developer', category: 'Engineering', desc: 'Monospace code font accents, categorized tech stack matrices, and direct GitHub repo links.' },
    { id: 'executive', name: 'Executive Leadership', category: 'Corporate', desc: 'Strategic C-suite & senior management layout highlighting executive competencies, board milestones, and ROI metrics.' }
  ];

  // Helper to generate a clean, fresh blank resume initialized with user's actual credentials
  const createNewBlankResume = (currentUser: User | null): Resume => {
    const now = new Date().toISOString();
    return {
      id: 0,
      user_id: currentUser?.id || 0,
      template_id: 'professional',
      title: currentUser?.name ? `${currentUser.name}'s Resume` : 'My Professional Resume',
      target_job_role: 'Full Stack Developer',
      personal_info: {
        fullName: currentUser?.name || '',
        email: currentUser?.email || '',
        phone: '',
        location: '',
        linkedin: '',
        github: '',
        portfolio: ''
      },
      career_summary: '',
      career_objective: '',
      education: [],
      skills: {
        programmingLanguages: [],
        frameworks: [],
        databases: [],
        tools: [],
        technicalSkills: [],
        softSkills: []
      },
      projects: [],
      experience: [],
      certifications: [],
      additional_sections: {
        languages: [],
        awards: [],
        extracurricular: []
      },
      completion_percentage: 20,
      created_at: now,
      updated_at: now
    };
  };

  // Helper to load high-quality starter demo data for quick testing
  const loadStarterTemplateData = () => {
    if (!currentResume) return;
    const now = new Date().toISOString();
    const demo: Resume = {
      ...currentResume,
      title: `${user?.name || 'Professional'}'s Software Engineer Resume`,
      target_job_role: 'Full Stack Developer',
      personal_info: {
        fullName: user?.name || 'Professional Candidate',
        email: user?.email || 'candidate@example.com',
        phone: '+1 (555) 234-5678',
        location: 'San Francisco, CA',
        linkedin: 'linkedin.com/in/software-developer',
        github: 'github.com/software-developer',
        portfolio: 'developer.portfolio.dev'
      },
      career_summary: 'Passionate and results-oriented Software Engineer with strong background in designing scalable web architectures, high-throughput REST APIs, and responsive frontends using React, TypeScript, Node.js, and SQL databases. Adept at translating complex product requirements into resilient production solutions.',
      career_objective: 'Aspiring to contribute engineering rigor and agile leadership to an innovative software engineering team, optimizing latency and delivering robust user experiences.',
      education: [
        {
          institution: 'State University of Technology',
          degree: 'Bachelor of Science in Computer Science',
          branch: 'Computer Science & Engineering',
          graduationYear: '2024',
          cgpa: '3.85 / 4.0'
        }
      ],
      skills: {
        programmingLanguages: ['JavaScript', 'TypeScript', 'Python', 'SQL'],
        frameworks: ['React.js', 'Node.js', 'Express.js', 'Tailwind CSS'],
        databases: ['PostgreSQL', 'MySQL', 'Redis'],
        tools: ['Git', 'GitHub', 'Docker', 'VS Code'],
        technicalSkills: ['RESTful APIs', 'Data Structures', 'JWT Authentication', 'Microservices'],
        softSkills: ['Problem Solving', 'Agile Collaboration', 'Technical Documentation']
      },
      projects: [
        {
          title: 'DevPulse - Cloud Sprint & Task Management Platform',
          description: 'Developed full-stack agile workspace featuring real-time sprint boards, drag-and-drop workflow tracking, and automated email notifications.',
          technologies: 'React, TypeScript, Node.js, PostgreSQL, Tailwind CSS',
          link: 'https://github.com/developer/devpulse',
          responsibilities: 'Engineered REST API with JWT authorization and created normalized database schema with indexed queries.'
        },
        {
          title: 'CloudMetrics - Server Telemetry Dashboard',
          description: 'Architected time-series telemetry dashboard processing live metrics for CPU, RAM, and disk I/O with sub-second response times.',
          technologies: 'Node.js, Express, Redis, Chart.js, Docker',
          link: 'https://github.com/developer/cloudmetrics',
          responsibilities: 'Configured Redis pub/sub caching layer and designed real-time interactive charts.'
        }
      ],
      experience: [
        {
          company: 'Acme Software Labs',
          jobTitle: 'Associate Software Developer',
          duration: 'June 2024 - Present',
          responsibilities: 'Engineered customer-facing responsive dashboard panels in React and built microservice endpoints in Express.js. Reduced API query latency by 32% via database index tuning and query caching.',
          achievements: 'Led TypeScript adoption across the core codebase, reducing runtime production exceptions by 40%.'
        }
      ],
      certifications: [
        {
          name: 'AWS Certified Cloud Practitioner',
          issuer: 'Amazon Web Services',
          year: '2024'
        }
      ],
      additional_sections: {
        languages: ['English (Fluent)', 'Spanish (Conversational)'],
        awards: ['First Place - Regional Hackathon 2023'],
        extracurricular: ['Open Source Contributor', 'Tech Club Mentor']
      },
      completion_percentage: 95,
      updated_at: now
    };
    setCurrentResume(demo);
    setSaveMessage({ text: 'Sample starter data loaded into editor! Click Save to keep.', type: 'success' });
    setTimeout(() => setSaveMessage(null), 4000);
  };

  // Fetch all resumes for the authenticated user
  const fetchResumes = async () => {
    try {
      const res = await fetch('/api/resumes', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        const list: Resume[] = data.resumes || [];
        setResumes(list);

        if (list.length > 0) {
          if (currentResumeId) {
            const found = list.find(r => r.id === currentResumeId);
            if (found) {
              setCurrentResume(found);
              setSelectedTemplate(found.template_id || 'professional');
            } else {
              setCurrentResume(list[0]);
              setSelectedTemplate(list[0].template_id || 'professional');
              setCurrentResumeId(list[0].id);
            }
          } else if (!currentResume) {
            setCurrentResume(list[0]);
            setSelectedTemplate(list[0].template_id || 'professional');
            setCurrentResumeId(list[0].id);
          }
        } else if (!currentResume) {
          const fresh = createNewBlankResume(user);
          setCurrentResume(fresh);
          setSelectedTemplate(fresh.template_id || 'professional');
        }
      }
    } catch (err) {
      console.error('Failed to load resumes:', err);
    }
  };

  // Fetch Career Recommendations
  const fetchCareerRecommendations = async (explicitRoleId?: number) => {
    setIsLoadingCareer(true);
    try {
      const res = await fetch('/api/career/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ targetRoleId: explicitRoleId }),
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        setRecommendations(data.recommendations || []);
        setTopRoleExplanation(data.topRoleExplanation || '');
        setSkillProgressList(data.progressList || []);
        if (data.recommendations?.length > 0 && !selectedAnalysisRole) {
          setSelectedAnalysisRole(data.recommendations[0].roleId);
        }
      }
    } catch (err) {
      console.error('Failed to analyze career recommendations:', err);
    } finally {
      setIsLoadingCareer(false);
    }
  };

  // Fetch Roadmap
  const fetchRoadmap = async (roleId?: number) => {
    setIsLoadingRoadmap(true);
    try {
      const targetId = roleId || selectedAnalysisRole || (recommendations[0]?.roleId) || 1;
      const res = await fetch(`/api/career/roadmap?jobRoleId=${targetId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setRoadmap(data.roadmap || []);
        setRoadmapRoleTitle(data.roleTitle || 'Target Career Path');
      }
    } catch (err) {
      console.error('Failed to load roadmap:', err);
    } finally {
      setIsLoadingRoadmap(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, [currentResumeId]);

  useEffect(() => {
    if (userTab === 'recommendations' || userTab === 'skill-gap') {
      fetchCareerRecommendations(selectedAnalysisRole || undefined);
    } else if (userTab === 'roadmap') {
      fetchRoadmap(selectedAnalysisRole || undefined);
    } else if (userTab === 'profile' && user) {
      setProfileForm(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [userTab]);

  // Handle Save Resume - 100% Reliable Persistence
  const handleSaveResume = async () => {
    if (!currentResume) return;
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const payload = {
        ...currentResume,
        template_id: selectedTemplate,
        title: currentResume.title?.trim() || `${currentResume.personal_info?.fullName || 'Professional'}'s Resume`
      };

      let res;
      if (currentResume.id && currentResume.id > 0) {
        res = await fetch(`/api/resumes/${currentResume.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify(payload),
          credentials: 'include'
        });
      } else {
        res = await fetch('/api/resumes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify(payload),
          credentials: 'include'
        });
      }

      if (res.ok) {
        const data = await res.json();
        const saved: Resume = data.resume;
        setCurrentResume(saved);
        setCurrentResumeId(saved.id);
        await fetchResumes();
        setSaveMessage({ text: `Resume successfully saved to database (ID #${saved.id})!`, type: 'success' });
        setTimeout(() => setSaveMessage(null), 4000);
      } else {
        const errData = await res.json().catch(() => ({}));
        setSaveMessage({ text: errData.error || 'Failed to save resume.', type: 'error' });
      }
    } catch (err: any) {
      console.error('Save resume error:', err);
      setSaveMessage({ text: err.message || 'Network error saving resume.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Universal PDF Download Function - works from Builder, Cards, or Dashboard
  const handleDownloadPdf = async (targetResume?: Resume) => {
    const resumeToExport = targetResume || currentResume;
    if (!resumeToExport) return;

    setIsExportingPdf(true);
    setExportingResume(resumeToExport);

    try {
      const templateToUse = targetResume ? (targetResume.template_id || 'professional') : selectedTemplate;
      const result = await generateResumePdf(resumeToExport, templateToUse);
      if (result.success) {
        setSaveMessage({
          text: `PDF downloaded: ${result.filename} (${result.pageCount} page${result.pageCount > 1 ? 's' : ''})`,
          type: 'success'
        });
        setTimeout(() => setSaveMessage(null), 4500);
      } else {
        setSaveMessage({
          text: `PDF generation failed: ${result.error || 'Please try again.'}`,
          type: 'error'
        });
      }
    } catch (err: any) {
      console.error('PDF generation error:', err);
      setSaveMessage({
        text: `Error generating PDF: ${err.message || 'Unknown error'}`,
        type: 'error'
      });
    } finally {
      setIsExportingPdf(false);
      setExportingResume(null);
    }
  };

  // Duplicate Resume Function
  const handleDuplicateResume = async (resumeId: number) => {
    try {
      const res = await fetch(`/api/resumes/${resumeId}/duplicate`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        await fetchResumes();
        setSaveMessage({ text: `Resume duplicated as "${data.resume.title}"!`, type: 'success' });
        setTimeout(() => setSaveMessage(null), 4000);
      } else {
        setSaveMessage({ text: 'Failed to duplicate resume.', type: 'error' });
      }
    } catch (err) {
      console.error('Duplicate error:', err);
      setSaveMessage({ text: 'Error duplicating resume.', type: 'error' });
    }
  };

  // Delete Resume Function
  const handleDeleteResume = async (resumeId: number) => {
    try {
      const res = await fetch(`/api/resumes/${resumeId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include'
      });
      if (res.ok) {
        if (currentResume?.id === resumeId) {
          const fresh = createNewBlankResume(user);
          setCurrentResume(fresh);
          setCurrentResumeId(null);
        }
        await fetchResumes();
        setSaveMessage({ text: 'Resume deleted successfully.', type: 'success' });
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        const err = await res.json().catch(() => ({}));
        setSaveMessage({ text: err.error || 'Failed to delete resume.', type: 'error' });
      }
    } catch (err: any) {
      console.error('Delete error:', err);
      setSaveMessage({ text: err.message || 'Error deleting resume.', type: 'error' });
    }
  };

  // AI Helper: Generate Professional Summary with Review Modal
  const handleAiGenerateSummary = async (tone: string = 'impact') => {
    if (!currentResume) return;
    setIsAiLoading(true);
    try {
      const allSkills = [
        ...(currentResume.skills?.programmingLanguages || []),
        ...(currentResume.skills?.frameworks || []),
        ...(currentResume.skills?.databases || []),
        ...(currentResume.skills?.technicalSkills || [])
      ];

      const cleanTone = tone === 'impact' ? 'impactful' : tone;
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          type: 'summary',
          fullName: currentResume.personal_info?.fullName || user?.name,
          targetJobRole: currentResume.target_job_role || 'Software Engineer',
          skills: allSkills,
          education: currentResume.education?.[0]?.degree,
          existingSummary: currentResume.career_summary,
          tone: cleanTone
        }),
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        if (data.result) {
          setAiReviewModal({
            isOpen: true,
            title: 'Review AI Professional Summary',
            fieldLabel: 'Professional Summary',
            originalText: currentResume.career_summary || '(No existing summary provided)',
            suggestedText: data.result,
            onApply: (approvedText: string) => {
              setCurrentResume(prev => prev ? ({ ...prev, career_summary: approvedText }) : null);
              setAiReviewModal(prev => ({ ...prev, isOpen: false }));
              setSaveMessage({ text: 'Summary updated! Remember to click Save to persist changes.', type: 'success' });
              setTimeout(() => setSaveMessage(null), 3500);
            }
          });
        } else {
          setSaveMessage({ text: data.error || 'No summary returned by AI service.', type: 'error' });
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setSaveMessage({ text: errData.error || 'Failed to generate summary.', type: 'error' });
      }
    } catch (err: any) {
      console.error('AI summary error:', err);
      setSaveMessage({ text: err.message || 'Network error generating summary.', type: 'error' });
    } finally {
      setIsAiLoading(false);
    }
  };

  // AI Helper: Generate Career Objective with Review Modal
  const handleAiGenerateObjective = async () => {
    if (!currentResume) return;
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          type: 'objective',
          targetJobRole: currentResume.target_job_role || 'Software Developer',
          skills: currentResume.skills?.programmingLanguages
        }),
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        if (data.result) {
          setAiReviewModal({
            isOpen: true,
            title: 'Review AI Career Objective',
            fieldLabel: 'Career Objective',
            originalText: currentResume.career_objective || '(No existing objective provided)',
            suggestedText: data.result,
            onApply: (approvedText: string) => {
              setCurrentResume(prev => prev ? ({ ...prev, career_objective: approvedText }) : null);
              setAiReviewModal(prev => ({ ...prev, isOpen: false }));
              setSaveMessage({ text: 'Objective updated! Remember to click Save to persist changes.', type: 'success' });
              setTimeout(() => setSaveMessage(null), 3500);
            }
          });
        } else {
          setSaveMessage({ text: data.error || 'No objective returned by AI service.', type: 'error' });
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setSaveMessage({ text: errData.error || 'Failed to generate objective.', type: 'error' });
      }
    } catch (err: any) {
      console.error('AI objective error:', err);
      setSaveMessage({ text: err.message || 'Network error generating objective.', type: 'error' });
    } finally {
      setIsAiLoading(false);
    }
  };

  // AI Helper: Improve Project Description with Review Modal
  const handleAiImproveProject = async (index: number) => {
    if (!currentResume || !currentResume.projects?.[index]) return;
    setIsAiLoading(true);
    try {
      const proj = currentResume.projects[index];
      const res = await fetch('/api/ai/improve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          roleOrProject: proj.title || 'Technical Project',
          rawText: proj.description,
          technologies: proj.technologies
        }),
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        if (data.result) {
          setAiReviewModal({
            isOpen: true,
            title: `Review AI Enhancement for Project: ${proj.title}`,
            fieldLabel: 'Project Description',
            originalText: proj.description,
            suggestedText: data.result,
            onApply: (approvedText: string) => {
              const updatedProjects = [...(currentResume.projects || [])];
              updatedProjects[index] = { ...proj, description: approvedText };
              setCurrentResume(prev => prev ? ({ ...prev, projects: updatedProjects }) : null);
              setAiReviewModal(prev => ({ ...prev, isOpen: false }));
              setSaveMessage({ text: 'Project description updated! Click Save to persist.', type: 'success' });
              setTimeout(() => setSaveMessage(null), 3500);
            }
          });
        } else {
          setSaveMessage({ text: data.error || 'Failed to improve project description.', type: 'error' });
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setSaveMessage({ text: errData.error || 'Failed to improve project.', type: 'error' });
      }
    } catch (err: any) {
      console.error('AI improve project error:', err);
      setSaveMessage({ text: err.message || 'Network error improving project.', type: 'error' });
    } finally {
      setIsAiLoading(false);
    }
  };

  // AI Helper: Improve Experience Responsibilities with Review Modal
  const handleAiImproveExperience = async (index: number) => {
    if (!currentResume || !currentResume.experience?.[index]) return;
    setIsAiLoading(true);
    try {
      const exp = currentResume.experience[index];
      const res = await fetch('/api/ai/improve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          roleOrProject: `${exp.jobTitle} at ${exp.company}`,
          rawText: exp.responsibilities
        }),
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        if (data.result) {
          setAiReviewModal({
            isOpen: true,
            title: `Review AI Enhancement for Experience: ${exp.jobTitle}`,
            fieldLabel: 'Experience Responsibilities',
            originalText: exp.responsibilities,
            suggestedText: data.result,
            onApply: (approvedText: string) => {
              const updatedExp = [...(currentResume.experience || [])];
              updatedExp[index] = { ...exp, responsibilities: approvedText };
              setCurrentResume(prev => prev ? ({ ...prev, experience: updatedExp }) : null);
              setAiReviewModal(prev => ({ ...prev, isOpen: false }));
              setSaveMessage({ text: 'Experience updated! Click Save to persist.', type: 'success' });
              setTimeout(() => setSaveMessage(null), 3500);
            }
          });
        } else {
          setSaveMessage({ text: data.error || 'Failed to improve experience description.', type: 'error' });
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setSaveMessage({ text: errData.error || 'Failed to improve experience.', type: 'error' });
      }
    } catch (err: any) {
      console.error('AI improve experience error:', err);
      setSaveMessage({ text: err.message || 'Network error improving experience.', type: 'error' });
    } finally {
      setIsAiLoading(false);
    }
  };

  // Skill progress updater
  const handleUpdateSkillProgress = async (skillName: string, status: 'Not Started' | 'Learning' | 'Completed', prof: 'None' | 'Beginner' | 'Intermediate' | 'Advanced') => {
    if (!selectedAnalysisRole) return;
    try {
      const res = await fetch('/api/career/skill-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          jobRoleId: selectedAnalysisRole,
          skillName,
          status,
          currentProficiency: prof
        }),
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setSkillProgressList(prev => {
          const existingIndex = prev.findIndex(p => p.skill_name.toLowerCase() === skillName.toLowerCase() && p.job_role_id === selectedAnalysisRole);
          if (existingIndex >= 0) {
            const next = [...prev];
            next[existingIndex] = data.progress;
            return next;
          }
          return [...prev, data.progress];
        });
      }
    } catch (err) {
      console.error('Failed to update skill progress:', err);
    }
  };

  // Profile Update Handler
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMessage(null);

    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmNewPassword) {
      setProfileMessage({ text: 'New passwords do not match.', type: 'error' });
      setIsUpdatingProfile(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name: profileForm.name,
          email: profileForm.email,
          currentPassword: profileForm.currentPassword || undefined,
          newPassword: profileForm.newPassword || undefined
        }),
        credentials: 'include'
      });

      const data = await res.json();
      if (res.ok) {
        setProfileMessage({ text: 'Profile updated successfully!', type: 'success' });
        await refreshUser();
        setProfileForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmNewPassword: '' }));
      } else {
        setProfileMessage({ text: data.error || 'Failed to update profile.', type: 'error' });
      }
    } catch (err: any) {
      console.error('Profile update error:', err);
      setProfileMessage({ text: err.message || 'Error updating profile.', type: 'error' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-100">
      {/* Toast Notification Banner */}
      {saveMessage && (
        <div className={`fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-bold transition-all animate-in slide-in-from-top-4 ${
          saveMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-red-50 text-red-800 border-red-300'
        }`}>
          {saveMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
          <span>{saveMessage.text}</span>
          <button onClick={() => setSaveMessage(null)} className="ml-2 hover:opacity-75 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* AI REVIEW & APPLY SIDE-BY-SIDE MODAL */}
      {aiReviewModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{aiReviewModal.title}</h3>
                  <p className="text-[11px] text-slate-500">Compare original draft with Gemini ATS-optimized recommendation</p>
                </div>
              </div>
              <button
                onClick={() => setAiReviewModal(prev => ({ ...prev, isOpen: false }))}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Original */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Original Content</span>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 min-h-[140px] max-h-[220px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {aiReviewModal.originalText || '(Empty)'}
                </div>
              </div>

              {/* Right Column: AI Suggestion */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">AI Improved Suggestion</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded">ATS Optimized</span>
                </div>
                <textarea
                  value={aiReviewModal.suggestedText}
                  onChange={(e) => setAiReviewModal(prev => ({ ...prev, suggestedText: e.target.value }))}
                  className="w-full p-3.5 bg-purple-50/50 border border-purple-300 rounded-xl text-xs text-slate-900 min-h-[140px] max-h-[220px] overflow-y-auto outline-hidden focus:ring-2 focus:ring-purple-600 leading-relaxed resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end items-center gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAiReviewModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={() => aiReviewModal.onApply(aiReviewModal.suggestedText)}
                className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Apply to Resume</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED OFFSCREEN PDF EXPORT RENDER ELEMENT */}
      <div style={{ position: 'fixed', left: '-9999px', top: 0, width: '210mm' }}>
        <div id="dedicated-pdf-export-element">
          {exportingResume && (
            <ResumeRenderer
              resume={exportingResume}
              templateId={exportingResume.template_id || 'professional'}
              isPrintMode={true}
              elementId="dedicated-pdf-export-inner"
            />
          )}
        </div>
      </div>

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-4 shrink-0 border-r border-slate-800 hidden md:flex">
        <div className="space-y-6">
          {/* User Profile Mini Card in Sidebar */}
          <button
            onClick={() => setUserTab('profile')}
            className="w-full p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 flex items-center gap-3 transition-colors text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <div className="font-bold text-xs text-white truncate">{user?.name}</div>
              <div className="text-[11px] text-purple-300 truncate">{user?.email}</div>
            </div>
          </button>

          {/* Primary Navigation Menu */}
          <nav className="space-y-1 text-xs font-semibold">
            <button
              onClick={() => setUserTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                userTab === 'dashboard' ? 'bg-purple-600 text-white shadow-sm font-bold' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => {
                const fresh = createNewBlankResume(user);
                setCurrentResume(fresh);
                setCurrentResumeId(null);
                setUserTab('builder');
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                userTab === 'builder' ? 'bg-purple-600 text-white shadow-sm font-bold' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FilePlus className="w-4 h-4 text-purple-400" />
              <span>Create / Edit Resume</span>
            </button>

            <button
              onClick={() => setUserTab('resumes')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                userTab === 'resumes' ? 'bg-purple-600 text-white shadow-sm font-bold' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Files className="w-4 h-4" />
              <span>My Resumes ({resumes.length})</span>
            </button>

            <button
              onClick={() => setUserTab('templates')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                userTab === 'templates' ? 'bg-purple-600 text-white shadow-sm font-bold' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Resume Templates (8)</span>
            </button>

            <button
              onClick={() => setUserTab('ai-generator')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                userTab === 'ai-generator' ? 'bg-purple-600 text-white shadow-sm font-bold' : 'hover:bg-slate-800 hover:text-white text-purple-300'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>AI Resume Polish</span>
            </button>

            <div className="pt-3 pb-1 border-t border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-3">Career Intel</span>
            </div>

            <button
              onClick={() => setUserTab('recommendations')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                userTab === 'recommendations' ? 'bg-purple-600 text-white shadow-sm font-bold' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>Job Recommendations</span>
            </button>

            <button
              onClick={() => setUserTab('skill-gap')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                userTab === 'skill-gap' ? 'bg-purple-600 text-white shadow-sm font-bold' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BarChart2 className="w-4 h-4 text-amber-400" />
              <span>Skill Gap Analysis</span>
            </button>

            <button
              onClick={() => setUserTab('roadmap')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                userTab === 'roadmap' ? 'bg-purple-600 text-white shadow-sm font-bold' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Route className="w-4 h-4 text-blue-400" />
              <span>Learning Roadmap</span>
            </button>

            <div className="pt-3 pb-1 border-t border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-3">Account</span>
            </div>

            <button
              onClick={() => setUserTab('profile')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                userTab === 'profile' ? 'bg-purple-600 text-white shadow-sm font-bold' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <UserIcon className="w-4 h-4 text-slate-400" />
              <span>My Profile & Settings</span>
            </button>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <button
            onClick={() => setActiveView('landing')}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <span>Public Website</span>
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {/* TAB 1: USER DASHBOARD */}
        {userTab === 'dashboard' && (
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  Personal Career Intelligence Center
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Welcome back, {user?.name}!
                </h1>
                <p className="text-xs sm:text-sm text-purple-200 max-w-xl">
                  Build ATS-optimized resumes with Gemini AI, analyze live job requirement matches from our database, and follow personalized learning roadmaps.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    const fresh = createNewBlankResume(user);
                    setCurrentResume(fresh);
                    setCurrentResumeId(null);
                    setUserTab('builder');
                  }}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Resume</span>
                </button>
                <button
                  onClick={() => setUserTab('recommendations')}
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-all cursor-pointer"
                >
                  View Career Matches
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <div className="text-xs font-semibold text-slate-500">Total Saved Resumes</div>
                <div className="text-2xl font-black text-slate-900">{resumes.length}</div>
                <div className="text-[11px] text-purple-600 font-medium">Ready for job export</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <div className="text-xs font-semibold text-slate-500">Active Resume Score</div>
                <div className="text-2xl font-black text-emerald-600">
                  {currentResume?.completion_percentage || 85}%
                </div>
                <div className="text-[11px] text-emerald-700 font-medium">ATS Profile Completeness</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <div className="text-xs font-semibold text-slate-500">Available Templates</div>
                <div className="text-2xl font-black text-indigo-600">8</div>
                <div className="text-[11px] text-indigo-700 font-medium">1-Click Switchable</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <div className="text-xs font-semibold text-slate-500">Skills Tracked</div>
                <div className="text-2xl font-black text-purple-600">
                  {skillProgressList.filter(s => s.status === 'Completed').length} / {skillProgressList.length || 12}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">Curriculum Milestones</div>
              </div>
            </div>

            {/* Recently Edited Resumes Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Your Resumes</h2>
                  <p className="text-xs text-slate-500">Edit, duplicate, download PDF, or switch styles instantly</p>
                </div>
                <button
                  onClick={() => {
                    const fresh = createNewBlankResume(user);
                    setCurrentResume(fresh);
                    setCurrentResumeId(null);
                    setUserTab('builder');
                  }}
                  className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Resume</span>
                </button>
              </div>

              {resumes.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-3">
                  <Files className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-500">No saved resumes found yet. Click below to craft your first resume!</p>
                  <button
                    onClick={() => {
                      const fresh = createNewBlankResume(user);
                      setCurrentResume(fresh);
                      setCurrentResumeId(null);
                      setUserTab('builder');
                    }}
                    className="px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-lg cursor-pointer"
                  >
                    Start Resume Builder
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resumes.map(r => (
                    <div
                      key={r.id}
                      className="p-4 bg-slate-50 hover:bg-purple-50/40 rounded-xl border border-slate-200 hover:border-purple-300 transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-purple-100 text-purple-800 rounded">
                            {r.template_id || 'professional'}
                          </span>
                          <span className="text-xs font-semibold text-emerald-600">
                            {r.completion_percentage || 85}% complete
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-slate-900 truncate">{r.title}</h3>
                        <p className="text-xs text-slate-500 truncate">{r.target_job_role || 'General Role'}</p>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80">
                        <button
                          onClick={() => {
                            setCurrentResume(r);
                            setSelectedTemplate(r.template_id || 'professional');
                            setCurrentResumeId(r.id);
                            setUserTab('builder');
                          }}
                          className="flex-1 py-1.5 bg-slate-900 hover:bg-purple-600 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDuplicateResume(r.id)}
                          title="Duplicate Resume"
                          className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg transition-colors cursor-pointer"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDownloadPdf(r)}
                          disabled={isExportingPdf}
                          title="Download PDF"
                          className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg transition-colors cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteResume(r.id)}
                          title="Delete Resume"
                          className="p-1.5 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-300 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Career recommendations quick teaser */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1">
                <h3 className="font-bold text-base text-slate-900">Career Match & Skill Gap Analysis</h3>
                <p className="text-xs text-slate-600">
                  Compare your resume's skills against current live database specifications for top industry software roles.
                </p>
              </div>
              <button
                onClick={() => setUserTab('recommendations')}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-xs hover:opacity-95 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <span>Launch Analysis</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: RESUME BUILDER & LIVE PREVIEW */}
        {userTab === 'builder' && currentResume && (
          <div className="max-w-7xl mx-auto space-y-4 animate-in fade-in duration-200">
            {/* Top Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={currentResume.title}
                  onChange={(e) => setCurrentResume({ ...currentResume, title: e.target.value })}
                  placeholder="Resume Title..."
                  className="font-bold text-base text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-purple-600 outline-hidden px-1 py-0.5"
                />
                <span className="text-xs px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-200">
                  {currentResume.completion_percentage || 85}% complete
                </span>
                {currentResume.id > 0 ? (
                  <span className="text-[10px] text-slate-400 font-mono">ID #{currentResume.id}</span>
                ) : (
                  <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-bold">Unsaved Draft</span>
                )}
              </div>

              {/* Toolbar Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={loadStarterTemplateData}
                  title="Fills demo info for fast testing"
                  className="px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors cursor-pointer"
                >
                  Load Demo Data
                </button>

                <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2">
                  <label className="text-xs font-semibold text-slate-600 hidden sm:block">Template:</label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => {
                      setSelectedTemplate(e.target.value);
                      setCurrentResume({ ...currentResume, template_id: e.target.value });
                    }}
                    className="text-xs font-semibold border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-slate-800 outline-hidden focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  >
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleSaveResume}
                  disabled={isSaving}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save</span>
                </button>

                <button
                  onClick={() => handleDownloadPdf()}
                  disabled={isExportingPdf}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isExportingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  <span>Download PDF</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg transition-colors cursor-pointer"
                  title="Print Resume"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Split Screen Layout: Left Form Builder, Right Live Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT COLUMN: MULTI-SECTION FORM EDITOR */}
              <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                {/* Section Navigation Tabs */}
                <div className="flex border-b border-slate-200 overflow-x-auto bg-slate-50/70 p-1.5 gap-1 text-xs font-semibold">
                  {[
                    { id: 'personal', label: 'Personal Info' },
                    { id: 'career', label: 'Summary & Goal' },
                    { id: 'education', label: 'Education' },
                    { id: 'skills', label: 'Skills' },
                    { id: 'projects', label: 'Projects' },
                    { id: 'experience', label: 'Experience' },
                    { id: 'certifications', label: 'Certifications' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setBuilderTab(tab.id as any)}
                      className={`px-3 py-2 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                        builderTab === tab.id
                          ? 'bg-white text-purple-700 shadow-xs border border-slate-200 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="p-6 space-y-5">
                  {/* SECTION 1: PERSONAL INFORMATION */}
                  {builderTab === 'personal' && (
                    <div className="space-y-4">
                      <h3 className="font-bold text-sm text-slate-900">Personal & Contact Details</h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                          <input
                            type="text"
                            value={currentResume.personal_info?.fullName || ''}
                            onChange={(e) => setCurrentResume({
                              ...currentResume,
                              personal_info: { ...currentResume.personal_info, fullName: e.target.value }
                            })}
                            placeholder="John Doe"
                            className="w-full p-2.5 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Target Job Role</label>
                          <input
                            type="text"
                            value={currentResume.target_job_role || ''}
                            onChange={(e) => setCurrentResume({ ...currentResume, target_job_role: e.target.value })}
                            placeholder="e.g. Full Stack Developer"
                            className="w-full p-2.5 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                          <input
                            type="email"
                            value={currentResume.personal_info?.email || ''}
                            onChange={(e) => setCurrentResume({
                              ...currentResume,
                              personal_info: { ...currentResume.personal_info, email: e.target.value }
                            })}
                            placeholder="john@example.com"
                            className="w-full p-2.5 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                          <input
                            type="text"
                            value={currentResume.personal_info?.phone || ''}
                            onChange={(e) => setCurrentResume({
                              ...currentResume,
                              personal_info: { ...currentResume.personal_info, phone: e.target.value }
                            })}
                            placeholder="+1 (555) 000-0000"
                            className="w-full p-2.5 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block font-semibold text-slate-700 mb-1">City, State / Location</label>
                          <input
                            type="text"
                            value={currentResume.personal_info?.location || ''}
                            onChange={(e) => setCurrentResume({
                              ...currentResume,
                              personal_info: { ...currentResume.personal_info, location: e.target.value }
                            })}
                            placeholder="San Francisco, CA"
                            className="w-full p-2.5 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">LinkedIn Profile</label>
                          <input
                            type="text"
                            value={currentResume.personal_info?.linkedin || ''}
                            onChange={(e) => setCurrentResume({
                              ...currentResume,
                              personal_info: { ...currentResume.personal_info, linkedin: e.target.value }
                            })}
                            placeholder="linkedin.com/in/username"
                            className="w-full p-2.5 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">GitHub / Portfolio Link</label>
                          <input
                            type="text"
                            value={currentResume.personal_info?.github || ''}
                            onChange={(e) => setCurrentResume({
                              ...currentResume,
                              personal_info: { ...currentResume.personal_info, github: e.target.value }
                            })}
                            placeholder="github.com/username"
                            className="w-full p-2.5 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SECTION 2: CAREER SUMMARY & OBJECTIVE */}
                  {builderTab === 'career' && (
                    <div className="space-y-5">
                      {/* Professional Summary */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="font-bold text-xs text-slate-900">Professional Summary</label>
                          <button
                            type="button"
                            onClick={() => handleAiGenerateSummary('impact')}
                            disabled={isAiLoading}
                            className="text-xs font-bold text-purple-700 hover:text-purple-900 inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-purple-600" />}
                            <span>AI Generate & Polish</span>
                          </button>
                        </div>
                        <textarea
                          rows={4}
                          value={currentResume.career_summary || ''}
                          onChange={(e) => setCurrentResume({ ...currentResume, career_summary: e.target.value })}
                          placeholder="Experienced software engineer with expertise in..."
                          className="w-full p-3 border border-slate-300 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-purple-500 leading-relaxed"
                        />
                        <p className="text-[11px] text-slate-400">
                          Tip: Click "AI Generate & Polish" to review suggestions before applying.
                        </p>
                      </div>

                      {/* Career Objective */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="font-bold text-xs text-slate-900">Career Objective (Freshers / Career Switch)</label>
                          <button
                            type="button"
                            onClick={handleAiGenerateObjective}
                            disabled={isAiLoading}
                            className="text-xs font-bold text-purple-700 hover:text-purple-900 inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-purple-600" />}
                            <span>AI Generate Objective</span>
                          </button>
                        </div>
                        <textarea
                          rows={3}
                          value={currentResume.career_objective || ''}
                          onChange={(e) => setCurrentResume({ ...currentResume, career_objective: e.target.value })}
                          placeholder="To obtain a challenging position as..."
                          className="w-full p-3 border border-slate-300 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-purple-500 leading-relaxed"
                        />
                      </div>
                    </div>
                  )}

                  {/* SECTION 3: EDUCATION */}
                  {builderTab === 'education' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-sm text-slate-900">Education Details</h3>
                        <button
                          type="button"
                          onClick={() => {
                            const newEdu = { institution: '', degree: 'Bachelor of Science', branch: 'Computer Science', graduationYear: '2024', cgpa: '' };
                            setCurrentResume({
                              ...currentResume,
                              education: [...(currentResume.education || []), newEdu]
                            });
                          }}
                          className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-md text-xs font-bold hover:bg-purple-100 flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Education</span>
                        </button>
                      </div>

                      {currentResume.education?.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No education entries added yet.</p>
                      ) : (
                        currentResume.education?.map((edu, idx) => (
                          <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = currentResume.education?.filter((_, i) => i !== idx);
                                setCurrentResume({ ...currentResume, education: updated });
                              }}
                              className="absolute top-3 right-3 text-slate-400 hover:text-red-500 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              <div className="sm:col-span-2">
                                <label className="block font-semibold text-slate-700 mb-1">Institution / University</label>
                                <input
                                  type="text"
                                  value={edu.institution}
                                  onChange={(e) => {
                                    const updated = [...(currentResume.education || [])];
                                    updated[idx].institution = e.target.value;
                                    setCurrentResume({ ...currentResume, education: updated });
                                  }}
                                  placeholder="e.g. UC Berkeley"
                                  className="w-full p-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                                />
                              </div>

                              <div>
                                <label className="block font-semibold text-slate-700 mb-1">Degree</label>
                                <input
                                  type="text"
                                  value={edu.degree}
                                  onChange={(e) => {
                                    const updated = [...(currentResume.education || [])];
                                    updated[idx].degree = e.target.value;
                                    setCurrentResume({ ...currentResume, education: updated });
                                  }}
                                  placeholder="B.S. in Computer Science"
                                  className="w-full p-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                                />
                              </div>

                              <div>
                                <label className="block font-semibold text-slate-700 mb-1">Graduation Year</label>
                                <input
                                  type="text"
                                  value={edu.graduationYear}
                                  onChange={(e) => {
                                    const updated = [...(currentResume.education || [])];
                                    updated[idx].graduationYear = e.target.value;
                                    setCurrentResume({ ...currentResume, education: updated });
                                  }}
                                  placeholder="2024"
                                  className="w-full p-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                                />
                              </div>

                              <div>
                                <label className="block font-semibold text-slate-700 mb-1">Branch / Major</label>
                                <input
                                  type="text"
                                  value={edu.branch}
                                  onChange={(e) => {
                                    const updated = [...(currentResume.education || [])];
                                    updated[idx].branch = e.target.value;
                                    setCurrentResume({ ...currentResume, education: updated });
                                  }}
                                  placeholder="Software Engineering"
                                  className="w-full p-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                                />
                              </div>

                              <div>
                                <label className="block font-semibold text-slate-700 mb-1">GPA / Percentage</label>
                                <input
                                  type="text"
                                  value={edu.cgpa}
                                  onChange={(e) => {
                                    const updated = [...(currentResume.education || [])];
                                    updated[idx].cgpa = e.target.value;
                                    setCurrentResume({ ...currentResume, education: updated });
                                  }}
                                  placeholder="3.8 / 4.0"
                                  className="w-full p-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                                />
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* SECTION 4: SKILLS */}
                  {builderTab === 'skills' && (
                    <div className="space-y-4">
                      <h3 className="font-bold text-sm text-slate-900">Categorized Skills</h3>
                      <p className="text-xs text-slate-500">
                        Separate skills by commas. Skills automatically synchronize with our MySQL job recommendation engine.
                      </p>

                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Programming Languages</label>
                          <input
                            type="text"
                            value={(currentResume.skills?.programmingLanguages || []).join(', ')}
                            onChange={(e) => {
                              const items = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                              setCurrentResume({
                                ...currentResume,
                                skills: { ...currentResume.skills, programmingLanguages: items }
                              });
                            }}
                            placeholder="JavaScript, TypeScript, Python, Java, SQL"
                            className="w-full p-2.5 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Frameworks & Libraries</label>
                          <input
                            type="text"
                            value={(currentResume.skills?.frameworks || []).join(', ')}
                            onChange={(e) => {
                              const items = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                              setCurrentResume({
                                ...currentResume,
                                skills: { ...currentResume.skills, frameworks: items }
                              });
                            }}
                            placeholder="React.js, Node.js, Express.js, Tailwind CSS, Spring Boot"
                            className="w-full p-2.5 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Databases & Storage</label>
                          <input
                            type="text"
                            value={(currentResume.skills?.databases || []).join(', ')}
                            onChange={(e) => {
                              const items = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                              setCurrentResume({
                                ...currentResume,
                                skills: { ...currentResume.skills, databases: items }
                              });
                            }}
                            placeholder="PostgreSQL, MySQL, MongoDB, Redis"
                            className="w-full p-2.5 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Tools & DevOps</label>
                          <input
                            type="text"
                            value={(currentResume.skills?.tools || []).join(', ')}
                            onChange={(e) => {
                              const items = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                              setCurrentResume({
                                ...currentResume,
                                skills: { ...currentResume.skills, tools: items }
                              });
                            }}
                            placeholder="Git, Docker, Kubernetes, AWS, Linux"
                            className="w-full p-2.5 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Core Concepts & Technical Skills</label>
                          <input
                            type="text"
                            value={(currentResume.skills?.technicalSkills || []).join(', ')}
                            onChange={(e) => {
                              const items = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                              setCurrentResume({
                                ...currentResume,
                                skills: { ...currentResume.skills, technicalSkills: items }
                              });
                            }}
                            placeholder="RESTful APIs, Microservices, Data Structures, WebSockets"
                            className="w-full p-2.5 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SECTION 5: PROJECTS */}
                  {builderTab === 'projects' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-sm text-slate-900">Featured Technical Projects</h3>
                        <button
                          type="button"
                          onClick={() => {
                            const newProj = {
                              title: 'New Technical Project',
                              description: 'Architected and developed full-stack solution utilizing modern component architecture.',
                              technologies: 'React, Node.js, SQL',
                              link: 'https://github.com/developer/project',
                              responsibilities: 'Implemented core REST API and user interface.'
                            };
                            setCurrentResume({
                              ...currentResume,
                              projects: [...(currentResume.projects || []), newProj]
                            });
                          }}
                          className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-md text-xs font-bold hover:bg-purple-100 flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Project</span>
                        </button>
                      </div>

                      {currentResume.projects?.map((proj, idx) => (
                        <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = currentResume.projects?.filter((_, i) => i !== idx);
                              setCurrentResume({ ...currentResume, projects: updated });
                            }}
                            className="absolute top-3 right-3 text-slate-400 hover:text-red-500 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <label className="block font-semibold text-slate-700 mb-1">Project Title</label>
                              <input
                                type="text"
                                value={proj.title}
                                onChange={(e) => {
                                  const updated = [...(currentResume.projects || [])];
                                  updated[idx].title = e.target.value;
                                  setCurrentResume({ ...currentResume, projects: updated });
                                }}
                                className="w-full p-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold text-slate-700 mb-1">Technologies Used</label>
                              <input
                                type="text"
                                value={proj.technologies}
                                onChange={(e) => {
                                  const updated = [...(currentResume.projects || [])];
                                  updated[idx].technologies = e.target.value;
                                  setCurrentResume({ ...currentResume, projects: updated });
                                }}
                                className="w-full p-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                          </div>

                          <div className="text-xs">
                            <label className="block font-semibold text-slate-700 mb-1">Project URL / GitHub Link</label>
                            <input
                              type="text"
                              value={proj.link || ''}
                              onChange={(e) => {
                                const updated = [...(currentResume.projects || [])];
                                updated[idx].link = e.target.value;
                                setCurrentResume({ ...currentResume, projects: updated });
                              }}
                              className="w-full p-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                            />
                          </div>

                          <div className="text-xs">
                            <div className="flex justify-between items-center mb-1">
                              <label className="font-semibold text-slate-700">Project Description</label>
                              <button
                                type="button"
                                onClick={() => handleAiImproveProject(idx)}
                                disabled={isAiLoading}
                                className="text-[11px] font-bold text-purple-700 hover:text-purple-900 inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Sparkles className="w-3 h-3 text-purple-600" />
                                <span>AI Improve</span>
                              </button>
                            </div>
                            <textarea
                              rows={3}
                              value={proj.description}
                              onChange={(e) => {
                                const updated = [...(currentResume.projects || [])];
                                updated[idx].description = e.target.value;
                                setCurrentResume({ ...currentResume, projects: updated });
                              }}
                              className="w-full p-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* SECTION 6: WORK EXPERIENCE */}
                  {builderTab === 'experience' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-sm text-slate-900">Work Experience</h3>
                        <button
                          type="button"
                          onClick={() => {
                            const newExp = {
                              company: 'Company Name',
                              jobTitle: 'Software Engineer',
                              duration: '2023 - Present',
                              responsibilities: 'Developed core application features and collaborated across agile sprints.',
                              achievements: 'Enhanced query throughput and reliability.'
                            };
                            setCurrentResume({
                              ...currentResume,
                              experience: [...(currentResume.experience || []), newExp]
                            });
                          }}
                          className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-md text-xs font-bold hover:bg-purple-100 flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Experience</span>
                        </button>
                      </div>

                      {currentResume.experience?.map((exp, idx) => (
                        <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = currentResume.experience?.filter((_, i) => i !== idx);
                              setCurrentResume({ ...currentResume, experience: updated });
                            }}
                            className="absolute top-3 right-3 text-slate-400 hover:text-red-500 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div>
                              <label className="block font-semibold text-slate-700 mb-1">Company</label>
                              <input
                                type="text"
                                value={exp.company}
                                onChange={(e) => {
                                  const updated = [...(currentResume.experience || [])];
                                  updated[idx].company = e.target.value;
                                  setCurrentResume({ ...currentResume, experience: updated });
                                }}
                                className="w-full p-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold text-slate-700 mb-1">Job Title</label>
                              <input
                                type="text"
                                value={exp.jobTitle}
                                onChange={(e) => {
                                  const updated = [...(currentResume.experience || [])];
                                  updated[idx].jobTitle = e.target.value;
                                  setCurrentResume({ ...currentResume, experience: updated });
                                }}
                                className="w-full p-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold text-slate-700 mb-1">Duration</label>
                              <input
                                type="text"
                                value={exp.duration}
                                onChange={(e) => {
                                  const updated = [...(currentResume.experience || [])];
                                  updated[idx].duration = e.target.value;
                                  setCurrentResume({ ...currentResume, experience: updated });
                                }}
                                className="w-full p-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                          </div>

                          <div className="text-xs">
                            <div className="flex justify-between items-center mb-1">
                              <label className="font-semibold text-slate-700">Responsibilities</label>
                              <button
                                type="button"
                                onClick={() => handleAiImproveExperience(idx)}
                                disabled={isAiLoading}
                                className="text-[11px] font-bold text-purple-700 hover:text-purple-900 inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Sparkles className="w-3 h-3 text-purple-600" />
                                <span>AI Improve</span>
                              </button>
                            </div>
                            <textarea
                              rows={3}
                              value={exp.responsibilities}
                              onChange={(e) => {
                                const updated = [...(currentResume.experience || [])];
                                updated[idx].responsibilities = e.target.value;
                                setCurrentResume({ ...currentResume, experience: updated });
                              }}
                              className="w-full p-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                            />
                          </div>

                          <div className="text-xs">
                            <label className="block font-semibold text-slate-700 mb-1">Key Achievements & Metrics</label>
                            <input
                              type="text"
                              value={exp.achievements || ''}
                              onChange={(e) => {
                                const updated = [...(currentResume.experience || [])];
                                updated[idx].achievements = e.target.value;
                                setCurrentResume({ ...currentResume, experience: updated });
                              }}
                              placeholder="e.g. Reduced API latency by 30% through caching"
                              className="w-full p-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* SECTION 7: CERTIFICATIONS */}
                  {builderTab === 'certifications' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-sm text-slate-900">Certifications & Credentials</h3>
                        <button
                          type="button"
                          onClick={() => {
                            const newCert = { name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', year: '2024' };
                            setCurrentResume({
                              ...currentResume,
                              certifications: [...(currentResume.certifications || []), newCert]
                            });
                          }}
                          className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-md text-xs font-bold hover:bg-purple-100 flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Certification</span>
                        </button>
                      </div>

                      {currentResume.certifications?.map((c, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs relative">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = currentResume.certifications?.filter((_, i) => i !== idx);
                              setCurrentResume({ ...currentResume, certifications: updated });
                            }}
                            className="absolute top-2 right-2 text-slate-400 hover:text-red-500 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">Certification Name</label>
                            <input
                              type="text"
                              value={c.name}
                              onChange={(e) => {
                                const updated = [...(currentResume.certifications || [])];
                                updated[idx].name = e.target.value;
                                setCurrentResume({ ...currentResume, certifications: updated });
                              }}
                              className="w-full p-2 border border-slate-300 rounded-lg outline-hidden"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">Issuing Organization</label>
                            <input
                              type="text"
                              value={c.issuer}
                              onChange={(e) => {
                                const updated = [...(currentResume.certifications || [])];
                                updated[idx].issuer = e.target.value;
                                setCurrentResume({ ...currentResume, certifications: updated });
                              }}
                              className="w-full p-2 border border-slate-300 rounded-lg outline-hidden"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">Year</label>
                            <input
                              type="text"
                              value={c.year}
                              onChange={(e) => {
                                const updated = [...(currentResume.certifications || [])];
                                updated[idx].year = e.target.value;
                                setCurrentResume({ ...currentResume, certifications: updated });
                              }}
                              className="w-full p-2 border border-slate-300 rounded-lg outline-hidden"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: LIVE RESUME PREVIEW */}
              <div className="lg:col-span-6 sticky top-20 space-y-3">
                <div className="flex justify-between items-center bg-slate-200/80 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                    Live Document Preview
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActivePreviewZoom(Math.max(70, activePreviewZoom - 10))}
                      className="px-2 py-0.5 bg-white rounded border border-slate-300 text-[11px] font-bold"
                    >
                      -
                    </button>
                    <span className="text-[11px] font-mono">{activePreviewZoom}%</span>
                    <button
                      onClick={() => setActivePreviewZoom(Math.min(130, activePreviewZoom + 10))}
                      className="px-2 py-0.5 bg-white rounded border border-slate-300 text-[11px] font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto p-4 bg-slate-300/40 rounded-2xl border border-slate-200 flex justify-center">
                  <div style={{ transform: `scale(${activePreviewZoom / 100})`, transformOrigin: 'top center', transition: 'transform 0.15s ease' }}>
                    <ResumeRenderer
                      resume={currentResume}
                      templateId={selectedTemplate}
                      elementId="resume-preview-document"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MY RESUMES (LIST & ACTIONS) */}
        {userTab === 'resumes' && (
          <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Resumes ({resumes.length})</h1>
                <p className="text-xs text-slate-500">Manage all saved versions, switch templates, duplicate, or export to PDF</p>
              </div>
              <button
                onClick={() => {
                  const fresh = createNewBlankResume(user);
                  setCurrentResume(fresh);
                  setCurrentResumeId(null);
                  setUserTab('builder');
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Resume</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {resumes.map(r => (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md border border-purple-200">
                        {r.template_id || 'professional'}
                      </span>
                      <span className="text-xs font-semibold text-emerald-600">
                        {r.completion_percentage || 85}% complete
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900">{r.title}</h3>
                    <p className="text-xs text-slate-500">{r.target_job_role || 'Target Role'}</p>

                    <div className="text-[11px] text-slate-400">
                      Updated: {new Date(r.updated_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setCurrentResume(r);
                        setSelectedTemplate(r.template_id || 'professional');
                        setCurrentResumeId(r.id);
                        setUserTab('builder');
                      }}
                      className="flex-1 py-1.5 bg-slate-900 hover:bg-purple-600 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDuplicateResume(r.id)}
                      title="Duplicate Resume"
                      className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg transition-colors cursor-pointer"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDownloadPdf(r)}
                      disabled={isExportingPdf}
                      title="Download PDF"
                      className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteResume(r.id)}
                      title="Delete Resume"
                      className="p-2 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-300 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: TEMPLATES SHOWCASE */}
        {userTab === 'templates' && (
          <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">8 Professional Resume Templates</h1>
              <p className="text-xs text-slate-500">
                Choose any template. Switch anytime without losing your saved resume information.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {templates.map(tpl => (
                <div key={tpl.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 hover:border-purple-400 transition-all flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                      {tpl.id}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-2">{tpl.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{tpl.desc}</p>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedTemplate(tpl.id);
                      if (currentResume) {
                        setCurrentResume({ ...currentResume, template_id: tpl.id });
                      }
                      setUserTab('builder');
                    }}
                    className="w-full py-2 bg-slate-900 hover:bg-purple-600 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer text-center"
                  >
                    Select & Edit
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: DEDICATED AI RESUME POLISH WORKBENCH */}
        {userTab === 'ai-generator' && currentResume && (
          <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Google Gemini 3.8 Flash Engine</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">AI Resume Polish & Optimizer</h1>
              <p className="text-xs sm:text-sm text-purple-200 max-w-2xl leading-relaxed">
                Enhance your resume sections with strong action verbs, quantifiable metrics, and high-impact ATS keywords. All suggestions are presented side-by-side for your review before applying.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Polish Controls */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Resume</label>
                  <select
                    value={currentResume.id}
                    onChange={(e) => {
                      const id = parseInt(e.target.value, 10);
                      const found = resumes.find(r => r.id === id);
                      if (found) {
                        setCurrentResume(found);
                        setCurrentResumeId(found.id);
                      }
                    }}
                    className="w-full text-xs font-semibold border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 outline-hidden focus:ring-2 focus:ring-purple-500"
                  >
                    {resumes.map(r => (
                      <option key={r.id} value={r.id}>{r.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Section to Polish</label>
                  <div className="space-y-1.5">
                    {[
                      { id: 'summary', label: 'Professional Summary' },
                      { id: 'objective', label: 'Career Objective' },
                      { id: 'experience', label: 'Work Experience' },
                      { id: 'projects', label: 'Technical Projects' }
                    ].map(sec => (
                      <button
                        key={sec.id}
                        onClick={() => setAiPolishSection(sec.id as any)}
                        className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                          aiPolishSection === sec.id ? 'bg-purple-50 text-purple-800 border border-purple-200 font-bold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {sec.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Enhancement Tone</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { id: 'impact', label: 'Action & Impact' },
                      { id: 'executive', label: 'Executive' },
                      { id: 'ats', label: 'ATS Keywords' },
                      { id: 'concise', label: 'Concise' }
                    ].map(tone => (
                      <button
                        key={tone.id}
                        onClick={() => setAiPolishTone(tone.id as any)}
                        className={`px-2.5 py-1.5 rounded-lg border text-center transition-colors cursor-pointer ${
                          aiPolishTone === tone.id ? 'border-purple-600 bg-purple-50 text-purple-700 font-bold' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {tone.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Polish Workbench Panel */}
              <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
                {aiPolishSection === 'summary' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-base text-slate-900">Polish Professional Summary</h3>
                      <p className="text-xs text-slate-500">Generates or rewrites your summary using your technical skills and target role.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700">Current Summary</label>
                      <textarea
                        rows={4}
                        value={currentResume.career_summary || ''}
                        onChange={(e) => setCurrentResume({ ...currentResume, career_summary: e.target.value })}
                        placeholder="Enter summary to polish or let AI generate from scratch..."
                        className="w-full p-3 border border-slate-300 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <button
                      onClick={() => handleAiGenerateSummary(aiPolishTone)}
                      disabled={isAiLoading}
                      className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      <span>Generate & Polish Summary</span>
                    </button>
                  </div>
                )}

                {aiPolishSection === 'objective' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-base text-slate-900">Polish Career Objective</h3>
                      <p className="text-xs text-slate-500">Crafts a sharp objective aligned with {currentResume.target_job_role || 'your target role'}.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700">Current Objective</label>
                      <textarea
                        rows={3}
                        value={currentResume.career_objective || ''}
                        onChange={(e) => setCurrentResume({ ...currentResume, career_objective: e.target.value })}
                        placeholder="Enter current objective..."
                        className="w-full p-3 border border-slate-300 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <button
                      onClick={handleAiGenerateObjective}
                      disabled={isAiLoading}
                      className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      <span>Generate & Polish Objective</span>
                    </button>
                  </div>
                )}

                {aiPolishSection === 'experience' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-base text-slate-900">Polish Work Experience</h3>
                      <p className="text-xs text-slate-500">Select any experience item to enhance responsibilities with action verbs and metrics.</p>
                    </div>

                    {currentResume.experience?.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No experience items in this resume. Switch to the Builder to add work history.</p>
                    ) : (
                      currentResume.experience?.map((exp, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-xs text-slate-900">{exp.jobTitle} at {exp.company}</span>
                            <button
                              onClick={() => handleAiImproveExperience(idx)}
                              disabled={isAiLoading}
                              className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-md text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                              <span>Polish with AI</span>
                            </button>
                          </div>
                          <p className="text-xs text-slate-600">{exp.responsibilities}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {aiPolishSection === 'projects' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-base text-slate-900">Polish Technical Projects</h3>
                      <p className="text-xs text-slate-500">Highlight architecture, tech stacks, and quantifiable engineering milestones.</p>
                    </div>

                    {currentResume.projects?.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No project items in this resume. Switch to the Builder to add projects.</p>
                    ) : (
                      currentResume.projects?.map((proj, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-xs text-slate-900">{proj.title}</span>
                            <button
                              onClick={() => handleAiImproveProject(idx)}
                              disabled={isAiLoading}
                              className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-md text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                              <span>Polish with AI</span>
                            </button>
                          </div>
                          <p className="text-xs text-slate-600">{proj.description}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: JOB RECOMMENDATIONS (REAL MYSQL DATA) */}
        {userTab === 'recommendations' && (
          <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-1">
                  <Compass className="w-3.5 h-3.5" />
                  Live Dynamic Database Requirements
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Intelligent Career & Job Role Recommendations
                </h1>
                <p className="text-xs text-slate-500">
                  Calculated dynamically from our active MySQL tech requirements. Updates immediately whenever administrators adjust role criteria.
                </p>
              </div>

              <button
                onClick={() => fetchCareerRecommendations(selectedAnalysisRole || undefined)}
                disabled={isLoadingCareer}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
              >
                {isLoadingCareer ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                <span>Recalculate Matches</span>
              </button>
            </div>

            {/* AI Explanation Banner */}
            {topRoleExplanation && (
              <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-purple-500/30 space-y-2">
                <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Gemini 3.8 Flash Career Insight</span>
                </div>
                <p className="text-xs sm:text-sm text-purple-100 leading-relaxed italic">
                  "{topRoleExplanation}"
                </p>
              </div>
            )}

            {/* Recommendations List */}
            {isLoadingCareer ? (
              <div className="p-12 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
                <p className="text-xs text-slate-500">Querying database job requirements and calculating weighted alignment scores...</p>
              </div>
            ) : recommendations.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
                <p className="text-xs text-slate-500">No active job roles found. Please check back later.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations.map(role => (
                  <div
                    key={role.roleId}
                    className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-purple-300 transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-900">{role.roleTitle}</h3>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                            {role.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{role.description}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-xs text-slate-400 font-semibold">Match Score</div>
                          <div className="text-2xl font-black text-purple-600">{role.matchPercentage}%</div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedAnalysisRole(role.roleId);
                            setUserTab('skill-gap');
                          }}
                          className="px-4 py-2 bg-slate-900 hover:bg-purple-600 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                        >
                          View Gap Analysis
                        </button>
                      </div>
                    </div>

                    {/* Skill Alignment Preview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-100">
                      <div>
                        <span className="font-bold text-emerald-700 block mb-1">
                          Matching Skills ({role.matchingSkills.length})
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {role.matchingSkills.map((s, i) => (
                            <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded font-medium text-[11px] border border-emerald-200">
                              ✓ {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="font-bold text-amber-700 block mb-1">
                          Missing Mandatory Skills ({role.missingMandatory.length})
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {role.missingMandatory.map((s, i) => (
                            <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded font-medium text-[11px] border border-amber-200">
                              ! {s.name} ({s.proficiency})
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 7: SKILL GAP ANALYSIS */}
        {userTab === 'skill-gap' && (
          <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
            {(() => {
              const active = recommendations.find(r => r.roleId === selectedAnalysisRole) || recommendations[0];
              if (!active) {
                return (
                  <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                    <p className="text-xs text-slate-500">Select a job role from Job Recommendations to view skill gap breakdown.</p>
                  </div>
                );
              }

              return (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                        Skill Gap Analysis for {active.roleTitle}
                      </h1>
                      <p className="text-xs text-slate-500">
                        Detailed comparison of your current skillset against active database role requirements.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={active.roleId}
                        onChange={(e) => setSelectedAnalysisRole(parseInt(e.target.value, 10))}
                        className="text-xs font-semibold border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-slate-800 outline-hidden"
                      >
                        {recommendations.map(r => (
                          <option key={r.roleId} value={r.roleId}>{r.roleTitle} ({r.matchPercentage}%)</option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          setSelectedAnalysisRole(active.roleId);
                          setUserTab('roadmap');
                        }}
                        className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                      >
                        <Route className="w-3.5 h-3.5" />
                        <span>View Roadmap</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                      <div className="text-xs text-slate-500 font-semibold">Match Percentage</div>
                      <div className="text-2xl font-black text-purple-600 mt-1">{active.matchPercentage}%</div>
                      <div className="text-[11px] text-slate-400">Based on weighted requirement algorithms</div>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                      <div className="text-xs text-slate-500 font-semibold">Matching Verified Skills</div>
                      <div className="text-2xl font-black text-emerald-600 mt-1">{active.matchingSkills.length}</div>
                      <div className="text-[11px] text-slate-400">Ready for job interview verification</div>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                      <div className="text-xs text-slate-500 font-semibold">Missing Skills to Learn</div>
                      <div className="text-2xl font-black text-red-600 mt-1">
                        {active.missingMandatory.length + active.missingPreferred.length}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {active.missingMandatory.length} mandatory, {active.missingPreferred.length} preferred
                      </div>
                    </div>
                  </div>

                  {/* Missing Skills Interactive Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                    <h2 className="text-base font-bold text-slate-900">Missing Skills Deep Dive & Action Plan</h2>
                    <p className="text-xs text-slate-500">
                      Understand why each skill is required, where it is used, and update your personal learning progress in MySQL.
                    </p>

                    <div className="space-y-4 pt-2">
                      {[...active.missingMandatory, ...active.missingPreferred].map((skill, idx) => {
                        const progress = skillProgressList.find(p => p.skill_name.toLowerCase() === skill.name.toLowerCase());
                        const currentStatus = progress?.status || 'Not Started';

                        return (
                          <div
                            key={idx}
                            className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-purple-300 transition-all space-y-3"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-900">{skill.name}</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-red-100 text-red-800 rounded">
                                  Required: {skill.proficiency}
                                </span>
                                {skill.category && (
                                  <span className="text-[10px] text-slate-500 font-medium">({skill.category})</span>
                                )}
                              </div>

                              {/* Progress Status Select */}
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500 font-semibold">Status:</span>
                                <select
                                  value={currentStatus}
                                  onChange={(e) => handleUpdateSkillProgress(skill.name, e.target.value as any, skill.proficiency as any)}
                                  className="text-xs font-semibold border border-slate-300 rounded-lg px-2.5 py-1 bg-white text-slate-800 outline-hidden cursor-pointer"
                                >
                                  <option value="Not Started">Not Started</option>
                                  <option value="Learning">Learning</option>
                                  <option value="Completed">Completed</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                              <div>
                                <strong className="text-slate-800">Why it is important:</strong> {skill.description || 'Core requirement for production software design and scalable deployments.'}
                              </div>
                              <div>
                                <strong className="text-slate-800">Practice Project:</strong> Build a standalone module or test microservice implementing {skill.name}.
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 8: LEARNING ROADMAP */}
        {userTab === 'roadmap' && (
          <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Personalized Learning Roadmap</h1>
                <p className="text-xs text-slate-500">
                  Step-by-step career acceleration curriculum synthesized for {roadmapRoleTitle}
                </p>
              </div>

              <button
                onClick={() => fetchRoadmap()}
                disabled={isLoadingRoadmap}
                className="px-3.5 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                {isLoadingRoadmap ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                <span>Regenerate Plan</span>
              </button>
            </div>

            {isLoadingRoadmap ? (
              <div className="p-12 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
                <p className="text-xs text-slate-500">Synthesizing personalized curriculum and practice projects with Gemini AI...</p>
              </div>
            ) : roadmap.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                <p className="text-xs text-slate-500">Click Regenerate Plan to synthesize your learning roadmap.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {roadmap.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-start gap-5 relative overflow-hidden"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-black text-base flex items-center justify-center shrink-0 shadow-xs">
                      {step.order || idx + 1}
                    </div>

                    <div className="flex-1 space-y-2 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">{step.skill}</h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                            {step.level}
                          </span>
                        </div>
                      </div>

                      <p className="text-slate-700 leading-relaxed">
                        <strong className="text-slate-900">Objectives:</strong> {step.objectives}
                      </p>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                        <div className="font-semibold text-purple-950">Hands-on Exercises:</div>
                        <div className="text-slate-600">{step.practicalExercises}</div>
                      </div>

                      <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-1">
                        <div className="font-semibold text-indigo-950">Suggested Capstone Project:</div>
                        <div className="text-slate-700 font-medium">{step.suggestedProject}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 9: MY PROFILE & SETTINGS */}
        {userTab === 'profile' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Profile & Account Settings</h1>
              <p className="text-xs text-slate-500">Manage your user information, security credentials, and preferences.</p>
            </div>

            {profileMessage && (
              <div className={`p-4 rounded-xl text-xs font-bold border flex items-center gap-2 ${
                profileMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-red-50 text-red-800 border-red-300'
              }`}>
                {profileMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                <span>{profileMessage.text}</span>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-purple-100 text-purple-800 rounded">
                      Role: {user?.role}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active'}
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Personal Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        required
                        className="w-full p-2.5 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        required
                        className="w-full p-2.5 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">Change Password (Optional)</h3>
                  <p className="text-xs text-slate-500">Leave blank if you do not wish to change your password.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
                      <input
                        type="password"
                        value={profileForm.currentPassword}
                        onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                        placeholder="••••••••"
                        className="w-full p-2.5 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">New Password</label>
                      <input
                        type="password"
                        value={profileForm.newPassword}
                        onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                        placeholder="••••••••"
                        className="w-full p-2.5 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        value={profileForm.confirmNewPassword}
                        onChange={(e) => setProfileForm({ ...profileForm, confirmNewPassword: e.target.value })}
                        placeholder="••••••••"
                        className="w-full p-2.5 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isUpdatingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Save Profile Changes</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
