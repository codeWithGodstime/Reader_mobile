import { API_BASE_URL, ngrokHeaders } from "@/lib/config";
import { deleteProfileJson, deleteTokens, readProfileJson, readTokens, writeProfileJson, writeTokens, type Tokens } from "@/lib/session";

export type FormatCode = "paperback" | "hardcover" | "ebook" | "signed";
export type PriceFilter = "any" | "under_16" | "from_16_to_18" | "over_18";
export type SortKey = "featured" | "title" | "price_asc" | "price_desc" | "newest" | "rating";
export type OrderStatus =
  | "confirmed"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type FieldError = { field: string; message: string };

export type Profile = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  member_since: string;
  patron_number: string;
  loyalty_points: number;
  voucher: { code: string; amount: string; currency: string } | null;
  marketing_opt_in: boolean;
  active_order_count: number;
  shelf_count: number;
  saved_book_count: number;
};

export type AuthResponse = Tokens & { user: Profile };

export type Genre = { slug: string; name: string; book_count: number };

export type BookSummary = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  author_name: string;
  genre: Genre;
  rating: number;
  review_count: number;
  price: string;
  compare_at_price: string | null;
  currency: string;
  format: FormatCode;
  format_label: string;
  cover_url: string;
  badges: string[];
  in_stock: boolean;
  saved: boolean;
};

export type BookFormat = {
  code: FormatCode;
  label: string;
  detail: string;
  price: string;
  compare_at_price: string | null;
  currency: string;
  in_stock: boolean;
  rare: boolean;
};

export type BookDetail = BookSummary & {
  about: string;
  author: { id: string; name: string; bio: string; title_count: number };
  sku: string;
  pages: number;
  publisher: string;
  language: string;
  isbn13: string;
  dimensions: string;
  published_on: string;
  formats: BookFormat[];
  gallery: { label: string; url: string }[];
  table_of_contents: { title: string; page: number }[];
  curator_note: { quote: string; name: string; role: string } | null;
};

