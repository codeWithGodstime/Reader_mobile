import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  AccessibilityInfo,
  Animated,
  ScrollView,
  StyleSheet,
  View,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { colors, radius, shadow, space } from "@/constants/theme";

const PulseContext = createContext<Animated.Value | null>(null);

function SkeletonPulse({ children }: { children: ReactNode }) {
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    let animation: { stop: () => void } | null = null;
    let reduceMotion = false;
    let cancelled = false;

    const play = () => {
      animation?.stop();
      animation = null;
      if (cancelled || reduceMotion) {
        opacity.setValue(1);
        return;
      }
      opacity.setValue(0.45);
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.45, duration: 700, useNativeDriver: true }),
        ]),
      );
      animation = loop;
      loop.start();
    };

    play();
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        reduceMotion = enabled;
        if (!cancelled) play();
      })
      .catch(() => undefined);

    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", (enabled) => {
      reduceMotion = enabled;
      play();
    });

    return () => {
      cancelled = true;
      animation?.stop();
      subscription.remove();
    };
  }, [opacity]);

  return <PulseContext.Provider value={opacity}>{children}</PulseContext.Provider>;
}

type BoneProps = {
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

export function Bone({ width, height = 12, radius: boneRadius = 6, style }: BoneProps) {
  const pulse = useContext(PulseContext);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.bone,
        { height, borderRadius: boneRadius, opacity: pulse ?? 1 },
        width != null ? { width } : null,
        style,
      ]}
    />
  );
}

function LoadingFrame({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <SkeletonPulse>
      <View accessibilityLabel="Loading" accessibilityState={{ busy: true }} style={style}>
        {children}
      </View>
    </SkeletonPulse>
  );
}

export function BookListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <LoadingFrame style={styles.stack}>
      {Array.from({ length: count }, (_, index) => (
        <View key={index} style={[styles.bookCard, shadow.card]}>
          <Bone width={112} height={160} radius={radius.md} />
          <View style={styles.bookCopy}>
            <View style={styles.row}>
              <Bone width={14} height={14} radius={7} />
              <Bone width={28} height={12} />
              <Bone width={40} height={12} />
            </View>
            <Bone width="82%" height={18} />
            <Bone height={12} />
            <Bone height={12} />
            <Bone width="68%" height={12} />
            <View style={styles.bookFooter}>
              <View style={styles.priceBlock}>
                <Bone width={64} height={11} />
                <Bone width={52} height={18} />
              </View>
              <Bone width={76} height={40} radius={radius.pill} />
            </View>
          </View>
        </View>
      ))}
    </LoadingFrame>
  );
}

export function OrderListSkeleton({ count = 2 }: { count?: number }) {
  return (
    <LoadingFrame style={styles.orderStack}>
      {Array.from({ length: count }, (_, index) => (
        <View key={index} style={styles.orderCard}>
          <View style={styles.spread}>
            <Bone width={128} height={16} />
            <Bone width={72} height={12} />
          </View>
          <Bone width={148} height={12} />
          <Bone width={92} height={22} radius={radius.pill} />
          <Bone height={52} radius={radius.md} />
          <View style={styles.progress}>
            <Bone width={64} height={32} />
            <Bone width={64} height={32} />
            <Bone width={64} height={32} />
          </View>
          <Bone width={132} height={11} />
          <View style={styles.line}>
            <Bone width={56} height={80} radius={radius.md} />
            <View style={styles.lineCopy}>
              <Bone width="86%" height={16} />
              <Bone width="64%" height={12} />
              <Bone width={48} height={12} />
            </View>
            <Bone width={48} height={16} />
          </View>
          <View style={styles.actions}>
            <Bone height={48} radius={radius.pill} style={styles.flex} />
            <Bone width={48} height={48} radius={radius.pill} />
          </View>
        </View>
      ))}
    </LoadingFrame>
  );
}

