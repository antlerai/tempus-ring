pub mod commands;
pub mod services;
mod tray;

use commands::{
    backup_data, check_timer_completion, clear_statistics, complete_session, export_data,
    get_storage_size, get_timer_config, get_timer_state, load_preferences, load_statistics,
    pause_timer, reset_timer, restore_data, save_preferences, save_statistic, start_timer,
    update_timer_config,
};
use services::{StorageService, TimerManager};
use tauri::Manager;
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
            // Initialize storage service and add to app state
            let storage_service =
                StorageService::new(app.handle()).expect("Failed to initialize storage service");
            app.manage(storage_service);

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
            check_timer_completion,
            save_preferences,
            load_preferences,
            save_statistic,
            load_statistics,
            clear_statistics,
            get_storage_size,
            export_data,
            backup_data,
            restore_data
        ]);

    // 只在桌面端添加 opener 插件
    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    {
        builder = builder.plugin(tauri_plugin_opener::init());
    }

    // 只在启用 MCP feature 时启用 MCP 插件
    #[cfg(feature = "mcp")]
    {
        use tauri_plugin_mcp::{init_with_config, PluginConfig};

        builder = builder.plugin(init_with_config(
            PluginConfig::new("tempus-ring".to_string())
                .start_socket_server(true)
                // 使用 IPC socket (默认)
                .socket_path("/tmp/tempus-ring-mcp.sock".into()),
        ));
    }

    builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
