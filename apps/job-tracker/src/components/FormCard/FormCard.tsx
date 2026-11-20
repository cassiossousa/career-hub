import { Card, CardContent, Stack } from '@mui/material';
import type { FormEvent, ReactNode } from 'react';

interface FormCardProps {
  onSubmit: (event: FormEvent) => void;
  children: ReactNode;
}

export function FormCard({ onSubmit, children }: FormCardProps) {
  return (
    <Card>
      <CardContent>
        <form onSubmit={onSubmit}>
          <Stack spacing={2}>{children}</Stack>
        </form>
      </CardContent>
    </Card>
  );
}
