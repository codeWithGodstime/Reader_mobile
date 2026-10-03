import type { IconName } from "@/components/Icon";

export type Genre = "Fiction" | "Memoir" | "Nonfiction" | "Thriller" | "Essays";

export type FormatId = "paperback" | "hardcover" | "ebook" | "clothbound";

export type Edition = {
  id: FormatId;
  label: string;
  price: number;
};

export type Review = {
  initials: string;
  name: string;
  source: string;
  quote: string;
  stars: number;
};

export type Book = {
  id: string;
  title: string;
  author: string;
  genre: Genre;
  categoryLine: string;
  blurb: string;
  about: string[];
  rating: number;
  ratingCount: string;
  verifiedReaders: string;
  editions: Edition[];
  defaultEdition: FormatId;
  pages: number;
  publisher: string;
  language: string;
  coverUrl?: string;
  coverTone: string;
  bestseller?: string;
  note?: string;
  review?: Review;
};

export type CartLine = {
  bookId: string;
  editionId: FormatId;
  quantity: number;
};

export type OrderStatus = "confirmed" | "shipped" | "delivered";

export type OrderItem = {
  bookId: string;
  editionId: FormatId;
  quantity: number;
  price: number;
  note?: string;
};

export type TrackingEvent = {
  icon: IconName;
  title: string;
  detail: string;
};

export type Order = {
  id: string;
  placedLabel: string;
  status: OrderStatus;
  shippingMethod: string;
  total: number;
  items: OrderItem[];
  eta?: string;
  trackingNumber?: string;
  etaDetail?: string;
  events?: TrackingEvent[];
};

export type PriceFilter = "any" | "under16" | "mid" | "over18";
export type FormatFilter = "all" | FormatId;
export type SortKey = "featured" | "title" | "price-asc" | "price-desc";

export const GENRES: Array<Genre | "All"> = [
  "All",
  "Fiction",
  "Memoir",
  "Nonfiction",
  "Thriller",
  "Essays",
];

export const PRICE_OPTIONS: { id: PriceFilter; label: string }[] = [
  { id: "any", label: "Any price" },
  { id: "under16", label: "Under $16" },
  { id: "mid", label: "$16 – $18" },
  { id: "over18", label: "$18 and up" },
];

export const FORMAT_OPTIONS: { id: FormatFilter; label: string }[] = [
  { id: "paperback", label: "Paperback" },
  { id: "hardcover", label: "Hardcover" },
  { id: "clothbound", label: "Cloth-bound" },
];

export const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "title", label: "Title (A–Z)" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
];
