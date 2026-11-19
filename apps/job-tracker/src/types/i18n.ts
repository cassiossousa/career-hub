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
  };

  dashboard: {
    title: string;
    totalJobs: string;
    avgMatchScore: string;
    jobsToday: string;
    jobsThisWeek: string;
    filterBar: {
      title: string;
      level: string;
      location: string;
      area: string;
      remoteOnly: string;
      minMatchScore: string;
      maxAgeDays: string;
      sortBy: string;
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
    matchScore: string;
    age: {
      today: string;
      daysAgo: string;
      weeksAgo: string;
      monthsAgo: string;
    };
    requirements: {
      noRequirements: string;
      weight: string;
      classifications: {
        proven: string;
        equivalent: string;
        partial: string;
        unproven: string;
      };
    };
    matched: string;
    missing: string;
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
    sortOptions: {
      postedDesc: string;
      matchScoreDesc: string;
      matchScoreAsc: string;
    };
    sources: Record<JobSource, string>;
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
  };

  portfolio: {
    title: string;
    notFound: string;
    basics: {
      fullName: string;
      headline: string;
      subtitle: string;
      location: string;
      links: string;
    };
    experience: {
      title: string;
      company: string;
      role: string;
      location: string;
      start: string;
      end: string;
      present: string;
      bullets: string;
      skills: string;
    };
    skills: {
      title: string;
      category: string;
    };
    projects: {
      title: string;
      description: string;
      summary: string;
      highlights: string;
      technologies: string;
      topics: string;
    };
    filters: {
      title: string;
      levels: string;
      locations: string;
      areas: string;
      remoteOnly: string;
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
    edit: string;
    view: string;
    back: string;
    next: string;
    previous: string;
  };
}

export function defineMessages(messages: Translation) {
  return messages;
}
