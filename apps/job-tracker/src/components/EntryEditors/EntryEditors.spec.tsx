import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactElement, useState } from 'react';
import type {
  ExperienceEntry,
  PortfolioBasics,
  ProjectEntry,
  SkillGroup,
} from '../../services/types/portfolio';
import type {
  CertificationEntry,
  EducationEntry,
  LanguageEntry,
} from '../../services/types/resume';
import { renderWithProviders } from '../../test/TestUtils';
import {
  BasicsEditor,
  CertificationEditor,
  EducationEditor,
  ExperienceEditor,
  LanguageEditor,
  ProjectEditor,
  SkillGroupsEditor,
} from './EntryEditors';

async function clickFirstDelete(user: ReturnType<typeof userEvent.setup>) {
  const button = screen.getAllByRole('button', { name: 'Delete' })[0];
  if (!button) throw new Error('expected delete button');
  await user.click(button);
}

const basics: PortfolioBasics = {
  fullName: 'Cassio Sousa',
  headline: 'Senior Frontend Engineer',
  subtitle: 'React · TypeScript',
  location: 'Remote',
  avatarUrl: null,
  links: [
    { kind: 'github', url: 'https://github.com/cassiossousa', label: null },
  ],
};

const experienceEntry: ExperienceEntry = {
  company: 'Acme Corp',
  role: 'Senior Frontend Engineer',
  location: 'Remote',
  start: '2021-03',
  end: null,
  bullets: [{ text: 'Led React migration', skills: ['React'] }],
};

const educationEntry: EducationEntry = {
  institution: 'USP',
  degree: 'B.Sc. Computer Science',
  fieldOfStudy: 'Software Engineering',
  start: '2013-02',
  end: '2017-12',
  details: null,
};

const certificationEntry: CertificationEntry = {
  name: 'AWS Certified Developer',
  issuer: 'Amazon',
  url: null,
  year: 2022,
};

const languageEntry: LanguageEntry = { name: 'English', proficiency: 'C1' };

const projectEntry: ProjectEntry = {
  slug: 'career-hub',
  title: 'Career Hub',
  summary: 'Job tracker monorepo',
  highlights: ['React'],
  repoUrl: null,
  demoUrl: null,
  featured: true,
  technologies: ['TypeScript'],
  topics: [],
  category: null,
  stars: 12,
};

const skillGroup: SkillGroup = {
  category: 'frontend',
  items: ['React', 'TypeScript'],
};

interface ControlledProps<T> {
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean | undefined;
}

function makeHarness<T>(
  initial: T,
  Editor: (props: ControlledProps<T>) => ReactElement,
) {
  const calls: T[] = [];
  function Harness() {
    const [value, setValue] = useState(initial);
    return (
      <Editor
        value={value}
        onChange={(next) => {
          calls.push(next);
          setValue(next);
        }}
      />
    );
  }
  return { Harness, calls };
}

function lastCall<T>(calls: T[]): T {
  const last = calls.at(-1);
  if (last === undefined) throw new Error('expected onChange call');
  return last;
}

function renderTwoLinksBasics() {
  const twoLinks: PortfolioBasics = {
    ...basics,
    links: [
      { kind: 'github', url: 'https://github.com/a', label: null },
      { kind: 'linkedin', url: 'https://linkedin.com/in/b', label: null },
    ],
  };
  const { Harness, calls } = makeHarness(twoLinks, BasicsEditor);
  renderWithProviders(<Harness />);
  return calls;
}

