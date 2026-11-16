import { Box, Link, Typography } from '@mui/material';
import type { ResumeDocumentData } from '../types';

export default function ResumeHeader({
  name,
  title,
  username,
}: Pick<ResumeDocumentData, 'name' | 'title' | 'username'>) {
  return (
    <Box component="header" sx={{ mb: 2.5, textAlign: 'center' }}>
      <Typography
        component="h1"
        variant="h4"
        sx={{ mb: 0.5, fontSize: 28, letterSpacing: '-0.2px' }}
      >
        {name}
      </Typography>
      <Typography
        component="p"
        sx={{
          mb: 0.75,
          color: 'text.secondary',
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        {title}
      </Typography>
      <Box sx={{ fontSize: 12 }}>
        <Link
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noreferrer"
          color="inherit"
        >
          github.com/{username}
        </Link>
        <Box component="span" sx={{ mx: 0.75, color: 'text.secondary' }}>
          •
        </Box>
        <Link
          href={`https://linkedin.com/in/${username}`}
          target="_blank"
          rel="noreferrer"
          color="inherit"
        >
          linkedin.com/in/{username}
        </Link>
      </Box>
    </Box>
  );
}
