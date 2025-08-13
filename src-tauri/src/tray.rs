use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    App, AppHandle, Manager, Runtime,
};

use crate::services::timer_state::TimerState;
use crate::services::TimerManager;

/// Creates and configures the system tray for the Tempus Ring application
pub fn create_tray<R: Runtime>(app: &App<R>) -> tauri::Result<()> {
    // Create menu items
    let start_pause = MenuItem::with_id(app, "start_pause", "Start Timer", true, None::<&str>)?;
    let reset = MenuItem::with_id(app, "reset", "Reset Timer", true, None::<&str>)?;
    let show_hide = MenuItem::with_id(app, "show_hide", "Show/Hide Window", true, None::<&str>)?;
    let separator = MenuItem::with_id(app, "separator", "---", false, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Quit Tempus Ring", true, None::<&str>)?;

    // Create the menu
    let menu = Menu::with_items(app, &[&start_pause, &reset, &separator, &show_hide, &quit])?;

    // Create tray icon with menu
    let _tray = TrayIconBuilder::with_id("main-tray")
        .menu(&menu)
        .icon(app.default_window_icon().unwrap().clone())
        .tooltip("Tempus Ring - Pomodoro Timer")
        .on_menu_event(|app, event| {
            handle_menu_event(app, event.id.as_ref());
        })
        .on_tray_icon_event(|tray, event| {
            handle_tray_event(tray, event);
        })
        .build(app)?;

    Ok(())
}

/// Handles menu item click events from the system tray
fn handle_menu_event<R: Runtime>(app: &AppHandle<R>, menu_id: &str) {
    match menu_id {
        "start_pause" => {
            if let Some(timer_manager) = app.try_state::<TimerManager>() {
                if let Ok(timer_state) = timer_manager.get_timer_state() {
                    match timer_state.state {
                        TimerState::Idle | TimerState::Paused => {
                            let _ = timer_manager.start_timer();
                        }
                        TimerState::Work | TimerState::ShortBreak | TimerState::LongBreak => {
                            let _ = timer_manager.pause_timer();
                        }
                    }
                    // Update menu item text based on new state
                    update_tray_menu(app);
                }
            }
        }
        "reset" => {
            if let Some(timer_manager) = app.try_state::<TimerManager>() {
                let _ = timer_manager.reset_timer();
                update_tray_menu(app);
            }
        }
        "show_hide" => {
            if let Some(window) = app.get_webview_window("main") {
                if window.is_visible().unwrap_or(false) {
                    let _ = window.hide();
                } else {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
        }
        "quit" => {
            app.exit(0);
        }
        _ => {}
    }
}

/// Handles tray icon click events (left/right click)
fn handle_tray_event<R: Runtime>(tray: &tauri::tray::TrayIcon<R>, event: TrayIconEvent) {
    match event {
        TrayIconEvent::Click {
            button: MouseButton::Left,
            button_state: MouseButtonState::Up,
            ..
        } => {
            // Left click: toggle window visibility
            if let Some(app) = tray.app_handle().get_webview_window("main") {
                if app.is_visible().unwrap_or(false) {
                    let _ = app.hide();
                } else {
                    let _ = app.show();
                    let _ = app.set_focus();
                }
            }
        }
        TrayIconEvent::Click {
            button: MouseButton::Right,
            button_state: MouseButtonState::Up,
            ..
        } => {
            // Right click: show context menu (handled automatically)
        }
        _ => {}
    }
}

/// Updates the tray menu based on current timer state
fn update_tray_menu<R: Runtime>(app: &AppHandle<R>) {
    if let Some(timer_manager) = app.try_state::<TimerManager>() {
        if let Ok(_timer_state) = timer_manager.get_timer_state() {
            // Note: In Tauri 2.0, menu items can't be updated dynamically after creation
            // This is a known limitation. We'll update the tooltip instead.
            update_tray_tooltip(app);
        }
    }
}

/// Updates tray tooltip with current timer information
pub fn update_tray_tooltip<R: Runtime>(app: &AppHandle<R>) {
    if let Some(timer_manager) = app.try_state::<TimerManager>() {
        if let Ok(timer_state) = timer_manager.get_timer_state() {
            let remaining_minutes = timer_state.remaining_time / 60;
            let remaining_seconds = timer_state.remaining_time % 60;

            let tooltip = match timer_state.state {
                TimerState::Idle => "Tempus Ring - Timer Ready".to_string(),
                TimerState::Work => {
                    format!("Tempus Ring - Work: {remaining_minutes}:{remaining_seconds:02}")
                }
                TimerState::ShortBreak => {
                    format!("Tempus Ring - Short Break: {remaining_minutes}:{remaining_seconds:02}")
                }
                TimerState::LongBreak => {
                    format!("Tempus Ring - Long Break: {remaining_minutes}:{remaining_seconds:02}")
                }
                TimerState::Paused => {
                    format!("Tempus Ring - Paused: {remaining_minutes}:{remaining_seconds:02}")
                }
            };

            if let Some(tray) = app.tray_by_id("main-tray") {
                let _ = tray.set_tooltip(Some(tooltip));
            }
        }
    }
}
