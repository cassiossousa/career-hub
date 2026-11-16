import type { ReactNode } from 'react';
import { Box } from '@mui/material';

export default function ResumeBulletList({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Box
      component="ul"
      sx={{
        mt: 0.75,
        mb: 0,
        pl: '22px',
        listStyleType: 'disc',
        '& li': { mb: '2px', fontSize: 12, lineHeight: 1.5 },
      }}
    >
      {children}
    </Box>
  );
}
