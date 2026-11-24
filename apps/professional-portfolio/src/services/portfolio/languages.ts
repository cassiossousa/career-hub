import { useSyncExternalStore } from 'react';
import { apiBaseUrl } from '../../app/env';
import type { Locale } from '../../types/i18n';

export interface PortfolioLanguageView {
  language: string;
  proficiency: string;
  name: string;
  proficiencyLabel: string;
}

export interface PortfolioLanguagesState {
  status: 'loading' | 'ready' | 'error';
  languages: PortfolioLanguageView[];
}

const LOADING: PortfolioLanguagesState = { status: 'loading', languages: [] };
const ERROR: PortfolioLanguagesState = { status: 'error', languages: [] };

const states = new Map<string, PortfolioLanguagesState>();
const listeners = new Set<() => void>();
const inflight = new Map<string, Promise<void>>();

function apiBase(): string {
  return apiBaseUrl;
}

function isPortfolioLanguageView(
  value: unknown,
): value is PortfolioLanguageView {
  return (
    typeof value === 'object' &&
    value !== null &&
    'language' in value &&
    typeof value.language === 'string' &&
    'proficiency' in value &&
    typeof value.proficiency === 'string' &&
    'name' in value &&
    typeof value.name === 'string' &&
    'proficiencyLabel' in value &&
    typeof value.proficiencyLabel === 'string'
  );
}

function parseLanguagesPayload(data: unknown): PortfolioLanguageView[] {
  if (typeof data !== 'object' || data === null || !('languages' in data)) {
    return [];
  }
  const raw: unknown = data.languages;
  if (!Array.isArray(raw)) return [];
  const list: unknown[] = raw;
  return list.filter(isPortfolioLanguageView);
}

async function load(locale: string): Promise<void> {
  const existing = inflight.get(locale);
  if (existing !== undefined) return existing;

  const request = (async () => {
    try {
      const response = await fetch(
        `${apiBase()}/api/portfolio/languages?locale=${encodeURIComponent(locale)}`,
      );
      if (!response.ok)
        throw new Error(`portfolio languages ${response.status}`);
      const languages = parseLanguagesPayload(await response.json());
      states.set(locale, { status: 'ready', languages });
    } catch {
      states.set(locale, ERROR);
    } finally {
      inflight.delete(locale);
      for (const listener of listeners) listener();
    }
  })();

  inflight.set(locale, request);
  return request;
}

function subscribe(locale: string, onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  if (!states.has(locale) && !inflight.has(locale)) {
    void load(locale);
  }
  return () => {
    listeners.delete(onStoreChange);
  };
}

function getSnapshot(locale: string): PortfolioLanguagesState {
  return states.get(locale) ?? LOADING;
}

/** Spoken languages from the public portfolio API, resolved for `locale`. */
export function usePortfolioLanguages(locale: Locale): PortfolioLanguagesState {
  return useSyncExternalStore(
    (onStoreChange) => subscribe(locale, onStoreChange),
    () => getSnapshot(locale),
  );
}

/** Test hook: drop cached state so specs start clean. */
export function resetPortfolioLanguagesCache(): void {
  states.clear();
  inflight.clear();
}
