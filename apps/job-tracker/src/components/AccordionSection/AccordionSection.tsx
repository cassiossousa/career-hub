import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from '@mui/material';
import type { ReactNode } from 'react';

interface AccordionSectionProps {
  title: string;
  defaultExpanded?: boolean | undefined;
  children: ReactNode;
}

export function AccordionSection({
  title,
  defaultExpanded,
  children,
}: AccordionSectionProps) {
  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      slotProps={{ transition: { unmountOnExit: true } }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
}
