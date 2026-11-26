import { useQueryClient } from '@tanstack/react-query';
import { useDocumentForm } from '../../app/useDocumentForm';
import { errorMessage } from '../../components/AsyncStatus/AsyncStatus';
import { EditorForm } from '../../components/EditorForm/EditorForm';
import { useTranslation } from '../../i18n/Provider';
import {
  PROFILE_FACTS_QUERY_KEY,
  useDeleteProfileFact,
  useUpsertProfileFact,
} from '../../services/api/facts';
import {
  diffFactRows,
  type FactRowError,
  findFactRowError,
  toFactRowDrafts,
} from '../../services/facts';
import type {
  ProfileFact,
  ProfileFactListPage,
} from '../../services/types/facts';
import { FactsTable } from './FactsTable';

// Batch saves invalidate the facts query once, after every mutation settles.
const DEFER_INVALIDATION = { onSuccess: () => undefined } as const;

const ROW_ERRORS: Record<FactRowError, keyof FactsFormMessages> = {
  keyRequired: 'keyRequired',
  invalidKey: 'invalidKey',
  duplicateKey: 'duplicateKey',
  valueRequired: 'valueRequired',
};

interface FactsFormMessages {
  keyRequired: string;
  invalidKey: string;
  duplicateKey: string;
  valueRequired: string;
}

interface FactsFormProps {
  facts: ProfileFact[];
}

export function FactsForm({ facts }: FactsFormProps) {
  const { messages } = useTranslation();
  const queryClient = useQueryClient();
  const { mutateAsync: upsertFact } = useUpsertProfileFact(DEFER_INVALIDATION);
  const { mutateAsync: deleteFact } = useDeleteProfileFact(DEFER_INVALIDATION);
  const {
    doc,
    setDoc,
    setBaseline,
    feedback,
    setFeedback,
    blocker,
    bind,
    dirty,
    isSaving,
    setIsSaving,
  } = useDocumentForm({ rows: toFactRowDrafts(facts) });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFeedback(null);
    const rowError = findFactRowError(doc.rows);
    if (rowError !== null) {
      setFeedback({
        type: 'error',
        text: messages.facts[ROW_ERRORS[rowError]],
      });
      return;
    }
    const changes = diffFactRows(facts, doc.rows);
    if (changes.upserts.length === 0 && changes.deletes.length === 0) {
      setFeedback({ type: 'success', text: messages.common.saved });
      return;
    }
    setIsSaving(true);
    void (async () => {
      try {
        for (const key of changes.deletes) await deleteFact(key);
        for (const change of changes.upserts) {
          await upsertFact({ key: change.key, fact: change.fact });
        }
        await queryClient.invalidateQueries({
          queryKey: PROFILE_FACTS_QUERY_KEY,
        });
        const fresh = queryClient.getQueryData<ProfileFactListPage>(
          PROFILE_FACTS_QUERY_KEY,
        );
        if (fresh !== undefined) {
          const next = { rows: toFactRowDrafts(fresh.facts) };
          setDoc(next);
          setBaseline(next);
        } else {
          setBaseline(doc);
        }
        setFeedback({ type: 'success', text: messages.common.saved });
      } catch (error) {
        await queryClient.invalidateQueries({
          queryKey: PROFILE_FACTS_QUERY_KEY,
        });
        setFeedback({ type: 'error', text: errorMessage(error) });
      } finally {
        setIsSaving(false);
      }
    })();
  };

  return (
    <EditorForm
      title={messages.facts.title}
      saveLabel={messages.facts.save}
      feedback={feedback}
      dirty={dirty}
      isSaving={isSaving}
      blocker={blocker}
      onSubmit={handleSubmit}
    >
      <FactsTable rows={doc.rows} onChange={bind('rows')} disabled={isSaving} />
    </EditorForm>
  );
}
