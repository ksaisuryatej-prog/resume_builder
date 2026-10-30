import React from 'react';
import { FileText, Sparkles, Database, Shield, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-900 to-purple-600 flex items-center justify-center text-white">
                <FileText className="w-4 h-4 text-purple-300" />
              </div>
              <span className="font-bold text-lg text-white">Resume<span className="text-purple-400">Craft</span></span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              "Build Your Future, One Resume at a Time."
            </p>
            <p className="text-xs text-slate-500">
              AI-Powered Resume Generation and Intelligent Career Recommendation System.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Platform</h4>
            <ul className="text-xs space-y-2">
              <li><a href="#templates" className="hover:text-purple-400 transition-colors">8 Professional Templates</a></li>
              <li><a href="#features" className="hover:text-purple-400 transition-colors">AI Content Optimizer</a></li>
              <li><a href="#career-guidance" className="hover:text-purple-400 transition-colors">Dynamic Job Match Engine</a></li>
              <li><a href="#features" className="hover:text-purple-400 transition-colors">Skill Gap Analysis</a></li>
              <li><a href="#features" className="hover:text-purple-400 transition-colors">Personalized Roadmap</a></li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Architecture</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                <span>Google Gemini 3.8 Flash AI</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Database className="w-3.5 h-3.5 text-blue-400" />
                <span>MySQL Relational Database</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Bcrypt & RBAC Security</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Client-Side Crisp PDF Export</span>
              </div>
            </div>
          </div>

          {/* Quick Info */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Standards</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Compliant with ATS machine parsers, industry career rubrics, and modern software engineering requirements.
            </p>
            <div className="text-[11px] text-slate-500">
              Local environment ready for VS Code, Node.js, Express, and MySQL.
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} ResumeCraft. All rights reserved.
          </div>
          <div className="flex items-center gap-4 mt-2 sm:mt-0">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
