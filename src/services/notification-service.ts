import { i18n } from '../i18n';
import { TimerState } from '../types';

export interface NotificationConfig {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
}

export interface SoundConfig {
  enabled: boolean;
  volume: number; // 0-1
  workCompleteSound?: string;
  breakCompleteSound?: string;
}

export interface NotificationServiceConfig {
  enabled: boolean;
  sound: SoundConfig;
  requestPermissionOnInit: boolean;
  showWorkComplete: boolean;
  showBreakComplete: boolean;
  showLongBreakComplete: boolean;
}

export type NotificationPermission = 'granted' | 'denied' | 'default';

export class NotificationService {
  private config: NotificationServiceConfig;
  private permission: NotificationPermission = 'default';
  private audioContext: AudioContext | null = null;
  private soundCache: Map<string, AudioBuffer> = new Map();

  constructor(config?: Partial<NotificationServiceConfig>) {
    this.config = {
      enabled: true,
      sound: {
        enabled: true,
        volume: 0.5,
      },
      requestPermissionOnInit: true,
      showWorkComplete: true,
      showBreakComplete: true,
      showLongBreakComplete: true,
      ...config,
    };

    this.init();
  }

  private async init(): Promise<void> {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('Notifications not supported in this environment');
      return;
    }

    // Get current permission status
    this.permission = Notification.permission as NotificationPermission;

    // Request permission if auto-request is enabled
    if (this.config.requestPermissionOnInit && this.permission === 'default') {
      await this.requestPermission();
    }

