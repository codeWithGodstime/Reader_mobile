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

export function LoadingShelf() {
  return (
    <View style={styles.loading}>
      {[0, 1, 2].map((item) => (
        <View key={item} style={styles.skeleton}>
          <View style={styles.skeletonCover} />
          <View style={styles.skeletonCopy}>
            <View style={styles.lineShort} />
            <View style={styles.line} />
            <View style={styles.line} />
          </View>
        </View>
      ))}
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
  loading: { gap: 16 },
  skeleton: {
    flexDirection: "row",
    gap: 16,
    backgroundColor: colors.paperElevated,
    borderRadius: radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.linen,
  },
  skeletonCover: {
    width: 112,
    height: 160,
    borderRadius: radius.md,
    backgroundColor: colors.paperSurface,
  },
  skeletonCopy: { flex: 1, gap: 10, justifyContent: "center" },
  line: { height: 12, borderRadius: 6, backgroundColor: colors.paperSurface },
  lineShort: { height: 12, width: "40%", borderRadius: 6, backgroundColor: colors.linen },
});
