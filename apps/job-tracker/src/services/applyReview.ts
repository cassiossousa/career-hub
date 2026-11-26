import type { ApplyFormField, ApplyRun } from './types/applyRun';

export interface ApplyFieldGroup {
  /** Raw section key; null means the field had no section. */
  section: string | null;
  fields: ApplyFormField[];
}

/** Groups form fields by their declared section, preserving first-seen order. */
export function groupFieldsBySection(
  fields: readonly ApplyFormField[],
): ApplyFieldGroup[] {
  const groups = new Map<string | null, ApplyFormField[]>();
  for (const field of fields) {
    const bucket = groups.get(field.section);
    if (bucket === undefined) {
      groups.set(field.section, [field]);
    } else {
      bucket.push(field);
    }
  }
  return [...groups.entries()].map(([section, groupFields]) => ({
    section,
    fields: groupFields,
  }));
}

/** Editable draft values keyed by field key (missing answers start empty). */
export function draftAnswersFromRun(run: ApplyRun): Record<string, string> {
  const draft: Record<string, string> = {};
  for (const field of run.formFields) {
    draft[field.key] = run.proposedAnswers[field.key]?.value ?? '';
  }
  return draft;
}

/**
 * Changed draft entries to send as an `edit` review overlay. Entries equal
 * to the proposed value are omitted; cleared fields are sent as ''.
 */
export function dirtyAnswerEdits(
  draft: Record<string, string>,
  run: ApplyRun,
): Record<string, string> {
  const edits: Record<string, string> = {};
  for (const field of run.formFields) {
    const next = draft[field.key] ?? '';
    const current = run.proposedAnswers[field.key]?.value ?? '';
    if (next !== current) {
      edits[field.key] = next;
    }
  }
  return edits;
}

/** Required fields still lacking a usable proposed answer. */
export function missingRequiredFields(run: ApplyRun): ApplyFormField[] {
  return run.formFields.filter(
    (field) =>
      field.required &&
      (run.proposedAnswers[field.key] === undefined ||
        run.proposedAnswers[field.key]?.source === 'none'),
  );
}
