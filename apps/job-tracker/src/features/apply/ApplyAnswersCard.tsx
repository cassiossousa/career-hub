import { useTranslation } from '../../i18n/Provider';
import {
  ApplyFieldGroups,
  type ApplyFieldGroupsProps,
} from './ApplyFieldGroups';
import { ApplyReviewCard } from './ApplyReviewCard';

export function ApplyAnswersCard({
  run,
  draft,
  disabled,
  onChange,
  onRedraftField,
}: ApplyFieldGroupsProps) {
  const { messages } = useTranslation();
  return (
    <ApplyReviewCard title={messages.apply.review.answersTitle}>
      <ApplyFieldGroups
        run={run}
        draft={draft}
        disabled={disabled}
        onChange={onChange}
        onRedraftField={onRedraftField}
      />
    </ApplyReviewCard>
  );
}
