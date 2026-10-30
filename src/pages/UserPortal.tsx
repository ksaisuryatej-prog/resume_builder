import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Resume, JobRole, JobRecommendation, SkillProgress, RoadmapStep } from '../types';
import { ResumeRenderer } from '../components/templates/ResumeRenderer';
import {
  LayoutDashboard,
  FilePlus,
  Files,
  Sparkles,
  Compass,
  BarChart2,
  Route,
  User,
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
  RefreshCw
} from 'lucide-react';

export const UserPortal: React.FC = () => {
  const { user, token, userTab, setUserTab, currentResumeId, setCurrentResumeId, logout, setActiveView } = useAuth();

  // Resume state
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [currentResume, setCurrentResume] = useState<Resume | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('professional');
  const [builderTab, setBuilderTab] = useState<'personal' | 'career' | 'education' | 'skills' | 'projects' | 'experience' | 'certifications' | 'additional'>('personal');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activePreviewZoom, setActivePreviewZoom] = useState(100);

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

  // Initial resume template default
  const defaultResume: Resume = {
    id: 0,
    user_id: user?.id || 0,
    template_id: 'professional',
    title: 'Software Developer Resume',
    target_job_role: 'Full Stack Developer',
    personal_info: {
      fullName: user?.name || '',
      email: user?.email || '',
      phone: '+1 (555) 019-2834',
      location: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/developer',
      github: 'github.com/developer',
      portfolio: 'developer.io'
    },
    career_summary: 'Passionate and detail-oriented Software Engineer with a solid background in full-stack architecture, API integration, and database management. Experienced in building scalable web applications and collaborating effectively across Agile engineering teams.',
    career_objective: 'To join an innovative technology organization as a Full Stack Engineer where I can leverage my software development proficiencies to deliver robust user experiences.',
    education: [
      {
        institution: 'University of Engineering & Technology',
        degree: 'Bachelor of Science',
        branch: 'Computer Science',
        graduationYear: '2024',
        cgpa: '3.80 / 4.0'
      }
    ],
    skills: {
      programmingLanguages: ['JavaScript', 'TypeScript', 'Python', 'SQL'],
      frameworks: ['React.js', 'Node.js', 'Express.js', 'Tailwind CSS'],
      databases: ['PostgreSQL', 'MongoDB'],
      tools: ['Git', 'GitHub', 'Docker', 'VS Code'],
      technicalSkills: ['RESTful APIs', 'Data Structures', 'JWT Authentication'],
      softSkills: ['Problem Solving', 'Agile Teamwork', 'Technical Writing']
    },
    projects: [
      {
        title: 'CloudMetrics - Real-Time Dashboard',
        description: 'Engineered a high-performance analytics web dashboard processing live telemetry events with sub-second response times.',
        technologies: 'React, Node.js, Express, PostgreSQL',
        link: 'https://github.com/developer/cloudmetrics',
        responsibilities: 'Designed REST API endpoints with authentication and created indexed PostgreSQL queries.'
      }
    ],
    experience: [
      {
        company: 'Apex Software Labs',
        jobTitle: 'Associate Software Developer',
        duration: 'June 2024 - Present',
        responsibilities: 'Engineered responsive frontend components in React and optimized backend API query latency by 25%.',
        achievements: 'Contributed to microservice migration and unit test coverage expansion to 85%.'
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
      awards: ['Hackathon Finalist 2023'],
      extracurricular: ['Open Source Contributor', 'Tech Club Mentor']
    },
    completion_percentage: 85,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Fetch Resumes
  const fetchResumes = async () => {
    try {
      const res = await fetch('/api/resumes', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setResumes(data.resumes || []);
        if (data.resumes && data.resumes.length > 0) {
          if (currentResumeId) {
            const found = data.resumes.find((r: Resume) => r.id === currentResumeId);
            if (found) {
              setCurrentResume(found);
              setSelectedTemplate(found.template_id || 'professional');
            } else {
              setCurrentResume(data.resumes[0]);
              setSelectedTemplate(data.resumes[0].template_id || 'professional');
            }
          } else if (!currentResume) {
            setCurrentResume(data.resumes[0]);
            setSelectedTemplate(data.resumes[0].template_id || 'professional');
          }
        } else {
          setCurrentResume(defaultResume);
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
    }
  }, [userTab]);

  // Handle Save Resume
  const handleSaveResume = async () => {
    if (!currentResume) return;
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const payload = {
        ...currentResume,
        template_id: selectedTemplate
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
        setCurrentResume(data.resume);
        setSaveMessage('Resume saved successfully!');
        fetchResumes();
        setTimeout(() => setSaveMessage(null), 3500);
      } else {
        setSaveMessage('Error saving resume.');
      }
    } catch (err) {
      console.error('Save resume error:', err);
      setSaveMessage('Failed to save resume.');
    } finally {
      setIsSaving(false);
    }
  };

  // Download PDF
  const handleDownloadPdf = () => {
    const element = document.getElementById('resume-preview-document');
    if (!element) return;

    // Use html2pdf if available on window
    const html2pdf = (window as any).html2pdf;
    if (html2pdf) {
      const opt = {
        margin: [5, 5, 5, 5],
        filename: `${currentResume?.personal_info?.fullName || 'Resume'}_${currentResume?.target_job_role || 'Craft'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      html2pdf().set(opt).from(element).save();
    } else {
      window.print();
    }
  };

  // AI Helper Functions
  const handleAiGenerateSummary = async () => {
    if (!currentResume) return;
    setIsAiLoading(true);
    try {
      const allSkills = [
        ...(currentResume.skills?.programmingLanguages || []),
        ...(currentResume.skills?.frameworks || []),
        ...(currentResume.skills?.databases || []),
        ...(currentResume.skills?.technicalSkills || [])
      ];

      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          type: 'summary',
          fullName: currentResume.personal_info?.fullName,
          targetJobRole: currentResume.target_job_role,
          skills: allSkills,
          education: currentResume.education?.[0]?.degree,
          existingSummary: currentResume.career_summary
        }),
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        if (data.result) {
          setCurrentResume(prev => prev ? ({ ...prev, career_summary: data.result }) : null);
        }
      }
    } catch (err) {
      console.error('AI summary error:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

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
          setCurrentResume(prev => prev ? ({ ...prev, career_objective: data.result }) : null);
        }
      }
    } catch (err) {
      console.error('AI objective error:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

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
          const updatedProjects = [...(currentResume.projects || [])];
          updatedProjects[index] = { ...proj, description: data.result };
          setCurrentResume(prev => prev ? ({ ...prev, projects: updatedProjects }) : null);
        }
      }
    } catch (err) {
      console.error('AI improve project error:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

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
          const updatedExp = [...(currentResume.experience || [])];
          updatedExp[index] = { ...exp, responsibilities: data.result };
          setCurrentResume(prev => prev ? ({ ...prev, experience: updatedExp }) : null);
        }
      }
    } catch (err) {
      console.error('AI improve experience error:', err);
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
        // Update local list
        setSkillProgressList(prev => {
          const existing = prev.findIndex(p => p.skill_name.toLowerCase() === skillName.toLowerCase() && p.job_role_id === selectedAnalysisRole);
          if (existing >= 0) {
            const next = [...prev];
            next[existing] = data.progress;
            return next;
          }
          return [...prev, data.progress];
        });
      }
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  // Templates list
  const templates = [
    { id: 'professional', name: 'Professional Classic', desc: 'Navy executive headers & balanced columns' },
    { id: 'modern', name: 'Modern Purple', desc: 'Contemporary purple gradient & timeline cards' },
    { id: 'minimal', name: 'Minimalist Clean', desc: 'Ample whitespace & stark typographic hierarchy' },
    { id: 'creative', name: 'Creative Portfolio', desc: 'Dark sidebar, graphic rating meters & links' },
    { id: 'ats_friendly', name: 'ATS-Friendly Standard', desc: 'Single-column structure for 100% parser passing' },
    { id: 'fresher', name: 'Fresher / Student', desc: 'Academic coursework, capstones & honors' },
    { id: 'tech_developer', name: 'Technical Developer', desc: 'Monospace badges, repos & stack tags' },
    { id: 'executive', name: 'Executive Leadership', desc: 'Strategic milestones & competency matrix' }
  ];

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-slate-100">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0 hidden md:flex flex-col justify-between p-4">
        <div className="space-y-6">
          {/* User profile card */}
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-bold flex items-center justify-center text-sm shadow-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">{user?.name}</div>
              <div className="text-[11px] text-purple-300 truncate">{user?.email}</div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1 text-xs font-semibold">
            <button
              onClick={() => setUserTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                userTab === 'dashboard' ? 'bg-purple-600 text-white shadow-sm' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => {
                setCurrentResume(defaultResume);
                setUserTab('builder');
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                userTab === 'builder' ? 'bg-purple-600 text-white shadow-sm' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FilePlus className="w-4 h-4 text-purple-400" />
              <span>Create / Edit Resume</span>
            </button>

            <button
              onClick={() => setUserTab('resumes')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                userTab === 'resumes' ? 'bg-purple-600 text-white shadow-sm' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Files className="w-4 h-4" />
              <span>My Resumes ({resumes.length})</span>
            </button>

            <button
              onClick={() => setUserTab('templates')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                userTab === 'templates' ? 'bg-purple-600 text-white shadow-sm' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Resume Templates (8)</span>
            </button>

            <button
              onClick={() => {
                setUserTab('builder');
                setBuilderTab('career');
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer hover:bg-slate-800 hover:text-white text-purple-300"
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
                userTab === 'recommendations' ? 'bg-purple-600 text-white shadow-sm' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>Job Recommendations</span>
            </button>

            <button
              onClick={() => setUserTab('skill-gap')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                userTab === 'skill-gap' ? 'bg-purple-600 text-white shadow-sm' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BarChart2 className="w-4 h-4 text-amber-400" />
              <span>Skill Gap Analysis</span>
            </button>

            <button
              onClick={() => setUserTab('roadmap')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                userTab === 'roadmap' ? 'bg-purple-600 text-white shadow-sm' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Route className="w-4 h-4 text-blue-400" />
              <span>Learning Roadmap</span>
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

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {/* TAB 1: DASHBOARD */}
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
                    setCurrentResume(defaultResume);
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

            {/* Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
                  <span>Resumes Created</span>
                  <Files className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-3xl font-black text-slate-900">{resumes.length}</div>
                <div className="text-[11px] text-emerald-600 font-medium mt-1">Ready for PDF download</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
                  <span>Avg Completion</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-3xl font-black text-slate-900">
                  {resumes.length ? Math.round(resumes.reduce((acc, r) => acc + (r.completion_percentage || 0), 0) / resumes.length) : 85}%
                </div>
                <div className="text-[11px] text-slate-500 mt-1">ATS Content Score</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
                  <span>Top Job Alignment</span>
                  <Compass className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-xl font-bold text-slate-900 truncate">
                  {recommendations[0]?.roleTitle || 'Full Stack Dev'}
                </div>
                <div className="text-[11px] text-blue-600 font-medium mt-1">
                  {recommendations[0]?.matchPercentage || 92}% Match Score
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
                  <span>Skills in Progress</span>
                  <BookOpen className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-3xl font-black text-slate-900">
                  {skillProgressList.filter(p => p.status === 'Learning').length || 2}
                </div>
                <div className="text-[11px] text-amber-600 font-medium mt-1">
                  {skillProgressList.filter(p => p.status === 'Completed').length} mastered
                </div>
              </div>
            </div>

            {/* Recently Edited Resumes Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Your Resumes</h2>
                  <p className="text-xs text-slate-500">Edit, duplicate, preview, or export to PDF</p>
                </div>
                <button
                  onClick={() => {
                    setCurrentResume(defaultResume);
                    setUserTab('builder');
                  }}
                  className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
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
                      setCurrentResume(defaultResume);
                      setUserTab('builder');
                    }}
                    className="px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-lg"
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
                          onClick={() => {
                            setCurrentResume(r);
                            setSelectedTemplate(r.template_id || 'professional');
                            setTimeout(() => handleDownloadPdf(), 200);
                          }}
                          title="Download PDF"
                          className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg transition-colors cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
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
                  className="font-bold text-base text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-purple-600 outline-hidden px-1 py-0.5"
                />
                <span className="text-xs px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-200">
                  {currentResume.completion_percentage || 85}% complete
                </span>
              </div>

              {/* Template selector dropdown */}
              <div className="flex items-center gap-2">
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

                <button
                  onClick={handleSaveResume}
                  disabled={isSaving}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save</span>
                </button>

                <button
                  onClick={handleDownloadPdf}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="p-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  title="Print Resume"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>

            {saveMessage && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{saveMessage}</span>
              </div>
            )}

            {/* Split Screen Workspace: Left Form, Right Live Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT COLUMN: BUILDER TABS & FORM */}
              <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                {/* Form Navigation Tabs */}
                <div className="flex overflow-x-auto p-1.5 bg-slate-50 border-b border-slate-200 gap-1 text-xs font-semibold text-slate-600 scrollbar-none">
                  {[
                    { id: 'personal', label: 'Personal' },
                    { id: 'career', label: 'Career & Summary' },
                    { id: 'education', label: 'Education' },
                    { id: 'skills', label: 'Skills' },
                    { id: 'projects', label: 'Projects' },
                    { id: 'experience', label: 'Experience' },
                    { id: 'certifications', label: 'Certifications' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setBuilderTab(tab.id as any)}
                      className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                        builderTab === tab.id
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="p-6 space-y-5 max-h-[780px] overflow-y-auto">
                  {/* SECTION 1: PERSONAL DETAILS */}
                  {builderTab === 'personal' && (
                    <div className="space-y-4">
                      <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
                        Personal Contact Details
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                          <input
                            type="text"
                            value={currentResume.personal_info?.fullName || ''}
                            onChange={(e) => setCurrentResume({
                              ...currentResume,
                              personal_info: { ...currentResume.personal_info, fullName: e.target.value }
                            })}
                            className="w-full p-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Target Job Role *</label>
                          <input
                            type="text"
                            value={currentResume.target_job_role || ''}
                            onChange={(e) => setCurrentResume({
                              ...currentResume,
                              target_job_role: e.target.value
                            })}
                            placeholder="e.g. Full Stack Developer"
                            className="w-full p-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                          <input
                            type="email"
                            value={currentResume.personal_info?.email || ''}
                            onChange={(e) => setCurrentResume({
                              ...currentResume,
                              personal_info: { ...currentResume.personal_info, email: e.target.value }
                            })}
                            className="w-full p-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
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
                            className="w-full p-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Location (City, Country)</label>
                          <input
                            type="text"
                            value={currentResume.personal_info?.location || ''}
                            onChange={(e) => setCurrentResume({
                              ...currentResume,
                              personal_info: { ...currentResume.personal_info, location: e.target.value }
                            })}
                            className="w-full p-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
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
                            className="w-full p-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">GitHub Profile</label>
                          <input
                            type="text"
                            value={currentResume.personal_info?.github || ''}
                            onChange={(e) => setCurrentResume({
                              ...currentResume,
                              personal_info: { ...currentResume.personal_info, github: e.target.value }
                            })}
                            placeholder="github.com/username"
                            className="w-full p-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Portfolio Website</label>
                          <input
                            type="text"
                            value={currentResume.personal_info?.portfolio || ''}
                            onChange={(e) => setCurrentResume({
                              ...currentResume,
                              personal_info: { ...currentResume.personal_info, portfolio: e.target.value }
                            })}
                            placeholder="yourname.dev"
                            className="w-full p-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SECTION 2: CAREER & SUMMARY */}
                  {builderTab === 'career' && (
                    <div className="space-y-5">
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="font-bold text-xs text-slate-900">Professional Summary</label>
                          <button
                            type="button"
                            onClick={handleAiGenerateSummary}
                            disabled={isAiLoading}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-purple-600" />}
                            <span>AI Generate & Polish</span>
                          </button>
                        </div>
                        <textarea
                          rows={5}
                          value={currentResume.career_summary || ''}
                          onChange={(e) => setCurrentResume({ ...currentResume, career_summary: e.target.value })}
                          placeholder="Results-driven software engineer with demonstrated expertise..."
                          className="w-full p-3 text-xs border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500 leading-relaxed"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="font-bold text-xs text-slate-900">Career Objective (Especially for Freshers / Students)</label>
                          <button
                            type="button"
                            onClick={handleAiGenerateObjective}
                            disabled={isAiLoading}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                            <span>AI Generate Objective</span>
                          </button>
                        </div>
                        <textarea
                          rows={3}
                          value={currentResume.career_objective || ''}
                          onChange={(e) => setCurrentResume({ ...currentResume, career_objective: e.target.value })}
                          placeholder="Aspiring software professional seeking to leverage skills..."
                          className="w-full p-3 text-xs border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500 leading-relaxed"
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
                            const newEdu = {
                              institution: '',
                              degree: 'Bachelor of Science',
                              branch: 'Computer Science',
                              graduationYear: '2024',
                              cgpa: ''
                            };
                            setCurrentResume({
                              ...currentResume,
                              education: [...(currentResume.education || []), newEdu]
                            });
                          }}
                          className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-md text-xs font-bold hover:bg-purple-100 flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Degree</span>
                        </button>
                      </div>

                      {currentResume.education?.map((edu, idx) => (
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
                            <div>
                              <label className="block font-semibold text-slate-700 mb-1">Institution Name</label>
                              <input
                                type="text"
                                value={edu.institution}
                                onChange={(e) => {
                                  const updated = [...(currentResume.education || [])];
                                  updated[idx].institution = e.target.value;
                                  setCurrentResume({ ...currentResume, education: updated });
                                }}
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
                                className="w-full p-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
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
                                  className="w-full p-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                                />
                              </div>
                              <div>
                                <label className="block font-semibold text-slate-700 mb-1">CGPA / %</label>
                                <input
                                  type="text"
                                  value={edu.cgpa}
                                  onChange={(e) => {
                                    const updated = [...(currentResume.education || [])];
                                    updated[idx].cgpa = e.target.value;
                                    setCurrentResume({ ...currentResume, education: updated });
                                  }}
                                  placeholder="e.g. 3.8 / 4.0"
                                  className="w-full p-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* SECTION 4: SKILLS */}
                  {builderTab === 'skills' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-sm text-slate-900">Technical & Professional Skills</h3>
                        <button
                          type="button"
                          onClick={async () => {
                            setIsAiLoading(true);
                            try {
                              const res = await fetch('/api/ai/suggest-skills', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                  ...(token ? { Authorization: `Bearer ${token}` } : {})
                                },
                                body: JSON.stringify({
                                  targetJobRole: currentResume.target_job_role || 'Full Stack Developer',
                                  currentSkills: currentResume.skills?.programmingLanguages
                                }),
                                credentials: 'include'
                              });
                              if (res.ok) {
                                const data = await res.json();
                                if (data.suggestedSkills) {
                                  const existingTools = currentResume.skills?.tools || [];
                                  const combined = Array.from(new Set([...existingTools, ...data.suggestedSkills.slice(0, 4)]));
                                  setCurrentResume({
                                    ...currentResume,
                                    skills: { ...currentResume.skills, tools: combined }
                                  });
                                }
                              }
                            } catch (e) {
                              console.error(e);
                            } finally {
                              setIsAiLoading(false);
                            }
                          }}
                          className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-md text-xs font-bold hover:bg-purple-100 flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                          <span>Suggest ATS Keywords</span>
                        </button>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Programming Languages (comma separated)
                          </label>
                          <input
                            type="text"
                            value={(currentResume.skills?.programmingLanguages || []).join(', ')}
                            onChange={(e) => setCurrentResume({
                              ...currentResume,
                              skills: {
                                ...currentResume.skills,
                                programmingLanguages: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                              }
                            })}
                            placeholder="e.g. JavaScript, TypeScript, Python, Java, SQL"
                            className="w-full p-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Frameworks & Libraries (comma separated)
                          </label>
                          <input
                            type="text"
                            value={(currentResume.skills?.frameworks || []).join(', ')}
                            onChange={(e) => setCurrentResume({
                              ...currentResume,
                              skills: {
                                ...currentResume.skills,
                                frameworks: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                              }
                            })}
                            placeholder="e.g. React.js, Node.js, Express.js, Spring Boot, Tailwind CSS"
                            className="w-full p-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Databases & Caching (comma separated)
                          </label>
                          <input
                            type="text"
                            value={(currentResume.skills?.databases || []).join(', ')}
                            onChange={(e) => setCurrentResume({
                              ...currentResume,
                              skills: {
                                ...currentResume.skills,
                                databases: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                              }
                            })}
                            placeholder="e.g. PostgreSQL, MySQL, MongoDB, Redis"
                            className="w-full p-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Developer Tools & Cloud (comma separated)
                          </label>
                          <input
                            type="text"
                            value={(currentResume.skills?.tools || []).join(', ')}
                            onChange={(e) => setCurrentResume({
                              ...currentResume,
                              skills: {
                                ...currentResume.skills,
                                tools: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                              }
                            })}
                            placeholder="e.g. Git, GitHub, Docker, Kubernetes, AWS, Linux"
                            className="w-full p-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Soft Skills & Leadership (comma separated)
                          </label>
                          <input
                            type="text"
                            value={(currentResume.skills?.softSkills || []).join(', ')}
                            onChange={(e) => setCurrentResume({
                              ...currentResume,
                              skills: {
                                ...currentResume.skills,
                                softSkills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                              }
                            })}
                            placeholder="e.g. Problem Solving, Cross-functional Collaboration, Agile / Scrum"
                            className="w-full p-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SECTION 5: PROJECTS */}
                  {builderTab === 'projects' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-sm text-slate-900">Featured Projects</h3>
                        <button
                          type="button"
                          onClick={() => {
                            const newProj = {
                              title: 'New Technical Project',
                              description: 'Architected and built full-stack solution utilizing modern component architecture.',
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
                              duration: 'Jan 2023 - Present',
                              responsibilities: 'Engineered web applications and collaborated with product teams.',
                              achievements: 'Improved test coverage and delivery cycles.'
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
                    <span className="text-slate-500">Template:</span>
                    <span className="font-bold text-slate-900 capitalize">{selectedTemplate.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="overflow-x-auto max-h-[820px] rounded-xl border border-slate-300 bg-slate-300/40 p-4 shadow-inner">
                  <ResumeRenderer
                    resume={currentResume}
                    templateId={selectedTemplate}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MY RESUMES LIST */}
        {userTab === 'resumes' && (
          <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Resumes</h1>
                <p className="text-xs text-slate-500">Manage all saved versions, switch templates, or export to PDF</p>
              </div>
              <button
                onClick={() => {
                  setCurrentResume(defaultResume);
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
                      onClick={() => {
                        setCurrentResume(r);
                        setSelectedTemplate(r.template_id || 'professional');
                        setTimeout(() => handleDownloadPdf(), 200);
                      }}
                      title="Download PDF"
                      className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={async () => {
                        if (!confirm('Are you sure you want to delete this resume?')) return;
                        await fetch(`/api/resumes/${r.id}`, {
                          method: 'DELETE',
                          headers: token ? { Authorization: `Bearer ${token}` } : {},
                          credentials: 'include'
                        });
                        fetchResumes();
                      }}
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
                    <p className="text-xs text-slate-500 mt-1">{tpl.desc}</p>
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

        {/* TAB 5: JOB RECOMMENDATIONS (CRITICAL FEATURE - REAL MYSQL DATA) */}
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
                    className="bg-white rounded-2xl border border-slate-200 hover:border-purple-300 p-6 shadow-xs transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                            {role.category}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500">
                            Exp: {role.minimumExperience}+ years ({role.experienceLevel})
                          </span>
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 mt-1">{role.roleTitle}</h2>
                        <p className="text-xs text-slate-600 max-w-2xl mt-0.5">{role.description}</p>
                      </div>

                      {/* Match percentage ring */}
                      <div className="text-right sm:border-l sm:pl-6 border-slate-100">
                        <div className="text-3xl font-black text-emerald-600">{role.matchPercentage}%</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Skill Alignment</div>
                      </div>
                    </div>

                    {/* Matching vs Missing Skills */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Matching */}
                      <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                        <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Matching Skills ({role.matchingSkills.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {role.matchingSkills.length > 0 ? (
                            role.matchingSkills.map((s, i) => (
                              <span key={i} className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white text-emerald-800 border border-emerald-300">
                                ✓ {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 italic">No matching skills yet. Add skills to your resume!</span>
                          )}
                        </div>
                      </div>

                      {/* Missing Mandatory */}
                      <div className="p-3 bg-red-50/60 border border-red-200 rounded-xl space-y-2">
                        <div className="font-bold text-red-900 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                          <span>Missing Mandatory Skills ({role.missingMandatory.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {role.missingMandatory.length > 0 ? (
                            role.missingMandatory.map((m, i) => (
                              <span key={i} className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white text-red-700 border border-red-300">
                                ⚠ {m.name} ({m.proficiency})
                              </span>
                            ))
                          ) : (
                            <span className="text-emerald-700 font-semibold">All mandatory skills satisfied!</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="text-[11px] text-slate-500">
                        {role.recommendedProjects?.length ? `Suggested Projects: ${role.recommendedProjects.slice(0, 2).join(' • ')}` : ''}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedAnalysisRole(role.roleId);
                            setUserTab('skill-gap');
                          }}
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                        >
                          Deep Skill Gap Analysis
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAnalysisRole(role.roleId);
                            setUserTab('roadmap');
                          }}
                          className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>Personal Roadmap</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: SKILL GAP ANALYSIS */}
        {userTab === 'skill-gap' && (
          <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">AI Skill Gap Analysis</h1>
                <p className="text-xs text-slate-500">
                  Select any target role to compare current proficiencies against live database requirements.
                </p>
              </div>

              {/* Target Role Selector */}
              <select
                value={selectedAnalysisRole || ''}
                onChange={(e) => {
                  const id = parseInt(e.target.value, 10);
                  setSelectedAnalysisRole(id);
                  fetchCareerRecommendations(id);
                }}
                className="text-xs font-bold border border-slate-300 rounded-xl px-3.5 py-2 bg-white text-slate-800 outline-hidden focus:ring-2 focus:ring-purple-500 cursor-pointer shadow-xs"
              >
                {recommendations.map(r => (
                  <option key={r.roleId} value={r.roleId}>{r.roleTitle} ({r.matchPercentage}% match)</option>
                ))}
              </select>
            </div>

            {/* Active Role Card */}
            {(() => {
              const active = recommendations.find(r => r.roleId === selectedAnalysisRole) || recommendations[0];
              if (!active) return null;

              return (
                <div className="space-y-6">
                  {/* Overview Stats */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <div className="text-xs text-slate-500 font-semibold">Target Job Role</div>
                      <div className="text-xl font-black text-slate-900 mt-1">{active.roleTitle}</div>
                      <div className="text-xs text-purple-700 font-semibold">{active.category}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-semibold">Current Match Score</div>
                      <div className="text-3xl font-black text-emerald-600 mt-1">{active.matchPercentage}%</div>
                      <div className="text-[11px] text-slate-400">Relative to live requirements</div>
                    </div>
                    <div>
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

                              {/* Progress Status Buttons */}
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500 font-semibold">Status:</span>
                                <select
                                  value={currentStatus}
                                  onChange={(e) => handleUpdateSkillProgress(skill.name, e.target.value as any, skill.proficiency as any)}
                                  className="text-xs font-semibold border border-slate-300 rounded-lg px-2.5 py-1 bg-white text-slate-800 outline-hidden"
                                >
                                  <option value="Not Started">Not Started</option>
                                  <option value="Learning">Learning</option>
                                  <option value="Completed">Completed</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                              <div>
                                <strong className="text-slate-800">Why it is important:</strong> {skill.description}
                              </div>
                              <div>
                                <strong className="text-slate-800">Practice Project:</strong> Build a standalone module or microservice utilizing {skill.name} with automated tests.
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

        {/* TAB 7: LEARNING ROADMAP */}
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
      </main>
    </div>
  );
};
