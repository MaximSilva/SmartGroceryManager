import { invoke } from "@tauri-apps/api/core";

import type { Purchase } from "@/lib/grocery-data";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getReportSummary(purchases: Purchase[]) {
  const total = purchases.reduce((sum, purchase) => sum + purchase.total, 0);
  return {
    total,
    average: purchases.length ? total / purchases.length : 0,
    items: purchases.reduce((sum, purchase) => sum + purchase.items.length, 0),
  };
}

function getFilename(extension: "xlsx" | "pdf") {
  return `Smart_Grocery_History_${new Date().toISOString().slice(0, 10)}.${extension}`;
}

async function saveAndOpen(
  filename: string,
  bytes: Uint8Array,
  exportDirectory: string,
) {
  const path = await invoke<string>("save_export_file", {
    filename,
    bytes: Array.from(bytes),
    directory: exportDirectory || null,
  });

  return path;
}

export async function exportPurchasesToExcel(
  purchases: Purchase[],
  exportDirectory = "",
) {
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  const summary = getReportSummary(purchases);

  workbook.creator = "Smart Grocery Manager";
  workbook.created = new Date();

  const summarySheet = workbook.addWorksheet("Підсумок");
  summarySheet.columns = [
    { header: "Показник", key: "label", width: 28 },
    { header: "Значення", key: "value", width: 28 },
  ];
  summarySheet.addRows([
    { label: "Завершених покупок", value: purchases.length },
    { label: "Загальні витрати", value: summary.total },
    { label: "Середній чек", value: summary.average },
    { label: "Кількість позицій", value: summary.items },
    { label: "Дата формування", value: formatDate(new Date().toISOString()) },
  ]);
  summarySheet.getColumn("value").numFmt = '#,##0.00 "грн"';

  const purchasesSheet = workbook.addWorksheet("Покупки");
  purchasesSheet.columns = [
    { header: "Дата", key: "date", width: 24 },
    { header: "Номер чека", key: "id", width: 38 },
    { header: "Позицій", key: "items", width: 14 },
    { header: "Магазини", key: "stores", width: 32 },
    { header: "Сума", key: "total", width: 18 },
  ];
  purchases.forEach((purchase) => {
    purchasesSheet.addRow({
      date: formatDate(purchase.purchasedAt),
      id: purchase.id,
      items: purchase.items.length,
      stores: Array.from(new Set(purchase.items.map((item) => item.storeName))).join(", "),
      total: purchase.total,
    });
  });
  purchasesSheet.getColumn("total").numFmt = '#,##0.00 "грн"';

  const itemsSheet = workbook.addWorksheet("Товари");
  itemsSheet.columns = [
    { header: "Дата покупки", key: "date", width: 24 },
    { header: "Товар", key: "product", width: 30 },
    { header: "Категорія", key: "category", width: 26 },
    { header: "Магазин", key: "store", width: 18 },
    { header: "Кількість", key: "quantity", width: 14 },
    { header: "Ціна", key: "unitPrice", width: 16 },
    { header: "Сума", key: "total", width: 16 },
    { header: "Придатний до", key: "expiresAt", width: 24 },
    { header: "Використано", key: "consumed", width: 16 },
  ];
  purchases.forEach((purchase) => {
    purchase.items.forEach((item) => {
      itemsSheet.addRow({
        date: formatDate(purchase.purchasedAt),
        product: item.productName,
        category: item.category,
        store: item.storeName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
        expiresAt: item.expiresAt ? formatDate(item.expiresAt) : "-",
        consumed: item.consumed ? "Так" : "Ні",
      });
    });
  });
  itemsSheet.getColumn("unitPrice").numFmt = '#,##0.00 "грн"';
  itemsSheet.getColumn("total").numFmt = '#,##0.00 "грн"';

  for (const sheet of workbook.worksheets) {
    sheet.views = [{ state: "frozen", ySplit: 1 }];
    sheet.getRow(1).font = { bold: true, color: { argb: "FF071014" } };
    sheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF6EE7B7" },
    };
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: sheet.columnCount },
    };
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return saveAndOpen(getFilename("xlsx"), new Uint8Array(buffer), exportDirectory);
}

export async function exportPurchasesToPdf(
  purchases: Purchase[],
  exportDirectory = "",
) {
  const [{ default: pdfMake }, { default: vfs }] = await Promise.all([
    import("pdfmake/build/pdfmake"),
    import("pdfmake/build/vfs_fonts"),
  ]);
  const summary = getReportSummary(purchases);

  pdfMake.addVirtualFileSystem(vfs);

  const tableBody = [
    ["Дата", "Магазини", "Позицій", "Сума"],
    ...purchases.map((purchase) => [
      formatDate(purchase.purchasedAt),
      Array.from(new Set(purchase.items.map((item) => item.storeName))).join(", "),
      String(purchase.items.length),
      formatCurrency(purchase.total),
    ]),
  ];
  const definition = {
    pageSize: "A4",
    pageMargins: [36, 42, 36, 42],
    content: [
      { text: "Smart Grocery Manager", style: "brand" },
      { text: "Звіт історії покупок", style: "title" },
      {
        text: `Сформовано: ${formatDate(new Date().toISOString())}`,
        color: "#64748b",
        margin: [0, 0, 0, 18],
      },
      {
        columns: [
          { text: `Покупок\n${purchases.length}`, style: "metric" },
          { text: `Загальні витрати\n${formatCurrency(summary.total)}`, style: "metric" },
          { text: `Середній чек\n${formatCurrency(summary.average)}`, style: "metric" },
        ],
        columnGap: 12,
        margin: [0, 0, 0, 20],
      },
      { text: "Завершені покупки", style: "section" },
      {
        table: {
          headerRows: 1,
          widths: [100, "*", 54, 80],
          body: tableBody,
        },
        layout: {
          fillColor: (rowIndex: number) => (rowIndex === 0 ? "#d1fae5" : null),
          hLineColor: () => "#dce5e2",
          vLineColor: () => "#dce5e2",
        },
      },
    ],
    defaultStyle: {
      font: "Roboto",
      fontSize: 9,
      color: "#172126",
    },
    styles: {
      brand: { fontSize: 10, bold: true, color: "#059669" },
      title: { fontSize: 22, bold: true, margin: [0, 4, 0, 4] },
      section: { fontSize: 14, bold: true, margin: [0, 0, 0, 8] },
      metric: {
        bold: true,
        fontSize: 11,
        color: "#172126",
        fillColor: "#f1f5f4",
        margin: [8, 8, 8, 8],
      },
    },
  };

  const buffer = await pdfMake.createPdf(definition).getBuffer();
  return saveAndOpen(getFilename("pdf"), new Uint8Array(buffer), exportDirectory);
}