describe('BasicsEditor', () => {
  it('edits scalar fields and links', async () => {
    const user = userEvent.setup();
    const { Harness, calls } = makeHarness(basics, BasicsEditor);
    renderWithProviders(<Harness />);

    const nameInput = screen.getByLabelText(/full name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'New Name');
    expect(lastCall(calls).fullName).toBe('New Name');

    await user.click(screen.getByRole('button', { name: /add link/i }));
    expect(lastCall(calls).links).toHaveLength(2);

    await clickFirstDelete(user);
    expect(lastCall(calls).links).toHaveLength(1);
  });

  it('edits link fields and the nullable avatar url', () => {
    const { Harness, calls } = makeHarness(basics, BasicsEditor);
    renderWithProviders(<Harness />);

    fireEvent.change(screen.getByLabelText('URL'), {
      target: { value: 'https://github.com/new' },
    });
    expect(lastCall(calls).links?.[0]?.url).toBe('https://github.com/new');

    fireEvent.change(screen.getByLabelText('Label'), {
      target: { value: 'Work' },
    });
    expect(lastCall(calls).links?.[0]?.label).toBe('Work');

    const avatar = screen.getByLabelText(/avatar url/i);
    fireEvent.change(avatar, {
      target: { value: 'https://example.com/a.png' },
    });
    expect(lastCall(calls).avatarUrl).toBe('https://example.com/a.png');
    fireEvent.change(avatar, { target: { value: '' } });
    expect(lastCall(calls).avatarUrl).toBeNull();
  });

  it('reorders links by dragging the handle onto another row', () => {
    const calls = renderTwoLinksBasics();

    const rows = screen.getAllByRole('listitem');
    const handles = screen.getAllByRole('button', { name: /reorder link/i });
    const firstRow = rows[0];
    const secondHandle = handles[1];
    if (!firstRow || !secondHandle) throw new Error('expected link rows');
    fireEvent.dragStart(secondHandle);
    fireEvent.dragOver(firstRow);
    fireEvent.drop(firstRow);

    expect((lastCall(calls).links ?? []).map((l) => l.url)).toEqual([
      'https://linkedin.com/in/b',
      'https://github.com/a',
    ]);
  });

  it('moves links with arrow keys on the reorder handle', () => {
    const calls = renderTwoLinksBasics();

    const handles = screen.getAllByRole('button', { name: /reorder link/i });
    const [firstHandle, secondHandle] = handles;
    if (!firstHandle || !secondHandle) {
      throw new Error('expected reorder handles');
    }
    fireEvent.keyDown(firstHandle, { key: 'ArrowUp' });
    expect(calls).toHaveLength(0);

    fireEvent.keyDown(secondHandle, { key: 'ArrowUp' });
    expect((lastCall(calls).links ?? []).map((l) => l.url)).toEqual([
      'https://linkedin.com/in/b',
      'https://github.com/a',
    ]);

    fireEvent.keyDown(firstHandle, { key: 'ArrowDown' });
    expect((lastCall(calls).links ?? []).map((l) => l.url)).toEqual([
      'https://github.com/a',
      'https://linkedin.com/in/b',
    ]);
  });
});

