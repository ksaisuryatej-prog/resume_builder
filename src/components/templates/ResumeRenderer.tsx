import React from 'react';
import { Resume } from '../../types';
import { ProfessionalTemplate } from './ProfessionalTemplate';
import { ModernTemplate } from './ModernTemplate';
import { MinimalTemplate } from './MinimalTemplate';
import { CreativeTemplate } from './CreativeTemplate';
import { AtsTemplate } from './AtsTemplate';
import { FresherTemplate } from './FresherTemplate';
import { TechDeveloperTemplate } from './TechDeveloperTemplate';
import { ExecutiveTemplate } from './ExecutiveTemplate';

interface ResumeRendererProps {
  resume: Resume;
  templateId?: string;
  isPrintMode?: boolean;
}

export const ResumeRenderer: React.FC<ResumeRendererProps> = ({
  resume,
  templateId,
  isPrintMode = false,
}) => {
  const currentTemplate = templateId || resume.template_id || 'professional';

  const renderTemplate = () => {
    switch (currentTemplate) {
      case 'modern':
        return <ModernTemplate resume={resume} />;
      case 'minimal':
        return <MinimalTemplate resume={resume} />;
      case 'creative':
        return <CreativeTemplate resume={resume} />;
      case 'ats_friendly':
        return <AtsTemplate resume={resume} />;
      case 'fresher':
        return <FresherTemplate resume={resume} />;
      case 'tech_developer':
        return <TechDeveloperTemplate resume={resume} />;
      case 'executive':
        return <ExecutiveTemplate resume={resume} />;
      case 'professional':
      default:
        return <ProfessionalTemplate resume={resume} />;
    }
  };

  return (
    <div
      id="resume-preview-document"
      className={`bg-white shadow-2xl rounded-sm print:shadow-none print:rounded-none mx-auto w-full max-w-[800px] min-h-[1050px] text-slate-800 transition-all duration-300 ${
        isPrintMode ? 'p-0' : 'p-8 sm:p-12'
      }`}
    >
      {renderTemplate()}
    </div>
  );
};
