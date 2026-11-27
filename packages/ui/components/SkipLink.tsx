import { Box } from '@mui/material';
import type { MouseEvent } from 'react';

export interface SkipLinkProps {
  /** Hash target, e.g. `#main-content` — the element must exist and be focusable (`tabIndex={-1}`). */
  href: string;
  label: string;
}

/**
 * WCAG 2.4.1 bypass-blocks link: visually hidden until keyboard focus, then
 * moves focus to the target landmark. Render it as the first focusable
 * element in the document.
 */
export function SkipLink({ href, label }: SkipLinkProps) {
  const targetId = href.startsWith('#') ? href.slice(1) : href;

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    document.getElementById(targetId)?.focus();
  }

  return (
    <Box
      component="a"
      href={href}
      onClick={handleClick}
      sx={(theme) => ({
        position: 'fixed',
        insetInlineStart: theme.spacing(1),
        top: theme.spacing(1),
        zIndex: theme.zIndex.tooltip,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        borderRadius: 1,
        textDecoration: 'none',
        fontWeight: 600,
        padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
        // Visually-hidden pattern: parked above the viewport until focused.
        // Keeps a real bounding box (unlike the 1px clip pattern) so target-size
        // checks still measure the focused control's true dimensions.
        transform: 'translateY(-200%)',
        '&:focus, &:focus-visible': {
          transform: 'translateY(0)',
        },
      })}
    >
      {label}
    </Box>
  );
}
