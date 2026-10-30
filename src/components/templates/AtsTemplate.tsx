import React from 'react';
import { Resume } from '../../types';

export const AtsTemplate: React.FC<{ resume: Resume }> = ({ resume }) => {
  const p = resume.personal_info || {};
  const s = resume.skills || {};

  return (
    <div className="text-[13px] leading-relaxed text-black font-sans max-w-full space-y-4">
      {/* Header */}
      <div className="text-center pb-2 border-b border-black">
        <h1 className="text-2xl font-bold uppercase tracking-wider text-black">
          {p.fullName || 'Candidate Name'}
        </h1>
        {resume.target_job_role && (
          <div className="text-sm font-semibold uppercase mt-0.5 text-black">
            {resume.target_job_role}
          </div>
        )}
        <div className="text-xs mt-1 text-black">
          {[p.email, p.phone, p.location, p.linkedin, p.github].filter(Boolean).join(' | ')}
        </div>
      </div>

      {/* Summary */}
      {resume.career_summary && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-1.5 text-black">
            Professional Summary
          </h2>
          <p className="text-xs text-justify">{resume.career_summary}</p>
        </div>
      )}

      {/* Skills */}
      {(s.programmingLanguages?.length || s.frameworks?.length || s.databases?.length || s.tools?.length || s.technicalSkills?.length || s.softSkills?.length) ? (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-1.5 text-black">
            Technical Skills
          </h2>
          <div className="text-xs space-y-1">
            {s.programmingLanguages && s.programmingLanguages.length > 0 && (
              <div><strong>Programming Languages:</strong> {s.programmingLanguages.join(', ')}</div>
            )}
            {s.frameworks && s.frameworks.length > 0 && (
              <div><strong>Frameworks & Libraries:</strong> {s.frameworks.join(', ')}</div>
            )}
            {s.databases && s.databases.length > 0 && (
              <div><strong>Database Technologies:</strong> {s.databases.join(', ')}</div>
            )}
            {s.tools && s.tools.length > 0 && (
              <div><strong>Tools & Platforms:</strong> {s.tools.join(', ')}</div>
            )}
            {s.technicalSkills && s.technicalSkills.length > 0 && (
              <div><strong>Core Engineering Competencies:</strong> {s.technicalSkills.join(', ')}</div>
            )}
            {s.softSkills && s.softSkills.length > 0 && (
              <div><strong>Professional Skills:</strong> {s.softSkills.join(', ')}</div>
            )}
          </div>
        </div>
      ) : null}

      {/* Work Experience */}
      {resume.experience && resume.experience.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-2 text-black">
            Work Experience
          </h2>
          <div className="space-y-3">
            {resume.experience.map((exp, idx) => (
              <div key={idx} className="text-xs space-y-0.5">
                <div className="flex justify-between items-baseline font-bold">
                  <span>{exp.jobTitle} – {exp.company}</span>
                  <span className="font-normal">{exp.duration}</span>
                </div>
                {exp.responsibilities && (
                  <p className="whitespace-pre-line text-black pl-2 border-l border-black/40">{exp.responsibilities}</p>
                )}
                {exp.achievements && (
                  <p className="italic pl-2">Key Achievement: {exp.achievements}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {resume.projects && resume.projects.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-2 text-black">
            Technical Projects
          </h2>
          <div className="space-y-2.5">
            {resume.projects.map((proj, idx) => (
              <div key={idx} className="text-xs">
                <div className="flex justify-between items-baseline font-bold">
                  <span>{proj.title}</span>
                  {proj.link && <span className="font-normal underline">{proj.link}</span>}
                </div>
                {proj.technologies && (
                  <div className="text-[11px] italic">Technologies: {proj.technologies}</div>
                )}
                <p className="mt-0.5">{proj.description}</p>
                {proj.responsibilities && (
                  <p className="text-[11px] text-black/80">Role & Responsibilities: {proj.responsibilities}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {resume.education && resume.education.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-1.5 text-black">
            Education
          </h2>
          <div className="space-y-1.5 text-xs">
            {resume.education.map((edu, idx) => (
              <div key={idx} className="flex justify-between items-baseline">
                <div>
                  <strong>{edu.degree}</strong> {edu.branch && `in ${edu.branch}`}
                  <div>{edu.institution}</div>
                </div>
                <div className="text-right">
                  <div>{edu.graduationYear}</div>
                  {edu.cgpa && <div>CGPA: {edu.cgpa}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {resume.certifications && resume.certifications.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-1.5 text-black">
            Certifications
          </h2>
          <div className="text-xs space-y-0.5">
            {resume.certifications.map((c, idx) => (
              <div key={idx}>
                • {c.name} {c.issuer && `— ${c.issuer}`} {c.year && `(${c.year})`}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
