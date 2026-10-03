import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { BookCard } from "@/components/BookCard";
import { ScreenHeader } from "@/components/ScreenHeader";
import { BookListSkeleton } from "@/components/Skeleton";
import { ShelfState } from "@/components/ShelfState";
import { colors, space, type } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useShop } from "@/context/ShopContext";

export default function SavedScreen() {
  const { user, ready } = useAuth();
  const { savedBooks, savedStatus, savedError, refreshSaved } = useShop();
  const showSaved = user && savedBooks.length > 0;
  const showLoading = user && savedStatus === "loading" && savedBooks.length === 0;
  const showError = user && savedStatus === "error" && savedBooks.length === 0;
  const showEmpty = user && savedStatus === "ready" && savedBooks.length === 0;

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
        {showLoading ? <BookListSkeleton /> : null}
        {showError ? (
          <ShelfState
            icon="bookmark"
            tone="error"
            title="The shelf didn’t open"
            body={savedError}
            action="Try again"
            onAction={() => {
              void refreshSaved();
            }}
          />
        ) : null}
        {showEmpty ? (
          <ShelfState
            icon="bookmark"
            title="Nothing saved yet"
            body="Tap the bookmark on a book to keep it on this shelf."
            action="Browse the shop"
            onAction={() => router.push("/")}
          />
        ) : null}
        {showSaved ? (
          <View style={styles.list}>
            {savedBooks.map((book) => (
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
