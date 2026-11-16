import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Container,
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
      <Typography variant="h1" component="h1" sx={{ mb: 5 }}>
        {t.workExperience.title}
      </Typography>
      <Box>
        {roles.map((role, index) => (
          <AccordionItem key={`${role.company}-${index}`} role={role} />
        ))}
      </Box>
    </Container>
  );
}

function AccordionItem({ role }: { role: WorkRole }) {
  return (
    <Accordion
      disableGutters
      elevation={0}
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        '&::before': { display: 'none' },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box>
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
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box component="ul" sx={{ m: 0, pl: 2.5, listStyleType: 'disc' }}>
          {role.bullets.map((bullet, index) => (
            <Box component="li" key={`${index}-${bullet}`} sx={{ mb: 1 }}>
              {bullet}
            </Box>
          ))}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
