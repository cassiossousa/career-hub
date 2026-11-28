import axe from 'axe-core';

// WCAG 2.x A/AA tags — matches the e2e axe audits (WCAG 2.1 AA).
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

// jsdom has no layout engine: color-contrast needs computed styles/boxes axe
// cannot produce there, so it is disabled. The Playwright e2e axe audit remains
// the authoritative contrast check on a real browser.
const JSdom_UNSUPPORTED_RULES = { 'color-contrast': { enabled: false } };

export async function expectNoA11yViolations(
  container: Element,
): Promise<void> {
  const results = await axe.run(container, {
    runOnly: { type: 'tag', values: WCAG_TAGS },
    rules: JSdom_UNSUPPORTED_RULES,
  });

  const violations = results.violations.map(
    (violation) =>
      `${violation.id} [${violation.impact ?? 'unknown'}]: ${violation.help} — ` +
      violation.nodes
        .map((node) => `${node.target.join(' ')} (${node.failureSummary})`)
        .join('; '),
  );

  expect(violations).toEqual([]);
}
