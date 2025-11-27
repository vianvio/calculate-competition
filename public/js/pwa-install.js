// PWA Installation Support
let deferredPrompt;
let installButton;

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
  
  // Check if app is already installed
  if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
    console.log('App is running in standalone mode');
    if (installButton) {
      installButton.style.display = 'none';
    }
  }
});

// Listen for beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  // Show install button
  if (installButton) {
    installButton.style.display = 'block';
  }
});

// Install PWA when button is clicked
function installPWA() {
  if (!deferredPrompt) {
    alert('应用已经安装或浏览器不支持PWA安装');
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
