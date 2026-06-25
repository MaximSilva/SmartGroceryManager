import { invoke } from "@tauri-apps/api/core";

export type AppTheme = "standard" | "dark" | "light";
export type AppLanguage = "uk" | "en" | "fr" | "es";

export type AppSettings = {
  theme: AppTheme;
  language: AppLanguage;
  exportDirectory: string;
  assistantEnabled: boolean;
  onboardingCompleted: boolean;
};

const settingsKey = "smart-grocery-settings";

export const defaultSettings: AppSettings = {
  theme: "standard",
  language: "uk",
  exportDirectory: "",
  assistantEnabled: true,
  onboardingCompleted: false,
};

export function loadAppSettings(): AppSettings {
  try {
    const value = localStorage.getItem(settingsKey);
    return value ? { ...defaultSettings, ...JSON.parse(value) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export function saveAppSettings(settings: AppSettings) {
  localStorage.setItem(settingsKey, JSON.stringify(settings));
}

export async function selectExportDirectory() {
  return invoke<string | null>("select_export_folder");
}
