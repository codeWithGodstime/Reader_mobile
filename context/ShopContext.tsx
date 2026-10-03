import { router } from "expo-router";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { useAuth } from "@/context/AuthContext";
import { ApiError, readerApi, type Cart, type FormatCode } from "@/lib/api";

type ShopContextValue = {
  cart: Cart | null;
  itemCount: number;
  toast: string | null;
  showToast: (message: string) => void;
  refreshCart: () => Promise<void>;
  addToCart: (bookId: string, format: FormatCode, quantity?: number) => Promise<void>;
  setLineQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeLine: (itemId: string) => Promise<void>;
  applyVoucher: (code: string) => Promise<void>;
  clearVoucher: () => Promise<void>;
  replaceCart: (cart: Cart) => void;
  toggleSaved: (bookId: string, saved: boolean) => Promise<boolean>;
};

const ShopContext = createContext<ShopContextValue | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    setCart(await readerApi.cart());
  }, [user]);

  useEffect(() => {
    if (!ready) return;
    refreshCart().catch(() => setCart(null));
  }, [ready, refreshCart]);

  const requireUser = useCallback(() => {
    if (user) return true;
    router.push("/sign-in");
    return false;
  }, [user]);

  const addToCart = useCallback(
    async (bookId: string, format: FormatCode, quantity = 1) => {
      if (!requireUser()) return;
      try {
        setCart(await readerApi.addItem({ book_id: bookId, format, quantity }));
        showToast("Added to your bag");
      } catch (error) {
        showToast(error instanceof ApiError ? error.message : "Could not add that title.");
      }
    },
    [requireUser, showToast],
  );

  const setLineQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      try {
        setCart(await readerApi.updateItem(itemId, quantity));
      } catch (error) {
        showToast(error instanceof ApiError ? error.message : "Could not update the bag.");
      }
    },
    [showToast],
  );

  const removeLine = useCallback(
    async (itemId: string) => {
      try {
        setCart(await readerApi.deleteItem(itemId));
      } catch (error) {
        showToast(error instanceof ApiError ? error.message : "Could not remove that title.");
      }
    },
    [showToast],
  );

  const applyVoucher = useCallback(
    async (code: string) => {
      setCart(await readerApi.applyVoucher(code));
      showToast("Code applied successfully");
    },
    [showToast],
  );

  const clearVoucher = useCallback(async () => {
    setCart(await readerApi.removeVoucher());
  }, []);

  const toggleSaved = useCallback(
    async (bookId: string, saved: boolean) => {
      if (!requireUser()) return saved;
      if (saved) await readerApi.unsaveBook(bookId);
      else await readerApi.saveBook(bookId);
      showToast(saved ? "Removed from your shelf" : "Saved to your shelf");
      return !saved;
    },
    [requireUser, showToast],
  );

  const value = useMemo(
    () => ({
      cart,
      itemCount: cart?.item_count ?? 0,
      toast,
      showToast,
      refreshCart,
      addToCart,
      setLineQuantity,
      removeLine,
      applyVoucher,
      clearVoucher,
      replaceCart: setCart,
      toggleSaved,
    }),
    [cart, toast, showToast, refreshCart, addToCart, setLineQuantity, removeLine, applyVoucher, clearVoucher, toggleSaved],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const value = useContext(ShopContext);
  if (!value) throw new Error("useShop must be used within ShopProvider");
  return value;
}
