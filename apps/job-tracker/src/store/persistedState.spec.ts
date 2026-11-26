import { z } from 'zod';
import { storageRemoveItem, storageSetItem } from '../app/storage';
import { loadPersistedState } from './persistedState';

const TEST_KEY = 'test-persisted-state';
const schema = z.object({
  level: z.enum(['junior', 'senior']).optional(),
  count: z.number().optional(),
});

describe('loadPersistedState', () => {
  beforeEach(() => {
    storageRemoveItem(TEST_KEY);
  });

  it('returns parsed state for a valid persisted payload', () => {
    storageSetItem(TEST_KEY, JSON.stringify({ level: 'senior', count: 3 }));

    expect(loadPersistedState(TEST_KEY, schema)).toEqual({
      level: 'senior',
      count: 3,
    });
  });

  it('returns an empty object when nothing is stored', () => {
    expect(loadPersistedState(TEST_KEY, schema)).toEqual({});
  });

  it('returns an empty object for corrupted JSON', () => {
    storageSetItem(TEST_KEY, '{not valid json');

    expect(loadPersistedState(TEST_KEY, schema)).toEqual({});
  });

  it('returns an empty object when the payload fails schema validation', () => {
    storageSetItem(
      TEST_KEY,
      JSON.stringify({ level: 'principal-wizard', count: 'three' }),
    );

    expect(loadPersistedState(TEST_KEY, schema)).toEqual({});
  });

  it('drops unknown keys instead of leaking them into state', () => {
    storageSetItem(
      TEST_KEY,
      JSON.stringify({ level: 'junior', injected: 'payload' }),
    );

    expect(loadPersistedState(TEST_KEY, schema)).toEqual({ level: 'junior' });
  });
});
