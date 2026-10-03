import * as Google from "expo-auth-session/providers/google";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "@/components/Icon";
import { Field, PillButton } from "@/components/ui";
import { colors, radius, type } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import { googleConfig, googleSignInConfigured } from "@/lib/config";

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const { signIn, register, signInWithGoogleIdToken } = useAuth();
  const [mode, setMode] = useState<"sign-in" | "register">("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError("");
    setFieldErrors({});
    setBusy(true);
    try {
      if (mode === "register") await register(name.trim(), email.trim(), password);
      else await signIn(email.trim(), password);
      if (router.canGoBack()) router.back();
      else router.replace("/");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(Object.fromEntries(err.details.map((detail) => [detail.field, detail.message])));
      } else {
        setError("The shop could not sign you in.");
      }
    } finally {
      setBusy(false);
    }
  };

  const continueWithGoogle = async (idToken: string) => {
    setError("");
    setBusy(true);
    try {
      await signInWithGoogleIdToken(idToken);
      if (router.canGoBack()) router.back();
      else router.replace("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Google sign-in could not be completed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}
      keyboardShouldPersistTaps="handled">
      <Pressable accessibilityLabel="Close" onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))} style={styles.close}>
        <Icon name="close" size={18} color={colors.ink} />
      </Pressable>
      <Text style={[type.labelSm, styles.kicker]}>Reader</Text>
      <Text style={[type.headlineXl, { color: colors.ink }]}>{mode === "register" ? "Open a shelf" : "Welcome back"}</Text>
      <Text style={[type.bodyLg, styles.lede]}>
        Fiction, memoir, and ideas worth keeping. Sign in to carry a bag and follow your parcels.
      </Text>

      {mode === "register" ? (
        <Field label="Name" placeholder="First and last name" value={name} onChangeText={setName} error={fieldErrors.name} />
      ) : null}
      <Field
        label="Email"
        placeholder="you@example.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        error={fieldErrors.email}
      />
      <Field
        label="Password"
        placeholder="At least 8 characters"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        error={fieldErrors.password}
      />

      {error ? <Text style={[type.bodySm, { color: colors.error }]}>{error}</Text> : null}

      <View style={styles.actions}>
        <View style={styles.action}>
          <PillButton label={mode === "register" ? "Create account" : "Sign in"} disabled={busy} onPress={submit} />
        </View>
        <View style={styles.action}>
          <GoogleContinue disabled={busy} onToken={continueWithGoogle} onError={setError} />
        </View>
      </View>

      <Pressable onPress={() => setMode(mode === "register" ? "sign-in" : "register")}>
        <Text style={[type.labelMd, { color: colors.forest, textAlign: "center" }]}>
          {mode === "register" ? "Already have a shelf? Sign in" : "New here? Create an account"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function GoogleContinue({
  disabled,
  onToken,
  onError,
}: {
  disabled: boolean;
  onToken: (idToken: string) => void;
  onError: (message: string) => void;
}) {
  if (!googleSignInConfigured) {
    return (
      <View style={styles.googleBlock}>
        <PillButton label="Continue with Google" tone="paper" disabled onPress={() => undefined} />
        <Text style={[type.bodySm, styles.note]}>Set EXPO_PUBLIC_GOOGLE_CLIENT_ID to enable Google sign-in.</Text>
      </View>
    );
  }
  return <GooglePrompt disabled={disabled} onToken={onToken} onError={onError} />;
}

function GooglePrompt({
  disabled,
  onToken,
  onError,
}: {
  disabled: boolean;
  onToken: (idToken: string) => void;
  onError: (message: string) => void;
}) {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: googleConfig.clientId,
    webClientId: googleConfig.webClientId || googleConfig.clientId,
    iosClientId: googleConfig.iosClientId || googleConfig.clientId,
    androidClientId: googleConfig.androidClientId || googleConfig.clientId,
  });

  useEffect(() => {
    if (!response || response.type === "dismiss" || response.type === "cancel") return;
    if (response.type === "error") {
      onError("Google sign-in could not be completed.");
      return;
    }
    if (response.type !== "success") return;
    const idToken = response.params.id_token || response.authentication?.idToken;
    if (!idToken) {
      onError("Google did not return an ID token.");
      return;
    }
    onToken(idToken);
  }, [response, onToken, onError]);

  return (
    <PillButton
      label="Continue with Google"
      tone="paper"
      disabled={disabled || !request}
      onPress={() => promptAsync()}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paperBase },
  content: { paddingHorizontal: 20, gap: 14 },
  close: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.paperSurface,
    alignItems: "center",
    justifyContent: "center",
  },
  kicker: { color: colors.inkMuted, textTransform: "uppercase" },
  lede: { color: colors.inkMuted },
  actions: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  action: { flex: 1 },
  googleBlock: { gap: 6 },
  note: { color: colors.inkMuted },
});