    // Initialize audio context if sound is enabled
    if (this.config.sound.enabled) {
      this.initializeAudio();
    }
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission as NotificationPermission;
      return this.permission;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      this.permission = 'denied';
      return 'denied';
    }
  }

  public getPermission(): NotificationPermission {
    return this.permission;
  }

  public isEnabled(): boolean {
    return this.config.enabled && this.permission === 'granted';
  }

  public updateConfig(config: Partial<NotificationServiceConfig>): void {
    this.config = { ...this.config, ...config };

    // Reinitialize audio if sound settings changed
    if (config.sound && this.config.sound.enabled && !this.audioContext) {
      this.initializeAudio();
    }
  }

  public async notifySessionComplete(
    state: TimerState,
    completedSessions: number = 0
  ): Promise<void> {
    if (!this.isEnabled()) {
      return;
    }

    let notificationConfig: NotificationConfig;
    let shouldShow: boolean;

    switch (state) {
      case TimerState.WORK:
        shouldShow = this.config.showWorkComplete;
        notificationConfig = {
          title: i18n.t('notifications.workComplete.title'),
          body: i18n.t('notifications.workComplete.body', { sessions: completedSessions }),
          tag: 'work-complete',
          icon: '/icons/work-complete.png',
          requireInteraction: true,
        };
        break;

      case TimerState.SHORT_BREAK:
        shouldShow = this.config.showBreakComplete;
        notificationConfig = {
          title: i18n.t('notifications.breakComplete.title'),
          body: i18n.t('notifications.breakComplete.body'),
          tag: 'break-complete',
          icon: '/icons/break-complete.png',
        };
        break;

      case TimerState.LONG_BREAK:
        shouldShow = this.config.showLongBreakComplete;
        notificationConfig = {
          title: i18n.t('notifications.longBreakComplete.title'),
          body: i18n.t('notifications.longBreakComplete.body'),
          tag: 'long-break-complete',
          icon: '/icons/long-break-complete.png',
        };
        break;

      default:
        return;
    }

    if (!shouldShow) {
      return;
    }

    // Show notification
    await this.showNotification(notificationConfig);

    // Play sound if enabled
    if (this.config.sound.enabled) {
      this.playNotificationSound(state);
    }
  }

  private async showNotification(config: NotificationConfig): Promise<Notification | null> {
    if (!this.isEnabled()) {
      return null;
    }

    try {
      const notificationOptions: NotificationOptions = {
        body: config.body,
      };

      if (config.icon !== undefined) {
        notificationOptions.icon = config.icon;
      }
      if (config.tag !== undefined) {
        notificationOptions.tag = config.tag;
      }
      if (config.requireInteraction !== undefined) {
        notificationOptions.requireInteraction = config.requireInteraction;
      }
      if (config.silent !== undefined) {
        notificationOptions.silent = config.silent;
      }

      const notification = new Notification(config.title, notificationOptions);

      // Handle notification click
      notification.addEventListener('click', () => {
        this.handleNotificationClick(notification);
      });

      // Auto-close after 5 seconds if not requiring interaction
      if (!config.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      return notification;
    } catch (error) {
      console.error('Failed to show notification:', error);
      return null;
    }
  }

  private handleNotificationClick(notification: Notification): void {
    // Bring the application to focus
    if (window) {
      window.focus();
    }

    // Close the notification
    notification.close();

    // Emit custom event for application to handle
    window.dispatchEvent(
      new CustomEvent('notificationClick', {
        detail: { tag: notification.tag },
      })
    );
  }

  private initializeAudio(): void {
    try {
      // @ts-expect-error webkitAudioContext is not in standard types but exists in older browsers
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.warn('Failed to initialize audio context:', error);
      this.config.sound.enabled = false;
    }
  }

  private async playNotificationSound(state: TimerState): Promise<void> {
    if (!this.audioContext || !this.config.sound.enabled) {
      return;
    }

    try {
      // Determine sound file based on state
      let soundUrl: string;
      switch (state) {
        case TimerState.WORK:
          soundUrl = this.config.sound.workCompleteSound || '/sounds/work-complete.mp3';
          break;
        case TimerState.SHORT_BREAK:
        case TimerState.LONG_BREAK:
          soundUrl = this.config.sound.breakCompleteSound || '/sounds/break-complete.mp3';
          break;
        default:
          return;
      }

      // Check cache first
      let audioBuffer: AudioBuffer | undefined = this.soundCache.get(soundUrl);

      if (!audioBuffer) {
        // Load and cache the sound
        const loadedBuffer = await this.loadSound(soundUrl);
        if (loadedBuffer) {
          audioBuffer = loadedBuffer;
          this.soundCache.set(soundUrl, audioBuffer);
        }
      }

      if (audioBuffer) {
        this.playAudioBuffer(audioBuffer);
      }
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }

  private async loadSound(url: string): Promise<AudioBuffer | null> {
    if (!this.audioContext) {
      return null;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load sound: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      return audioBuffer;
    } catch (error) {
      console.warn(`Failed to load sound from ${url}:`, error);
      return null;
    }
  }

  private playAudioBuffer(audioBuffer: AudioBuffer): void {
    if (!this.audioContext) {
      return;
    }

    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = audioBuffer;
      gainNode.gain.value = this.config.sound.volume;

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      source.start(0);
    } catch (error) {
      console.warn('Failed to play audio buffer:', error);
    }
  }

  public async testNotification(): Promise<void> {
    const testConfig: NotificationConfig = {
      title: 'Tempus Ring Test',
      body: 'This is a test notification to verify the system is working.',
      tag: 'test-notification',
      requireInteraction: false,
    };

    await this.showNotification(testConfig);

    if (this.config.sound.enabled) {
      // Play a simple beep sound for testing
      this.playTestSound();
    }
  }

  private playTestSound(): void {
    if (!this.audioContext) {
      return;
    }

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        this.config.sound.volume * 0.3,
        this.audioContext.currentTime + 0.01
      );
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.2);

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.2);
    } catch (error) {
      console.warn('Failed to play test sound:', error);
    }
  }

  public getSoundConfig(): SoundConfig {
    return { ...this.config.sound };
  }

  public updateSoundConfig(soundConfig: Partial<SoundConfig>): void {
    this.config.sound = { ...this.config.sound, ...soundConfig };
  }

  public clearSoundCache(): void {
    this.soundCache.clear();
  }

  public destroy(): void {
    // Clear sound cache
    this.clearSoundCache();

    // Close audio context
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch((error) => {
        console.warn('Failed to close audio context:', error);
      });
    }

    this.audioContext = null;
  }
}
