import React from 'react';
import { Resume } from '../../types';
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';

export const CreativeTemplate: React.FC<{ resume: Resume }> = ({ resume }) => {
  const p = resume.personal_info || {};
  const s = resume.skills || {};

  const allSkills = [
    ...(s.programmingLanguages || []),
    ...(s.frameworks || []),
    ...(s.databases || []),
    ...(s.tools || []),
    ...(s.technicalSkills || []),
    ...(s.softSkills || [])
  ];

  return (
    <div className="flex flex-col md:flex-row -mx-8 sm:-mx-12 -my-8 sm:-my-12 min-h-[1050px] text-slate-800">
      {/* Dark Sidebar */}
      <aside className="w-full md:w-72 bg-slate-900 text-slate-100 p-6 sm:p-8 space-y-6 shrink-0">
        <div>
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-400 flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg">
            {p.fullName ? p.fullName.charAt(0).toUpperCase() : 'C'}
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white leading-tight">
            {p.fullName || 'Candidate Name'}
          </h1>
          {resume.target_job_role && (
            <p className="text-xs font-semibold text-purple-400 mt-1 uppercase tracking-wider">
              {resume.target_job_role}
            </p>
          )}
        </div>

        {/* Contact Info */}
        <div className="space-y-2.5 text-xs text-slate-300 border-t border-slate-800 pt-4">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-purple-400">Contact</h2>
          {p.email && <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-purple-400 shrink-0" /><span className="truncate">{p.email}</span></div>}
          {p.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-purple-400 shrink-0" /><span>{p.phone}</span></div>}
          {p.location && <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" /><span>{p.location}</span></div>}
          {p.linkedin && <div className="flex items-center gap-2"><Linkedin className="w-3.5 h-3.5 text-purple-400 shrink-0" /><span className="truncate">{p.linkedin}</span></div>}
          {p.github && <div className="flex items-center gap-2"><Github className="w-3.5 h-3.5 text-purple-400 shrink-0" /><span className="truncate">{p.github}</span></div>}
          {p.portfolio && <div className="flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-purple-400 shrink-0" /><span className="truncate">{p.portfolio}</span></div>}
        </div>

        {/* Skills with Creative Meter */}
        {allSkills.length > 0 && (
          <div className="border-t border-slate-800 pt-4 space-y-2">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-purple-400">Top Skills</h2>
            <div className="space-y-2">
              {allSkills.slice(0, 10).map((skill, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs text-slate-300 mb-0.5">
                    <span>{skill}</span>
                    <span className="text-[10px] text-purple-300 font-mono">{(85 + (idx % 3) * 5)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-indigo-400 h-full rounded-full"
                      style={{ width: `${85 + (idx % 3) * 5}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education in sidebar */}
        {resume.education && resume.education.length > 0 && (
          <div className="border-t border-slate-800 pt-4 space-y-2 text-xs">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-purple-400">Education</h2>
            {resume.education.map((edu, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="font-semibold text-white">{edu.degree}</div>
                {edu.branch && <div className="text-purple-300 text-[11px]">{edu.branch}</div>}
                <div className="text-slate-400 text-[11px]">{edu.institution}</div>
                <div className="text-slate-500 text-[10px]">{edu.graduationYear} {edu.cgpa && `· ${edu.cgpa}`}</div>
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 sm:p-8 space-y-6 bg-white text-[13px] leading-relaxed">
        {/* Summary */}
        {resume.career_summary && (
          <section>
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-900 border-b-2 border-purple-600 pb-1 mb-2">
              About Me
            </h2>
            <p className="text-slate-700 leading-normal text-justify">{resume.career_summary}</p>
          </section>
        )}

        {/* Experience */}
        {resume.experience && resume.experience.length > 0 && (
          <section>
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-900 border-b-2 border-purple-600 pb-1 mb-3">
              Work Experience
            </h2>
            <div className="space-y-4">
              {resume.experience.map((exp, idx) => (
                <div key={idx} className="border-l-2 border-purple-500 pl-3">
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span>{exp.jobTitle}</span>
                    <span className="text-xs font-normal text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                      {exp.duration}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-600 mb-1">{exp.company}</div>
                  {exp.responsibilities && (
                    <p className="text-xs text-slate-700 leading-relaxed">{exp.responsibilities}</p>
                  )}
                  {exp.achievements && (
                    <p className="text-xs text-slate-900 mt-1 font-medium">★ {exp.achievements}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {resume.projects && resume.projects.length > 0 && (
          <section>
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-900 border-b-2 border-purple-600 pb-1 mb-3">
              Key Projects & Portfolio
            </h2>
            <div className="space-y-3.5">
              {resume.projects.map((proj, idx) => (
                <div key={idx} className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-slate-900 text-xs">{proj.title}</h3>
                    {proj.link && (
                      <span className="text-[11px] text-purple-600 font-semibold">{proj.link}</span>
                    )}
                  </div>
                  {proj.technologies && (
                    <div className="text-[11px] font-mono text-purple-700 my-1">{proj.technologies}</div>
                  )}
                  <p className="text-xs text-slate-600">{proj.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {resume.certifications && resume.certifications.length > 0 && (
          <section>
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-900 border-b-2 border-purple-600 pb-1 mb-2">
              Certifications & Awards
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {resume.certifications.map((c, idx) => (
                <div key={idx} className="p-2 bg-purple-50/60 rounded border border-purple-100">
                  <div className="font-semibold text-slate-900">{c.name}</div>
                  <div className="text-[11px] text-slate-500">{c.issuer} ({c.year})</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
