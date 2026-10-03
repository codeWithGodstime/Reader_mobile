import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import { PillButton } from "@/components/ui";
import { colors, radius, type } from "@/constants/theme";
import type { FormatCode, PriceFilter } from "@/lib/api";

const PRICES: { id: PriceFilter; label: string }[] = [
  { id: "any", label: "Any price" },
  { id: "under_16", label: "Under $16" },
  { id: "from_16_to_18", label: "$16 – $18" },
  { id: "over_18", label: "$18 and up" },
];

const FORMATS: { id: FormatCode; label: string }[] = [
  { id: "paperback", label: "Paperback" },
  { id: "hardcover", label: "Hardcover" },
  { id: "ebook", label: "eBook" },
  { id: "signed", label: "Signed" },
];

type Props = {
  visible: boolean;
  price: PriceFilter;
  format: FormatCode | null;
  onChangePrice: (price: PriceFilter) => void;
  onChangeFormat: (format: FormatCode | null) => void;
  onClose: () => void;
  onReset: () => void;
  onApply: () => void;
};

export function FilterSheet({
  visible,
  price,
  format,
  onChangePrice,
  onChangeFormat,
  onClose,
  onReset,
  onApply,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => undefined}>
          <View style={styles.head}>
            <View style={styles.headCopy}>
              <Text style={[type.headlineMd, { color: colors.ink }]}>Filter & Refine</Text>
              <Text style={[type.bodySm, { color: colors.inkMuted }]}>Set price ranges and book formats</Text>
            </View>
            <Pressable accessibilityLabel="Close filters" onPress={onClose} style={styles.close}>
              <Icon name="close" size={18} color={colors.ink} />
            </Pressable>
          </View>

          <Text style={[type.labelSm, styles.group]}>Price Range</Text>
          {PRICES.map((option) => {
            const selected = price === option.id;
            return (
              <Pressable key={option.id} onPress={() => onChangePrice(option.id)} style={styles.choice}>
                <Text style={[type.bodyMd, { color: colors.ink }]}>{option.label}</Text>
                <View style={[styles.radio, selected && styles.radioOn]}>
                  {selected ? <View style={styles.radioDot} /> : null}
                </View>
              </Pressable>
            );
          })}

          <Text style={[type.labelSm, styles.group]}>Format</Text>
          <View style={styles.formats}>
            {FORMATS.map((option) => {
              const selected = format === option.id;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => onChangeFormat(selected ? null : option.id)}
                  style={[styles.format, selected && styles.formatOn]}>
                  <Text style={[type.labelSm, { color: selected ? colors.onPrimary : colors.ink, textAlign: "center" }]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.actions}>
            <PillButton label="Reset All" tone="paper" flex onPress={onReset} />
            <PillButton label="Apply Filters" flex onPress={onApply} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function priceChipLabel(price: PriceFilter) {
  return PRICES.find((item) => item.id === price)?.label ?? "";
}

export function formatChipLabel(format: FormatCode) {
  return FORMATS.find((item) => item.id === format)?.label ?? format;
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(31,36,33,0.35)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.paperElevated,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 28,
    gap: 8,
  },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  headCopy: { flex: 1, paddingRight: 12 },
  close: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.paperSurface,
    alignItems: "center",
    justifyContent: "center",
  },
  group: { color: colors.inkMuted, textTransform: "uppercase", marginTop: 8 },
  choice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.paperSurface,
    borderRadius: radius.md,
    padding: 12,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.forest,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOn: { backgroundColor: colors.forest },
  radioDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.paperBase },
  formats: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  format: {
    minWidth: "22%",
    flexGrow: 1,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colors.paperSurface,
    paddingHorizontal: 6,
  },
  formatOn: { backgroundColor: colors.forest },
  actions: { flexDirection: "row", gap: 10, marginTop: 12 },
});
