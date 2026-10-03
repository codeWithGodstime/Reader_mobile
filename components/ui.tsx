import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";

import { Icon, type IconName } from "@/components/Icon";
import { colors, radius, type } from "@/constants/theme";

type ButtonProps = {
  label: string;
  onPress: () => void;
  icon?: IconName;
  tone?: "forest" | "terracotta" | "outline" | "paper" | "ink";
  disabled?: boolean;
  flex?: boolean;
};

export function PillButton({
  label,
  onPress,
  icon,
  tone = "forest",
  disabled = false,
  flex = false,
}: ButtonProps) {
  const palette = {
    forest: { bg: colors.forest, text: colors.onPrimary, border: colors.forest },
    terracotta: { bg: colors.terracotta, text: colors.onPrimary, border: colors.terracotta },
    outline: { bg: "transparent", text: colors.ink, border: colors.linen },
    paper: { bg: colors.paperSurface, text: colors.ink, border: colors.paperSurface },
    ink: { bg: colors.ink, text: colors.paperElevated, border: colors.ink },
  }[tone];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        flex && styles.flex,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          opacity: disabled ? 0.45 : 1,
          transform: [{ scale: pressed && !disabled ? 0.98 : 1 }],
        },
      ]}>
      {icon ? <Icon name={icon} size={18} color={palette.text} /> : null}
      <Text style={[type.labelMd, { color: palette.text }]}>{label}</Text>
    </Pressable>
  );
}

type FieldProps = {
  label: string;
  error?: string;
} & TextInputProps;

export function Field({ label, error, style, ...input }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={[type.labelSm, styles.fieldLabel]}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.inkMuted}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...input}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export function PaperCard({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  flex: { flex: 1 },
  field: { gap: 6 },
  fieldLabel: { color: colors.inkMuted, textTransform: "none", letterSpacing: 0.2 },
  input: {
    ...type.bodyMd,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.paperSurface,
    borderWidth: 1,
    borderColor: colors.linen,
    paddingHorizontal: 12,
    color: colors.ink,
  },
  inputError: { borderColor: colors.error },
  error: { ...type.bodySm, color: colors.error },
  card: {
    backgroundColor: colors.paperElevated,
    borderRadius: radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.linen,
    gap: 12,
  },
});
