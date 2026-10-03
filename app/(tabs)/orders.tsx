import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { BookCover } from "@/components/BookCover";
import { Icon, type IconName } from "@/components/Icon";
import { ScreenHeader } from "@/components/ScreenHeader";
import { LoadingShelf, ShelfState } from "@/components/ShelfState";
import { PillButton } from "@/components/ui";
import { BRAND } from "@/constants/brand";
import { colors, radius, space, type } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useShop } from "@/context/ShopContext";
import { ApiError, dollars, readerApi, shelfDate, type Invoice, type Order, type OrderStatus, type Tracking } from "@/lib/api";

const STATUS: Record<OrderStatus, string> = {
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function OrdersScreen() {
  const { user, ready } = useAuth();
  const { replaceCart, showToast } = useShop();
  const [tab, setTab] = useState<"active" | "past">("active");
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [counts, setCounts] = useState({ active: 0, past: 0 });
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [tracking, setTracking] = useState<Tracking | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [sheetError, setSheetError] = useState("");
  const [reviewFor, setReviewFor] = useState<Order | null>(null);
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(5);
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportNote, setSupportNote] = useState("");

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      setOrders([]);
      setStatus("ready");
      return;
    }
    let active = true;
    setStatus("loading");
    Promise.all([
      readerApi.orders(tab, query.trim() || undefined),
      readerApi.orders(tab === "active" ? "past" : "active"),
    ])
      .then(([current, other]) => {
        if (!active) return;
        setOrders(current.results);
        setCounts(tab === "active" ? { active: current.count, past: other.count } : { active: other.count, past: current.count });
        setStatus("ready");
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof ApiError ? err.message : "Orders could not be loaded.");
        setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [ready, user, tab, query]);

  const openTracking = async (order: Order) => {
    setSheetError("");
    try {
      setTracking(await readerApi.tracking(order.id));
    } catch (err) {
      setSheetError(err instanceof ApiError ? err.message : "Tracking is not available yet.");
      setTracking({
        order_id: order.id,
        number: order.number,
        status: order.status,
        carrier: order.carrier,
        tracking_number: order.tracking_number,
        estimated_delivery: order.estimated_delivery,
        events: [],
      });
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader variant="brand" section="Orders" onSearch={() => setSearching(true)} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[type.labelSm, styles.kicker]}>Account Shelves</Text>
        <Text style={[type.headlineMd, { color: colors.forest }]}>Your Orders</Text>
        {!user && ready ? (
          <ShelfState icon="receipt_long" title="Sign in to see orders" body="Parcels you place appear on this shelf." action="Sign in" onAction={() => router.push("/sign-in")} />
        ) : null}
        {user && searching ? (
          <View style={styles.search}>
            <Icon name="search" size={18} color={colors.inkMuted} />
            <TextInput autoFocus value={query} onChangeText={setQuery} placeholder="Order number or title" placeholderTextColor={colors.inkMuted} style={[type.bodyMd, styles.searchInput]} />
            <Pressable onPress={() => { setQuery(""); setSearching(false); }}>
              <Icon name="close" size={18} color={colors.inkMuted} />
            </Pressable>
          </View>
        ) : null}
        {user ? (
          <View style={styles.tabs}>
            <TabButton label="Active Orders" count={counts.active} active={tab === "active"} onPress={() => setTab("active")} />
            <TabButton label="Past Orders" count={counts.past} active={tab === "past"} onPress={() => setTab("past")} />
          </View>
        ) : null}
        {user && status === "loading" ? <LoadingShelf /> : null}
        {user && status === "error" ? <ShelfState icon="receipt_long" tone="error" title="Orders didn’t load" body={error} /> : null}
        {user && status === "ready" && orders.length === 0 ? (
          <ShelfState
            icon="receipt_long"
            title={query ? "No orders match" : tab === "active" ? "No active orders" : "No past orders"}
            body={query ? "Try another order number or title." : tab === "active" ? "When you place an order, it will wait here until it arrives." : "Delivered parcels will settle on this shelf."}
          />
        ) : null}
        {user && status === "ready" && tab === "past" && orders.length > 0 ? (
          <>
            <Text style={[type.headlineSm, { color: colors.forest }]}>Past Shelved Orders</Text>
            <Text style={[type.bodySm, { color: colors.inkMuted }]}>{counts.past} total completed</Text>
          </>
        ) : null}
        {user && status === "ready"
          ? orders.map((order) => (
              <View key={order.id} style={styles.card}>
                <View style={styles.rowBetween}>
                  <View style={styles.inline}>
                    <Icon name={order.status === "delivered" ? "check_circle" : "local_shipping"} size={18} color={colors.forest} filled={order.status === "delivered"} />
                    <Text style={[type.titleMd, { color: colors.ink }]}>#{order.number}</Text>
                  </View>
                  <Text style={[type.bodySm, { color: colors.inkMuted }]}>{shelfDate(order.placed_at)}</Text>
                </View>
                <Text style={[type.bodySm, { color: colors.inkMuted }]}>
                  {order.item_count} books • {dollars(order.total)}
                </Text>
                <View style={styles.statusPill}>
                  <Text style={[type.labelSm, { color: colors.forest }]}>{STATUS[order.status]}</Text>
                </View>
                {order.estimated_delivery && order.status !== "delivered" ? (
                  <View style={styles.eta}>
                    <Icon name="calendar_today" size={16} color={colors.terracotta} />
                    <View>
                      <Text style={[type.labelSm, { color: colors.inkMuted }]}>Estimated Delivery</Text>
                      <Text style={[type.titleMd, { color: colors.ink }]}>{shelfDate(order.estimated_delivery)}</Text>
                    </View>
                  </View>
                ) : null}
                {order.status !== "delivered" && order.status !== "cancelled" ? <Progress status={order.status} /> : null}
                <Text style={[type.labelSm, styles.kicker]}>Titles in this package</Text>
                {order.items.map((item) => (
                  <View key={`${order.id}-${item.title}-${item.format}`} style={styles.line}>
                    <BookCover title={item.title} author={item.author_name} coverUrl={item.cover_url} width={56} height={80} />
                    <View style={styles.lineCopy}>
                      <Text style={[type.headlineSm, { color: colors.ink }]} numberOfLines={1}>{item.title}</Text>
                      <Text style={[type.bodySm, { color: colors.inkMuted }]}>{item.author_name} • {item.format_label}</Text>
                      <Text style={[type.bodySm, { color: colors.inkMuted }]}>Qty: {item.quantity}</Text>
                    </View>
                    <Text style={[type.titleMd, { color: colors.ink }]}>{dollars(item.unit_price)}</Text>
                  </View>
                ))}
                {tab === "active" ? (
                  <View style={styles.actions}>
                    <View style={styles.flex}>
                      <PillButton label="Track Shipment" icon="location_on" tone="outline" onPress={() => openTracking(order)} />
                    </View>
                    <Pressable
                      onPress={async () => {
                        try {
                          setInvoice(await readerApi.invoice(order.id));
                        } catch (err) {
                          showToast(err instanceof ApiError ? err.message : "Invoice isn’t ready.");
                        }
                      }}
                      style={styles.invoice}>
                      <Icon name="description" size={18} color={colors.ink} />
                    </Pressable>
                  </View>
                ) : (
                  <View style={styles.actions}>
                    <View style={styles.flex}>
                      <PillButton
                        label="Buy Again"
                        icon="shopping_bag"
                        tone="outline"
                        onPress={async () => {
                          try {
                            replaceCart(await readerApi.buyAgain(order.id));
                            showToast("Added to Cart!");
                          } catch (err) {
                            showToast(err instanceof ApiError ? err.message : "Could not buy these again.");
                          }
                        }}
                      />
                    </View>
                    <View style={styles.flex}>
                      <PillButton label="Review" icon="rate_review" tone="paper" onPress={() => setReviewFor(order)} />
                    </View>
                  </View>
                )}
              </View>
            ))
          : null}

        <View style={styles.help}>
          <Icon name="support_agent" size={22} color={colors.forest} />
          <Text style={[type.titleMd, { color: colors.ink }]}>Need help with a delivery?</Text>
          <Text style={[type.bodyMd, { color: colors.inkMuted }]}>
            Every parcel is hand-wrapped in recycled linen tissue. If your books arrive damaged or delayed, our booksellers are here for you.
          </Text>
          <Pressable style={styles.inline} onPress={() => setSupportOpen(true)}>
            <Text style={[type.labelMd, { color: colors.forest }]}>Contact Reader Support</Text>
            <Icon name="arrow_forward" size={16} color={colors.forest} />
          </Pressable>
        </View>
        <Text style={[type.quote, styles.quote]}>“A book is a garden, an orchard, a storehouse, a party, a company by the way.”</Text>
        <Text style={[type.bodySm, styles.signoff]}>{BRAND} • Books for every shelf</Text>
      </ScrollView>

      <Sheet visible={tracking !== null} title="Live Parcel Tracking" onClose={() => setTracking(null)}>
        {tracking ? (
          <>
            <Text style={[type.labelSm, { color: colors.inkMuted }]}>Tracking #</Text>
            <Text style={[type.titleMd, { color: colors.ink }]}>{tracking.tracking_number ?? "Assigned after dispatch"}</Text>
            <View style={styles.statusPill}>
              <Text style={[type.labelSm, { color: colors.forest }]}>{STATUS[tracking.status]}</Text>
            </View>
            {tracking.carrier ? <Text style={[type.bodySm, { color: colors.inkMuted }]}>{tracking.carrier}</Text> : null}
            {tracking.estimated_delivery ? (
              <Text style={[type.bodySm, { color: colors.inkMuted }]}>Estimated {shelfDate(tracking.estimated_delivery)}</Text>
            ) : null}
            {sheetError ? <Text style={[type.bodySm, { color: colors.error }]}>{sheetError}</Text> : null}
            {tracking.events.map((event) => (
              <View key={`${event.code}-${event.label}`} style={styles.event}>
                <Icon name="local_shipping" size={18} color={event.state === "upcoming" ? colors.inkMuted : colors.forest} />
                <View style={styles.flex}>
                  <Text style={[type.titleMd, { color: colors.ink }]}>{event.label}</Text>
                  <Text style={[type.bodySm, { color: colors.inkMuted }]}>
                    {[event.location, event.occurred_at ? shelfDate(event.occurred_at) : null].filter(Boolean).join(" • ")}
                  </Text>
                </View>
              </View>
            ))}
            <PillButton label="Back to Orders" onPress={() => setTracking(null)} />
          </>
        ) : null}
      </Sheet>

      <Sheet visible={invoice !== null} title="Invoice" onClose={() => setInvoice(null)}>
        {invoice ? (
          <>
            <Text style={[type.titleMd, { color: colors.ink }]}>#{invoice.number}</Text>
            <Text style={[type.bodySm, { color: colors.inkMuted }]}>{shelfDate(invoice.placed_at)} • {invoice.email}</Text>
            {invoice.items.map((item) => (
              <View key={`${item.title}-${item.format}`} style={styles.rowBetween}>
                <Text style={[type.bodyMd, styles.flex, { color: colors.ink }]}>{item.title} × {item.quantity}</Text>
                <Text style={[type.titleMd, { color: colors.ink }]}>{dollars(item.line_total)}</Text>
              </View>
            ))}
            <View style={styles.rowBetween}>
              <Text style={[type.titleMd, { color: colors.ink }]}>Total</Text>
              <Text style={[type.headlineSm, { color: colors.ink }]}>{dollars(invoice.total)}</Text>
            </View>
          </>
        ) : null}
      </Sheet>

      <Sheet visible={reviewFor !== null} title="Review" onClose={() => setReviewFor(null)}>
        <Text style={[type.bodyMd, { color: colors.inkMuted }]}>A few lines for the next reader.</Text>
        <View style={styles.inline}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Pressable key={star} onPress={() => setRating(star)}>
              <Icon name="star" size={22} color={star <= rating ? colors.terracotta : colors.linen} filled={star <= rating} />
            </Pressable>
          ))}
        </View>
        <TextInput value={review} onChangeText={setReview} placeholder="What stayed with you?" placeholderTextColor={colors.inkMuted} multiline style={styles.review} />
        <PillButton
          label="Save review"
          onPress={async () => {
            const bookId = reviewFor?.items.find((item) => item.book_id)?.book_id;
            if (!reviewFor || !bookId) {
              showToast("This parcel has no title to review.");
              return;
            }
            if (!review.trim()) {
              showToast("Write a line or two first");
              return;
            }
            try {
              await readerApi.createReview(bookId, { rating, body: review.trim(), edition: reviewFor.items[0]?.format_label });
              setReview("");
              setReviewFor(null);
              showToast("Review saved");
            } catch (err) {
              showToast(err instanceof ApiError ? err.message : "The review could not be saved.");
            }
          }}
        />
      </Sheet>

      <Sheet visible={supportOpen} title="Reader Support" onClose={() => setSupportOpen(false)}>
        <Text style={[type.bodyMd, { color: colors.inkMuted }]}>Tell us what happened with the parcel.</Text>
        <TextInput value={supportNote} onChangeText={setSupportNote} placeholder="Damaged jacket, late delivery..." placeholderTextColor={colors.inkMuted} multiline style={styles.review} />
        <PillButton
          label="Send note"
          onPress={async () => {
            if (!user) {
              router.push("/sign-in");
              return;
            }
            if (!supportNote.trim()) {
              showToast("Add a note for the bookseller");
              return;
            }
            try {
              await readerApi.support({ email: user.email, subject: "Delivery help", message: supportNote.trim() });
              setSupportNote("");
              setSupportOpen(false);
              showToast("Note sent to Reader support");
            } catch (err) {
              showToast(err instanceof ApiError ? err.message : "The note could not be sent.");
            }
          }}
        />
      </Sheet>
    </View>
  );
}