describe('ExperienceEditor', () => {
  it('adds entries, edits fields, and manages bullets', async () => {
    const user = userEvent.setup();
    const { Harness, calls } = makeHarness([experienceEntry], ExperienceEditor);
    renderWithProviders(<Harness />);

    fireEvent.change(screen.getByLabelText(/company/i), {
      target: { value: 'New Corp' },
    });
    expect(lastCall(calls)[0]?.company).toBe('New Corp');

    fireEvent.change(screen.getByLabelText(/start \(yyyy-mm\)/i), {
      target: { value: '2020-01' },
    });
    expect(lastCall(calls)[0]?.start).toBe('2020-01');
    fireEvent.change(screen.getByLabelText(/end \(yyyy-mm/i), {
      target: { value: '' },
    });
    expect(lastCall(calls)[0]?.end).toBeNull();

    await user.click(screen.getByRole('button', { name: /add bullet/i }));
    expect(lastCall(calls)[0]?.bullets).toHaveLength(2);

    const skillsInput = screen.getAllByLabelText('Add item')[0];
    if (!skillsInput) throw new Error('expected skills input');
    fireEvent.change(skillsInput, { target: { value: 'Go, Rust' } });
    fireEvent.keyDown(skillsInput, { key: 'Enter' });
    expect(lastCall(calls)[0]?.bullets?.[0]?.skills).toEqual([
      'React',
      'Go',
      'Rust',
    ]);
    expect(screen.getByText('Rust')).toBeInTheDocument();

    const chipDelete = document.querySelector('.MuiChip-deleteIcon');
    if (!chipDelete) throw new Error('expected chip delete icon');
    fireEvent.click(chipDelete);
    expect(lastCall(calls)[0]?.bullets?.[0]?.skills).toEqual(['Go', 'Rust']);

    const callsBeforeEmptyCommit = calls.length;
    fireEvent.keyDown(skillsInput, { key: 'Enter' });
    expect(calls.length).toBe(callsBeforeEmptyCommit);

    await user.click(screen.getByRole('button', { name: /add experience/i }));
    expect(lastCall(calls)).toHaveLength(2);
    expect(screen.getAllByLabelText(/company/i)).toHaveLength(2);
  });

  it('removes an entry', async () => {
    const user = userEvent.setup();
    const { Harness, calls } = makeHarness([experienceEntry], ExperienceEditor);
    renderWithProviders(<Harness />);
    await clickFirstDelete(user);
    expect(lastCall(calls)).toEqual([]);
  });
});

describe('EducationEditor', () => {
  it('adds and removes entries', async () => {
    const user = userEvent.setup();
    const { Harness, calls } = makeHarness([educationEntry], EducationEditor);
    renderWithProviders(<Harness />);

    fireEvent.change(screen.getByLabelText(/start/i), {
      target: { value: '2020-01' },
    });
    expect(lastCall(calls)[0]?.start).toBe('2020-01');
    fireEvent.change(screen.getByLabelText(/end/i), { target: { value: '' } });
    expect(lastCall(calls)[0]?.end).toBeNull();

    await user.click(screen.getByRole('button', { name: /add education/i }));
    expect(lastCall(calls)).toHaveLength(2);
    expect(screen.getAllByLabelText(/institution/i)).toHaveLength(2);

    await clickFirstDelete(user);
    expect(lastCall(calls)).toHaveLength(1);
    expect(lastCall(calls)[0]?.institution).toBe('');
  });
});

describe('CertificationEditor', () => {
  it('parses the year as a nullable number', () => {
    const { Harness, calls } = makeHarness(
      [certificationEntry],
      CertificationEditor,
    );
    renderWithProviders(<Harness />);

    const yearInput = screen.getByLabelText('Year');
    fireEvent.change(yearInput, { target: { value: '2024' } });
    expect(lastCall(calls)[0]?.year).toBe(2024);

    fireEvent.change(yearInput, { target: { value: '' } });
    expect(lastCall(calls)[0]?.year).toBeNull();

    fireEvent.change(screen.getByLabelText('Issuer'), {
      target: { value: 'Amazon Web Services' },
    });
    expect(lastCall(calls)[0]?.issuer).toBe('Amazon Web Services');
    fireEvent.change(screen.getByLabelText('URL'), {
      target: { value: 'https://aws.amazon.com/cert' },
    });
    expect(lastCall(calls)[0]?.url).toBe('https://aws.amazon.com/cert');
  });
});

describe('LanguageEditor', () => {
  it('adds entries', async () => {
    const user = userEvent.setup();
    const { Harness, calls } = makeHarness([languageEntry], LanguageEditor);
    renderWithProviders(<Harness />);

    await user.click(screen.getByRole('button', { name: /add language/i }));
    expect(lastCall(calls)).toEqual([
      languageEntry,
      { name: '', proficiency: null },
    ]);

    const proficiencyInputs = screen.getAllByLabelText(/proficiency/i);
    const firstProficiency = proficiencyInputs[0];
    if (!firstProficiency) throw new Error('expected proficiency input');
    fireEvent.change(firstProficiency, { target: { value: 'Native' } });
    expect(lastCall(calls)[0]?.proficiency).toBe('Native');
  });
});

describe('ProjectEditor', () => {
  it('toggles featured and adds entries', async () => {
    const user = userEvent.setup();
    const { Harness, calls } = makeHarness([projectEntry], ProjectEditor);
    renderWithProviders(<Harness />);

    await user.click(screen.getByRole('switch'));
    expect(lastCall(calls)[0]?.featured).toBe(false);

    await user.click(screen.getByRole('button', { name: /add project/i }));
    expect(lastCall(calls)).toHaveLength(2);
    expect(screen.getAllByLabelText(/slug/i)).toHaveLength(2);
  });

  it('edits urls, stars, and string lists', () => {
    const { Harness, calls } = makeHarness([projectEntry], ProjectEditor);
    renderWithProviders(<Harness />);

    fireEvent.change(screen.getByLabelText('Repository URL'), {
      target: { value: 'https://github.com/x/y' },
    });
    expect(lastCall(calls)[0]?.repoUrl).toBe('https://github.com/x/y');
    fireEvent.change(screen.getByLabelText('Stars'), { target: { value: '' } });
    expect(lastCall(calls)[0]?.stars).toBeNull();
    fireEvent.change(screen.getByLabelText('Stars'), {
      target: { value: '42' },
    });
    expect(lastCall(calls)[0]?.stars).toBe(42);

    const listInputs = screen.getAllByLabelText('Add item');
    const [highlights, technologies, topics] = listInputs;
    if (!highlights || !technologies || !topics) {
      throw new Error('expected three string list inputs');
    }
    fireEvent.change(highlights, { target: { value: 'SSR' } });
    fireEvent.keyDown(highlights, { key: 'Enter' });
    expect(lastCall(calls)[0]?.highlights).toContain('SSR');
    fireEvent.change(technologies, { target: { value: 'Rust' } });
    fireEvent.keyDown(technologies, { key: 'Enter' });
    expect(lastCall(calls)[0]?.technologies).toContain('Rust');
    fireEvent.change(topics, { target: { value: 'cli' } });
    fireEvent.keyDown(topics, { key: 'Enter' });
    expect(lastCall(calls)[0]?.topics).toContain('cli');
  });
});

describe('SkillGroupsEditor', () => {
  it('adds groups and renders existing items', async () => {
    const user = userEvent.setup();
    const { Harness, calls } = makeHarness([skillGroup], SkillGroupsEditor);
    renderWithProviders(<Harness />);

    expect(screen.getByText('React')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /add skill group/i }));
    expect(lastCall(calls)).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: 'Delete' })).toHaveLength(2);
  });

  it('adds items to a skill group', () => {
    const { Harness, calls } = makeHarness([skillGroup], SkillGroupsEditor);
    renderWithProviders(<Harness />);

    const itemsInput = screen.getByLabelText('Add item');
    fireEvent.change(itemsInput, { target: { value: 'Vue' } });
    fireEvent.keyDown(itemsInput, { key: 'Enter' });
    expect(lastCall(calls)[0]?.items).toEqual(['React', 'TypeScript', 'Vue']);
  });
});
