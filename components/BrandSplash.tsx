import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import { BRAND, LOGO_URI, TAGLINE } from "@/constants/brand";
import { colors, radius, type } from "@/constants/theme";

export function BrandSplash() {
  return (
    <View style={styles.screen}>
      <Image accessibilityIgnoresInvertColors source={{ uri: LOGO_URI }} style={styles.logo} contentFit="cover" />
      <Text accessibilityRole="header" style={[type.headlineLg, styles.name]}>
        {BRAND}
      </Text>
      <View style={styles.rule} />
      <Text style={[type.bodyMd, styles.tagline]}>{TAGLINE}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.forest,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 32,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    marginBottom: 8,
  },
  name: { color: colors.paperBase },
  rule: {
    width: 36,
    height: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.terracotta,
  },
  tagline: { color: colors.linen },
});
