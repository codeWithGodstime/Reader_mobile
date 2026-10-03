import { Pressable, StyleSheet, Text, View } from "react-native";

import { Icon, type IconName } from "@/components/Icon";
import { colors, radius, type } from "@/constants/theme";

type Props = {
  icon: IconName;
  title: string;
  body: string;
  action?: string;
  onAction?: () => void;
  tone?: "empty" | "error";
};

export function ShelfState({ icon, title, body, action, onAction, tone = "empty" }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.iconWrap, tone === "error" && styles.iconError]}>
        <Icon name={icon} size={28} color={tone === "error" ? colors.error : colors.forest} />
      </View>
      <Text style={[type.headlineSm, styles.title]}>{title}</Text>
      <Text style={[type.bodyMd, styles.body]}>{body}</Text>
      {action && onAction ? (
        <Pressable accessibilityRole="button" onPress={onAction} style={styles.action}>
          <Text style={[type.labelMd, { color: colors.onPrimary }]}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingVertical: 36,
    paddingHorizontal: 12,
    gap: 8,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.paperSurface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  iconError: { backgroundColor: colors.errorContainer },
  title: { color: colors.ink, textAlign: "center" },
  body: { color: colors.inkMuted, textAlign: "center" },
  action: {
    marginTop: 8,
    backgroundColor: colors.forest,
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
});
