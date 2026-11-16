import { Link, Stack, Typography } from '@mui/material';
import type { Translation } from '../../../types/i18n';

export default function ResumeHeader({
  name,
  title,
  username,
}: Pick<Translation['home'], 'name' | 'username'> & { title: string }) {
  return (
    <Stack
      component="header"
      spacing={1}
      sx={{ alignItems: 'center', textAlign: 'center' }}
    >
      <Typography component="h1" variant="h5">
        {name}
      </Typography>
      <Typography component="p" variant="body2" color="text.secondary">
        {title}
      </Typography>
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', justifyContent: 'center' }}
      >
        <Link
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noreferrer"
          color="inherit"
          variant="caption"
        >
          github.com/{username}
        </Link>
        <Typography variant="caption" color="text.secondary">
          •
        </Typography>
        <Link
          href={`https://linkedin.com/in/${username}`}
          target="_blank"
          rel="noreferrer"
          color="inherit"
          variant="caption"
        >
          linkedin.com/in/{username}
        </Link>
      </Stack>
    </Stack>
  );
}
