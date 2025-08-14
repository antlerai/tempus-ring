import {
  Clock,
  Coffee,
  createIcons,
  Pause,
  Play,
  RotateCcw,
  Settings,
  Square,
  Timer,
} from 'lucide';

/**
 * Icon utility for managing Lucide icons throughout the application
 */
export class IconManager {
  private static instance: IconManager;

  private constructor() {
    this.initializeIcons();
  }

  public static getInstance(): IconManager {
    if (!IconManager.instance) {
      IconManager.instance = new IconManager();
    }
    return IconManager.instance;
  }

  /**
   * Initialize all Lucide icons in the DOM
   */
  private initializeIcons(): void {
    createIcons({
      icons: {
        Settings,
        Play,
        Pause,
        Square,
        RotateCcw,
        Timer,
        Coffee,
        Clock,
      },
    });
  }

  /**
   * Create an icon element with the specified icon name
   */
  public createIcon(iconName: string, className = 'w-5 h-5'): HTMLElement {
    const iconElement = document.createElement('i');
    iconElement.setAttribute('data-lucide', iconName);
    iconElement.className = className;
    return iconElement;
  }

  /**
   * Replace an existing element with a Lucide icon
   */
  public replaceWithIcon(element: HTMLElement, iconName: string, className = 'w-5 h-5'): void {
    const icon = this.createIcon(iconName, className);
    element.parentNode?.replaceChild(icon, element);
    this.refreshIcons();
  }

  /**
   * Update all icons in the DOM
   */
  public refreshIcons(): void {
    createIcons({
      icons: {
        Settings,
        Play,
        Pause,
        Square,
        RotateCcw,
        Timer,
        Coffee,
        Clock,
      },
    });
  }

  /**
   * Get appropriate timer state icons
   */
  public static getTimerStateIcon(state: string): string {
    switch (state) {
      case 'work':
        return 'timer';
      case 'short-break':
      case 'long-break':
        return 'coffee';
      case 'paused':
        return 'pause';
      case 'running':
        return 'play';
      default:
        return 'clock';
    }
  }

  /**
   * Get control button icons
   */
  public static getControlIcon(control: string): string {
    switch (control) {
      case 'start':
      case 'resume':
        return 'play';
      case 'pause':
        return 'pause';
      case 'stop':
      case 'reset':
        return 'square';
      case 'restart':
        return 'rotate-ccw';
      default:
        return 'play';
    }
  }
}
