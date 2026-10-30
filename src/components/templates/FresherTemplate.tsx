import React from 'react';
import { Resume } from '../../types';
import { Mail, Phone, MapPin, Globe, Linkedin, Github, GraduationCap, Award, BookOpen } from 'lucide-react';

export const FresherTemplate: React.FC<{ resume: Resume }> = ({ resume }) => {
  const p = resume.personal_info || {};
  const s = resume.skills || {};

  return (
    <div className="space-y-5 text-[13px] leading-relaxed text-slate-800 font-sans">
      {/* Header */}
      <header className="border-b-4 border-indigo-600 pb-4 text-center">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          {p.fullName || 'Candidate Name'}
        </h1>
        {resume.target_job_role && (
          <p className="text-sm font-bold text-indigo-700 tracking-wide mt-0.5 uppercase">
            Aspiring {resume.target_job_role}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-2 font-medium">
          {p.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-indigo-600" />{p.email}</span>}
          {p.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-indigo-600" />{p.phone}</span>}
          {p.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-indigo-600" />{p.location}</span>}
          {p.linkedin && <span className="flex items-center gap-1"><Linkedin className="w-3.5 h-3.5 text-indigo-600" />{p.linkedin}</span>}
          {p.github && <span className="flex items-center gap-1"><Github className="w-3.5 h-3.5 text-indigo-600" />{p.github}</span>}
          {p.portfolio && <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-indigo-600" />{p.portfolio}</span>}
        </div>
      </header>

      {/* Career Objective */}
      {(resume.career_objective || resume.career_summary) && (
        <section className="bg-indigo-50/60 p-3.5 rounded-md border border-indigo-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-1 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            Career Objective
          </h2>
          <p className="text-xs text-slate-700 leading-normal">
            {resume.career_objective || resume.career_summary}
          </p>
        </section>
      )}

      {/* Education (Placed First for Freshers) */}
      {resume.education && resume.education.length > 0 && (
        <section>
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b-2 border-indigo-600 pb-1 mb-2.5 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            Academic Background & Education
          </h2>
          <div className="space-y-3">
            {resume.education.map((edu, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded">
                <div className="flex justify-between items-baseline font-bold text-slate-900 text-xs">
                  <span>{edu.degree} {edu.branch && `– ${edu.branch}`}</span>
                  <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-mono">
                    Class of {edu.graduationYear}
                  </span>
                </div>
                <div className="text-xs text-slate-600 font-medium">{edu.institution}</div>
                {edu.cgpa && (
                  <div className="text-xs font-semibold text-slate-800 mt-1">
                    Academic Score: <span className="text-indigo-700">{edu.cgpa}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Academic & Personal Projects */}
      {resume.projects && resume.projects.length > 0 && (
        <section>
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b-2 border-indigo-600 pb-1 mb-2.5 flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-600" />
            Academic & Capstone Projects
          </h2>
          <div className="space-y-3">
            {resume.projects.map((proj, idx) => (
              <div key={idx} className="border-l-3 border-indigo-500 pl-3">
                <div className="flex justify-between items-baseline font-bold text-slate-900 text-xs">
                  <span>{proj.title}</span>
                  {proj.link && <span className="text-[11px] text-indigo-600 font-semibold">{proj.link}</span>}
                </div>
                {proj.technologies && (
                  <div className="text-[11px] font-mono text-indigo-800 my-0.5">Technologies: {proj.technologies}</div>
                )}
                <p className="text-xs text-slate-700">{proj.description}</p>
                {proj.responsibilities && (
                  <p className="text-xs text-slate-600 italic mt-0.5">Key Learnings & Impact: {proj.responsibilities}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Technical Skills */}
      {(s.programmingLanguages?.length || s.frameworks?.length || s.databases?.length || s.tools?.length || s.softSkills?.length) ? (
        <section>
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b-2 border-indigo-600 pb-1 mb-2">
            Technical & Interpersonal Skills
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {s.programmingLanguages && s.programmingLanguages.length > 0 && (
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="font-bold text-slate-900">Languages: </span>
                <span>{s.programmingLanguages.join(', ')}</span>
              </div>
            )}
            {s.frameworks && s.frameworks.length > 0 && (
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="font-bold text-slate-900">Frameworks: </span>
                <span>{s.frameworks.join(', ')}</span>
              </div>
            )}
            {s.databases && s.databases.length > 0 && (
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="font-bold text-slate-900">Databases: </span>
                <span>{s.databases.join(', ')}</span>
              </div>
            )}
            {s.tools && s.tools.length > 0 && (
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="font-bold text-slate-900">Developer Tools: </span>
                <span>{s.tools.join(', ')}</span>
              </div>
            )}
          </div>
        </section>
      ) : null}

      {/* Internships / Experience */}
      {resume.experience && resume.experience.length > 0 && (
        <section>
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b-2 border-indigo-600 pb-1 mb-2.5">
            Internships & Work Experience
          </h2>
          <div className="space-y-3">
            {resume.experience.map((exp, idx) => (
              <div key={idx} className="space-y-0.5 text-xs">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{exp.jobTitle} – {exp.company}</span>
                  <span className="font-mono text-indigo-700">{exp.duration}</span>
                </div>
                <p className="text-slate-700">{exp.responsibilities}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications & Extracurricular */}
      {((resume.certifications && resume.certifications.length > 0) || (resume.additional_sections?.extracurricular?.length)) ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {resume.certifications && resume.certifications.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-1.5">
                Certifications
              </h3>
              <ul className="list-disc list-inside text-xs space-y-1 text-slate-700">
                {resume.certifications.map((c, idx) => (
                  <li key={idx}><span className="font-semibold">{c.name}</span> {c.issuer && `(${c.issuer})`}</li>
                ))}
              </ul>
            </div>
          )}

          {resume.additional_sections?.extracurricular && resume.additional_sections.extracurricular.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-1.5">
                Extracurricular & Leadership
              </h3>
              <ul className="list-disc list-inside text-xs space-y-1 text-slate-700">
                {resume.additional_sections.extracurricular.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
