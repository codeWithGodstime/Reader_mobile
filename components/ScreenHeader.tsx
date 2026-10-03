import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "@/components/Icon";
import { PillButton } from "@/components/ui";
import { AVATAR_URI, BRAND, LOGO_URI, TAGLINE } from "@/constants/brand";
import { colors, radius, type } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";

type Props = {
  variant: "brand" | "stack";
  section?: string;
  title?: string;
  onSearch?: () => void;
  onShare?: () => void;
};

export function ScreenHeader({ variant, section, title, onSearch, onShare }: Props) {
  const insets = useSafeAreaInsets();
  const { user, ready, signOut } = useAuth();
  const [sheet, setSheet] = useState<"notices" | "profile" | null>(null);

  return (
    <>
      <View style={[styles.bar, { paddingTop: insets.top }]}>
        <View style={styles.row}>
          {variant === "stack" ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
              style={styles.iconButton}>
              <Icon name="arrow_back_ios_new" size={20} color={colors.ink} />
            </Pressable>
          ) : null}
          <Image source={{ uri: LOGO_URI }} style={styles.logo} contentFit="cover" />
          <View style={styles.copy}>
            {variant === "brand" ? (
              <>
                <View style={styles.brandRow}>
                  <Text style={[type.headlineSm, styles.brand]}>{BRAND}</Text>
                  <Text style={[type.bodySm, styles.dot]}>•</Text>
                  <Text style={[type.labelMd, styles.section]}>{section}</Text>
                </View>
                <Text style={[type.bodySm, styles.tagline]} numberOfLines={1}>
                  {TAGLINE}
                </Text>
              </>
            ) : (
              <>
                <Text style={[type.headlineSm, styles.brand]} numberOfLines={1}>
                  {title}
                </Text>
                <Text style={[type.labelSm, styles.tagline]} numberOfLines={1}>
                  {BRAND} • {TAGLINE}
                </Text>
              </>
            )}
          </View>
          <View style={styles.actions}>
            {variant === "brand" ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Search"
                onPress={onSearch}
                style={styles.iconButton}>
                <Icon name="search" size={22} color={colors.inkMuted} />
              </Pressable>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Share"
                onPress={onShare}
                style={styles.iconButton}>
                <Icon name="share" size={22} color={colors.inkMuted} />
              </Pressable>
            )}
            {user ? (
              <>
                {variant === "brand" ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Notifications"
                    onPress={() => setSheet("notices")}
                    style={styles.iconButton}>
                    <Icon name="notifications" size={22} color={colors.inkMuted} />
                  </Pressable>
                ) : null}
                <Pressable accessibilityRole="button" accessibilityLabel="Profile" onPress={() => setSheet("profile")}>
                  <Image source={{ uri: AVATAR_URI }} style={styles.avatar} contentFit="cover" />
                </Pressable>
              </>
            ) : ready ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Sign up"
                onPress={() => router.push("/sign-in?mode=register")}
                style={styles.signUp}>
                <Text style={[type.labelMd, styles.signUpLabel]}>Sign up</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>

      <Modal visible={sheet !== null} transparent animationType="fade" onRequestClose={() => setSheet(null)}>
        <Pressable style={styles.backdrop} onPress={() => setSheet(null)}>
          <Pressable style={styles.sheet} onPress={() => undefined}>
            <View style={styles.sheetHead}>
              <Text style={[type.headlineSm, { color: colors.ink }]}>
                {sheet === "notices" ? "Notices" : "Your shelf"}
              </Text>
              <Pressable accessibilityLabel="Close" onPress={() => setSheet(null)} style={styles.iconButton}>
                <Icon name="close" size={18} color={colors.ink} />
              </Pressable>
            </View>
            {sheet === "notices" ? (
              <Text style={[type.bodyMd, styles.sheetBody]}>
                No new notices. We’ll let you know when a parcel moves.
              </Text>
            ) : user ? (
              <View style={styles.profile}>
                <Image source={{ uri: AVATAR_URI }} style={styles.profileAvatar} contentFit="cover" />
                <Text style={[type.titleMd, { color: colors.ink }]}>{user.name}</Text>
                <Text style={[type.bodyMd, styles.sheetBody]}>{user.email}</Text>
                <Text style={[type.bodySm, styles.sheetBody]}>Patron {user.patron_number}</Text>
                <PillButton
                  label="Sign out"
                  tone="outline"
                  onPress={() => {
                    setSheet(null);
                    signOut();
                  }}
                />
              </View>
            ) : (
              <View style={styles.profile}>
                <Text style={[type.bodyMd, styles.sheetBody]}>Sign in to keep a bag, a shelf, and your orders.</Text>
                <PillButton
                  label="Sign in"
                  onPress={() => {
                    setSheet(null);
                    router.push("/sign-in");
                  }}
                />
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: "rgba(252,249,244,0.96)",
    borderBottomWidth: 1,
    borderBottomColor: colors.linen,
  },
  row: {
    height: 64,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: { width: 32, height: 32, borderRadius: 8 },
  copy: { flex: 1, minWidth: 0 },
  brandRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  brand: { color: colors.ink },
  dot: { color: colors.inkMuted },
  section: { color: colors.forest },
  tagline: { color: colors.inkMuted },
  actions: { flexDirection: "row", alignItems: "center" },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginLeft: 4,
  },
  signUp: {
    marginLeft: 4,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.forest,
    alignItems: "center",
    justifyContent: "center",
  },
  signUpLabel: { color: colors.onPrimary },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(31,36,33,0.35)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.paperElevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: 20,
    paddingBottom: 36,
    gap: 12,
  },
  sheetHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sheetBody: { color: colors.inkMuted },
  profile: { alignItems: "flex-start", gap: 8 },
  profileAvatar: { width: 56, height: 56, borderRadius: 28 },
});
