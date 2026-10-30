import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileCheck,
  Compass,
  TrendingUp,
  Cpu,
  Layers,
  Award,
  ChevronDown,
  Download,
  Eye,
  Briefcase,
  Zap,
  BarChart3,
  ShieldAlert
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { openAuthModal, user, navigateToBuilder, setActiveView, setUserTab } = useAuth();
  const [selectedTemplateFilter, setSelectedTemplateFilter] = useState('All');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);

  const templatesData = [
    {
      id: 'professional',
      name: 'Professional Classic',
      category: 'Corporate',
      desc: 'Balanced dual-column format with authoritative navy section titles and crisp borders.',
      badge: 'Most Popular',
      color: 'border-slate-900',
      tag: 'ATS 99%'
    },
    {
      id: 'modern',
      name: 'Modern Purple',
      category: 'Modern',
      desc: 'Card design with deep purple gradient accents, timeline indicators, and skill pills.',
      badge: 'Trending',
      color: 'border-purple-600',
      tag: 'Creative'
    },
    {
      id: 'minimal',
      name: 'Minimalist Clean',
      category: 'Clean',
      desc: 'Understated elegance with ample whitespace and stark typography for effortless reading.',
      badge: 'High Signal',
      color: 'border-slate-400',
      tag: 'Minimal'
    },
    {
      id: 'creative',
      name: 'Creative Portfolio',
      category: 'Creative',
      desc: 'Dark sidebar with graphic proficiency meters, bold headings, and portfolio showcase.',
      badge: 'Designers',
      color: 'border-indigo-600',
      tag: 'Visual'
    },
    {
      id: 'ats_friendly',
      name: 'ATS-Friendly Standard',
      category: 'ATS',
      desc: 'Single-column structure strictly conforming to automated scanner and HR parser formats.',
      badge: '100% Parser Compliant',
      color: 'border-emerald-600',
      tag: 'High Pass'
    },
    {
      id: 'fresher',
      name: 'Fresher / Student',
      category: 'Academic',
      desc: 'Education-first hierarchy featuring capstone projects, course highlights, and leadership.',
      badge: 'Graduates',
      color: 'border-blue-600',
      tag: 'Entry Level'
    },
    {
      id: 'tech_developer',
      name: 'Technical Developer',
      category: 'Engineering',
      desc: 'Monospace code font accents, categorized tech stack matrices, and GitHub repo links.',
      badge: 'Engineers',
      color: 'border-emerald-500',
      tag: 'Tech Stack'
    },
    {
      id: 'executive',
      name: 'Executive Leadership',
      category: 'Corporate',
      desc: 'Strategic leadership metrics, board competencies, and quantifiable business milestones.',
      badge: 'C-Suite & Leads',
      color: 'border-slate-800',
      tag: 'Leadership'
    }
  ];

  const filteredTemplates = selectedTemplateFilter === 'All'
    ? templatesData
    : templatesData.filter(t => t.category === selectedTemplateFilter);

  const faqs = [
    {
      q: 'How does ResumeCraft compare my skills against job roles?',
      a: 'Unlike static resume generators, ResumeCraft pulls active industry requirements dynamically from our database. Whenever administrators update required frameworks, tools, or proficiencies, your profile and resume are analyzed transparently, computing exact matching and missing skill percentages.'
    },
    {
      q: 'Is the Gemini AI summary generation guaranteed to use my real details?',
      a: 'Yes. Our Gemini 3.8 Flash backend prompts strictly ground responses in your supplied background, education, and skills. It transforms rough notes into high-impact, active-verb descriptions without fabricating companies or degrees.'
    },
    {
      q: 'Will my generated resumes pass Applicant Tracking Systems (ATS)?',
      a: 'All 8 templates have been designed with ATS compliance in mind, especially the ATS-Friendly Standard template which uses pure single-column structure, standard section headers, and semantic text formatting.'
    },
    {
      q: 'Can I export clean PDF files from the browser?',
      a: 'Yes! ResumeCraft includes a client-side multi-page PDF rendering engine that captures pixel-perfect vector resumes matching the live preview, ready for job applications.'
    },
    {
      q: 'What is the Skill Gap Analysis and Learning Roadmap feature?',
      a: 'When you select any target role (like Java Backend Developer or AI Application Developer), ResumeCraft identifies missing mandatory, preferred, and optional skills. It then generates step-by-step learning objectives, practical projects, and allows you to track your learning progress.'
    }
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Next-Generation Career Platform & Resume Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight max-w-4xl mx-auto text-white leading-tight">
            Create Your Professional Resume.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-300 to-indigo-300">
              Discover Your Career Opportunities.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Build professional resumes with AI, explore career opportunities, identify missing skills and prepare yourself for your dream job.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => {
                if (user) navigateToBuilder();
                else openAuthModal('register');
              }}
              className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('template-gallery');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-sm rounded-xl border border-white/20 transition-all cursor-pointer backdrop-blur-xs"
            >
              Explore 8 Templates
            </button>
          </div>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10 border-t border-slate-800/80">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl font-black text-white">8+</div>
              <div className="text-xs text-slate-400">Curated Templates</div>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl font-black text-purple-400">Gemini 3.8</div>
              <div className="text-xs text-slate-400">Flash AI Optimizer</div>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl font-black text-emerald-400">100%</div>
              <div className="text-xs text-slate-400">Dynamic DB Alignment</div>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl font-black text-indigo-400">Instant</div>
              <div className="text-xs text-slate-400">PDF Multi-Page Export</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHY RESUMECRAFT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="text-xs font-bold uppercase tracking-widest text-purple-600">Why ResumeCraft?</div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            More than a resume maker: Your comprehensive career launchpad
          </h2>
          <p className="text-slate-600 text-sm">
            Traditional resume builders leave you with a static document. ResumeCraft connects your resume skills directly to actual database requirements, highlighting exactly where to upskill.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-purple-300 transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Google Gemini AI Engine</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Generate executive summaries, polish project descriptions, correct grammar, and inject high-impact action verbs calibrated for ATS parsers.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-purple-300 transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Dynamic Career Match</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Job requirements are pulled straight from MySQL. When industry tech stacks evolve, your recommendations update automatically.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-purple-300 transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Zero Data Loss Switching</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Switch freely between Professional, Modern, Creative, ATS, Fresher, Developer, and Executive layouts without losing a single keystroke.
            </p>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section id="features" className="bg-slate-50 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="text-xs font-bold uppercase tracking-widest text-purple-600">How It Works</div>
            <h2 className="text-3xl font-extrabold text-slate-900">4 Steps from Raw Profile to Dream Job</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 relative">
              <span className="text-3xl font-black text-purple-100 absolute top-3 right-4">01</span>
              <div className="w-8 h-8 rounded-lg bg-purple-600 text-white font-bold text-xs flex items-center justify-center mb-3">
                1
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">Enter Information</h3>
              <p className="text-xs text-slate-600">
                Input your education, projects, skills, and experience in our guided multi-section form.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 relative">
              <span className="text-3xl font-black text-purple-100 absolute top-3 right-4">02</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mb-3">
                2
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">AI Polish & Keywords</h3>
              <p className="text-xs text-slate-600">
                Click AI Improve on any section to enhance phrasing, fix grammar, and add ATS-friendly keywords.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 relative">
              <span className="text-3xl font-black text-purple-100 absolute top-3 right-4">03</span>
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center mb-3">
                3
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">Select from 8 Styles</h3>
              <p className="text-xs text-slate-600">
                Switch templates in real time, preview live rendering, and download high-resolution PDF.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 relative">
              <span className="text-3xl font-black text-purple-100 absolute top-3 right-4">04</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mb-3">
                4
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">Analyze Skill Gaps</h3>
              <p className="text-xs text-slate-600">
                Discover matching job roles, view missing mandatory skills, and follow your personalized learning roadmap.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TEMPLATE GALLERY */}
      <section id="template-gallery" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-purple-600">Resume Template Gallery</div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Engineered for Recruiters & Hiring Managers
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Choose from 8 distinct layout styles tailored to your industry, seniority, and personal brand.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl">
            {['All', 'Corporate', 'Modern', 'ATS', 'Engineering', 'Academic'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedTemplateFilter(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  selectedTemplateFilter === cat
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredTemplates.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-purple-400 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                    {tpl.category}
                  </span>
                  <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                    {tpl.badge}
                  </span>
                </div>

                <div className={`h-36 rounded-lg bg-slate-50 border-2 ${tpl.color} p-3 flex flex-col justify-center space-y-2 relative overflow-hidden group-hover:bg-purple-50/30 transition-colors`}>
                  <div className="w-1/2 h-2.5 bg-slate-800 rounded-xs"></div>
                  <div className="w-1/3 h-1.5 bg-purple-600 rounded-xs"></div>
                  <div className="space-y-1 pt-2">
                    <div className="w-full h-1 bg-slate-200 rounded-xs"></div>
                    <div className="w-4/5 h-1 bg-slate-200 rounded-xs"></div>
                    <div className="w-2/3 h-1 bg-slate-200 rounded-xs"></div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900">{tpl.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{tpl.desc}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                <button
                  onClick={() => {
                    if (user) {
                      navigateToBuilder();
                    } else {
                      openAuthModal('register');
                    }
                  }}
                  className="flex-1 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-purple-600 rounded-lg transition-colors text-center"
                >
                  Use Template
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. AI CAREER RECOMMENDATIONS HIGHLIGHT */}
      <section id="career-guidance" className="bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white py-16 rounded-3xl mx-4 sm:mx-8 px-6 sm:px-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
              <Compass className="w-3.5 h-3.5" />
              Dynamic Relational Career Matching
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Know your worth. Discover roles that align with your true skillset.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              ResumeCraft doesn't just guess. It extracts your technical proficiencies, parses them against our database of software engineering and tech job specifications, and calculates an objective match score.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-200">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Transparent skill matching algorithm (mandatory vs preferred vs optional)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Gemini 3.8 Flash personalized career synthesis and encouragement
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Admin updates immediately update future recommendation calculations
              </li>
            </ul>

            <button
              onClick={() => {
                if (user) {
                  setActiveView('user');
                  setUserTab('recommendations');
                } else {
                  openAuthModal('register');
                }
              }}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all inline-flex items-center gap-2"
            >
              <span>Explore Your Career Matches</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Role Card Demo */}
          <div className="bg-slate-900/90 border border-purple-500/30 p-6 rounded-2xl shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">Top Match Demo</span>
                <h3 className="text-lg font-bold text-white">Full Stack Developer</h3>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-emerald-400">92%</div>
                <div className="text-[10px] text-slate-400">Skill Alignment</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-300">Matching Skills (7):</div>
              <div className="flex flex-wrap gap-1.5">
                {['JavaScript', 'React.js', 'Node.js', 'Express.js', 'SQL', 'Git', 'RESTful APIs'].map(s => (
                  <span key={s} className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-300">Missing Mandatory / Preferred Skills (2):</div>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-950 text-amber-300 border border-amber-800">
                  ⚠ Docker (Containerization)
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-950 text-amber-300 border border-amber-800">
                  ⚠ AWS Cloud Services
                </span>
              </div>
            </div>

            <div className="p-3 bg-purple-950/40 rounded-xl border border-purple-800/60 text-xs text-purple-200 leading-relaxed italic">
              "Strong technical overlap in modern JavaScript and full-stack API design. Adding Docker containerization will elevate you directly into senior competitive consideration."
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="text-xs font-bold uppercase tracking-widest text-purple-600">Frequently Asked Questions</div>
          <h2 className="text-3xl font-extrabold text-slate-900">Got Questions? We Have Answers.</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-xl overflow-hidden transition-all bg-white"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex justify-between items-center text-sm font-bold text-slate-900 hover:text-purple-600"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-purple-600' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. CTA BANNER */}
      <section className="max-w-5xl mx-auto px-4 text-center">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-800 rounded-3xl p-10 sm:p-14 text-white shadow-xl space-y-4">
          <h2 className="text-3xl sm:text-4xl font-black">
            Ready to Build Your Career-Winning Resume?
          </h2>
          <p className="text-sm text-purple-200 max-w-xl mx-auto">
            Join thousands of developers, freshers, and professionals building ATS-ready resumes with Gemini AI and discovering verified tech career roadmaps.
          </p>
          <div className="pt-4">
            <button
              onClick={() => {
                if (user) navigateToBuilder();
                else openAuthModal('register');
              }}
              className="px-8 py-3.5 bg-white text-slate-900 font-extrabold text-sm rounded-xl shadow-lg hover:bg-purple-50 transition-all cursor-pointer hover:scale-105"
            >
              Get Started for Free
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
