import { useIsFocused } from "expo-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewProps,
} from "react-native";

const FIELD_GAP = 20;

type FormScrollProps = ScrollViewProps & {
  children: ReactNode;
};

export function FormScroll({
  children,
  style,
  contentContainerStyle,
  onScroll,
  ...rest
}: FormScrollProps) {
  const focused = useIsFocused();
  const frameRef = useRef<View>(null);
  const scrollRef = useRef<ScrollView>(null);
  const offsetY = useRef(0);
  const keyboardTop = useRef(0);
  const [bottomInset, setBottomInset] = useState(0);

  useEffect(() => {
    if (Platform.OS !== "android" || !focused) return;

    const showSub = Keyboard.addListener("keyboardDidShow", (event) => {
      const input = TextInput.State.currentlyFocusedInput();
      const scroll = scrollRef.current as (ScrollView & { getInnerViewRef?: () => View | null }) | null;
      const inner = scroll?.getInnerViewRef?.();
      if (!input || !scroll || !inner) return;
      const top = event.endCoordinates.screenY;
      input.measureLayout(
        inner,
        () => {
          keyboardTop.current = top;
          frameRef.current?.measureInWindow((_x, y, _width, height) => {
            setBottomInset(Math.max(0, y + height - top) + FIELD_GAP);
          });
        },
        () => undefined,
      );
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      keyboardTop.current = 0;
      setBottomInset(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
      setBottomInset(0);
    };
  }, [focused]);

  useEffect(() => {
    if (Platform.OS !== "android" || bottomInset <= 0) return;
    const frame = requestAnimationFrame(() => {
      revealFocusedInput(scrollRef.current, offsetY.current, keyboardTop.current);
    });
    return () => cancelAnimationFrame(frame);
  }, [bottomInset]);

  return (
    <View
      ref={frameRef}
      collapsable={false}
      style={[styles.fill, bottomInset > 0 ? { marginBottom: bottomInset } : null]}>
      <ScrollView
        {...rest}
        ref={scrollRef}
        style={[styles.fill, style]}
        contentContainerStyle={contentContainerStyle}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={focused}
        scrollEventThrottle={16}
        onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
          offsetY.current = event.nativeEvent.contentOffset.y;
          onScroll?.(event);
        }}>
        {children}
      </ScrollView>
    </View>
  );
}

export function keyboardAvoidingBehavior(): "padding" | undefined {
  return Platform.OS === "web" ? undefined : "padding";
}

function revealFocusedInput(scroll: ScrollView | null, offsetY: number, keyboardTop: number) {
  const input = TextInput.State.currentlyFocusedInput();
  if (!scroll || input == null || keyboardTop <= 0) return;
  input.measureInWindow((_x, y, _width, height) => {
    const overlap = y + height + FIELD_GAP - keyboardTop;
    if (overlap > 0) scroll.scrollTo({ y: offsetY + overlap, animated: true });
  });
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
