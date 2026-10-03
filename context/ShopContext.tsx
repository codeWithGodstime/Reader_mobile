import { router } from "expo-router";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AppState } from "react-native";

import { useAuth } from "@/context/AuthContext";
import { ApiError, currentAccessToken, readerApi, type BookSummary, type Cart, type FormatCode } from "@/lib/api";
import { cartSocketUrl, savedSocketUrl } from "@/lib/config";

type ShopContextValue = {
  cart: Cart | null;
  cartLoaded: boolean;
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
  savedBooks: BookSummary[];
  savedStatus: "loading" | "ready" | "error";
  savedError: string;
  refreshSaved: () => Promise<void>;
  isSaved: (bookId: string, fallback?: boolean) => boolean;
  toggleSaved: (book: BookSummary) => Promise<boolean>;
};

const ShopContext = createContext<ShopContextValue | null>(null);

function isSavedUpdate(value: unknown): value is { type: "saved.updated"; saved: { books: BookSummary[]; name?: string } } {
  if (!value || typeof value !== "object") return false;
  const message = value as { type?: unknown; saved?: { books?: unknown } };
  return message.type === "saved.updated" && !!message.saved && Array.isArray(message.saved.books);
}

function isCartUpdate(value: unknown): value is { type: "cart.updated"; cart: Cart } {
  if (!value || typeof value !== "object") return false;
  const message = value as { type?: unknown; cart?: { items?: unknown; item_count?: unknown } };
  return (
    message.type === "cart.updated" &&
    !!message.cart &&
    Array.isArray(message.cart.items) &&
    typeof message.cart.item_count === "number"
  );
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [settledUserId, setSettledUserId] = useState<string | null | undefined>(undefined);
  const cartLoaded = ready && settledUserId === (user?.id ?? null);
  const [toast, setToast] = useState<string | null>(null);
  const [savedBooks, setSavedBooks] = useState<BookSummary[]>([]);
  const [savedKnown, setSavedKnown] = useState<Record<string, boolean>>({});
  const [shelfLoaded, setShelfLoaded] = useState(false);
  const [savedStatus, setSavedStatus] = useState<"loading" | "ready" | "error">("loading");
  const [savedError, setSavedError] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedBooksRef = useRef<BookSummary[]>([]);
  const savedKnownRef = useRef<Record<string, boolean>>({});
  const shelfLoadedRef = useRef(false);
  const pendingSavedRef = useRef(new Map<string, boolean>());
  const toggleTokenRef = useRef(new Map<string, number>());
  const savedRequestRef = useRef(0);
  const shelfOwnerRef = useRef<string | null | undefined>(undefined);

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
    let active = true;
    const ownerId = user?.id ?? null;
    const request = user ? readerApi.cart() : Promise.resolve(null);
    request
      .then((next) => {
        if (active) setCart(next);
      })
      .catch(() => {
        if (active) setCart(null);
      })
      .finally(() => {
        if (active) setSettledUserId(ownerId);
      });
    return () => {
      active = false;
    };
  }, [ready, user]);

  useEffect(() => {
    if (!ready || !user) return;
    let stopped = false;
    let socket: WebSocket | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let attempt = 0;

    const clearRetry = () => {
      if (!retryTimer) return;
      clearTimeout(retryTimer);
      retryTimer = null;
    };

    const schedule = () => {
      if (stopped || attempt >= 8) return;
      clearRetry();
      const delay = Math.min(1000 * 2 ** attempt, 15000);
      attempt += 1;
      retryTimer = setTimeout(connect, delay);
    };

    const connect = () => {
      if (stopped) return;
      const token = currentAccessToken();
      if (!token) {
        schedule();
        return;
      }
      if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) return;
      const next = new WebSocket(cartSocketUrl(token));
      socket = next;
      next.onopen = () => {
        attempt = 0;
      };
      next.onmessage = (event) => {
        if (typeof event.data !== "string") return;
        try {
          const parsed: unknown = JSON.parse(event.data);
          if (isCartUpdate(parsed)) setCart(parsed.cart);
        } catch {
          // Ignore frames that are not a cart snapshot.
        }
      };
      next.onclose = (event) => {
        if (socket === next) socket = null;
        if (stopped) return;
        if (event.code === 4401) {
          void readerApi
            .cart()
            .then((cart) => {
              if (!stopped) setCart(cart);
            })
            .catch(() => undefined)
            .finally(schedule);
          return;
        }
        schedule();
      };
    };

    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active" || stopped) return;
      attempt = 0;
      clearRetry();
      if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) return;
      connect();
    });
    connect();

    return () => {
      stopped = true;
      clearRetry();
      subscription.remove();
      if (!socket) return;
      socket.onclose = null;
      socket.close();
      socket = null;
    };
  }, [ready, user]);

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

  const writeSaved = useCallback((books: BookSummary[], known: Record<string, boolean>, loaded = shelfLoadedRef.current) => {
    savedBooksRef.current = books;
    savedKnownRef.current = known;
    shelfLoadedRef.current = loaded;
    setSavedBooks(books);
    setSavedKnown(known);
    setShelfLoaded(loaded);
  }, []);

  const readSaved = useCallback((bookId: string, fallback = false) => {
    const known = savedKnownRef.current[bookId];
    if (known !== undefined) return known;
    if (shelfLoadedRef.current) return false;
    return fallback;
  }, []);

  const applyServerShelf = useCallback(
    (serverBooks: BookSummary[]) => {
      const known = { ...savedKnownRef.current };
      for (const item of serverBooks) {
        if (known[item.id] === undefined && !pendingSavedRef.current.has(item.id)) known[item.id] = true;
      }
      for (const [id, saved] of pendingSavedRef.current) known[id] = saved;

      const serverIds = new Set(serverBooks.map((item) => item.id));
      const extras = savedBooksRef.current.filter((item) => known[item.id] === true && !serverIds.has(item.id));
      const ordered = serverBooks.filter((item) => known[item.id] !== false).map((item) => ({ ...item, saved: true }));
      writeSaved([...extras, ...ordered], known, true);
      setSavedError("");
      setSavedStatus("ready");
    },
    [writeSaved],
  );

  const applyRemoteSaved = useCallback(
    (serverBooks: BookSummary[]) => {
      const books = serverBooks.map((item) => ({ ...item, saved: true as const }));
      const pending = pendingSavedRef.current;
      const known: Record<string, boolean> = {};
      for (const item of books) known[item.id] = true;
      for (const [id, saved] of pending) known[id] = saved;
      const extras = savedBooksRef.current.filter(
        (item) => pending.get(item.id) === true && !books.some((book) => book.id === item.id),
      );
      const ordered = books.filter((item) => known[item.id] !== false);
      writeSaved([...extras.map((item) => ({ ...item, saved: true })), ...ordered], known, true);
      setSavedError("");
      setSavedStatus("ready");
    },
    [writeSaved],
  );

  const loadShelfBooks = useCallback(async () => {
    const shelves = await readerApi.shelves();
    const shelf = shelves.find((item) => item.is_default) ?? shelves[0];
    if (!shelf) return [];
    const detail = await readerApi.shelf(shelf.id);
    return detail.books.map((item) => ({ ...item, saved: true }));
  }, []);

  const refreshSaved = useCallback(async () => {
    if (!user) {
      pendingSavedRef.current.clear();
      toggleTokenRef.current.clear();
      writeSaved([], {}, false);
      setSavedError("");
      setSavedStatus("ready");
      return;
    }

    const request = ++savedRequestRef.current;
    if (!shelfLoadedRef.current && savedBooksRef.current.length === 0) setSavedStatus("loading");

    try {
      const serverBooks = await loadShelfBooks();
      if (request !== savedRequestRef.current) return;
      applyServerShelf(serverBooks);
    } catch (error) {
      if (request !== savedRequestRef.current) return;
      if (savedBooksRef.current.length > 0) {
        setSavedStatus("ready");
        return;
      }
      setSavedError(error instanceof ApiError ? error.message : "Saved titles could not be loaded.");
      setSavedStatus("error");
    }
  }, [user, writeSaved, loadShelfBooks, applyServerShelf]);

  useEffect(() => {
    if (!ready) return;
    let active = true;
    const request = ++savedRequestRef.current;
    const ownerId = user?.id ?? null;
    const job = Promise.resolve().then(() => {
      if (!active) return [] as BookSummary[];
      if (shelfOwnerRef.current !== ownerId) {
        shelfOwnerRef.current = ownerId;
        pendingSavedRef.current.clear();
        toggleTokenRef.current.clear();
        writeSaved([], {}, false);
        setSavedError("");
        setSavedStatus(ownerId ? "loading" : "ready");
      }
      if (!ownerId) return [] as BookSummary[];
      return loadShelfBooks();
    });
    job
      .then((serverBooks) => {
        if (!active || request !== savedRequestRef.current || !ownerId) return;
        applyServerShelf(serverBooks);
      })
      .catch((error: unknown) => {
        if (!active || request !== savedRequestRef.current) return;
        if (savedBooksRef.current.length > 0) {
          setSavedStatus("ready");
          return;
        }
        setSavedError(error instanceof ApiError ? error.message : "Saved titles could not be loaded.");
        setSavedStatus("error");
      });
    return () => {
      active = false;
    };
  }, [ready, user, loadShelfBooks, applyServerShelf, writeSaved]);

  useEffect(() => {
    if (!ready || !user) return;
    let stopped = false;
    let socket: WebSocket | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let attempt = 0;

    const clearRetry = () => {
      if (!retryTimer) return;
      clearTimeout(retryTimer);
      retryTimer = null;
    };

    const schedule = () => {
      if (stopped || attempt >= 8) return;
      clearRetry();
      const delay = Math.min(1000 * 2 ** attempt, 15000);
      attempt += 1;
      retryTimer = setTimeout(connect, delay);
    };

    const connect = () => {
      if (stopped) return;
      const token = currentAccessToken();
      if (!token) {
        schedule();
        return;
      }
      if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) return;
      const next = new WebSocket(savedSocketUrl(token));
      socket = next;
      next.onopen = () => {
        attempt = 0;
      };
      next.onmessage = (event) => {
        if (typeof event.data !== "string") return;
        try {
          const parsed: unknown = JSON.parse(event.data);
          if (isSavedUpdate(parsed)) applyRemoteSaved(parsed.saved.books);
        } catch {
          // Ignore frames that are not a saved-items snapshot.
        }
      };
      next.onclose = (event) => {
        if (socket === next) socket = null;
        if (stopped) return;
        if (event.code === 4401) {
          void loadShelfBooks()
            .then((books) => {
              if (!stopped) applyServerShelf(books);
            })
            .catch(() => undefined)
            .finally(schedule);
          return;
        }
        schedule();
      };
    };

    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active" || stopped) return;
      attempt = 0;
      clearRetry();
      if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) return;
      connect();
    });
    connect();

    return () => {
      stopped = true;
      clearRetry();
      subscription.remove();
      if (!socket) return;
      socket.onclose = null;
      socket.close();
      socket = null;
    };
  }, [ready, user, applyRemoteSaved, loadShelfBooks]);

  const isSaved = useCallback(
    (bookId: string, fallback = false) => {
      const known = savedKnown[bookId];
      if (known !== undefined) return known;
      if (shelfLoaded) return false;
      return fallback;
    },
    [savedKnown, shelfLoaded],
  );

  const toggleSaved = useCallback(
    async (book: BookSummary) => {
      if (!requireUser()) return readSaved(book.id, book.saved);
      const currently = readSaved(book.id, book.saved);
      const next = !currently;
      const token = (toggleTokenRef.current.get(book.id) ?? 0) + 1;
      toggleTokenRef.current.set(book.id, token);
      pendingSavedRef.current.set(book.id, next);

      const nextKnown = { ...savedKnownRef.current, [book.id]: next };
      const nextBooks = next
        ? [{ ...book, saved: true }, ...savedBooksRef.current.filter((item) => item.id !== book.id)]
        : savedBooksRef.current.filter((item) => item.id !== book.id);
      writeSaved(nextBooks, nextKnown);

      try {
        if (currently) await readerApi.unsaveBook(book.id);
        else await readerApi.saveBook(book.id);
        if (toggleTokenRef.current.get(book.id) !== token) return readSaved(book.id, next);
        pendingSavedRef.current.delete(book.id);
        showToast(currently ? "Removed from your shelf" : "Saved to your shelf");
        return next;
      } catch (error) {
        if (toggleTokenRef.current.get(book.id) !== token) return readSaved(book.id, currently);
        pendingSavedRef.current.delete(book.id);
        const revertedKnown = { ...savedKnownRef.current, [book.id]: currently };
        const revertedBooks = currently
          ? [{ ...book, saved: true }, ...savedBooksRef.current.filter((item) => item.id !== book.id)]
          : savedBooksRef.current.filter((item) => item.id !== book.id);
        writeSaved(revertedBooks, revertedKnown);
        showToast(error instanceof ApiError ? error.message : "Could not update your shelf.");
        return currently;
      }
    },
    [readSaved, requireUser, showToast, writeSaved],
  );

  const value = useMemo(
    () => ({
      cart,
      cartLoaded,
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
      savedBooks,
      savedStatus,
      savedError,
      refreshSaved,
      isSaved,
      toggleSaved,
    }),
    [cart, cartLoaded, toast, showToast, refreshCart, addToCart, setLineQuantity, removeLine, applyVoucher, clearVoucher, savedBooks, savedStatus, savedError, refreshSaved, isSaved, toggleSaved],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const value = useContext(ShopContext);
  if (!value) throw new Error("useShop must be used within ShopProvider");
  return value;
}
