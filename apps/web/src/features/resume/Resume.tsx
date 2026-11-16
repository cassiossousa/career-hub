import { useMemo, useRef } from 'react';
import { content } from 'virtual:portfolio-content';
import { useTranslation } from '../../i18n/provider';
import { getProjects } from '../../services/projects/getProjects';
import { renderResumeData } from '../../services/resume/renderResumeData';
import { renderResumeHtml } from '../../services/resume/renderResumeHtml';
import { mapContentToWorkRoles } from '../../services/work-experience/workModel';

export default function Resume() {
  const { locale, messages: t } = useTranslation();
  const resumeRef = useRef<HTMLIFrameElement>(null);
  const resumeHtml = useMemo(() => {
    const roles = mapContentToWorkRoles(content[locale].workExperience, t);
    const projects = getProjects(locale).filter((project) =>
      project.topics?.includes('resume'),
    );
    return renderResumeHtml(renderResumeData(roles, t), projects, t);
  }, [locale, t]);

  return (
    <section className="container-main">
      <div className="mb-6 flex items-center justify-between gap-4 print:hidden">
        <h1 className="text-3xl font-bold">{t.resume.title}</h1>
        <button
          type="button"
          className="button-primary"
          onClick={() => resumeRef.current?.contentWindow?.print()}
        >
          Print / Save as PDF
        </button>
      </div>
      <iframe
        ref={resumeRef}
        title={t.resume.title}
        srcDoc={resumeHtml}
        className="h-[75vh] w-full border bg-white"
      />
      <p className="mt-3 text-sm print:hidden">
        Use your browser&apos;s print dialog to print or save this resume as
        PDF.
      </p>
    </section>
  );
}
