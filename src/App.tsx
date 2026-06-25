import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  Check,
  Carrot,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Cloud,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Heart,
  Home,
  ListPlus,
  Lightbulb,
  Minus,
  Percent,
  Plus,
  ReceiptText,
  Route as RouteIcon,
  RotateCcw,
  Search,
  Settings,
  ShoppingBasket,
  Sparkles,
  Store as StoreIcon,
  Trash2,
  WalletCards,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
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
  type ShoppingLine,
  type Store,
  type WeekPlanDay,
  type WeekPlanItem,
} from "@/lib/grocery-data";
import {
  clearShoppingLines,
  deleteShoppingLine,
  initializeDatabase,
  loadPurchases,
  loadProductPrices,
  loadProducts,
  loadShoppingLines,
  loadStores,
  loadWeeklyPlan,
  saveProduct,
  saveProductPrice,
  savePurchase,
  saveShoppingLine,
  saveWeekPlanDay,
  updatePurchaseItemConsumed,
} from "@/lib/grocery-db";
import { searchNovusProducts, type ExternalStoreProduct } from "@/lib/store-api";
import {
  defaultSettings,
  loadAppSettings,
  saveAppSettings,
  selectExportDirectory,
  type AppLanguage,
  type AppSettings,
  type AppTheme,
} from "@/lib/app-settings";
import {
  exportPurchasesToExcel,
  exportPurchasesToPdf,
} from "@/lib/report-export";
import { observeUiLanguage } from "@/lib/ui-language";

import "./App.css";

type StoreTotal = {
  store: Store;
  total: number;
  missingCount: number;
};

type ShoppingItem = ShoppingLine & {
  product: Product;
  bestPrice: ProductPrice | null;
  bestStore: Store | null;
};

type ShoppingRouteItem = {
  product: Product;
  quantity: number;
  price: ProductPrice;
  store: Store;
  total: number;
};

type ShoppingRoute = {
  id: string;
  label: string;
  description: string;
  storeIds: string[];
  items: ShoppingRouteItem[];
  total: number;
  missingProductIds: string[];
};

type AssistantStep = {
  target?: string;
  section?: string;
  title: string;
  description: string;
  action: string;
};

type ImageFilter = "all" | "with" | "without";

const navigation = [
  { label: "Огляд", icon: Home },
  { label: "Продукти", icon: Carrot },
  { label: "Шоп-ліст", icon: ShoppingBasket },
  { label: "План тижня", icon: CalendarDays },
  { label: "Історія", icon: ReceiptText },
  { label: "Строки", icon: Clock3 },
  { label: "Оптимізатор", icon: RouteIcon },
  { label: "Аналітика", icon: BarChart3 },
];

const productCategories = [
  "Овочі та фрукти",
  "Напої",
  "Молочні продукти",
  "М'ясо",
  "Снеки",
  "Заморожені продукти",
  "Готові страви",
  "Побутові товари",
  "Інше",
];

const categoryImages: Record<string, string> = {
  "Овочі та фрукти": "/category-images/vegetables-fruits.svg",
  Напої: "/category-images/drinks.svg",
  "Молочні продукти": "/category-images/dairy.svg",
  "М'ясо": "/category-images/meat.svg",
  Снеки: "/category-images/snacks.svg",
  "Заморожені продукти": "/category-images/frozen.svg",
  "Готові страви": "/category-images/ready-meals.svg",
  "Побутові товари": "/category-images/household.svg",
  Інше: "/category-images/other.svg",
};

const priceTypeOptions: Array<{ label: string; value: PriceType }> = [
  { label: "за кг", value: "kg" },
  { label: "за штуку", value: "piece" },
  { label: "за упаковку", value: "pack" },
];

const assistantStepsByLanguage: Record<AppLanguage, AssistantStep[]> = {
  uk: [
    {
      title: "Ласкаво просимо до Smart Grocery",
      description:
        "Застосунок допомагає створити власну базу продуктів, скласти список покупок, знайти вигідні магазини, спланувати тиждень і зрозуміти свої витрати.",
      action:
        "За кілька кроків пройдемо весь шлях: від додавання товару до завершеної покупки й аналітики.",
    },
    {
      section: "Огляд",
      target: '[data-tour="overview"]',
      title: "Огляд: головний екран",
      description:
        "Це коротке зведення перед покупкою. Тут видно поточну суму списку, найвигідніший магазин, можливу економію та найближчий строк придатності.",
      action:
        "Починай звідси, коли хочеш швидко зрозуміти стан покупок і бюджету.",
    },
    {
      target: '[data-tour="weekly-budget"]',
      title: "Контролюй загальний бюджет",
      description:
        "Блок показує загальний бюджет тижня та вже заплановану суму. Він допомагає побачити перевитрату ще до походу в магазин.",
      action:
        "Щоб встановити або змінити бюджети окремих днів, відкрий вкладку «План тижня».",
    },
    {
      section: "Продукти",
      target: '[data-tour="products-section"]',
      title: "Продукти: створи власний каталог",
      description:
        "У цій вкладці зберігаються товари, їхні фото, категорії, ціни та магазини. Один товар може мати різні ціни в різних магазинах.",
      action:
        "Знайди готовий товар, імпортуй актуальну ціну або створи власний продукт кнопкою «Додати».",
    },
    {
      target: '[data-tour="add-product"]',
      title: "Додай свій продукт",
      description:
        "Кнопка відкриває форму нового продукту. Вкажи назву, категорію, тип ціни, магазин, строк придатності та фото.",
      action:
        "Після збереження продукт з’явиться у каталозі й буде доступний для шоп-ліста та плану тижня.",
    },
    {
      target: '[data-tour="store-filter"]',
      title: "Обери магазини для порівняння",
      description:
        "Фільтр визначає, у яких магазинах застосунок шукатиме найкращі ціни. Вимкни магазини, до яких не плануєш їхати.",
      action:
        "Вибрані магазини впливають на підсумок шоп-ліста, оптимізатор маршруту та аналітику.",
    },
    {
      section: "Шоп-ліст",
      target: '[data-tour="shopping-list-section"]',
      title: "Шоп-ліст: підготуй покупку",
      description:
        "Тут знаходиться список того, що потрібно купити. Змінюй кількість, прибирай зайве та бач загальну суму за найкращими цінами.",
      action:
        "Коли все придбано, заверши покупку. Вона потрапить в історію, аналітику та нагадування про строки.",
    },
    {
      section: "Оптимізатор",
      target: '[data-tour="optimizer-section"]',
      title: "Оптимізатор: знайди вигідний маршрут",
      description:
        "Оптимізатор порівнює весь шоп-ліст і пропонує, де купити товари дешевше: в одному магазині, у двох або за максимальною економією.",
      action:
        "Застосуй рекомендований маршрут, щоб автоматично прив’язати позиції списку до вигідних магазинів.",
    },
    {
      section: "План тижня",
      target: '[data-tour="weekly-plan-section"]',
      title: "План тижня: плануй наперед",
      description:
        "Розподіляй майбутні покупки по днях і встановлюй денний бюджет. Так легше не забути потрібне та уникнути імпульсивних витрат.",
      action:
        "Додай товари до потрібного дня, а перед походом у магазин перенеси весь день у шоп-ліст.",
    },
    {
      section: "Строки",
      target: '[data-tour="expiry-section"]',
      title: "Строки: менше зіпсованих продуктів",
      description:
        "Після завершення покупки застосунок відстежує строки придатності та показує, що потрібно використати першочергово.",
      action:
        "Позначай використані продукти, щоб список нагадувань залишався актуальним.",
    },
    {
      section: "Історія",
      target: '[data-tour="history-section"]',
      title: "Історія: усі завершені покупки",
      description:
        "Тут зберігаються чеки та склад минулих покупок. Покупку можна швидко повторити або експортувати у PDF чи Excel.",
      action:
        "Використовуй повторення для регулярних закупівель, а експорт — для власного обліку.",
    },
    {
      section: "Аналітика",
      target: '[data-tour="analytics-section"]',
      title: "Аналітика: зрозумій свої витрати",
      description:
        "Графіки показують витрати за категоріями, днями й покупками, середній чек, план бюджету та потенційну економію.",
      action:
        "Переглядай аналітику після кількох завершених покупок, щоб знаходити зайві витрати й точніше планувати бюджет.",
    },
    {
      target: '[data-tour="settings"]',
      title: "Налаштуй застосунок під себе",
      description:
        "У налаштуваннях можна змінити тему, мову, папку експорту та вимкнути автоматичний запуск цього навчання.",
      action:
        "Помічник завжди доступний через лампочку біля пошуку. Тепер можна починати власний список покупок.",
    },
  ],
  en: [],
  fr: [],
  es: [],
};

