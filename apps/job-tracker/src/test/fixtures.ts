import type { Application } from '../services/types/application';

export function makeApplication(
  overrides: Partial<Application> = {},
): Application {
  return {
    id: 1,
    jobId: 10,
    portfolioId: 1,
    status: 'applied',
    notes: null,
    appliedAt: '2024-01-01',
    followUpAt: null,
    tags: [],
    statusChangedAt: '2024-01-02',
    createdAt: '2024-01-01',
    ...overrides,
  };
}
