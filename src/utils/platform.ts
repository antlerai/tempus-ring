import { platform } from '@tauri-apps/plugin-os';

export type Platform = 'windows' | 'macos' | 'linux' | 'android' | 'ios';

let currentPlatform: Platform | null = null;

export async function getCurrentPlatform(): Promise<Platform> {
  if (currentPlatform === null) {
    currentPlatform = (await platform()) as Platform;
  }
  return currentPlatform;
}

export async function isMobile(): Promise<boolean> {
  const p = await getCurrentPlatform();
  return p === 'android' || p === 'ios';
}

export async function isDesktop(): Promise<boolean> {
  const p = await getCurrentPlatform();
  return p === 'windows' || p === 'macos' || p === 'linux';
}

export async function isAndroid(): Promise<boolean> {
  const p = await getCurrentPlatform();
  return p === 'android';
}

export async function isIOS(): Promise<boolean> {
  const p = await getCurrentPlatform();
  return p === 'ios';
}
