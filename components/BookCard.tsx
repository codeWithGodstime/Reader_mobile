import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { BookCover } from "@/components/BookCover";
import { Icon } from "@/components/Icon";
import { colors, radius, shadow, type } from "@/constants/theme";
import { useShop } from "@/context/ShopContext";
import { compactCount, dollars, type BookSummary } from "@/lib/api";

export function BookCard({ book }: { book: BookSummary }) {
  const { addToCart } = useShop();

  return (
    <View style={[styles.card, shadow.card]}>
      <Link href={{ pathname: "/book/[id]", params: { id: book.id } }} asChild>
        <Pressable accessibilityRole="button">
          <BookCover
            title={book.title}
            author={book.author_name}
            coverUrl={book.cover_url}
            width={112}
            height={160}
            badge={book.genre.name}
          />
        </Pressable>
      </Link>
      <View style={styles.copy}>
        <Link href={{ pathname: "/book/[id]", params: { id: book.id } }} asChild>
          <Pressable style={styles.textBlock}>
            <View style={styles.rating}>
              <Icon name="star" size={15} color={colors.terracotta} filled />
              <Text style={[type.labelSm, { color: colors.ink }]}>{book.rating.toFixed(1)}</Text>
              <Text style={[type.bodySm, { color: colors.inkMuted }]}>({compactCount(book.review_count)})</Text>
            </View>
            <Text style={[type.headlineSm, styles.title]} numberOfLines={1}>
              {book.title}
            </Text>
            <Text style={[type.bodySm, styles.blurb]} numberOfLines={3}>
              {book.description}
            </Text>
          </Pressable>
        </Link>
        <View style={styles.footer}>
          <View style={styles.priceBlock}>
            <Text style={[type.labelSm, { color: colors.inkMuted }]}>{book.format_label}</Text>
            <Text style={[type.headlineSm, { color: colors.ink }]}>{dollars(book.price)}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Add ${book.title} to cart`}
            onPress={() => addToCart(book.id, book.format)}
            style={({ pressed }) => [styles.add, pressed && { transform: [{ scale: 0.97 }] }]}>
            <Icon name="add_shopping_cart" size={16} color={colors.onPrimary} />
            <Text style={[type.labelMd, { color: colors.onPrimary }]}>Add</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.paperElevated,
    borderRadius: radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.linen,
    flexDirection: "row",
    gap: 16,
  },
  copy: { flex: 1, minWidth: 0, justifyContent: "space-between" },
  textBlock: { gap: 4 },
  rating: { flexDirection: "row", alignItems: "center", gap: 4 },
  title: { color: colors.ink },
  blurb: { color: colors.inkMuted },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8, gap: 8 },
  priceBlock: { flexShrink: 1 },
  add: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.forest,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
