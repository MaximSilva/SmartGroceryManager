# Smart Grocery Manager

Smart Grocery Manager is a modern Windows desktop grocery planning app built with Tauri, React, TypeScript, and SQLite.

It helps manage grocery products, build smart shopping lists, compare prices across stores, plan weekly purchases, track expiration dates, analyze spending, and export reports to Excel/PDF.

## Features

- Product database with categories, prices, stores, photos, and expiration info
- Smart shopping list with automatic price calculation
- Weekly grocery planner saved locally
- Store price comparison and store filters
- Spending analytics with charts and history
- Multi-language interface
- Theme settings
- Excel/PDF export
- Offline local storage with SQLite
- New user assistant/onboarding

## Download

The Windows installer is available from the GitHub Releases page.

## Development

```powershell
npm install
npm run dev
```

Build the Windows app:

```powershell
npm run tauri build
```

## Tech Stack

- Tauri 2
- React
- TypeScript
- Vite
- Tailwind CSS
- SQLite
- Recharts
