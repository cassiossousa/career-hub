import { createTheme } from '@mui/material/styles';
import { brandedComponents } from './components';
import { brandedTokens } from './tokens';

export function createBrandedTheme(): ReturnType<typeof createTheme> {
  return createTheme({
    ...brandedTokens,
    components: brandedComponents,
  });
}
