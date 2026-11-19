import { render, screen } from '@testing-library/react';
import BulletList from './BulletList';

describe('BulletList', () => {
  it('renders unordered list semantics for bullet items', () => {
    render(
      <BulletList>
        <li>First item</li>
        <li>Second item</li>
      </BulletList>,
    );

    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
});
