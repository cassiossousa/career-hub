import { Link, Stack, Typography } from '@mui/material';
import { Fragment } from 'react';
import type { ResumePdfBasics } from './types';

export function ResumePdfHeader({ basics }: { basics: ResumePdfBasics }) {
  const title = [basics.headline, basics.subtitle]
    .filter((part): part is string => Boolean(part))
    .join(' • ');
  return (
    <Stack
      component="header"
      spacing={1}
      sx={{ alignItems: 'center', textAlign: 'center' }}
    >
      <Typography component="h2" variant="h5">
        {basics.fullName}
      </Typography>
      {title ? (
        <Typography
          component="p"
          variant="body2"
          sx={{ color: 'text.secondary' }}
        >
          {title}
        </Typography>
      ) : null}
      {basics.location ? (
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {basics.location}
        </Typography>
      ) : null}
      {basics.links.length > 0 ? (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {basics.links.map((link, index) => (
            <Fragment key={`${link.label}-${link.url}`}>
              {index > 0 ? (
                <Typography
                  component="span"
                  variant="caption"
                  sx={{ color: 'text.secondary' }}
                >
                  •
                </Typography>
              ) : null}
              <Link
                href={link.url}
                target="_blank"
                rel="noreferrer"
                color="inherit"
                variant="caption"
              >
                {link.label}
              </Link>
            </Fragment>
          ))}
        </Stack>
      ) : null}
    </Stack>
  );
}
