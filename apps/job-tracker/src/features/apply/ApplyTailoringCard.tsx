import { Typography } from '@mui/material';
import { MatchPanel } from '../../components/MatchPanel/MatchPanel';
import { useTranslation } from '../../i18n/Provider';
import { ApplyReviewCard } from './ApplyReviewCard';

interface ApplyTailoringCardProps {
  jobId: number;
  applicationId: number;
}

export function ApplyTailoringCard({
  jobId,
  applicationId,
}: ApplyTailoringCardProps) {
  const { messages } = useTranslation();
  return (
    <ApplyReviewCard title={messages.apply.review.tailoringTitle}>
      <Typography variant="body2" color="text.secondary">
        {messages.apply.review.tailoringHint}
      </Typography>
      <MatchPanel jobId={jobId} applicationId={applicationId} />
    </ApplyReviewCard>
  );
}
