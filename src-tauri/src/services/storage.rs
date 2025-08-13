use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use tauri::Manager;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum StorageError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),
    #[error("App data directory not available")]
    NoAppDataDir,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserPreferences {
    pub theme: String,
    pub language: String,
    pub work_duration: u32,
    pub short_break_duration: u32,
    pub long_break_duration: u32,
    pub sessions_until_long_break: u32,
    pub auto_start_breaks: bool,
    pub auto_start_pomodoros: bool,
    pub sound_enabled: bool,
    pub notifications_enabled: bool,
    pub volume: f32,
}

impl Default for UserPreferences {
    fn default() -> Self {
        Self {
            theme: "cloudlight".to_string(),
            language: "en".to_string(),
            work_duration: 1500,
            short_break_duration: 300,
            long_break_duration: 900,
            sessions_until_long_break: 4,
            auto_start_breaks: false,
            auto_start_pomodoros: false,
            sound_enabled: true,
            notifications_enabled: true,
            volume: 0.7,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionData {
    pub start_time: String,
    pub end_time: String,
    pub session_type: String,
    pub completed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimerStatistic {
    pub id: String,
    pub date: String,
    pub completed_pomodoros: u32,
    pub total_work_time: u32,
    pub total_break_time: u32,
    pub sessions: Vec<SessionData>,
}

pub struct StorageService {
    app_data_dir: PathBuf,
}

impl StorageService {
    pub fn new(app_handle: &tauri::AppHandle) -> Result<Self, StorageError> {
        let app_data_dir = app_handle
            .path()
            .app_data_dir()
            .map_err(|_| StorageError::NoAppDataDir)?;

        if !app_data_dir.exists() {
            fs::create_dir_all(&app_data_dir)?;
        }

        Ok(Self { app_data_dir })
    }

    pub fn save_preferences(&self, preferences: &UserPreferences) -> Result<(), StorageError> {
        let file_path = self.app_data_dir.join("preferences.json");
        let json_data = serde_json::to_string_pretty(preferences)?;
        fs::write(file_path, json_data)?;
        Ok(())
    }

    pub fn load_preferences(&self) -> Result<UserPreferences, StorageError> {
        let file_path = self.app_data_dir.join("preferences.json");

        if !file_path.exists() {
            return Ok(UserPreferences::default());
        }

        let json_data = fs::read_to_string(file_path)?;
        let preferences: UserPreferences = serde_json::from_str(&json_data)?;
        Ok(preferences)
    }

    pub fn save_statistic(&self, statistic: &TimerStatistic) -> Result<(), StorageError> {
        let stats_dir = self.app_data_dir.join("statistics");
        if !stats_dir.exists() {
            fs::create_dir_all(&stats_dir)?;
        }

        let file_path = stats_dir.join(format!("{}.json", statistic.date));
        let json_data = serde_json::to_string_pretty(statistic)?;
        fs::write(file_path, json_data)?;
        Ok(())
    }

    pub fn load_statistics(
        &self,
        from_date: Option<&str>,
        to_date: Option<&str>,
    ) -> Result<Vec<TimerStatistic>, StorageError> {
        let stats_dir = self.app_data_dir.join("statistics");

        if !stats_dir.exists() {
            return Ok(Vec::new());
        }

        let mut statistics = Vec::new();

        for entry in fs::read_dir(stats_dir)? {
            let entry = entry?;
            let path = entry.path();

            if path.extension().and_then(|s| s.to_str()) == Some("json") {
                if let Ok(json_data) = fs::read_to_string(&path) {
                    if let Ok(stat) = serde_json::from_str::<TimerStatistic>(&json_data) {
                        if self.is_date_in_range(&stat.date, from_date, to_date) {
                            statistics.push(stat);
                        }
                    }
                }
            }
        }

        statistics.sort_by(|a, b| a.date.cmp(&b.date));
        Ok(statistics)
    }

    pub fn clear_statistics(&self) -> Result<(), StorageError> {
        let stats_dir = self.app_data_dir.join("statistics");

        if stats_dir.exists() {
            fs::remove_dir_all(&stats_dir)?;
            fs::create_dir_all(&stats_dir)?;
        }

        Ok(())
    }

    pub fn get_storage_size(&self) -> Result<u64, StorageError> {
        let mut total_size = 0;

        if let Ok(entries) = fs::read_dir(&self.app_data_dir) {
            for entry in entries.flatten() {
                if let Ok(metadata) = entry.metadata() {
                    if metadata.is_file() {
                        total_size += metadata.len();
                    } else if metadata.is_dir() {
                        total_size += Self::get_dir_size(&entry.path())?;
                    }
                }
            }
        }

        Ok(total_size)
    }

    fn get_dir_size(dir_path: &PathBuf) -> Result<u64, StorageError> {
        let mut size = 0;

        if let Ok(entries) = fs::read_dir(dir_path) {
            for entry in entries.flatten() {
                if let Ok(metadata) = entry.metadata() {
                    if metadata.is_file() {
                        size += metadata.len();
                    } else if metadata.is_dir() {
                        size += Self::get_dir_size(&entry.path())?;
                    }
                }
            }
        }

        Ok(size)
    }

    fn is_date_in_range(&self, date: &str, from_date: Option<&str>, to_date: Option<&str>) -> bool {
        if let Some(from) = from_date {
            if date < from {
                return false;
            }
        }

        if let Some(to) = to_date {
            if date > to {
                return false;
            }
        }

        true
    }

    pub fn export_all_data(&self) -> Result<HashMap<String, serde_json::Value>, StorageError> {
        let mut data = HashMap::new();

        if let Ok(preferences) = self.load_preferences() {
            data.insert(
                "preferences".to_string(),
                serde_json::to_value(preferences)?,
            );
        }

        if let Ok(statistics) = self.load_statistics(None, None) {
            data.insert("statistics".to_string(), serde_json::to_value(statistics)?);
        }

        Ok(data)
    }

    pub fn backup_data(&self, backup_path: &PathBuf) -> Result<(), StorageError> {
        let data = self.export_all_data()?;
        let json_data = serde_json::to_string_pretty(&data)?;
        fs::write(backup_path, json_data)?;
        Ok(())
    }

    pub fn restore_data(&self, backup_path: &PathBuf) -> Result<(), StorageError> {
        let json_data = fs::read_to_string(backup_path)?;
        let data: HashMap<String, serde_json::Value> = serde_json::from_str(&json_data)?;

        if let Some(preferences_value) = data.get("preferences") {
            if let Ok(preferences) =
                serde_json::from_value::<UserPreferences>(preferences_value.clone())
            {
                self.save_preferences(&preferences)?;
            }
        }

        if let Some(statistics_value) = data.get("statistics") {
            if let Ok(statistics) =
                serde_json::from_value::<Vec<TimerStatistic>>(statistics_value.clone())
            {
                for stat in statistics {
                    self.save_statistic(&stat)?;
                }
            }
        }

        Ok(())
    }
}
