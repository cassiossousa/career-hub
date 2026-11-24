import { Stack, Typography } from '@mui/material';
import {
  LoadingState,
  QueryErrorAlert,
} from '../../components/AsyncStatus/AsyncStatus';
import { useTranslation } from '../../i18n/Provider';
import { useSkillGroupLabels, useSkills } from '../../services/api/skills';
import { LabelsForm } from './LabelsForm';
import { SkillsForm } from './SkillsForm';

export function SkillsEditor() {
  const { messages } = useTranslation();
  const skillsQuery = useSkills();
  const groupLabelsQuery = useSkillGroupLabels();

  if (skillsQuery.isLoading || groupLabelsQuery.isLoading) {
    return <LoadingState label={messages.common.loading} />;
  }

  const skills = skillsQuery.data?.skills;
  const groupLabels = groupLabelsQuery.data?.groups;
  if (skills === undefined || groupLabels === undefined) {
    if (skillsQuery.isError) {
      return (
        <QueryErrorAlert
          error={skillsQuery.error}
          subject={messages.skills.title}
          onRetry={() => void skillsQuery.refetch()}
        />
      );
    }
    if (groupLabelsQuery.isError) {
      return (
        <QueryErrorAlert
          error={groupLabelsQuery.error}
          subject={messages.skills.labelsTitle}
          onRetry={() => void groupLabelsQuery.refetch()}
        />
      );
    }
    return <LoadingState label={messages.common.loading} />;
  }

  return (
    <Stack spacing={3}>
      <Typography component="h1" variant="h5">
        {messages.skills.title}
      </Typography>
      <SkillsForm skills={skills} />
      <LabelsForm skills={skills} groupLabels={groupLabels} />
    </Stack>
  );
}
