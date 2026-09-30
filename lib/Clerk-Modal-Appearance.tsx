import { dark } from "@clerk/ui/themes";

/**
 * Dark theme for Clerk modals (sign-in, sign-up) that matches the app's purple palette.
 * Uses Clerk's prebuilt `dark` theme as a base, then overrides variables with a
 * violet-tinted dark palette and a purple primary color.
 *
 * Every color lives in `palette` below, so retuning the look is a one-place change.
 * If your `.dark` block in `app/globals.css` uses different values, paste them in here.
 *
 * @see https://clerk.com/docs/guides/customizing-clerk/appearance-prop/themes
 * @see https://clerk.com/docs/guides/customizing-clerk/appearance-prop/variables
 */
const palette = {
  // Brand purple (hue ~285) plus its hover and pressed states
  primary: "oklch(0.62 0.21 285)",
  primaryHover: "oklch(0.56 0.21 285)",
  primaryActive: "oklch(0.51 0.21 285)",
  primaryForeground: "oklch(1 0 0)",

  // Violet-tinted dark surfaces
  background: "oklch(0.24 0.035 285)",
  card: "oklch(0.26 0.04 285)",
  muted: "oklch(0.21 0.03 285)",
  surface: "oklch(0.3 0.045 285)", // inputs, secondary buttons, borders
  surfaceHover: "oklch(0.34 0.045 285)",

  // Text
  foreground: "oklch(0.95 0.01 290)",
  mutedForeground: "oklch(0.8 0.03 290)",

  // Orchid accent (echoes the magenta glow in the hero) with dark text on top
  accent: "oklch(0.78 0.13 310)",
  accentForeground: "oklch(0.2 0.03 290)",
} as const;

const FONT_FAMILY =
  "Montserrat, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

export const clerkModalAppearance = {
  theme: dark,
  variables: {
    // Primary brand color
    colorPrimary: palette.primary,
    colorPrimaryForeground: palette.primaryForeground,

    // Background and foreground colors
    colorBackground: palette.background,
    colorForeground: palette.foreground,

    // Card and surface colors
    colorCard: palette.card,
    colorCardForeground: palette.foreground,

    // Input field colors
    colorInput: palette.surface,
    colorInputForeground: palette.foreground,

    // Secondary colors
    colorSecondary: palette.surface,
    colorSecondaryForeground: palette.foreground,

    // Muted colors for subtle elements
    colorMuted: palette.muted,
    colorMutedForeground: palette.mutedForeground,

    // Accent colors
    colorAccent: palette.accent,
    colorAccentForeground: palette.accentForeground,

    // Border colors
    colorBorder: palette.surface,

    // Shadow and ring colors
    colorRing: palette.primary,

    // Typography
    fontFamily: FONT_FAMILY,

    // Border radius to match app's design
    borderRadius: "0.625rem",
    borderRadiusSmall: "0.375rem",
    borderRadiusLarge: "0.875rem",
  },
  elements: {
    // Ensure consistent spacing and typography
    formButtonPrimary: {
      backgroundColor: palette.primary,
      color: palette.primaryForeground,
      "&:hover": {
        backgroundColor: palette.primaryHover,
      },
      "&:active": {
        backgroundColor: palette.primaryActive,
      },
    },
    formButtonReset: {
      backgroundColor: palette.surface,
      color: palette.foreground,
      borderColor: palette.surface,
      "&:hover": {
        backgroundColor: palette.surfaceHover,
      },
    },
    card: {
      backgroundColor: palette.card,
      borderColor: palette.surface,
    },
    headerTitle: {
      color: palette.foreground,
      fontFamily: FONT_FAMILY,
    },
    headerSubtitle: {
      color: palette.mutedForeground,
    },
    socialButtonsBlockButton: {
      backgroundColor: palette.surface,
      color: palette.foreground,
      borderColor: palette.surface,
      "&:hover": {
        backgroundColor: palette.surfaceHover,
      },
    },
    formFieldInput: {
      backgroundColor: palette.surface,
      color: palette.foreground,
      borderColor: palette.surface,
      "&:focus": {
        borderColor: palette.primary,
        boxShadow: `0 0 0 1px ${palette.primary}`,
      },
    },
    footerActionLink: {
      color: palette.primary,
      "&:hover": {
        color: palette.primaryHover,
      },
    },
  },
} as const;