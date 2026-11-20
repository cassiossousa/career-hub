import { Alert, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  EmptyState,
  LoadingState,
  QueryErrorAlert,
} from '../../components/AsyncStatus/AsyncStatus';
import { useTranslation } from '../../i18n/Provider';
import { useApplication } from '../../services/api/applications';
import { useJobTitleById } from '../../services/api/jobs';
import { usePortfolio } from '../../services/api/portfolio';
import { useApplicationResume } from '../../services/api/resumes';
import type { PortfolioContent } from '../../services/types/portfolio';
import type { Resume, ResumeDocument } from '../../services/types/resume';
import { ResumeForm } from './ResumeForm';

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
