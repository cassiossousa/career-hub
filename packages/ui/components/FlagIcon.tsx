import { Box } from '@mui/material';
import brFlag from 'flag-icons/flags/4x3/br.svg';
import usFlag from 'flag-icons/flags/4x3/us.svg';

export type FlagCode = 'us' | 'br';

export interface FlagIconProps {
  code: FlagCode;
}

const FLAGS: Record<FlagCode, string> = {
  us: usFlag,
  br: brFlag,
};

export function FlagIcon({ code }: FlagIconProps) {
  return (
    <Box
      component="img"
      src={FLAGS[code]}
      alt=""
      sx={{
        display: 'block',
        height: 16,
        width: 'auto',
        borderRadius: '2px',
      }}
    />
  );
}
