import type { CategorySlug } from "@/lib/types";

export interface MegaColumn {
  heading: string;
  links: { label: string; href: string }[];
}

export interface NavItem {
  label: string;
  href: string;
  /** Optional mega-menu panel shown on hover (desktop). */
  columns?: MegaColumn[];
  /** Optional featured promo shown alongside the columns. */
  featured?: { label: string; caption: string; href: string; image: string };
  /** Highlight the link (e.g. Sale). */
  accent?: boolean;
}

const shopColumns: MegaColumn[] = [
  {
    heading: "Clothing",
    links: [
      { label: "Shirts", href: "/shop/shirts" },
      { label: "T-Shirts", href: "/shop/tees" },
      { label: "Knitwear", href: "/shop/knitwear" },
      { label: "Outerwear", href: "/shop/outerwear" },
      { label: "Trousers", href: "/shop/trousers" },
    ],
  },
  {
    heading: "Accessories",
    links: [
      { label: "Belts & Leather", href: "/shop/accessories" },
      { label: "Scarves", href: "/shop/accessories" },
      { label: "Bags", href: "/shop/accessories" },
      { label: "Socks", href: "/shop/accessories" },
    ],
  },
  {
    heading: "Collections",
    links: [
      { label: "New Arrivals", href: "/shop?sort=new" },
      { label: "Bestsellers", href: "/shop?filter=bestseller" },
      { label: "The Essentials", href: "/shop" },
      { label: "Sale", href: "/shop?filter=sale" },
    ],
  },
];

export const mainNav: NavItem[] = [
  {
    label: "Shop",
    href: "/shop",
    columns: shopColumns,
    featured: {
      label: "The Autumn Edit",
      caption: "Considered layers for the turn of season",
      href: "/shop?sort=new",
      image:
        "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=900&q=80",
    },
  },
  { label: "New", href: "/shop?sort=new" },
  { label: "Knitwear", href: "/shop/knitwear" },
  { label: "Outerwear", href: "/shop/outerwear" },
  { label: "Sale", href: "/shop?filter=sale", accent: true },
  { label: "About", href: "/about" },
];

export const footerNav: { heading: string; links: { label: string; href: string }[] }[] =
  [
    {
      heading: "Shop",
      links: [
        { label: "New Arrivals", href: "/shop?sort=new" },
        { label: "Shirts", href: "/shop/shirts" },
        { label: "Knitwear", href: "/shop/knitwear" },
        { label: "Outerwear", href: "/shop/outerwear" },
        { label: "Trousers", href: "/shop/trousers" },
        { label: "Accessories", href: "/shop/accessories" },
      ],
    },
    {
      heading: "Help",
      links: [
        { label: "Shipping & Returns", href: "/about" },
        { label: "Size Guide", href: "/about" },
        { label: "Track Order", href: "/account" },
        { label: "Contact", href: "/about" },
        { label: "FAQ", href: "/about" },
      ],
    },
    {
      heading: "Company",
      links: [
        { label: "Our Story", href: "/about" },
        { label: "Materials", href: "/about" },
        { label: "Sustainability", href: "/about" },
        { label: "Stores", href: "/about" },
        { label: "Careers", href: "/about" },
      ],
    },
  ];

export const categoryOrder: CategorySlug[] = [
  "shirts",
  "tees",
  "knitwear",
  "outerwear",
  "trousers",
  "accessories",
];
