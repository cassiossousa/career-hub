import { Box, IconButton } from '@mui/material';
import type { ThemeMode } from '../theme';

export interface ThemeModeToggleProps {
  mode: ThemeMode;
  onToggle: () => void;
  ariaLabel: string;
}

export function ThemeModeToggle({
  mode,
  onToggle,
  ariaLabel,
}: ThemeModeToggleProps) {
  return (
    <IconButton
      type="button"
      onClick={onToggle}
      aria-label={ariaLabel}
      aria-pressed={mode === 'dark'}
      size="small"
    >
      <Box
        component="svg"
        viewBox="0 0 24 24"
        width={20}
        height={20}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        {mode === 'dark' ? (
          <path
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
            fill="currentColor"
            stroke="none"
          />
        ) : (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </>
        )}
      </Box>
    </IconButton>
  );
}
