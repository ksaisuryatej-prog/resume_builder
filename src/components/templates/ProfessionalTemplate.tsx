import React from 'react';
import { Resume } from '../../types';
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';

export const ProfessionalTemplate: React.FC<{ resume: Resume }> = ({ resume }) => {
  const p = resume.personal_info || {};
  const s = resume.skills || {};

  return (
    <div className="space-y-6 text-[13px] leading-relaxed text-slate-700">
      {/* Header */}
      <header className="border-b-2 border-slate-900 pb-5 text-center">
        <h1 className="text-3xl font-bold uppercase tracking-wider text-slate-900 font-serif">
          {p.fullName || 'Candidate Name'}
        </h1>
        {resume.target_job_role && (
          <p className="text-base font-medium tracking-wide text-indigo-900 mt-1 uppercase">
            {resume.target_job_role}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 mt-3 text-xs text-slate-600 font-sans">
          {p.email && (
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-800" />
              {p.email}
            </span>
          )}
          {p.phone && (
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-800" />
              {p.phone}
            </span>
          )}
          {p.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-800" />
              {p.location}
            </span>
          )}
          {p.linkedin && (
            <span className="flex items-center gap-1.5">
              <Linkedin className="w-3.5 h-3.5 text-slate-800" />
              {p.linkedin}
            </span>
          )}
          {p.github && (
            <span className="flex items-center gap-1.5">
              <Github className="w-3.5 h-3.5 text-slate-800" />
              {p.github}
            </span>
          )}
          {p.portfolio && (
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-800" />
              {p.portfolio}
            </span>
          )}
        </div>
      </header>

      {/* Summary */}
      {resume.career_summary && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2 font-serif">
            Professional Summary
          </h2>
          <p className="text-justify text-slate-700 leading-normal">{resume.career_summary}</p>
        </section>
      )}

      {/* Skills */}
      {(s.programmingLanguages?.length || s.frameworks?.length || s.databases?.length || s.tools?.length || s.technicalSkills?.length || s.softSkills?.length) ? (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2 font-serif">
            Core Competencies & Technical Skills
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
            {s.programmingLanguages && s.programmingLanguages.length > 0 && (
              <div>
                <span className="font-semibold text-slate-900">Languages: </span>
                <span>{s.programmingLanguages.join(', ')}</span>
              </div>
            )}
            {s.frameworks && s.frameworks.length > 0 && (
              <div>
                <span className="font-semibold text-slate-900">Frameworks & Libraries: </span>
                <span>{s.frameworks.join(', ')}</span>
              </div>
            )}
            {s.databases && s.databases.length > 0 && (
              <div>
                <span className="font-semibold text-slate-900">Databases: </span>
                <span>{s.databases.join(', ')}</span>
              </div>
            )}
            {s.tools && s.tools.length > 0 && (
              <div>
                <span className="font-semibold text-slate-900">Developer Tools: </span>
                <span>{s.tools.join(', ')}</span>
              </div>
            )}
            {s.technicalSkills && s.technicalSkills.length > 0 && (
              <div>
                <span className="font-semibold text-slate-900">Specializations: </span>
                <span>{s.technicalSkills.join(', ')}</span>
              </div>
            )}
            {s.softSkills && s.softSkills.length > 0 && (
              <div>
                <span className="font-semibold text-slate-900">Professional Skills: </span>
                <span>{s.softSkills.join(', ')}</span>
              </div>
            )}
          </div>
        </section>
      ) : null}

      {/* Experience */}
      {resume.experience && resume.experience.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-3 font-serif">
            Professional Experience
          </h2>
          <div className="space-y-4">
            {resume.experience.map((exp, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-baseline font-semibold text-slate-900">
                  <span className="text-sm font-serif">{exp.jobTitle}</span>
                  <span className="text-xs font-normal text-slate-600">{exp.duration}</span>
                </div>
                <div className="text-xs italic text-indigo-950 font-medium">{exp.company}</div>
                {exp.responsibilities && (
                  <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">{exp.responsibilities}</p>
                )}
                {exp.achievements && (
                  <p className="text-xs text-slate-700 mt-1">
                    <strong className="text-slate-900 font-semibold">Key Impact:</strong> {exp.achievements}
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
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-3 font-serif">
            Key Projects
          </h2>
          <div className="space-y-3.5">
            {resume.projects.map((proj, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-slate-900 text-sm font-serif">{proj.title}</span>
                  {proj.link && (
                    <span className="text-xs text-indigo-700 underline break-all">{proj.link}</span>
                  )}
                </div>
                {proj.technologies && (
                  <p className="text-xs text-slate-500 font-mono">Tech Stack: {proj.technologies}</p>
                )}
                <p className="text-xs text-slate-700 leading-relaxed">{proj.description}</p>
                {proj.responsibilities && (
                  <p className="text-xs text-slate-600 italic">Contributions: {proj.responsibilities}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {resume.education && resume.education.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2 font-serif">
            Education
          </h2>
          <div className="space-y-2">
            {resume.education.map((edu, idx) => (
              <div key={idx} className="flex justify-between items-baseline text-xs">
                <div>
                  <span className="font-semibold text-slate-900">{edu.degree}</span>
                  {edu.branch && <span className="text-slate-700"> in {edu.branch}</span>}
                  <div className="text-slate-600">{edu.institution}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-slate-800">{edu.graduationYear}</div>
                  {edu.cgpa && <div className="text-slate-500">CGPA / %: {edu.cgpa}</div>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications & Additional */}
      {((resume.certifications && resume.certifications.length > 0) || (resume.additional_sections?.languages?.length)) ? (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {resume.certifications && resume.certifications.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2 font-serif">
                Certifications
              </h2>
              <ul className="list-disc list-inside text-xs space-y-1 text-slate-700">
                {resume.certifications.map((c, idx) => (
                  <li key={idx}>
                    <span className="font-medium text-slate-900">{c.name}</span>
                    {c.issuer && <span className="text-slate-500"> – {c.issuer}</span>}
                    {c.year && <span className="text-slate-400"> ({c.year})</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {resume.additional_sections?.languages && resume.additional_sections.languages.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2 font-serif">
                Languages & Honors
              </h2>
              <div className="text-xs text-slate-700 space-y-1">
                <div>
                  <strong className="text-slate-900">Languages:</strong>{' '}
                  {resume.additional_sections.languages.join(', ')}
                </div>
                {resume.additional_sections.awards && resume.additional_sections.awards.length > 0 && (
                  <div>
                    <strong className="text-slate-900">Awards:</strong>{' '}
                    {resume.additional_sections.awards.join(', ')}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
};
