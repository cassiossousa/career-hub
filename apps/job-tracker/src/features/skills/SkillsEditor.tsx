import { Stack, Typography } from '@mui/material';
import {
  LoadingState,
  QueryErrorAlert,
} from '../../components/AsyncStatus/AsyncStatus';
import { useTranslation } from '../../i18n/Provider';
import { useSkills } from '../../services/api/skills';
import { SkillsForm } from './SkillsForm';

export function SkillsEditor() {
  const { messages } = useTranslation();
  const skillsQuery = useSkills();

  if (skillsQuery.isLoading) {
    return <LoadingState label={messages.common.loading} />;
  }

  const skills = skillsQuery.data?.skills;
  if (skills === undefined) {
    if (skillsQuery.isError) {
      return (
        <QueryErrorAlert
          error={skillsQuery.error}
          subject={messages.skills.title}
          onRetry={() => void skillsQuery.refetch()}
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
    </Stack>
  );
}
