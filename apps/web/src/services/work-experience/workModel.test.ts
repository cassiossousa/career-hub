import { sortRolesByStart, type WorkRole } from './workModel';

describe('sortRolesByStart', () => {
  it('sorts roles newest first without mutating the input', () => {
    const roles: WorkRole[] = [
      {
        company: 'Older company',
        title: 'Engineer',
        start: '2020-01-01',
        period: '2020',
        bullets: [],
      },
      {
        company: 'Newer company',
        title: 'Engineer',
        start: '2024-01-01',
        period: '2024',
        bullets: [],
      },
    ];
    const originalRoles = [...roles];

    const sortedRoles = sortRolesByStart(roles);

    expect(sortedRoles.map(({ company }) => company)).toEqual([
      'Newer company',
      'Older company',
    ]);
    expect(roles).toEqual(originalRoles);
  });
});
