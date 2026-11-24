import type { ApplicationStatus } from '../services/types/application';
import type { IngestionRunStatus } from '../services/types/ingestion';
import type {
  JobArea,
  JobFilterResult,
  JobLevel,
  JobSource,
  RequirementClassification,
} from '../services/types/job';
import type {
  MatchAlgorithm,
  MatchBaselineKind,
} from '../services/types/match';
import type { LinkKind, SkillCategory } from '../services/types/portfolio';

export const LOCALES = ['en', 'pt-BR'] as const;

export type Locale = (typeof LOCALES)[number];

export interface Translation {
  navigation: {
    dashboard: string;
    jobs: string;
    applications: string;
    portfolio: string;
    skills: string;
    settings: string;
    ingestion: string;
    switchToEnglish: string;
    switchToPortuguese: string;
    addJob: string;
    menu: string;
    mainNav: string;
    mockData: string;
    mockDataOn: string;
    mockDataOff: string;
    switchToDarkMode: string;
    switchToLightMode: string;
  };

  dashboard: {
    title: string;
    totalJobs: string;
    jobsToday: string;
    jobsThisWeek: string;
    jobsThisMonth: string;
    filterBar: {
      title: string;
      level: string;
      location: string;
      area: string;
      remoteOnly: string;
      maxAgeDays: string;
      search: string;
      reset: string;
      useProfileFilters: string;
      allOption: string;
      ageOptions: {
        oneDay: string;
        sevenDays: string;
        thirtyDays: string;
        ninetyDays: string;
      };
    };
    recommendations: {
      title: string;
      noRecommendations: string;
      viewAll: string;
    };
    pipeline: {
      title: string;
      noApplications: string;
    };
  };

  jobs: {
    title: string;
    noJobs: string;
    noJobsMatching: string;
    clearFilters: string;
    remote: string;
    notFound: string;
    age: {
      today: string;
      daysAgo: string;
      weeksAgo: string;
      monthsAgo: string;
    };
    filterResult: Record<JobFilterResult, string>;
    levels: Record<JobLevel, string>;
    areas: Record<JobArea, string>;
    sources: Record<JobSource, string>;
    possiblyExpired: string;
    viewPosting: string;
    saveForLater: string;
    markApplied: string;
    appliedConfirmTitle: string;
    appliedConfirmBody: string;
    editResume: string;
  };

  match: {
    title: string;
    score: string;
    components: string;
    matchedTerms: string;
    missingTerms: string;
    requirements: string;
    requirementMatched: string;
    requirementMissing: string;
    requirementsMet: string;
    weight: string;
    weightShort: string;
    scoreMeaning: string;
    moreTerms: string;
    tiers: Record<RequirementClassification, string>;
    portfolioRequired: string;
    setupPortfolio: string;
    algorithms: Record<MatchAlgorithm, string>;
    baseline: Record<MatchBaselineKind, string>;
    componentNames: Record<string, string>;
  };

  manualJobForm: {
    title: string;
    url: string;
    urlHint: string;
    jobTitle: string;
    company: string;
    location: string;
    description: string;
    salaryMin: string;
    salaryMax: string;
    remote: string;
    source: string;
    submit: string;
    submitting: string;
    salaryOrder: string;
    duplicateWarning: string;
  };

  applications: {
    title: string;
    noApplications: string;
    status: Record<ApplicationStatus, string>;
    appliedAt: string;
    statusChangedAt: string;
    notes: string;
    advanceTo: string;
    advanceConfirmTitle: string;
    advanceConfirmBody: string;
    reasonLabel: string;
    viewTable: string;
    viewList: string;
    viewBoard: string;
    selectAll: string;
    selectRow: string;
    moveTo: string;
    selectedCount: string;
    moveSelected: string;
    exportCsv: string;
    exportJson: string;
    statusLabel: string;
    jobColumn: string;
    jobFallback: string;
    resume: string;
  };

  resumes: {
    title: string;
    locale: string;
    seededNotice: string;
    locked: string;
    lockedError: string;
    addItem: string;
    preview: {
      title: string;
      repository: string;
      demo: string;
    };
    sections: {
      basics: string;
      summary: string;
      experience: string;
      projects: string;
      skillGroups: string;
      education: string;
      certifications: string;
      languages: string;
    };
    basics: {
      fullName: string;
      headline: string;
      subtitle: string;
      location: string;
      avatarUrl: string;
      links: string;
      linkKind: string;
      linkUrl: string;
      linkLabel: string;
      addLink: string;
      reorderLink: string;
      linkKinds: Record<LinkKind, string>;
    };
    experience: {
      add: string;
      addBullet: string;
      company: string;
      role: string;
      location: string;
      start: string;
      end: string;
      present: string;
      bullets: string;
      bulletText: string;
      skills: string;
    };
    education: {
      add: string;
      institution: string;
      degree: string;
      fieldOfStudy: string;
      start: string;
      end: string;
      details: string;
    };
    certifications: {
      add: string;
      name: string;
      issuer: string;
      url: string;
      year: string;
    };
    languages: {
      add: string;
      name: string;
      proficiency: string;
    };
    projects: {
      add: string;
      slug: string;
      slugHint: string;
      title: string;
      summary: string;
      highlights: string;
      repoUrl: string;
      demoUrl: string;
      category: string;
      stars: string;
      featured: string;
      technologies: string;
      topics: string;
    };
    skillGroups: {
      add: string;
      category: string;
      items: string;
      categories: Record<SkillCategory, string>;
    };
  };

  portfolio: {
    title: string;
    noDocumentForLocale: string;
    locale: string;
    sections: {
      basics: string;
      experience: string;
      skillGroups: string;
      projects: string;
      languages: string;
    };
    basics: {
      fullName: string;
      headline: string;
      subtitle: string;
      location: string;
      links: string;
    };
    languages: {
      add: string;
      language: string;
      proficiency: string;
      nameFor: string;
      proficiencyFor: string;
    };
    save: string;
    cancel: string;
  };

  skills: {
    title: string;
    skillColumn: string;
    groupColumn: string;
    addSkill: string;
    empty: string;
    nameRequired: string;
    duplicateName: string;
    save: string;
    labelsTitle: string;
    labelsDescription: string;
    entityColumn: string;
    kindSkill: string;
    kindGroup: string;
    saveLabels: string;
  };

  settings: {
    title: string;
    description: string;
    filtersTitle: string;
    filtersDescription: string;
    levels: string;
    areas: string;
    locations: string;
    locationsHint: string;
    remoteOnly: string;
    noPortfolio: string;
    openPortfolio: string;
  };

  ingestion: {
    title: string;
    runAll: string;
    running: string;
    jobsBySource: string;
    runsTitle: string;
    noRuns: string;
    noRunsForSource: string;
    showAllSources: string;
    columns: {
      started: string;
      source: string;
      status: string;
      fetched: string;
      inserted: string;
      updated: string;
      failed: string;
      error: string;
    };
    status: Record<IngestionRunStatus, string>;
  };

  common: {
    loading: string;
    saving: string;
    saved: string;
    error: string;
    notFound: string;
    retry: string;
    save: string;
    cancel: string;
    delete: string;
    add: string;
    edit: string;
    view: string;
    back: string;
    next: string;
    previous: string;
    deleteItem: string;
    undo: string;
    discardTitle: string;
    discardBody: string;
    discardConfirm: string;
    keepEditing: string;
    locales: Record<Locale, string>;
    errors: {
      unauthorized: string;
      unreachable: string;
    };
  };
}

export function defineMessages(messages: Translation) {
  return messages;
}
