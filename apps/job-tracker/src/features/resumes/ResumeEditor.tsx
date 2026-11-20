import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Button,
  Chip,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { type ReactNode, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { routePaths } from '../../app/routePaths';
import {
  EmptyState,
  errorMessage,
  LoadingState,
  QueryErrorAlert,
} from '../../components/AsyncStatus/AsyncStatus';
import { FormCard } from '../../components/FormCard/FormCard';
import { useTranslation } from '../../i18n/Provider';
import { useApplication } from '../../services/api/applications';
import { isApiError } from '../../services/api/client';
import { useJobTitleById } from '../../services/api/jobs';
import { usePortfolio } from '../../services/api/portfolio';
import {
  useApplicationResume,
  useUpsertApplicationResume,
} from '../../services/api/resumes';
import type { PortfolioContent } from '../../services/types/portfolio';
import type { Resume, ResumeDocument } from '../../services/types/resume';
import {
  BasicsEditor,
  CertificationEditor,
  EducationEditor,
  ExperienceEditor,
  LanguageEditor,
  ProjectEditor,
  SkillGroupsEditor,
} from './EntryEditors';

function isResumeLocked(
  applicationStatus: string,
  resume: Resume | null,
): boolean {
  return applicationStatus !== 'saved' || resume?.submittedAt != null;
}

function resumeToDocument(resume: Resume): ResumeDocument {
  return {
    locale: resume.locale,
    summary: resume.summary,
    basics: resume.basics,
    experience: resume.experience ?? [],
    education: resume.education ?? [],
    certifications: resume.certifications ?? [],
    languages: resume.languages ?? [],
    projects: resume.projects ?? [],
    skillGroups: resume.skillGroups ?? [],
  };
}

function seedDocumentFromPortfolio(
  documents: Record<string, PortfolioContent>,
  locale: string,
): ResumeDocument {
  const content = documents[locale] ?? Object.values(documents)[0];
  const basics = content?.basics ?? {
    fullName: '',
    headline: '',
    subtitle: '',
    username: '',
    location: '',
    links: [],
  };
  return {
    locale,
    summary: basics.headline,
    basics,
    experience: content?.experience ?? [],
    skillGroups: content?.skillGroups ?? [],
    projects: content?.projects ?? [],
    education: [],
    certifications: [],
    languages: [],
  };
}

interface EditorSectionProps {
  title: string;
  defaultExpanded?: boolean | undefined;
  children: ReactNode;
}

function EditorSection({
  title,
  defaultExpanded,
  children,
}: EditorSectionProps) {
  return (
    <Accordion defaultExpanded={defaultExpanded}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
}

interface ResumeFormProps {
  applicationId: number;
  initial: ResumeDocument;
  locked: boolean;
  seededFromPortfolio: boolean;
  onSaved: () => void;
}

function ResumeForm({
  applicationId,
  initial,
  locked,
  seededFromPortfolio,
  onSaved,
}: ResumeFormProps) {
  const { messages } = useTranslation();
  const navigate = useNavigate();
  const { mutate: upsertResume, isPending } =
    useUpsertApplicationResume(applicationId);
  const [doc, setDoc] = useState<ResumeDocument>(() => initial);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const set = <K extends keyof ResumeDocument>(
    key: K,
    value: ResumeDocument[K],
  ) => {
    setDoc((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    upsertResume(doc, {
      onSuccess: () => {
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

  return (
    <FormCard onSubmit={handleSubmit}>
      {feedback && <Alert severity={feedback.type}>{feedback.text}</Alert>}
      {seededFromPortfolio && !locked && (
        <Alert severity="info">{messages.resumes.seededNotice}</Alert>
      )}
      {locked && <Alert severity="warning">{messages.resumes.locked}</Alert>}
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {messages.resumes.locale}:
        </Typography>
        <Chip label={doc.locale} size="small" variant="outlined" />
      </Stack>
      <EditorSection title={t.basics} defaultExpanded>
        <BasicsEditor
          value={doc.basics}
          onChange={(basics) => {
            set('basics', basics);
          }}
          disabled={locked}
        />
      </EditorSection>
      <EditorSection title={t.summary}>
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
      </EditorSection>
      <EditorSection title={t.experience}>
        <ExperienceEditor
          value={doc.experience}
          onChange={(experience) => {
            set('experience', experience);
          }}
          disabled={locked}
        />
      </EditorSection>
      <EditorSection title={t.projects}>
        <ProjectEditor
          value={doc.projects}
          onChange={(projects) => {
            set('projects', projects);
          }}
          disabled={locked}
        />
      </EditorSection>
      <EditorSection title={t.skillGroups}>
        <SkillGroupsEditor
          value={doc.skillGroups}
          onChange={(skillGroups) => {
            set('skillGroups', skillGroups);
          }}
          disabled={locked}
        />
      </EditorSection>
      <EditorSection title={t.education}>
        <EducationEditor
          value={doc.education}
          onChange={(education) => {
            set('education', education);
          }}
          disabled={locked}
        />
      </EditorSection>
      <EditorSection title={t.certifications}>
        <CertificationEditor
          value={doc.certifications}
          onChange={(certifications) => {
            set('certifications', certifications);
          }}
          disabled={locked}
        />
      </EditorSection>
      <EditorSection title={t.languages}>
        <LanguageEditor
          value={doc.languages}
          onChange={(languages) => {
            set('languages', languages);
          }}
          disabled={locked}
        />
      </EditorSection>
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
    </FormCard>
  );
}

export function ResumeEditor() {
  const { messages, locale } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const parsedId = id ? Number.parseInt(id, 10) : Number.NaN;
  const applicationId =
    Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;

  const applicationQuery = useApplication(applicationId ?? 0, {
    enabled: applicationId !== null,
  });
  const resumeQuery = useApplicationResume(applicationId ?? 0, {
    enabled: applicationId !== null,
  });
  const portfolioQuery = usePortfolio({
    enabled: applicationId !== null && resumeQuery.data === null,
  });
  const jobTitleById = useJobTitleById();
  const [savedNotice, setSavedNotice] = useState(false);

  if (applicationId === null) {
    return <EmptyState title={messages.common.notFound} />;
  }

  const loading =
    applicationQuery.isLoading ||
    resumeQuery.isLoading ||
    (resumeQuery.data === null && portfolioQuery.isLoading);

  if (loading) {
    return <LoadingState label={messages.common.loading} />;
  }

  const queryError = applicationQuery.error ?? resumeQuery.error;
  if (queryError !== null) {
    return (
      <QueryErrorAlert
        error={queryError}
        subject={messages.resumes.title}
        onRetry={() => {
          void applicationQuery.refetch();
          void resumeQuery.refetch();
        }}
      />
    );
  }

  const application = applicationQuery.data;
  if (application === undefined) {
    return <EmptyState title={messages.common.notFound} />;
  }

  const resume = resumeQuery.data ?? null;
  const seededFromPortfolio = resume === null;
  const initial = resume
    ? resumeToDocument(resume)
    : seedDocumentFromPortfolio(portfolioQuery.data?.documents ?? {}, locale);

  const jobTitle = jobTitleById.get(application.jobId);

  return (
    <Stack spacing={3}>
      {savedNotice && <Alert severity="success">{messages.common.saved}</Alert>}
      <Stack spacing={0.5}>
        <Typography component="h1" variant="h5">
          {messages.resumes.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {jobTitle ?? `Job #${application.jobId}`}
        </Typography>
      </Stack>
      <ResumeForm
        key={`${applicationId}-${resume?.id ?? 'draft'}`}
        applicationId={applicationId}
        initial={initial}
        locked={isResumeLocked(application.status, resume)}
        seededFromPortfolio={seededFromPortfolio}
        onSaved={() => {
          setSavedNotice(true);
        }}
      />
    </Stack>
  );
}
