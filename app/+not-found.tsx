import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { colors, type } from "@/constants/theme";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <Text style={[type.headlineMd, { color: colors.ink }]}>This page isn’t on the shelf.</Text>
        <Link href="/" style={styles.link}>
          <Text style={[type.labelMd, { color: colors.forest }]}>Back to the shop</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paperBase,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  link: { marginTop: 8 },
});
