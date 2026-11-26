import { PAGE_BLOCK_GAP_PX, type PageUnit, packPageUnits } from './pagination';

function block(height: number): PageUnit {
  return { kind: 'block', height };
}
function head(section: number, height = 40): PageUnit {
  return { kind: 'head', height, section };
}
function entry(
  section: number,
  index: number,
  height = 60,
  entryGap = 16,
): PageUnit {
  return { kind: 'entry', height, section, entry: index, entryGap };
}

describe('packPageUnits', () => {
  it('returns a single page when everything fits', () => {
    const units = [block(100), head(0), entry(0, 0), block(50)];
    expect(packPageUnits(units, 1000)).toEqual([[0, 1, 2, 3]]);
  });

  it('packs blocks with the top-level gap between them', () => {
    // capacity 200: block(100) + gap24 + block(60) = 184 fits; +gap24+block(60)=268 no
    const units = [block(100), block(60), block(60)];
    expect(packPageUnits(units, 200)).toEqual([[0, 1], [2]]);
  });

  it('flows section entries across pages and continues bare', () => {
    const units = [
      block(900), // fills most of page 1 (capacity 1000)
      head(0, 40),
      entry(0, 0, 100),
      entry(0, 1, 100),
      entry(0, 2, 100),
    ];
    // page1: block(900). head+firstEntry = 40+24? head is not page-first here:
    // head cost = 40 + 24 gap + 100 entry = 164 > 100 remaining → new page.
    // page2: head(40) + entry(100) + gap16 + entry(100) = 256; +entry = 372 > 1000? no, fits.
    expect(packPageUnits(units, 1000)).toEqual([[0], [1, 2, 3, 4]]);
  });

  it('bonds a section head to its first entry', () => {
    const units = [block(960), head(0, 40), entry(0, 0, 60)];
    // head+entry needs 40+24+60=124 > 40 remaining → both move to page 2
    expect(packPageUnits(units, 1000)).toEqual([[0], [1, 2]]);
  });

  it('keeps head and first entry together even when they overflow', () => {
    const units = [head(0, 900), entry(0, 0, 900)];
    // capacity 1000: head(900) placed; entry cost 900 > 100 remaining,
    // but bonded → stays on the same (overflowing) page.
    expect(packPageUnits(units, 1000)).toEqual([[0, 1]]);
  });

  it('charges the entry gap only between consecutive same-section entries', () => {
    const units = [
      head(0, 40),
      entry(0, 0, 100, 16),
      entry(0, 1, 100, 16),
      head(1, 40),
      entry(1, 0, 100, 8),
    ];
    // page capacity 400: head40 + e100 + gap16 + e100 = 256; +head1(24+40)+e1(8? no—entry after head gap 0 → 100) = 420 > 400 → page2
    // Wait: head(1) gap = PAGE_BLOCK_GAP 24 + 40 = 64; entry(1,0) gap 0 +100 → total page1 would be 256+164=420 >400 → split.
    expect(packPageUnits(units, 400)).toEqual([
      [0, 1, 2],
      [3, 4],
    ]);
  });

  it('treats a non-fitting lone unit as its own overflowing page', () => {
    const units = [block(2000)];
    expect(packPageUnits(units, 500)).toEqual([[0]]);
  });

  it('returns all units on one page when capacity is unknown', () => {
    const units = [block(10), block(10)];
    expect(packPageUnits(units, 0)).toEqual([[0, 1]]);
  });

  it('returns no pages for empty input', () => {
    expect(packPageUnits([], 500)).toEqual([]);
  });

  it('uses the documented block gap constant', () => {
    expect(PAGE_BLOCK_GAP_PX).toBe(24);
  });
});
