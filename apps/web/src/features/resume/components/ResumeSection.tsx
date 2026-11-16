import type { ReactNode } from 'react';
import { Divider, Stack, Typography } from '@mui/material';

export default function ResumeSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Stack component="section" spacing={1}>
      <Typography component="h2" variant="h6">
        {title}
      </Typography>
      <Divider />
      {children}
    </Stack>
  );
}
