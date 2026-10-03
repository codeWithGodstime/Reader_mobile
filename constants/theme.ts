export const colors = {
  paperBase: "#FAF7F2",
  paperSurface: "#F4EFE6",
  paperElevated: "#FFFFFF",
  ink: "#1F2421",
  inkMuted: "#5C6560",
  forest: "#1E3A2F",
  forestDeep: "#07241A",
  terracotta: "#C85A32",
  amber: "#D4A373",
  linen: "#E7DFD3",
  surface: "#FCF9F4",
  error: "#BA1A1A",
  errorContainer: "#FFDAD6",
  onPrimary: "#FFFFFF",
  outline: "#727974",
};

export const space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
  margin: 20,
};

export const radius = {
  sm: 4,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

export const type = {
  headlineXl: {
    fontFamily: "PlayfairDisplay_600SemiBold",
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: -0.45,
  },
  headlineLg: {
    fontFamily: "PlayfairDisplay_600SemiBold",
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.28,
  },
  headlineMd: {
    fontFamily: "PlayfairDisplay_600SemiBold",
    fontSize: 22,
    lineHeight: 28,
  },
  headlineSm: {
    fontFamily: "PlayfairDisplay_600SemiBold",
    fontSize: 18,
    lineHeight: 24,
  },
  quote: {
    fontFamily: "PlayfairDisplay_600SemiBold_Italic",
    fontSize: 18,
    lineHeight: 28,
  },
  titleMd: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 16,
    lineHeight: 22,
  },
  bodyLg: {
    fontFamily: "PlusJakartaSans_400Regular",
    fontSize: 16,
    lineHeight: 26,
  },
  bodyMd: {
    fontFamily: "PlusJakartaSans_400Regular",
    fontSize: 14,
    lineHeight: 22,
  },
  bodySm: {
    fontFamily: "PlusJakartaSans_400Regular",
    fontSize: 12,
    lineHeight: 18,
  },
  labelMd: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.13,
  },
  labelSm: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.44,
  },
} as const;

export const shadow = {
  card: {
    shadowColor: "#1F2421",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  dock: {
    shadowColor: "#1F2421",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 8,
  },
  cover: {
    shadowColor: "#1F2421",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },
};
