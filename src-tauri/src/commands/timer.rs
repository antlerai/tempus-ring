use crate::services::{TimerConfig, TimerData, TimerManager};
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Debug, Serialize)]
pub struct CommandResult<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}

impl<T> CommandResult<T> {
    pub fn success(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
        }
    }

    pub fn error(message: String) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(message),
        }
    }
}

#[tauri::command]
pub async fn start_timer(
    timer_manager: State<'_, TimerManager>,
) -> Result<CommandResult<TimerData>, String> {
    match timer_manager.start_timer() {
        Ok(data) => Ok(CommandResult::success(data)),
        Err(err) => Ok(CommandResult::error(err)),
    }
}

#[tauri::command]
pub async fn pause_timer(
    timer_manager: State<'_, TimerManager>,
) -> Result<CommandResult<TimerData>, String> {
    match timer_manager.pause_timer() {
        Ok(data) => Ok(CommandResult::success(data)),
        Err(err) => Ok(CommandResult::error(err)),
    }
}

#[tauri::command]
pub async fn reset_timer(
    timer_manager: State<'_, TimerManager>,
) -> Result<CommandResult<TimerData>, String> {
    match timer_manager.reset_timer() {
        Ok(data) => Ok(CommandResult::success(data)),
        Err(err) => Ok(CommandResult::error(err)),
    }
}

#[tauri::command]
pub async fn get_timer_state(
    timer_manager: State<'_, TimerManager>,
) -> Result<CommandResult<TimerData>, String> {
    match timer_manager.get_timer_state() {
        Ok(data) => Ok(CommandResult::success(data)),
        Err(err) => Ok(CommandResult::error(err)),
    }
}

#[tauri::command]
pub async fn update_timer_config(
    timer_manager: State<'_, TimerManager>,
    config: TimerConfig,
) -> Result<CommandResult<TimerData>, String> {
    match timer_manager.update_config(config) {
        Ok(data) => Ok(CommandResult::success(data)),
        Err(err) => Ok(CommandResult::error(err)),
    }
}

#[tauri::command]
pub async fn get_timer_config(
    timer_manager: State<'_, TimerManager>,
) -> Result<CommandResult<TimerConfig>, String> {
    match timer_manager.get_config() {
        Ok(config) => Ok(CommandResult::success(config)),
        Err(err) => Ok(CommandResult::error(err)),
    }
}

#[tauri::command]
pub async fn complete_session(
    timer_manager: State<'_, TimerManager>,
) -> Result<CommandResult<TimerData>, String> {
    match timer_manager.complete_session() {
        Ok(data) => Ok(CommandResult::success(data)),
        Err(err) => Ok(CommandResult::error(err)),
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TimerTickData {
    pub timer_data: TimerData,
    pub session_completed: bool,
}

#[tauri::command]
pub async fn check_timer_completion(
    timer_manager: State<'_, TimerManager>,
) -> Result<CommandResult<TimerTickData>, String> {
    match timer_manager.check_if_completed() {
        Ok(completed_data) => {
            let current_data = timer_manager
                .get_timer_state()
                .map_err(|e| format!("Failed to get current state: {e}"))?;

            let tick_data = TimerTickData {
                timer_data: current_data,
                session_completed: completed_data.is_some(),
            };

            Ok(CommandResult::success(tick_data))
        }
        Err(err) => Ok(CommandResult::error(err)),
    }
}
