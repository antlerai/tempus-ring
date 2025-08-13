use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum TimerState {
    Idle,
    Work,
    ShortBreak,
    LongBreak,
    Paused,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimerConfig {
    pub work_duration: u32,             // seconds (default: 1500 = 25min)
    pub short_break_duration: u32,      // seconds (default: 300 = 5min)
    pub long_break_duration: u32,       // seconds (default: 900 = 15min)
    pub sessions_until_long_break: u32, // default: 4
    pub auto_start_breaks: bool,
    pub auto_start_pomodoros: bool,
}

impl Default for TimerConfig {
    fn default() -> Self {
        Self {
            work_duration: 1500,       // 25 minutes
            short_break_duration: 300, // 5 minutes
            long_break_duration: 900,  // 15 minutes
            sessions_until_long_break: 4,
            auto_start_breaks: false,
            auto_start_pomodoros: false,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimerSession {
    pub id: String,
    pub start_time: u64, // Unix timestamp in seconds
    pub end_time: Option<u64>,
    pub session_type: TimerState,
    pub completed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimerData {
    pub state: TimerState,
    pub current_session: Option<TimerSession>,
    pub remaining_time: u32, // seconds
    pub progress: f64,       // 0.0 to 1.0
    pub completed_sessions: u32,
    pub sessions_until_long_break: u32,
}

pub struct TimerManager {
    state: Arc<Mutex<TimerManagerState>>,
}

struct TimerManagerState {
    current_state: TimerState,
    config: TimerConfig,
    start_time: Option<Instant>,
    pause_start: Option<Instant>,
    paused_duration: Duration,
    current_session: Option<TimerSession>,
    completed_sessions: u32,
    sessions_until_long_break: u32,
}

impl TimerManager {
    pub fn new() -> Self {
        Self {
            state: Arc::new(Mutex::new(TimerManagerState {
                current_state: TimerState::Idle,
                config: TimerConfig::default(),
                start_time: None,
                pause_start: None,
                paused_duration: Duration::new(0, 0),
                current_session: None,
                completed_sessions: 0,
                sessions_until_long_break: 4,
            })),
        }
    }

    pub fn start_timer(&self) -> Result<TimerData, String> {
        let mut state = self.state.lock().map_err(|e| format!("Lock error: {e}"))?;

        let now = Instant::now();

        match state.current_state {
            TimerState::Idle => {
                // Start a work session
                state.current_state = TimerState::Work;
                state.start_time = Some(now);
                state.paused_duration = Duration::new(0, 0);

                let session_id = format!("work_{}", now.elapsed().as_secs());
                state.current_session = Some(TimerSession {
                    id: session_id,
                    start_time: now.elapsed().as_secs(),
                    end_time: None,
                    session_type: TimerState::Work,
                    completed: false,
                });
            }
            TimerState::Paused => {
                // Resume from pause
                if let Some(pause_start) = state.pause_start {
                    state.paused_duration += pause_start.elapsed();
                }
                state.pause_start = None;

                // Restore the previous state (work or break)
                if let Some(ref session) = state.current_session {
                    state.current_state = session.session_type;
                } else {
                    state.current_state = TimerState::Work;
                }
            }
            _ => {
                return Err("Cannot start timer in current state".to_string());
            }
        }

        Ok(self.get_timer_data_internal(&state))
    }

    pub fn pause_timer(&self) -> Result<TimerData, String> {
        let mut state = self.state.lock().map_err(|e| format!("Lock error: {e}"))?;

        match state.current_state {
            TimerState::Work | TimerState::ShortBreak | TimerState::LongBreak => {
                state.current_state = TimerState::Paused;
                state.pause_start = Some(Instant::now());
            }
            _ => {
                return Err("Cannot pause timer in current state".to_string());
            }
        }

        Ok(self.get_timer_data_internal(&state))
    }

    pub fn reset_timer(&self) -> Result<TimerData, String> {
        let mut state = self.state.lock().map_err(|e| format!("Lock error: {e}"))?;

        state.current_state = TimerState::Idle;
        state.start_time = None;
        state.pause_start = None;
        state.paused_duration = Duration::new(0, 0);
        state.current_session = None;
        // Don't reset completed_sessions and sessions_until_long_break on reset

        Ok(self.get_timer_data_internal(&state))
    }

    pub fn get_timer_state(&self) -> Result<TimerData, String> {
        let state = self.state.lock().map_err(|e| format!("Lock error: {e}"))?;
        Ok(self.get_timer_data_internal(&state))
    }

    pub fn update_config(&self, config: TimerConfig) -> Result<TimerData, String> {
        let mut state = self.state.lock().map_err(|e| format!("Lock error: {e}"))?;
        state.config = config.clone();
        state.sessions_until_long_break = config.sessions_until_long_break;
        Ok(self.get_timer_data_internal(&state))
    }

    pub fn get_config(&self) -> Result<TimerConfig, String> {
        let state = self.state.lock().map_err(|e| format!("Lock error: {e}"))?;
        Ok(state.config.clone())
    }

    pub fn complete_session(&self) -> Result<TimerData, String> {
        let mut state = self.state.lock().map_err(|e| format!("Lock error: {e}"))?;

        // Complete current session
        if let Some(ref mut session) = state.current_session {
            session.completed = true;
            session.end_time = Some(Instant::now().elapsed().as_secs());

            if session.session_type == TimerState::Work {
                state.completed_sessions += 1;
                state.sessions_until_long_break -= 1;
            }
        }

        // Auto-transition to break or next session
        let next_state = match state.current_state {
            TimerState::Work => {
                if state.sessions_until_long_break == 0 {
                    state.sessions_until_long_break = state.config.sessions_until_long_break;
                    TimerState::LongBreak
                } else {
                    TimerState::ShortBreak
                }
            }
            TimerState::ShortBreak | TimerState::LongBreak => TimerState::Work,
            _ => TimerState::Idle,
        };

        if state.config.auto_start_breaks
            || (next_state == TimerState::Work && state.config.auto_start_pomodoros)
        {
            // Auto-start next session
            state.current_state = next_state;
            state.start_time = Some(Instant::now());
            state.paused_duration = Duration::new(0, 0);

            let session_id = format!(
                "{}_{}",
                match next_state {
                    TimerState::Work => "work",
                    TimerState::ShortBreak => "short_break",
                    TimerState::LongBreak => "long_break",
                    _ => "unknown",
                },
                Instant::now().elapsed().as_secs()
            );

            state.current_session = Some(TimerSession {
                id: session_id,
                start_time: Instant::now().elapsed().as_secs(),
                end_time: None,
                session_type: next_state,
                completed: false,
            });
        } else {
            // Manual transition
            state.current_state = TimerState::Idle;
            state.start_time = None;
            state.current_session = None;
        }

        Ok(self.get_timer_data_internal(&state))
    }

    fn get_timer_data_internal(&self, state: &TimerManagerState) -> TimerData {
        let (remaining_time, progress) = if let Some(start_time) = state.start_time {
            let duration = match state.current_state {
                TimerState::Work => state.config.work_duration,
                TimerState::ShortBreak => state.config.short_break_duration,
                TimerState::LongBreak => state.config.long_break_duration,
                _ => 0,
            };

            let elapsed = if state.current_state == TimerState::Paused {
                // If paused, use the paused duration
                state.paused_duration
            } else {
                // Calculate elapsed time considering any paused duration
                start_time.elapsed() - state.paused_duration
            };

            let elapsed_secs = elapsed.as_secs() as u32;

            if elapsed_secs >= duration {
                // Timer has completed
                (0, 1.0)
            } else {
                let remaining = duration - elapsed_secs;
                let progress = elapsed_secs as f64 / duration as f64;
                (remaining, progress)
            }
        } else {
            (0, 0.0)
        };

        TimerData {
            state: state.current_state,
            current_session: state.current_session.clone(),
            remaining_time,
            progress,
            completed_sessions: state.completed_sessions,
            sessions_until_long_break: state.sessions_until_long_break,
        }
    }

    pub fn check_if_completed(&self) -> Result<Option<TimerData>, String> {
        let state = self.state.lock().map_err(|e| format!("Lock error: {e}"))?;

        if let Some(start_time) = state.start_time {
            if state.current_state != TimerState::Paused {
                let duration = match state.current_state {
                    TimerState::Work => state.config.work_duration,
                    TimerState::ShortBreak => state.config.short_break_duration,
                    TimerState::LongBreak => state.config.long_break_duration,
                    _ => return Ok(None),
                };

                let elapsed = start_time.elapsed() - state.paused_duration;
                let elapsed_secs = elapsed.as_secs() as u32;

                if elapsed_secs >= duration {
                    // Timer completed
                    drop(state); // Release the lock before calling complete_session
                    return Ok(Some(self.complete_session()?));
                }
            }
        }

        Ok(None)
    }
}

impl Default for TimerManager {
    fn default() -> Self {
        Self::new()
    }
}
