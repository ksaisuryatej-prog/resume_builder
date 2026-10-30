import React from 'react';
import { Resume } from '../../types';

export const MinimalTemplate: React.FC<{ resume: Resume }> = ({ resume }) => {
  const p = resume.personal_info || {};
  const s = resume.skills || {};

  return (
    <div className="space-y-6 text-[13px] leading-relaxed text-slate-800 font-sans tracking-tight">
      {/* Header */}
      <header className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-light tracking-wide text-slate-950 uppercase">
          {p.fullName || 'Candidate Name'}
        </h1>
        {resume.target_job_role && (
          <p className="text-xs font-medium tracking-widest text-slate-500 uppercase mt-0.5">
            {resume.target_job_role}
          </p>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-2 font-mono">
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>/ {p.phone}</span>}
          {p.location && <span>/ {p.location}</span>}
          {p.linkedin && <span>/ {p.linkedin}</span>}
          {p.github && <span>/ {p.github}</span>}
        </div>
      </header>

      {/* Summary */}
      {resume.career_summary && (
        <section>
          <h2 className="text-[11px] font-semibold tracking-widest uppercase text-slate-400 mb-1.5">
            Overview
          </h2>
          <p className="text-slate-700 leading-normal">{resume.career_summary}</p>
        </section>
      )}

      {/* Skills */}
      {(s.programmingLanguages?.length || s.frameworks?.length || s.databases?.length || s.tools?.length || s.technicalSkills?.length) ? (
        <section>
          <h2 className="text-[11px] font-semibold tracking-widest uppercase text-slate-400 mb-1.5">
            Skills
          </h2>
          <p className="text-xs text-slate-700">
            {[
              ...(s.programmingLanguages || []),
              ...(s.frameworks || []),
              ...(s.databases || []),
              ...(s.tools || []),
              ...(s.technicalSkills || []),
              ...(s.softSkills || [])
            ].join('  ·  ')}
          </p>
        </section>
      ) : null}

      {/* Experience */}
      {resume.experience && resume.experience.length > 0 && (
        <section>
          <h2 className="text-[11px] font-semibold tracking-widest uppercase text-slate-400 mb-2">
            Experience
          </h2>
          <div className="space-y-4">
            {resume.experience.map((exp, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-slate-900">{exp.jobTitle}</span>
                  <span className="text-xs font-mono text-slate-400">{exp.duration}</span>
                </div>
                <div className="text-xs text-slate-500">{exp.company}</div>
                {exp.responsibilities && (
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">{exp.responsibilities}</p>
                )}
                {exp.achievements && (
                  <p className="text-xs text-slate-600 italic mt-0.5">Focus: {exp.achievements}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {resume.projects && resume.projects.length > 0 && (
        <section>
          <h2 className="text-[11px] font-semibold tracking-widest uppercase text-slate-400 mb-2">
            Selected Projects
          </h2>
          <div className="space-y-3">
            {resume.projects.map((proj, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-baseline">
                  <span className="font-medium text-slate-900">{proj.title}</span>
                  {proj.link && <span className="text-xs font-mono text-slate-400">{proj.link}</span>}
                </div>
                {proj.technologies && (
                  <div className="text-[11px] text-slate-400 font-mono">{proj.technologies}</div>
                )}
                <p className="text-xs text-slate-600 mt-0.5">{proj.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {resume.education && resume.education.length > 0 && (
        <section>
          <h2 className="text-[11px] font-semibold tracking-widest uppercase text-slate-400 mb-2">
            Education
          </h2>
          <div className="space-y-2">
            {resume.education.map((edu, idx) => (
              <div key={idx} className="flex justify-between items-baseline text-xs">
                <div>
                  <span className="font-medium text-slate-900">{edu.degree}</span>
                  {edu.branch && <span className="text-slate-600">, {edu.branch}</span>}
                  <div className="text-slate-500">{edu.institution}</div>
                </div>
                <div className="text-right font-mono text-slate-400">
                  {edu.graduationYear}
                  {edu.cgpa && <div>{edu.cgpa}</div>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {resume.certifications && resume.certifications.length > 0 && (
        <section>
          <h2 className="text-[11px] font-semibold tracking-widest uppercase text-slate-400 mb-1.5">
            Certifications
          </h2>
          <div className="text-xs text-slate-600 space-y-0.5">
            {resume.certifications.map((c, idx) => (
              <div key={idx}>
                {c.name} {c.issuer && `— ${c.issuer}`} {c.year && `(${c.year})`}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
