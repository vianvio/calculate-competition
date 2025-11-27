// PWA Installation Support
let deferredPrompt;
let installButton;

// Detect iOS
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

// Detect if running as standalone
function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone === true;
}

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/calculate-competition/service-worker.js')
      .then((registration) => {
        console.log('ServiceWorker registered: ', registration);
      })
      .catch((error) => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}

// Initialize button reference when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  installButton = document.getElementById('installPWA');
  
  console.log('PWA Install - DOMContentLoaded');
  console.log('Is iOS:', isIOS());
  console.log('Is Standalone:', isStandalone());
  
  // Check if app is already installed
  if (isStandalone()) {
    console.log('App is running in standalone mode');
    if (installButton) {
      installButton.style.display = 'none';
    }
  } else if (isIOS()) {
    // Show button for iOS devices (they don't support beforeinstallprompt)
    console.log('iOS device detected, showing install button');
    if (installButton) {
      installButton.style.display = 'block';
      // Change button text for iOS
      installButton.innerHTML = '📱 添加到主屏幕<br><small style="font-size: 14px;">点击 <span style="display:inline-block;transform:translateY(2px);">⎙</span> 然后选择"添加到主屏幕"</small>';
    }
  }
});

// Listen for beforeinstallprompt event (Android Chrome)
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('beforeinstallprompt event fired');
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  // Show install button
  if (installButton) {
    installButton.style.display = 'block';
    installButton.innerHTML = '📱 安装到主屏幕';
  }
});

// Install PWA when button is clicked
function installPWA() {
  console.log('installPWA clicked');
  console.log('deferredPrompt:', deferredPrompt);
  console.log('isIOS:', isIOS());
  
  // iOS devices - show instructions
  if (isIOS()) {
    alert('在Safari中：\n1. 点击底部的分享按钮 ⎙\n2. 向下滚动找到"添加到主屏幕"\n3. 点击"添加"');
    return;
  }
  
  // Android/Desktop
  if (!deferredPrompt) {
    alert('应用已经安装或浏览器不支持PWA安装\n\n提示：请使用Chrome浏览器访问');
    return;
  }
  
  // Show the install prompt
  deferredPrompt.prompt();
  
  // Wait for the user to respond to the prompt
  deferredPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    deferredPrompt = null;
    if (installButton) {
      installButton.style.display = 'none';
    }
  });
}

// Listen for app installed event
window.addEventListener('appinstalled', () => {
  console.log('PWA was installed');
  if (installButton) {
    installButton.style.display = 'none';
  }
});
