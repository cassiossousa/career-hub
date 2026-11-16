import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
    <Container component="section" maxWidth="md" sx={{ py: 6 }}>
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
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack spacing={0.5}>
          <Typography variant="h3" component="h2">
            {role.company}
          </Typography>
          <Typography variant="h6" color="primary.main">
            {role.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {role.location && `${role.location} | `}
            {role.period}
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <ul>
          {role.bullets.map((bullet, index) => (
            <li key={`${index}-${bullet}`}>{bullet}</li>
          ))}
        </ul>
      </AccordionDetails>
    </Accordion>
  );
}
