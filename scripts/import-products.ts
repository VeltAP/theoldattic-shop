import { readFileSync, appendFileSync } from "fs";
import { parse } from "csv-parse/sync";
import { supabaseAdmin } from "../lib/supabaseAdmin";

const CSV_PATH = "data/products_export.csv";
const BATCH_SIZE = 50;
const START_INDEX = 300;

type ShopifyRow = {
    Handle: string;
    Title: string;
    "Body (HTML)": string;
    Type: string;
    Published: string;
    "Variant Price": string;
    "Variant Inventory Qty": string;
    "Image Src": string;
    "Image Position": string;
};

const fileContent = readFileSync(CSV_PATH, "utf8");

const rows: ShopifyRow[] = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
});

// console.log(`Loaded ${rows.length} CSV rows`);

type ProductGroup = {
    main: ShopifyRow;
    images: {
        src: string;
        position: number;
    }[];
};

const TYPE_TO_CATEGORY_SLUG: Record<string, string> = {
    "": "decorative",
    Ashtray: "decorative",
    "Ceiling lamp": "lighting",
    "Floor lamp": "lighting",
    "Hanging lamp": "lighting",
    "Table lamp": "lighting",
    "Wall lamp": "lighting",

    Seating: "seating",

    "Cabinets & Storage": "cabinets-storage",

    "Tables & Trolleys": "tables-trolleys",

    Mirorrs: "mirrors",//Mirorrs is a typo in the CSV in original export.

    Painting: "decorative",
    Sculptures: "decorative",
    Tableware: "decorative",
    Vases: "decorative",
    Other: "decorative",
};

function groupByHandle(rows: ShopifyRow[]): Map<string, ProductGroup> {
    const groups = new Map<string, ProductGroup>();

    for (const row of rows) {
        if (!groups.has(row.Handle)) {
        groups.set(row.Handle, {
            main: row,
            images: [],
        });
        }

        const group = groups.get(row.Handle)!;

        if (row.Title.trim() !== "") {
            group.main = row;
        }

        if (row["Image Src"].trim() !== "") {
            group.images.push({
                src: row["Image Src"].trim(),
                position: Number(row["Image Position"]) || 0,
            });
        }
    }

    for (const group of groups.values()) {
    group.images.sort((a, b) => a.position - b.position);
    }

    return groups;
}

const groups = groupByHandle(rows);

function htmlToPlainText(html: string): string {
  return html
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

async function importOneProduct(
  handle: string,
  group: ProductGroup,
  categoryIdBySlug: Map<string, number>
) {
  const { data: existing } = await supabaseAdmin
    .from("products")
    .select("id")
    .eq("slug", handle)
    .maybeSingle();

  if (existing) {
    console.log(`Skipping ${handle} (already imported)`);
    return;
  }

  const row = group.main;

  const categorySlug =
    TYPE_TO_CATEGORY_SLUG[row.Type.trim()] ?? "decorative";

  const categoryId = categoryIdBySlug.get(categorySlug);

  if (!categoryId) {
    throw new Error(`Category "${categorySlug}" not found.`);
  }

  const { data: product, error: productError } = await supabaseAdmin
    .from("products")
    .insert({
      name: row.Title.trim(),
      slug: handle,
      description: htmlToPlainText(row["Body (HTML)"]),
      price: Number(row["Variant Price"]),
      category_id: categoryId,
      stock_quantity:
        Number(row["Variant Inventory Qty"]) || 0,
      is_active:
        row.Published.trim().toLowerCase() === "true",
    })
    .select("id")
    .single();

  if (productError || !product) {
    throw productError ?? new Error("Product insert failed.");
  }

  console.log(`Imported product: ${handle}`);

  for (const [index, image] of group.images.entries()) {
    const response = await fetch(image.src);

    if (!response.ok) {
      throw new Error(`Failed to download ${image.src}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    const extension =
      image.src.split(".").pop()?.split("?")[0] || "jpg";

    const fileName = `${handle}/${index + 1}.${extension}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("product-images")
      .upload(fileName, buffer, {
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from("product-images")
      .getPublicUrl(fileName);

    const { error: imageError } = await supabaseAdmin
      .from("product_images")
      .insert({
        product_id: product.id,
        url: publicUrlData.publicUrl,
        sort_order: index + 1,
      });

    if (imageError) {
      throw imageError;
    }
  }

  console.log(`🖼 Uploaded ${group.images.length} images`);
}

async function run() {
  const { data: categories, error } = await supabaseAdmin
    .from("categories")
    .select("id, slug");

  if (error) throw error;

  const categoryIdBySlug = new Map(
    (categories ?? []).map((c) => [c.slug, c.id as number])
  );

  const allHandles = Array.from(groups.keys());

  const batch = allHandles.slice(
    START_INDEX,
    START_INDEX + BATCH_SIZE
  );

  console.log(
    `Importing ${batch.length} products (${START_INDEX}–${
      START_INDEX + batch.length
    } of ${allHandles.length})`
  );

  for (const handle of batch) {
    try {
      await importOneProduct(
        handle,
        groups.get(handle)!,
        categoryIdBySlug
      );
    } catch (error) {
      console.error(`❌ ${handle}`);

      console.error(error);

      appendFileSync(
        "import-errors.log",
        `${handle}: ${String(error)}\n`
      );
    }
  }

  console.log("Batch complete");
}

run();


// npx tsx scripts/import-products.ts
// don't forget to set START_INDEX and BATCH_SIZE