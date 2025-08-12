// 应用程序入口文件

function initApp() {
  const appContainer = document.querySelector('#app');
  if (appContainer) {
    appContainer.innerHTML = '<p>应用程序已启动</p>';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  initApp();
});
