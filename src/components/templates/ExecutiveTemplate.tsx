import React from 'react';
import { Resume } from '../../types';

export const ExecutiveTemplate: React.FC<{ resume: Resume }> = ({ resume }) => {
  const p = resume.personal_info || {};
  const s = resume.skills || {};

  return (
    <div className="space-y-6 text-[13px] leading-relaxed text-slate-800 font-serif">
      {/* Header */}
      <header className="border-b-2 border-slate-900 pb-4 text-center">
        <h1 className="text-3xl font-bold tracking-widest text-slate-950 uppercase font-serif">
          {p.fullName || 'Executive Candidate'}
        </h1>
        {resume.target_job_role && (
          <p className="text-xs font-sans font-semibold tracking-widest text-slate-600 mt-1 uppercase">
            {resume.target_job_role}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-x-5 text-xs text-slate-600 mt-2.5 font-sans">
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>• {p.phone}</span>}
          {p.location && <span>• {p.location}</span>}
          {p.linkedin && <span>• {p.linkedin}</span>}
        </div>
      </header>

      {/* Executive Summary */}
      {resume.career_summary && (
        <section>
          <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">
            Executive Summary
          </h2>
          <p className="text-justify text-slate-800 leading-relaxed italic">{resume.career_summary}</p>
        </section>
      )}

      {/* Core Competencies Matrix */}
      {(s.technicalSkills?.length || s.softSkills?.length || s.frameworks?.length || s.programmingLanguages?.length) ? (
        <section>
          <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">
            Executive Competencies & Strategic Capabilities
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs font-sans">
            {[
              ...(s.technicalSkills || []),
              ...(s.softSkills || []),
              ...(s.frameworks || []),
              ...(s.programmingLanguages || [])
            ].slice(0, 12).map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Career History */}
      {resume.experience && resume.experience.length > 0 && (
        <section>
          <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-3">
            Professional Experience & Strategic Milestones
          </h2>
          <div className="space-y-4">
            {resume.experience.map((exp, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-baseline font-bold text-slate-900 text-sm">
                  <span>{exp.jobTitle}</span>
                  <span className="text-xs font-sans font-normal text-slate-600">{exp.duration}</span>
                </div>
                <div className="text-xs font-semibold text-slate-700">{exp.company}</div>
                {exp.responsibilities && (
                  <p className="text-xs text-slate-700 leading-relaxed font-sans">{exp.responsibilities}</p>
                )}
                {exp.achievements && (
                  <p className="text-xs text-slate-900 mt-1 font-sans">
                    <strong>Organizational Impact:</strong> {exp.achievements}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Key Initiatives / Projects */}
      {resume.projects && resume.projects.length > 0 && (
        <section>
          <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-3">
            Strategic Programs & Systems
          </h2>
          <div className="space-y-3 font-sans">
            {resume.projects.map((proj, idx) => (
              <div key={idx} className="space-y-0.5 text-xs">
                <div className="flex justify-between items-baseline font-bold text-slate-900">
                  <span>{proj.title}</span>
                  {proj.link && <span className="text-indigo-800">{proj.link}</span>}
                </div>
                {proj.technologies && (
                  <div className="text-[11px] text-slate-500 italic">Scope: {proj.technologies}</div>
                )}
                <p className="text-slate-700">{proj.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education & Credentials */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 font-sans text-xs">
        {resume.education && resume.education.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">
              Education & Degrees
            </h2>
            {resume.education.map((edu, idx) => (
              <div key={idx} className="mb-2">
                <div className="font-bold text-slate-900">{edu.degree} {edu.branch && `– ${edu.branch}`}</div>
                <div className="text-slate-600">{edu.institution} ({edu.graduationYear})</div>
              </div>
            ))}
          </div>
        )}

        {resume.certifications && resume.certifications.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">
              Certifications & Leadership Credentials
            </h2>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              {resume.certifications.map((c, idx) => (
                <li key={idx}>{c.name} {c.issuer && `— ${c.issuer}`}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
