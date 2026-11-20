import { List, ListItemButton, ListItemText, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { routePaths } from '../../app/routePaths';
import { interpolate } from '../../i18n/interpolate';
import { useTranslation } from '../../i18n/Provider';
import { useApplicationTracker } from '../../services/api/applications';
import { needsAttention } from '../../services/applicationStats';
import type { Translation } from '../../types/i18n';
import {
  EmptyState,
  QueryGate,
  SkeletonGrid,
} from '../AsyncStatus/AsyncStatus';

function reasonText(
  item: ReturnType<typeof needsAttention>[number],
  messages: Translation,
): string {
  const template =
    item.reason === 'saved'
      ? messages.dashboard.needsAttention.savedFor
      : messages.dashboard.needsAttention.staleIn;
  return interpolate(template, { days: String(item.days) });
}

export function NeedsAttention() {
  const { messages } = useTranslation();
  const navigate = useNavigate();
  const { applicationsQuery, titleForJob } = useApplicationTracker(
    messages.applications.jobFallback,
  );

  return (
    <QueryGate
      query={applicationsQuery}
      subject={messages.dashboard.needsAttention.title}
      isEmpty={(page) => needsAttention(page.applications).length === 0}
      empty={<EmptyState title={messages.dashboard.needsAttention.empty} />}
      loading={<SkeletonGrid variant="row" count={2} />}
    >
      {(page) => {
        const items = needsAttention(page.applications).slice(0, 5);
        return (
          <>
            <Typography component="h2" variant="h6">
              {messages.dashboard.needsAttention.title}
            </Typography>
            <List disablePadding>
              {items.map((item) => {
                const { application } = item;
                const title = titleForJob(application.jobId);
                return (
                  <ListItemButton
                    key={application.id}
                    onClick={() => {
                      void navigate(
                        routePaths.applicationDetail(application.id.toString()),
                      );
                    }}
                  >
                    <ListItemText
                      primary={title}
                      secondary={reasonText(item, messages)}
                    />
                    <Typography variant="body2" color="primary">
                      {messages.dashboard.needsAttention.open}
                    </Typography>
                  </ListItemButton>
                );
              })}
            </List>
          </>
        );
      }}
    </QueryGate>
  );
}
