import { router } from "expo-router";
import { useEffect, useRef } from "react";

import { BrandSplash } from "@/components/BrandSplash";
import { useAuth } from "@/context/AuthContext";

const MIN_SPLASH_MS = 900;

let splashSettled = false;

export default function SplashRoute() {
  const { user, ready } = useAuth();
  const mountedAt = useRef<number | null>(null);

  useEffect(() => {
    mountedAt.current ??= Date.now();
    if (!ready) return;
    let active = true;
    const delay = splashSettled ? 0 : Math.max(0, MIN_SPLASH_MS - (Date.now() - mountedAt.current));
    const timer = setTimeout(() => {
      if (!active) return;
      splashSettled = true;
      router.replace(user ? "/" : "/sign-in");
    }, delay);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [ready, user]);

  return <BrandSplash />;
}
