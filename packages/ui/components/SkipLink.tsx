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
        // Visually-hidden pattern: clipped to 1px until focused.
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        clipPath: 'inset(50%)',
        whiteSpace: 'nowrap',
        border: 0,
        '&:focus, &:focus-visible': {
          width: 'auto',
          height: 'auto',
          margin: 0,
          padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
          overflow: 'visible',
          clip: 'auto',
          clipPath: 'none',
          whiteSpace: 'normal',
        },
      })}
    >
      {label}
    </Box>
  );
}
