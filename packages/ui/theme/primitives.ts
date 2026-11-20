// Raw color ramps — values only, no semantics. Light and dark neutrals are
// separate ramps (Primer/Atlassian pattern): dark mode is designed, never an
// inversion of light. Steps follow the Carbon/Polaris convention where lower
// numbers are lighter surfaces and higher numbers are darker ink.

export const neutralLight = {
  50: '#f8fafc',
  100: '#f1f5f9',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#64748b',
  600: '#475569',
  700: '#334155',
  800: '#1e293b',
  900: '#0f172a',
  950: '#020617',
} as const;

// Blue-tinted dark ramp — evolves the previous #0b1120/#111a2e surfaces into
// a proper layer ladder (canvas → paper → raised → overlay).
export const neutralDark = {
  50: '#0b1120',
  100: '#111a2e',
  200: '#1a2547',
  300: '#24314f',
  400: '#33436b',
  500: '#475569',
  600: '#5d7099',
  700: '#7c8aa5',
  800: '#9aa7c7',
  900: '#cbd5e1',
  950: '#e6ebf5',
} as const;

// Indigo/violet brand ramp (Tailwind indigo family).
export const brand = {
  50: '#eef2ff',
  100: '#e0e7ff',
  200: '#c7d2fe',
  300: '#a5b4fc',
  400: '#818cf8',
  500: '#6366f1',
  600: '#4f46e5',
  700: '#4338ca',
  800: '#3730a3',
  900: '#312e81',
  950: '#1e1b4b',
} as const;

// Violet secondary ramp — distinguishes secondary actions from primary.
export const violet = {
  50: '#f5f3ff',
  100: '#ede9fe',
  200: '#ddd6fe',
  300: '#c4b5fd',
  400: '#a78bfa',
  500: '#8b5cf6',
  600: '#7c3aed',
  700: '#6d28d9',
  800: '#5b21b6',
  900: '#4c1d95',
  950: '#2e1065',
} as const;

export const success = {
  300: '#86efac',
  400: '#4ade80',
  500: '#22c55e',
  600: '#16a34a',
  700: '#15803d',
  800: '#166534',
} as const;

export const warning = {
  300: '#fcd34d',
  400: '#fbbf24',
  500: '#f59e0b',
  600: '#d97706',
  700: '#b45309',
  800: '#92400e',
} as const;

export const error = {
  300: '#fca5a5',
  400: '#f87171',
  500: '#ef4444',
  600: '#dc2626',
  700: '#b91c1c',
  800: '#991b1b',
} as const;

export const info = {
  300: '#7dd3fc',
  400: '#38bdf8',
  500: '#0ea5e9',
  600: '#0284c7',
  700: '#0369a1',
  800: '#075985',
} as const;
