import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { Badge, ColorOption, Fit } from "@/lib/types";

// ---------------------------------------------------------------------------
// Auth — table shapes follow Better Auth's Drizzle adapter defaults (core +
// admin plugin), so Phase 2 plugs in without a migration.
// ---------------------------------------------------------------------------

export const users = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  phone: text("phone"),
  role: text("role", { enum: ["customer", "staff", "admin"] })
    .notNull()
    .default("customer"),
  banned: boolean("banned").notNull().default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const sessions = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonated_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const accounts = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verifications = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

export const categories = pgTable("categories", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  tagline: text("tagline").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const products = pgTable(
  "products",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    subtitle: text("subtitle").notNull(),
    categorySlug: text("category_slug")
      .notNull()
      .references(() => categories.slug),
    // Whole rupees (₹). Convert to paise only at the Razorpay boundary.
    price: integer("price").notNull(),
    compareAtPrice: integer("compare_at_price"),
    colors: jsonb("colors").$type<ColorOption[]>().notNull(),
    sizes: jsonb("sizes").$type<string[]>().notNull(),
    description: text("description").notNull(),
    details: jsonb("details").$type<string[]>().notNull(),
    fit: text("fit").$type<Fit>().notNull(),
    badges: jsonb("badges").$type<Badge[]>().notNull().default([]),
    // Denormalized from reviews; refreshed when reviews change.
    rating: real("rating").notNull().default(0),
    reviewCount: integer("review_count").notNull().default(0),
    status: text("status", { enum: ["draft", "active", "archived"] })
      .notNull()
      .default("active"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("products_category_idx").on(t.categorySlug)]
);

export const productImages = pgTable(
  "product_images",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    thumb: text("thumb").notNull(),
    alt: text("alt").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("product_images_product_idx").on(t.productId)]
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    color: text("color").notNull(),
    size: text("size").notNull(),
    sku: text("sku").notNull().unique(),
    stock: integer("stock").notNull().default(0),
    priceOverride: integer("price_override"),
  },
  (t) => [
    uniqueIndex("product_variants_combo_idx").on(t.productId, t.color, t.size),
  ]
);

export const reviews = pgTable(
  "reviews",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    author: text("author").notNull(),
    location: text("location").notNull(),
    rating: integer("rating").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    date: date("date").notNull(),
    verified: boolean("verified").notNull().default(false),
    status: text("status", { enum: ["pending", "published", "rejected"] })
      .notNull()
      .default("published"),
  },
  (t) => [index("reviews_product_idx").on(t.productId)]
);

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

export const addresses = pgTable(
  "addresses",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    name: text("name").notNull(),
    line1: text("line1").notNull(),
    line2: text("line2"),
    city: text("city").notNull(),
    region: text("region").notNull(),
    postal: text("postal").notNull(),
    country: text("country").notNull(),
    isDefault: boolean("is_default").notNull().default(false),
  },
  (t) => [index("addresses_user_idx").on(t.userId)]
);

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export type OrderDbStatus =
  | "pending"
  | "payment_failed"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refund_requested"
  | "refunded";

export interface AddressSnapshot {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  region: string;
  postal: string;
  country: string;
  phone?: string;
}

export const orders = pgTable(
  "orders",
  {
    id: text("id").primaryKey(),
    number: text("number").notNull().unique(), // "MER-10428"
    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    email: text("email").notNull(),
    status: text("status").$type<OrderDbStatus>().notNull().default("pending"),
    subtotal: integer("subtotal").notNull(),
    shipping: integer("shipping").notNull().default(0),
    tax: integer("tax").notNull().default(0),
    discount: integer("discount").notNull().default(0),
    total: integer("total").notNull(),
    currency: text("currency").notNull().default("INR"),
    shippingAddress: jsonb("shipping_address").$type<AddressSnapshot>(),
    billingAddress: jsonb("billing_address").$type<AddressSnapshot>(),
    deliveryMethod: text("delivery_method"),
    carrier: text("carrier"),
    trackingNumber: text("tracking_number"),
    trackingUrl: text("tracking_url"),
    customerNote: text("customer_note"),
    placedAt: timestamp("placed_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("orders_user_idx").on(t.userId),
    index("orders_status_idx").on(t.status),
    index("orders_placed_idx").on(t.placedAt),
  ]
);

export const orderItems = pgTable(
  "order_items",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    // Snapshot fields — order history must survive product deletion.
    productId: text("product_id").references(() => products.id, {
      onDelete: "set null",
    }),
    variantSku: text("variant_sku"),
    name: text("name").notNull(),
    image: text("image").notNull(),
    color: text("color").notNull(),
    size: text("size").notNull(),
    quantity: integer("quantity").notNull(),
    unitPrice: integer("unit_price").notNull(),
  },
  (t) => [index("order_items_order_idx").on(t.orderId)]
);

export const orderEvents = pgTable(
  "order_events",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    type: text("type", {
      enum: ["status_change", "note", "email_sent", "tracking_added"],
    }).notNull(),
    fromStatus: text("from_status"),
    toStatus: text("to_status"),
    message: text("message"),
    actorUserId: text("actor_user_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("order_events_order_idx").on(t.orderId)]
);

export const payments = pgTable(
  "payments",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    provider: text("provider").notNull().default("razorpay"),
    providerOrderId: text("provider_order_id"),
    providerPaymentId: text("provider_payment_id"),
    amount: integer("amount").notNull(), // whole rupees
    status: text("status", {
      enum: ["created", "authorized", "captured", "failed", "refunded"],
    }).notNull(),
    method: text("method"),
    raw: jsonb("raw"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("payments_order_idx").on(t.orderId)]
);

export const refunds = pgTable("refunds", {
  id: text("id").primaryKey(),
  paymentId: text("payment_id")
    .notNull()
    .references(() => payments.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  reason: text("reason"),
  providerRefundId: text("provider_refund_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Editorial content (admin-managed blocks; see plan §8)
// ---------------------------------------------------------------------------

export const contentBlocks = pgTable("content_blocks", {
  key: text("key").primaryKey(), // "home.hero", "announcement", "info.shipping"…
  data: jsonb("data").notNull(),
  updatedBy: text("updated_by"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const usersRelations = relations(users, ({ many }) => ({
  addresses: many(addresses),
  orders: many(orders),
  sessions: many(sessions),
  accounts: many(accounts),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, { fields: [addresses.userId], references: [users.id] }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categorySlug],
    references: [categories.slug],
  }),
  images: many(productImages),
  variants: many(productVariants),
  reviews: many(reviews),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const productVariantsRelations = relations(
  productVariants,
  ({ one }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
  })
);

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
  events: many(orderEvents),
  payments: many(payments),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const orderEventsRelations = relations(orderEvents, ({ one }) => ({
  order: one(orders, {
    fields: [orderEvents.orderId],
    references: [orders.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one, many }) => ({
  order: one(orders, { fields: [payments.orderId], references: [orders.id] }),
  refunds: many(refunds),
}));

export const refundsRelations = relations(refunds, ({ one }) => ({
  payment: one(payments, {
    fields: [refunds.paymentId],
    references: [payments.id],
  }),
}));
