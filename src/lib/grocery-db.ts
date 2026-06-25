import Database from "@tauri-apps/plugin-sql";

import {
  initialProductPrices,
  initialProducts,
  initialShoppingLines,
  initialStores,
  initialWeeklyPlan,
  type PriceType,
  type Product,
  type ProductPrice,
  type Purchase,
  type PurchaseItem,
  type ShoppingLine,
  type Store,
  type WeekPlanDay,
} from "@/lib/grocery-data";

type DbProduct = {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  price: number;
  price_type: PriceType;
  store: string;
  accent: string;
  image_url: string | null;
  expires_in: number;
  favorite: number;
};

type DbStore = {
  id: string;
  name: string;
  color: string;
};

type DbProductPrice = {
  product_id: string;
  store_id: string;
  price: number;
  old_price: number | null;
  is_discount: number;
  updated_at: string;
};

type DbWeekPlanDay = {
  day: string;
  budget: number;
  sort_order: number;
};

type DbWeekPlanItem = {
  day: string;
  product_id: string;
  quantity: number;
};

type DbPurchase = {
  id: string;
  purchased_at: string;
  total: number;
};

type DbPurchaseItem = {
  purchase_id: string;
  product_id: string;
  product_name: string;
  category: string;
  price_type: PriceType;
  quantity: number;
  unit_price: number;
  total: number;
  store_id: string | null;
  store_name: string;
  expires_at: string | null;
  consumed: number;
};

let databasePromise: Promise<Database> | null = null;

function getDatabase() {
  databasePromise ??= Database.load("sqlite:smart-grocery.db");
  return databasePromise;
}

function mapProduct(row: DbProduct): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    subcategory: row.subcategory,
    price: row.price,
    priceType: row.price_type,
    store: row.store,
    accent: row.accent,
    imageUrl: row.image_url,
    expiresIn: row.expires_in,
    favorite: Boolean(row.favorite),
  };
}

function mapStore(row: DbStore): Store {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
  };
}

function mapProductPrice(row: DbProductPrice): ProductPrice {
  return {
    productId: row.product_id,
    storeId: row.store_id,
    price: row.price,
    oldPrice: row.old_price,
    isDiscount: Boolean(row.is_discount),
    updatedAt: row.updated_at,
  };
}

