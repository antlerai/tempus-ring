mod commands;
mod services;
mod tray;

use commands::{
    check_timer_completion, complete_session, get_timer_config, get_timer_state, pause_timer,
    reset_timer, start_timer, update_timer_config,
};
use services::TimerManager;
use tray::create_tray;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {name}! You've been greeted from Rust!")
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize the timer manager as application state
    let timer_manager = TimerManager::new();

    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .manage(timer_manager)
        .setup(|app| {
            // Initialize system tray
            create_tray(app)?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            start_timer,
            pause_timer,
            reset_timer,
            get_timer_state,
            update_timer_config,
            get_timer_config,
            complete_session,
            check_timer_completion
        ]);

    // 只在桌面端添加 opener 插件
    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    {
        builder = builder.plugin(tauri_plugin_opener::init());
    }

    builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
