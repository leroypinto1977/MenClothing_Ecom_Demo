export type CategorySlug =
  | "shirts"
  | "tees"
  | "knitwear"
  | "outerwear"
  | "trousers"
  | "accessories";

export type Badge = "new" | "bestseller" | "sale" | "limited";

export type Fit = "Slim" | "Regular" | "Relaxed" | "Tailored";

export interface ColorOption {
  name: string;
  hex: string;
}

export interface ProductImage {
  url: string;
  thumb: string;
  alt: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  category: CategorySlug;
  price: number;
  compareAtPrice?: number;
  colors: ColorOption[];
  sizes: string[];
  images: ProductImage[];
  description: string;
  details: string[];
  fit: Fit;
  rating: number;
  reviewCount: number;
  badges: Badge[];
  relatedIds: string[];
}

export interface Category {
  slug: CategorySlug;
  name: string;
  tagline: string;
  description: string;
  image: string;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  location: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  color: string;
  size: string;
  quantity: number;
  price: number;
}

export type OrderStatus = "Processing" | "Shipped" | "In transit" | "Delivered";

export interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  tracking?: string;
}

export interface Address {
  id: string;
  label: string;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  region: string;
  postal: string;
  country: string;
  default: boolean;
}

export interface User {
  name: string;
  firstName: string;
  email: string;
  memberSince: string;
  addresses: Address[];
}

/** A line item in the cart — identified by product + variant. */
export interface CartItem {
  key: string; // `${productId}:${color}:${size}`
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  color: string;
  size: string;
  quantity: number;
}
