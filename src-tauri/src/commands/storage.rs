use crate::services::{StorageService, TimerStatistic, UserPreferences};
use std::collections::HashMap;
use std::path::PathBuf;
use tauri::State;

#[tauri::command]
pub async fn save_preferences(
    storage: State<'_, StorageService>,
    preferences: UserPreferences,
) -> Result<(), String> {
    storage
        .save_preferences(&preferences)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn load_preferences(
    storage: State<'_, StorageService>,
) -> Result<UserPreferences, String> {
    storage.load_preferences().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn save_statistic(
    storage: State<'_, StorageService>,
    statistic: TimerStatistic,
) -> Result<(), String> {
    storage
        .save_statistic(&statistic)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn load_statistics(
    storage: State<'_, StorageService>,
    from_date: Option<String>,
    to_date: Option<String>,
) -> Result<Vec<TimerStatistic>, String> {
    storage
        .load_statistics(from_date.as_deref(), to_date.as_deref())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn clear_statistics(storage: State<'_, StorageService>) -> Result<(), String> {
    storage.clear_statistics().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_storage_size(storage: State<'_, StorageService>) -> Result<u64, String> {
    storage.get_storage_size().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn export_data(
    storage: State<'_, StorageService>,
) -> Result<HashMap<String, serde_json::Value>, String> {
    storage.export_all_data().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn backup_data(
    storage: State<'_, StorageService>,
    backup_path: String,
) -> Result<(), String> {
    let path = PathBuf::from(backup_path);
    storage.backup_data(&path).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn restore_data(
    storage: State<'_, StorageService>,
    backup_path: String,
) -> Result<(), String> {
    let path = PathBuf::from(backup_path);
    storage.restore_data(&path).map_err(|e| e.to_string())
}
