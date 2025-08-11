import { getCurrentPlatform, isDesktop, isMobile } from '../utils/platform';

export class PlatformInfo {
  private platform: string = 'unknown';
  private mobile: boolean = false;
  private desktop: boolean = false;

  async init() {
    this.platform = await getCurrentPlatform();
    this.mobile = await isMobile();
    this.desktop = await isDesktop();
  }

  render(): string {
    return `
      <div class="platform-info safe-area-inset">
        <h2>平台信息</h2>
        <p>当前平台: <strong>${this.platform}</strong></p>
        <p>设备类型: <strong>${this.mobile ? '移动端' : '桌面端'}</strong></p>
        
        ${
          this.desktop
            ? `
          <div class="desktop-only">
            <h3>桌面端功能</h3>
            <ul>
              <li>✅ 多窗口支持</li>
              <li>✅ 文件系统访问</li>
              <li>✅ 系统托盘</li>
              <li>✅ 全局快捷键</li>
            </ul>
          </div>
        `
            : ''
        }
        
        ${
          this.mobile
            ? `
          <div class="mobile-only">
            <h3>移动端功能</h3>
            <ul>
              <li>✅ 触摸优化界面</li>
              <li>✅ 原生移动体验</li>
              <li>✅ 设备传感器访问</li>
              <li>⚠️ 文件访问受限</li>
            </ul>
          </div>
        `
            : ''
        }
      </div>
    `;
  }
}
