// Initialize Telegram WebApp SDK if available
const tg = window.Telegram?.WebApp;

if (tg) {
  // Let Telegram know the app is ready and expand it to full viewport height
  tg.ready();
  tg.expand();
  
  // Set theme properties
  tg.setHeaderColor('#0a0a0d');
  tg.setBackgroundColor('#0a0a0d');

  function applyTelegramSafeArea() {
    const contentInsets = tg.contentSafeAreaInset;
    const safeInsets = tg.safeAreaInset;

    const insets = {
      top: Math.max(contentInsets?.top || 0, safeInsets?.top || 0),
      right: Math.max(contentInsets?.right || 0, safeInsets?.right || 0),
      bottom: Math.max(contentInsets?.bottom || 0, safeInsets?.bottom || 0),
      left: Math.max(contentInsets?.left || 0, safeInsets?.left || 0),
    };

    document.body.style.paddingTop = `${insets.top}px`;
    document.body.style.paddingRight = `${insets.right}px`;
    document.body.style.paddingBottom = `${insets.bottom}px`;
    document.body.style.paddingLeft = `${insets.left}px`;
  }

  applyTelegramSafeArea();
  tg.onEvent?.('safeAreaChanged', applyTelegramSafeArea);
  tg.onEvent?.('contentSafeAreaChanged', applyTelegramSafeArea);
  tg.onEvent?.('safe_area_changed', applyTelegramSafeArea);
  tg.onEvent?.('content_safe_area_changed', applyTelegramSafeArea);
  tg.onEvent?.('fullscreenChanged', applyTelegramSafeArea);
  tg.onEvent?.('fullscreen_changed', applyTelegramSafeArea);
}

// App State
let gems = 1250;

// DOM Elements
const gemsBlock = document.getElementById('gemsBlock');
const gemsCount = document.getElementById('gemsCount');

// Helper to format numbers with commas (e.g., 1,250)
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Set initial value
gemsCount.textContent = formatNumber(gems);

// Trigger standard haptic vibration via Telegram WebApp
function triggerHaptic(style = 'light') {
  if (tg && tg.HapticFeedback) {
    tg.HapticFeedback.impactOccurred(style);
  }
}

// Animate the gems count incrementing smoothly
function animateGemsCount(targetValue) {
  const startValue = gems;
  const duration = 800; // ms
  const startTime = performance.now();
  
  gems = targetValue; // Update state
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease out expo curve for standard decelerating feel
    const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    const currentValue = Math.floor(startValue + (targetValue - startValue) * easeProgress);
    
    gemsCount.textContent = formatNumber(currentValue);
    
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      gemsCount.textContent = formatNumber(targetValue);
    }
  }
  
  requestAnimationFrame(update);
}

// Pulse the entire gems block to give visual feedback
function pulseGemsBlock() {
  gemsBlock.style.transform = 'scale(1.12)';
  
  setTimeout(() => {
    gemsBlock.style.transform = '';
  }, 150);
}

// Tab Switching Logic
const navItems = document.querySelectorAll('.nav-item');
const tabPages = document.querySelectorAll('.tab-page');

navItems.forEach(item => {
  item.addEventListener('click', () => {
    const tabName = item.getAttribute('data-tab');
    if (!tabName) return;

    // Trigger haptic response
    triggerHaptic('light');

    // Update active tab button style
    navItems.forEach(nav => nav.classList.remove('active'));
    item.classList.add('active');

    // Switch visible tab page
    tabPages.forEach(page => {
      if (page.id === `tab-${tabName}`) {
        page.classList.add('active');
      } else {
        page.classList.remove('active');
      }
    });
  });
});

// Gems Counter click animation
gemsBlock.addEventListener('click', () => {
  triggerHaptic('light');
  pulseGemsBlock();
  
  const img = gemsBlock.querySelector('.gems-icon');
  if (img) {
    img.style.transform = 'scale(1.3) rotate(15deg)';
    setTimeout(() => {
      img.style.transform = '';
    }, 200);
  }
});
