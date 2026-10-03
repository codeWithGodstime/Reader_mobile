import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";

import { BookCover } from "@/components/BookCover";
import { Icon, Stars } from "@/components/Icon";
import { ScreenHeader } from "@/components/ScreenHeader";
import { BookDetailSkeleton } from "@/components/Skeleton";
import { ShelfState } from "@/components/ShelfState";
import { colors, radius, space, type } from "@/constants/theme";
import { useShop } from "@/context/ShopContext";
import { ApiError, compactCount, dollars, readerApi, type BookDetail, type BookFormat, type BookSummary, type Review } from "@/lib/api";

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart, toggleSaved, isSaved } = useShop();
  const [book, setBook] = useState<BookDetail | null>(null);
  const [related, setRelated] = useState<BookSummary[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [edition, setEdition] = useState<BookFormat | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [expanded, setExpanded] = useState(false);

  const load = () => {
    if (!id) return;
    setStatus("loading");
    Promise.all([readerApi.book(id), readerApi.related(id), readerApi.reviews(id)])
      .then(([detail, companions, reviewPage]) => {
        setBook(detail);
        setEdition(detail.formats.find((item) => item.code === detail.format) ?? detail.formats[0] ?? null);
        setRelated(companions);
        setReviews(reviewPage.results);
        setStatus("ready");
      })
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : "This title could not be opened.");
        setStatus("error");
      });
  };

  useEffect(() => {
    load();
  }, [id]);

  const saved = book ? isSaved(book.id, book.saved) : false;
  const price = edition?.price ?? book?.price ?? "0.00";
  const compare = edition?.compare_at_price ?? book?.compare_at_price;
  const savePercent = compare && Number(compare) > Number(price) ? Math.round((1 - Number(price) / Number(compare)) * 100) : 0;

  return (
    <View style={styles.screen}>
      <ScreenHeader
        variant="stack"
        title="Book Details"
        onShare={() => book && Share.share({ message: `${book.title} by ${book.author_name} — Reader` })}
      />
      {status === "loading" ? <BookDetailSkeleton /> : null}
      {status === "error" ? (
        <ShelfState icon="menu_book" tone="error" title="This title isn’t on the shelf" body={error} action="Back to the shop" onAction={() => router.replace("/")} />
      ) : null}
      {status === "ready" && book && edition ? (
        <>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.hero}>
              <BookCover
                title={book.title}
                author={book.author_name}
                coverUrl={book.gallery[0]?.url || book.cover_url}
                width={210}
                height={310}
                badge={book.badges.includes("bestseller") ? "Bestseller" : book.genre.name}
                footer={`Print • ${book.pages}pp`}
              />
              <Pressable
                accessibilityLabel={saved ? "Remove from reading list" : "Save to reading list"}
                onPress={() => {
                  void toggleSaved({ ...book, saved });
                }}
                style={styles.bookmark}>
                <Icon name={saved ? "bookmark" : "bookmark_border"} size={22} color={colors.forest} filled={saved} />
              </Pressable>
            </View>
            <Text style={[type.labelSm, { color: colors.terracotta }]}>{book.genre.name}</Text>
            <Text style={[type.headlineLg, { color: colors.ink }]}>{book.title}</Text>
            <Text style={[type.bodyLg, { color: colors.inkMuted }]}>by {book.author.name}</Text>
            <View style={styles.rating}>
              <Stars rating={book.rating} />
              <Text style={[type.labelMd, { color: colors.ink }]}>{book.rating.toFixed(1)}</Text>
              <Text style={[type.bodySm, { color: colors.inkMuted }]}>{compactCount(book.review_count)} verified readers</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={[type.headlineMd, { color: colors.ink }]}>{dollars(price)}</Text>
              {compare && savePercent > 0 ? (
                <>
                  <Text style={[type.bodyMd, styles.compare]}>{dollars(compare)}</Text>
                  <Text style={[type.labelSm, styles.save]}>Save {savePercent}%</Text>
                </>
              ) : null}
            </View>
            <Text style={[type.labelSm, styles.kicker]}>Select Edition</Text>
            <View style={styles.editions}>
              {book.formats.map((item) => {
                const selected = item.code === edition.code;
                return (
                  <Pressable key={item.code} onPress={() => setEdition(item)} style={[styles.edition, selected && styles.editionOn]}>
                    <Text style={[type.labelMd, { color: selected ? colors.onPrimary : colors.ink }]}>{item.label}</Text>
                    <Text style={[type.bodySm, { color: selected ? colors.paperBase : colors.inkMuted }]}>{dollars(item.price)}</Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.specs}>
              <Spec icon="auto_stories" label="Length" value={`${book.pages} pages`} />
              <Spec icon="domain" label="Publisher" value={book.publisher} />
              <Spec icon="translate" label="Language" value={book.language} />
            </View>
            <Text style={[type.headlineSm, { color: colors.ink }]}>About this work</Text>
            <Text style={[type.bodyMd, { color: colors.inkMuted }]} numberOfLines={expanded ? undefined : 4}>
              {book.about}
            </Text>
            <Pressable onPress={() => setExpanded((value) => !value)} style={styles.inline}>
              <Text style={[type.labelMd, { color: colors.forest }]}>{expanded ? "Show less" : "Read more"}</Text>
              <Icon name="expand_more" size={16} color={colors.forest} />
            </Pressable>
            {book.curator_note ? (
              <View style={styles.note}>
                <Icon name="format_quote" size={20} color={colors.terracotta} />
                <Text style={[type.quote, { color: colors.ink }]}>“{book.curator_note.quote}”</Text>
                <Text style={[type.labelMd, { color: colors.ink }]}>{book.curator_note.name}</Text>
                <Text style={[type.bodySm, { color: colors.inkMuted }]}>{book.curator_note.role}</Text>
              </View>
            ) : null}
            <Text style={[type.headlineSm, { color: colors.ink }]}>Readers</Text>
            {reviews.length === 0 ? (
              <Text style={[type.bodyMd, { color: colors.inkMuted }]}>Notes from readers will gather here.</Text>
            ) : (
              reviews.map((review) => (
                <View key={review.id} style={styles.review}>
                  <Text style={[type.titleMd, { color: colors.ink }]}>{review.reviewer_name}</Text>
                  <Text style={[type.bodySm, { color: colors.inkMuted }]}>
                    {review.reviewer_title ?? "Reader"}
                    {review.verified_purchase ? " • Verified purchase" : ""}
                  </Text>
                  <Stars rating={review.rating} size={14} />
                  <Text style={[type.bodyMd, { color: colors.ink }]}>“{review.body}”</Text>
                </View>
              ))
            )}
            {related.length > 0 ? (
              <>
                <Text style={[type.headlineSm, { color: colors.ink }]}>Frequently Read Next</Text>
                <Text style={[type.bodySm, { color: colors.inkMuted }]}>Handpicked companions for this shelf</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.related}>
                  {related.map((item) => (
                    <Pressable key={item.id} onPress={() => router.push({ pathname: "/book/[id]", params: { id: item.id } })} style={styles.relatedCard}>
                      <BookCover title={item.title} author={item.author_name} coverUrl={item.cover_url} width={96} height={140} badge={item.genre.name} />
                      <Text style={[type.titleMd, { color: colors.ink }]} numberOfLines={2}>{item.title}</Text>
                      <Text style={[type.bodySm, { color: colors.inkMuted }]} numberOfLines={1}>{item.author_name}</Text>
                      <Text style={[type.labelMd, { color: colors.ink }]}>{dollars(item.price)}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </>
            ) : null}
          </ScrollView>
          <View style={styles.bar}>
            <View style={styles.inline}>
              <Icon name="local_shipping" size={16} color={colors.forest} />
              <Text style={[type.bodySm, { color: colors.inkMuted, flex: 1 }]}>Free delivery on orders over $35</Text>
            </View>
            <View style={styles.barRow}>
              <View style={styles.stepper}>
                <Pressable accessibilityLabel="Decrease quantity" onPress={() => setQuantity((value) => Math.max(1, value - 1))} style={styles.stepBtn}>
                  <Icon name="remove" size={16} color={colors.ink} />
                </Pressable>
                <Text style={[type.titleMd, { color: colors.ink }]}>{quantity}</Text>
                <Pressable accessibilityLabel="Increase quantity" onPress={() => setQuantity((value) => Math.min(20, value + 1))} style={styles.stepBtn}>
                  <Icon name="add" size={16} color={colors.ink} />
                </Pressable>
              </View>
              <Pressable
                onPress={() => addToCart(book.id, edition.code, quantity)}
                style={styles.add}>
                <Icon name="shopping_bag" size={18} color={colors.onPrimary} />
                <Text style={[type.labelMd, { color: colors.onPrimary }]}>Add to Cart • {dollars((Number(price) * quantity).toFixed(2))}</Text>
              </Pressable>
            </View>
          </View>
        </>
      ) : null}
    </View>
  );
}

function Spec({ icon, label, value }: { icon: "auto_stories" | "domain" | "translate"; label: string; value: string }) {
  return (
    <View style={styles.spec}>
      <Icon name={icon} size={18} color={colors.forest} />
      <Text style={[type.labelSm, { color: colors.inkMuted }]}>{label}</Text>
      <Text style={[type.labelMd, { color: colors.ink, textAlign: "center" }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paperBase },
  content: { padding: space.margin, paddingBottom: 140, gap: 10 },
  hero: { alignItems: "center", marginBottom: 8 },
  bookmark: { position: "absolute", right: 36, bottom: -8, width: 44, height: 44, borderRadius: 22, backgroundColor: colors.paperElevated, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.linen },
  rating: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  compare: { color: colors.inkMuted, textDecorationLine: "line-through" },
  save: { color: colors.terracotta },
  kicker: { color: colors.inkMuted, textTransform: "uppercase", marginTop: 8 },
  editions: { flexDirection: "row", gap: 8 },
  edition: { flex: 1, paddingVertical: 10, borderRadius: radius.md, backgroundColor: colors.paperSurface, alignItems: "center", gap: 2 },
  editionOn: { backgroundColor: colors.forest },
  specs: { flexDirection: "row", gap: 8, marginVertical: 8 },
  spec: { flex: 1, backgroundColor: colors.paperElevated, borderRadius: radius.md, borderWidth: 1, borderColor: colors.linen, padding: 10, alignItems: "center", gap: 4 },
  inline: { flexDirection: "row", alignItems: "center", gap: 4 },
  note: { backgroundColor: colors.paperSurface, borderRadius: radius.lg, padding: 16, gap: 6 },
  review: { backgroundColor: colors.paperElevated, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.linen, padding: 14, gap: 4 },
  related: { gap: 12, paddingVertical: 4 },
  relatedCard: { width: 120, gap: 4 },
  bar: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: "rgba(250,247,242,0.96)", borderTopWidth: 1, borderTopColor: colors.linen, padding: 16, gap: 8 },
  barRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  stepper: { flexDirection: "row", alignItems: "center", gap: 8 },
  stepBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.paperSurface, alignItems: "center", justifyContent: "center" },
  add: { flex: 1, height: 48, borderRadius: radius.pill, backgroundColor: colors.forest, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
});
