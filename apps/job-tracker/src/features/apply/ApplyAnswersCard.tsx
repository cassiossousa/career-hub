import { useTranslation } from '../../i18n/Provider';
import type { ApplyRun } from '../../services/types/applyRun';
import { ApplyFieldGroups } from './ApplyFieldGroups';
import { ApplyReviewCard } from './ApplyReviewCard';

interface ApplyAnswersCardProps {
  run: ApplyRun;
  draft: Record<string, string>;
  disabled: boolean;
  onChange: (key: string, value: string) => void;
}

export function ApplyAnswersCard({
  run,
  draft,
  disabled,
  onChange,
}: ApplyAnswersCardProps) {
  const { messages } = useTranslation();
  return (
    <ApplyReviewCard title={messages.apply.review.answersTitle}>
      <ApplyFieldGroups
        run={run}
        draft={draft}
        disabled={disabled}
        onChange={onChange}
      />
    </ApplyReviewCard>
  );
}
