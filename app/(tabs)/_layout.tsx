import { Tabs } from "expo-router";

import { ReaderTabBar } from "@/components/ReaderTabBar";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <ReaderTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: "Shop" }} />
      <Tabs.Screen name="saved" options={{ title: "Saved" }} />
      <Tabs.Screen name="cart" options={{ title: "Cart" }} />
      <Tabs.Screen name="orders" options={{ title: "Orders" }} />
    </Tabs>
  );
}
