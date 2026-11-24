import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { OptionGroup } from './OptionGroup';

const OPTIONS = ['alpha', 'beta', 'gamma'] as const;
type Option = (typeof OPTIONS)[number];

function Harness({ initial = [] as Option[] }: { initial?: Option[] }) {
  const [selected, setSelected] = useState<Option[]>(initial);
  return (
    <OptionGroup<Option>
      label="Pick options"
      options={OPTIONS}
      selected={selected}
      optionLabel={(option) => `Label ${option}`}
      onChange={setSelected}
    />
  );
}

describe('OptionGroup', () => {
  it('renders the group label and every option', () => {
    render(<Harness />);
    expect(screen.getByText('Pick options')).toBeInTheDocument();
    for (const option of OPTIONS) {
      expect(screen.getByLabelText(`Label ${option}`)).toBeInTheDocument();
    }
  });

  it('checks preselected options', () => {
    render(<Harness initial={['beta']} />);
    expect(screen.getByLabelText('Label beta')).toBeChecked();
    expect(screen.getByLabelText('Label alpha')).not.toBeChecked();
  });

  it('toggles options on and off', async () => {
    const user = userEvent.setup();
    render(<Harness initial={['alpha']} />);

    await user.click(screen.getByLabelText('Label gamma'));
    expect(screen.getByLabelText('Label gamma')).toBeChecked();
    expect(screen.getByLabelText('Label alpha')).toBeChecked();

    await user.click(screen.getByLabelText('Label alpha'));
    expect(screen.getByLabelText('Label alpha')).not.toBeChecked();
    expect(screen.getByLabelText('Label gamma')).toBeChecked();
  });
});
