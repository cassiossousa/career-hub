import { Box, Stack, Typography } from '@mui/material';
import type { WorkRole } from '../../../services/work-experience/workModel';
import ResumeSection from './ResumeSection';

export default function ResumeExperience({
  title,
  roles,
}: {
  title: string;
  roles: WorkRole[];
}) {
  if (!roles.length) return null;

  return (
    <ResumeSection title={title}>
      <Stack spacing={2}>
        {roles.map((role, index) => (
          <Box
            component="article"
            key={`${role.company}-${role.period}-${index}`}
            sx={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
          >
            <Stack component="header" spacing={0.5}>
              <Typography component="h3" variant="subtitle1">
                {role.company}
              </Typography>
              <Typography variant="subtitle2">{role.title}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {role.location && `${role.location} | `}
                {role.period}
              </Typography>
            </Stack>
            <Box component="ul">
              {role.bullets.map((bullet, bulletIndex) => (
                <li key={`${bulletIndex}-${bullet}`}>{bullet}</li>
              ))}
            </Box>
          </Box>
        ))}
      </Stack>
    </ResumeSection>
  );
}
