import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { BookCard } from "@/components/BookCard";
import { ScreenHeader } from "@/components/ScreenHeader";
import { LoadingShelf, ShelfState } from "@/components/ShelfState";
import { colors, space, type } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { ApiError, readerApi, type BookSummary } from "@/lib/api";

export default function SavedScreen() {
  const { user, ready } = useAuth();
  const [books, setBooks] = useState<BookSummary[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      setBooks([]);
      setStatus("ready");
      return;
    }
    let active = true;
    setStatus("loading");
    readerApi
      .shelves()
      .then(async (shelves) => {
        const saved = shelves.find((shelf) => shelf.is_default) ?? shelves[0];
        if (!saved) return [];
        const detail = await readerApi.shelf(saved.id);
        return detail.books;
      })
      .then((items) => {
        if (!active) return;
        setBooks(items);
        setStatus("ready");
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof ApiError ? err.message : "Saved titles could not be loaded.");
        setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [ready, user]);

  return (
    <View style={styles.screen}>
      <ScreenHeader variant="brand" section="Saved" onSearch={() => router.push("/")} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[type.headlineXl, { color: colors.ink }]}>Saved for later</Text>
        <Text style={[type.bodyLg, styles.subtitle]}>Titles you marked to return to.</Text>
        {!user && ready ? (
          <ShelfState
            icon="bookmark"
            title="Nothing saved yet"
            body="Sign in, then tap the bookmark on a book to keep it on this shelf."
            action="Sign in"
            onAction={() => router.push("/sign-in")}
          />
        ) : null}
        {user && status === "loading" ? <LoadingShelf /> : null}
        {user && status === "error" ? (
          <ShelfState icon="bookmark" tone="error" title="The shelf didn’t open" body={error} />
        ) : null}
        {user && status === "ready" && books.length === 0 ? (
          <ShelfState
            icon="bookmark"
            title="Nothing saved yet"
            body="Tap the bookmark on a book to keep it on this shelf."
            action="Browse the shop"
            onAction={() => router.push("/")}
          />
        ) : null}
        {user && status === "ready" ? (
          <View style={styles.list}>
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paperBase },
  content: { padding: space.margin, paddingBottom: 32, gap: 12 },
  subtitle: { color: colors.inkMuted, marginBottom: 8 },
  list: { gap: 16 },
});
