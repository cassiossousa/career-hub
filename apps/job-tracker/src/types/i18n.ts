import type { JobSource } from '../services/types/job';

export type Locale = 'en' | 'pt-BR';

export interface Translation {
  navigation: {
    dashboard: string;
    jobs: string;
    applications: string;
    portfolio: string;
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
    filteredCount: string;
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
    notes: string;
    advanceTo: string;
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
    };
  };

  portfolio: {
    title: string;
    noDocumentForLocale: string;
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
    errors: {
      unauthorized: string;
      unreachable: string;
    };
  };
}

export function defineMessages(messages: Translation) {
  return messages;
}
