// Initialize Telegram WebApp SDK if available
const tg = window.Telegram?.WebApp;

if (tg) {
  // Let Telegram know the app is ready and expand it to full viewport height
  tg.ready();
  tg.expand();
  tg.disableVerticalSwipes?.();
  
  // Set theme properties
  tg.setHeaderColor('#0a0a0d');
  tg.setBackgroundColor('#0a0a0d');

  function applyTelegramSafeArea() {
    const contentInsets = tg.contentSafeAreaInset;
    const safeInsets = tg.safeAreaInset;
    const rawTopInset = Math.max(contentInsets?.top || 0, safeInsets?.top || 0);
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const hasModernIphoneSafeArea = isIos && rawTopInset >= 44;
    const fullscreenControlsTopInset = hasModernIphoneSafeArea ? 88 : 0;

    const insets = {
      top: Math.max(rawTopInset, fullscreenControlsTopInset),
      right: Math.max(contentInsets?.right || 0, safeInsets?.right || 0),
      bottom: Math.max(contentInsets?.bottom || 0, safeInsets?.bottom || 0),
      left: Math.max(contentInsets?.left || 0, safeInsets?.left || 0),
    };

    document.body.style.paddingTop = `${insets.top}px`;
    document.body.style.paddingRight = `${insets.right}px`;
    document.body.style.paddingBottom = '0px';
    document.body.style.paddingLeft = `${insets.left}px`;
    document.documentElement.style.setProperty('--telegram-safe-area-bottom', `${insets.bottom}px`);
  }

  applyTelegramSafeArea();
  tg.onEvent?.('safeAreaChanged', applyTelegramSafeArea);
  tg.onEvent?.('contentSafeAreaChanged', applyTelegramSafeArea);
  tg.onEvent?.('safe_area_changed', applyTelegramSafeArea);
  tg.onEvent?.('content_safe_area_changed', applyTelegramSafeArea);
  tg.onEvent?.('fullscreenChanged', applyTelegramSafeArea);
  tg.onEvent?.('fullscreen_changed', applyTelegramSafeArea);
  tg.onEvent?.('viewportChanged', () => {
    tg.expand();
    tg.disableVerticalSwipes?.();
  });
  tg.onEvent?.('viewport_changed', () => {
    tg.expand();
    tg.disableVerticalSwipes?.();
  });
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

// Toggle Views between Photo Card and Cases Grid
const photoCard = document.getElementById('photoCard');
const photoView = document.getElementById('photoView');
const casesView = document.getElementById('casesView');
const backToPhotoBtn = document.getElementById('backToPhotoBtn');

if (photoCard && photoView && casesView && backToPhotoBtn) {
  photoCard.addEventListener('click', () => {
    triggerHaptic('light');
    photoView.classList.add('hidden-view');
    casesView.classList.add('active-view');
  });

  backToPhotoBtn.addEventListener('click', () => {
    triggerHaptic('light');
    casesView.classList.remove('active-view');
    photoView.classList.remove('hidden-view');
  });
}

// ==========================================================================
// Case Opening Gameplay & Animations
// ==========================================================================
const possiblePrizes = [
  { name: "100 Gems", img: "gems.webp", desc: "Куча драгоценных камней для вашего баланса!" },
  { name: "500 Gems", img: "gems.webp", desc: "Огромный мешок с сверкающими гемами!" },
  { name: "Telegram Star", img: "stars-DBKMczxe.png", desc: "Официальная золотая звезда Telegram." },
  { name: "TeleFest WebApp", img: "TeleFest.webp", desc: "Официальный логотип-награда TeleFest." },
  { name: "1,000 Gems", img: "gems.webp", desc: "Невероятное богатство драгоценных камней!" },
  { name: "Супер-Приз", img: "forzaBnner", desc: "Легендарный секретный подарок от организаторов." }
];

const caseCards = document.querySelectorAll('.case-card');
const confirmBackdrop = document.getElementById('confirmBackdrop');
const confirmBottomSheet = document.getElementById('confirmBottomSheet');
const sheetCasePhoto = document.getElementById('sheetCasePhoto');
const sheetCasePrice = document.getElementById('sheetCasePrice');
const confirmCancelBtn = document.getElementById('confirmCancelBtn');
const confirmOpenBtn = document.getElementById('confirmOpenBtn');

const rouletteOverlay = document.getElementById('rouletteOverlay');
const rouletteReel = document.getElementById('rouletteReel');
const skipAnimBtn = document.getElementById('skipAnimBtn');
const winOverlay = document.getElementById('winOverlay');
const winPrizeImg = document.getElementById('winPrizeImg');
const winPrizeName = document.getElementById('winPrizeName');
const winPrizeDesc = document.getElementById('winPrizeDesc');
const winPhotoWrapper = document.getElementById('winPhotoWrapper');
const collectBtn = document.getElementById('collectBtn');

let selectedCase = null;
let activeTickCancel = null;
let spinTimeout = null;
let winningPrize = null;
let isCollectingPrize = false;

// Close bottom confirmation sheet
function closeBottomSheet() {
  confirmBackdrop.classList.remove('active');
  confirmBottomSheet.classList.remove('active');
}

// Hook click events on case cards to open confirmation
caseCards.forEach((card, index) => {
  card.addEventListener('click', () => {
    triggerHaptic('medium');
    selectedCase = {
      index: index + 1,
      price: card.querySelector('.price-val').textContent,
      gradientClass: `case-card-${index + 1}`,
      photoHTML: card.querySelector('.case-photo-container').innerHTML
    };
    
    // Populate bottom sheet confirmation
    sheetCasePhoto.innerHTML = selectedCase.photoHTML;
    sheetCasePhoto.className = `sheet-case-photo ${selectedCase.gradientClass}`;
    sheetCasePrice.textContent = selectedCase.price;
    
    // Slide up bottom sheet
    confirmBackdrop.classList.add('active');
    confirmBottomSheet.classList.add('active');
  });
});

// Close bottom sheet events
confirmBackdrop.addEventListener('click', closeBottomSheet);
confirmCancelBtn.addEventListener('click', () => {
  triggerHaptic('light');
  closeBottomSheet();
});

// Confirm Open Case Button clicked
confirmOpenBtn.addEventListener('click', () => {
  if (!selectedCase) return;

  closeBottomSheet();
  triggerHaptic('heavy');

  // Determine prize randomly
  winningPrize = possiblePrizes[Math.floor(Math.random() * possiblePrizes.length)];

  // Show fullscreen overlay first, then build reel after browser has rendered it
  rouletteOverlay.classList.add('active');

  // Double rAF = 2 frames = overlay is visible + laid out before we read dimensions
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const ITEM_H  = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--roulette-item-height')) || 152;
    const TOTAL   = 60;   // total items in reel
    const WIN_IDX = 52;   // index of winning item
    const SPIN_MS = 8000;

    // Build reel DOM
    rouletteReel.innerHTML = '';
    rouletteReel.style.transition = 'none';
    rouletteReel.style.transform  = 'translateY(0)';

    const items = [];
    for (let i = 0; i < TOTAL; i++) {
      const prize = (i === WIN_IDX)
        ? winningPrize
        : possiblePrizes[Math.floor(Math.random() * possiblePrizes.length)];

      const div = document.createElement('div');
      div.className = 'roulette-item';
      div.innerHTML = `
        <img src="${prize.img}" class="roulette-item-img" alt="${prize.name}">
        <span class="roulette-item-name">${prize.name}</span>
      `;
      rouletteReel.appendChild(div);
      items.push(div);
    }

    // Force reflow — reel has real dimensions now
    rouletteReel.offsetHeight;

    // Compute viewport centre
    const viewport   = document.getElementById('rouletteViewport');
    const vpH        = viewport.clientHeight || window.innerHeight * 0.75;
    const centreOfVp = vpH / 2;

    // translateY that places WIN_IDX item's centre at viewport's centre
    // reel starts at translateY(0) so item[0].top = 0
    const targetY = centreOfVp - (WIN_IDX * ITEM_H + ITEM_H / 2);

    // Kick off the CSS transition
    rouletteReel.style.transition = `transform ${SPIN_MS}ms cubic-bezier(0.03, 0.9, 0.2, 1)`;
    rouletteReel.style.transform  = `translateY(${targetY}px)`;

    // rAF loop — highlight the item currently at centre
    let rafId = null;

    function highlightCentre() {
      const matrix    = new DOMMatrix(getComputedStyle(rouletteReel).transform);
      const currentY  = matrix.m42;
      const centreInReel = centreOfVp - currentY;
      const idx       = Math.round((centreInReel - ITEM_H / 2) / ITEM_H);
      const clamped   = Math.max(0, Math.min(TOTAL - 1, idx));

      items.forEach((item, itemIdx) => {
        const itemCentre = itemIdx * ITEM_H + ITEM_H / 2;
        const distance = Math.abs(itemCentre - centreInReel) / ITEM_H;
        const proximity = Math.max(0, 1 - Math.min(distance / 3.6, 1));
        const focus = proximity * proximity * (3 - 2 * proximity);
        const scale = 0.84 + focus * 0.3;
        const opacity = 0.3 + focus * 0.7;

        item.classList.toggle('roulette-item--active', itemIdx === clamped);
        item.style.setProperty('--roulette-item-scale', scale.toFixed(3));
        item.style.setProperty('--roulette-item-opacity', opacity.toFixed(3));
      });

      rafId = requestAnimationFrame(highlightCentre);
    }
    rafId = requestAnimationFrame(highlightCentre);

    // Haptic ticks
    activeTickCancel = startHapticTicks();

    // End after spin completes
    spinTimeout = setTimeout(() => {
      cancelAnimationFrame(rafId);
      endSpinAndShowWin();
    }, SPIN_MS);
  }));
});

