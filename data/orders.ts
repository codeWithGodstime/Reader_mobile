import { BOOKS, editionOf } from "@/data/catalog";
import type { Order } from "@/data/types";

export const SEED_ORDERS: Order[] = [
  {
    id: "RD-89410",
    placedLabel: "Oct 24, 2024",
    status: "shipped",
    shippingMethod: "Standard Ground",
    total: 34.98,
    eta: "Thursday, Oct 27",
    trackingNumber: "USPS 9400 1118 9956 2049",
    etaDetail: "Estimated by USPS: Thursday, Oct 27, before 7:00 PM",
    items: [
      {
        bookId: "atomic-habits",
        editionId: "paperback",
        quantity: 1,
        price: 16.99,
        note: "New Release Edition",
      },
      {
        bookId: "klara-and-the-sun",
        editionId: "hardcover",
        quantity: 1,
        price: 17.99,
        note: "Signed Bookplate",
      },
    ],
    events: [
      {
        icon: "local_shipping",
        title: "Departed Regional Facility",
        detail: "Oakland, CA Distribution Hub • Oct 25, 4:18 AM",
      },
      {
        icon: "inventory_2",
        title: "Package Accepted at Origin Hub",
        detail: "San Francisco, CA • Oct 24, 6:45 PM",
      },
      {
        icon: "verified",
        title: "Order Placed & Carefully Packed",
        detail: "Reader Bookshelf Warehouse • Oct 24, 10:14 AM",
      },
    ],
  },
  {
    id: "RD-76201",
    placedLabel: "Sep 14, 2024",
    status: "delivered",
    shippingMethod: "Standard Ground",
    total: 15.99,
    items: [
      {
        bookId: "educated",
        editionId: "paperback",
        quantity: 1,
        price: 15.99,
      },
    ],
  },
  {
    id: "RD-61094",
    placedLabel: "Jul 02, 2024",
    status: "delivered",
    shippingMethod: "Priority Shelf Post",
    total: 19.99,
    items: [
      {
        bookId: "project-hail-mary",
        editionId: "hardcover",
        quantity: 1,
        price: 19.99,
      },
    ],
  },
];

export function orderItemLabel(bookId: string, editionId: string) {
  const book = BOOKS.find((item) => item.id === bookId);
  if (!book) return "Title";
  const edition = editionOf(book, editionId);
  return `${book.author} • ${edition.label}`;
}
