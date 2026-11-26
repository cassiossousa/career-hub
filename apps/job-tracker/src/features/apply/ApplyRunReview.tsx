import { useParams } from 'react-router-dom';
import {
  EmptyState,
  QueryGate,
} from '../../components/AsyncStatus/AsyncStatus';
import { useTranslation } from '../../i18n/Provider';
import { useApplyRun } from '../../services/api/applyRuns';
import { ApplyRunReviewBody } from './ApplyRunReviewBody';

function parseRunId(raw: string | undefined): number | null {
  const parsed = raw === undefined ? Number.NaN : Number.parseInt(raw, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function ApplyRunReview() {
  const { id } = useParams<{ id: string }>();
  const runId = parseRunId(id);
  const { messages } = useTranslation();
  const runQuery = useApplyRun(runId ?? 0, { enabled: runId !== null });

  if (runId === null) {
    return <EmptyState title={messages.apply.notFound} />;
  }

  return (
    <QueryGate
      query={runQuery}
      subject={messages.apply.reviewTitle}
      empty={<EmptyState title={messages.apply.notFound} />}
    >
      {(run) => <ApplyRunReviewBody key={run.id} run={run} />}
    </QueryGate>
  );
}
