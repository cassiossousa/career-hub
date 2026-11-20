import type { ResumePdfViewerLabels } from '@career-hub/ui/components';
import { ResumePdfViewer } from '@career-hub/ui/components';
import { Alert, Box, Button, Tab, Tabs } from '@mui/material';
import { useMemo, useState } from 'react';
import { useDocumentDraft } from '../../app/useDocumentDraft';
import { AccordionSection } from '../../components/AccordionSection/AccordionSection';
import { errorMessage } from '../../components/AsyncStatus/AsyncStatus';
import {
  BasicsEditor,
  ExperienceEditor,
  ProjectEditor,
  SkillGroupsEditor,
} from '../../components/EntryEditors/EntryEditors';
import { FormCard } from '../../components/FormCard/FormCard';
import { UnsavedChangesDialog } from '../../components/UnsavedChangesDialog/UnsavedChangesDialog';
import { useTranslation } from '../../i18n/Provider';
import { useUpsertPortfolio } from '../../services/api/portfolio';
import { toPortfolioPdfDocument } from '../../services/resumePreview';
import type { PortfolioContent } from '../../services/types/portfolio';

interface PortfolioFormProps {
  locale: string;
  initial: PortfolioContent;
}

export function PortfolioForm({ locale, initial }: PortfolioFormProps) {
  const { messages } = useTranslation();
  const { mutate: upsertPortfolio, isPending } = useUpsertPortfolio();
  const { doc, setBaseline, feedback, setFeedback, blocker, bind } =
    useDocumentDraft(initial);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    upsertPortfolio(
      { locale, ...doc },
      {
        onSuccess: () => {
          setBaseline(doc);
          setFeedback({ type: 'success', text: messages.common.saved });
        },
        onError: (error) => {
          setFeedback({ type: 'error', text: errorMessage(error) });
        },
      },
    );
  };

  const [activeTab, setActiveTab] = useState(0);
  const handleTabChange = (_event: React.SyntheticEvent, value: number) => {
    setActiveTab(value);
  };

  const t = messages.portfolio.sections;
  const resumeMessages = messages.resumes;

  const previewDocument = useMemo(
    () =>
      toPortfolioPdfDocument(doc, locale, {
        presentLabel: resumeMessages.experience.present,
        linkKindLabels: resumeMessages.basics.linkKinds,
        skillCategoryLabels: resumeMessages.skillGroups.categories,
      }),
    [doc, locale, resumeMessages],
  );

  const previewLabels: ResumePdfViewerLabels = {
    summary: resumeMessages.sections.summary,
    experience: resumeMessages.sections.experience,
    projects: resumeMessages.sections.projects,
    skillGroups: resumeMessages.sections.skillGroups,
    education: resumeMessages.sections.education,
    certifications: resumeMessages.sections.certifications,
    languages: resumeMessages.sections.languages,
    repository: resumeMessages.preview.repository,
    demo: resumeMessages.preview.demo,
  };

  return (
    <Box>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        aria-label={messages.portfolio.title}
      >
        <Tab id="portfolio-tab-edit" label={messages.common.edit} />
        <Tab id="portfolio-tab-preview" label={resumeMessages.preview.title} />
      </Tabs>
      <Box
        role="tabpanel"
        aria-labelledby="portfolio-tab-edit"
        hidden={activeTab !== 0}
        sx={{ pt: 2 }}
      >
        <FormCard onSubmit={handleSubmit}>
          {feedback && <Alert severity={feedback.type}>{feedback.text}</Alert>}
          <AccordionSection title={t.basics} defaultExpanded>
            <BasicsEditor value={doc.basics} onChange={bind('basics')} />
          </AccordionSection>
          <AccordionSection title={t.experience}>
            <ExperienceEditor
              value={doc.experience}
              onChange={bind('experience')}
            />
          </AccordionSection>
          <AccordionSection title={t.skillGroups}>
            <SkillGroupsEditor
              value={doc.skillGroups}
              onChange={bind('skillGroups')}
            />
          </AccordionSection>
          <AccordionSection title={t.projects}>
            <ProjectEditor value={doc.projects} onChange={bind('projects')} />
          </AccordionSection>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? messages.common.saving : messages.portfolio.save}
          </Button>
          <UnsavedChangesDialog blocker={blocker} />
        </FormCard>
      </Box>
      <Box
        role="tabpanel"
        aria-labelledby="portfolio-tab-preview"
        hidden={activeTab !== 1}
        sx={{ pt: 2, width: '100%', maxWidth: 840, mx: 'auto' }}
      >
        <ResumePdfViewer document={previewDocument} labels={previewLabels} />
      </Box>
    </Box>
  );
}
