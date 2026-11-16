import { Box, Typography } from '@mui/material';
import type { WorkRole } from '../../../services/work-experience/workModel';
import ResumeBulletList from './ResumeBulletList';
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
      {roles.map((role, index) => (
        <Box
          component="article"
          key={`${role.company}-${role.period}-${index}`}
          sx={{ mb: 1.75, breakInside: 'avoid', pageBreakInside: 'avoid' }}
        >
          <Box component="header" sx={{ mb: 0.5 }}>
            <Typography
              component="h3"
              variant="subtitle1"
              sx={{ m: 0, fontSize: 14, fontWeight: 600 }}
            >
              {role.company}
            </Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
              {role.title}
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>
              {role.location && `${role.location} | `}
              {role.period}
            </Typography>
          </Box>
          <ResumeBulletList>
            {role.bullets.map((bullet, bulletIndex) => (
              <Box component="li" key={`${bulletIndex}-${bullet}`}>
                {bullet}
              </Box>
            ))}
          </ResumeBulletList>
        </Box>
      ))}
    </ResumeSection>
  );
}
