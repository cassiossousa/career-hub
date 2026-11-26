/**
 * Pure pagination math for `PagedResume`. Heights arrive in px from DOM
 * measurement; gaps are analytic because they come from MUI `Stack spacing`
 * on a fixed 8px rhythm (spacing={3} → 24px between top-level blocks,
 * spacing={2}/`{1}` → 16px/8px between entries).
 */

/** Gap between top-level blocks on the same page (Stack spacing={3}). */
export const PAGE_BLOCK_GAP_PX = 24;

export interface PageUnit {
  kind: 'block' | 'head' | 'entry';
  /** Content height in px, margins excluded. */
  height: number;
  /** Section index for 'head'/'entry' units. */
  section?: number | undefined;
  /** Entry index within the section for 'entry' units. */
  entry?: number | undefined;
  /** Gap between consecutive entries of this section (Stack spacing). */
  entryGap?: number | undefined;
}

function unitGap(units: PageUnit[], index: number, page: number[]): number {
  if (page.length === 0) return 0;
  const unit = units[index];
  if (unit?.kind === 'entry') {
    const previous = units[page[page.length - 1] ?? -1];
    if (previous?.kind === 'entry' && previous.section === unit.section) {
      return unit.entryGap ?? 0;
    }
    // First entry after its own section head: the head height already
    // includes the margin above the entries stack.
    return 0;
  }
  return PAGE_BLOCK_GAP_PX;
}

/** An entry directly after its own section head on the same page. */
function isBondedEntry(units: PageUnit[], index: number, page: number[]) {
  const unit = units[index];
  const last = units[page[page.length - 1] ?? -1];
  return (
    unit?.kind === 'entry' &&
    last?.kind === 'head' &&
    last.section === unit.section
  );
}

/** Height + preceding gap, plus the first entry when the head is bonded. */
function unitFit(
  units: PageUnit[],
  index: number,
  unit: PageUnit,
  page: number[],
  gap: number,
): number {
  let fit = unit.height + gap;
  if (unit.kind === 'head' && page.length > 0) {
    const firstEntry = units[index + 1];
    if (firstEntry?.kind === 'entry' && firstEntry.section === unit.section) {
      fit += firstEntry.height;
    }
  }
  return fit;
}

/**
 * Greedy first-fit packing of measured units into fixed-capacity pages.
 * A section 'head' is bonded to its first entry — they always land on the
 * same page, even when the pair overflows a page. Returns pages as lists
 * of unit indices.
 */
export function packPageUnits(
  units: PageUnit[],
  capacityPx: number,
): number[][] {
  if (capacityPx <= 0) {
    return units.length ? [units.map((_, i) => i)] : [];
  }

  const pages: number[][] = [];
  let page: number[] = [];
  let used = 0;

  const flush = () => {
    if (page.length > 0) pages.push(page);
    page = [];
    used = 0;
  };

  for (let i = 0; i < units.length; i += 1) {
    const unit = units[i];
    if (!unit) continue;

    const gap = unitGap(units, i, page);
    const fit = unitFit(units, i, unit, page, gap);

    if (
      used + fit > capacityPx &&
      page.length > 0 &&
      !isBondedEntry(units, i, page)
    ) {
      flush();
      page.push(i);
      used = unit.height;
      continue;
    }

    page.push(i);
    used += unit.height + gap;
  }
  flush();
  return pages;
}
