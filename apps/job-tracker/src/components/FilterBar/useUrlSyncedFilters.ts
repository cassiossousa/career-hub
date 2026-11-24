import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { JOB_AREAS, JOB_LEVELS } from '../../services/types/job';
import { useFilterStore } from '../../store/filterStore';

const AGE_OPTIONS = [1, 7, 30, 90] as const;

function parseLevel(value: string | null) {
  return JOB_LEVELS.find((level) => level === value);
}

function parseArea(value: string | null) {
  return JOB_AREAS.find((area) => area === value);
}

function parseAge(value: string | null) {
  const days = Number(value);
  return AGE_OPTIONS.find((option) => option === days);
}

/**
 * Keeps the job filter store and the URL query string in sync so filtered
 * views are shareable and survive reloads. On first mount the URL wins over
 * persisted state; afterwards the store is the source of truth.
 */
export function useUrlSyncedFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const store = useFilterStore();
  const hydratedRef = useRef(false);
  const { level, location, area, remoteOnly, maxAgeDays, preset, search } =
    store;

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    store.setLevel(parseLevel(searchParams.get('level')));
    store.setLocation(searchParams.get('location') ?? undefined);
    store.setArea(parseArea(searchParams.get('area')));
    store.setRemoteOnly(searchParams.get('remote') === '1');
    store.setMaxAgeDays(parseAge(searchParams.get('age')));
    store.setPreset(
      searchParams.get('preset') === 'profile' ? 'profile' : null,
    );
    store.setSearch(searchParams.get('q') ?? undefined);
  }, [searchParams, store]);

  useEffect(() => {
    const next = new URLSearchParams();
    if (level) next.set('level', level);
    if (location) next.set('location', location);
    if (area) next.set('area', area);
    if (remoteOnly) next.set('remote', '1');
    if (maxAgeDays !== undefined) next.set('age', String(maxAgeDays));
    if (preset) next.set('preset', preset);
    if (search) next.set('q', search);
    setSearchParams(next, { replace: true });
  }, [
    level,
    location,
    area,
    remoteOnly,
    maxAgeDays,
    preset,
    search,
    setSearchParams,
  ]);
}
