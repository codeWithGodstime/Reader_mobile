import { useEffect, useRef, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { BookCard } from "@/components/BookCard";
import { FormScroll } from "@/components/FormScroll";
import { FilterSheet, formatChipLabel, priceChipLabel } from "@/components/FilterSheet";
import { Icon } from "@/components/Icon";
import { ScreenHeader } from "@/components/ScreenHeader";
import { BookListSkeleton } from "@/components/Skeleton";
import { ShelfState } from "@/components/ShelfState";
import { colors, radius, space, type } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { ApiError, readerApi, type BookSummary, type FormatCode, type Genre, type PriceFilter, type SortKey } from "@/lib/api";

const SORTS: { id: SortKey; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "title", label: "Title (A–Z)" },
  { id: "price_asc", label: "Price: Low to High" },
  { id: "price_desc", label: "Price: High to Low" },
];

export default function ShopScreen() {
  const { user } = useAuth();
  const searchRef = useRef<TextInput>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [genre, setGenre] = useState("all");
  const [genres, setGenres] = useState<Genre[]>([]);
  const [price, setPrice] = useState<PriceFilter>("any");
  const [format, setFormat] = useState<FormatCode | null>(null);
  const [draftPrice, setDraftPrice] = useState<PriceFilter>("any");
  const [draftFormat, setDraftFormat] = useState<FormatCode | null>(null);
  const [sort, setSort] = useState<SortKey>("featured");
  const [page, setPage] = useState(1);
  const [books, setBooks] = useState<BookSummary[]>([]);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(4);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    readerApi.genres().then(setGenres).catch(() => setGenres([]));
  }, []);

  useEffect(() => {
    let active = true;
    setStatus("loading");
    readerApi
      .books({
        q: debouncedQuery,
        genre: genre === "all" ? undefined : genre,
        price,
        format: format ?? undefined,
        sort,
        page,
        page_size: 4,
      })
      .then((result) => {
        if (!active) return;
        setBooks(result.results);
        setCount(result.count);
        setPageSize(result.page_size || 4);
        setStatus("ready");
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof ApiError ? err.message : "The catalog could not be loaded.");
        setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [debouncedQuery, genre, price, format, sort, page, user, reloadKey]);

  const pageCount = Math.max(1, Math.ceil(count / pageSize));
  const from = count === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, count);
  const chips = [
    price !== "any" ? { key: "price", label: `Price: ${priceChipLabel(price)}` } : null,
    format ? { key: "format", label: formatChipLabel(format) } : null,
  ].filter((item): item is { key: string; label: string } => item !== null);

  return (
    <View style={styles.screen}>
      <ScreenHeader variant="brand" section="Shop" onSearch={() => searchRef.current?.focus()} />
      <FormScroll contentContainerStyle={styles.content}>
        <View style={styles.eyebrow}>
          <Text style={[type.labelSm, styles.eyebrowText]}>Curated Catalog</Text>
          <View style={styles.stock}>
            <View style={styles.stockDot} />
            <Text style={[type.labelSm, { color: colors.forest }]}>In Stock Ready to Ship</Text>
          </View>
        </View>
        <Text style={[type.headlineXl, styles.title]}>Find your next book</Text>
        <Text style={[type.bodyLg, styles.subtitle]}>
          Fiction, memoir, and ideas worth keeping. Add titles to your bag for curated doorstep delivery.
        </Text>

        <View style={styles.searchRow}>
          <View style={styles.search}>
            <Icon name="search" size={18} color={colors.inkMuted} />
            <TextInput
              ref={searchRef}
              value={query}
              onChangeText={(value) => {
                setQuery(value);
                setPage(1);
              }}
              placeholder="Title, author, or keyword..."
              placeholderTextColor={colors.inkMuted}
              style={[type.bodyMd, styles.searchInput]}
            />
            {query ? (
              <Pressable accessibilityLabel="Clear search" onPress={() => setQuery("")}>
                <Icon name="cancel" size={18} color={colors.inkMuted} />
              </Pressable>
            ) : null}
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setDraftPrice(price);
              setDraftFormat(format);
              setFiltersOpen(true);
            }}
            style={styles.filterButton}>
            <Icon name="tune" size={18} color={colors.ink} />
            <Text style={[type.labelMd, { color: colors.ink }]}>Filter</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <GenreChip label="All" active={genre === "all"} onPress={() => { setGenre("all"); setPage(1); }} />
          {genres.map((item) => (
            <GenreChip
              key={item.slug}
              label={item.name}
              active={genre === item.slug}
              onPress={() => {
                setGenre(item.slug);
                setPage(1);
              }}
            />
          ))}
        </ScrollView>

        {chips.length > 0 ? (
          <View style={styles.facet}>
            <View style={styles.facetRow}>
              <Text style={[type.labelSm, { color: colors.inkMuted, textTransform: "uppercase" }]}>Active Filter:</Text>
              {chips.map((chip) => (
                <Pressable
                  key={chip.key}
                  onPress={() => {
                    if (chip.key === "price") setPrice("any");
                    if (chip.key === "format") setFormat(null);
                    setPage(1);
                  }}
                  style={styles.activeChip}>
                  <Text style={[type.labelMd, { color: colors.forest }]}>{chip.label}</Text>
                  <Icon name="close" size={14} color={colors.terracotta} />
                </Pressable>
              ))}
            </View>
            <Pressable
              onPress={() => {
                setPrice("any");
                setFormat(null);
                setPage(1);
              }}>
              <Text style={[type.labelSm, { color: colors.terracotta }]}>Reset</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.meta}>
          <Text style={[type.bodySm, { color: colors.inkMuted }]}>
            Showing <Text style={[type.labelMd, { color: colors.ink }]}>{count === 0 ? "0" : `${from}–${to}`}</Text> of {count} books
          </Text>
          <Pressable style={styles.sort} onPress={() => setSortOpen(true)}>
            <Text style={[type.bodySm, { color: colors.inkMuted }]}>Sort:</Text>
            <Text style={[type.labelMd, { color: colors.forest }]}>{SORTS.find((item) => item.id === sort)?.label}</Text>
            <Icon name="expand_more" size={16} color={colors.forest} />
          </Pressable>
        </View>

        {status === "loading" ? <BookListSkeleton /> : null}
        {status === "error" ? (
          <ShelfState icon="menu_book" tone="error" title="The shelf didn’t open" body={error} action="Try again" onAction={() => setReloadKey((current) => current + 1)} />
        ) : null}
        {status === "ready" && books.length === 0 ? (
          <ShelfState
            icon="menu_book"
            title="No titles match"
            body="Try another word, or clear the filters and browse the full shelf."
            action="Reset filters"
            onAction={() => {
              setQuery("");
              setGenre("all");
              setPrice("any");
              setFormat(null);
              setPage(1);
            }}
          />
        ) : null}
        {status === "ready" ? (
          <View style={styles.list}>
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </View>
        ) : null}

        {status === "ready" && pageCount > 1 ? (
          <View style={styles.pager}>
            <Pressable disabled={page === 1} onPress={() => setPage((current) => Math.max(1, current - 1))} style={[styles.pageButton, page === 1 && styles.pageDisabled]}>
              <Icon name="chevron_left" size={18} color={colors.ink} />
              <Text style={[type.labelMd, { color: colors.ink }]}>Previous</Text>
            </Pressable>
            <View style={[styles.pageNumber, styles.pageNumberOn]}>
              <Text style={[type.labelMd, { color: colors.onPrimary }]}>{page}</Text>
            </View>
            <Pressable disabled={page >= pageCount} onPress={() => setPage((current) => current + 1)} style={[styles.pageButton, page >= pageCount && styles.pageDisabled]}>
              <Text style={[type.labelMd, { color: colors.ink }]}>Next</Text>
              <Icon name="chevron_right" size={18} color={colors.ink} />
            </Pressable>
          </View>
        ) : null}

        <View style={styles.footerNote}>
          <Icon name="menu_book" size={18} color={colors.forest} />
          <Text style={[type.bodySm, { color: colors.inkMuted }]}>Reader — books, delivered</Text>
        </View>
      </FormScroll>

      <FilterSheet
        visible={filtersOpen}
        price={draftPrice}
        format={draftFormat}
        onChangePrice={setDraftPrice}
        onChangeFormat={setDraftFormat}
        onClose={() => setFiltersOpen(false)}
        onReset={() => {
          setDraftPrice("any");
          setDraftFormat(null);
        }}
        onApply={() => {
          setPrice(draftPrice);
          setFormat(draftFormat);
          setPage(1);
          setFiltersOpen(false);
        }}
      />

      <Modal visible={sortOpen} transparent animationType="fade" onRequestClose={() => setSortOpen(false)}>
        <Pressable style={styles.sortBackdrop} onPress={() => setSortOpen(false)}>
          <View style={styles.sortSheet}>
            <Text style={[type.headlineSm, { color: colors.ink }]}>Sort</Text>
            {SORTS.map((option) => (
              <Pressable
                key={option.id}
                onPress={() => {
                  setSort(option.id);
                  setPage(1);
                  setSortOpen(false);
                }}
                style={styles.sortOption}>
                <Text style={[type.bodyMd, { color: option.id === sort ? colors.forest : colors.ink }]}>{option.label}</Text>
                {option.id === sort ? <Icon name="check_circle" size={18} color={colors.forest} filled /> : null}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function GenreChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipOn]}>
      <Text style={[type.labelMd, { color: active ? colors.onPrimary : colors.inkMuted }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paperBase },
  content: { padding: space.margin, paddingBottom: 32, gap: 16 },
  eyebrow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  eyebrowText: { color: colors.inkMuted, textTransform: "uppercase" },
  stock: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.paperSurface, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  stockDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.forest },
  title: { color: colors.ink },
  subtitle: { color: colors.inkMuted },
  searchRow: { flexDirection: "row", gap: 8 },
  search: { flex: 1, height: 44, borderRadius: radius.md, backgroundColor: colors.paperElevated, borderWidth: 1, borderColor: colors.linen, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 8 },
  searchInput: { flex: 1, color: colors.ink, padding: 0 },
  filterButton: { height: 44, paddingHorizontal: 12, borderRadius: radius.md, backgroundColor: colors.paperElevated, borderWidth: 1, borderColor: colors.linen, flexDirection: "row", alignItems: "center", gap: 6 },
  chips: { gap: 8, paddingRight: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.paperSurface },
  chipOn: { backgroundColor: colors.forest },
  facet: { backgroundColor: "rgba(244,239,230,0.6)", borderRadius: radius.lg, padding: 12, gap: 8 },
  facetRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  activeChip: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.paperElevated, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  meta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  sort: { flexDirection: "row", alignItems: "center", gap: 4, flexShrink: 1 },
  list: { gap: 16 },
  pager: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  pageButton: { height: 40, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: colors.paperSurface, flexDirection: "row", alignItems: "center", gap: 2 },
  pageDisabled: { opacity: 0.4 },
  pageNumber: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  pageNumberOn: { backgroundColor: colors.forest },
  footerNote: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingTop: 8 },
  sortBackdrop: { flex: 1, backgroundColor: "rgba(31,36,33,0.35)", justifyContent: "flex-end" },
  sortSheet: { backgroundColor: colors.paperElevated, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, gap: 4, paddingBottom: 32 },
  sortOption: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 },
});
