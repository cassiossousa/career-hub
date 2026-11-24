import type {
  JobSource,
  RequirementClassification,
} from '../services/types/job';
import type { SkillCategory } from '../services/types/portfolio';

export type Locale = 'en' | 'pt-BR';
type LinkKind = 'github' | 'linkedin' | 'website' | 'email' | 'other';

export interface Translation {
  navigation: {
    dashboard: string;
    jobs: string;
    applications: string;
    portfolio: string;
    skills: string;
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
    filterResult: {
      unevaluated: string;
      passed: string;
      filteredLevel: string;
      filteredLocation: string;
      filteredArea: string;
      filteredRemote: string;
      filteredAge: string;
    };
    levels: {
      intern: string;
      junior: string;
      mid: string;
      senior: string;
      lead: string;
    };
    areas: {
      frontend: string;
      backend: string;
      fullstack: string;
      data: string;
      devops: string;
      mobile: string;
      qa: string;
      management: string;
      other: string;
    };
    sources: Record<JobSource, string>;
    possiblyExpired: string;
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
    algorithms: {
      keyword: string;
      tfidf: string;
      hybrid: string;
    };
    baseline: {
      resume: string;
      portfolio: string;
    };
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
    status: {
      saved: string;
      applied: string;
      screening: string;
      interview: string;
      offer: string;
      rejected: string;
      withdrawn: string;
    };
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
      username: string;
      location: string;
      avatarUrl: string;
      links: string;
      linkKind: string;
      linkUrl: string;
      linkLabel: string;
      addLink: string;
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
    };
    basics: {
      fullName: string;
      headline: string;
      subtitle: string;
      username: string;
      location: string;
      links: string;
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
