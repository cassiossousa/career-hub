import type { ResumePdfViewerLabels } from '@career-hub/ui/components';
import { ResumePdfViewer } from '@career-hub/ui/components';
import { Alert, Box, Button, Tab, Tabs } from '@mui/material';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { saveFeedbackOptions } from '../../app/saveFeedback';
import { useDocumentDraft } from '../../app/useDocumentDraft';
import { AccordionSection } from '../../components/AccordionSection/AccordionSection';
import {
  BasicsEditor,
  ExperienceEditor,
  PortfolioLanguagesEditor,
  ProjectEditor,
  SkillGroupsEditor,
} from '../../components/EntryEditors/EntryEditors';
import { FormCard } from '../../components/FormCard/FormCard';
import { UnsavedChangesDialog } from '../../components/UnsavedChangesDialog/UnsavedChangesDialog';
import { useTranslation } from '../../i18n/Provider';
import { useUpsertPortfolio } from '../../services/api/portfolio';
import { toPortfolioPdfDocument } from '../../services/resumePreview';
import type { PortfolioContent } from '../../services/types/portfolio';
import type { Locale } from '../../types/i18n';

interface PortfolioFormProps {
  locale: Locale;
  initial: PortfolioContent;
}

export function PortfolioForm({ locale, initial }: PortfolioFormProps) {
  const { messages } = useTranslation();
  const { mutate: upsertPortfolio, isPending } = useUpsertPortfolio();
  const [searchParams, setSearchParams] = useSearchParams();
  const { doc, setBaseline, feedback, setFeedback, blocker, bind } =
    useDocumentDraft(initial, true, true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    upsertPortfolio(
      { locale, ...doc },
      saveFeedbackOptions({
        savedText: messages.common.saved,
        setFeedback,
        onSaved: () => {
          setBaseline(doc);
        },
      }),
    );
  };

  const activeTab = searchParams.get('view') === 'preview' ? 1 : 0;
  const handleTabChange = (_event: React.SyntheticEvent, value: number) => {
    // Preserve sibling params (?locale=) when toggling the preview tab.
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === 1) {
        next.set('view', 'preview');
      } else {
        next.delete('view');
      }
      return next;
    });
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
          <AccordionSection title={t.languages}>
            <PortfolioLanguagesEditor
              value={doc.languages}
              onChange={bind('languages')}
              locale={locale}
            />
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
        <ResumePdfViewer
          document={previewDocument}
          labels={previewLabels}
          printLabel={resumeMessages.preview.downloadPdf}
          paged
        />
      </Box>
    </Box>
  );
}
