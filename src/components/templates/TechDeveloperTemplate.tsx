import React from 'react';
import { Resume } from '../../types';
import { Terminal, Github, Globe, Linkedin, Mail, MapPin } from 'lucide-react';

export const TechDeveloperTemplate: React.FC<{ resume: Resume }> = ({ resume }) => {
  const p = resume.personal_info || {};
  const s = resume.skills || {};

  return (
    <div className="space-y-6 text-[13px] leading-relaxed text-slate-800 font-sans">
      {/* Terminal Style Header */}
      <header className="bg-slate-950 text-slate-100 p-6 rounded-lg font-mono border-2 border-slate-800 shadow-md">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800 text-xs text-slate-400">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
          <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span>
          <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
          <span className="ml-2 flex items-center gap-1 text-slate-400">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            developer.resume --target={resume.target_job_role ? `"${resume.target_job_role}"` : '"engineer"'}
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight font-mono">
              &gt; {p.fullName || 'Developer Name'}
            </h1>
            <p className="text-xs text-emerald-400 font-semibold mt-0.5">
              // {resume.target_job_role || 'Full Stack Engineer'}
            </p>
          </div>
          <div className="text-xs text-slate-300 space-y-1">
            {p.email && <div className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-emerald-400" /> {p.email}</div>}
            {p.location && <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-emerald-400" /> {p.location}</div>}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-300">
          {p.github && <span className="flex items-center gap-1 text-emerald-300"><Github className="w-3 h-3" /> {p.github}</span>}
          {p.linkedin && <span className="flex items-center gap-1"><Linkedin className="w-3 h-3" /> {p.linkedin}</span>}
          {p.portfolio && <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {p.portfolio}</span>}
        </div>
      </header>

      {/* Summary */}
      {resume.career_summary && (
        <section>
          <div className="font-mono text-xs font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2 uppercase flex items-center gap-1">
            <span className="text-emerald-600 font-mono">#</span> Developer Profile & System Philosophy
          </div>
          <p className="text-slate-700 leading-normal text-justify">{resume.career_summary}</p>
        </section>
      )}

      {/* Technical Stack Grid */}
      {(s.programmingLanguages?.length || s.frameworks?.length || s.databases?.length || s.tools?.length) ? (
        <section>
          <div className="font-mono text-xs font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2.5 uppercase flex items-center gap-1">
            <span className="text-emerald-600 font-mono">#</span> Tech Stack Matrix
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            {s.programmingLanguages && s.programmingLanguages.length > 0 && (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                <span className="text-emerald-700 font-bold block mb-1">languages:</span>
                <div className="flex flex-wrap gap-1">
                  {s.programmingLanguages.map((l, i) => (
                    <span key={i} className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">{l}</span>
                  ))}
                </div>
              </div>
            )}
            {s.frameworks && s.frameworks.length > 0 && (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                <span className="text-indigo-700 font-bold block mb-1">frameworks:</span>
                <div className="flex flex-wrap gap-1">
                  {s.frameworks.map((f, i) => (
                    <span key={i} className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">{f}</span>
                  ))}
                </div>
              </div>
            )}
            {s.databases && s.databases.length > 0 && (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                <span className="text-purple-700 font-bold block mb-1">databases:</span>
                <div className="flex flex-wrap gap-1">
                  {s.databases.map((d, i) => (
                    <span key={i} className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">{d}</span>
                  ))}
                </div>
              </div>
            )}
            {s.tools && s.tools.length > 0 && (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-700 font-bold block mb-1">devtools_and_cloud:</span>
                <div className="flex flex-wrap gap-1">
                  {s.tools.map((t, i) => (
                    <span key={i} className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      ) : null}

      {/* Experience */}
      {resume.experience && resume.experience.length > 0 && (
        <section>
          <div className="font-mono text-xs font-bold text-slate-900 border-b border-slate-300 pb-1 mb-3 uppercase flex items-center gap-1">
            <span className="text-emerald-600 font-mono">#</span> Engineering Experience
          </div>
          <div className="space-y-4">
            {resume.experience.map((exp, idx) => (
              <div key={idx} className="border-l-2 border-emerald-500 pl-3 space-y-1">
                <div className="flex justify-between items-baseline font-bold text-slate-900 text-xs">
                  <span>{exp.jobTitle} @ <span className="text-emerald-700">{exp.company}</span></span>
                  <span className="font-mono text-slate-500">{exp.duration}</span>
                </div>
                {exp.responsibilities && (
                  <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">{exp.responsibilities}</p>
                )}
                {exp.achievements && (
                  <p className="text-xs text-slate-900 font-mono mt-1 bg-emerald-50/60 p-1.5 rounded border border-emerald-100">
                    &gt; metrics: {exp.achievements}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {resume.projects && resume.projects.length > 0 && (
        <section>
          <div className="font-mono text-xs font-bold text-slate-900 border-b border-slate-300 pb-1 mb-3 uppercase flex items-center gap-1">
            <span className="text-emerald-600 font-mono">#</span> Repositories & Implementations
          </div>
          <div className="space-y-3">
            {resume.projects.map((proj, idx) => (
              <div key={idx} className="bg-slate-50 p-3 rounded border border-slate-200">
                <div className="flex justify-between items-baseline font-mono text-xs">
                  <span className="font-bold text-slate-900">{proj.title}</span>
                  {proj.link && (
                    <a href={proj.link} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">
                      [view_code]
                    </a>
                  )}
                </div>
                {proj.technologies && (
                  <div className="text-[11px] font-mono text-slate-500 my-1">
                    stack: [{proj.technologies}]
                  </div>
                )}
                <p className="text-xs text-slate-700">{proj.description}</p>
                {proj.responsibilities && (
                  <p className="text-xs text-slate-600 mt-1 italic">// {proj.responsibilities}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education & Certifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 font-mono text-xs">
        {resume.education && resume.education.length > 0 && (
          <div>
            <div className="font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2 uppercase">
              # Education
            </div>
            {resume.education.map((edu, idx) => (
              <div key={idx} className="mb-2">
                <div className="font-semibold text-slate-900">{edu.degree}</div>
                <div className="text-slate-600">{edu.branch}</div>
                <div className="text-slate-500">{edu.institution} ({edu.graduationYear})</div>
              </div>
            ))}
          </div>
        )}

        {resume.certifications && resume.certifications.length > 0 && (
          <div>
            <div className="font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2 uppercase">
              # Credentials
            </div>
            {resume.certifications.map((c, idx) => (
              <div key={idx} className="mb-1.5 text-slate-700">
                • {c.name} ({c.year})
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
