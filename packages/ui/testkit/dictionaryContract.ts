/**
 * Shared i18n dictionary contract: both apps must keep locale key sets,
 * placeholders, and leaf coverage in sync. App specs call
 * `describeLocaleContract(en, ptBR)` and keep only locale-content-specific
 * assertions locally.
 */

// Specs may not declare regex literals (eslint no-restricted-syntax), so
// `{token}` placeholders are extracted with plain string scanning.
function placeholderTokens(value: string): string[] {
  const tokens: string[] = [];
  let index = value.indexOf('{');
  while (index !== -1) {
    const end = value.indexOf('}', index + 1);
    if (end === -1) break;
    tokens.push(value.slice(index + 1, end));
    index = value.indexOf('{', end + 1);
  }
  return tokens.toSorted();
}

export function flattenLeaves(
  value: unknown,
  prefix = '',
): Record<string, string> {
  if (typeof value === 'string') return { [prefix]: value };
  if (value && typeof value === 'object') {
    return Object.entries(value).reduce<Record<string, string>>(
      (acc, [key, child]) => {
        Object.assign(
          acc,
          flattenLeaves(child, prefix ? `${prefix}.${key}` : key),
        );
        return acc;
      },
      {},
    );
  }
  return {};
}

export function describeLocaleContract(en: unknown, ptBr: unknown): void {
  const enLeaves = flattenLeaves(en);
  const ptBrLeaves = flattenLeaves(ptBr);

  describe('locale dictionary contract', () => {
    it('en and pt-BR expose identical key sets', () => {
      expect(Object.keys(ptBrLeaves).toSorted()).toEqual(
        Object.keys(enLeaves).toSorted(),
      );
    });

    it('no leaf is empty or whitespace-only', () => {
      for (const [key, value] of Object.entries(enLeaves)) {
        expect(value.trim().length).toBeGreaterThan(0);
        expect(ptBrLeaves[key]?.trim().length).toBeGreaterThan(0);
      }
    });

    it('en and pt-BR use identical interpolation placeholders per key', () => {
      for (const [key, enValue] of Object.entries(enLeaves)) {
        const ptValue = ptBrLeaves[key] ?? '';
        expect(placeholderTokens(ptValue)).toEqual(placeholderTokens(enValue));
      }
    });
  });
}
