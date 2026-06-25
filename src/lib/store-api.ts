import { invoke } from "@tauri-apps/api/core";

export type ExternalStoreProduct = {
  id: string;
  sku: string;
  ean: string | null;
  title: string;
  storeId: "novus";
  storeName: string;
  price: number;
  oldPrice: number | null;
  discountPercent: number | null;
  discountDueDate: string | null;
  unit: string;
  imageUrl: string | null;
  sourceUrl: string;
};

type ZakazSearchResponse = {
  count?: number;
  count_available?: number;
  results?: ZakazProduct[];
};

type ZakazProduct = {
  sku?: string;
  ean?: string;
  title?: string;
  price?: number;
  unit?: string;
  discount?: {
    status?: boolean;
    value?: number;
    old_price?: number;
    due_date?: string;
  } | null;
  image_url?: Record<string, string | null> | null;
};

const NOVUS_STORE_ID = "48201031";

function centsToUah(value: number | null | undefined) {
  return typeof value === "number" ? value / 100 : null;
}

function pickImageUrl(product: ZakazProduct) {
  const urls = Object.values(product.image_url ?? {});

  return (
    urls.find(
      (url): url is string =>
        typeof url === "string" && url.startsWith("https://"),
    ) ?? null
  );
}

function mapZakazProduct(product: ZakazProduct): ExternalStoreProduct | null {
  const sku = product.sku?.trim();
  const title = product.title?.trim();
  const price = centsToUah(product.price);

  if (!sku || !title || !price) return null;

  const discount = product.discount?.status ? product.discount : null;

  return {
    id: `novus-${sku}`,
    sku,
    ean: product.ean ?? null,
    title,
    storeId: "novus",
    storeName: "Novus",
    price,
    oldPrice: centsToUah(discount?.old_price),
    discountPercent: discount?.value ?? null,
    discountDueDate: discount?.due_date ?? null,
    unit: product.unit ?? "pcs",
    imageUrl: pickImageUrl(product),
    sourceUrl: `https://novus.zakaz.ua/uk/search/?q=${encodeURIComponent(title)}`,
  };
}

export async function searchNovusProducts(query: string) {
  const response = await invoke<ZakazSearchResponse>("search_zakaz_products", {
    query,
    storeId: NOVUS_STORE_ID,
  });

  return (response.results ?? [])
    .map(mapZakazProduct)
    .filter((product): product is ExternalStoreProduct => product !== null)
    .slice(0, 12);
}

export async function searchFreeProductImage(query: string) {
  return invoke<string>("search_wikimedia_product_image", { query });
}
