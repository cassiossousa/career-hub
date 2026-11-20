import {
  Card,
  CardContent,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useId } from 'react';
import { useTranslation } from '../../i18n/Provider';
import { useApplications } from '../../services/api/applications';
import { appliedThisWeek } from '../../services/applicationStats';
import { useUIStore } from '../../store/uiStore';

export function WeeklyGoal() {
  const { messages } = useTranslation();
  const progressLabelId = useId();
  const { weeklyGoal, setWeeklyGoal } = useUIStore();
  const applicationsQuery = useApplications();
  const applied = appliedThisWeek(applicationsQuery.data?.applications ?? []);
  const percent = Math.min(100, Math.round((applied / weeklyGoal) * 100));

  return (
    <Card>
      <CardContent>
        <Stack spacing={1}>
          <Stack
            direction="row"
            sx={{ justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Typography variant="subtitle1">
              {messages.dashboard.weeklyGoal.title}
            </Typography>
            <TextField
              type="number"
              size="small"
              value={weeklyGoal}
              onChange={(e) => {
                const next = Number(e.target.value);
                if (Number.isInteger(next) && next >= 1 && next <= 100) {
                  setWeeklyGoal(next);
                }
              }}
              slotProps={{
                htmlInput: {
                  min: 1,
                  max: 100,
                  'aria-label': messages.dashboard.weeklyGoal.edit,
                },
              }}
              sx={{ width: 72 }}
            />
          </Stack>
          <LinearProgress
            variant="determinate"
            value={percent}
            aria-labelledby={progressLabelId}
          />
          <Typography
            id={progressLabelId}
            variant="body2"
            color="text.secondary"
          >
            {messages.dashboard.weeklyGoal.progress
              .replace('{count}', String(applied))
              .replace('{goal}', String(weeklyGoal))}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
