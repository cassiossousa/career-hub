import path from 'node:path';
import {
  featureOf,
  findCrossFeatureImports,
  isInside,
  listSourceFiles,
  relativeImports,
  resolveSpecifier,
} from '@career-hub/ui/testkit';

const SRC_ROOT = __dirname;
const FEATURES_ROOT = path.join(SRC_ROOT, 'features');
const SERVICES_ROOT = path.join(SRC_ROOT, 'services');
const COMPONENTS_ROOT = path.join(SRC_ROOT, 'components');

describe('architecture boundaries', () => {
  it('features never import internals from sibling features', () => {
    expect(findCrossFeatureImports(SRC_ROOT)).toEqual([]);
  });

  it('shared components never import features or services', () => {
    const violations = listSourceFiles(COMPONENTS_ROOT).flatMap((file) =>
      relativeImports(file)
        .map((specifier) => resolveSpecifier(file, specifier))
        .filter(
          (resolved) =>
            featureOf(FEATURES_ROOT, resolved) !== null ||
            isInside(SERVICES_ROOT, resolved),
        )
        .map((resolved) => `${file} -> ${resolved}`),
    );

    expect(violations).toEqual([]);
  });
});
