import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://theoldattic.shop";

const fixedPaths = [
  "",
  "about",
  "catalog",
  "blog",
  "contact",
  "faq",
  "policy/privacy-policy",
  "policy/returns-policy",
  "policy/shipping-policy",
  "policy/terms-of-service",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = fixedPaths.map((path) => ({
    url: `${baseUrl}/${path}`,
    lastModified: new Date().toISOString(),
  }));

  const [categoriesRes, productsRes, postsRes] = await Promise.all([
    supabase.from("categories").select("slug"),
    supabase.from("products").select("slug").eq("is_active", true),
    supabase.from("posts").select("slug").eq("published", true),
  ]);

  if (categoriesRes.data) {
    for (const category of categoriesRes.data) {
      if (!category?.slug) continue;
      routes.push({
        url: `${baseUrl}/catalog/${category.slug}`,
        lastModified: new Date().toISOString(),
      });
    }
  }

  if (productsRes.data) {
    for (const product of productsRes.data) {
      if (!product?.slug) continue;
      routes.push({
        url: `${baseUrl}/product/${product.slug}`,
        lastModified: new Date().toISOString(),
      });
    }
  }

  if (postsRes.data) {
    for (const post of postsRes.data) {
      if (!post?.slug) continue;
      routes.push({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date().toISOString(),
      });
    }
  }

  return routes;
}
