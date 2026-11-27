import { Card, CardContent, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface ApplyReviewCardProps {
  title: string;
  children: ReactNode;
}

export function ApplyReviewCard({ title, children }: ApplyReviewCardProps) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Typography component="h2" variant="h6">
            {title}
          </Typography>
          {children}
        </Stack>
      </CardContent>
    </Card>
  );
}