// Skip animation button click
skipAnimBtn.addEventListener('click', () => {
  triggerHaptic('light');
  endSpinAndShowWin();
});

// Decelerating haptic ticks helper
function startHapticTicks() {
  let delay    = 30;
  let maxDelay = 600;
  let timerId  = null;

  function tick() {
    triggerHaptic('light');
    delay = delay * 1.07;
    if (delay < maxDelay) {
      timerId = setTimeout(tick, delay);
    }
  }
  tick();
  return () => { if (timerId) clearTimeout(timerId); };
}

// End spinner and open Win overlay
function endSpinAndShowWin() {
  if (activeTickCancel) activeTickCancel();
  if (spinTimeout) clearTimeout(spinTimeout);
  
  rouletteOverlay.classList.remove('active');
  
  // Set winning screen details
  winPrizeImg.src = winningPrize.img;
  winPrizeName.textContent = winningPrize.name;
  winPrizeDesc.textContent = winningPrize.desc;
  winPhotoWrapper.className = `win-photo-wrapper`; // reset class name
  
  // Open win screen
  winOverlay.classList.add('active');
  triggerHaptic('heavy');
  
  // Exploding fireworks confetti
  spawnConfetti();
}

// Fireworks/confetti generator
function spawnConfetti() {
  const container = document.getElementById('fireworksContainer');
  if (!container) return;
  container.innerHTML = '';
  const colors = ['#ffd23f', '#ff9f1c', '#a855f7', '#3b82f6', '#14b8a6', '#ef4444'];
  
  for (let i = 0; i < 45; i++) {
    const particle = document.createElement('div');
    particle.className = 'confetti-particle';
    
    // Physics explosion trajectory
    const angle = Math.random() * Math.PI * 2;
    const velocity = 90 + Math.random() * 140;
    const x = Math.cos(angle) * velocity;
    const y = Math.sin(angle) * velocity - 60; // arching offset
    
    particle.style.setProperty('--tx', `${x}px`);
    particle.style.setProperty('--ty', `${y}px`);
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Shape/Size
    const size = 6 + Math.random() * 8;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    particle.style.transform = `rotate(${Math.random() * 360}deg)`;
    
    container.appendChild(particle);
  }
}

// Collect Button: dive down animation, fade out win overlay, and update balance
collectBtn.addEventListener('click', () => {
  if (isCollectingPrize) return;
  isCollectingPrize = true;
  collectBtn.disabled = true;
  triggerHaptic('medium');
  
  // 1. Gift dive down animation
  winPhotoWrapper.classList.add('dive-down');
  setTimeout(() => triggerHaptic('light'), 160);
  setTimeout(() => triggerHaptic('medium'), 340);
  
  // 2. Smoothly fade out overlay backdrop
  setTimeout(() => {
    winOverlay.classList.add('fade-out');
  }, 320);
  
  // 3. Close screens and roll balance increment
  setTimeout(() => {
    winOverlay.classList.remove('active');
    winOverlay.classList.remove('fade-out');
    winPhotoWrapper.classList.remove('dive-down');
    collectBtn.disabled = false;
    isCollectingPrize = false;
    
    // If user won Gems, animate incrementing header balance
    if (winningPrize.name.includes("Gems")) {
      const amount = parseInt(winningPrize.name.replace(/[^0-9]/g, ''));
      if (!isNaN(amount)) {
        animateGemsCount(gems + amount);
      }
    }
    
    selectedCase = null;
  }, 980);
});
