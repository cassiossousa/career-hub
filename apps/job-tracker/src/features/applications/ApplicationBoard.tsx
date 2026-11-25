import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { ApplicationStatusChip } from '../../components/ApplicationStatusChip/ApplicationStatusChip';
import { useTranslation } from '../../i18n/Provider';
import { useApplicationTracker } from '../../services/api/applications';
import {
  APPLICATION_STATUS_ORDER,
  type Application,
  type ApplicationStatus,
} from '../../services/types/application';

interface ApplicationBoardProps {
  applications: Application[];
  onMove: (application: Application, target: ApplicationStatus) => void;
}

function BoardCard({
  application,
  title,
  company,
  onDragStart,
}: {
  application: Application;
  title: string;
  company: string | null;
  onDragStart: (id: number) => void;
}) {
  return (
    <Card
      variant="outlined"
      draggable
      onDragStart={() => {
        onDragStart(application.id);
      }}
      sx={{ cursor: 'grab' }}
    >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {title}
        </Typography>
        {company !== null && (
          <Typography variant="caption" color="text.secondary">
            {company}
          </Typography>
        )}
        {application.appliedAt && (
          <Typography variant="caption" color="text.secondary">
            {application.appliedAt}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export function ApplicationBoard({
  applications,
  onMove,
}: ApplicationBoardProps) {
  const { messages } = useTranslation();
  const { titleForJob, companyForJob } = useApplicationTracker(
    messages.applications.jobFallback,
  );
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<ApplicationStatus | null>(null);

  const byStatus = new Map<ApplicationStatus, Application[]>();
  for (const status of APPLICATION_STATUS_ORDER) {
    byStatus.set(status, []);
  }
  for (const app of applications) {
    byStatus.get(app.status)?.push(app);
  }

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.5,
        overflowX: 'auto',
        pb: 1,
        alignItems: 'flex-start',
      }}
    >
      {APPLICATION_STATUS_ORDER.map((status) => {
        const items = byStatus.get(status) ?? [];
        const isDropTarget = dropTarget === status;
        return (
          <Box
            key={status}
            onDragOver={(e) => {
              e.preventDefault();
              setDropTarget(status);
            }}
            onDragLeave={() => {
              setDropTarget((current) => (current === status ? null : current));
            }}
            onDrop={(e) => {
              e.preventDefault();
              const app = applications.find((a) => a.id === draggedId);
              setDraggedId(null);
              setDropTarget(null);
              if (app !== undefined && app.status !== status) {
                onMove(app, status);
              }
            }}
            sx={{
              flex: '1 0 180px',
              minWidth: 160,
              maxWidth: 260,
              borderRadius: 1,
              border: 1,
              borderStyle: 'dashed',
              borderColor: isDropTarget ? 'primary.main' : 'divider',
              bgcolor: isDropTarget ? 'action.hover' : 'transparent',
              p: 1,
            }}
          >
            <Stack spacing={1}>
              <Stack
                direction="row"
                sx={{ justifyContent: 'space-between', alignItems: 'center' }}
              >
                <ApplicationStatusChip status={status} />
                <Typography variant="caption" color="text.secondary">
                  {items.length}
                </Typography>
              </Stack>
              {items.map((app) => (
                <BoardCard
                  key={app.id}
                  application={app}
                  title={titleForJob(app.jobId)}
                  company={companyForJob(app.jobId)}
                  onDragStart={setDraggedId}
                />
              ))}
            </Stack>
          </Box>
        );
      })}
    </Box>
  );
}
