export type PriceType = "kg" | "piece" | "pack";

export type Product = {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  price: number;
  priceType: PriceType;
  store: string;
  accent: string;
  imageUrl: string | null;
  expiresIn: number;
  favorite: boolean;
};

export type Store = {
  id: string;
  name: string;
  color: string;
};

export type ProductPrice = {
  productId: string;
  storeId: string;
  price: number;
  oldPrice: number | null;
  isDiscount: boolean;
  updatedAt: string;
};

export type ShoppingLine = {
  productId: string;
  quantity: number;
};

export type WeekPlanItem = {
  productId: string;
  quantity: number;
};

export type WeekPlanDay = {
  day: string;
  budget: number;
  items: WeekPlanItem[];
};

export type PurchaseItem = {
  productId: string;
  productName: string;
  category: string;
  priceType: PriceType;
  quantity: number;
  unitPrice: number;
  total: number;
  storeId: string | null;
  storeName: string;
  expiresAt: string | null;
  consumed: boolean;
};

export type Purchase = {
  id: string;
  purchasedAt: string;
  total: number;
  items: PurchaseItem[];
};

export const initialStores: Store[] = [
  { id: "silpo", name: "Сільпо", color: "bg-emerald-300" },
  { id: "novus", name: "Novus", color: "bg-sky-300" },
  { id: "atb", name: "АТБ", color: "bg-yellow-300" },
  { id: "fora", name: "Фора", color: "bg-violet-300" },
];

export const initialProducts: Product[] = [
  {
    id: "tomatoes",
    name: "Помідори",
    category: "Овочі та фрукти",
    subcategory: "Свіжі овочі",
    price: 219,
    priceType: "kg",
    store: "Сільпо",
    accent: "bg-red-400",
    imageUrl: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=900&q=80",
    expiresIn: 4,
    favorite: true,
  },
  {
    id: "greek-yogurt",
    name: "Грецький йогурт",
    category: "Молочні продукти",
    subcategory: "Йогурти",
    price: 72,
    priceType: "piece",
    store: "Novus",
    accent: "bg-sky-300",
    imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80",
    expiresIn: 9,
    favorite: false,
  },
  {
    id: "chicken-fillet",
    name: "Куряче філе",
    category: "М'ясо",
    subcategory: "Птиця",
    price: 188,
    priceType: "kg",
    store: "АТБ",
    accent: "bg-rose-300",
    imageUrl: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=900&q=80",
    expiresIn: 2,
    favorite: true,
  },
  {
    id: "almonds",
    name: "Мигдаль",
    category: "Снеки",
    subcategory: "Горіхи",
    price: 164,
    priceType: "pack",
    store: "Сільпо",
    accent: "bg-amber-300",
    imageUrl: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=900&q=80",
    expiresIn: 45,
    favorite: false,
  },
  {
    id: "water",
    name: "Мінеральна вода",
    category: "Напої",
    subcategory: "Вода",
    price: 31,
    priceType: "piece",
    store: "АТБ",
    accent: "bg-cyan-300",
    imageUrl: "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=900&q=80",
    expiresIn: 120,
    favorite: false,
  },
  {
    id: "frozen-vegetables",
    name: "Овочева суміш",
    category: "Заморожені продукти",
    subcategory: "Овочі",
    price: 96,
    priceType: "pack",
    store: "Novus",
    accent: "bg-emerald-300",
    imageUrl: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=900&q=80",
    expiresIn: 180,
    favorite: false,
  },
];

