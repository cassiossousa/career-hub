import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useDocumentDraft } from '../../app/useDocumentDraft';
import { useTranslation } from '../../i18n/Provider';
import {
  SKILL_GROUP_LABELS_QUERY_KEY,
  SKILLS_QUERY_KEY,
  useReplaceSkillGroupLabels,
  useUpdateSkill,
} from '../../services/api/skills';
import {
  applyLabelEdits,
  diffLabelEdits,
  type LabelEdits,
  labelEntryKey,
  toLabelEntries,
} from '../../services/skills';
import type { Skill, SkillGroupLabels } from '../../services/types/skills';
import type { Locale } from '../../types/i18n';
import { LabelsTable } from './LabelsTable';
import { SkillEditorForm } from './SkillEditorForm';
import { runSkillSave } from './saveFlow';

// Batch saves invalidate the skills queries once, after every mutation settles.
const DEFER_INVALIDATION = { onSuccess: () => undefined } as const;

interface LabelsDoc {
  edits: LabelEdits;
}

interface LabelsFormProps {
  skills: Skill[];
  groupLabels: SkillGroupLabels[];
}

export function LabelsForm({ skills, groupLabels }: LabelsFormProps) {
  const { messages } = useTranslation();
  const queryClient = useQueryClient();
  const { mutateAsync: updateSkill } = useUpdateSkill(DEFER_INVALIDATION);
  const { mutateAsync: replaceGroupLabels } =
    useReplaceSkillGroupLabels(DEFER_INVALIDATION);
  const { doc, setDoc, baseline, setBaseline, feedback, setFeedback, blocker } =
    useDocumentDraft<LabelsDoc>({ edits: {} });
  const [isSaving, setIsSaving] = useState(false);
  const dirty = JSON.stringify(doc) !== JSON.stringify(baseline);

  const serverEntries = toLabelEntries(skills, groupLabels);
  const rows = applyLabelEdits(serverEntries, doc.edits);

  const handleLabelChange = (key: string, locale: Locale, value: string) => {
    setDoc((prev) => {
      const entry = serverEntries.find((e) => labelEntryKey(e) === key);
      if (entry === undefined) return prev;
      const base = prev.edits[key] ?? entry.labels;
      return {
        edits: { ...prev.edits, [key]: { ...base, [locale]: value } },
      };
    });
  };

  const invalidateSkillsQueries = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: SKILLS_QUERY_KEY }),
      queryClient.invalidateQueries({
        queryKey: SKILL_GROUP_LABELS_QUERY_KEY,
      }),
    ]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFeedback(null);
    const changes = diffLabelEdits(serverEntries, doc.edits);
    if (
      changes.skillUpdates.length === 0 &&
      changes.groupUpdates.length === 0
    ) {
      setFeedback({ type: 'success', text: messages.common.saved });
      return;
    }
    void runSkillSave(
      { setIsSaving, setFeedback },
      invalidateSkillsQueries,
      async () => {
        for (const update of changes.skillUpdates) {
          await updateSkill({
            id: update.id,
            patch: { labels: update.labels },
          });
        }
        for (const update of changes.groupUpdates) {
          await replaceGroupLabels({
            group: update.group,
            labels: update.labels,
          });
        }
      },
      messages.common.saved,
      // Clearing edits falls back to the refetched server labels.
      () => {
        setDoc({ edits: {} });
        setBaseline({ edits: {} });
      },
    );
  };

  return (
    <SkillEditorForm
      title={messages.skills.labelsTitle}
      description={messages.skills.labelsDescription}
      saveLabel={messages.skills.saveLabels}
      feedback={feedback}
      dirty={dirty}
      isSaving={isSaving}
      blocker={blocker}
      onSubmit={handleSubmit}
    >
      <LabelsTable
        rows={rows}
        onLabelChange={handleLabelChange}
        disabled={isSaving}
      />
    </SkillEditorForm>
  );
}
