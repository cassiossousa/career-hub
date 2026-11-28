import { Alert, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import {
  EmptyState,
  LoadingState,
} from '../../components/AsyncStatus/AsyncStatus';
import { useTranslation } from '../../i18n/Provider';
import { useApplication } from '../../services/api/applications';
import { useJobSummaries } from '../../services/api/jobs';
import { usePortfolio } from '../../services/api/portfolio';
import { useApplicationResume } from '../../services/api/resumes';
import type { PortfolioContent } from '../../services/types/portfolio';
import type { Resume, ResumeDocument } from '../../services/types/resume';
import { QueryErrorState } from './HubUi';
import { ResumeForm } from './ResumeForm';
import { TailoringSuggestionsCard } from './TailoringSuggestionsCard';
import { useApplicationIdParam } from './useApplicationIdParam';

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
    schemaVersion: resume.schemaVersion,
  };
}

function seedDocumentFromPortfolio(
  documents: Record<string, PortfolioContent>,
  locale: string,
): ResumeDocument {
  const content = documents[locale] ?? Object.values(documents)[0];
  const basics = content?.basics ?? {
    fullName: '',
    links: [],
  };
  return {
    locale,
    summary: basics.headline ?? '',
    basics,
    experience: content?.experience ?? [],
    skillGroups: content?.skillGroups ?? [],
    projects: content?.projects ?? [],
    education: [],
    certifications: [],
    languages: [],
  };
}

export function ResumeEditor({ embedded = false }: { embedded?: boolean }) {
  const { messages, locale } = useTranslation();
  const applicationId = useApplicationIdParam();

  const applicationQuery = useApplication(applicationId ?? 0, {
    enabled: applicationId !== null,
  });
  const resumeQuery = useApplicationResume(applicationId ?? 0, {
    enabled: applicationId !== null,
  });
  const portfolioQuery = usePortfolio({
    enabled: applicationId !== null && resumeQuery.data === null,
  });
  const jobSummaries = useJobSummaries();
  const [savedNotice, setSavedNotice] = useState(false);
  const [draftDocument, setDraftDocument] = useState<ResumeDocument | null>(
    null,
  );

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
      <QueryErrorState
        query={{
          error: queryError,
          refetch: () => {
            void applicationQuery.refetch();
            void resumeQuery.refetch();
          },
        }}
        subject={messages.resumes.title}
      />
    );
  }

  const application = applicationQuery.data;
  if (application === undefined) {
    return <EmptyState title={messages.common.notFound} />;
  }

  const resume = resumeQuery.data ?? null;
  const seededFromPortfolio = resume === null;
  const locked = isResumeLocked(application.status, resume);
  const initial =
    draftDocument ??
    (resume
      ? resumeToDocument(resume)
      : seedDocumentFromPortfolio(
          portfolioQuery.data?.documents ?? {},
          locale,
        ));

  const jobSummary = jobSummaries.get(application.jobId);

  return (
    <Stack spacing={3}>
      {savedNotice && <Alert severity="success">{messages.common.saved}</Alert>}
      {!embedded && (
        <Stack spacing={0.5}>
          <Typography component="h1" variant="h5">
            {messages.resumes.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {jobSummary?.title ?? `Job #${application.jobId}`}
            {jobSummary != null && ` — ${jobSummary.company}`}
          </Typography>
        </Stack>
      )}
      {!locked && (
        <TailoringSuggestionsCard
          applicationId={applicationId}
          canTailor={resume !== null}
          onUseDraft={(document) => {
            setDraftDocument(document);
          }}
        />
      )}
      <ResumeForm
        key={`${applicationId}-${resume?.id ?? 'draft'}-${
          draftDocument === null ? 'base' : 'tailored'
        }`}
        applicationId={applicationId}
        initial={initial}
        locked={locked}
        seededFromPortfolio={seededFromPortfolio}
        onSaved={() => {
          setSavedNotice(true);
          setDraftDocument(null);
        }}
      />
    </Stack>
  );
}
