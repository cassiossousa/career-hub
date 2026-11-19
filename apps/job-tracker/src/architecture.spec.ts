import path from 'node:path';
import {
  featureOf,
  findCrossFeatureImports,
  listSourceFiles,
  relativeImports,
  resolveSpecifier,
} from '@career-hub/ui/testkit';

const ROOTS = {
  src: __dirname,
  features: path.join(__dirname, 'features'),
  components: path.join(__dirname, 'components'),
};

describe('architecture boundaries', () => {
  it('features never import internals from sibling features', () => {
    expect(findCrossFeatureImports(ROOTS.src)).toEqual([]);
  });

  it('shared components never import features', () => {
    const violations = listSourceFiles(ROOTS.components).flatMap((file) =>
      relativeImports(file)
        .map((specifier) => resolveSpecifier(file, specifier))
        .filter((resolved) => featureOf(ROOTS.features, resolved) !== null)
        .map((resolved) => `${file} -> ${resolved}`),
    );

    expect(violations).toEqual([]);
  });
});
