import type { ThemeMode } from './mode';
import {
  brand,
  error as errorRamp,
  info as infoRamp,
  neutralDark,
  neutralLight,
  success as successRamp,
  violet,
  warning as warningRamp,
} from './primitives';

// Semantic color roles — the layer components actually consume. Every value is
// resolved from primitives (or an explicitly curated literal) and verified for
// WCAG contrast by apps/job-tracker/src/app/theme.spec.ts. Dark mode is a
// separately designed ramp set, not an inversion of light.

interface SemanticStatus {
  /** Text-safe color on surface backgrounds (>= 4.5:1). */
  fg: string;
  /** Subtle tinted surface for alerts/accents. */
  bg: string;
  /** Filled/solid color for chips and contained actions. */
  solid: string;
  /** One tonal step lighter than solid (MUI palette.light). */
  light: string;
  /** One tonal step darker than solid (MUI palette.dark). */
  dark: string;
  /** Label color on top of solid (>= 4.5:1). */
  onSolid: string;
}

export interface SemanticColors {
  surfaces: {
    /** App background behind everything. */
    canvas: string;
    /** Primary content surface (cards, paper). */
    surface: string;
    /** One elevation step above surface. */
    raised: string;
    /** Recessed/inset fill. */
    subtle: string;
    /** Highest layer — menus, dialogs, popovers. */
    overlay: string;
  };
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    onAccent: string;
  };
  border: {
    /** Decorative hairlines only — may sit below 3:1. */
    subtle: string;
    /** Functional boundaries (inputs, cards, accordions) — >= 3:1. */
    default: string;
    /** Hover/active boundary state. */
    strong: string;
  };
  accent: {
    default: string;
    hover: string;
    pressed: string;
    subtle: string;
    onAccent: string;
  };
  secondaryAccent: {
    default: string;
    hover: string;
    pressed: string;
    subtle: string;
    onAccent: string;
  };
  status: {
    success: SemanticStatus;
    warning: SemanticStatus;
    error: SemanticStatus;
    info: SemanticStatus;
  };
  action: {
    hover: string;
    selected: string;
    focus: string;
    active: string;
    disabled: string;
    disabledBackground: string;
  };
}

const PAPER = '#ffffff';
const INK_ON_BRIGHT = 'rgba(0, 0, 0, 0.87)';

export const lightSemantic: SemanticColors = {
  surfaces: {
    canvas: neutralLight[50],
    surface: PAPER,
    raised: PAPER,
    subtle: neutralLight[100],
    overlay: neutralLight[200],
  },
  text: {
    primary: neutralLight[900],
    secondary: neutralLight[600],
    disabled: neutralLight[400],
    onAccent: PAPER,
  },
  border: {
    subtle: neutralLight[200],
    // ~4.8:1 on white — inputs/cards need a clearly visible boundary,
    // not a hairline that reads as missing.
    default: neutralLight[500],
    strong: neutralLight[600],
  },
  accent: {
    default: brand[600],
    hover: brand[700],
    pressed: brand[800],
    subtle: brand[50],
    onAccent: PAPER,
  },
  secondaryAccent: {
    default: violet[600],
    hover: violet[700],
    pressed: violet[800],
    subtle: violet[50],
    onAccent: PAPER,
  },
  status: {
    success: {
      fg: successRamp[700],
      bg: '#e9f6ee',
      solid: successRamp[700],
      light: successRamp[600],
      dark: successRamp[800],
      onSolid: PAPER,
    },
    warning: {
      fg: warningRamp[700],
      bg: '#fdf3e3',
      solid: warningRamp[700],
      light: warningRamp[600],
      dark: warningRamp[800],
      onSolid: PAPER,
    },
    error: {
      fg: errorRamp[600],
      bg: '#fdecec',
      solid: errorRamp[600],
      light: errorRamp[500],
      dark: errorRamp[800],
      onSolid: PAPER,
    },
    info: {
      fg: infoRamp[700],
      bg: '#e3f2fa',
      solid: infoRamp[700],
      light: infoRamp[600],
      dark: infoRamp[800],
      onSolid: PAPER,
    },
  },
  action: {
    hover: 'rgba(15, 23, 42, 0.06)',
    selected: 'rgba(15, 23, 42, 0.1)',
    focus: 'rgba(79, 70, 229, 0.16)',
    active: 'rgba(15, 23, 42, 0.12)',
    disabled: 'rgba(15, 23, 42, 0.38)',
    disabledBackground: 'rgba(15, 23, 42, 0.1)',
  },
};

export const darkSemantic: SemanticColors = {
  surfaces: {
    canvas: neutralDark[50],
    surface: neutralDark[100],
    raised: neutralDark[200],
    subtle: neutralDark[50],
    overlay: neutralDark[300],
  },
  text: {
    primary: neutralDark[950],
    secondary: neutralDark[800],
    disabled: neutralDark[600],
    onAccent: INK_ON_BRIGHT,
  },
  border: {
    subtle: neutralDark[400],
    // One step lighter than the dark surface ladder — borders carry
    // separation on dark, so default must read clearly, not as a hairline.
    default: neutralDark[700],
    strong: neutralDark[800],
  },
  accent: {
    default: brand[400],
    hover: brand[300],
    pressed: brand[500],
    subtle: brand[900],
    onAccent: INK_ON_BRIGHT,
  },
  secondaryAccent: {
    default: violet[400],
    hover: violet[300],
    pressed: violet[500],
    subtle: violet[900],
    onAccent: INK_ON_BRIGHT,
  },
  status: {
    success: {
      fg: successRamp[400],
      bg: '#14261c',
      solid: successRamp[400],
      light: successRamp[300],
      dark: successRamp[500],
      onSolid: INK_ON_BRIGHT,
    },
    warning: {
      fg: warningRamp[400],
      bg: '#2b2413',
      solid: warningRamp[400],
      light: warningRamp[300],
      dark: warningRamp[500],
      onSolid: INK_ON_BRIGHT,
    },
    error: {
      fg: errorRamp[400],
      bg: '#2e1618',
      solid: errorRamp[400],
      light: errorRamp[300],
      dark: errorRamp[500],
      onSolid: INK_ON_BRIGHT,
    },
    info: {
      fg: infoRamp[400],
      bg: '#12293a',
      solid: infoRamp[400],
      light: infoRamp[300],
      dark: infoRamp[500],
      onSolid: INK_ON_BRIGHT,
    },
  },
  action: {
    hover: 'rgba(230, 235, 245, 0.08)',
    selected: 'rgba(230, 235, 245, 0.14)',
    focus: 'rgba(129, 140, 248, 0.2)',
    active: 'rgba(230, 235, 245, 0.16)',
    disabled: 'rgba(230, 235, 245, 0.38)',
    disabledBackground: 'rgba(230, 235, 245, 0.12)',
  },
};

export function semanticColors(mode: ThemeMode): SemanticColors {
  return mode === 'dark' ? darkSemantic : lightSemantic;
}
