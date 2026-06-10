import type { MetadataRoute } from "next";
import { categories, products } from "@/lib/data";
import { infoPages } from "@/lib/data/info-pages";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/shop`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${SITE_URL}/shop/${category.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/products/${product.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const helpPages: MetadataRoute.Sitemap = infoPages.map((page) => ({
    url: `${SITE_URL}/info/${page.slug}`,
    changeFrequency: "monthly",
    priority: 0.3,
  }));

  return [...staticPages, ...categoryPages, ...productPages, ...helpPages];
}
