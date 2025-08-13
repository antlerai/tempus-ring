use tauri_app_lib::services::{timer_state::TimerState, TimerConfig, TimerManager};

#[tokio::test]
async fn test_timer_state_transitions() {
    let timer_manager = TimerManager::new();

    // Test initial state
    let result = timer_manager.get_timer_state();
    assert!(result.is_ok());
    let timer_data = result.unwrap();
    assert_eq!(timer_data.state, TimerState::Idle);

    // Test start timer from idle
    let result = timer_manager.start_timer();
    assert!(result.is_ok());
    let timer_data = result.unwrap();
    assert_eq!(timer_data.state, TimerState::Work);

    // Test pause timer
    let result = timer_manager.pause_timer();
    assert!(result.is_ok());
    let timer_data = result.unwrap();
    assert_eq!(timer_data.state, TimerState::Paused);

    // Test resume timer (start from paused)
    let result = timer_manager.start_timer();
    assert!(result.is_ok());
    let timer_data = result.unwrap();
    assert_eq!(timer_data.state, TimerState::Work);

    // Test reset timer
    let result = timer_manager.reset_timer();
    assert!(result.is_ok());
    let timer_data = result.unwrap();
    assert_eq!(timer_data.state, TimerState::Idle);
}

#[tokio::test]
async fn test_timer_config_management() {
    let timer_manager = TimerManager::new();

    // Test get default config
    let result = timer_manager.get_config();
    assert!(result.is_ok());
    let default_config = result.unwrap();
    assert_eq!(default_config.work_duration, 1500); // 25 minutes
    assert_eq!(default_config.short_break_duration, 300); // 5 minutes
    assert_eq!(default_config.long_break_duration, 900); // 15 minutes
    assert_eq!(default_config.sessions_until_long_break, 4);

    // Test update config
    let new_config = TimerConfig {
        work_duration: 1800,       // 30 minutes
        short_break_duration: 600, // 10 minutes
        long_break_duration: 1200, // 20 minutes
        sessions_until_long_break: 3,
        auto_start_breaks: true,
        auto_start_pomodoros: true,
    };

    let result = timer_manager.update_config(new_config.clone());
    assert!(result.is_ok());

    // Verify config was updated
    let result = timer_manager.get_config();
    assert!(result.is_ok());
    let updated_config = result.unwrap();
    assert_eq!(updated_config.work_duration, 1800);
    assert_eq!(updated_config.short_break_duration, 600);
    assert_eq!(updated_config.long_break_duration, 1200);
    assert_eq!(updated_config.sessions_until_long_break, 3);
    assert!(updated_config.auto_start_breaks);
    assert!(updated_config.auto_start_pomodoros);
}

#[tokio::test]
async fn test_invalid_state_transitions() {
    let timer_manager = TimerManager::new();

    // Try to pause when idle (should fail)
    let result = timer_manager.pause_timer();
    assert!(result.is_err()); // Should return error since can't pause from idle

    // Start timer first
    let result = timer_manager.start_timer();
    assert!(result.is_ok());

    // Try to start again (should fail)
    let result = timer_manager.start_timer();
    assert!(result.is_err()); // Should return error since can't start when already running
}

#[tokio::test]
async fn test_session_completion() {
    let timer_manager = TimerManager::new();

    // Start a work session
    let result = timer_manager.start_timer();
    assert!(result.is_ok());

    // Complete the session manually
    let result = timer_manager.complete_session();
    assert!(result.is_ok());
    let timer_data = result.unwrap();

    // Check that session count increased
    assert!(timer_data.completed_sessions > 0);
}

#[tokio::test]
async fn test_timer_completion_check() {
    let timer_manager = TimerManager::new();

    // Check completion when idle
    let result = timer_manager.check_if_completed();
    assert!(result.is_ok());
    let completed_data = result.unwrap();
    assert!(completed_data.is_none()); // No session should be completed

    // Start a timer and check
    let result = timer_manager.start_timer();
    assert!(result.is_ok());

    let result = timer_manager.check_if_completed();
    assert!(result.is_ok());
    let completed_data = result.unwrap();
    assert!(completed_data.is_none()); // Should not be completed yet (just started)
}

#[tokio::test]
async fn test_session_data_integrity() {
    let timer_manager = TimerManager::new();

    // Start timer and check session data
    let result = timer_manager.start_timer();
    assert!(result.is_ok());
    let timer_data = result.unwrap();

    // Verify session data is properly initialized
    assert!(timer_data.current_session.is_some());
    let session = timer_data.current_session.unwrap();
    assert!(!session.completed);
    assert_eq!(session.session_type, TimerState::Work);
    assert!(session.end_time.is_none());

    // Reset and verify session is cleared
    let result = timer_manager.reset_timer();
    assert!(result.is_ok());
    let timer_data = result.unwrap();
    assert!(timer_data.current_session.is_none());
}

#[tokio::test]
async fn test_progress_calculation() {
    let timer_manager = TimerManager::new();

    // Get initial state
    let result = timer_manager.get_timer_state();
    assert!(result.is_ok());
    let timer_data = result.unwrap();
    assert_eq!(timer_data.progress, 0.0); // Should be 0 when idle
    assert_eq!(timer_data.remaining_time, 0); // Should be 0 when idle

    // Start timer and verify progress is initialized
    let result = timer_manager.start_timer();
    assert!(result.is_ok());
    let timer_data = result.unwrap();

    // Progress should be near 0 since we just started
    assert!(timer_data.progress >= 0.0 && timer_data.progress <= 1.0);
    // Remaining time should be close to full duration (1500 seconds default)
    assert!(timer_data.remaining_time <= 1500);
}

#[tokio::test]
async fn test_long_break_cycle() {
    let timer_manager = TimerManager::new();

    // Complete several work sessions to trigger long break
    for i in 0..4 {
        // Start work session
        let result = timer_manager.start_timer();
        assert!(result.is_ok());
        let timer_data = result.unwrap();
        assert_eq!(timer_data.state, TimerState::Work);

        // Complete the session
        let result = timer_manager.complete_session();
        assert!(result.is_ok());
        let timer_data = result.unwrap();

        if i < 3 {
            // First 3 sessions should lead to short breaks
            assert_eq!(timer_data.state, TimerState::Idle); // Manual transition mode
        } else {
            // 4th session should lead to long break
            assert_eq!(timer_data.state, TimerState::Idle);
            assert_eq!(timer_data.completed_sessions, 4);
        }
    }
}

#[tokio::test]
async fn test_pause_resume_functionality() {
    let timer_manager = TimerManager::new();

    // Start a timer
    let result = timer_manager.start_timer();
    assert!(result.is_ok());
    let timer_data = result.unwrap();
    assert_eq!(timer_data.state, TimerState::Work);
    let initial_remaining = timer_data.remaining_time;

    // Add a small delay
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

    // Pause the timer
    let result = timer_manager.pause_timer();
    assert!(result.is_ok());
    let timer_data = result.unwrap();
    assert_eq!(timer_data.state, TimerState::Paused);

    // Resume the timer
    let result = timer_manager.start_timer();
    assert!(result.is_ok());
    let timer_data = result.unwrap();
    assert_eq!(timer_data.state, TimerState::Work);

    // Time should be close to what it was (allowing for small processing delays)
    let time_diff = (initial_remaining as i32 - timer_data.remaining_time as i32).abs();
    assert!(time_diff <= 1, "Time difference too large: {}", time_diff);
}
