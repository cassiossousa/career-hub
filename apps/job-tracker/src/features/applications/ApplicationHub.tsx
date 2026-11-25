import { Tab, Tabs } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import {
  EmptyState,
  LoadingState,
} from '../../components/AsyncStatus/AsyncStatus';
import { useTranslation } from '../../i18n/Provider';
import { useApplication } from '../../services/api/applications';
import { HubActivity } from './HubActivity';
import { HubContacts } from './HubContacts';
import { HubCoverLetter } from './HubCoverLetter';
import { HubInterviews } from './HubInterviews';
import { HubOffers } from './HubOffers';
import { HubOverview } from './HubOverview';
import { HubResume } from './HubResume';
import { QueryErrorState } from './HubUi';
import { useApplicationIdParam } from './useApplicationIdParam';

const HUB_TABS = [
  'overview',
  'resume',
  'coverLetter',
  'interviews',
  'contacts',
  'offers',
  'activity',
] as const;

type HubTab = (typeof HUB_TABS)[number];

function isHubTab(value: string | null): value is HubTab {
  return value !== null && (HUB_TABS as readonly string[]).includes(value);
}

export function ApplicationHub() {
  const { messages } = useTranslation();
  const applicationId = useApplicationIdParam();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: HubTab = isHubTab(tabParam) ? tabParam : 'overview';

  const applicationQuery = useApplication(applicationId ?? 0, {
    enabled: applicationId !== null,
  });

  if (applicationId === null) {
    return <EmptyState title={messages.common.notFound} />;
  }

  if (applicationQuery.isLoading) {
    return <LoadingState label={messages.common.loading} />;
  }

  if (applicationQuery.error !== null) {
    return (
      <QueryErrorState
        query={applicationQuery}
        subject={messages.applications.title}
      />
    );
  }

  const application = applicationQuery.data;
  if (application === undefined) {
    return <EmptyState title={messages.common.notFound} />;
  }

  return (
    <>
      <Tabs
        value={activeTab}
        onChange={(_, next: HubTab) => {
          setSearchParams({ tab: next });
        }}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        aria-label={messages.applications.title}
        sx={{ mb: 2 }}
      >
        {HUB_TABS.map((tab) => (
          <Tab
            key={tab}
            value={tab}
            id={`hub-tab-${tab}`}
            aria-controls={`hub-panel-${tab}`}
            label={messages.applicationHub.tabs[tab]}
          />
        ))}
      </Tabs>
      {activeTab === 'overview' && <HubOverview application={application} />}
      {activeTab === 'resume' && <HubResume />}
      {activeTab === 'coverLetter' && (
        <HubCoverLetter application={application} />
      )}
      {activeTab === 'interviews' && (
        <HubInterviews application={application} />
      )}
      {activeTab === 'contacts' && <HubContacts application={application} />}
      {activeTab === 'offers' && <HubOffers application={application} />}
      {activeTab === 'activity' && <HubActivity application={application} />}
    </>
  );
}
