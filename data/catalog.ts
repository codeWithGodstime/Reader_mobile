import type { Book } from "@/data/types";

const covers = {
  atomic:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCq32kPjKj47qlAG2QKcU6-Jz1WMwofgSh39y6S-z8wHzAnvdfNRNFoxOps00426J-fMclu-ME2wNgCQw01hq1Pi2WpkYek-vjEJBGqtSh_FQAsXpq2Dmn6Kre1KykEPMHFMYBr9zhmZs32DhXReIB2dE7AtdSs_qca53yi7M2KXRZryMMYjvvP_VjgR_JDuhutUDZczLt7OBLggryaZQBg93v0PVFE3c6RkLAHS8WC9GjdPeUVMNqJAw",
  educated:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCc0MGHSatmFRaXdRLc_6QB-vt3ke9lN-w0JkZ5DzjSdHrZaNByR7rsgKbtOAx9lX0AnGVhtb85DwcEBT0T_Prs0J0rpaOEg2ikESgnHRen5sCzDZt9T3bQ6gkVQu_wXeedzsV88vVnad3-ewpv_bM_5XI3AEeglSzo1345X9Jy5yB0CSBsG_YhoXPdec7pJac8KFS0yctJpyG8yZ2cFC7XWZJAT9ZC2pV6rXHK18fsxe0-aZy4rUsRaQ",
  klara:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBMojgdBjIKv4ErfDIkaJuiLyJ7_KXOE01yq9UPhJg1n5wHPBD1QwXMbt57RdRLZP9M1yjHOZnnIz-D_X5BqvGN8FfPZvUQgQJcOlsq17b8JLgB8lzCVHcw20pRSYUnPXbw_mOipKV5muZkm7NSthDJhwsLWPxjPVZL9j8qf5nA3nVyHE8oCsPmQ_fZcfby28OCmkaKVAOnCnsSAj2ArbmxGyf4L5OxbF-Cs-CTWp3AM3SYyaNR5HrtFQ",
  hail:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBqPp2175Rl8_r8MHuYYk1nGn6KfSINoJ5rGTr5Xcy5lf9VeEaw_tCnAYG3Gy1-7fxpBy9jR38wXo1bmHpQ3jVBBP13M9Cvh17pZS_uuFCWfD-n90W1FdXD7-_zZhFhBIo8W7y0WxMPeMiE3qoXJpnu2c9bhOy3_XVLxhmlNSRqiW7M1xg1KVXUvpDf3IzQhJtiQ8FOIF3anNmdWiMUEauMwKEnQIe9jWXYcrLrpMC2DU74do3QjTRCrA",
};

