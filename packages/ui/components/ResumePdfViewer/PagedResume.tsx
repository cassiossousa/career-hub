import { Box, GlobalStyles, Paper, Stack, Typography } from '@mui/material';
import {
  Fragment,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { RESUME_PRINT_CLASS } from '../printPage';
import { type PageUnit, packPageUnits } from './pagination';
import { ResumePdfHeader } from './ResumePdfHeader';
import {
  CertificationsSection,
  EducationSection,
  ExperienceSection,
  LanguagesSection,
  ProjectsSection,
  ResumePdfSection,
  SkillGroupsSection,
} from './ResumePdfSections';
import type { ResumePdfDocument, ResumePdfViewerLabels } from './types';

/** A4 at 96dpi: 210×297mm; 14mm padding leaves a 269mm content area. */
const PAGE_WIDTH_SX = '210mm';
const PAGE_MIN_HEIGHT_SX = '297mm';
const PAGE_PADDING_SX = '14mm';
const PAGE_CONTENT_HEIGHT_SX = '269mm';

const pagedPrintGlobalStyles = {
  '@page': { size: 'A4', margin: '0' },
} as const;

function pagedPageSx(isLast: boolean) {
  return {
    boxSizing: 'border-box',
    fontFamily: 'system-ui, sans-serif',
    fontSize: 13,
    lineHeight: 1.5,
    width: PAGE_WIDTH_SX,
    maxWidth: '100%',
    minHeight: PAGE_MIN_HEIGHT_SX,
    p: PAGE_PADDING_SX,
    '@media print': {
      width: PAGE_WIDTH_SX,
      maxWidth: 'none',
      height: PAGE_MIN_HEIGHT_SX,
      minHeight: 0,
      m: 0,
      border: 0,
      boxShadow: 'none',
      pageBreakAfter: isLast ? 'auto' : 'always',
      breakInside: 'avoid',
      WebkitBoxDecorationBreak: 'clone',
      boxDecorationBreak: 'clone',
    },
  } as const;
}

interface SectionDescriptor {
  entryGap: number;
  renderSlice: (start: number, count: number, bare: boolean) => ReactNode;
}

type PdfChunkKind = 'block' | 'section';

interface MeasureBlock {
  key: string;
  kind: PdfChunkKind;
  node: ReactNode;
  sectionIndex?: number | undefined;
  entryGap?: number | undefined;
}

type ResumePageUnit = PageUnit & { node?: ReactNode | undefined };

interface PagedLayout {
  pages: number[][];
  units: ResumePageUnit[];
}

interface Chunk {
  key: string;
  type: PdfChunkKind;
  node?: ReactNode | undefined;
  section?: number | undefined;
  start?: number | undefined;
  count?: number | undefined;
  titled?: boolean | undefined;
}

function buildBlocks(
  document: ResumePdfDocument,
  labels: ResumePdfViewerLabels,
): { blocks: MeasureBlock[]; sections: SectionDescriptor[] } {
  const blocks: MeasureBlock[] = [];
  const sections: SectionDescriptor[] = [];
  const addEntries = <T,>(
    entries: T[] | undefined,
    entryGap: number,
    render: (slice: T[], bare: boolean) => ReactNode,
  ): void => {
    if (!entries?.length) return;
    const sectionIndex = sections.length;
    sections.push({
      entryGap,
      renderSlice: (start, count, bare) =>
        render(entries.slice(start, start + count), bare),
    });
    blocks.push({
      key: `section-${sectionIndex}`,
      kind: 'section',
      sectionIndex,
      entryGap,
      node: render(entries, false),
    });
  };

  blocks.push({
    key: 'header',
    kind: 'block',
    node: <ResumePdfHeader basics={document.basics} />,
  });
  if (document.summary) {
    blocks.push({
      key: 'summary',
      kind: 'block',
      node: (
        <ResumePdfSection title={labels.summary}>
          <Typography variant="body2">{document.summary}</Typography>
        </ResumePdfSection>
      ),
    });
  }
  addEntries(document.experience, 16, (slice, bare) => (
    <ExperienceSection title={labels.experience} entries={slice} bare={bare} />
  ));
  addEntries(document.projects, 16, (slice, bare) => (
    <ProjectsSection
      title={labels.projects}
      entries={slice}
      repositoryLabel={labels.repository}
      demoLabel={labels.demo}
      bare={bare}
    />
  ));
  if ((document.skillGroups ?? []).some((g) => g.items.length > 0)) {
    blocks.push({
      key: 'skillGroups',
      kind: 'block',
      node: (
        <SkillGroupsSection
          title={labels.skillGroups}
          groups={document.skillGroups}
        />
      ),
    });
  }
  addEntries(document.education, 16, (slice, bare) => (
    <EducationSection title={labels.education} entries={slice} bare={bare} />
  ));
  addEntries(document.certifications, 8, (slice, bare) => (
    <CertificationsSection
      title={labels.certifications}
      entries={slice}
      bare={bare}
    />
  ));
  if (document.languages?.length) {
    blocks.push({
      key: 'languages',
      kind: 'block',
      node: (
        <LanguagesSection
          title={labels.languages}
          entries={document.languages}
        />
      ),
    });
  }
  return { blocks, sections };
}

interface OpenSectionChunk {
  key: string;
  section: number;
  start: number;
  count: number;
  titled: boolean;
}

function chunksForPage(indices: number[], units: ResumePageUnit[]): Chunk[] {
  const chunks: Chunk[] = [];
  let open: OpenSectionChunk | null = null;
  const close = () => {
    if (open) {
      chunks.push({
        key: open.key,
        type: 'section',
        section: open.section,
        start: open.start,
        count: open.count,
        titled: open.titled,
      });
      open = null;
    }
  };
  const openEntry = (index: number, unit: ResumePageUnit) => {
    if (!open || open.section !== unit.section) {
      close();
      open = {
        key: `u${index}`,
        section: unit.section ?? -1,
        start: unit.entry ?? 0,
        count: 0,
        titled: false,
      };
    }
    open.count += 1;
  };
  for (const index of indices) {
    const unit = units[index];
    if (!unit) continue;
    if (unit.kind === 'block') {
      close();
      if (unit.node) {
        chunks.push({ key: `u${index}`, type: 'block', node: unit.node });
      }
      continue;
    }
    if (unit.kind === 'entry') {
      openEntry(index, unit);
      continue;
    }
    close();
    open = {
      key: `u${index}`,
      section: unit.section ?? -1,
      start: 0,
      count: 0,
      titled: true,
    };
  }
  close();
  return chunks;
}

/**
 * Renders the resume as fixed A4 pages. A hidden measuring pass captures
 * every block/entry height, `packPageUnits` distributes them across pages,
 * and each page re-renders only its slice — section continuations use the
 * `bare` variant so titles never repeat.
 */
export function PagedResume({
  document,
  labels,
}: {
  document: ResumePdfDocument;
  labels: ResumePdfViewerLabels;
}) {
  const { blocks, sections } = useMemo(
    () => buildBlocks(document, labels),
    [document, labels],
  );
  const [layout, setLayout] = useState<{
    forBlocks: typeof blocks;
    value: PagedLayout;
  } | null>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLDivElement>(null);

  // The measured layout is only valid for the blocks it was computed
  // from; new content falls back to the measuring pass, which re-runs
  // before the next paint.
  const current = layout && layout.forBlocks === blocks ? layout.value : null;

  useLayoutEffect(() => {
    if (current) return;
    const container = measureRef.current;
    const probe = probeRef.current;
    if (!container || !probe) return;
    const capacity = probe.offsetHeight;
    const units: ResumePageUnit[] = [];
    container
      .querySelectorAll<HTMLElement>('[data-pdf-block]')
      .forEach((wrapper, index) => {
        const spec = blocks[index];
        if (spec?.kind === 'section') {
          const sectionEl = wrapper.querySelector('section');
          const contentEl = sectionEl?.lastElementChild;
          if (
            sectionEl instanceof HTMLElement &&
            contentEl instanceof HTMLElement
          ) {
            units.push({
              kind: 'head',
              height: sectionEl.offsetHeight - contentEl.offsetHeight,
              section: spec.sectionIndex,
            });
            Array.from(contentEl.children).forEach((article, entry) => {
              if (article instanceof HTMLElement) {
                units.push({
                  kind: 'entry',
                  height: article.offsetHeight,
                  section: spec.sectionIndex,
                  entry,
                  entryGap: spec.entryGap,
                });
              }
            });
          }
        } else {
          units.push({
            kind: 'block',
            height: wrapper.offsetHeight,
            node: spec?.node,
          });
        }
      });
    setLayout({
      forBlocks: blocks,
      value: { pages: packPageUnits(units, capacity), units },
    });
  }, [current, blocks]);

  useEffect(() => {
    const onResize = () => {
      setLayout(null);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  if (!current) {
    return (
      <>
        <GlobalStyles styles={pagedPrintGlobalStyles} />
        <Box
          ref={probeRef}
          aria-hidden
          data-pdf-probe
          sx={{
            height: PAGE_CONTENT_HEIGHT_SX,
            visibility: 'hidden',
            position: 'absolute',
            pointerEvents: 'none',
          }}
        />
        <Box
          ref={measureRef}
          aria-hidden
          sx={{
            visibility: 'hidden',
            height: 0,
            overflow: 'hidden',
            width: PAGE_WIDTH_SX,
            maxWidth: '100%',
            p: PAGE_PADDING_SX,
            boxSizing: 'border-box',
            fontFamily: 'system-ui, sans-serif',
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          <Stack spacing={3}>
            {blocks.map((block) => (
              <div key={block.key} data-pdf-block={block.key}>
                {block.node}
              </div>
            ))}
          </Stack>
        </Box>
      </>
    );
  }

  const lastIndex = current.pages.length - 1;
  return (
    <>
      <GlobalStyles styles={pagedPrintGlobalStyles} />
      {current.pages.map((pageUnits, pageIndex) => (
        <Paper
          key={`page-${pageUnits[0]}-${pageUnits[pageUnits.length - 1]}`}
          className={RESUME_PRINT_CLASS}
          component="article"
          variant="outlined"
          square
          elevation={0}
          sx={pagedPageSx(pageIndex === lastIndex)}
        >
          <Stack spacing={3}>
            {chunksForPage(pageUnits, current.units).map((chunk) => {
              if (chunk.type === 'block') {
                return <Fragment key={chunk.key}>{chunk.node}</Fragment>;
              }
              const section = sections[chunk.section ?? -1];
              return (
                <Fragment key={chunk.key}>
                  {section?.renderSlice(
                    chunk.start ?? 0,
                    chunk.count ?? 0,
                    !(chunk.titled ?? false),
                  )}
                </Fragment>
              );
            })}
          </Stack>
        </Paper>
      ))}
    </>
  );
}