function TabButton({ label, count, active, onPress }: { label: string; count: number; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.tab, active && styles.tabOn]}>
      <Text style={[type.labelMd, { color: active ? colors.onPrimary : colors.inkMuted }]}>{label}</Text>
      <View style={[styles.count, active && styles.countOn]}>
        <Text style={[type.labelSm, { color: active ? colors.forest : colors.inkMuted }]}>{count}</Text>
      </View>
    </Pressable>
  );
}

function Progress({ status }: { status: OrderStatus }) {
  const steps: { icon: IconName; label: string; on: boolean }[] = [
    { icon: "done", label: "Confirmed", on: true },
    { icon: "local_shipping", label: "Shipped", on: status === "shipped" || status === "out_for_delivery" || status === "delivered" },
    { icon: "home", label: "Delivery", on: status === "delivered" },
  ];
  return (
    <View style={styles.progress}>
      {steps.map((step) => (
        <View key={step.label} style={styles.progressItem}>
          <Icon name={step.icon} size={18} color={step.on ? colors.forest : colors.inkMuted} filled={step.on} />
          <Text style={[type.labelSm, { color: step.on ? colors.forest : colors.inkMuted }]}>{step.label}</Text>
        </View>
      ))}
    </View>
  );
}

function Sheet({ visible, title, onClose, children }: { visible: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => undefined}>
          <View style={styles.rowBetween}>
            <Text style={[type.headlineSm, styles.flex, { color: colors.ink }]}>{title}</Text>
            <Pressable accessibilityLabel="Close" onPress={onClose} style={styles.close}>
              <Icon name="close" size={18} color={colors.ink} />
            </Pressable>
          </View>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paperBase },
  content: { padding: space.margin, paddingBottom: 40, gap: 12 },
  kicker: { color: colors.inkMuted, textTransform: "uppercase" },
  search: { height: 44, borderRadius: radius.md, borderWidth: 1, borderColor: colors.linen, backgroundColor: colors.paperElevated, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12 },
  searchInput: { flex: 1, color: colors.ink, padding: 0 },
  tabs: { flexDirection: "row", backgroundColor: colors.paperSurface, borderRadius: radius.pill, padding: 4, gap: 4 },
  tab: { flex: 1, borderRadius: radius.pill, paddingVertical: 8, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6 },
  tabOn: { backgroundColor: colors.forest },
  count: { minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.paperElevated, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  countOn: { backgroundColor: colors.paperBase },
  card: { backgroundColor: colors.paperElevated, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.linen, padding: 16, gap: 10 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  inline: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusPill: { alignSelf: "flex-start", backgroundColor: colors.paperSurface, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  eta: { flexDirection: "row", gap: 8, alignItems: "center", backgroundColor: colors.paperSurface, borderRadius: radius.md, padding: 10 },
  progress: { flexDirection: "row", justifyContent: "space-between" },
  progressItem: { alignItems: "center", gap: 4, flex: 1 },
  line: { flexDirection: "row", gap: 10, alignItems: "center" },
  lineCopy: { flex: 1, gap: 2 },
  actions: { flexDirection: "row", gap: 8, alignItems: "center" },
  flex: { flex: 1 },
  invoice: { width: 48, height: 48, borderRadius: radius.pill, backgroundColor: colors.paperSurface, alignItems: "center", justifyContent: "center" },
  help: { marginTop: 12, backgroundColor: colors.paperSurface, borderRadius: radius.xl, padding: 16, gap: 8 },
  quote: { color: colors.ink, marginTop: 12 },
  signoff: { color: colors.inkMuted, textAlign: "center" },
  backdrop: { flex: 1, backgroundColor: "rgba(31,36,33,0.35)", justifyContent: "flex-end" },
  sheet: { backgroundColor: colors.paperElevated, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 32, gap: 12, maxHeight: "85%" },
  close: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.paperSurface, alignItems: "center", justifyContent: "center" },
  event: { flexDirection: "row", gap: 10 },
  review: { minHeight: 100, borderRadius: radius.md, borderWidth: 1, borderColor: colors.linen, backgroundColor: colors.paperSurface, padding: 12, ...type.bodyMd, color: colors.ink, textAlignVertical: "top" },
});
