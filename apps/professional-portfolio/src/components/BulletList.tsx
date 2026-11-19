import { Box } from '@mui/material';
import type { ReactNode } from 'react';

export default function BulletList({
  children,
  paddingInlineStart = 4,
}: {
  children: ReactNode;
  paddingInlineStart?: number;
}) {
  return (
    <Box
      component="ul"
      sx={{
        paddingInlineStart,
        '& > li': {
          py: 0.5,
        },
      }}
    >
      {children}
    </Box>
  );
}
