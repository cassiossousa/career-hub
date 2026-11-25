import { Link } from '@mui/material';
import type { ComponentProps, ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { routePaths } from '../../app/routePaths';

type AppLinkProps = Omit<
  ComponentProps<typeof Link>,
  'component' | 'href' | 'to'
> & { to: string };

/** MUI `Link` wired to react-router; keeps call sites free of RouterLink imports. */
function AppLink({ to, children, ...rest }: AppLinkProps) {
  return (
    <Link component={RouterLink} to={to} {...rest}>
      {children}
    </Link>
  );
}

type EntityLinkProps = Omit<AppLinkProps, 'to'> & { children: ReactNode };

export function ApplicationDetailLink({
  applicationId,
  children,
  ...rest
}: EntityLinkProps & { applicationId: number }) {
  return (
    <AppLink to={routePaths.applicationDetail(String(applicationId))} {...rest}>
      {children}
    </AppLink>
  );
}

export function JobDetailLink({
  jobId,
  children,
  ...rest
}: EntityLinkProps & { jobId: number }) {
  return (
    <AppLink to={routePaths.jobDetail(String(jobId))} {...rest}>
      {children}
    </AppLink>
  );
}

export function applicationDetailPath(id: number): string {
  return routePaths.applicationDetail(String(id));
}
