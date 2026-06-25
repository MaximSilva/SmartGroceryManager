use serde_json::Value;
use std::{fs, path::PathBuf, process::Command};

const ZAKAZ_API_ROOT: &str = "https://stores-api.zakaz.ua";
const NOVUS_RETROVILLE_STORE_ID: &str = "48201031";
const WIKIMEDIA_COMMONS_API_ROOT: &str = "https://commons.wikimedia.org/w/api.php";

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn save_export_file(
    filename: String,
    bytes: Vec<u8>,
    directory: Option<String>,
) -> Result<String, String> {
    let safe_filename: String = filename
        .chars()
        .map(|character| {
            if matches!(character, '<' | '>' | ':' | '"' | '/' | '\\' | '|' | '?' | '*') {
                '_'
            } else {
                character
            }
        })
        .collect();
    let user_profile =
        std::env::var("USERPROFILE").map_err(|_| "Не вдалося знайти папку користувача".to_string())?;
    let downloads = directory
        .filter(|value| !value.trim().is_empty())
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from(user_profile).join("Downloads"));

    fs::create_dir_all(&downloads)
        .map_err(|error| format!("Не вдалося відкрити папку Downloads: {error}"))?;

    let target = downloads.join(safe_filename);
    fs::write(&target, bytes)
        .map_err(|error| format!("Не вдалося зберегти файл експорту: {error}"))?;

    Command::new("cmd")
        .args(["/C", "start", ""])
        .arg(&target)
        .spawn()
        .map_err(|error| format!("Файл збережено, але не вдалося його відкрити: {error}"))?;

    Ok(target.to_string_lossy().into_owned())
}

#[tauri::command]
fn select_export_folder() -> Result<Option<String>, String> {
    let script = r#"
Add-Type -AssemblyName System.Windows.Forms
$dialog = New-Object System.Windows.Forms.FolderBrowserDialog
$dialog.Description = 'Оберіть папку для експорту Smart Grocery Manager'
$dialog.ShowNewFolderButton = $true
if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
  [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
  Write-Output $dialog.SelectedPath
}
"#;
    let output = Command::new("powershell.exe")
        .args(["-NoProfile", "-STA", "-Command", script])
        .output()
        .map_err(|error| format!("Не вдалося відкрити вибір папки: {error}"))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).trim().to_string());
    }

    let selected = String::from_utf8_lossy(&output.stdout).trim().to_string();
    Ok((!selected.is_empty()).then_some(selected))
}

#[tauri::command]
async fn search_zakaz_products(query: String, store_id: Option<String>) -> Result<Value, String> {
    let query = query.trim();

    if query.len() < 2 {
        return Err("Введи мінімум 2 символи для пошуку".to_string());
    }

    let store_id = store_id.unwrap_or_else(|| NOVUS_RETROVILLE_STORE_ID.to_string());

    if store_id != NOVUS_RETROVILLE_STORE_ID {
        return Err("Цей магазин ще не підключений до Zakaz API".to_string());
    }

    let mut url = reqwest::Url::parse(&format!(
        "{ZAKAZ_API_ROOT}/stores/{store_id}/products/search/"
    ))
    .map_err(|error| format!("Не вдалося створити URL для Zakaz API: {error}"))?;
    url.query_pairs_mut().append_pair("q", query);

    let client = reqwest::Client::new();
    let response = client
        .get(url)
        .header(reqwest::header::ACCEPT, "application/json")
        .header(reqwest::header::ACCEPT_LANGUAGE, "uk-UA,uk;q=0.9,en;q=0.8")
        .header(
            reqwest::header::USER_AGENT,
            "SmartGroceryManager/0.1 (+local desktop app)",
        )
        .send()
        .await
        .map_err(|error| format!("Не вдалося підключитися до Zakaz API: {error}"))?;

    if !response.status().is_success() {
        return Err(format!(
            "Zakaz API повернув статус {}",
            response.status().as_u16()
        ));
    }

    response
        .json::<Value>()
        .await
        .map_err(|error| format!("Не вдалося прочитати відповідь Zakaz API: {error}"))
}

#[tauri::command]
async fn search_wikimedia_product_image(query: String) -> Result<String, String> {
    let query = query.trim();

    if query.len() < 2 {
        return Err("Enter a product name first.".to_string());
    }

    let mut url = reqwest::Url::parse(WIKIMEDIA_COMMONS_API_ROOT)
        .map_err(|error| format!("Could not create Wikimedia API URL: {error}"))?;
    url.query_pairs_mut()
        .append_pair("action", "query")
        .append_pair("format", "json")
        .append_pair("generator", "search")
        .append_pair("gsrnamespace", "6")
        .append_pair("gsrlimit", "12")
        .append_pair("gsrsearch", query)
        .append_pair("prop", "imageinfo")
        .append_pair("iiprop", "url|mime")
        .append_pair("iiurlwidth", "900");

    let client = reqwest::Client::new();
    let response = client
        .get(url)
        .header(reqwest::header::ACCEPT, "application/json")
        .header(
            reqwest::header::USER_AGENT,
            "SmartGroceryManager/0.1 (+local desktop app; personal project)",
        )
        .send()
        .await
        .map_err(|error| format!("Could not connect to Wikimedia Commons: {error}"))?;

    if !response.status().is_success() {
        return Err(format!(
            "Wikimedia Commons returned status {}",
            response.status().as_u16()
        ));
    }

    let body = response
        .json::<Value>()
        .await
        .map_err(|error| format!("Could not read Wikimedia Commons response: {error}"))?;
    let pages = body
        .get("query")
        .and_then(|query| query.get("pages"))
        .and_then(|pages| pages.as_object())
        .ok_or_else(|| "Wikimedia Commons did not find a matching product image.".to_string())?;

    for page in pages.values() {
        let imageinfo = page
            .get("imageinfo")
            .and_then(|imageinfo| imageinfo.as_array())
            .and_then(|items| items.first());
        let Some(imageinfo) = imageinfo else {
            continue;
        };
        let mime = imageinfo
            .get("mime")
            .and_then(|mime| mime.as_str())
            .unwrap_or("");

        if !mime.starts_with("image/") || mime.contains("svg") {
            continue;
        }

        if let Some(url) = imageinfo
            .get("thumburl")
            .or_else(|| imageinfo.get("url"))
            .and_then(|url| url.as_str())
        {
            return Ok(url.to_string());
        }
    }

    Err("Wikimedia Commons did not return a usable product photo.".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            save_export_file,
            select_export_folder,
            search_zakaz_products,
            search_wikimedia_product_image
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
