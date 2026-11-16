import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/provider';
import { getProjects } from '../../services/projects/getProjects';

export default function ProjectsPage() {
  const { locale, messages: t } = useTranslation();
  const featuredProjects = getProjects(locale).filter(
    (project) =>
      Boolean(project.topics?.includes('featured') || project.featured) ||
      Boolean(project.topics?.includes('resume')),
  );

  return (
    <section className="container-main">
      <h1 className="text-3xl font-bold mb-8">{t.projects.title}</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {featuredProjects.map((project) => (
          <article key={project.slug} className="card">
            <Link
              to={`/projects/${project.slug}`}
              className="text-xl font-semibold hover:underline"
            >
              {project.title}
            </Link>

            {project.summary && (
              <ul className="mt-3 list-disc list-inside text-sm">
                {project.summary.slice(0, 3).map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            )}

            {project.technologies && project.technologies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="text-xs px-2 py-1 bg-neutral-200 dark:bg-neutral-700 rounded"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-3 flex gap-4 text-sm">
              {project.stars && <span>⭐ {project.stars}</span>}
              {project.repo && (
                <a href={project.repo} target="_blank" rel="noreferrer">
                  GitHub
                </a>
              )}
              {project.demo && (
                <a href={project.demo} target="_blank" rel="noreferrer">
                  Demo
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
