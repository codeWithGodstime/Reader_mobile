import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from "react-native";

import { BookCover } from "@/components/BookCover";
import { Icon } from "@/components/Icon";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ShelfState } from "@/components/ShelfState";
import { Field, PaperCard, PillButton } from "@/components/ui";
import { colors, radius, space, type } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useShop } from "@/context/ShopContext";
import { ApiError, dollars, readerApi, type ShippingMethod } from "@/lib/api";

type Errors = Partial<Record<"name" | "street" | "city" | "state" | "zip" | "phone" | "brand" | "last4" | "exp", string>>;

export default function CartScreen() {
  const { user } = useAuth();
  const { cart, removeLine, applyVoucher, clearVoucher, refreshCart, showToast } = useShop();
  const [speed, setSpeed] = useState<"standard" | "express">("standard");
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [name, setName] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [promo, setPromo] = useState("");
  const [promoError, setPromoError] = useState("");
  const [payMethod, setPayMethod] = useState<"card" | "paypal" | "google_pay">("card");
  const [brand, setBrand] = useState("visa");
  const [last4, setLast4] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user?.email]);

  useEffect(() => {
    if (!user) return;
    readerApi
      .addresses()
      .then((addresses) => {
        const address = addresses.find((item) => item.is_default) ?? addresses[0];
        if (!address) return;
        setName(address.full_name);
        setStreet(address.street);
        setCity(address.city);
        setState(address.state);
        setZip(address.postal_code);
        setPhone(address.phone);
      })
      .catch(() => undefined);
  }, [user]);

  useEffect(() => {
    if (!cart) return;
    const merchandise = Number(cart.subtotal) - Number(cart.discount);
    readerApi
      .shippingMethods(merchandise.toFixed(2))
      .then(setMethods)
      .catch(() => setMethods([]));
  }, [cart?.subtotal, cart?.discount]);

  const selectedMethod = methods.find((method) => method.code === speed);
  const shipping = selectedMethod?.price ?? (speed === "standard" ? cart?.shipping ?? "0.00" : "4.99");
  const subtotal = cart?.subtotal ?? "0.00";
  const discount = cart?.discount ?? "0.00";
  const tax = cart?.tax ?? "0.00";
  const total = (Number(subtotal) - Number(discount) + Number(shipping) + Number(tax)).toFixed(2);

  const submit = async () => {
    if (!cart || cart.items.length === 0) return;
    const next: Errors = {};
    if (!name.trim()) next.name = "Enter the recipient’s full name.";
    if (!street.trim()) next.street = "Enter a street address.";
    if (!city.trim()) next.city = "Enter a city.";
    if (state.trim().length !== 2) next.state = "Use a two-letter state code.";
    if (!zip.trim()) next.zip = "Enter a ZIP code.";
    if (!phone.trim()) next.phone = "Enter a mobile number for dispatch.";
    if (payMethod === "card") {
      if (!brand.trim()) next.brand = "Enter the card brand.";
      if (!/^\d{4}$/.test(last4)) next.last4 = "Enter the last 4 digits.";
      const month = Number(expMonth);
      const year = Number(expYear);
      if (month < 1 || month > 12 || year < 2024) next.exp = "Enter a valid expiration.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setBusy(true);
    setFormError("");
    try {
      const order = await readerApi.checkout({
        email: email.trim(),
        marketing_opt_in: false,
        shipping_method: speed,
        address: {
          full_name: name.trim(),
          street: street.trim(),
          line2: null,
          city: city.trim(),
          state: state.trim().toUpperCase(),
          postal_code: zip.trim(),
          phone: phone.trim(),
          save: true,
        },
        payment:
          payMethod === "card"
            ? {
                method: "card",
                brand: brand.trim().toLowerCase(),
                last4,
                exp_month: Number(expMonth),
                exp_year: Number(expYear),
                save: true,
              }
            : { method: payMethod, save: false },
      });
      await refreshCart();
      setConfirmed(order.number);
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "The order could not be placed.");
    } finally {
      setBusy(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.screen}>
        <ScreenHeader variant="stack" title="Checkout Flow" onShare={() => Share.share({ message: "Reader checkout" })} />
        <View style={styles.content}>
          <ShelfState
            icon="shopping_bag"
            title="Sign in to see your bag"
            body="Your books stay with your shelf once you’re signed in."
            action="Sign in"
            onAction={() => router.push("/sign-in")}
          />
        </View>
      </View>
    );
  }

  if (confirmed) {
    return (
      <View style={styles.screen}>
        <ScreenHeader variant="stack" title="Checkout Flow" onShare={() => Share.share({ message: `Reader order ${confirmed}` })} />
        <ScrollView contentContainerStyle={styles.content}>
          <Stepper active={3} />
          <PaperCard>
            <Icon name="check_circle" size={28} color={colors.forest} filled />
            <Text style={[type.headlineMd, { color: colors.ink }]}>Your order is confirmed</Text>
            <Text style={[type.bodyMd, { color: colors.inkMuted }]}>
              {confirmed} is on your shelf. A confirmation goes to {email}.
            </Text>
            <PillButton label="View orders" icon="receipt_long" onPress={() => router.push("/orders")} />
          </PaperCard>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader variant="stack" title="Checkout Flow" onShare={() => Share.share({ message: "Reader checkout" })} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Stepper active={1} />
        {!cart || cart.items.length === 0 ? (
          <ShelfState
            icon="shopping_bag"
            title="Your bag is empty"
            body="Fiction, memoir, and ideas worth keeping are waiting on the shop shelf."
            action="Browse the shop"
            onAction={() => router.push("/")}
          />
        ) : (
          <>
            <PaperCard>
              <View style={styles.rowBetween}>
                <Text style={[type.labelSm, styles.kicker]}>Fast & Secure</Text>
                <View style={styles.inline}>
                  <Icon name="lock" size={14} color={colors.forest} />
                  <Text style={[type.labelSm, { color: colors.forest }]}>256-bit Encrypted</Text>
                </View>
              </View>
              <View style={styles.payRow}>
                <View style={styles.payFlex}>
                  <PillButton label="Pay" icon="wallet" tone={payMethod === "paypal" ? "ink" : "outline"} onPress={() => setPayMethod("paypal")} />
                </View>
                <View style={styles.payFlex}>
                  <PillButton label="Google" tone={payMethod === "google_pay" ? "forest" : "paper"} onPress={() => setPayMethod("google_pay")} />
                </View>
              </View>
              <Text style={[type.bodySm, { color: colors.inkMuted, textAlign: "center" }]}>or continue with address</Text>
            </PaperCard>

            <PaperCard>
              <View style={styles.rowBetween}>
                <View style={styles.inline}>
                  <Icon name="auto_stories" size={18} color={colors.forest} />
                  <Text style={[type.titleMd, { color: colors.ink }]}>Order Summary ({cart.item_count} books)</Text>
                </View>
                <Text style={[type.titleMd, { color: colors.ink }]}>{dollars(total)}</Text>
              </View>
              {cart.items.map((item) => (
                <View key={item.id} style={styles.line}>
                  <BookCover title={item.title} author={item.author_name} coverUrl={item.cover_url} width={48} height={68} />
                  <View style={styles.lineCopy}>
                    <Text style={[type.titleMd, { color: colors.ink }]} numberOfLines={1}>{item.title}</Text>
                    <Text style={[type.bodySm, { color: colors.inkMuted }]}>{item.format_label} • Qty {item.quantity}</Text>
                    <Pressable onPress={() => removeLine(item.id)}>
                      <Text style={[type.labelSm, { color: colors.terracotta }]}>Remove</Text>
                    </Pressable>
                  </View>
                  <Text style={[type.titleMd, { color: colors.ink }]}>{dollars(item.line_total)}</Text>
                </View>
              ))}
              <View style={styles.promoRow}>
                <View style={styles.promoField}>
                  <Icon name="sell" size={16} color={colors.inkMuted} />
                  <TextInput
                    value={promo}
                    onChangeText={(value) => {
                      setPromo(value);
                      setPromoError("");
                    }}
                    placeholder="Promo or Gift Code"
                    placeholderTextColor={colors.inkMuted}
                    autoCapitalize="characters"
                    style={[type.bodyMd, styles.promoInput]}
                  />
                </View>
                <Pressable
                  onPress={async () => {
                    if (!promo.trim()) {
                      setPromoError("Enter a promo or gift code.");
                      return;
                    }
                    try {
                      await applyVoucher(promo.trim());
                      setPromoError("");
                    } catch (error) {
                      setPromoError(error instanceof ApiError ? error.message : "That code could not be applied.");
                    }
                  }}
                  style={styles.apply}>
                  <Text style={[type.labelMd, { color: colors.onPrimary }]}>Apply</Text>
                </Pressable>
              </View>
              {cart.voucher ? (
                <View style={styles.inline}>
                  <Icon name="check_circle" size={16} color={colors.forest} filled />
                  <Text style={[type.bodySm, { color: colors.forest }]}>Code applied successfully</Text>
                  <Pressable onPress={() => clearVoucher().catch(() => undefined)}>
                    <Text style={[type.labelSm, { color: colors.terracotta }]}>Remove</Text>
                  </Pressable>
                </View>
              ) : null}
              {promoError ? <Text style={[type.bodySm, { color: colors.error }]}>{promoError}</Text> : null}
              <SummaryRow label="Subtotal" value={dollars(cart.subtotal)} />
              {Number(cart.discount) > 0 ? <SummaryRow label="Discount" value={`−${dollars(cart.discount)}`} /> : null}
              <SummaryRow label="Shipping" hint={Number(shipping) === 0 ? `Free over $${cart.free_shipping_threshold}` : undefined} value={Number(shipping) === 0 ? "FREE" : dollars(shipping)} />
              <SummaryRow label="Estimated Tax" value={dollars(cart.tax)} />
              <SummaryRow label="Total" value={dollars(total)} strong />
            </PaperCard>

            <PaperCard>
              <View style={styles.rowBetween}>
                <View style={styles.inline}>
                  <Icon name="local_shipping" size={18} color={colors.forest} />
                  <Text style={[type.titleMd, { color: colors.ink }]}>Delivery Address</Text>
                </View>
                <Text style={[type.labelSm, styles.required]}>Required</Text>
              </View>
              <Field label="Email for the receipt" placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
              <Field label="Recipient Full Name" placeholder="First and last name" value={name} onChangeText={setName} error={errors.name} />
              <Field label="Street Address" placeholder="Street address or P.O. Box" value={street} onChangeText={setStreet} error={errors.street} />
              <View style={styles.split}>
                <View style={styles.splitItem}>
                  <Field label="City" placeholder="City" value={city} onChangeText={setCity} error={errors.city} />
                </View>
                <View style={styles.splitNarrow}>
                  <Field label="State" placeholder="CA" autoCapitalize="characters" maxLength={2} value={state} onChangeText={setState} error={errors.state} />
                </View>
              </View>
              <View style={styles.split}>
                <View style={styles.splitItem}>
                  <Field label="ZIP Code" placeholder="Postal code" value={zip} onChangeText={setZip} error={errors.zip} />
                </View>
                <View style={styles.splitItem}>
                  <Field label="Mobile Phone" placeholder="(555) 000-0000" keyboardType="phone-pad" value={phone} onChangeText={setPhone} error={errors.phone} />
                </View>
              </View>
            </PaperCard>

            <PaperCard>
              <View style={styles.inline}>
                <Icon name="schedule" size={18} color={colors.forest} />
                <Text style={[type.titleMd, { color: colors.ink }]}>Delivery Speed</Text>
              </View>
              {(methods.length > 0 ? methods : [
                { code: "standard" as const, label: "Standard Ground", detail: "3–5 business days • Eco Packaging", price: shipping, currency: "USD", eta: "3–5 business days" },
                { code: "express" as const, label: "Express Priority", detail: "1–2 business days • Tracking included", price: "4.99", currency: "USD", eta: "1–2 business days" },
              ]).map((method) => (
                <Pressable key={method.code} onPress={() => setSpeed(method.code)} style={[styles.speed, speed === method.code && styles.speedOn]}>
                  <View style={[styles.radio, speed === method.code && styles.radioOn]}>
                    {speed === method.code ? <View style={styles.radioDot} /> : null}
                  </View>
                  <View style={styles.lineCopy}>
                    <Text style={[type.titleMd, { color: colors.ink }]}>{method.label}</Text>
                    <Text style={[type.bodySm, { color: colors.inkMuted }]}>{method.detail}</Text>
                  </View>
                  <Text style={[type.labelMd, { color: colors.forest }]}>{Number(method.price) === 0 ? "FREE" : dollars(method.price)}</Text>
                </Pressable>
              ))}
            </PaperCard>

            {payMethod === "card" ? (
              <PaperCard>
                <Text style={[type.titleMd, { color: colors.ink }]}>Card for the receipt</Text>
                <Text style={[type.bodySm, { color: colors.inkMuted }]}>Only the brand and last four digits are sent. Never a full number.</Text>
                <Field label="Brand" placeholder="visa" autoCapitalize="none" value={brand} onChangeText={setBrand} error={errors.brand} />
                <View style={styles.split}>
                  <View style={styles.splitItem}>
                    <Field label="Last 4" placeholder="4242" keyboardType="number-pad" maxLength={4} value={last4} onChangeText={setLast4} error={errors.last4} />
                  </View>
                  <View style={styles.splitNarrow}>
                    <Field label="Month" placeholder="12" keyboardType="number-pad" maxLength={2} value={expMonth} onChangeText={setExpMonth} error={errors.exp} />
                  </View>
                  <View style={styles.splitNarrow}>
                    <Field label="Year" placeholder="2028" keyboardType="number-pad" maxLength={4} value={expYear} onChangeText={setExpYear} />
                  </View>
                </View>
              </PaperCard>
            ) : (
              <PaperCard>
                <Text style={[type.bodyMd, { color: colors.inkMuted }]}>
                  {payMethod === "google_pay" ? "Google Pay" : "PayPal"} will be recorded on the receipt. No card number is sent.
                </Text>
              </PaperCard>
            )}

            {formError ? <Text style={[type.bodySm, { color: colors.error }]}>{formError}</Text> : null}
            <PillButton label={busy ? "Placing order" : `Place Order  ${dollars(total)}`} icon="shopping_bag" disabled={busy} onPress={submit} />
            <Text style={[type.bodySm, styles.legal]}>By placing your order, you agree to Reader’s Terms and Privacy Policy.</Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function Stepper({ active }: { active: 1 | 3 }) {
  const steps = ["Delivery", "Payment", "Review"];
  return (
    <View style={styles.stepper}>
      <View style={styles.stepTrack} />
      {steps.map((label, index) => {
        const on = index + 1 <= active;
        return (
          <View key={label} style={styles.step}>
            <View style={[styles.stepDot, on && styles.stepDotOn]}>
              <Text style={[type.labelMd, { color: on ? colors.onPrimary : colors.inkMuted }]}>{index + 1}</Text>
            </View>
            <Text style={[type.labelSm, { color: on ? colors.ink : colors.inkMuted }]}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

function SummaryRow({ label, value, hint, strong }: { label: string; value: string; hint?: string; strong?: boolean }) {
  return (
    <View style={styles.rowBetween}>
      <View>
        <Text style={[strong ? type.titleMd : type.bodyMd, { color: strong ? colors.ink : colors.inkMuted }]}>{label}</Text>
        {hint ? <Text style={[type.bodySm, { color: colors.inkMuted }]}>{hint}</Text> : null}
      </View>
      <Text style={[strong ? type.headlineSm : type.titleMd, { color: colors.ink }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paperBase },
  content: { padding: space.margin, paddingBottom: 40, gap: 16 },
  stepper: { flexDirection: "row", justifyContent: "space-between", backgroundColor: colors.paperSurface, borderRadius: radius.lg, paddingVertical: 16, paddingHorizontal: 12 },
  stepTrack: { position: "absolute", left: 48, right: 48, top: 28, height: 2, backgroundColor: colors.linen },
  step: { alignItems: "center", gap: 4, width: 88 },
  stepDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.paperElevated, alignItems: "center", justifyContent: "center" },
  stepDotOn: { backgroundColor: colors.forest },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  inline: { flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 1 },
  kicker: { color: colors.inkMuted, textTransform: "uppercase" },
  payRow: { flexDirection: "row", gap: 8 },
  payFlex: { flex: 1 },
  line: { flexDirection: "row", gap: 12, alignItems: "center" },
  lineCopy: { flex: 1, gap: 2 },
  promoRow: { flexDirection: "row", gap: 8 },
  promoField: { flex: 1, height: 44, borderRadius: radius.md, borderWidth: 1, borderColor: colors.linen, backgroundColor: colors.paperSurface, flexDirection: "row", alignItems: "center", paddingHorizontal: 10, gap: 6 },
  promoInput: { flex: 1, color: colors.ink, padding: 0 },
  apply: { height: 44, paddingHorizontal: 16, borderRadius: radius.md, backgroundColor: colors.forest, alignItems: "center", justifyContent: "center" },
  required: { color: colors.terracotta, backgroundColor: colors.paperSurface, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, overflow: "hidden" },
  split: { flexDirection: "row", gap: 10 },
  splitItem: { flex: 1 },
  splitNarrow: { width: 84 },
  speed: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: radius.md, backgroundColor: colors.paperSurface, borderWidth: 1, borderColor: colors.paperSurface },
  speedOn: { borderColor: colors.forest, backgroundColor: colors.paperElevated },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: colors.forest, alignItems: "center", justifyContent: "center" },
  radioOn: { backgroundColor: colors.forest },
  radioDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.paperBase },
  legal: { color: colors.inkMuted, textAlign: "center" },
});
