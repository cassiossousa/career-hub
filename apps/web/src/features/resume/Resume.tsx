import { useMemo } from 'react';
import { content } from 'virtual:portfolio-content';
import { useTranslation } from '../../i18n/provider';
import { getProjects } from '../../services/projects/getProjects';
import { mapContentToWorkRoles } from '../../services/work-experience/workModel';
import ResumeDocument, { type ResumeDocumentData } from './ResumeDocument';

export default function Resume() {
  const { locale, messages: t } = useTranslation();
  const { data, projects } = useMemo(() => {
    const roles = mapContentToWorkRoles(
      content[locale].workExperience,
      t,
      locale,
    );
    const projects = getProjects(locale).filter((project) =>
      project.topics?.includes('resume'),
    );
    const data: ResumeDocumentData = {
      name: t.home.name,
      title: `${t.home.title} • ${t.home.subtitle}`,
      username: t.home.username,
      summary: t.resume.summary,
      roles,
      languages: [t.resume.languages.portuguese, t.resume.languages.english],
    };

    return { data, projects };
  }, [locale, t]);

  return (
    <section className="container-main print:px-0 print:py-0">
      <div className="mb-6 flex items-center justify-between gap-4 print:hidden">
        <h1 className="text-3xl font-bold">{t.resume.title}</h1>
        <button
          type="button"
          className="button-primary"
          onClick={() => window.print()}
        >
          {t.resume.printAction}
        </button>
      </div>
      <p className="my-3 text-sm print:hidden">{t.resume.printInstructions}</p>
      <ResumeDocument data={data} projects={projects} messages={t} />
    </section>
  );
}
