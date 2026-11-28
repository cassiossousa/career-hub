import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { resolveRootArg } from './repo-root.mjs';

// Validates the GitHub-synced MDX content tree (repo-root content/): every
// file must parse, carry the de-facto frontmatter schema for its type, have a
// non-empty body, and work-experience entries must exist once per locale.
// remark-lint was evaluated and rejected for this — it lints prose style,
// which synced upstream content must not be gated on.

const ROOT = resolveRootArg();
const CONTENT_DIR = path.join(ROOT, 'content');
const LOCALES_FILE = path.join(
  ROOT,
  'apps',
  'professional-portfolio',
  'src',
  'types',
  'i18n.ts',
);

const MDX_FILE = /^(?<slug>.+?)(?:\.(?<locale>[a-z]{2}(?:-[A-Z]{2})?))?\.mdx$/;

// Frontmatter fields that must be arrays of non-empty strings when present.
const STRING_ARRAY_FIELDS = {
  projects: ['technologies', 'summary', 'highlights', 'topics'],
  'work-experience': [],
};

// Required string fields per content type (de-facto schema — every current
// file satisfies these; end stays optional for open-ended roles).
const REQUIRED_STRING_FIELDS = {
  projects: ['title'],
  'work-experience': ['company', 'role', 'start'],
};

const OPTIONAL_STRING_FIELDS = {
  projects: ['repo', 'demo', 'category'],
  'work-experience': ['location', 'end'],
};

const OPTIONAL_SCALAR_FIELDS = {
  projects: { featured: 'boolean', stars: 'number' },
  'work-experience': {},
};

function contentTypes() {
  return readdirSync(CONTENT_DIR)
    .filter((entry) => statSync(path.join(CONTENT_DIR, entry)).isDirectory())
    .toSorted();
}

// Reads the canonical LOCALES array from source — never re-declared here.
function supportedLocales() {
  const source = readFileSync(LOCALES_FILE, 'utf8');
  const match = /LOCALES\s*=\s*\[([^\]]+)\]/.exec(source);
  if (!match?.[1]) {
    throw new Error(`Could not parse LOCALES from ${LOCALES_FILE}`);
  }
  return [...match[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
}

function isStringArray(value) {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === 'string' && item.trim() !== '')
  );
}

function checkFile(type, fileName, locales, violations) {
  const match = MDX_FILE.exec(fileName);
  const slug = match?.groups?.slug;
  const locale = match?.groups?.locale;
  if (slug === undefined) {
    violations.push(`${type}/${fileName}: unrecognized filename`);
    return null;
  }

  const rel = `${type}/${fileName}`;
  if (locale !== undefined && !locales.includes(locale)) {
    violations.push(`${rel}: unknown locale "${locale}"`);
  }

  const filePath = path.join(CONTENT_DIR, type, fileName);
  let frontmatter;
  let body;
  try {
    const parsed = matter(readFileSync(filePath, 'utf8'));
    frontmatter = parsed.data;
    body = parsed.content;
  } catch (error) {
    violations.push(
      `${rel}: frontmatter parse failed — ${error instanceof Error ? error.message : String(error)}`,
    );
    return null;
  }

  if (body.trim() === '') {
    violations.push(`${rel}: empty content body`);
  }

  for (const field of REQUIRED_STRING_FIELDS[type] ?? []) {
    const value = frontmatter[field];
    if (typeof value !== 'string' || value.trim() === '') {
      violations.push(`${rel}: missing required field "${field}"`);
    }
  }

  for (const field of OPTIONAL_STRING_FIELDS[type] ?? []) {
    const value = frontmatter[field];
    if (value !== undefined && typeof value !== 'string') {
      violations.push(`${rel}: field "${field}" must be a string`);
    }
  }

  for (const field of STRING_ARRAY_FIELDS[type] ?? []) {
    const value = frontmatter[field];
    if (value !== undefined && !isStringArray(value)) {
      violations.push(
        `${rel}: field "${field}" must be an array of non-empty strings`,
      );
    }
  }

  for (const [field, kind] of Object.entries(
    OPTIONAL_SCALAR_FIELDS[type] ?? {},
  )) {
    const value = frontmatter[field];
    if (value !== undefined && typeof value !== kind) {
      violations.push(`${rel}: field "${field}" must be a ${kind}`);
    }
  }

  return { slug, locale: locale ?? null, rel };
}

function checkLocalePairing(type, entries, locales, violations) {
  if (type !== 'work-experience') return;
  const bySlug = new Map();
  for (const entry of entries) {
    const set = bySlug.get(entry.slug) ?? new Set();
    set.add(entry.locale ?? 'en');
    bySlug.set(entry.slug, set);
  }
  for (const locale of locales) {
    if (locale === 'en') continue;
    for (const slug of bySlug.keys()) {
      const present = bySlug.get(slug);
      if (present !== undefined && !present.has(locale)) {
        violations.push(
          `work-experience/${slug}: missing ${locale} translation (${slug}.${locale}.mdx)`,
        );
      }
    }
  }
  for (const [slug, present] of bySlug) {
    if (!present.has('en')) {
      violations.push(
        `work-experience/${slug}: missing base (en) file — localized files require ${slug}.mdx`,
      );
    }
  }
}

const violations = [];
const locales = supportedLocales();

for (const type of contentTypes()) {
  const dir = path.join(CONTENT_DIR, type);
  const files = readdirSync(dir).filter((name) => name.endsWith('.mdx'));
  const entries = [];
  for (const file of files.toSorted()) {
    const entry = checkFile(type, file, locales, violations);
    // Project content is single-locale — a locale suffix would collide slugs
    // in getAllEntries (it strips the suffix) while getSlugs drops the file.
    if (entry !== null && type === 'projects' && entry.locale !== null) {
      violations.push(
        `projects/${file}: locale suffix not allowed — project content is single-locale`,
      );
    }
    if (entry !== null) entries.push(entry);
  }
  checkLocalePairing(type, entries, locales, violations);
}

if (violations.length > 0) {
  for (const violation of violations) {
    console.error(`Content check FAILED: ${violation}`);
  }
  console.error(`Content check failed with ${violations.length} issue(s).`);
  process.exit(1);
}

console.log('Content check OK: all MDX files valid.');
