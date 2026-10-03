import { BOOKS, defaultEdition } from "@/data/catalog";
import type { Book, FormatFilter, PriceFilter, SortKey } from "@/data/types";

export const PAGE_SIZE = 4;

export type CatalogQuery = {
  query: string;
  genre: "All" | Book["genre"];
  price: PriceFilter;
  format: FormatFilter;
  sort: SortKey;
  page: number;
};

function matchesPrice(price: number, filter: PriceFilter) {
  if (filter === "under16") return price < 16;
  if (filter === "mid") return price >= 16 && price <= 18;
  if (filter === "over18") return price > 18;
  return true;
}

export function queryCatalog(input: CatalogQuery) {
  const needle = input.query.trim().toLowerCase();
  let items = BOOKS.filter((book) => {
    if (input.genre !== "All" && book.genre !== input.genre) return false;
    if (input.format !== "all" && !book.editions.some((edition) => edition.id === input.format)) {
      return false;
    }
    const price = defaultEdition(book).price;
    if (!matchesPrice(price, input.price)) return false;
    if (!needle) return true;
    const haystack = `${book.title} ${book.author} ${book.blurb} ${book.genre}`.toLowerCase();
    return haystack.includes(needle);
  });

  items = [...items].sort((a, b) => {
    if (input.sort === "title") return a.title.localeCompare(b.title);
    if (input.sort === "price-asc") return defaultEdition(a).price - defaultEdition(b).price;
    if (input.sort === "price-desc") return defaultEdition(b).price - defaultEdition(a).price;
    return BOOKS.indexOf(a) - BOOKS.indexOf(b);
  });

  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE) || 1);
  const page = Math.min(Math.max(input.page, 1), pageCount);
  const start = (page - 1) * PAGE_SIZE;
  const slice = items.slice(start, start + PAGE_SIZE);

  return {
    items: slice,
    total,
    page,
    pageCount,
    from: total === 0 ? 0 : start + 1,
    to: Math.min(start + PAGE_SIZE, total),
  };
}

export function priceChipLabel(price: PriceFilter) {
  if (price === "under16") return "Price: Under $16";
  if (price === "mid") return "Price: $16 – $18";
  if (price === "over18") return "Price: $18 and up";
  return "";
}
