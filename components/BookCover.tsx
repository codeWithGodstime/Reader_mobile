import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius, type } from "@/constants/theme";

type Props = {
  title: string;
  author: string;
  coverUrl?: string | null;
  width: number;
  height: number;
  badge?: string;
  footer?: string;
};

export function BookCover({ title, author, coverUrl, width, height, badge, footer }: Props) {
  return (
    <View style={[styles.wrap, { width, height, backgroundColor: colors.forest }]}>
      {coverUrl ? (
        <Image source={{ uri: coverUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.fallback]}>
          <Text style={styles.fallbackTitle} numberOfLines={4}>
            {title}
          </Text>
          <Text style={styles.fallbackAuthor} numberOfLines={2}>
            {author}
          </Text>
        </View>
      )}
      <View style={styles.spine} />
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
      {footer ? (
        <View style={styles.footer}>
          <Text style={styles.footerText}>{footer}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: radius.md, overflow: "hidden" },
  spine: { position: "absolute", left: 0, top: 0, bottom: 0, width: 7, backgroundColor: "rgba(0,0,0,0.14)" },
  fallback: { padding: 12, justifyContent: "flex-end" },
  fallbackTitle: { ...type.headlineSm, color: colors.paperBase },
  fallbackAuthor: { ...type.bodySm, color: "rgba(250,247,242,0.86)", marginTop: 6 },
  badge: {
    position: "absolute",
    top: 6,
    left: 8,
    backgroundColor: "rgba(244,239,230,0.95)",
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: { ...type.labelSm, fontSize: 10, color: colors.forest },
  footer: {
    position: "absolute",
    left: 8,
    right: 8,
    bottom: 8,
    backgroundColor: "rgba(244,239,230,0.95)",
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  footerText: { ...type.labelSm, color: colors.forest, textAlign: "center" },
});