export async function initializeDatabase() {
  const db = await getDatabase();

  await db.execute(`
    CREATE TABLE IF NOT EXISTS stores (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      subcategory TEXT NOT NULL,
      price REAL NOT NULL,
      price_type TEXT NOT NULL,
      store TEXT NOT NULL,
      accent TEXT NOT NULL,
      image_url TEXT,
      expires_in INTEGER NOT NULL,
      favorite INTEGER NOT NULL DEFAULT 0
    )
  `);

  await ensureProductImageColumn(db);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS product_prices (
      product_id TEXT NOT NULL,
      store_id TEXT NOT NULL,
      price REAL NOT NULL,
      old_price REAL,
      is_discount INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (product_id, store_id),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS shopping_lines (
      product_id TEXT PRIMARY KEY,
      quantity REAL NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS week_plan_days (
      day TEXT PRIMARY KEY,
      budget REAL NOT NULL,
      sort_order INTEGER NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS week_plan_items (
      day TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity REAL NOT NULL,
      PRIMARY KEY (day, product_id),
      FOREIGN KEY (day) REFERENCES week_plan_days(day) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS purchases (
      id TEXT PRIMARY KEY,
      purchased_at TEXT NOT NULL,
      total REAL NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS purchase_items (
      purchase_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      category TEXT NOT NULL,
      price_type TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit_price REAL NOT NULL,
      total REAL NOT NULL,
      store_id TEXT,
      store_name TEXT NOT NULL,
      expires_at TEXT,
      consumed INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (purchase_id, product_id),
      FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE
    )
  `);

  await ensurePurchaseItemExpiryColumns(db);

  const productCount = await db.select<Array<{ count: number }>>(
    "SELECT COUNT(*) as count FROM products",
  );

  if ((productCount[0]?.count ?? 0) === 0) {
    for (const product of initialProducts) {
      await saveProduct(product);
    }
  } else {
    await ensureInitialProductImages(db);
  }

  const storeCount = await db.select<Array<{ count: number }>>(
    "SELECT COUNT(*) as count FROM stores",
  );

  if ((storeCount[0]?.count ?? 0) === 0) {
    for (const store of initialStores) {
      await saveStore(store);
    }
  }

  const priceCount = await db.select<Array<{ count: number }>>(
    "SELECT COUNT(*) as count FROM product_prices",
  );

  if ((priceCount[0]?.count ?? 0) === 0) {
    for (const price of initialProductPrices) {
      await saveProductPrice(price);
    }
  }

  const lineCount = await db.select<Array<{ count: number }>>(
    "SELECT COUNT(*) as count FROM shopping_lines",
  );

  if ((lineCount[0]?.count ?? 0) === 0) {
    for (const line of initialShoppingLines) {
      await saveShoppingLine(line);
    }
  }

  const weekPlanCount = await db.select<Array<{ count: number }>>(
    "SELECT COUNT(*) as count FROM week_plan_days",
  );

  if ((weekPlanCount[0]?.count ?? 0) === 0) {
    for (const [index, day] of initialWeeklyPlan.entries()) {
      await saveWeekPlanDay(day, index);
    }
  }
}

export async function loadStores() {
  const db = await getDatabase();
  const rows = await db.select<DbStore[]>("SELECT * FROM stores ORDER BY name ASC");

  return rows.map(mapStore);
}

export async function loadProducts() {
  const db = await getDatabase();
  const rows = await db.select<DbProduct[]>(
    "SELECT * FROM products ORDER BY favorite DESC, name ASC",
  );

  return rows.map(mapProduct);
}

export async function loadShoppingLines() {
  const db = await getDatabase();
  return db.select<ShoppingLine[]>(
    "SELECT product_id as productId, quantity FROM shopping_lines ORDER BY product_id ASC",
  );
}

export async function loadProductPrices() {
  const db = await getDatabase();
  const rows = await db.select<DbProductPrice[]>(
    "SELECT * FROM product_prices ORDER BY product_id ASC, price ASC",
  );

  return rows.map(mapProductPrice);
}

export async function loadWeeklyPlan() {
  const db = await getDatabase();
  const days = await db.select<DbWeekPlanDay[]>(
    "SELECT * FROM week_plan_days ORDER BY sort_order ASC",
  );
  const items = await db.select<DbWeekPlanItem[]>(
    "SELECT * FROM week_plan_items ORDER BY day ASC, product_id ASC",
  );

  return days.map<WeekPlanDay>((day) => ({
    day: day.day,
    budget: day.budget,
    items: items
      .filter((item) => item.day === day.day)
      .map((item) => ({
        productId: item.product_id,
        quantity: item.quantity,
      })),
  }));
}

export async function loadPurchases() {
  const db = await getDatabase();
  const purchases = await db.select<DbPurchase[]>(
    "SELECT * FROM purchases ORDER BY purchased_at DESC",
  );
  const items = await db.select<DbPurchaseItem[]>(
    "SELECT * FROM purchase_items ORDER BY purchase_id ASC, product_name ASC",
  );

  return purchases.map<Purchase>((purchase) => ({
    id: purchase.id,
    purchasedAt: purchase.purchased_at,
    total: purchase.total,
    items: items
      .filter((item) => item.purchase_id === purchase.id)
      .map<PurchaseItem>((item) => ({
        productId: item.product_id,
        productName: item.product_name,
        category: item.category,
        priceType: item.price_type,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        total: item.total,
        storeId: item.store_id,
        storeName: item.store_name,
        expiresAt: item.expires_at,
        consumed: Boolean(item.consumed),
      })),
  }));
}

export async function saveStore(store: Store) {
  const db = await getDatabase();

  await db.execute(
    `INSERT INTO stores (id, name, color)
     VALUES (?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      color = excluded.color`,
    [store.id, store.name, store.color],
  );
}

async function ensureProductImageColumn(db: Database) {
  try {
    await db.execute("ALTER TABLE products ADD COLUMN image_url TEXT");
  } catch {
    // The column already exists in databases created before product photos.
  }
}

async function ensureInitialProductImages(db: Database) {
  for (const product of initialProducts) {
    await db.execute(
      `UPDATE products
       SET image_url = COALESCE(NULLIF(image_url, ''), ?)
       WHERE id = ?`,
      [product.imageUrl, product.id],
    );
  }
}

async function ensurePurchaseItemExpiryColumns(db: Database) {
  try {
    await db.execute("ALTER TABLE purchase_items ADD COLUMN expires_at TEXT");
  } catch {
    // The column already exists.
  }

  try {
    await db.execute(
      "ALTER TABLE purchase_items ADD COLUMN consumed INTEGER NOT NULL DEFAULT 0",
    );
  } catch {
    // The column already exists.
  }

  await db.execute(`
    UPDATE purchase_items
    SET expires_at = (
      SELECT strftime(
        '%Y-%m-%dT%H:%M:%fZ',
        purchases.purchased_at,
        '+' || products.expires_in || ' days'
      )
      FROM purchases
      JOIN products ON products.id = purchase_items.product_id
      WHERE purchases.id = purchase_items.purchase_id
    )
    WHERE expires_at IS NULL
  `);
}

export async function saveProduct(product: Product) {
  const db = await getDatabase();

  await db.execute(
    `INSERT INTO products
      (id, name, category, subcategory, price, price_type, store, accent, image_url, expires_in, favorite)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      category = excluded.category,
      subcategory = excluded.subcategory,
      price = excluded.price,
      price_type = excluded.price_type,
      store = excluded.store,
      accent = excluded.accent,
      image_url = excluded.image_url,
      expires_in = excluded.expires_in,
      favorite = excluded.favorite`,
    [
      product.id,
      product.name,
      product.category,
      product.subcategory,
      product.price,
      product.priceType,
      product.store,
      product.accent,
      product.imageUrl,
      product.expiresIn,
      product.favorite ? 1 : 0,
    ],
  );
}

export async function saveProductPrice(price: ProductPrice) {
  const db = await getDatabase();

  await db.execute(
    `INSERT INTO product_prices
      (product_id, store_id, price, old_price, is_discount, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(product_id, store_id) DO UPDATE SET
      price = excluded.price,
      old_price = excluded.old_price,
      is_discount = excluded.is_discount,
      updated_at = excluded.updated_at`,
    [
      price.productId,
      price.storeId,
      price.price,
      price.oldPrice,
      price.isDiscount ? 1 : 0,
      price.updatedAt,
    ],
  );
}

export async function saveShoppingLine(line: ShoppingLine) {
  const db = await getDatabase();

  await db.execute(
    `INSERT INTO shopping_lines (product_id, quantity)
     VALUES (?, ?)
     ON CONFLICT(product_id) DO UPDATE SET
      quantity = excluded.quantity`,
    [line.productId, line.quantity],
  );
}

export async function saveWeekPlanDay(day: WeekPlanDay, sortOrder: number) {
  const db = await getDatabase();

  await db.execute(
    `INSERT INTO week_plan_days (day, budget, sort_order)
     VALUES (?, ?, ?)
     ON CONFLICT(day) DO UPDATE SET
      budget = excluded.budget,
      sort_order = excluded.sort_order`,
    [day.day, day.budget, sortOrder],
  );

  await db.execute("DELETE FROM week_plan_items WHERE day = ?", [day.day]);

  for (const item of day.items) {
    await db.execute(
      `INSERT INTO week_plan_items (day, product_id, quantity)
       VALUES (?, ?, ?)`,
      [day.day, item.productId, item.quantity],
    );
  }
}

export async function savePurchase(purchase: Purchase) {
  const db = await getDatabase();

  await db.execute(
    `INSERT INTO purchases (id, purchased_at, total)
     VALUES (?, ?, ?)`,
    [purchase.id, purchase.purchasedAt, purchase.total],
  );

  for (const item of purchase.items) {
    await db.execute(
      `INSERT INTO purchase_items
        (purchase_id, product_id, product_name, category, price_type, quantity,
         unit_price, total, store_id, store_name, expires_at, consumed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        purchase.id,
        item.productId,
        item.productName,
        item.category,
        item.priceType,
        item.quantity,
        item.unitPrice,
        item.total,
        item.storeId,
        item.storeName,
        item.expiresAt,
        item.consumed ? 1 : 0,
      ],
    );
  }
}

export async function updatePurchaseItemConsumed(
  purchaseId: string,
  productId: string,
  consumed: boolean,
) {
  const db = await getDatabase();
  await db.execute(
    `UPDATE purchase_items
     SET consumed = ?
     WHERE purchase_id = ? AND product_id = ?`,
    [consumed ? 1 : 0, purchaseId, productId],
  );
}

export async function deleteShoppingLine(productId: string) {
  const db = await getDatabase();
  await db.execute("DELETE FROM shopping_lines WHERE product_id = ?", [productId]);
}

export async function clearShoppingLines() {
  const db = await getDatabase();
  await db.execute("DELETE FROM shopping_lines");
}
