import { invoke } from '@tauri-apps/api/core';
import { PlatformInfo } from './components/PlatformInfo';
import './styles/mobile.css';

let greetInputEl: HTMLInputElement | null;
let greetMsgEl: HTMLElement | null;

async function greet() {
  if (greetMsgEl && greetInputEl) {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    greetMsgEl.textContent = await invoke('greet', {
      name: greetInputEl.value,
    });
  }
}

async function initPlatformInfo() {
  const platformInfo = new PlatformInfo();
  await platformInfo.init();

  const platformContainer = document.querySelector('#platform-info');
  if (platformContainer) {
    platformContainer.innerHTML = platformInfo.render();
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  greetInputEl = document.querySelector('#greet-input');
  greetMsgEl = document.querySelector('#greet-msg');
  document.querySelector('#greet-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    greet();
  });

  // 初始化平台信息
  await initPlatformInfo();
});
