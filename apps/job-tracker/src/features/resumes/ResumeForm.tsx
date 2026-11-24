import type { ResumePdfViewerLabels } from '@career-hub/ui/components';
import {
  Alert,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { routePaths } from '../../app/routePaths';
import { useDocumentDraft } from '../../app/useDocumentDraft';
import { AccordionSection } from '../../components/AccordionSection/AccordionSection';
import { errorMessage } from '../../components/AsyncStatus/AsyncStatus';
import { DocumentEditorLayout } from '../../components/DocumentEditorLayout/DocumentEditorLayout';
import {
  BasicsEditor,
  CertificationEditor,
  EducationEditor,
  ExperienceEditor,
  LanguageEditor,
  ProjectEditor,
  SkillGroupsEditor,
} from '../../components/EntryEditors/EntryEditors';
import { UnsavedChangesDialog } from '../../components/UnsavedChangesDialog/UnsavedChangesDialog';
import { useTranslation } from '../../i18n/Provider';
import { isApiError } from '../../services/api/client';
import { useUpsertApplicationResume } from '../../services/api/resumes';
import { toResumePdfDocument } from '../../services/resumePreview';
import type { ResumeDocument } from '../../services/types/resume';
import { LOCALES } from '../../types/i18n';

interface ResumeFormProps {
  applicationId: number;
  initial: ResumeDocument;
  locked: boolean;
  seededFromPortfolio: boolean;
  onSaved: () => void;
}

export function ResumeForm({
  applicationId,
  initial,
  locked,
  seededFromPortfolio,
  onSaved,
}: ResumeFormProps) {
  const { messages, locale } = useTranslation();
  const navigate = useNavigate();
  const { mutate: upsertResume, isPending } =
    useUpsertApplicationResume(applicationId);
  const {
    doc,
    setDoc,
    setBaseline,
    feedback,
    setFeedback,
    blocker,
    bind,
    set,
  } = useDocumentDraft(initial, !locked);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    upsertResume(doc, {
      onSuccess: () => {
        setBaseline(doc);
        onSaved();
      },
      onError: (error) => {
        if (isApiError(error) && error.code === 'resume_locked') {
          setFeedback({
            type: 'error',
            text: messages.resumes.lockedError,
          });
          return;
        }
        setFeedback({ type: 'error', text: errorMessage(error) });
      },
    });
  };

  const t = messages.resumes.sections;

  const previewDocument = useMemo(
    () =>
      toResumePdfDocument(doc, locale, {
        presentLabel: messages.resumes.experience.present,
        linkKindLabels: messages.resumes.basics.linkKinds,
        skillCategoryLabels: messages.resumes.skillGroups.categories,
      }),
    [doc, locale, messages],
  );

  const previewLabels: ResumePdfViewerLabels = {
    summary: t.summary,
    experience: t.experience,
    projects: t.projects,
    skillGroups: t.skillGroups,
    education: t.education,
    certifications: t.certifications,
    languages: t.languages,
    repository: messages.resumes.preview.repository,
    demo: messages.resumes.preview.demo,
  };

  return (
    <DocumentEditorLayout
      onSubmit={handleSubmit}
      feedback={feedback}
      previewTitle={messages.resumes.preview.title}
      previewDocument={previewDocument}
      previewLabels={previewLabels}
    >
      {seededFromPortfolio && !locked && (
        <Alert severity="info">{messages.resumes.seededNotice}</Alert>
      )}
      {locked && <Alert severity="warning">{messages.resumes.locked}</Alert>}
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>{messages.resumes.locale}</InputLabel>
        <Select
          value={doc.locale}
          label={messages.resumes.locale}
          disabled={locked}
          onChange={(e) => {
            setDoc((prev) => ({ ...prev, locale: e.target.value }));
          }}
        >
          {LOCALES.map((l) => (
            <MenuItem key={l} value={l}>
              {messages.common.locales[l]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <AccordionSection title={t.basics} defaultExpanded>
        <BasicsEditor
          value={doc.basics}
          onChange={bind('basics')}
          disabled={locked}
        />
      </AccordionSection>
      <AccordionSection title={t.summary}>
        <TextField
          label={t.summary}
          value={doc.summary}
          onChange={(e) => {
            set('summary', e.target.value);
          }}
          required
          multiline
          rows={4}
          fullWidth
          disabled={locked}
          slotProps={{ htmlInput: { maxLength: 2000 } }}
        />
      </AccordionSection>
      <AccordionSection title={t.experience}>
        <ExperienceEditor
          value={doc.experience}
          onChange={bind('experience')}
          disabled={locked}
        />
      </AccordionSection>
      <AccordionSection title={t.projects}>
        <ProjectEditor
          value={doc.projects}
          onChange={bind('projects')}
          disabled={locked}
        />
      </AccordionSection>
      <AccordionSection title={t.skillGroups}>
        <SkillGroupsEditor
          value={doc.skillGroups}
          onChange={bind('skillGroups')}
          disabled={locked}
        />
      </AccordionSection>
      <AccordionSection title={t.education}>
        <EducationEditor
          value={doc.education}
          onChange={bind('education')}
          disabled={locked}
        />
      </AccordionSection>
      <AccordionSection title={t.certifications}>
        <CertificationEditor
          value={doc.certifications}
          onChange={bind('certifications')}
          disabled={locked}
        />
      </AccordionSection>
      <AccordionSection title={t.languages}>
        <LanguageEditor
          value={doc.languages}
          onChange={bind('languages')}
          disabled={locked}
        />
      </AccordionSection>
      <Stack direction="row" spacing={1}>
        <Button
          type="submit"
          variant="contained"
          disabled={isPending || locked}
        >
          {isPending ? messages.common.saving : messages.common.save}
        </Button>
        <Button
          variant="text"
          onClick={() => {
            void navigate(routePaths.applications);
          }}
        >
          {messages.common.back}
        </Button>
      </Stack>
      <UnsavedChangesDialog blocker={blocker} />
    </DocumentEditorLayout>
  );
}
