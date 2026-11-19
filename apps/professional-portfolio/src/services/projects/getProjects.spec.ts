import { getProject, getProjects } from './getProjects';

jest.mock(
  'virtual:portfolio-content',
  () => ({
    content: {
      en: {
        projects: [
          {
            slug: 'alpha',
            type: 'projects',
            frontmatter: {
              title: 'Alpha',
              repo: 'https://github.com/x/alpha',
              demo: 'https://alpha.example.com',
              stars: 42,
              technologies: ['React'],
              topics: ['featured'],
            },
            content: 'First line summary\nSecond line',
            readingTime: 1,
          },
          {
            slug: 'beta',
            type: 'projects',
            frontmatter: {},
            content: '  Trimmed description  \nmore',
          },
        ],
        workExperience: [],
      },
      'pt-BR': {
        projects: [
          {
            slug: 'alpha-pt',
            type: 'projects',
            frontmatter: { title: 'Alpha PT' },
            content: 'Descrição em português',
          },
        ],
        workExperience: [],
      },
    },
  }),
  { virtual: true },
);

describe('getProjects', () => {
  it('maps entries to projects with field fallbacks', () => {
    const projects = getProjects('en');

    expect(projects).toHaveLength(2);

    const [alpha, beta] = projects;
    expect(alpha).toMatchObject({
      slug: 'alpha',
      title: 'Alpha',
      description: 'First line summary',
      repo: 'https://github.com/x/alpha',
      demo: 'https://alpha.example.com',
      stars: 42,
      technologies: ['React'],
      featured: true,
    });

    expect(beta.slug).toBe('beta');
    expect(beta.title).toBe('beta');
    expect(beta.description).toBe('Trimmed description');
    expect(beta.featured).toBeUndefined();
  });

  it('selects projects for the requested locale', () => {
    const projects = getProjects('pt-BR');

    expect(projects).toHaveLength(1);
    expect(projects[0].slug).toBe('alpha-pt');
    expect(projects[0].title).toBe('Alpha PT');
  });

  it('finds a project by slug and returns null for unknown slugs', () => {
    expect(getProject('alpha', 'en')?.title).toBe('Alpha');
    expect(getProject('missing', 'en')).toBeNull();
  });
});