export function BookDetailSkeleton() {
  return (
    <SkeletonPulse>
      <View accessibilityLabel="Loading" accessibilityState={{ busy: true }} style={styles.detail}>
        <ScrollView style={styles.flex} contentContainerStyle={styles.detailBody}>
          <View style={styles.hero}>
            <Bone width={210} height={310} radius={radius.md} />
          </View>
          <Bone width={72} height={12} />
          <Bone width="88%" height={28} />
          <Bone width="46%" height={18} />
          <View style={styles.row}>
            <Bone width={84} height={14} />
            <Bone width={28} height={14} />
            <Bone width={120} height={12} />
          </View>
          <Bone width={84} height={24} />
          <Bone width={108} height={11} />
          <View style={styles.row}>
            <Bone height={52} radius={radius.md} style={styles.flex} />
            <Bone height={52} radius={radius.md} style={styles.flex} />
          </View>
          <View style={styles.row}>
            <Bone height={78} radius={radius.md} style={styles.flex} />
            <Bone height={78} radius={radius.md} style={styles.flex} />
            <Bone height={78} radius={radius.md} style={styles.flex} />
          </View>
          <Bone width={148} height={18} />
          <Bone height={12} />
          <Bone height={12} />
          <Bone height={12} />
          <Bone width="62%" height={12} />
          <Bone width={120} height={18} />
          <Bone height={88} radius={radius.lg} />
        </ScrollView>
        <View style={styles.bar}>
          <Bone width="72%" height={14} />
          <View style={styles.row}>
            <Bone width={108} height={28} radius={radius.pill} />
            <Bone height={48} radius={radius.pill} style={styles.flex} />
          </View>
        </View>
      </View>
    </SkeletonPulse>
  );
}

export function CartSkeleton() {
  return (
    <LoadingFrame style={styles.cartStack}>
      <View style={styles.paper}>
        <View style={styles.spread}>
          <Bone width={168} height={16} />
          <Bone width={56} height={16} />
        </View>
        {[0, 1].map((item) => (
          <View key={item} style={styles.line}>
            <Bone width={48} height={68} radius={radius.md} />
            <View style={styles.lineCopy}>
              <Bone width="78%" height={16} />
              <Bone width="52%" height={12} />
            </View>
            <Bone width={48} height={16} />
          </View>
        ))}
        <Bone height={14} />
        <Bone height={14} />
        <Bone width="40%" height={18} style={styles.alignEnd} />
      </View>
      <View style={styles.paper}>
        <Bone width={148} height={16} />
        <Bone height={44} radius={radius.md} />
        <Bone height={44} radius={radius.md} />
        <Bone height={44} radius={radius.md} />
        <View style={styles.row}>
          <Bone height={44} radius={radius.md} style={styles.flex} />
          <Bone width={84} height={44} radius={radius.md} />
        </View>
      </View>
      <View style={styles.paper}>
        <Bone width={132} height={16} />
        <Bone height={64} radius={radius.md} />
        <Bone height={64} radius={radius.md} />
      </View>
    </LoadingFrame>
  );
}

const styles = StyleSheet.create({
  bone: { backgroundColor: colors.linen },
  stack: { gap: 16 },
  orderStack: { gap: 12 },
  cartStack: { gap: 16 },
  bookCard: {
    backgroundColor: colors.paperElevated,
    borderRadius: radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.linen,
    flexDirection: "row",
    gap: 16,
  },
  bookCopy: { flex: 1, minWidth: 0, justifyContent: "space-between", gap: 8 },
  bookFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  priceBlock: { gap: 6 },
  orderCard: {
    backgroundColor: colors.paperElevated,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.linen,
    padding: 16,
    gap: 10,
  },
  paper: {
    backgroundColor: colors.paperElevated,
    borderRadius: radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.linen,
    gap: 12,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  spread: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  progress: { flexDirection: "row", justifyContent: "space-between" },
  line: { flexDirection: "row", gap: 10, alignItems: "center" },
  lineCopy: { flex: 1, gap: 6 },
  actions: { flexDirection: "row", gap: 8, alignItems: "center" },
  flex: { flex: 1 },
  alignEnd: { alignSelf: "flex-end" },
  detail: { flex: 1 },
  detailBody: { padding: space.margin, paddingBottom: 140, gap: 10 },
  hero: { alignItems: "center", marginBottom: 8 },
  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(250,247,242,0.96)",
    borderTopWidth: 1,
    borderTopColor: colors.linen,
    padding: 16,
    gap: 8,
  },
});
