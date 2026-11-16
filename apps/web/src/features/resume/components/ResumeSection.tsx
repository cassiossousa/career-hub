import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

export default function ResumeSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Box component="section">
      <Typography
        component="h2"
        variant="h6"
        sx={{
          mt: 3,
          mb: 1,
          borderBottom: 1,
          borderColor: 'divider',
          pb: 0.25,
          fontSize: 17,
        }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}
