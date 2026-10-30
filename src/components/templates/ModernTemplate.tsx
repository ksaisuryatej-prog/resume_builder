import React from 'react';
import { Resume } from '../../types';
import { Mail, Phone, MapPin, Globe, Linkedin, Github, Award, Briefcase, GraduationCap, Code } from 'lucide-react';

export const ModernTemplate: React.FC<{ resume: Resume }> = ({ resume }) => {
  const p = resume.personal_info || {};
  const s = resume.skills || {};

  return (
    <div className="space-y-6 text-[13px] leading-relaxed text-slate-700 font-sans">
      {/* Modern Gradient Banner Header */}
      <header className="bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-800 -mx-8 sm:-mx-12 -mt-8 sm:-mt-12 p-8 text-white rounded-t-sm">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              {p.fullName || 'Candidate Name'}
            </h1>
            {resume.target_job_role && (
              <p className="text-sm font-semibold tracking-wide text-purple-200 mt-1 uppercase">
                {resume.target_job_role}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:items-end gap-1 text-xs text-purple-100">
            {p.email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-purple-300" />{p.email}</span>}
            {p.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-purple-300" />{p.phone}</span>}
            {p.location && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-purple-300" />{p.location}</span>}
          </div>
        </div>

        {/* Links row */}
        {(p.linkedin || p.github || p.portfolio) && (
          <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-purple-500/30 text-xs text-purple-200">
            {p.linkedin && <span className="flex items-center gap-1"><Linkedin className="w-3 h-3" />{p.linkedin}</span>}
            {p.github && <span className="flex items-center gap-1"><Github className="w-3 h-3" />{p.github}</span>}
            {p.portfolio && <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{p.portfolio}</span>}
          </div>
        )}
      </header>

      {/* Summary Card */}
      {resume.career_summary && (
        <section className="bg-slate-50 border border-slate-200/80 rounded-lg p-4 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-purple-900 mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-600 inline-block"></span>
            Professional Summary
          </h2>
          <p className="text-slate-700 text-justify">{resume.career_summary}</p>
        </section>
      )}

      {/* Skills Badges */}
      {(s.programmingLanguages?.length || s.frameworks?.length || s.databases?.length || s.tools?.length || s.technicalSkills?.length) ? (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
            <Code className="w-4 h-4 text-purple-600" />
            Skills & Technology Stack
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {[
              ...(s.programmingLanguages || []),
              ...(s.frameworks || []),
              ...(s.databases || []),
              ...(s.tools || []),
              ...(s.technicalSkills || []),
              ...(s.softSkills || [])
            ].map((skill, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-800 border border-purple-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {/* Experience Timeline */}
      {resume.experience && resume.experience.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-purple-600" />
            Work Experience
          </h2>
          <div className="border-l-2 border-purple-200 ml-2 pl-4 space-y-4">
            {resume.experience.map((exp, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-purple-600 border-2 border-white"></div>
                <div className="flex flex-wrap justify-between items-baseline">
                  <h3 className="font-bold text-slate-900 text-sm">{exp.jobTitle}</h3>
                  <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                    {exp.duration}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-600">{exp.company}</p>
                {exp.responsibilities && (
                  <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">{exp.responsibilities}</p>
                )}
                {exp.achievements && (
                  <p className="text-xs text-purple-950 font-medium mt-1">
                    🎯 Impact: {exp.achievements}
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
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-600" />
            Featured Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {resume.projects.map((proj, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg hover:border-purple-300 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-slate-900 text-xs">{proj.title}</h3>
                </div>
                {proj.technologies && (
                  <div className="text-[11px] font-semibold text-purple-700 mb-1">{proj.technologies}</div>
                )}
                <p className="text-xs text-slate-600 mb-2">{proj.description}</p>
                {proj.link && (
                  <a href={proj.link} target="_blank" rel="noreferrer" className="text-[11px] text-purple-600 font-medium hover:underline break-all">
                    🔗 View Project
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education & Certs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {resume.education && resume.education.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-purple-600" />
              Education
            </h2>
            <div className="space-y-2">
              {resume.education.map((edu, idx) => (
                <div key={idx} className="bg-slate-50 p-2.5 rounded border border-slate-100">
                  <div className="font-bold text-xs text-slate-900">{edu.degree} {edu.branch && `– ${edu.branch}`}</div>
                  <div className="text-xs text-slate-600">{edu.institution}</div>
                  <div className="text-[11px] text-purple-700 mt-0.5 flex justify-between">
                    <span>Graduated: {edu.graduationYear}</span>
                    {edu.cgpa && <span>GPA: {edu.cgpa}</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {resume.certifications && resume.certifications.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              Certifications & Credentials
            </h2>
            <ul className="space-y-1.5 text-xs">
              {resume.certifications.map((c, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="text-purple-600 font-bold">•</span>
                  <div>
                    <div className="font-semibold text-slate-900">{c.name}</div>
                    <div className="text-[11px] text-slate-500">{c.issuer} {c.year && `(${c.year})`}</div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};