export const BOOKS: Book[] = [
  {
    id: "atomic-habits",
    title: "Atomic Habits",
    author: "James Clear",
    genre: "Nonfiction",
    categoryLine: "Nonfiction / Personal Growth",
    blurb:
      "A practical guide to building better habits and breaking the ones that hold you back.",
    about: [
      "A practical guide to building better habits and breaking the ones that hold you back. An extremely practical book showing tiny changes that lead to remarkable results.",
      "Clear draws on biology, psychology, and neuroscience to create an easy-to-understand framework for making good habits inevitable and bad habits impossible. Whether you want to rethink your career, achieve physical fitness, or find peace of mind, this work provides time-tested insights into human behavior.",
    ],
    rating: 4.9,
    ratingCount: "1.2k",
    verifiedReaders: "2,418 verified readers",
    editions: [
      { id: "hardcover", label: "Hardcover", price: 24 },
      { id: "paperback", label: "Paperback", price: 16.99 },
      { id: "ebook", label: "eBook", price: 11.99 },
    ],
    defaultEdition: "paperback",
    pages: 320,
    publisher: "Penguin",
    language: "English",
    coverUrl: covers.atomic,
    coverTone: "#E7DFD3",
    bestseller: "Bestseller #1",
    note: "New Release Edition",
    review: {
      initials: "MH",
      name: "Marcus Hale",
      source: "Literary Digest • Verified purchase",
      quote:
        "The single most useful companion I've kept on my bedside desk. Clear writes with clarity, empathy, and immense discipline.",
      stars: 5,
    },
  },
  {
    id: "educated",
    title: "Educated",
    author: "Tara Westover",
    genre: "Memoir",
    categoryLine: "Memoir",
    blurb:
      "A memoir of leaving a survivalist family and finding a new life through learning.",
    about: [
      "A memoir of leaving a survivalist family and finding a new life through learning.",
      "Westover traces an education earned outside the classroom first, then inside it — a record of self-invention written with restraint and heat.",
    ],
    rating: 4.8,
    ratingCount: "940",
    verifiedReaders: "940 verified readers",
    editions: [
      { id: "paperback", label: "Paperback", price: 15.99 },
      { id: "hardcover", label: "Hardcover", price: 22 },
      { id: "clothbound", label: "Cloth-bound", price: 28 },
    ],
    defaultEdition: "paperback",
    pages: 334,
    publisher: "Random House",
    language: "English",
    coverUrl: covers.educated,
    coverTone: "#C85A32",
  },
  {
    id: "klara-and-the-sun",
    title: "Klara and the Sun",
    author: "Kazuo Ishiguro",
    genre: "Fiction",
    categoryLine: "Fiction",
    blurb:
      "An Artificial Friend watches the world with wonder — and a quiet devotion to the sun.",
    about: [
      "An Artificial Friend watches the world with wonder — and a quiet devotion to the sun.",
      "Ishiguro writes devotion as a kind of sight: what Klara notices, and what the people around her fail to.",
    ],
    rating: 4.7,
    ratingCount: "810",
    verifiedReaders: "810 verified readers",
    editions: [
      { id: "hardcover", label: "Hardcover", price: 17.99 },
      { id: "paperback", label: "Paperback", price: 14.99 },
      { id: "ebook", label: "eBook", price: 9.99 },
    ],
    defaultEdition: "hardcover",
    pages: 303,
    publisher: "Knopf",
    language: "English",
    coverUrl: covers.klara,
    coverTone: "#D4A373",
    note: "Signed Bookplate",
  },
  {
    id: "project-hail-mary",
    title: "Project Hail Mary",
    author: "Andy Weir",
    genre: "Thriller",
    categoryLine: "Thriller",
    blurb:
      "A lone astronaut wakes on a spaceship with no memory — and a mission to save Earth.",
    about: [
      "A lone astronaut wakes on a spaceship with no memory — and a mission to save Earth.",
      "Weir builds a problem-solving thriller that still leaves room for friendship in the dark.",
    ],
    rating: 4.9,
    ratingCount: "2.4k",
    verifiedReaders: "2,400 verified readers",
    editions: [
      { id: "paperback", label: "Paperback", price: 19.99 },
      { id: "hardcover", label: "Hardcover", price: 19.99 },
      { id: "ebook", label: "eBook", price: 12.99 },
    ],
    defaultEdition: "paperback",
    pages: 496,
    publisher: "Ballantine",
    language: "English",
    coverUrl: covers.hail,
    coverTone: "#1E3A2F",
  },
  {
    id: "the-anthropocene-reviewed",
    title: "The Anthropocene Reviewed",
    author: "John Green",
    genre: "Essays",
    categoryLine: "Essays",
    blurb: "Essays that rate the human world — from Canada geese to the QWERTY keyboard — on a five-star scale.",
    about: [
      "Essays that rate the human world — from Canada geese to the QWERTY keyboard — on a five-star scale.",
      "Green writes as a reader of ordinary wonders, attentive and unhurried.",
    ],
    rating: 4.6,
    ratingCount: "640",
    verifiedReaders: "640 verified readers",
    editions: [{ id: "clothbound", label: "Cloth-bound", price: 17 }],
    defaultEdition: "clothbound",
    pages: 304,
    publisher: "Dutton",
    language: "English",
    coverTone: "#4D2D07",
  },
  {
    id: "circe",
    title: "Circe",
    author: "Madeline Miller",
    genre: "Fiction",
    categoryLine: "Fiction",
    blurb: "The witch of Aiaia tells her own story, from exile to the making of a life.",
    about: [
      "The witch of Aiaia tells her own story, from exile to the making of a life.",
      "Miller retells myth as a study of power, tenderness, and the work of staying.",
    ],
    rating: 4.8,
    ratingCount: "3.1k",
    verifiedReaders: "3,100 verified readers",
    editions: [
      { id: "hardcover", label: "Hardcover", price: 18 },
      { id: "paperback", label: "Paperback", price: 16.5 },
    ],
    defaultEdition: "hardcover",
    pages: 393,
    publisher: "Little, Brown",
    language: "English",
    coverTone: "#1E3A2F",
  },
  {
    id: "born-a-crime",
    title: "Born a Crime",
    author: "Trevor Noah",
    genre: "Memoir",
    categoryLine: "Memoir",
    blurb: "Stories from a childhood lived in the cracks of apartheid South Africa.",
    about: [
      "Stories from a childhood lived in the cracks of apartheid South Africa.",
      "Noah writes humor as a way through, never as a way around.",
    ],
    rating: 4.8,
    ratingCount: "2.1k",
    verifiedReaders: "2,100 verified readers",
    editions: [
      { id: "paperback", label: "Paperback", price: 14.99 },
      { id: "ebook", label: "eBook", price: 9.99 },
    ],
    defaultEdition: "paperback",
    pages: 304,
    publisher: "Spiegel & Grau",
    language: "English",
    coverTone: "#C85A32",
  },
  {
    id: "the-silent-patient",
    title: "The Silent Patient",
    author: "Alex Michaelides",
    genre: "Thriller",
    categoryLine: "Thriller",
    blurb: "A woman stops speaking after a violent night. A therapist is determined to hear her.",
    about: [
      "A woman stops speaking after a violent night. A therapist is determined to hear her.",
      "A locked-room mystery told in the cadence of a confession.",
    ],
    rating: 4.5,
    ratingCount: "5.4k",
    verifiedReaders: "5,400 verified readers",
    editions: [
      { id: "paperback", label: "Paperback", price: 18.99 },
      { id: "hardcover", label: "Hardcover", price: 24 },
    ],
    defaultEdition: "paperback",
    pages: 336,
    publisher: "Celadon",
    language: "English",
    coverTone: "#07241A",
  },
];

export function getBook(id: string) {
  return BOOKS.find((book) => book.id === id);
}

export function editionOf(book: Book, editionId: string) {
  return book.editions.find((edition) => edition.id === editionId) ?? book.editions[0];
}

export function defaultEdition(book: Book) {
  return editionOf(book, book.defaultEdition);
}

export function displayPrice(book: Book) {
  return defaultEdition(book).price;
}
