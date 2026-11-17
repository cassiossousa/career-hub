import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { Translation } from '../../types/i18n';
import type { WorkRole } from '../../services/work-experience/workModel';

export function WorkExperienceList({
  roles,
  t,
}: {
  roles: WorkRole[];
  t: Translation;
}) {
  return (
    <Container component="section" maxWidth="md" sx={{ p: 3 }}>
      <Stack spacing={5}>
        <Typography variant="h1" component="h1">
          {t.workExperience.title}
        </Typography>
        <Stack>
          {roles.map((role, index) => (
            <AccordionItem key={`${role.company}-${index}`} role={role} />
          ))}
        </Stack>
      </Stack>
    </Container>
  );
}

function AccordionItem({ role }: { role: WorkRole }) {
  return (
    <Accordion disableGutters elevation={0}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0 }}>
        <Stack spacing={0.5}>
          <Typography variant="h3" sx={{ color: 'primary.dark' }}>
            {role.company}
          </Typography>
          <Typography variant="h6" sx={{ color: 'primary.main' }}>
            {role.title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {role.location && `${role.location} | `}
            {role.period}
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        <Box component="ul" sx={{ mt: 0, pl: 3 }}>
          {role.bullets.map((bullet, index) => (
            <li key={`${index}-${bullet}`}>{bullet}</li>
          ))}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
