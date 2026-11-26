import fc from 'fast-check';
import { interpolate } from './interpolate';

// Values must not contain braces — a value like "{name}" would legitimately
// reintroduce the token after substitution.
const safeValueArb = fc
  .string()
  .filter((value) => !value.includes('{') && !value.includes('}'));

const keyArb = fc.stringMatching(/^[a-z][a-z0-9_]{0,15}$/);
const valuesArb = fc.dictionary(keyArb, safeValueArb);

describe('interpolate', () => {
  it('returns the template unchanged for empty values', () => {
    fc.assert(
      fc.property(fc.string(), (template) => {
        expect(interpolate(template, {})).toBe(template);
      }),
    );
  });

  it('substitutes every provided {key} token', () => {
    fc.assert(
      fc.property(fc.string(), valuesArb, (template, values) => {
        const result = interpolate(template, values);
        for (const key of Object.keys(values)) {
          expect(result.includes(`{${key}}`)).toBe(false);
        }
      }),
    );
  });

  it('leaves tokens for keys absent from values untouched', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<string>('name', 'count', 'title'),
        fc.constantFrom<string>('other', 'missing', 'zzz'),
        (present, absent) => {
          if (present === absent) return;
          const result = interpolate(`{${present}} and {${absent}}`, {
            [present]: 'X',
          });
          expect(result).toBe(`X and {${absent}}`);
        },
      ),
    );
  });

  it('is deterministic for identical inputs', () => {
    fc.assert(
      fc.property(fc.string(), valuesArb, (template, values) => {
        expect(interpolate(template, values)).toBe(
          interpolate(template, values),
        );
      }),
    );
  });
});
