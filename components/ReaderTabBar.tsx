import type { BottomTabBarProps } from "expo-router/tabs";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon, type IconName } from "@/components/Icon";
import { colors, shadow, type } from "@/constants/theme";
import { useShop } from "@/context/ShopContext";

const TABS: Record<string, { label: string; icon: IconName }> = {
  index: { label: "Shop", icon: "storefront" },
  saved: { label: "Saved", icon: "bookmark" },
  cart: { label: "Cart", icon: "shopping_bag" },
  orders: { label: "Orders", icon: "receipt_long" },
};

export function ReaderTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { itemCount } = useShop();

  return (
    <View style={[styles.dock, shadow.dock, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route, index) => {
        const tab = TABS[route.name];
        if (!tab) return null;
        const active = state.index === index;
        const color = active ? colors.forest : colors.inkMuted;
        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!active && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <Pressable key={route.key} accessibilityRole="button" onPress={onPress} style={styles.item}>
            <View>
              <Icon name={tab.icon} size={24} color={color} filled={active} />
              {route.name === "cart" && itemCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{itemCount}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[type.labelSm, { color, fontFamily: active ? type.labelMd.fontFamily : type.labelSm.fontFamily }]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    flexDirection: "row",
    backgroundColor: "rgba(250,247,242,0.96)",
    borderTopWidth: 1,
    borderTopColor: colors.linen,
    paddingTop: 6,
  },
  item: { flex: 1, alignItems: "center", justifyContent: "center", minHeight: 52, gap: 2 },
  badge: {
    position: "absolute",
    top: -4,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.terracotta,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.onPrimary,
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 10,
    lineHeight: 12,
  },
});
