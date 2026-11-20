import { Alert, Button, Stack, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useDocumentDraft } from '../../app/useDocumentDraft';
import { errorMessage } from '../../components/AsyncStatus/AsyncStatus';
import { FormCard } from '../../components/FormCard/FormCard';
import { UnsavedChangesDialog } from '../../components/UnsavedChangesDialog/UnsavedChangesDialog';
import { useTranslation } from '../../i18n/Provider';
import {
  SKILLS_QUERY_KEY,
  useCreateSkill,
  useDeleteSkill,
  useUpdateSkill,
} from '../../services/api/skills';
import {
  diffSkillRows,
  findDuplicateSkillName,
  toRowDrafts,
} from '../../services/skills';
import type { Skill, SkillListPage } from '../../services/types/skills';
import { SkillsTable } from './SkillsTable';

// Batch saves invalidate the skills query once, after every mutation settles.
const DEFER_INVALIDATION = { onSuccess: () => undefined } as const;

interface SkillsFormProps {
  skills: Skill[];
}

export function SkillsForm({ skills }: SkillsFormProps) {
  const { messages } = useTranslation();
  const queryClient = useQueryClient();
  const { mutateAsync: createSkill } = useCreateSkill(DEFER_INVALIDATION);
  const { mutateAsync: updateSkill } = useUpdateSkill(DEFER_INVALIDATION);
  const { mutateAsync: deleteSkill } = useDeleteSkill(DEFER_INVALIDATION);
  const {
    doc,
    setDoc,
    baseline,
    setBaseline,
    feedback,
    setFeedback,
    blocker,
    bind,
  } = useDocumentDraft({ rows: toRowDrafts(skills) });
  const [isSaving, setIsSaving] = useState(false);
  const dirty = JSON.stringify(doc) !== JSON.stringify(baseline);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFeedback(null);
    if (doc.rows.some((row) => row.id !== null && row.name.trim() === '')) {
      setFeedback({ type: 'error', text: messages.skills.nameRequired });
      return;
    }
    if (findDuplicateSkillName(doc.rows) !== null) {
      setFeedback({ type: 'error', text: messages.skills.duplicateName });
      return;
    }
    const changes = diffSkillRows(skills, doc.rows);
    if (
      changes.creates.length === 0 &&
      changes.updates.length === 0 &&
      changes.deletes.length === 0
    ) {
      setFeedback({ type: 'success', text: messages.common.saved });
      return;
    }
    setIsSaving(true);
    try {
      for (const id of changes.deletes) await deleteSkill(id);
      for (const update of changes.updates) await updateSkill(update);
      for (const create of changes.creates) await createSkill(create);
      await queryClient.invalidateQueries({ queryKey: SKILLS_QUERY_KEY });
      const fresh = queryClient.getQueryData<SkillListPage>(SKILLS_QUERY_KEY);
      if (fresh !== undefined) {
        const next = { rows: toRowDrafts(fresh.skills) };
        setDoc(next);
        setBaseline(next);
      } else {
        setBaseline(doc);
      }
      setFeedback({ type: 'success', text: messages.common.saved });
    } catch (error) {
      await queryClient.invalidateQueries({ queryKey: SKILLS_QUERY_KEY });
      setFeedback({ type: 'error', text: errorMessage(error) });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FormCard
      onSubmit={(event) => {
        void handleSubmit(event);
      }}
    >
      <Stack spacing={1}>
        <Typography variant="subtitle1">{messages.skills.title}</Typography>
        {feedback && <Alert severity={feedback.type}>{feedback.text}</Alert>}
        <SkillsTable
          rows={doc.rows}
          onChange={bind('rows')}
          disabled={isSaving}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={isSaving || !dirty}
          sx={{ alignSelf: 'flex-start' }}
        >
          {isSaving ? messages.common.saving : messages.skills.save}
        </Button>
        <UnsavedChangesDialog blocker={blocker} />
      </Stack>
    </FormCard>
  );
}