assistantStepsByLanguage.en = assistantStepsByLanguage.uk;
assistantStepsByLanguage.fr = assistantStepsByLanguage.uk;
assistantStepsByLanguage.es = assistantStepsByLanguage.uk;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCurrentDate(language: AppLanguage) {
  const locales: Record<AppLanguage, string> = {
    uk: "uk-UA",
    en: "en-US",
    fr: "fr-FR",
    es: "es-ES",
  };

  return new Intl.DateTimeFormat(locales[language], {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function formatCountUk(
  value: number,
  forms: [one: string, few: string, many: string],
) {
  const mod10 = value % 10;
  const mod100 = value % 100;
  const form =
    mod10 === 1 && mod100 !== 11
      ? forms[0]
      : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)
        ? forms[1]
        : forms[2];

  return `${value} ${form}`;
}

function addDaysToIso(value: string, days: number) {
  const date = new Date(value);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

function getDaysUntil(value: string) {
  const expiryDate = new Date(value);
  const today = new Date();

  expiryDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return Math.ceil((expiryDate.getTime() - today.getTime()) / 86_400_000);
}

function formatExpiryDate(value: string) {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatUnit(type: PriceType) {
  if (type === "kg") return "кг";
  if (type === "pack") return "уп.";
  return "шт.";
}

function getDefaultQuantity(type: PriceType) {
  if (type === "kg") return 0.5;
  return 1;
}

function getQuantityStep(type: PriceType) {
  if (type === "kg") return 0.1;
  return 1;
}

function getPriceTypeFromExternalUnit(unit: string): PriceType {
  const normalizedUnit = unit.toLowerCase();

  if (["kg", "kilo", "kilogram"].includes(normalizedUnit)) return "kg";
  if (["pack", "package"].includes(normalizedUnit)) return "pack";

  return "piece";
}

function isGeneratedProductImageUrl(url: string) {
  return url.startsWith("data:image/svg+xml");
}

function isCategoryImageUrl(url: string) {
  return url.startsWith("/category-images/");
}

function getCategoryImageUrl(category: string) {
  return categoryImages[category] ?? categoryImages["Інше"];
}

function getProductVisual(name: string, category: string) {
  const text = `${name} ${category}`.toLowerCase();
  const visuals = [
    {
      keywords: ["мороз", "пломбір", "ескімо", "ice cream", "gelato"],
      kind: "iceCream",
      label: "Морозиво",
      palette: ["#f9a8d4", "#7c3aed", "#fff7ed"],
    },
    {
      keywords: ["помід", "томат", "cherry"],
      kind: "tomato",
      label: "Помідори",
      palette: ["#fb7185", "#be123c", "#fff1f2"],
    },
    {
      keywords: ["огір", "cucumber"],
      kind: "cucumber",
      label: "Огірки",
      palette: ["#4ade80", "#15803d", "#f0fdf4"],
    },
    {
      keywords: ["авокад"],
      kind: "avocado",
      label: "Авокадо",
      palette: ["#84cc16", "#3f6212", "#f7fee7"],
    },
    {
      keywords: ["банан"],
      kind: "banana",
      label: "Банани",
      palette: ["#facc15", "#ca8a04", "#fefce8"],
    },
    {
      keywords: ["яблук", "apple"],
      kind: "apple",
      label: "Яблука",
      palette: ["#f87171", "#b91c1c", "#fff7ed"],
    },
    {
      keywords: ["йогур", "кефір", "молок", "сирок", "молоч"],
      kind: "milk",
      label: "Молочне",
      palette: ["#7dd3fc", "#0369a1", "#f0f9ff"],
    },
    {
      keywords: ["сир", "cheese"],
      kind: "cheese",
      label: "Сир",
      palette: ["#fbbf24", "#b45309", "#fffbeb"],
    },
    {
      keywords: ["кур", "філе", "м'яс", "мяс", "ковбас", "стейк"],
      kind: "fillet",
      label: "М'ясо",
      palette: ["#fb7185", "#9f1239", "#fff1f2"],
    },
    {
      keywords: ["риба", "лосось", "тунець", "fish"],
      kind: "fish",
      label: "Риба",
      palette: ["#38bdf8", "#0369a1", "#ecfeff"],
    },
    {
      keywords: ["вода", "мінерал", "напій", "сік", "cola", "кола"],
      kind: "water",
      label: "Напій",
      palette: ["#22d3ee", "#0e7490", "#ecfeff"],
    },
    {
      keywords: ["хліб", "булк", "батон", "лаваш"],
      kind: "bread",
      label: "Хліб",
      palette: ["#f59e0b", "#92400e", "#fffbeb"],
    },
    {
      keywords: ["яйц"],
      kind: "egg",
      label: "Яйця",
      palette: ["#e5e7eb", "#64748b", "#f8fafc"],
    },
    {
      keywords: ["кава", "coffee"],
      kind: "coffee",
      label: "Кава",
      palette: ["#a16207", "#451a03", "#fef3c7"],
    },
    {
      keywords: ["чай", "tea"],
      kind: "tea",
      label: "Чай",
      palette: ["#86efac", "#166534", "#f0fdf4"],
    },
    {
      keywords: ["шоколад", "печив", "цукер", "снек", "чипс"],
      kind: "snack",
      label: "Снеки",
      palette: ["#c084fc", "#6d28d9", "#faf5ff"],
    },
    {
      keywords: ["заморож", "лід", "ice"],
      kind: "frozen",
      label: "Заморожене",
      palette: ["#67e8f9", "#0891b2", "#ecfeff"],
    },
    {
      keywords: ["паста", "макарон", "спагеті"],
      kind: "pasta",
      label: "Паста",
      palette: ["#fbbf24", "#b45309", "#fffbeb"],
    },
    {
      keywords: ["піца"],
      kind: "pizza",
      label: "Піца",
      palette: ["#fb923c", "#c2410c", "#fff7ed"],
    },
    {
      keywords: ["салат", "зелень", "рукол", "шпинат"],
      kind: "greens",
      label: "Зелень",
      palette: ["#5ee4a8", "#0f766e", "#f8fafc"],
    },
  ];

  return (
    visuals.find((visual) =>
      visual.keywords.some((keyword) => text.includes(keyword)),
    ) ?? {
      kind: "generic",
      label: "Продукт",
      palette: ["#94a3b8", "#334155", "#f8fafc"],
    }
  );
}

function renderGeneratedProductShape(
  kind: string,
  primary: string,
  secondary: string,
) {
  switch (kind) {
    case "bread":
      return `
        <path d="M250 505 C250 372 335 292 455 292 C575 292 650 374 650 505 C650 568 608 610 545 610 L355 610 C292 610 250 568 250 505 Z" fill="#d99031"/>
        <path d="M282 500 C282 400 350 332 454 332 C556 332 618 402 618 500 C618 539 590 565 548 565 L354 565 C312 565 282 539 282 500 Z" fill="#f2bd68"/>
        <path d="M367 382 C338 418 322 464 321 525" fill="none" stroke="#b66a1f" stroke-width="18" stroke-linecap="round"/>
        <path d="M454 360 C434 410 427 462 430 526" fill="none" stroke="#b66a1f" stroke-width="18" stroke-linecap="round"/>
        <path d="M539 384 C562 423 574 468 574 526" fill="none" stroke="#b66a1f" stroke-width="18" stroke-linecap="round"/>
      `;
    case "water":
      return `
        <rect x="382" y="212" width="136" height="70" rx="20" fill="#7dd3fc"/>
        <rect x="355" y="265" width="190" height="398" rx="62" fill="#e0f7ff" stroke="#38bdf8" stroke-width="18"/>
        <path d="M374 430 C420 392 482 390 526 426 L526 602 C486 632 414 633 374 600 Z" fill="#67e8f9" opacity="0.9"/>
        <rect x="389" y="326" width="122" height="56" rx="18" fill="#ffffff"/>
        <path d="M400 518 C440 544 480 544 520 518" fill="none" stroke="#0ea5e9" stroke-width="14" stroke-linecap="round"/>
      `;
    case "fillet":
      return `
        <path d="M245 497 C245 392 345 315 472 322 C590 329 668 411 644 516 C620 620 485 657 359 623 C290 604 245 557 245 497 Z" fill="#fb9bad"/>
        <path d="M290 497 C292 432 360 380 455 382 C548 384 607 442 593 512 C578 584 482 612 386 591 C328 578 289 544 290 497 Z" fill="#ffd1da"/>
        <path d="M365 456 C430 420 510 430 556 488" fill="none" stroke="#f47286" stroke-width="20" stroke-linecap="round" opacity="0.75"/>
        <path d="M338 544 C410 574 496 570 555 525" fill="none" stroke="#f47286" stroke-width="16" stroke-linecap="round" opacity="0.55"/>
      `;
    case "apple":
      return `
        <path d="M450 306 C463 260 503 232 548 236" fill="none" stroke="#166534" stroke-width="20" stroke-linecap="round"/>
        <path d="M475 276 C526 247 588 263 614 310 C558 334 511 323 475 276 Z" fill="#22c55e"/>
        <path d="M450 356 C503 301 630 337 641 471 C651 597 552 680 450 624 C348 680 249 597 259 471 C270 337 397 301 450 356 Z" fill="#ef4444"/>
        <path d="M450 356 C486 319 548 326 582 378 C534 360 490 372 450 410 Z" fill="#f87171" opacity="0.75"/>
        <circle cx="390" cy="460" r="38" fill="#ffffff" opacity="0.2"/>
      `;
    case "tomato":
      return `
        <circle cx="450" cy="472" r="176" fill="#ef4444"/>
        <path d="M450 288 L483 360 L560 326 L515 390 L592 405 L508 432 L540 502 L450 452 L360 502 L392 432 L308 405 L385 390 L340 326 L417 360 Z" fill="#22c55e"/>
        <circle cx="388" cy="420" r="42" fill="#ffffff" opacity="0.2"/>
      `;
    case "iceCream":
      return `
        <path d="M370 488 L530 488 L481 666 C472 699 428 699 419 666 Z" fill="#d6a05f"/>
        <path d="M395 528 L505 640 M505 528 L395 640" stroke="#b7793c" stroke-width="14" stroke-linecap="round"/>
        <circle cx="450" cy="372" r="110" fill="#f9a8d4"/>
        <path d="M345 417 C342 486 558 486 555 417 C535 469 365 469 345 417 Z" fill="#fbcfe8"/>
        <circle cx="406" cy="334" r="30" fill="#ffffff" opacity="0.28"/>
      `;
    case "milk":
      return `
        <path d="M360 262 L408 212 L492 212 L540 262 L540 648 C540 674 519 694 493 694 L407 694 C381 694 360 674 360 648 Z" fill="#f8fafc" stroke="#7dd3fc" stroke-width="18"/>
        <path d="M382 342 L518 342 L518 536 L382 536 Z" fill="#bae6fd"/>
        <path d="M382 468 C418 442 482 442 518 468 L518 536 L382 536 Z" fill="#38bdf8"/>
        <path d="M410 258 L490 258" stroke="#0ea5e9" stroke-width="16" stroke-linecap="round"/>
      `;
    case "cheese":
      return `
        <path d="M270 555 L600 350 L654 604 Z" fill="#facc15" stroke="#d97706" stroke-width="18" stroke-linejoin="round"/>
        <circle cx="525" cy="500" r="34" fill="#fef3c7"/>
        <circle cx="590" cy="572" r="24" fill="#fef3c7"/>
        <circle cx="440" cy="522" r="20" fill="#fef3c7"/>
      `;
    case "fish":
      return `
        <path d="M258 468 C356 348 526 346 632 468 C526 590 356 588 258 468 Z" fill="#38bdf8"/>
        <path d="M632 468 L728 382 L728 554 Z" fill="#0ea5e9"/>
        <circle cx="380" cy="438" r="18" fill="#0f172a"/>
        <path d="M450 382 C488 428 488 508 450 554" fill="none" stroke="#e0f2fe" stroke-width="16" stroke-linecap="round"/>
      `;
    case "cucumber":
      return `
        <path d="M294 534 C234 468 270 374 366 344 L604 270 C658 254 710 292 716 348 C722 404 682 452 628 468 L390 542 C352 554 319 551 294 534 Z" fill="#22c55e"/>
        <path d="M350 493 L638 400" stroke="#86efac" stroke-width="22" stroke-linecap="round" opacity="0.7"/>
        <circle cx="386" cy="430" r="12" fill="#dcfce7"/>
        <circle cx="486" cy="398" r="12" fill="#dcfce7"/>
        <circle cx="586" cy="366" r="12" fill="#dcfce7"/>
      `;
    case "avocado":
      return `
        <path d="M450 232 C564 316 627 478 545 616 C496 699 404 699 355 616 C273 478 336 316 450 232 Z" fill="#65a30d"/>
        <path d="M450 306 C526 376 565 490 510 588 C478 646 422 646 390 588 C335 490 374 376 450 306 Z" fill="#d9f99d"/>
        <circle cx="450" cy="520" r="58" fill="#92400e"/>
      `;
    case "banana":
      return `
        <path d="M248 505 C410 690 642 652 724 428 C622 550 438 590 298 440 Z" fill="#facc15" stroke="#ca8a04" stroke-width="20" stroke-linejoin="round"/>
        <path d="M286 454 C420 560 590 538 694 420" fill="none" stroke="#fde68a" stroke-width="24" stroke-linecap="round"/>
      `;
    case "egg":
      return `
        <path d="M450 232 C548 232 614 356 614 500 C614 621 546 696 450 696 C354 696 286 621 286 500 C286 356 352 232 450 232 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="18"/>
        <ellipse cx="410" cy="384" rx="46" ry="62" fill="#ffffff" opacity="0.8"/>
      `;
    case "coffee":
      return `
        <path d="M320 364 H548 V508 C548 576 493 632 425 632 H410 C342 632 288 576 288 508 V396 C288 378 302 364 320 364 Z" fill="#92400e"/>
        <path d="M548 414 H596 C640 414 670 446 670 486 C670 526 640 558 596 558 H548" fill="none" stroke="#92400e" stroke-width="34" stroke-linecap="round"/>
        <path d="M350 318 C330 286 372 268 352 236 M432 318 C412 286 454 268 434 236 M514 318 C494 286 536 268 516 236" fill="none" stroke="#d6a05f" stroke-width="16" stroke-linecap="round"/>
      `;
    case "tea":
      return `
        <path d="M320 400 H552 V520 C552 590 496 646 426 646 H402 C332 646 276 590 276 520 V444 C276 420 296 400 320 400 Z" fill="#86efac"/>
        <path d="M552 440 H600 C638 440 666 468 666 504 C666 540 638 568 600 568 H552" fill="none" stroke="#16a34a" stroke-width="30" stroke-linecap="round"/>
        <path d="M340 490 C388 462 448 462 520 494" fill="none" stroke="#166534" stroke-width="18" stroke-linecap="round"/>
      `;
    case "snack":
      return `
        <rect x="300" y="310" width="300" height="300" rx="42" fill="#7c3aed"/>
        <rect x="340" y="350" width="220" height="220" rx="28" fill="#c084fc"/>
        <path d="M350 430 H550 M350 492 H550" stroke="#f5d0fe" stroke-width="18" stroke-linecap="round"/>
      `;
    case "frozen":
      return `
        <rect x="312" y="300" width="276" height="276" rx="54" fill="#cffafe" stroke="#22d3ee" stroke-width="18"/>
        <path d="M360 450 H540 M450 360 V540 M385 385 L515 515 M515 385 L385 515" stroke="#0891b2" stroke-width="18" stroke-linecap="round"/>
      `;
    case "pasta":
      return `
        <path d="M302 506 C330 382 570 382 598 506 C610 588 534 648 450 648 C366 648 290 588 302 506 Z" fill="#fef3c7" stroke="#f59e0b" stroke-width="18"/>
        <path d="M350 504 C390 460 420 552 450 504 C480 456 512 552 552 504" fill="none" stroke="#d97706" stroke-width="18" stroke-linecap="round"/>
      `;
    case "pizza":
      return `
        <path d="M450 246 L646 626 H254 Z" fill="#fbbf24" stroke="#d97706" stroke-width="18" stroke-linejoin="round"/>
        <path d="M310 602 H590" stroke="#b45309" stroke-width="32" stroke-linecap="round"/>
        <circle cx="445" cy="430" r="24" fill="#ef4444"/>
        <circle cx="520" cy="540" r="24" fill="#ef4444"/>
        <circle cx="386" cy="540" r="20" fill="#22c55e"/>
      `;
    case "greens":
      return `
        <path d="M450 634 C374 548 342 430 382 314 C456 366 492 480 450 634 Z" fill="#22c55e"/>
        <path d="M450 634 C526 548 558 430 518 314 C444 366 408 480 450 634 Z" fill="#16a34a"/>
        <path d="M450 634 C450 520 450 412 450 324" stroke="#166534" stroke-width="16" stroke-linecap="round"/>
      `;
    default:
      return `
        <path d="M306 554 C306 436 368 346 450 346 C532 346 594 436 594 554 C594 616 548 654 450 654 C352 654 306 616 306 554 Z" fill="${primary}"/>
        <circle cx="405" cy="458" r="36" fill="#ffffff" opacity="0.24"/>
        <path d="M372 570 C420 600 492 600 540 570" fill="none" stroke="${secondary}" stroke-width="18" stroke-linecap="round" opacity="0.7"/>
      `;
  }
}

function getGeneratedProductImage(name: string, category: string) {
  const title = name.trim() || "Новий продукт";
  const subtitle = category.trim() || "Smart Grocery";
  const visual = getProductVisual(title, subtitle);
  const [primary, secondary] = visual.palette;
  const shape = renderGeneratedProductShape(visual.kind, primary, secondary);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
      <defs>
        <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="18" stdDeviation="24" flood-color="#020617" flood-opacity="0.12"/>
        </filter>
      </defs>
      <rect width="900" height="900" rx="56" fill="#f8fafc"/>
      <g filter="url(#shadow)">
        ${shape}
      </g>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  try {
    return JSON.stringify(error);
  } catch {
    return fallback;
  }
}

function getStoreName(stores: Store[], storeId: string) {
  return stores.find((store) => store.id === storeId)?.name ?? storeId;
}

function getPricesForProduct(
  productId: string,
  prices: ProductPrice[],
  selectedStoreIds: string[],
) {
  return prices
    .filter(
      (price) =>
        price.productId === productId && selectedStoreIds.includes(price.storeId),
    )
    .sort((a, b) => a.price - b.price);
}

function getBestPrice(
  product: Product,
  prices: ProductPrice[],
  selectedStoreIds: string[],
): ProductPrice | null {
  return getPricesForProduct(product.id, prices, selectedStoreIds)[0] ?? null;
}

function productHasDiscount(
  productId: string,
  prices: ProductPrice[],
  selectedStoreIds: string[],
) {
  return prices.some(
    (price) =>
      price.productId === productId &&
      selectedStoreIds.includes(price.storeId) &&
      price.isDiscount,
  );
}

function productMatchesImageFilter(product: Product, filter: ImageFilter) {
  if (filter === "with") return Boolean(product.imageUrl);
  if (filter === "without") return !product.imageUrl;

  return true;
}

function getDisplayPrice(product: Product, bestPrice: ProductPrice | null) {
  return bestPrice?.price ?? product.price;
}

function calculateLineTotal(
  product: Product,
  quantity: number,
  bestPrice: ProductPrice | null,
) {
  return getDisplayPrice(product, bestPrice) * quantity;
}

function getWeekDayTotal(
  day: WeekPlanDay,
  products: Product[],
  prices: ProductPrice[],
  selectedStoreIds: string[],
) {
  return day.items.reduce((sum, item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    if (!product) return sum;

    return (
      sum +
      calculateLineTotal(
        product,
        item.quantity,
        getBestPrice(product, prices, selectedStoreIds),
      )
    );
  }, 0);
}

function mergeShoppingLines(
  currentLines: ShoppingLine[],
  additions: WeekPlanItem[],
) {
  const lineMap = new Map(
    currentLines.map((line) => [line.productId, line.quantity]),
  );

  for (const item of additions) {
    lineMap.set(
      item.productId,
      Number(((lineMap.get(item.productId) ?? 0) + item.quantity).toFixed(2)),
    );
  }

  return Array.from(lineMap.entries()).map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
}

function getCategorySpend(
  products: Product[],
  lines: ShoppingLine[],
  prices: ProductPrice[],
  selectedStoreIds: string[],
) {
  const totals = new Map<string, number>();

  for (const line of lines) {
    const product = products.find((item) => item.id === line.productId);
    if (!product) continue;

    const bestPrice = getBestPrice(product, prices, selectedStoreIds);

    totals.set(
      product.category,
      (totals.get(product.category) ?? 0) +
        calculateLineTotal(product, line.quantity, bestPrice),
    );
  }

  return Array.from(totals.entries()).map(([category, amount], index) => ({
    category,
    amount,
    color:
      [
        "bg-emerald-400",
        "bg-sky-300",
        "bg-rose-300",
        "bg-cyan-300",
        "bg-amber-300",
        "bg-violet-300",
      ][index] ?? "bg-slate-300",
  }));
}

function getStoreTotals(
  stores: Store[],
  lines: ShoppingLine[],
  prices: ProductPrice[],
) {
  return stores.map((store) => {
    let total = 0;
    let missingCount = 0;

    for (const line of lines) {
      const price = prices.find(
        (item) => item.productId === line.productId && item.storeId === store.id,
      );

      if (!price) {
        missingCount += 1;
        continue;
      }

      total += price.price * line.quantity;
    }

    return { store, total, missingCount };
  });
}

function buildShoppingRoute(
  id: string,
  label: string,
  description: string,
  allowedStoreIds: string[],
  stores: Store[],
  products: Product[],
  lines: ShoppingLine[],
  prices: ProductPrice[],
): ShoppingRoute {
  const items: ShoppingRouteItem[] = [];
  const missingProductIds: string[] = [];

  for (const line of lines) {
    const product = products.find((item) => item.id === line.productId);
    if (!product) continue;

    const bestPrice = prices
      .filter(
        (price) =>
          price.productId === line.productId &&
          allowedStoreIds.includes(price.storeId),
      )
      .sort((a, b) => a.price - b.price)[0];
    const store = bestPrice
      ? stores.find((item) => item.id === bestPrice.storeId)
      : null;

    if (!bestPrice || !store) {
      missingProductIds.push(line.productId);
      continue;
    }

    items.push({
      product,
      quantity: line.quantity,
      price: bestPrice,
      store,
      total: bestPrice.price * line.quantity,
    });
  }

  return {
    id,
    label,
    description,
    storeIds: Array.from(new Set(items.map((item) => item.store.id))),
    items,
    total: items.reduce((sum, item) => sum + item.total, 0),
    missingProductIds,
  };
}

function getBestRoute(routes: ShoppingRoute[]) {
  return routes
    .filter((route) => route.missingProductIds.length === 0)
    .sort((a, b) => a.total - b.total)[0] ?? null;
}

function getStorePairs(storeIds: string[]) {
  const pairs: string[][] = [];

  for (let first = 0; first < storeIds.length; first += 1) {
    pairs.push([storeIds[first]]);
    for (let second = first + 1; second < storeIds.length; second += 1) {
      pairs.push([storeIds[first], storeIds[second]]);
    }
  }

  return pairs;
}

function App() {
  const [activeSection, setActiveSection] = useState("Огляд");
  const [settings, setSettings] = useState<AppSettings>(loadAppSettings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsStatus, setSettingsStatus] = useState("");
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantStep, setAssistantStep] = useState(0);
  const [routeStatus, setRouteStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [showDiscountsOnly, setShowDiscountsOnly] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [productImageFilter, setProductImageFilter] =
    useState<ImageFilter>("all");
  const [stores, setStores] = useState<Store[]>(initialStores);
  const [selectedStoreIds, setSelectedStoreIds] = useState(
    initialStores.map((store) => store.id),
  );
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [productPrices, setProductPrices] =
    useState<ProductPrice[]>(initialProductPrices);
  const [shoppingLines, setShoppingLines] =
    useState<ShoppingLine[]>(initialShoppingLines);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [weeklyPlan, setWeeklyPlan] = useState<WeekPlanDay[]>(() =>
    initialWeeklyPlan.map((day) => ({
      ...day,
      items: day.items.map((item) => ({ ...item })),
    })),
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);
  const [isWeeklyPlanLoaded, setIsWeeklyPlanLoaded] = useState(false);
  const [databaseError, setDatabaseError] = useState("");
  const [draftName, setDraftName] = useState("");
  const [draftCategory, setDraftCategory] = useState("Овочі та фрукти");
  const [draftSubcategory, setDraftSubcategory] = useState("Нова позиція");
  const [draftPrice, setDraftPrice] = useState("100");
  const [draftPriceType, setDraftPriceType] = useState<PriceType>("piece");
  const [draftStore, setDraftStore] = useState("Сільпо");
  const [draftImageUrl, setDraftImageUrl] = useState("");
  const [isDraftImageGenerating, setIsDraftImageGenerating] = useState(false);
  const [draftImageStatus, setDraftImageStatus] = useState(
    "Обери ШІ по категорії або встав URL фото з інтернету.",
  );
  const [draftExpiresIn, setDraftExpiresIn] = useState("14");
  const [liveSearchQuery, setLiveSearchQuery] = useState("помідори");
  const [liveSearchResults, setLiveSearchResults] = useState<
    ExternalStoreProduct[]
  >([]);
  const [isLiveSearchLoading, setIsLiveSearchLoading] = useState(false);
  const [liveSearchStatus, setLiveSearchStatus] = useState(
    "Novus/Zakaz API готовий до пошуку",
  );
  const [lastLiveSearchSync, setLastLiveSearchSync] = useState("");

  useEffect(() => {
    saveAppSettings(settings);
    return observeUiLanguage(settings.language);
  }, [settings]);

  useEffect(() => {
    document.documentElement.classList.remove(
      "theme-light",
      "theme-dark",
      "theme-standard",
      "dark",
    );
    document.documentElement.classList.add(
      settings.theme === "light" ? "theme-light" : "dark",
      `theme-${settings.theme}`,
    );
  }, [settings.theme]);

  useEffect(() => {
    if (!settings.assistantEnabled || settings.onboardingCompleted) return;

    const timeout = window.setTimeout(() => {
      setAssistantStep(0);
      setIsAssistantOpen(true);
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [settings.assistantEnabled, settings.onboardingCompleted]);

  useEffect(() => {
    if (!isAssistantOpen) return;

    const step = assistantStepsByLanguage[settings.language][assistantStep];
    if (step?.section && step.section !== activeSection) {
      setActiveSection(step.section);
    }

    setIsAddDialogOpen(false);
    setIsSettingsOpen(false);
    document
      .querySelector('[data-tour="app-content"]')
      ?.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeSection, assistantStep, isAssistantOpen, settings.language]);

  useEffect(() => {
    let isMounted = true;

    async function loadDatabaseState() {
      try {
        await initializeDatabase();
        const [
          storedStores,
          storedProducts,
          storedPrices,
          storedLines,
          storedWeeklyPlan,
          storedPurchases,
        ] =
          await Promise.all([
            loadStores(),
            loadProducts(),
            loadProductPrices(),
            loadShoppingLines(),
            loadWeeklyPlan(),
            loadPurchases(),
          ]);

        if (!isMounted) return;

        setStores(storedStores);
        setSelectedStoreIds(storedStores.map((store) => store.id));
        setProducts(storedProducts);
        setProductPrices(storedPrices);
        setShoppingLines(storedLines);
        setWeeklyPlan(storedWeeklyPlan);
        setPurchases(storedPurchases);
        setIsWeeklyPlanLoaded(true);
        setDatabaseError("");
      } catch (error) {
        if (!isMounted) return;

        setDatabaseError(getErrorMessage(error, "Не вдалося відкрити SQLite"));
      } finally {
        if (isMounted) setIsDatabaseReady(true);
      }
    }

    void loadDatabaseState();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isWeeklyPlanLoaded) return;

    const saveTimeout = window.setTimeout(() => {
      void Promise.all(
        weeklyPlan.map((day, index) => saveWeekPlanDay(day, index)),
      ).catch((error) => {
        setDatabaseError(
          getErrorMessage(error, "Не вдалося зберегти план тижня"),
        );
      });
    }, 300);

    return () => window.clearTimeout(saveTimeout);
  }, [isWeeklyPlanLoaded, weeklyPlan]);

  const visibleProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products.filter((product) =>
      (!query ||
        [product.name, product.category, product.subcategory, product.store]
          .join(" ")
          .toLowerCase()
          .includes(query)) &&
      (productCategoryFilter === "all" ||
        product.category === productCategoryFilter) &&
      (!showFavoritesOnly || product.favorite) &&
      (!showDiscountsOnly ||
        productHasDiscount(product.id, productPrices, selectedStoreIds)) &&
      productMatchesImageFilter(product, productImageFilter),
    );
  }, [
    productCategoryFilter,
    productImageFilter,
    productPrices,
    products,
    searchQuery,
    selectedStoreIds,
    showDiscountsOnly,
    showFavoritesOnly,
  ]);

  const shoppingItems = useMemo(
    () =>
      shoppingLines.reduce<ShoppingItem[]>((items, line) => {
          const product = products.find((item) => item.id === line.productId);
          if (!product) return items;

          const bestPrice = getBestPrice(
            product,
            productPrices,
            selectedStoreIds,
          );

          items.push({
            ...line,
            product,
            bestPrice,
            bestStore: bestPrice
              ? stores.find((store) => store.id === bestPrice.storeId) ?? null
              : null,
          });

          return items;
        }, []),
    [products, productPrices, selectedStoreIds, shoppingLines, stores],
  );

  const listTotal = useMemo(
    () =>
      shoppingItems.reduce(
        (sum, item) =>
          sum + calculateLineTotal(item.product, item.quantity, item.bestPrice),
        0,
      ),
    [shoppingItems],
  );

  const expiryItems = useMemo(
    () =>
      purchases
        .flatMap((purchase) =>
          purchase.items.map((item) => ({
            purchaseId: purchase.id,
            purchasedAt: purchase.purchasedAt,
            item,
          })),
        )
        .filter((entry) => !entry.item.consumed && entry.item.expiresAt)
        .sort(
          (a, b) =>
            new Date(a.item.expiresAt ?? 0).getTime() -
            new Date(b.item.expiresAt ?? 0).getTime(),
        ),
    [purchases],
  );

  const categorySpend = useMemo(
    () => getCategorySpend(products, shoppingLines, productPrices, selectedStoreIds),
    [products, productPrices, selectedStoreIds, shoppingLines],
  );
  const expiredItemCount = expiryItems.filter(
    (entry) => getDaysUntil(entry.item.expiresAt ?? "") < 0,
  ).length;
  const expiringSoonCount = expiryItems.filter((entry) => {
    const days = getDaysUntil(entry.item.expiresAt ?? "");
    return days >= 0 && days <= 3;
  }).length;
  const nextExpiryItem = expiryItems[0];

  const storeTotals = useMemo(
    () => getStoreTotals(stores, shoppingLines, productPrices),
    [productPrices, shoppingLines, stores],
  );
  const shoppingRoutes = useMemo(() => {
    const oneStoreRoutes = selectedStoreIds.map((storeId) => {
      const store = stores.find((item) => item.id === storeId);
      return buildShoppingRoute(
        `single-${storeId}`,
        store?.name ?? storeId,
        "Уся покупка в одному магазині",
        [storeId],
        stores,
        products,
        shoppingLines,
        productPrices,
      );
    });
    const pairRoutes = getStorePairs(selectedStoreIds).map((storeIds) =>
      buildShoppingRoute(
        `pair-${storeIds.join("-")}`,
        storeIds
          .map((storeId) => stores.find((store) => store.id === storeId)?.name)
          .filter(Boolean)
          .join(" + "),
        "Оптимальний розподіл максимум між двома магазинами",
        storeIds,
        stores,
        products,
        shoppingLines,
        productPrices,
      ),
    );
    const allStoresRoute = buildShoppingRoute(
      "all-selected",
      "Найнижча ціна кожного товару",
      "Розподіл між усіма вибраними магазинами",
      selectedStoreIds,
      stores,
      products,
      shoppingLines,
      productPrices,
    );

    return {
      bestSingle: getBestRoute(oneStoreRoutes),
      bestTwo: getBestRoute(pairRoutes),
      allStores: allStoresRoute,
    };
  }, [
    productPrices,
    products,
    selectedStoreIds,
    shoppingLines,
    stores,
  ]);

  const selectedStoreTotals = storeTotals
    .filter((item) => selectedStoreIds.includes(item.store.id))
    .sort((a, b) => a.total - b.total);
  const bestStoreTotal = selectedStoreTotals[0];
  const worstStoreTotal = selectedStoreTotals[selectedStoreTotals.length - 1];
  const potentialSavings =
    bestStoreTotal && worstStoreTotal
      ? Math.max(0, worstStoreTotal.total - bestStoreTotal.total)
      : 0;

  const weekBudget = weeklyPlan.reduce((sum, day) => sum + day.budget, 0);
  const weekPlanned = weeklyPlan.reduce(
    (sum, day) =>
      sum + getWeekDayTotal(day, products, productPrices, selectedStoreIds),
    0,
  );
  const weeklySpendData = weeklyPlan.map((day) => ({
    day: day.day,
    budget: day.budget,
    planned: Math.round(
      getWeekDayTotal(day, products, productPrices, selectedStoreIds),
    ),
  }));
  const maxCategorySpend = Math.max(
    1,
    ...categorySpend.map((item) => item.amount),
  );
  const activeProductFilterCount =
    (productCategoryFilter !== "all" ? 1 : 0) +
    (showDiscountsOnly ? 1 : 0) +
    (showFavoritesOnly ? 1 : 0) +
    (productImageFilter !== "all" ? 1 : 0);

  function toggleStore(storeId: string) {
    setSelectedStoreIds((current) => {
      if (current.includes(storeId)) {
        return current.length === 1
          ? stores.map((store) => store.id)
          : current.filter((id) => id !== storeId);
      }

      return [...current, storeId];
    });
  }

  function applyShoppingRoute(route: ShoppingRoute) {
    if (!route.storeIds.length || route.missingProductIds.length) return;

    setSelectedStoreIds(route.storeIds);
    setRouteStatus(
      `Застосовано маршрут: ${route.storeIds
        .map((storeId) => stores.find((store) => store.id === storeId)?.name)
        .filter(Boolean)
        .join(" + ")}`,
    );
    setActiveSection("Шоп-ліст");
  }

  function resetProductFilters() {
    setProductCategoryFilter("all");
    setShowDiscountsOnly(false);
    setShowFavoritesOnly(false);
    setProductImageFilter("all");
  }

  function updateSetting<Key extends keyof AppSettings>(
    key: Key,
    value: AppSettings[Key],
  ) {
    setSettings((current) => ({ ...current, [key]: value }));
    setSettingsStatus("Налаштування збережено");
  }

  async function chooseExportDirectory() {
    setSettingsStatus("Відкриваю вибір папки...");

    try {
      const directory = await selectExportDirectory();
      if (directory) {
        updateSetting("exportDirectory", directory);
        setSettingsStatus(`Папка експорту: ${directory}`);
      } else {
        setSettingsStatus("Вибір папки скасовано");
      }
    } catch (error) {
      setSettingsStatus(getErrorMessage(error, "Не вдалося вибрати папку"));
    }
  }

  function resetExportDirectory() {
    updateSetting("exportDirectory", defaultSettings.exportDirectory);
    setSettingsStatus("Експорт зберігатиметься у Windows Downloads");
  }

  function startAssistant() {
    setIsSettingsOpen(false);
    setAssistantStep(0);
    setIsAssistantOpen(true);
  }

  function closeAssistant() {
    setIsAssistantOpen(false);
    setSettings((current) => ({
      ...current,
      onboardingCompleted: true,
    }));
  }

  function addProductToWeekDay(dayName: string, productId: string) {
    const product = products.find((item) => item.id === productId);
    if (!product) return;

    setWeeklyPlan((current) =>
      current.map((day) => {
        if (day.day !== dayName) return day;

        const existingItem = day.items.find((item) => item.productId === productId);
        if (existingItem) {
          return {
            ...day,
            items: day.items.map((item) =>
              item.productId === productId
                ? {
                    ...item,
                    quantity: Number(
                      (item.quantity + getQuantityStep(product.priceType)).toFixed(2),
                    ),
                  }
                : item,
            ),
          };
        }

        return {
          ...day,
          items: [
            ...day.items,
            {
              productId,
              quantity: getDefaultQuantity(product.priceType),
            },
          ],
        };
      }),
    );
  }

  function updateWeekPlanQuantity(
    dayName: string,
    product: Product,
    direction: "increase" | "decrease",
  ) {
    setWeeklyPlan((current) =>
      current.map((day) => {
        if (day.day !== dayName) return day;

        return {
          ...day,
          items: day.items.flatMap((item) => {
            if (item.productId !== product.id) return [item];

            const step = getQuantityStep(product.priceType);
            const nextQuantity =
              direction === "increase"
                ? item.quantity + step
                : item.quantity - step;

            if (nextQuantity <= 0) return [];

            return [{ ...item, quantity: Number(nextQuantity.toFixed(2)) }];
          }),
        };
      }),
    );
  }

  function removeWeekPlanItem(dayName: string, productId: string) {
    setWeeklyPlan((current) =>
      current.map((day) =>
        day.day === dayName
          ? {
              ...day,
              items: day.items.filter((item) => item.productId !== productId),
            }
          : day,
      ),
    );
  }

  function updateWeekPlanBudget(dayName: string, budget: number) {
    setWeeklyPlan((current) =>
      current.map((day) =>
        day.day === dayName ? { ...day, budget: Math.max(0, budget) } : day,
      ),
    );
  }

  function addWeekDayToShoppingList(dayName: string) {
    const day = weeklyPlan.find((item) => item.day === dayName);
    if (!day || !day.items.length) return;

    const nextLines = mergeShoppingLines(shoppingLines, day.items);
    setShoppingLines(nextLines);

    void Promise.all(nextLines.map((line) => saveShoppingLine(line))).catch(
      (error) => {
        setDatabaseError(
          getErrorMessage(error, "Не вдалося перенести день у шоп-ліст"),
        );
      },
    );
  }

  function persistShoppingLine(line: ShoppingLine) {
    void saveShoppingLine(line).catch((error) => {
      setDatabaseError(getErrorMessage(error, "Не вдалося зберегти шоп-ліст"));
    });
  }

  function addProductToList(product: Product) {
    const step = getDefaultQuantity(product.priceType);
    const existing = shoppingLines.find((line) => line.productId === product.id);
    const nextLine = {
      productId: product.id,
      quantity: existing ? Number((existing.quantity + step).toFixed(2)) : step,
    };

    setShoppingLines((current) => {
      if (current.some((line) => line.productId === product.id)) {
        return current.map((line) =>
          line.productId === product.id ? nextLine : line,
        );
      }

      return [...current, nextLine];
    });
    persistShoppingLine(nextLine);
  }

  function updateQuantity(product: Product, direction: "increase" | "decrease") {
    const currentLine = shoppingLines.find((line) => line.productId === product.id);
    if (!currentLine) return;

    const step = getQuantityStep(product.priceType);
    const nextQuantity =
      direction === "increase"
        ? currentLine.quantity + step
        : currentLine.quantity - step;

    if (nextQuantity <= 0) {
      removeLine(product.id);
      return;
    }

    const nextLine = {
      productId: product.id,
      quantity: Number(nextQuantity.toFixed(2)),
    };

    setShoppingLines((current) =>
      current.map((line) => (line.productId === product.id ? nextLine : line)),
    );
    persistShoppingLine(nextLine);
  }

  function removeLine(productId: string) {
    setShoppingLines((current) =>
      current.filter((line) => line.productId !== productId),
    );
    void deleteShoppingLine(productId).catch((error) => {
      setDatabaseError(getErrorMessage(error, "Не вдалося видалити позицію"));
    });
  }

  async function completeShoppingList() {
    if (!shoppingItems.length) return;

    const purchasedAt = new Date().toISOString();
    const purchase: Purchase = {
      id: crypto.randomUUID(),
      purchasedAt,
      total: listTotal,
      items: shoppingItems.map((item) => {
        const unitPrice = getDisplayPrice(item.product, item.bestPrice);

        return {
          productId: item.product.id,
          productName: item.product.name,
          category: item.product.category,
          priceType: item.product.priceType,
          quantity: item.quantity,
          unitPrice,
          total: calculateLineTotal(item.product, item.quantity, item.bestPrice),
          storeId: item.bestStore?.id ?? null,
          storeName: item.bestStore?.name ?? item.product.store,
          expiresAt: addDaysToIso(purchasedAt, item.product.expiresIn),
          consumed: false,
        };
      }),
    };

    try {
      await savePurchase(purchase);
      await clearShoppingLines();
      setPurchases((current) => [purchase, ...current]);
      setShoppingLines([]);
      setDatabaseError("");
      setActiveSection("Історія");
    } catch (error) {
      setDatabaseError(
        getErrorMessage(error, "Не вдалося завершити та зберегти покупку"),
      );
    }
  }

  function repeatPurchase(purchase: Purchase) {
    const additions = purchase.items
      .filter((item) => products.some((product) => product.id === item.productId))
      .map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));
    const nextLines = mergeShoppingLines(shoppingLines, additions);

    setShoppingLines(nextLines);
    setActiveSection("Шоп-ліст");
    void Promise.all(nextLines.map((line) => saveShoppingLine(line))).catch(
      (error) => {
        setDatabaseError(
          getErrorMessage(error, "Не вдалося повторити минулу покупку"),
        );
      },
    );
  }

  async function togglePurchaseItemConsumed(
    purchaseId: string,
    productId: string,
    consumed: boolean,
  ) {
    try {
      await updatePurchaseItemConsumed(purchaseId, productId, consumed);
      setPurchases((current) =>
        current.map((purchase) =>
          purchase.id === purchaseId
            ? {
                ...purchase,
                items: purchase.items.map((item) =>
                  item.productId === productId ? { ...item, consumed } : item,
                ),
              }
            : purchase,
        ),
      );
      setDatabaseError("");
    } catch (error) {
      setDatabaseError(
        getErrorMessage(error, "Не вдалося оновити статус продукту"),
      );
    }
  }

  function toggleFavorite(productId: string) {
    const nextProducts = products.map((product) =>
      product.id === productId
        ? { ...product, favorite: !product.favorite }
        : product,
    );
    const changedProduct = nextProducts.find((product) => product.id === productId);

    setProducts(nextProducts);

    if (changedProduct) {
      void saveProduct(changedProduct).catch((error) => {
        setDatabaseError(getErrorMessage(error, "Не вдалося зберегти обране"));
      });
    }
  }

  async function searchLivePrices() {
    const query = liveSearchQuery.trim();

    if (query.length < 2) {
      setLiveSearchStatus("Введи мінімум 2 символи для пошуку");
      return;
    }

    setIsLiveSearchLoading(true);
    setLiveSearchStatus("Шукаю товари у Novus через Zakaz API...");

    try {
      const results = await searchNovusProducts(query);

      setLiveSearchResults(results);
      setLastLiveSearchSync(new Date().toLocaleTimeString("uk-UA"));
      setLiveSearchStatus(
        results.length
          ? `Знайдено ${formatCountUk(results.length, ["товар", "товари", "товарів"])} із живими цінами Novus`
          : "За цим запитом Novus/Zakaz нічого не знайшов",
      );
    } catch (error) {
      setLiveSearchStatus(
        getErrorMessage(error, "Не вдалося отримати ціни з API магазину"),
      );
    } finally {
      setIsLiveSearchLoading(false);
    }
  }

  async function importLiveProduct(result: ExternalStoreProduct) {
    const store = stores.find((item) => item.id === result.storeId) ?? stores[0];
    const priceType = getPriceTypeFromExternalUnit(result.unit);
    const product: Product = {
      id: result.id,
      name: result.title,
      category: "Імпорт з API",
      subcategory: result.discountPercent ? "Акційна ціна" : "Live ціна",
      price: result.price,
      priceType,
      store: store?.name ?? result.storeName,
      accent: "bg-sky-300",
      imageUrl: result.imageUrl,
      expiresIn: 14,
      favorite: false,
    };
    const productPrice: ProductPrice = {
      productId: result.id,
      storeId: result.storeId,
      price: result.price,
      oldPrice: result.oldPrice,
      isDiscount: Boolean(result.discountPercent),
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    setProducts((current) => {
      const exists = current.some((item) => item.id === product.id);

      return exists
        ? current.map((item) => (item.id === product.id ? product : item))
        : [product, ...current];
    });
    setProductPrices((current) => {
      const exists = current.some(
        (item) =>
          item.productId === productPrice.productId &&
          item.storeId === productPrice.storeId,
      );

      return exists
        ? current.map((item) =>
            item.productId === productPrice.productId &&
            item.storeId === productPrice.storeId
              ? productPrice
              : item,
          )
        : [productPrice, ...current];
    });

    try {
      await saveProduct(product);
      await saveProductPrice(productPrice);
      setDatabaseError("");
      setLiveSearchStatus(`${result.title} збережено в локальну базу`);
    } catch (error) {
      setDatabaseError(
        getErrorMessage(error, "Не вдалося зберегти товар з API"),
      );
    }
  }

  async function createProduct() {
    const price = Number(draftPrice);
    const expiresIn = Number(draftExpiresIn);
    const name = draftName.trim();
    const imageUrl = draftImageUrl.trim();

    if (
      !name ||
      Number.isNaN(price) ||
      price <= 0 ||
      Number.isNaN(expiresIn) ||
      expiresIn < 0
    ) {
      return;
    }

    const store =
      stores.find(
        (item) => item.name.toLowerCase() === draftStore.trim().toLowerCase(),
      ) ?? stores[0];

    const product: Product = {
      id: `${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      name,
      category: draftCategory.trim() || "Інше",
      subcategory: draftSubcategory.trim() || "Нова позиція",
      price,
      priceType: draftPriceType,
      store: store?.name ?? draftStore.trim() ?? "Без магазину",
      accent: "bg-emerald-300",
      imageUrl: imageUrl || null,
      expiresIn,
      favorite: false,
    };

    const productPrice: ProductPrice = {
      productId: product.id,
      storeId: store?.id ?? "silpo",
      price,
      oldPrice: null,
      isDiscount: false,
      updatedAt: "2026-05-08",
    };

    setProducts((current) => [product, ...current]);
    setProductPrices((current) => [productPrice, ...current]);
    setDraftName("");
    setDraftSubcategory("Нова позиція");
    setDraftPrice("100");
    setDraftPriceType("piece");
    setDraftImageUrl("");
    setIsDraftImageGenerating(false);
    setDraftImageStatus("Обери ШІ по категорії або встав URL фото з інтернету.");
    setDraftExpiresIn("14");
    setIsAddDialogOpen(false);

    try {
      await saveProduct(product);
      await saveProductPrice(productPrice);
    } catch (error) {
      setDatabaseError(getErrorMessage(error, "Не вдалося зберегти продукт"));
    }
  }

  async function generateDraftProductImage() {
    if (isDraftImageGenerating) return;

    setIsDraftImageGenerating(true);

    setDraftImageStatus("Підбираю узагальнене зображення категорії...");
    await new Promise((resolve) =>
      window.setTimeout(resolve, 450),
    );

    setDraftImageUrl(getCategoryImageUrl(draftCategory) ?? getGeneratedProductImage(draftCategory, draftCategory));
    setDraftImageStatus(`Використано локальне зображення категорії: ${draftCategory}.`);
    setIsDraftImageGenerating(false);
  }

  function clearGeneratedDraftImage() {
    setDraftImageUrl((current) =>
      isGeneratedProductImageUrl(current) ? "" : current,
    );
    setDraftImageStatus("Обери ШІ по категорії або встав URL фото з інтернету.");
  }

  function renderOverview() {
    return (
      <div
        className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]"
        data-tour="overview"
      >
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              description="Поточний список"
              title={formatCurrency(listTotal)}
              value={`${formatCountUk(shoppingItems.length, ["позиція", "позиції", "позицій"])}, найкращі ціни у фільтрі`}
            />
            <MetricCard
              description="Найвигідніший магазин"
              title={bestStoreTotal ? bestStoreTotal.store.name : "-"}
              value={
                bestStoreTotal
                  ? `${formatCurrency(bestStoreTotal.total)} за весь список`
                  : "Додай товари у шоп-ліст"
              }
            />
            <MetricCard
              description="Потенційна економія"
              title={formatCurrency(potentialSavings)}
              value="Порівняно з найдорожчим вибраним магазином"
            />
            <MetricCard
              description="Найближчий строк"
              title={nextExpiryItem?.item.productName ?? "-"}
              value={
                nextExpiryItem?.item.expiresAt
                  ? `${formatExpiryDate(nextExpiryItem.item.expiresAt)} · скоро ${expiringSoonCount}, прострочено ${expiredItemCount}`
                  : "Заверши покупку, щоб увімкнути нагадування"
              }
            />
          </div>

          <Tabs defaultValue="list">
            <TabsList className="bg-white/6">
              <TabsTrigger value="list">Шоп-ліст</TabsTrigger>
              <TabsTrigger value="products">Продукти</TabsTrigger>
              <TabsTrigger value="week">Тиждень</TabsTrigger>
            </TabsList>
            <TabsContent className="mt-4" value="list">
              <ShoppingListCard
                items={shoppingItems}
                onIncrease={(product) => updateQuantity(product, "increase")}
                onDecrease={(product) => updateQuantity(product, "decrease")}
                onComplete={completeShoppingList}
                onRemove={removeLine}
              />
            </TabsContent>
            <TabsContent className="mt-4" value="products">
              <ProductGrid
                prices={productPrices}
                products={visibleProducts}
                selectedStoreIds={selectedStoreIds}
                stores={stores}
                onAdd={addProductToList}
                onFavorite={toggleFavorite}
              />
            </TabsContent>
            <TabsContent className="mt-4" value="week">
              <WeeklyPlanGrid
                plan={weeklyPlan}
                prices={productPrices}
                products={products}
                selectedStoreIds={selectedStoreIds}
                stores={stores}
                onAddDayToShoppingList={addWeekDayToShoppingList}
                onAddItem={addProductToWeekDay}
                onBudgetChange={updateWeekPlanBudget}
                onDecrease={updateWeekPlanQuantity}
                onIncrease={updateWeekPlanQuantity}
                onRemoveItem={removeWeekPlanItem}
              />
            </TabsContent>
          </Tabs>
        </div>

        <aside className="space-y-4">
          <StoreTotalsCard
            selectedStoreIds={selectedStoreIds}
            storeTotals={storeTotals}
          />
          <CategorySpendCard
            categorySpend={categorySpend}
            maxCategorySpend={maxCategorySpend}
          />
          <Card className="rounded-lg border-white/10 bg-white/6">
            <CardHeader>
              <CardTitle>SQLite статус</CardTitle>
              <CardDescription>
                {isDatabaseReady ? "Локальне збереження активне" : "Підключення"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-[#0b1218] p-4 text-sm">
                <p className={databaseError ? "text-rose-300" : "text-emerald-300"}>
                  {databaseError ||
                    "Stores і product_prices зберігаються у smart-grocery.db"}
                </p>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    );
  }

  function renderSection() {
    if (activeSection === "Продукти") {
      return (
        <div className="space-y-4" data-tour="products-section">
          <SectionHeader
            description={`${formatCountUk(visibleProducts.length, ["товар", "товари", "товарів"])}, ${formatCountUk(selectedStoreIds.length, ["магазин", "магазини", "магазинів"])} у фільтрі`}
            title="База продуктів і ціни"
          />
          <ProductFiltersCard
            activeFilterCount={activeProductFilterCount}
            category={productCategoryFilter}
            imageFilter={productImageFilter}
            showDiscountsOnly={showDiscountsOnly}
            showFavoritesOnly={showFavoritesOnly}
            totalCount={products.length}
            visibleCount={visibleProducts.length}
            onCategoryChange={setProductCategoryFilter}
            onDiscountsChange={setShowDiscountsOnly}
            onFavoritesChange={setShowFavoritesOnly}
            onImageFilterChange={setProductImageFilter}
            onReset={resetProductFilters}
          />
          <LivePriceSearchCard
            isLoading={isLiveSearchLoading}
            lastSync={lastLiveSearchSync}
            query={liveSearchQuery}
            results={liveSearchResults}
            status={liveSearchStatus}
            onImport={importLiveProduct}
            onQueryChange={setLiveSearchQuery}
            onSearch={searchLivePrices}
          />
          <ProductGrid
            prices={productPrices}
            products={visibleProducts}
            selectedStoreIds={selectedStoreIds}
            stores={stores}
            onAdd={addProductToList}
            onFavorite={toggleFavorite}
          />
        </div>
      );
    }

    if (activeSection === "Шоп-ліст") {
      return (
        <div
          className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]"
          data-tour="shopping-list-section"
        >
          <div className="space-y-4">
            <SectionHeader
              description={`Разом ${formatCurrency(listTotal)} за найкращими цінами`}
              title="Список покупки"
            />
            {routeStatus ? (
              <div className="rounded-lg border border-emerald-300/30 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-200">
                {routeStatus}
              </div>
            ) : null}
            <ShoppingListCard
              items={shoppingItems}
              onIncrease={(product) => updateQuantity(product, "increase")}
              onDecrease={(product) => updateQuantity(product, "decrease")}
              onComplete={completeShoppingList}
              onRemove={removeLine}
            />
          </div>
          <StoreTotalsCard
            selectedStoreIds={selectedStoreIds}
            storeTotals={storeTotals}
          />
        </div>
      );
    }

    if (activeSection === "План тижня") {
      return (
        <div className="space-y-4" data-tour="weekly-plan-section">
          <SectionHeader
            description={`${formatCurrency(weekPlanned)} із ${formatCurrency(
              weekBudget,
            )}`}
            title="План покупок на тиждень"
          />
          <WeeklyPlanGrid
            plan={weeklyPlan}
            prices={productPrices}
            products={products}
            selectedStoreIds={selectedStoreIds}
            stores={stores}
            onAddDayToShoppingList={addWeekDayToShoppingList}
            onAddItem={addProductToWeekDay}
            onBudgetChange={updateWeekPlanBudget}
            onDecrease={updateWeekPlanQuantity}
            onIncrease={updateWeekPlanQuantity}
            onRemoveItem={removeWeekPlanItem}
          />
        </div>
      );
    }

    if (activeSection === "Історія") {
      return (
        <div data-tour="history-section">
          <PurchaseHistory
            exportDirectory={settings.exportDirectory}
            purchases={purchases}
            onRepeat={repeatPurchase}
          />
        </div>
      );
    }

    if (activeSection === "Строки") {
      return (
        <div data-tour="expiry-section">
          <ExpiryReminderPage
            entries={expiryItems}
            onConsume={(purchaseId, productId) =>
              togglePurchaseItemConsumed(purchaseId, productId, true)
            }
          />
        </div>
      );
    }

    if (activeSection === "Оптимізатор") {
      return (
        <div data-tour="optimizer-section">
          <ShoppingOptimizer
            allStoresRoute={shoppingRoutes.allStores}
            bestSingle={shoppingRoutes.bestSingle}
            bestTwo={shoppingRoutes.bestTwo}
            onApply={applyShoppingRoute}
            shoppingItemCount={shoppingLines.length}
            stores={stores}
          />
        </div>
      );
    }

    if (activeSection === "Аналітика") {
      return (
        <div data-tour="analytics-section">
          <AnalyticsDashboard
            categorySpend={categorySpend}
            purchases={purchases}
            potentialSavings={potentialSavings}
            selectedStoreIds={selectedStoreIds}
            storeTotals={storeTotals}
            weekBudget={weekBudget}
            weekPlanned={weekPlanned}
            weeklySpendData={weeklySpendData}
          />
        </div>
      );
    }

    return renderOverview();
  }

  const themeClass =
    settings.theme === "light"
      ? "theme-light"
      : settings.theme === "dark"
        ? "dark theme-dark"
        : "dark theme-standard";

  return (
    <main
      className={`${themeClass} min-h-screen bg-[#071014] text-foreground`}
      key={settings.language}
    >
      <div className="grid min-h-screen grid-cols-[248px_minmax(0,1fr)]">
        <aside className="flex max-h-screen flex-col border-r border-white/10 bg-[#0b1218] px-4 py-5">
          <div className="mb-8 flex items-center gap-3 px-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-300 text-[#071014]">
              <ShoppingBasket className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Smart Grocery</p>
              <p className="text-xs text-muted-foreground">Manager</p>
            </div>
          </div>

          <nav className="space-y-1" data-tour="navigation">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.label;

              return (
                <button
                  className={`flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm transition ${
                    isActive
                      ? "bg-white text-[#071014]"
                      : "text-muted-foreground hover:bg-white/8 hover:text-white"
                  }`}
                  key={item.label}
                  onClick={() => setActiveSection(item.label)}
                  type="button"
                >
                  <Icon className="size-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div
            className="mt-8 rounded-lg border border-white/10 bg-white/5 p-3"
            data-tour="weekly-budget"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Тижневий бюджет</span>
              <WalletCards className="size-4 text-emerald-300" />
            </div>
            <p className="text-xl font-semibold">{formatCurrency(weekBudget)}</p>
            <Progress className="mt-3 h-2" value={(weekPlanned / weekBudget) * 100} />
            <p className="mt-2 text-xs text-muted-foreground">
              Заплановано {formatCurrency(weekPlanned)}
            </p>
          </div>

          <Button
            className="mt-auto w-full justify-start"
            data-tour="settings"
            onClick={() => setIsSettingsOpen(true)}
            variant="ghost"
          >
            <Settings className="size-4" />
            Налаштування
          </Button>
        </aside>

        <section className="overflow-hidden">
          <header className="flex h-16 items-center justify-between border-b border-white/10 px-6">
            <div>
              <h1 className="text-lg font-semibold">{activeSection}</h1>
              <p className="text-xs text-muted-foreground">
                {formatCurrentDate(settings.language)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                aria-label="Відкрити помічника"
                data-tour="assistant"
                onClick={startAssistant}
                size="icon-sm"
                title="Помічник"
                variant="outline"
              >
                <Lightbulb className="size-4 text-amber-300" />
              </Button>
              <div className="relative w-72" data-tour="search">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="h-9 pl-9 pr-9"
                  onChange={(event) => {
                    const value = event.target.value;
                    setSearchQuery(value);
                    if (value.trim()) setActiveSection("Продукти");
                  }}
                  placeholder="Пошук продукту або магазину"
                  value={searchQuery}
                />
                {searchQuery ? (
                  <button
                    aria-label="Очистити пошук"
                    className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
                    onClick={() => setSearchQuery("")}
                    title="Очистити пошук"
                    type="button"
                  >
                    <X className="size-3.5" />
                  </button>
                ) : null}
              </div>
              <Button
                data-tour="add-product"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="size-4" />
                Додати
              </Button>
            </div>
          </header>

          <div
            className="border-b border-white/10 px-6 py-3"
            data-tour="store-filter"
          >
            <StoreFilter
              selectedStoreIds={selectedStoreIds}
              stores={stores}
              onToggle={toggleStore}
            />
          </div>

          <div
            className="h-[calc(100vh-7.25rem)] overflow-auto px-6 py-5"
            data-tour="app-content"
          >
            {renderSection()}
          </div>
        </section>
      </div>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-h-[calc(100vh-2rem)] w-[min(640px,calc(100vw-2rem))] gap-5 overflow-y-auto border-white/10 bg-[#10181d] p-5 text-white sm:max-w-none">
          <DialogHeader>
            <DialogTitle>Налаштування</DialogTitle>
            <DialogDescription>
              Зовнішність, мова інтерфейсу та місце збереження звітів.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <SettingsChoice
              label="Зовнішність теми"
              options={[
                { label: "Стандартна", value: "standard" },
                { label: "Темна", value: "dark" },
                { label: "Світла", value: "light" },
              ]}
              value={settings.theme}
              onChange={(value) => updateSetting("theme", value as AppTheme)}
            />

            <SettingsChoice
              label="Мова"
              options={[
                { label: "Українська", value: "uk" },
                { label: "English", value: "en" },
                { label: "Français", value: "fr" },
                { label: "Español", value: "es" },
              ]}
              value={settings.language}
              onChange={(value) => updateSetting("language", value as AppLanguage)}
            />

            <div className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-[#0b1218] p-3">
              <div>
                <p className="text-sm font-medium">Помічник для нових користувачів</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Автоматично показувати знайомство з можливостями застосунку.
                </p>
              </div>
              <Switch
                checked={settings.assistantEnabled}
                onCheckedChange={(checked) => {
                  setSettings((current) => ({
                    ...current,
                    assistantEnabled: checked,
                    onboardingCompleted: checked
                      ? false
                      : current.onboardingCompleted,
                  }));
                  if (!checked) setIsAssistantOpen(false);
                }}
              />
            </div>
            <Button className="w-full" onClick={startAssistant} variant="outline">
              <Lightbulb className="size-4 text-amber-300" />
              Запустити помічника
            </Button>

            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium">Папка експорту</p>
                <p className="break-all text-xs text-muted-foreground">
                  {settings.exportDirectory || "Завантаження Windows"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={chooseExportDirectory} variant="outline">
                  <FolderOpen className="size-4" />
                  Обрати папку
                </Button>
                <Button
                  disabled={!settings.exportDirectory}
                  onClick={resetExportDirectory}
                  variant="ghost"
                >
                  <RotateCcw className="size-4" />
                  Скинути
                </Button>
              </div>
            </div>

            {settingsStatus ? (
              <div className="rounded-lg border border-white/10 bg-[#0b1218] px-3 py-2 text-sm text-muted-foreground">
                {settingsStatus}
              </div>
            ) : null}

            <div className="flex items-start gap-3 rounded-lg border border-emerald-300/20 bg-emerald-300/8 p-3">
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-300 text-[#071014]">
                <Check className="size-4" />
              </span>
              <div>
                <p className="text-sm font-medium">
                  Особисті дані зберігаються локально
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Списки, план тижня та історія покупок залишаються на цьому ПК.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Smart Grocery Manager · версія 1.0.0
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setIsSettingsOpen(false)}>Закрити</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isAssistantOpen ? (
        <AssistantTour
          key={`${assistantStep}-${activeSection}`}
          currentStep={assistantStep}
          language={settings.language}
          onBack={() =>
            setAssistantStep((current) => Math.max(0, current - 1))
          }
          onClose={closeAssistant}
          onNext={() => {
            const steps = assistantStepsByLanguage[settings.language];
            if (assistantStep >= steps.length - 1) {
              closeAssistant();
              return;
            }
            setAssistantStep((current) => current + 1);
          }}
          steps={assistantStepsByLanguage[settings.language]}
        />
      ) : null}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-h-[calc(100vh-2rem)] w-[min(760px,calc(100vw-2rem))] gap-5 overflow-y-auto border-white/10 bg-[#10181d] p-5 text-white sm:max-w-none">
          <DialogHeader>
            <DialogTitle>Новий продукт</DialogTitle>
            <DialogDescription>
              Додай назву, фото, тип ціни та строк придатності. Товар і перша ціна збережуться у SQLite.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 lg:grid-cols-[190px_minmax(0,1fr)]">
            <div className="space-y-3">
              {draftImageUrl.trim() ? (
                <img
                  alt="Превʼю продукту"
                  className="aspect-square w-full rounded-lg object-cover"
                  src={draftImageUrl.trim()}
                />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-emerald-300 text-[#071014]">
                  <ShoppingBasket className="size-7" />
                </div>
              )}
              <Tabs className="w-full" defaultValue="ai">
                <TabsList className="grid w-full grid-cols-2 bg-white/6">
                  <TabsTrigger value="ai">ШІ</TabsTrigger>
                  <TabsTrigger value="url">URL</TabsTrigger>
                </TabsList>
                <TabsContent className="mt-2" value="ai">
                  <Button
                    className="w-full"
                    disabled={isDraftImageGenerating}
                    onClick={generateDraftProductImage}
                    type="button"
                    variant="outline"
                  >
                    <Sparkles className="size-4" />
                    {isDraftImageGenerating ? "Підбираю" : "ШІ по категорії"}
                  </Button>
                </TabsContent>
                <TabsContent className="mt-2 rounded-lg bg-white/5 p-3 text-xs text-muted-foreground" value="url">
                  Встав посилання в поле “Фото URL”.
                </TabsContent>
              </Tabs>
              <p className="text-xs text-muted-foreground">
                {draftImageStatus}
              </p>
            </div>
            <div className="grid min-w-0 gap-4">
              <label className="grid gap-1.5 text-sm">
                Назва
                <Input
                  onChange={(event) => {
                    setDraftName(event.target.value);
                    clearGeneratedDraftImage();
                  }}
                  placeholder="Наприклад, Авокадо"
                  value={draftName}
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid min-w-0 gap-1.5 text-sm">
                  Категорія
                  <select
                    className="h-9 min-w-0 rounded-md border border-white/10 bg-[#0b1218] px-3 text-sm text-white outline-none"
                    onChange={(event) => {
                      const nextCategory = event.target.value;
                      setDraftCategory(nextCategory);
                      setDraftImageUrl((current) =>
                        isCategoryImageUrl(current)
                          ? getCategoryImageUrl(nextCategory)
                          : current,
                      );
                      clearGeneratedDraftImage();
                    }}
                    value={draftCategory}
                  >
                    {productCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid min-w-0 gap-1.5 text-sm">
                  Підкатегорія
                  <Input
                    onChange={(event) => {
                      setDraftSubcategory(event.target.value);
                      clearGeneratedDraftImage();
                    }}
                    placeholder="Наприклад, Свіжі овочі"
                    value={draftSubcategory}
                  />
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-[120px_1fr_130px]">
                <label className="grid min-w-0 gap-1.5 text-sm">
                  Ціна
                  <Input
                    min="1"
                    onChange={(event) => setDraftPrice(event.target.value)}
                    type="number"
                    value={draftPrice}
                  />
                </label>
                <label className="grid min-w-0 gap-1.5 text-sm">
                  Тип ціни
                  <select
                    className="h-9 min-w-0 rounded-md border border-white/10 bg-[#0b1218] px-3 text-sm text-white outline-none"
                    onChange={(event) =>
                      setDraftPriceType(event.target.value as PriceType)
                    }
                    value={draftPriceType}
                  >
                    {priceTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid min-w-0 gap-1.5 text-sm">
                  Придатний, днів
                  <Input
                    min="0"
                    onChange={(event) => setDraftExpiresIn(event.target.value)}
                    type="number"
                    value={draftExpiresIn}
                  />
                </label>
              </div>
              <label className="grid gap-1.5 text-sm">
                Магазин
                <Input
                  list="store-options"
                  onChange={(event) => setDraftStore(event.target.value)}
                  value={draftStore}
                />
                <datalist id="store-options">
                  {stores.map((store) => (
                    <option key={store.id} value={store.name} />
                  ))}
                </datalist>
              </label>
              <label className="grid gap-1.5 text-sm">
                Фото URL
                <Input
                  onChange={(event) => setDraftImageUrl(event.target.value)}
                  placeholder="https://... або обери ШІ по категорії"
                  value={draftImageUrl}
                />
              </label>
            </div>
          </div>
          <DialogFooter className="mx-0 mb-0 rounded-none border-white/10 bg-transparent p-0 pt-1">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Скасувати
            </Button>
            <Button onClick={createProduct}>Зберегти</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function AssistantTour({
  currentStep,
  language,
  onBack,
  onClose,
  onNext,
  steps,
}: {
  currentStep: number;
  language: AppLanguage;
  onBack: () => void;
  onClose: () => void;
  onNext: () => void;
  steps: AssistantStep[];
}) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const step = steps[currentStep];
  const labels = {
    uk: { back: "Назад", close: "Закрити", done: "Почати роботу", next: "Далі", step: "Крок", task: "Що робити" },
    en: { back: "Back", close: "Close", done: "Start using", next: "Next", step: "Step", task: "What to do" },
    fr: { back: "Retour", close: "Fermer", done: "Commencer", next: "Suivant", step: "Étape", task: "Que faire" },
    es: { back: "Atrás", close: "Cerrar", done: "Empezar", next: "Siguiente", step: "Paso", task: "Qué hacer" },
  }[language];

  useEffect(() => {
    let settleTimer = 0;

    const updateTarget = () => {
      if (!step.target) {
        setTargetRect(null);
        return;
      }

      const target = document.querySelector(step.target);
      if (!(target instanceof HTMLElement)) {
        setTargetRect(null);
        return;
      }

      const bounds = target.getBoundingClientRect();
      const left = Math.max(8, bounds.left);
      const top = Math.max(8, bounds.top);
      const right = Math.min(window.innerWidth - 8, bounds.right);
      const bottom = Math.min(window.innerHeight - 8, bounds.bottom);
      setTargetRect(
        new DOMRect(left, top, Math.max(0, right - left), Math.max(0, bottom - top)),
      );
    };

    settleTimer = window.setTimeout(updateTarget, 180);
    window.addEventListener("resize", updateTarget);

    return () => {
      window.clearTimeout(settleTimer);
      window.removeEventListener("resize", updateTarget);
    };
  }, [step.target]);

  const isLastStep = currentStep === steps.length - 1;
  const padding = 7;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {targetRect ? (
        <div
          className="fixed rounded-xl border-2 border-amber-300 transition-all duration-300"
          style={{
            boxShadow: "0 0 0 9999px rgba(2, 8, 12, 0.78)",
            height: targetRect.height + padding * 2,
            left: targetRect.left - padding,
            top: targetRect.top - padding,
            width: targetRect.width + padding * 2,
          }}
        />
      ) : (
        <div className="fixed inset-0 bg-[#02080c]/80" />
      )}

      <div
        className="pointer-events-auto fixed bottom-4 right-4 top-4 flex w-[min(410px,calc(100vw-2rem))] flex-col rounded-lg border border-amber-300/40 bg-[#10181d] p-5 text-white shadow-2xl shadow-black/60"
        role="dialog"
      >
        <div className="flex shrink-0 items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-300 text-[#071014]">
              <Lightbulb className="size-5" />
            </span>
            <div>
              <p className="text-xs font-medium uppercase text-amber-200">
                {labels.step} {currentStep + 1} / {steps.length}
              </p>
              <h2 className="mt-1 text-lg font-semibold">{step.title}</h2>
            </div>
          </div>
          <Button
            aria-label={labels.close}
            className="shrink-0"
            onClick={onClose}
            size="icon-sm"
            variant="ghost"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
          <p className="text-sm leading-6 text-muted-foreground">
            {step.description}
          </p>

          <div className="mt-4 rounded-lg border border-amber-300/20 bg-amber-300/8 p-3">
            <p className="text-xs font-semibold uppercase text-amber-200">
              {labels.task}
            </p>
            <p className="mt-1.5 text-sm leading-5 text-white/90">{step.action}</p>
          </div>
        </div>

        <div className="mt-5 h-1.5 shrink-0 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-amber-300 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="mt-4 flex shrink-0 items-center justify-between gap-3">
          <Button
            disabled={currentStep === 0}
            onClick={onBack}
            variant="ghost"
          >
            <ChevronLeft className="size-4" />
            {labels.back}
          </Button>
          <Button className="bg-amber-300 text-[#071014] hover:bg-amber-200" onClick={onNext}>
            {isLastStep ? labels.done : labels.next}
            {!isLastStep ? <ChevronRight className="size-4" /> : <Check className="size-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

function StoreFilter({
  selectedStoreIds,
  stores,
  onToggle,
}: {
  selectedStoreIds: string[];
  stores: Store[];
  onToggle: (storeId: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="mr-2 flex items-center gap-2 text-sm text-muted-foreground">
        <StoreIcon className="size-4" />
        Магазини
      </div>
      {stores.map((store) => {
        const isSelected = selectedStoreIds.includes(store.id);

        return (
          <button
            className={`flex h-8 items-center gap-2 rounded-lg border px-3 text-sm transition ${
              isSelected
                ? "border-white bg-white text-[#071014]"
                : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
            }`}
            key={store.id}
            onClick={() => onToggle(store.id)}
            type="button"
          >
            <span className={`size-2 rounded-full ${store.color}`} />
            {store.name}
          </button>
        );
      })}
      <span className="ml-auto text-xs text-muted-foreground">
        Обрано {selectedStoreIds.length} / {stores.length}
      </span>
    </div>
  );
}

function ProductFiltersCard({
  activeFilterCount,
  category,
  imageFilter,
  showDiscountsOnly,
  showFavoritesOnly,
  totalCount,
  visibleCount,
  onCategoryChange,
  onDiscountsChange,
  onFavoritesChange,
  onImageFilterChange,
  onReset,
}: {
  activeFilterCount: number;
  category: string;
  imageFilter: ImageFilter;
  showDiscountsOnly: boolean;
  showFavoritesOnly: boolean;
  totalCount: number;
  visibleCount: number;
  onCategoryChange: (category: string) => void;
  onDiscountsChange: (value: boolean) => void;
  onFavoritesChange: (value: boolean) => void;
  onImageFilterChange: (filter: ImageFilter) => void;
  onReset: () => void;
}) {
  const toggleClass =
    "h-10 rounded-lg border px-3 text-sm transition hover:bg-white/10";
  const inactiveClass = "border-white/10 bg-white/5 text-muted-foreground";
  const activeClass = "border-white bg-white text-[#071014]";

  return (
    <Card className="rounded-lg border-white/10 bg-white/6">
      <CardContent className="grid gap-3 p-4 xl:grid-cols-[minmax(220px,1fr)_auto_auto_minmax(180px,240px)_auto]">
        <label className="grid gap-1.5 text-sm">
          <span className="text-xs text-muted-foreground">Категорія</span>
          <select
            className="h-10 rounded-lg border border-white/10 bg-[#0b1218] px-3 text-sm text-white outline-none transition focus:border-emerald-300"
            onChange={(event) => onCategoryChange(event.target.value)}
            value={category}
          >
            <option value="all">Усі категорії</option>
            {productCategories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <button
          className={`${toggleClass} ${
            showDiscountsOnly ? activeClass : inactiveClass
          }`}
          onClick={() => onDiscountsChange(!showDiscountsOnly)}
          type="button"
        >
          <span className="flex items-center gap-2">
            <Percent className="size-4" />
            Акції
          </span>
        </button>

        <button
          className={`${toggleClass} ${
            showFavoritesOnly ? activeClass : inactiveClass
          }`}
          onClick={() => onFavoritesChange(!showFavoritesOnly)}
          type="button"
        >
          <span className="flex items-center gap-2">
            <Heart className={showFavoritesOnly ? "size-4 fill-current" : "size-4"} />
            Обране
          </span>
        </button>

        <label className="grid gap-1.5 text-sm">
          <span className="text-xs text-muted-foreground">Фото</span>
          <select
            className="h-10 rounded-lg border border-white/10 bg-[#0b1218] px-3 text-sm text-white outline-none transition focus:border-emerald-300"
            onChange={(event) =>
              onImageFilterChange(event.target.value as ImageFilter)
            }
            value={imageFilter}
          >
            <option value="all">Всі товари</option>
            <option value="with">З фото</option>
            <option value="without">Без фото</option>
          </select>
        </label>

        <div className="flex items-end justify-between gap-3">
          <div className="pb-1 text-sm">
            <p className="font-semibold">{visibleCount} із {totalCount}</p>
            <p className="text-xs text-muted-foreground">
              Активних фільтрів: {activeFilterCount}
            </p>
          </div>
          <Button
            disabled={!activeFilterCount}
            onClick={onReset}
            type="button"
            variant="outline"
          >
            Скинути
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricCard({
  description,
  title,
  value,
}: {
  description: string;
  title: string;
  value: string;
}) {
  return (
    <Card className="rounded-lg border-white/10 bg-white/6">
      <CardHeader>
        <CardDescription>{description}</CardDescription>
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">{value}</CardContent>
    </Card>
  );
}

function SectionHeader({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function SettingsChoice({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<{ label: string; value: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {options.map((option) => {
          const isActive = option.value === value;

          return (
            <button
              className={`h-10 rounded-lg border px-3 text-sm transition ${
                isActive
                  ? "border-white bg-white text-[#071014]"
                  : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
              }`}
              key={option.value}
              onClick={() => onChange(option.value)}
              type="button"
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LivePriceSearchCard({
  isLoading,
  lastSync,
  query,
  results,
  status,
  onImport,
  onQueryChange,
  onSearch,
}: {
  isLoading: boolean;
  lastSync: string;
  query: string;
  results: ExternalStoreProduct[];
  status: string;
  onImport: (product: ExternalStoreProduct) => void;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
}) {
  const sources = [
    { label: "Novus", state: "підключено", color: "bg-emerald-300", isLive: true },
    { label: "Сільпо", state: "очікує API", color: "bg-zinc-400", isLive: false },
    { label: "АТБ", state: "очікує API", color: "bg-zinc-400", isLive: false },
    { label: "Фора", state: "очікує API", color: "bg-zinc-400", isLive: false },
  ];

  return (
    <Card className="rounded-lg border-white/10 bg-white/6">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="size-4 text-emerald-300" />
              Live ціни магазинів
            </CardTitle>
            <CardDescription>
              Пошук товарів, знижок і актуальних цін. Першим підключено Novus через Zakaz API.
            </CardDescription>
          </div>
          {lastSync ? (
            <Badge className="bg-white text-[#071014]">оновлено {lastSync}</Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {sources.map((source) => (
            <Badge
              className={
                source.isLive
                  ? "bg-emerald-300 text-[#071014]"
                  : "border-white/10 bg-white/5 text-muted-foreground"
              }
              key={source.label}
              variant={source.isLive ? "default" : "outline"}
            >
              <span className={`mr-2 size-2 rounded-full ${source.color}`} />
              {source.label}: {source.state}
            </Badge>
          ))}
        </div>

        <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-10 pl-9"
              onChange={(event) => onQueryChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") onSearch();
              }}
              placeholder="Наприклад: помідори, йогурт, вода"
              value={query}
            />
          </div>
          <Button disabled={isLoading} onClick={onSearch}>
            <Search className="size-4" />
            {isLoading ? "Шукаю" : "Знайти ціни"}
          </Button>
        </div>

        <div className="rounded-lg bg-[#0b1218] p-3 text-sm text-muted-foreground">
          {status}
        </div>

        {results.length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {results.map((product) => (
              <div
                className="grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-white/10 bg-[#0b1218] p-3"
                key={product.id}
              >
                {product.imageUrl ? (
                  <img
                    alt={product.title}
                    className="size-14 rounded-lg object-cover"
                    src={product.imageUrl}
                  />
                ) : (
                  <span className="flex size-14 items-center justify-center rounded-lg bg-sky-300 text-[#071014]">
                    <ShoppingBasket className="size-5" />
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate font-medium">{product.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>SKU {product.sku}</span>
                    <span>{product.unit}</span>
                    {product.discountDueDate ? (
                      <span>до {product.discountDueDate}</span>
                    ) : null}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    {product.oldPrice ? (
                      <span className="text-xs text-muted-foreground line-through">
                        {formatCurrency(product.oldPrice)}
                      </span>
                    ) : null}
                    <span className="font-semibold">
                      {formatCurrency(product.price)}
                    </span>
                    {product.discountPercent ? (
                      <Badge className="bg-emerald-300 text-[#071014]">
                        -{product.discountPercent}%
                      </Badge>
                    ) : null}
                  </div>
                </div>
                <Button onClick={() => onImport(product)} size="sm" variant="outline">
                  <Plus className="size-4" />
                  Імпорт
                </Button>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ProductPhoto({
  className,
  iconClassName = "size-5",
  product,
}: {
  className: string;
  iconClassName?: string;
  product: Product;
}) {
  if (product.imageUrl) {
    return (
      <img
        alt={product.name}
        className={`${className} rounded-lg object-cover`}
        src={product.imageUrl}
      />
    );
  }

  return (
    <span
      className={`${className} flex items-center justify-center rounded-lg ${product.accent} text-[#071014]`}
    >
      <ShoppingBasket className={iconClassName} />
    </span>
  );
}

function ProductGrid({
  prices,
  products,
  selectedStoreIds,
  stores,
  onAdd,
  onFavorite,
}: {
  prices: ProductPrice[];
  products: Product[];
  selectedStoreIds: string[];
  stores: Store[];
  onAdd: (product: Product) => void;
  onFavorite: (productId: string) => void;
}) {
  if (!products.length) {
    return (
      <Card className="rounded-lg border-white/10 bg-white/6">
        <CardContent className="flex min-h-44 flex-col items-center justify-center gap-2 p-6 text-center">
          <Search className="size-7 text-muted-foreground" />
          <p className="font-semibold">Нічого не знайдено</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Зміни пошук або скинь фільтри, щоб повернути всі товари в каталозі.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => {
        const productPrices = getPricesForProduct(
          product.id,
          prices,
          selectedStoreIds,
        );
        const bestPrice = productPrices[0] ?? null;

        return (
          <Card className="rounded-lg border-white/10 bg-white/6" key={product.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <ProductPhoto className="size-11" product={product} />
                <div>
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription>{product.subcategory}</CardDescription>
                </div>
              </div>
              <CardAction>
                <Button
                  aria-label="Обране"
                  onClick={() => onFavorite(product.id)}
                  size="icon-sm"
                  variant="ghost"
                >
                  <Heart
                    className={`size-4 ${
                      product.favorite ? "fill-rose-300 text-rose-300" : ""
                    }`}
                  />
                </Button>
              </CardAction>
            </CardHeader>
            <div className="px-4">
              <ProductPhoto
                className="h-32 w-full"
                iconClassName="size-8"
                product={product}
              />
            </div>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline">{product.category}</Badge>
                {bestPrice ? (
                  <Badge className="bg-emerald-300 text-[#071014]">
                    вигідніше: {getStoreName(stores, bestPrice.storeId)}
                  </Badge>
                ) : (
                  <Badge variant="secondary">немає ціни</Badge>
                )}
              </div>

              <div className="space-y-2">
                {productPrices.map((price) => (
                  <div
                    className="flex items-center justify-between rounded-lg bg-[#0b1218] px-3 py-2 text-sm"
                    key={`${price.productId}-${price.storeId}`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`size-2 rounded-full ${
                          stores.find((store) => store.id === price.storeId)?.color ??
                          "bg-slate-300"
                        }`}
                      />
                      <span>{getStoreName(stores, price.storeId)}</span>
                      {price.isDiscount ? (
                        <Percent className="size-3 text-emerald-300" />
                      ) : null}
                    </div>
                    <div className="text-right">
                      {price.oldPrice ? (
                        <span className="mr-2 text-xs text-muted-foreground line-through">
                          {formatCurrency(price.oldPrice)}
                        </span>
                      ) : null}
                      <span className="font-semibold">
                        {formatCurrency(price.price)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <p className="font-semibold">
                  {formatCurrency(getDisplayPrice(product, bestPrice))} /{" "}
                  {formatUnit(product.priceType)}
                </p>
                <Button onClick={() => onAdd(product)} size="sm">
                  <Plus className="size-4" />
                  До списку
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function ShoppingListCard({
  items,
  onComplete,
  onDecrease,
  onIncrease,
  onRemove,
}: {
  items: ShoppingItem[];
  onComplete: () => void;
  onDecrease: (product: Product) => void;
  onIncrease: (product: Product) => void;
  onRemove: (productId: string) => void;
}) {
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const total = items.reduce(
    (sum, item) =>
      sum + calculateLineTotal(item.product, item.quantity, item.bestPrice),
    0,
  );

  return (
    <>
      <Card className="rounded-lg border-white/10 bg-white/6">
        <CardHeader>
          <CardTitle>Список покупки</CardTitle>
          <CardDescription>{formatCurrency(total)} разом</CardDescription>
          <CardAction>
            <Button
              disabled={!items.length}
              onClick={() => setIsCompleteDialogOpen(true)}
              size="sm"
            >
              <Check className="size-4" />
              Покупку завершено
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item) => (
            <div
              className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 rounded-lg border border-white/10 bg-[#0b1218] p-3"
              key={item.product.id}
            >
              <div className="flex items-center gap-3">
                <ProductPhoto className="size-10" product={item.product} />
                <div>
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.bestStore?.name ?? item.product.store} ·{" "}
                    {formatCurrency(getDisplayPrice(item.product, item.bestPrice))}/
                    {formatUnit(item.product.priceType)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  aria-label={`Зменшити кількість: ${item.product.name}`}
                  onClick={() => onDecrease(item.product)}
                  size="icon-xs"
                  title="Зменшити кількість"
                  variant="outline"
                >
                  <Minus className="size-3" />
                </Button>
                <Badge className="min-w-16 justify-center" variant="secondary">
                  {item.quantity} {formatUnit(item.product.priceType)}
                </Badge>
                <Button
                  aria-label={`Збільшити кількість: ${item.product.name}`}
                  onClick={() => onIncrease(item.product)}
                  size="icon-xs"
                  title="Збільшити кількість"
                  variant="outline"
                >
                  <Plus className="size-3" />
                </Button>
              </div>
              <p className="min-w-24 text-right font-semibold">
                {formatCurrency(
                  calculateLineTotal(item.product, item.quantity, item.bestPrice),
                )}
              </p>
              <Button
                aria-label={`Видалити зі списку: ${item.product.name}`}
                onClick={() => onRemove(item.product.id)}
                size="icon-sm"
                title="Видалити зі списку"
                variant="ghost"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
          {!items.length ? (
            <div className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/10 text-center">
              <ShoppingBasket className="size-6 text-muted-foreground" />
              <p className="text-sm font-medium">Шоп-ліст порожній</p>
              <p className="text-xs text-muted-foreground">
                Додай товари або повтори покупку з історії.
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <DialogContent className="w-[min(460px,calc(100vw-2rem))] border-white/10 bg-[#10181d] text-white sm:max-w-none">
          <DialogHeader>
            <DialogTitle>Завершити покупку?</DialogTitle>
            <DialogDescription>
              {formatCountUk(items.length, ["позиція", "позиції", "позицій"])} на суму {formatCurrency(total)} буде збережено
              в історії. Після цього поточний шоп-ліст очиститься.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setIsCompleteDialogOpen(false)}
              variant="outline"
            >
              Продовжити покупки
            </Button>
            <Button
              onClick={() => {
                onComplete();
                setIsCompleteDialogOpen(false);
              }}
            >
              <Check className="size-4" />
              Так, завершити
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function formatPurchaseDate(value: string) {
  return new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function PurchaseHistory({
  exportDirectory,
  purchases,
  onRepeat,
}: {
  exportDirectory: string;
  purchases: Purchase[];
  onRepeat: (purchase: Purchase) => void;
}) {
  const totalSpent = purchases.reduce((sum, purchase) => sum + purchase.total, 0);
  const averageReceipt = purchases.length ? totalSpent / purchases.length : 0;
  const [exportStatus, setExportStatus] = useState("");
  const [isExporting, setIsExporting] = useState<"excel" | "pdf" | null>(null);

  async function exportReport(type: "excel" | "pdf") {
    if (!purchases.length || isExporting) return;

    setIsExporting(type);
    setExportStatus(type === "excel" ? "Формую Excel-звіт..." : "Формую PDF-звіт...");

    try {
      const path =
        type === "excel"
          ? await exportPurchasesToExcel(purchases, exportDirectory)
          : await exportPurchasesToPdf(purchases, exportDirectory);
      setExportStatus(`Звіт збережено: ${path}`);
    } catch (error) {
      setExportStatus(getErrorMessage(error, "Не вдалося експортувати звіт"));
    } finally {
      setIsExporting(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionHeader
          description={`${formatCountUk(purchases.length, ["покупка", "покупки", "покупок"])} збережено у SQLite`}
          title="Історія покупок"
        />
        <div className="flex gap-2">
          <Button
            disabled={!purchases.length || Boolean(isExporting)}
            onClick={() => exportReport("excel")}
            variant="outline"
          >
            <FileSpreadsheet className="size-4" />
            {isExporting === "excel" ? "Формую..." : "Excel"}
          </Button>
          <Button
            disabled={!purchases.length || Boolean(isExporting)}
            onClick={() => exportReport("pdf")}
            variant="outline"
          >
            <FileText className="size-4" />
            {isExporting === "pdf" ? "Формую..." : "PDF"}
          </Button>
        </div>
      </div>

      {exportStatus ? (
        <div className="break-all rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-muted-foreground">
          {exportStatus}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          description="Загальні витрати"
          title={formatCurrency(totalSpent)}
          value="За всі завершені покупки"
        />
        <MetricCard
          description="Середній чек"
          title={formatCurrency(averageReceipt)}
          value={`${formatCountUk(purchases.length, ["завершена покупка", "завершені покупки", "завершених покупок"])}`}
        />
        <MetricCard
          description="Остання покупка"
          title={purchases[0] ? formatCurrency(purchases[0].total) : "-"}
          value={purchases[0] ? formatPurchaseDate(purchases[0].purchasedAt) : "Історія поки порожня"}
        />
      </div>

      <div className="space-y-3">
        {purchases.map((purchase) => {
          const stores = Array.from(
            new Set(purchase.items.map((item) => item.storeName)),
          );

          return (
            <Card
              className="rounded-lg border-white/10 bg-white/6"
              key={purchase.id}
            >
              <CardHeader>
                <div>
                  <CardTitle>{formatCurrency(purchase.total)}</CardTitle>
                  <CardDescription>
                    {formatPurchaseDate(purchase.purchasedAt)} · {formatCountUk(purchase.items.length, ["позиція", "позиції", "позицій"])} ·{" "}
                    {stores.join(", ")}
                  </CardDescription>
                </div>
                <CardAction>
                  <Button
                    onClick={() => onRepeat(purchase)}
                    size="sm"
                    variant="outline"
                  >
                    <RotateCcw className="size-4" />
                    Повторити
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent className="grid gap-2 lg:grid-cols-2">
                {purchase.items.map((item) => (
                  <div
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg bg-[#0b1218] px-3 py-2"
                    key={`${purchase.id}-${item.productId}`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {item.productName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.storeName} · {item.quantity} {formatUnit(item.priceType)} ·{" "}
                        {formatCurrency(item.unitPrice)}/{formatUnit(item.priceType)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold">
                      {formatCurrency(item.total)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}

        {!purchases.length ? (
          <Card className="rounded-lg border-white/10 bg-white/6">
            <CardContent className="flex min-h-56 flex-col items-center justify-center gap-3 p-6 text-center">
              <ReceiptText className="size-8 text-muted-foreground" />
              <div>
                <p className="font-semibold">Історія покупок поки порожня</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Заверши першу покупку в шоп-лісті, і чек з'явиться тут.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

function ExpiryReminderPage({
  entries,
  onConsume,
}: {
  entries: Array<{
    purchaseId: string;
    purchasedAt: string;
    item: Purchase["items"][number];
  }>;
  onConsume: (purchaseId: string, productId: string) => void;
}) {
  const expiredCount = entries.filter(
    (entry) => getDaysUntil(entry.item.expiresAt ?? "") < 0,
  ).length;
  const soonCount = entries.filter((entry) => {
    const days = getDaysUntil(entry.item.expiresAt ?? "");
    return days >= 0 && days <= 3;
  }).length;
  const safeCount = entries.length - expiredCount - soonCount;

  return (
    <div className="space-y-4">
      <SectionHeader
        description="Контроль продуктів із завершених покупок"
        title="Строки придатності"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          description="Потребують уваги"
          title={`${expiredCount}`}
          value="Прострочені продукти"
        />
        <MetricCard
          description="Скоро використати"
          title={`${soonCount}`}
          value="Залишилося не більше 3 днів"
        />
        <MetricCard
          description="У нормі"
          title={`${safeCount}`}
          value="Більше 3 днів до завершення строку"
        />
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        {entries.map((entry) => {
          const expiresAt = entry.item.expiresAt;
          if (!expiresAt) return null;

          const daysLeft = getDaysUntil(expiresAt);
          const isExpired = daysLeft < 0;
          const isSoon = daysLeft >= 0 && daysLeft <= 3;
          const statusText = isExpired
            ? `Прострочено на ${Math.abs(daysLeft)} дн.`
            : daysLeft === 0
              ? "Використати сьогодні"
              : `Залишилося ${daysLeft} дн.`;

          return (
            <Card
              className={`rounded-lg bg-white/6 ${
                isExpired
                  ? "border-rose-300/50"
                  : isSoon
                    ? "border-amber-300/40"
                    : "border-white/10"
              }`}
              key={`${entry.purchaseId}-${entry.item.productId}`}
            >
              <CardHeader>
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${
                      isExpired
                        ? "bg-rose-300 text-[#071014]"
                        : isSoon
                          ? "bg-amber-300 text-[#071014]"
                          : "bg-emerald-300 text-[#071014]"
                    }`}
                  >
                    {isExpired ? (
                      <AlertTriangle className="size-5" />
                    ) : (
                      <Clock3 className="size-5" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <CardTitle className="truncate">
                      {entry.item.productName}
                    </CardTitle>
                    <CardDescription className="truncate">
                      {entry.item.category} · {entry.item.storeName}
                    </CardDescription>
                  </div>
                </div>
                <CardAction>
                  <Badge
                    className={
                      isExpired
                        ? "bg-rose-300 text-[#071014]"
                        : isSoon
                          ? "bg-amber-300 text-[#071014]"
                          : "bg-emerald-300 text-[#071014]"
                    }
                  >
                    {statusText}
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-[#0b1218] p-3">
                    <p className="text-xs text-muted-foreground">Придатний до</p>
                    <p className="mt-1 font-medium">{formatExpiryDate(expiresAt)}</p>
                  </div>
                  <div className="rounded-lg bg-[#0b1218] p-3">
                    <p className="text-xs text-muted-foreground">Кількість</p>
                    <p className="mt-1 font-medium">
                      {entry.item.quantity} {formatUnit(entry.item.priceType)}
                    </p>
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={() => onConsume(entry.purchaseId, entry.item.productId)}
                  variant="outline"
                >
                  <Check className="size-4" />
                  Використано
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!entries.length ? (
        <Card className="rounded-lg border-white/10 bg-white/6">
          <CardContent className="flex min-h-56 flex-col items-center justify-center gap-3 p-6 text-center">
            <Check className="size-8 text-emerald-300" />
            <div>
              <p className="font-semibold">Активних нагадувань немає</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Заверши покупку або всі придбані продукти вже використані.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function ShoppingOptimizer({
  allStoresRoute,
  bestSingle,
  bestTwo,
  onApply,
  shoppingItemCount,
  stores,
}: {
  allStoresRoute: ShoppingRoute;
  bestSingle: ShoppingRoute | null;
  bestTwo: ShoppingRoute | null;
  onApply: (route: ShoppingRoute) => void;
  shoppingItemCount: number;
  stores: Store[];
}) {
  const recommendedRoute = bestTwo ?? allStoresRoute;
  const savingsVsSingle =
    bestSingle && recommendedRoute.missingProductIds.length === 0
      ? Math.max(0, bestSingle.total - recommendedRoute.total)
      : 0;
  const maximumSavings =
    bestSingle && allStoresRoute.missingProductIds.length === 0
      ? Math.max(0, bestSingle.total - allStoresRoute.total)
      : 0;
  const groupedItems = recommendedRoute.items.reduce<
    Array<{ store: Store; items: ShoppingRouteItem[]; total: number }>
  >((groups, item) => {
    const existing = groups.find((group) => group.store.id === item.store.id);
    if (existing) {
      existing.items.push(item);
      existing.total += item.total;
      return groups;
    }

    groups.push({ store: item.store, items: [item], total: item.total });
    return groups;
  }, []);

  if (!shoppingItemCount) {
    return (
      <div className="space-y-4">
        <SectionHeader
          description="Додай товари, щоб порівняти маршрути"
          title="Оптимізатор покупки"
        />
        <Card className="rounded-lg border-white/10 bg-white/6">
          <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 p-6 text-center">
            <RouteIcon className="size-8 text-muted-foreground" />
            <div>
              <p className="font-semibold">Шоп-ліст порожній</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Додай товари, і оптимізатор знайде найвигідніший розподіл.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const routeOptions = [
    {
      title: "Один магазин",
      route: bestSingle,
      value: bestSingle?.total ?? 0,
      note: "Найпростіший маршрут",
    },
    {
      title: "До двох магазинів",
      route: bestTwo,
      value: bestTwo?.total ?? 0,
      note: "Рекомендований баланс",
    },
    {
      title: "Максимальна економія",
      route: allStoresRoute,
      value: allStoresRoute.total,
      note: "Найнижча ціна кожної позиції",
    },
  ];

  return (
    <div className="space-y-4">
      <SectionHeader
        description="Порівняння зручності маршруту та загальної вартості кошика"
        title="Оптимізатор покупки"
      />

      <div className="grid gap-4 md:grid-cols-3">
        {routeOptions.map((option, index) => {
          const route = option.route;
          const isAvailable = route && route.missingProductIds.length === 0;

          return (
            <Card
              className={`rounded-lg bg-white/6 ${
                index === 1 ? "border-emerald-300/50" : "border-white/10"
              }`}
              key={option.title}
            >
              <CardHeader>
                <CardDescription>{option.note}</CardDescription>
                <CardTitle className="text-xl">
                  {isAvailable ? formatCurrency(option.value) : "Немає всіх цін"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm font-medium">{option.title}</p>
                <div className="flex flex-wrap gap-1">
                  {route?.storeIds.map((storeId) => {
                    const store = stores.find((item) => item.id === storeId);
                    return store ? (
                      <Badge key={store.id} variant="secondary">
                        <span className={`mr-2 size-2 rounded-full ${store.color}`} />
                        {store.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
                {index === 1 ? (
                  <Button
                    className="w-full"
                    disabled={!isAvailable}
                    onClick={() => route && onApply(route)}
                  >
                    <RouteIcon className="size-4" />
                    Застосувати маршрут
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <SectionHeader
            description={`${formatCountUk(recommendedRoute.storeIds.length, ["магазин", "магазини", "магазинів"])} · ${formatCountUk(recommendedRoute.items.length, ["позиція", "позиції", "позицій"])}`}
            title="Рекомендований маршрут"
          />
          <div className="grid gap-4 lg:grid-cols-2">
            {groupedItems.map((group) => (
              <Card
                className="rounded-lg border-white/10 bg-white/6"
                key={group.store.id}
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <span className={`size-3 rounded-full ${group.store.color}`} />
                    <CardTitle>{group.store.name}</CardTitle>
                  </div>
                  <CardDescription>{formatCurrency(group.total)}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {group.items.map((item) => (
                    <div
                      className="grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-2 rounded-lg bg-[#0b1218] p-2"
                      key={item.product.id}
                    >
                      <ProductPhoto className="size-9" product={item.product} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} {formatUnit(item.product.priceType)} ·{" "}
                          {formatCurrency(item.price.price)}/{formatUnit(item.product.priceType)}
                        </p>
                      </div>
                      <span className="text-sm font-semibold">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="h-fit rounded-lg border-white/10 bg-white/6">
          <CardHeader>
            <CardTitle>Результат оптимізації</CardTitle>
            <CardDescription>Порівняно з покупкою в одному магазині</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-[#0b1218] p-4">
              <p className="text-sm text-muted-foreground">Економія маршруту</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-300">
                {formatCurrency(savingsVsSingle)}
              </p>
            </div>
            <div className="rounded-lg bg-[#0b1218] p-4">
              <p className="text-sm text-muted-foreground">Максимально можливо</p>
              <p className="mt-1 text-xl font-semibold">
                {formatCurrency(maximumSavings)}
              </p>
            </div>
            <Button
              className="w-full"
              disabled={recommendedRoute.missingProductIds.length > 0}
              onClick={() => onApply(recommendedRoute)}
            >
              <RouteIcon className="size-4" />
              Застосувати рекомендований маршрут
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const analyticsColors = [
  "#34d399",
  "#7dd3fc",
  "#fda4af",
  "#67e8f9",
  "#fcd34d",
  "#c4b5fd",
  "#fb923c",
  "#94a3b8",
];

function AnalyticsTooltip({
  active,
  formatter,
  label,
  payload,
}: {
  active?: boolean;
  formatter?: (value: number, name: string) => [string, string] | string;
  label?: string;
  payload?: Array<{
    color?: string;
    dataKey?: string;
    name?: string;
    value?: number;
  }>;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-white/10 bg-[#10181d] px-3 py-2 text-sm text-white shadow-xl shadow-black/30">
      {label ? <p className="mb-1 font-semibold text-white">{label}</p> : null}
      <div className="space-y-1">
        {payload.map((item) => {
          const rawValue = Number(item.value ?? 0);
          const formatted = formatter?.(
            rawValue,
            item.name ?? String(item.dataKey ?? ""),
          );
          const value = Array.isArray(formatted)
            ? formatted[0]
            : formatted ?? formatCurrency(rawValue);
          const name = Array.isArray(formatted)
            ? formatted[1]
            : item.name ?? item.dataKey ?? "";

          return (
            <div
              className="flex min-w-36 items-center justify-between gap-4"
              key={`${item.dataKey ?? item.name}-${rawValue}`}
            >
              <span className="flex min-w-0 items-center gap-2 text-slate-300">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color ?? "#94a3b8" }}
                />
                <span className="truncate">{name}</span>
              </span>
              <span className="font-semibold text-white">{value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AnalyticsDashboard({
  categorySpend,
  purchases,
  potentialSavings,
  selectedStoreIds,
  storeTotals,
  weekBudget,
  weekPlanned,
  weeklySpendData,
}: {
  categorySpend: Array<{ category: string; amount: number; color: string }>;
  purchases: Purchase[];
  potentialSavings: number;
  selectedStoreIds: string[];
  storeTotals: StoreTotal[];
  weekBudget: number;
  weekPlanned: number;
  weeklySpendData: Array<{ day: string; budget: number; planned: number }>;
}) {
  const selectedStores = storeTotals.filter((item) =>
    selectedStoreIds.includes(item.store.id),
  );
  const storeChartData = selectedStores.map((item) => ({
    name: item.store.name,
    total: Math.round(item.total),
  }));
  const categoryChartData = categorySpend.map((item) => ({
    name: item.category,
    value: Math.round(item.amount),
  }));
  const totalActualSpend = purchases.reduce(
    (sum, purchase) => sum + purchase.total,
    0,
  );
  const averageReceipt = purchases.length
    ? totalActualSpend / purchases.length
    : 0;
  const purchaseTrendData = [...purchases]
    .reverse()
    .slice(-10)
    .map((purchase) => ({
      date: new Intl.DateTimeFormat("uk-UA", {
        day: "2-digit",
        month: "2-digit",
      }).format(new Date(purchase.purchasedAt)),
      total: Math.round(purchase.total),
    }));
  const budgetUsage = weekBudget ? Math.round((weekPlanned / weekBudget) * 100) : 0;

  return (
    <div className="space-y-4">
      <SectionHeader
        description="Планові витрати, структура кошика та порівняння вибраних магазинів"
        title="Детальна аналітика"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          description="Фактичні витрати"
          title={formatCurrency(totalActualSpend)}
          value={`${formatCountUk(purchases.length, ["завершена покупка", "завершені покупки", "завершених покупок"])}`}
        />
        <MetricCard
          description="Середній чек"
          title={formatCurrency(averageReceipt)}
          value="За історією завершених покупок"
        />
        <MetricCard
          description="План на тиждень"
          title={formatCurrency(weekPlanned)}
          value={`${budgetUsage}% від бюджету ${formatCurrency(weekBudget)}`}
        />
        <MetricCard
          description="Можлива економія"
          title={formatCurrency(potentialSavings)}
          value="Між найдешевшим і найдорожчим кошиком"
        />
      </div>

      <Card className="rounded-lg border-white/10 bg-white/6">
        <CardHeader>
          <CardTitle>Фактичні витрати за покупками</CardTitle>
          <CardDescription>
            Останні завершені покупки з історії
          </CardDescription>
        </CardHeader>
        <CardContent>
          {purchaseTrendData.length ? (
            <div className="h-72 w-full">
              <ResponsiveContainer height="100%" width="100%">
                <LineChart data={purchaseTrendData} margin={{ left: 0, right: 16 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis
                    axisLine={false}
                    dataKey="date"
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis
                    axisLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    tickFormatter={(value) => `${value} ₴`}
                    tickLine={false}
                    width={62}
                  />
                  <ChartTooltip
                    content={
                      <AnalyticsTooltip
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                    }
                    cursor={{ stroke: "rgba(125, 211, 252, 0.35)" }}
                  />
                  <Line
                    activeDot={{ r: 5, fill: "#7dd3fc" }}
                    dataKey="total"
                    dot={{ r: 3, fill: "#7dd3fc" }}
                    name="Чек"
                    stroke="#7dd3fc"
                    strokeWidth={3}
                    type="monotone"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              Заверши покупку, щоб побачити фактичну динаміку витрат.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(340px,1fr)]">
        <Card className="rounded-lg border-white/10 bg-white/6">
          <CardHeader>
            <CardTitle>Планові витрати по днях</CardTitle>
            <CardDescription>
              Порівняння вартості запланованих продуктів із денним бюджетом
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer height="100%" width="100%">
                <LineChart data={weeklySpendData} margin={{ left: 0, right: 16 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis
                    axisLine={false}
                    dataKey="day"
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis
                    axisLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    tickFormatter={(value) => `${value} ₴`}
                    tickLine={false}
                    width={62}
                  />
                  <ChartTooltip
                    content={
                      <AnalyticsTooltip
                        formatter={(value, name) => [
                          formatCurrency(Number(value)),
                          name === "planned" ? "Заплановано" : "Бюджет",
                        ]}
                      />
                    }
                    cursor={{ stroke: "rgba(52, 211, 153, 0.35)" }}
                  />
                  <Line
                    dataKey="budget"
                    dot={false}
                    name="budget"
                    stroke="#64748b"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    type="monotone"
                  />
                  <Line
                    activeDot={{ r: 5, fill: "#34d399" }}
                    dataKey="planned"
                    dot={{ r: 3, fill: "#34d399" }}
                    name="planned"
                    stroke="#34d399"
                    strokeWidth={3}
                    type="monotone"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-400" />
                Заплановано
              </span>
              <span className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-slate-500" />
                Денний бюджет
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-white/10 bg-white/6">
          <CardHeader>
            <CardTitle>Структура шоп-ліста</CardTitle>
            <CardDescription>Частка витрат за категоріями</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryChartData.length ? (
              <>
                <div className="h-64 w-full">
                  <ResponsiveContainer height="100%" width="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        dataKey="value"
                        innerRadius={62}
                        nameKey="name"
                        outerRadius={96}
                        paddingAngle={3}
                      >
                        {categoryChartData.map((item, index) => (
                          <Cell
                            fill={analyticsColors[index % analyticsColors.length]}
                            key={item.name}
                            stroke="transparent"
                          />
                        ))}
                      </Pie>
                      <ChartTooltip
                        content={
                          <AnalyticsTooltip
                            formatter={(value) => formatCurrency(Number(value))}
                          />
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                  {categoryChartData.map((item, index) => (
                    <div
                      className="flex items-center justify-between gap-3 text-sm"
                      key={item.name}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          className="size-2 shrink-0 rounded-full"
                          style={{
                            backgroundColor:
                              analyticsColors[index % analyticsColors.length],
                          }}
                        />
                        <span className="truncate text-muted-foreground">
                          {item.name}
                        </span>
                      </span>
                      <span className="font-medium">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
                Додай товари у шоп-ліст для побудови діаграми.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-lg border-white/10 bg-white/6">
        <CardHeader>
          <CardTitle>Порівняння вартості кошика</CardTitle>
          <CardDescription>
            Скільки коштуватиме поточний шоп-ліст у вибраних магазинах
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={storeChartData} margin={{ left: 0, right: 16 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis
                  axisLine={false}
                  dataKey="name"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis
                  axisLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  tickFormatter={(value) => `${value} ₴`}
                  tickLine={false}
                  width={62}
                />
                <ChartTooltip
                  content={
                    <AnalyticsTooltip
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                  }
                  cursor={false}
                />
                <Bar dataKey="total" name="Кошик" radius={[5, 5, 0, 0]}>
                  {storeChartData.map((item, index) => (
                    <Cell
                      fill={analyticsColors[index % analyticsColors.length]}
                      key={item.name}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StoreTotalsCard({
  selectedStoreIds,
  storeTotals,
}: {
  selectedStoreIds: string[];
  storeTotals: StoreTotal[];
}) {
  const selectedTotals = storeTotals.filter((item) =>
    selectedStoreIds.includes(item.store.id),
  );
  const maxTotal = Math.max(1, ...selectedTotals.map((item) => item.total));

  return (
    <Card className="rounded-lg border-white/10 bg-white/6">
      <CardHeader>
        <CardTitle>Порівняння кошика</CardTitle>
        <CardDescription>Сума, якщо купувати все в одному магазині</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedTotals
          .sort((a, b) => a.total - b.total)
          .map((item, index) => (
            <div className="space-y-2" key={item.store.id}>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={`size-2 rounded-full ${item.store.color}`} />
                  <span>{item.store.name}</span>
                  {index === 0 ? (
                    <Badge className="bg-emerald-300 text-[#071014]">дешевше</Badge>
                  ) : null}
                </div>
                <span className="font-medium">{formatCurrency(item.total)}</span>
              </div>
              <Progress className="h-2" value={(item.total / maxTotal) * 100} />
              {item.missingCount > 0 ? (
                <p className="text-xs text-muted-foreground">
                  Немає цін для {item.missingCount} позицій
                </p>
              ) : null}
            </div>
          ))}
      </CardContent>
    </Card>
  );
}

function WeeklyPlanGrid({
  plan,
  prices,
  products,
  selectedStoreIds,
  stores,
  onAddDayToShoppingList,
  onAddItem,
  onBudgetChange,
  onDecrease,
  onIncrease,
  onRemoveItem,
}: {
  plan: WeekPlanDay[];
  prices: ProductPrice[];
  products: Product[];
  selectedStoreIds: string[];
  stores: Store[];
  onAddDayToShoppingList: (dayName: string) => void;
  onAddItem: (dayName: string, productId: string) => void;
  onBudgetChange: (dayName: string, budget: number) => void;
  onDecrease: (
    dayName: string,
    product: Product,
    direction: "increase" | "decrease",
  ) => void;
  onIncrease: (
    dayName: string,
    product: Product,
    direction: "increase" | "decrease",
  ) => void;
  onRemoveItem: (dayName: string, productId: string) => void;
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-4">
      {plan.map((day) => {
        const planned = getWeekDayTotal(day, products, prices, selectedStoreIds);
        const value = day.budget ? Math.round((planned / day.budget) * 100) : 0;
        const productOptions = products.filter(
          (product) =>
            !day.items.some((item) => item.productId === product.id),
        );

        return (
          <Card
            className="rounded-lg border-white/10 bg-white/6"
            key={day.day}
            size="sm"
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>{day.day}</CardTitle>
                  <CardDescription>{formatCurrency(planned)} заплановано</CardDescription>
                </div>
                <Badge
                  className={
                    planned <= day.budget
                      ? "bg-emerald-300 text-[#071014]"
                      : "bg-rose-300 text-[#071014]"
                  }
                >
                  {planned <= day.budget ? "в бюджеті" : "понад"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress className="h-2" value={Math.min(100, value)} />
              <label className="grid gap-1.5 text-xs text-muted-foreground">
                Бюджет дня
                <Input
                  className="h-9 text-sm text-white"
                  min={0}
                  onChange={(event) =>
                    onBudgetChange(day.day, Number(event.target.value) || 0)
                  }
                  type="number"
                  value={day.budget}
                />
              </label>

              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                <select
                  className="h-9 rounded-lg border border-white/10 bg-[#0b1218] px-3 text-sm text-white outline-none transition focus:border-emerald-300"
                  disabled={!productOptions.length}
                  onChange={(event) => {
                    if (event.target.value) {
                      onAddItem(day.day, event.target.value);
                      event.currentTarget.value = "";
                    }
                  }}
                  value=""
                >
                  <option value="">
                    {productOptions.length ? "Додати продукт" : "Усі продукти додано"}
                  </option>
                  {productOptions.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                <Button
                  disabled={!day.items.length}
                  onClick={() => onAddDayToShoppingList(day.day)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <ListPlus className="size-4" />
                  У шоп-ліст
                </Button>
              </div>

              <div className="space-y-2">
                {day.items.map((item) => {
                  const product = products.find(
                    (candidate) => candidate.id === item.productId,
                  );
                  if (!product) return null;

                  const bestPrice = getBestPrice(product, prices, selectedStoreIds);
                  const bestStore = bestPrice
                    ? stores.find((store) => store.id === bestPrice.storeId)
                    : null;

                  return (
                    <div
                      className="grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-2 rounded-lg bg-[#0b1218] p-2"
                      key={item.productId}
                    >
                      <ProductPhoto className="size-9" product={product} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{product.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {bestStore?.name ?? product.store} ·{" "}
                          {formatCurrency(
                            calculateLineTotal(product, item.quantity, bestPrice),
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          aria-label={`Зменшити кількість: ${product.name}`}
                          onClick={() => onDecrease(day.day, product, "decrease")}
                          size="icon-xs"
                          title="Зменшити кількість"
                          type="button"
                          variant="outline"
                        >
                          <Minus className="size-3" />
                        </Button>
                        <Badge className="min-w-14 justify-center" variant="secondary">
                          {item.quantity} {formatUnit(product.priceType)}
                        </Badge>
                        <Button
                          aria-label={`Збільшити кількість: ${product.name}`}
                          onClick={() => onIncrease(day.day, product, "increase")}
                          size="icon-xs"
                          title="Збільшити кількість"
                          type="button"
                          variant="outline"
                        >
                          <Plus className="size-3" />
                        </Button>
                        <Button
                          aria-label={`Видалити з плану: ${product.name}`}
                          onClick={() => onRemoveItem(day.day, product.id)}
                          size="icon-xs"
                          title="Видалити з плану"
                          type="button"
                          variant="ghost"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {!day.items.length ? (
                  <div className="rounded-lg border border-dashed border-white/10 p-3 text-sm text-muted-foreground">
                    На цей день ще немає продуктів.
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function CategorySpendCard({
  categorySpend,
  maxCategorySpend,
}: {
  categorySpend: Array<{ category: string; amount: number; color: string }>;
  maxCategorySpend: number;
}) {
  return (
    <Card className="rounded-lg border-white/10 bg-white/6">
      <CardHeader>
        <CardTitle>Витрати по категоріях</CardTitle>
        <CardDescription>На основі найкращих цін у фільтрі</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {categorySpend.map((item) => (
          <div className="space-y-2" key={item.category}>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className={`size-2 rounded-full ${item.color}`} />
                <span>{item.category}</span>
              </div>
              <span className="font-medium">{formatCurrency(item.amount)}</span>
            </div>
            <div className="h-2 rounded-full bg-white/10">
              <div
                className={`h-2 rounded-full ${item.color}`}
                style={{
                  width: `${Math.round((item.amount / maxCategorySpend) * 100)}%`,
                }}
              />
            </div>
          </div>
        ))}
        {categorySpend.length === 0 ? (
          <p className="text-sm text-muted-foreground">Список покупок порожній.</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default App;
