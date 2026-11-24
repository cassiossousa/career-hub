import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useDocumentDraft } from '../../app/useDocumentDraft';
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
import { SkillEditorForm } from './SkillEditorForm';
import { SkillsTable } from './SkillsTable';
import { runSkillSave } from './saveFlow';

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

  const handleSubmit = (event: React.FormEvent) => {
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
    void runSkillSave(
      { setIsSaving, setFeedback },
      () => queryClient.invalidateQueries({ queryKey: SKILLS_QUERY_KEY }),
      async () => {
        for (const id of changes.deletes) await deleteSkill(id);
        for (const update of changes.updates) await updateSkill(update);
        for (const create of changes.creates) await createSkill(create);
      },
      messages.common.saved,
      () => {
        const fresh = queryClient.getQueryData<SkillListPage>(SKILLS_QUERY_KEY);
        if (fresh !== undefined) {
          const next = { rows: toRowDrafts(fresh.skills) };
          setDoc(next);
          setBaseline(next);
        } else {
          setBaseline(doc);
        }
      },
    );
  };

  return (
    <SkillEditorForm
      title={messages.skills.title}
      saveLabel={messages.skills.save}
      feedback={feedback}
      dirty={dirty}
      isSaving={isSaving}
      blocker={blocker}
      onSubmit={handleSubmit}
    >
      <SkillsTable
        rows={doc.rows}
        onChange={bind('rows')}
        disabled={isSaving}
      />
    </SkillEditorForm>
  );
}
