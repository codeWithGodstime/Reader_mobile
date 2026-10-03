import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { PlayfairDisplay_600SemiBold, PlayfairDisplay_600SemiBold_Italic } from "@expo-google-fonts/playfair-display";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { MaterialSymbols_400Regular } from "@expo-google-fonts/material-symbols/400Regular";

import { Icon } from "@/components/Icon";
import { colors, radius, type } from "@/constants/theme";
import { AuthProvider } from "@/context/AuthContext";
import { ShopProvider, useShop } from "@/context/ShopContext";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_600SemiBold_Italic,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    MaterialSymbols_400Regular,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ShopProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paperBase } }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="book/[id]" />
            <Stack.Screen name="sign-in" options={{ presentation: "modal" }} />
          </Stack>
          <ToastHost />
        </ShopProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function ToastHost() {
  const { toast } = useShop();
  const insets = useSafeAreaInsets();
  if (!toast) return null;
  return (
    <View pointerEvents="none" style={[styles.toastWrap, { bottom: insets.bottom + 84 }]}>
      <View style={styles.toast}>
        <Icon name="bookmark_added" size={18} color={colors.terracotta} filled />
        <Text style={[type.labelMd, { color: colors.onPrimary }]}>{toast}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toastWrap: { position: "absolute", left: 0, right: 0, alignItems: "center" },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.forest,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
});