export const initialProductPrices: ProductPrice[] = [
  {
    productId: "tomatoes",
    storeId: "silpo",
    price: 219,
    oldPrice: 249,
    isDiscount: true,
    updatedAt: "2026-05-08",
  },
  {
    productId: "tomatoes",
    storeId: "novus",
    price: 205,
    oldPrice: null,
    isDiscount: false,
    updatedAt: "2026-05-08",
  },
  {
    productId: "tomatoes",
    storeId: "atb",
    price: 189,
    oldPrice: null,
    isDiscount: false,
    updatedAt: "2026-05-08",
  },
  {
    productId: "tomatoes",
    storeId: "fora",
    price: 198,
    oldPrice: 225,
    isDiscount: true,
    updatedAt: "2026-05-08",
  },
  {
    productId: "greek-yogurt",
    storeId: "silpo",
    price: 78,
    oldPrice: null,
    isDiscount: false,
    updatedAt: "2026-05-08",
  },
  {
    productId: "greek-yogurt",
    storeId: "novus",
    price: 72,
    oldPrice: 86,
    isDiscount: true,
    updatedAt: "2026-05-08",
  },
  {
    productId: "greek-yogurt",
    storeId: "atb",
    price: 69,
    oldPrice: null,
    isDiscount: false,
    updatedAt: "2026-05-08",
  },
  {
    productId: "greek-yogurt",
    storeId: "fora",
    price: 75,
    oldPrice: null,
    isDiscount: false,
    updatedAt: "2026-05-08",
  },
  {
    productId: "chicken-fillet",
    storeId: "silpo",
    price: 204,
    oldPrice: null,
    isDiscount: false,
    updatedAt: "2026-05-08",
  },
  {
    productId: "chicken-fillet",
    storeId: "novus",
    price: 198,
    oldPrice: 219,
    isDiscount: true,
    updatedAt: "2026-05-08",
  },
  {
    productId: "chicken-fillet",
    storeId: "atb",
    price: 188,
    oldPrice: null,
    isDiscount: false,
    updatedAt: "2026-05-08",
  },
  {
    productId: "chicken-fillet",
    storeId: "fora",
    price: 193,
    oldPrice: null,
    isDiscount: false,
    updatedAt: "2026-05-08",
  },
  {
    productId: "almonds",
    storeId: "silpo",
    price: 164,
    oldPrice: 189,
    isDiscount: true,
    updatedAt: "2026-05-08",
  },
  {
    productId: "almonds",
    storeId: "novus",
    price: 172,
    oldPrice: null,
    isDiscount: false,
    updatedAt: "2026-05-08",
  },
  {
    productId: "almonds",
    storeId: "atb",
    price: 156,
    oldPrice: null,
    isDiscount: false,
    updatedAt: "2026-05-08",
  },
  {
    productId: "almonds",
    storeId: "fora",
    price: 168,
    oldPrice: null,
    isDiscount: false,
    updatedAt: "2026-05-08",
  },
  {
    productId: "water",
    storeId: "silpo",
    price: 36,
    oldPrice: null,
    isDiscount: false,
    updatedAt: "2026-05-08",
  },
  {
    productId: "water",
    storeId: "novus",
    price: 34,
    oldPrice: 39,
    isDiscount: true,
    updatedAt: "2026-05-08",
  },
  {
    productId: "water",
    storeId: "atb",
    price: 31,
    oldPrice: null,
    isDiscount: false,
    updatedAt: "2026-05-08",
  },
  {
    productId: "water",
    storeId: "fora",
    price: 33,
    oldPrice: null,
    isDiscount: false,
    updatedAt: "2026-05-08",
  },
  {
    productId: "frozen-vegetables",
    storeId: "silpo",
    price: 112,
    oldPrice: null,
    isDiscount: false,
    updatedAt: "2026-05-08",
  },
  {
    productId: "frozen-vegetables",
    storeId: "novus",
    price: 96,
    oldPrice: 124,
    isDiscount: true,
    updatedAt: "2026-05-08",
  },
  {
    productId: "frozen-vegetables",
    storeId: "atb",
    price: 89,
    oldPrice: null,
    isDiscount: false,
    updatedAt: "2026-05-08",
  },
  {
    productId: "frozen-vegetables",
    storeId: "fora",
    price: 99,
    oldPrice: null,
    isDiscount: false,
    updatedAt: "2026-05-08",
  },
];

export const initialShoppingLines: ShoppingLine[] = [
  { productId: "tomatoes", quantity: 0.3 },
  { productId: "greek-yogurt", quantity: 2 },
  { productId: "chicken-fillet", quantity: 0.8 },
  { productId: "water", quantity: 6 },
];

export const weekPlan = [
  { day: "Пн", budget: 520, planned: 438, products: ["Помідори", "Йогурт"] },
  { day: "Вт", budget: 480, planned: 390, products: ["Куряче філе"] },
  { day: "Ср", budget: 450, planned: 512, products: ["Вода", "Мигдаль"] },
  { day: "Чт", budget: 520, planned: 310, products: ["Овочева суміш"] },
  { day: "Пт", budget: 650, planned: 588, products: ["М'ясо", "Овочі"] },
  { day: "Сб", budget: 900, planned: 760, products: ["Велика закупка"] },
  { day: "Нд", budget: 700, planned: 420, products: ["Готові страви"] },
];

const initialWeeklyPlanItems: WeekPlanItem[][] = [
  [
    { productId: "tomatoes", quantity: 0.5 },
    { productId: "greek-yogurt", quantity: 2 },
  ],
  [{ productId: "chicken-fillet", quantity: 0.8 }],
  [
    { productId: "water", quantity: 6 },
    { productId: "almonds", quantity: 1 },
  ],
  [{ productId: "frozen-vegetables", quantity: 1 }],
  [
    { productId: "chicken-fillet", quantity: 0.7 },
    { productId: "tomatoes", quantity: 0.4 },
  ],
  [
    { productId: "tomatoes", quantity: 1 },
    { productId: "greek-yogurt", quantity: 4 },
    { productId: "water", quantity: 6 },
  ],
  [{ productId: "frozen-vegetables", quantity: 2 }],
];

export const initialWeeklyPlan: WeekPlanDay[] = weekPlan.map((day, index) => ({
  day: day.day,
  budget: day.budget,
  items: initialWeeklyPlanItems[index] ?? [],
}));