export type Page<T> = {
  count: number;
  page: number;
  page_size: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type Review = {
  id: string;
  reviewer_name: string;
  reviewer_title: string | null;
  rating: number;
  body: string;
  edition: string | null;
  verified_purchase: boolean;
  created_at: string;
};

export type CartItem = {
  id: string;
  book_id: string;
  title: string;
  author_name: string;
  cover_url: string;
  format: FormatCode;
  format_label: string;
  quantity: number;
  unit_price: string;
  line_total: string;
  currency: string;
};

export type Cart = {
  id: string;
  items: CartItem[];
  item_count: number;
  currency: string;
  subtotal: string;
  discount: string;
  shipping: string;
  tax: string;
  total: string;
  voucher: { code: string; amount: string; currency: string } | null;
  free_shipping_threshold: string;
  amount_until_free_shipping: string;
};

export type ShippingMethod = {
  code: "standard" | "express";
  label: string;
  detail: string;
  price: string;
  currency: string;
  eta: string;
};

export type Address = {
  id: string;
  full_name: string;
  street: string;
  line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  phone: string;
  is_default: boolean;
};

export type OrderItem = {
  book_id: string | null;
  title: string;
  author_name: string;
  cover_url: string;
  format: FormatCode;
  format_label: string;
  quantity: number;
  unit_price: string;
  line_total: string;
  currency: string;
};

export type Order = {
  id: string;
  number: string;
  status: OrderStatus;
  email: string;
  placed_at: string;
  estimated_delivery: string | null;
  currency: string;
  subtotal: string;
  discount: string;
  shipping: string;
  tax: string;
  total: string;
  shipping_method: "standard" | "express";
  item_count: number;
  items: OrderItem[];
  address: {
    full_name: string;
    street: string;
    line2: string | null;
    city: string;
    state: string;
    postal_code: string;
    phone: string;
  };
  payment: {
    method: "card" | "paypal" | "google_pay";
    brand: string | null;
    last4: string | null;
    exp_month: number | null;
    exp_year: number | null;
  };
  tracking_number: string | null;
  carrier: string | null;
  delivery_instructions: string;
};

export type Tracking = {
  order_id: string;
  number: string;
  status: OrderStatus;
  carrier: string | null;
  tracking_number: string | null;
  estimated_delivery: string | null;
  events: {
    code: OrderStatus;
    label: string;
    location: string | null;
    occurred_at: string | null;
    state: "completed" | "current" | "upcoming";
  }[];
};

export type Invoice = {
  order_id: string;
  number: string;
  placed_at: string;
  email: string;
  ship_to: Order["address"];
  items: OrderItem[];
  subtotal: string;
  discount: string;
  shipping: string;
  tax: string;
  total: string;
  currency: string;
  payment: Order["payment"];
};

export type Shelf = {
  id: string;
  name: string;
  is_default: boolean;
  book_count: number;
  books?: BookSummary[];
};

export class ApiError extends Error {
  status: number;
  code: string;
  details: FieldError[];

  constructor(status: number, code: string, message: string, details: FieldError[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

let tokens: Tokens | null = null;
let refreshInFlight: Promise<boolean> | null = null;
let sessionGeneration = 0;

export function currentSessionGeneration() {
  return sessionGeneration;
}

export function currentAccessToken() {
  return tokens?.access ?? null;
}

export async function hydrateSession() {
  const started = sessionGeneration;
  const stored = await readTokens();
  if (started !== sessionGeneration) return tokens;
  tokens = stored;
  return tokens;
}

export async function persistSession(next: Tokens) {
  sessionGeneration += 1;
  tokens = next;
  await writeTokens(next);
}

export async function clearSession() {
  sessionGeneration += 1;
  tokens = null;
  await deleteTokens();
  await deleteProfileJson();
}

export async function readStoredProfile(): Promise<Profile | null> {
  const raw = await readProfileJson();
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Profile;
    if (!parsed || typeof parsed.id !== "string" || typeof parsed.name !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function persistProfile(profile: Profile) {
  await writeProfileJson(JSON.stringify(profile));
}

function query(params: Record<string, string | number | boolean | undefined | null>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}

async function parseError(response: Response) {
  let body: { error?: { code?: string; message?: string; details?: FieldError[] } } | null = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  const error = body?.error;
  throw new ApiError(
    response.status,
    error?.code ?? "error",
    error?.message ?? "The shop could not complete that request.",
    error?.details ?? [],
  );
}

async function refreshSession() {
  if (!tokens?.refresh) return false;
  if (!refreshInFlight) {
    const refresh = tokens.refresh;
    const started = sessionGeneration;
    refreshInFlight = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...ngrokHeaders(),
          },
          body: JSON.stringify({ refresh }),
        });
        if (started !== sessionGeneration) return true;
        if (!response.ok) {
          await clearSession();
          return false;
        }
        const pair = (await response.json()) as Tokens;
        if (started !== sessionGeneration) return true;
        await persistSession(pair);
        return true;
      } catch {
        if (started !== sessionGeneration) return true;
        await clearSession();
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

export async function api<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean; retry?: boolean } = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json", ...ngrokHeaders() };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.auth !== false && tokens?.access) headers.Authorization = `Bearer ${tokens.access}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? (options.body !== undefined ? "POST" : "GET"),
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 401 && options.auth !== false && options.retry !== false && tokens?.refresh) {
    const refreshed = await refreshSession();
    if (refreshed) return api<T>(path, { ...options, retry: false });
  }

  if (response.status === 204) return undefined as T;
  if (!response.ok) await parseError(response);
  return (await response.json()) as T;
}

export const readerApi = {
  register: (body: { name: string; email: string; password: string }) =>
    api<AuthResponse>("/api/v1/auth/register", { method: "POST", body, auth: false }),
  login: (body: { email: string; password: string }) =>
    api<AuthResponse>("/api/v1/auth/login", { method: "POST", body, auth: false }),
  google: (idToken: string) =>
    api<AuthResponse>("/api/v1/auth/google", { method: "POST", body: { id_token: idToken }, auth: false }),
  logout: () => api<void>("/api/v1/auth/logout", { method: "POST", body: { refresh: tokens?.refresh } }),
  me: () => api<Profile>("/api/v1/me"),
  genres: () => api<Genre[]>("/api/v1/genres", { auth: false }),
  books: (params: {
    q?: string;
    genre?: string;
    price?: PriceFilter;
    format?: FormatCode;
    sort?: SortKey;
    page?: number;
    page_size?: number;
  }) => api<Page<BookSummary>>(`/api/v1/books${query(params)}`),
  book: (id: string) => api<BookDetail>(`/api/v1/books/${id}`),
  related: (id: string) => api<BookSummary[]>(`/api/v1/books/${id}/related`),
  reviews: (id: string) => api<Page<Review>>(`/api/v1/books/${id}/reviews${query({ page_size: 5 })}`),
  createReview: (id: string, body: { rating: number; body: string; edition?: string }) =>
    api<Review>(`/api/v1/books/${id}/reviews`, { method: "POST", body }),
  saveBook: (id: string) => api<{ book_id: string; saved: boolean }>(`/api/v1/books/${id}/save`, { method: "POST" }),
  unsaveBook: (id: string) => api<{ book_id: string; saved: boolean }>(`/api/v1/books/${id}/save`, { method: "DELETE" }),
  shelves: () => api<Shelf[]>("/api/v1/shelves"),
  shelf: (id: string) => api<Shelf & { books: BookSummary[] }>(`/api/v1/shelves/${id}`),
  cart: () => api<Cart>("/api/v1/cart"),
  addItem: (body: { book_id: string; format: FormatCode; quantity?: number }) =>
    api<Cart>("/api/v1/cart/items", { method: "POST", body }),
  updateItem: (id: string, quantity: number) =>
    api<Cart>(`/api/v1/cart/items/${id}`, { method: "PATCH", body: { quantity } }),
  deleteItem: (id: string) => api<Cart>(`/api/v1/cart/items/${id}`, { method: "DELETE" }),
  applyVoucher: (code: string) => api<Cart>("/api/v1/cart/voucher", { method: "POST", body: { code } }),
  removeVoucher: () => api<Cart>("/api/v1/cart/voucher", { method: "DELETE" }),
  shippingMethods: (subtotal: string) =>
    api<ShippingMethod[]>(`/api/v1/shipping-methods${query({ subtotal })}`, { auth: false }),
  addresses: () => api<Address[]>("/api/v1/addresses"),
  checkout: (body: {
    email: string;
    marketing_opt_in?: boolean;
    shipping_method: "standard" | "express";
    address: {
      full_name: string;
      street: string;
      line2?: string | null;
      city: string;
      state: string;
      postal_code: string;
      phone: string;
      save?: boolean;
    };
    payment: {
      method: "card" | "paypal" | "google_pay";
      brand?: string | null;
      last4?: string | null;
      exp_month?: number | null;
      exp_year?: number | null;
      save?: boolean;
    };
  }) => api<Order>("/api/v1/checkout", { method: "POST", body }),
  orders: (status: "active" | "past", q?: string) =>
    api<Page<Order>>(`/api/v1/orders${query({ status, q, page_size: 20 })}`),
  tracking: (id: string) => api<Tracking>(`/api/v1/orders/${id}/tracking`),
  invoice: (id: string) => api<Invoice>(`/api/v1/orders/${id}/invoice`),
  buyAgain: (id: string) => api<Cart>(`/api/v1/orders/${id}/buy-again`, { method: "POST" }),
  support: (body: { email: string; subject: string; message: string; order_number?: string }) =>
    api<{ id: string }>("/api/v1/support/messages", { method: "POST", body, auth: false }),
};

export function dollars(value: string) {
  return value.startsWith("$") ? value : `$${value}`;
}

export function compactCount(count: number) {
  if (count >= 1000) {
    const scaled = count / 1000;
    const text = scaled >= 10 ? scaled.toFixed(0) : scaled.toFixed(1).replace(/\.0$/, "");
    return `${text}k`;
  }
  return String(count);
}

export function shelfDate(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
