// OmniTranslate Live Interactive Landing Page Logic

document.addEventListener('DOMContentLoaded', () => {
  initPlaygroundScenarios();
  initPricingToggle();
  initPlatformTabs();
  initSmoothScroll();
  initWebUsageChecker();
});

// 1. Live Translation Playground Scenarios
const scenarios = {
  youtube: {
    sourceLang: "English",
    targetLang: "Russian",
    mode: "Internal System Audio Capture (YouTube)",
    gender: "Male Voice (Gemini AI)",
    genderTag: "[M]",
    original: "The newly engineered neural architecture cuts model latency down to sub-100 milliseconds, allowing completely fluid speech translation.",
    translated: "Новая нейросетевая архитектура сокращает задержку модели до уровня менее ста миллисекунд, обеспечивая абсолютно плавный голосовой перевод."
  },
  telegram: {
    sourceLang: "Georgian",
    targetLang: "Russian",
    mode: "Internal Audio (Telegram Voice Note)",
    gender: "Female Voice (Gemini AI)",
    genderTag: "[F]",
    original: "გამარჯობა, ხვალ დილით შევხვდეთ ოფისში და ახალი პროექტის დეტალები ერთად განვიხილოთ.",
    translated: "Привет, давай встретимся завтра утром в офисе и вместе обсудим все детали нового проекта."
  },
  meeting: {
    sourceLang: "Russian",
    targetLang: "English",
    mode: "Virtual Cable Routing (Zoom & Google Meet)",
    gender: "Male Voice (Neural Timbre)",
    genderTag: "[M]",
    original: "Мы протестировали интеграцию виртуального аудиокабеля на платформе Teams, и задержка практически нулевая.",
    translated: "We tested the virtual audio cable integration on Microsoft Teams, and the transmission latency is virtually zero."
  },
  tiktok: {
    sourceLang: "Spanish",
    targetLang: "Georgian",
    mode: "Phone Speaker Loopback (TikTok / Reels)",
    gender: "Female Voice (Neural Timbre)",
    genderTag: "[F]",
    original: "Hola a todos, hoy vamos a probar este nuevo traductor en vivo con cancelación de ruido de fondo.",
    translated: "მოგესალმებით ყველას, დღეს ჩვენ გამოვცდით ამ ახალ ცოცხალ თარჯიმანს ფონური ხმაურის ჩახშობით."
  }
};

function initPlaygroundScenarios() {
  const chips = document.querySelectorAll('.scenario-chip');
  const tagEl = document.getElementById('playgroundTag');
  const origEl = document.getElementById('playgroundOriginal');
  const transEl = document.getElementById('playgroundTranslated');
  const sourceLangEl = document.getElementById('playgroundSourceLang');
  const targetLangEl = document.getElementById('playgroundTargetLang');

  if (!chips.length || !origEl || !transEl) return;

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const scenarioKey = chip.getAttribute('data-scenario');
      const data = scenarios[scenarioKey];
      if (!data) return;

      // Animate transition with smooth fade
      origEl.style.opacity = '0';
      transEl.style.opacity = '0';

      setTimeout(() => {
        if (sourceLangEl) sourceLangEl.textContent = data.sourceLang;
        if (targetLangEl) targetLangEl.textContent = data.targetLang;
        if (tagEl) tagEl.textContent = `${data.genderTag} ${data.mode} • ${data.gender}`;
        origEl.textContent = data.original;
        transEl.textContent = data.translated;

        origEl.style.opacity = '1';
        transEl.style.opacity = '1';
      }, 150);
    });
  });
}

// 2. Pricing Toggle (Monthly vs Annual)
function initPricingToggle() {
  const toggleBtn = document.getElementById('pricingToggle');
  const proPriceEl = document.getElementById('proPrice');
  const proPeriodEl = document.getElementById('proPeriod');
  const entPriceEl = document.getElementById('entPrice');
  const entPeriodEl = document.getElementById('entPeriod');

  if (!toggleBtn || !proPriceEl) return;

  let isAnnual = true; // default annual with discount

  function updatePrices() {
    if (isAnnual) {
      toggleBtn.classList.add('annual');
      proPriceEl.textContent = "$6.99";
      proPeriodEl.textContent = "/ month (billed $79 annually)";
      if (entPriceEl) {
        entPriceEl.textContent = "$22.00";
        entPeriodEl.textContent = "/ user / mo (billed annually)";
      }
    } else {
      toggleBtn.classList.remove('annual');
      proPriceEl.textContent = "$9.99";
      proPeriodEl.textContent = "/ month";
      if (entPriceEl) {
        entPriceEl.textContent = "$29.00";
        entPeriodEl.textContent = "/ user / month";
      }
    }
  }

  updatePrices();

  toggleBtn.addEventListener('click', () => {
    isAnnual = !isAnnual;
    updatePrices();
  });
}

// 3. Platform Feature Switcher (Mobile vs Desktop)
const platformFeatures = {
  all: [
    {
      icon: `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>`,
      title: "Direct System Audio Capture",
      text: "Internal hardware loopback captures sound straight from YouTube, TikTok, Telegram voice notes, and streaming apps without relying on a muddy room microphone.",
      badge: "Mobile & Desktop",
      highlight: "teal"
    },
    {
      icon: `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 3v18"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m4.93 19.07 4.24-4.24"/></svg>`,
      title: "Gemini AI Neural Engine",
      text: "Real-time streaming speech processing powered by Google Gemini AI with continuous clause slicing and intelligent deduplication.",
      badge: "Sub-Second Latency",
      highlight: "blue"
    },
    {
      icon: `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
      title: "Dynamic Gender Timbre Matching",
      text: "Automatically detects whether a male or female voice is speaking and adjusts the output voice pitch and timbre to preserve original vocal nuance.",
      badge: "Dual Timbre TTS",
      highlight: "gold"
    },
    {
      icon: `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 9 6 6"/><path d="m15 9-6 6"/></svg>`,
      title: "Always-On-Top Floating HUD",
      text: "A non-intrusive cybernetic glass pill that hovers above all apps. Collapse into a floating bubble or expand to full live subtitles with 1 tap.",
      badge: "iOS & Android Overlay",
      highlight: "teal"
    },
    {
      icon: `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m10 9 5 3-5 3V9Z"/></svg>`,
      title: "Virtual Audio Cable for Desktop",
      text: "Seamlessly routes live translated speech directly into Google Meet, Zoom, Discord, Slack, and Teams as a virtual microphone with automatic raw-voice muting.",
      badge: "Windows & Mac Calls",
      highlight: "blue"
    },
    {
      icon: `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>`,
      title: "Encrypted Recording Vault",
      text: "Every live translation session is automatically archived with searchable timestamps, full text export, starred favorites, and audio playback.",
      badge: "Offline Archive",
      highlight: "teal"
    }
  ],
  mobile: [
    {
      icon: `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/></svg>`,
      title: "Floating Bubble Overlay",
      text: "Minimalist Android & iOS overlay window floating over YouTube, TikTok, Reels, Telegram, and calls without interrupting full-screen playback.",
      badge: "Mobile HUD",
      highlight: "teal"
    },
    {
      icon: `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>`,
      title: "In-Place Quick Language Drawer",
      text: "Switch live translation pairs on the fly right on the floating pill without having to reopen the main application dashboard.",
      badge: "Instant Switch",
      highlight: "blue"
    },
    {
      icon: `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>`,
      title: "Hardware Media Audio Loopback",
      text: "Captures digital audio directly inside Android via AudioPlaybackCapture API for crisp, static-free translation of video voices.",
      badge: "100% Digital Audio",
      highlight: "gold"
    }
  ],
  desktop: [
    {
      icon: `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>`,
      title: "Virtual Mic Driver for Meetings",
      text: "Directly bridges into Google Meet, Zoom, Teams, and Discord. Raw voice pass-through un-mutes automatically when you are not translating.",
      badge: "Pro Virtual Cable",
      highlight: "blue"
    },
    {
      icon: `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" x2="9.17" y1="4.93" y2="9.17"/></svg>`,
      title: "Floating Circular Mic Widget",
      text: "Movable circular microphone HUD with live soundwave visualizer, instant MIC ⇄ SYS toggle, and global hotkey support.",
      badge: "Ctrl + Shift + T",
      highlight: "teal"
    },
    {
      icon: `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`,
      title: "Continuous Hands-Free VAD",
      text: "Natural speech translation with smart Voice Activity Detection. Speak freely during calls without clicking or holding buttons.",
      badge: "Hands-Free Mode",
      highlight: "gold"
    }
  ]
};

function initPlatformTabs() {
  const tabs = document.querySelectorAll('.platform-tab-btn');
  const grid = document.getElementById('featuresGrid');

  if (!tabs.length || !grid) return;

  function renderFeatures(filter) {
    const items = platformFeatures[filter] || platformFeatures.all;
    grid.innerHTML = items.map(item => `
      <div class="glass-card feature-card highlight-${item.highlight}">
        <div class="feature-icon-wrapper">${item.icon}</div>
        <h3 class="feature-title">${item.title}</h3>
        <p class="feature-text">${item.text}</p>
        <div class="feature-footer-pill">${item.badge}</div>
      </div>
    `).join('');
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const platform = tab.getAttribute('data-platform');
      renderFeatures(platform);
    });
  });

  renderFeatures('all');
}

// 4. Smooth Anchor Scrolling
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// 5. Shared Backend Usage & Account Checker
function initWebUsageChecker() {
  const modal = document.getElementById('webUsageModal');
  const btnOpen = document.getElementById('btnNavCheckUsage');
  const btnClose = document.getElementById('btnCloseWebUsageModal');
  const btnCheck = document.getElementById('btnWebCheckAccount');
  const inputEmail = document.getElementById('inputWebEmail');
  const resultBox = document.getElementById('webUsageResultBox');

  if (!modal || !btnOpen) return;

  btnOpen.addEventListener('click', () => {
    modal.classList.remove('hidden');
    if (inputEmail) inputEmail.focus();
  });

  btnClose?.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  btnCheck?.addEventListener('click', async () => {
    const email = inputEmail ? inputEmail.value.trim() : '';
    if (!email) {
      alert('Please enter your Google account email');
      return;
    }

    btnCheck.textContent = 'Checking...';
    try {
      const BACKEND_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:5050' 
        : 'https://omnitranslate-backend.onrender.com';
      const res = await fetch(`${BACKEND_URL}/api/user/profile?email=${encodeURIComponent(email)}`);
      const data = await res.json();

      if (data && data.user) {
        resultBox.classList.remove('hidden');
        document.getElementById('webResultName').textContent = data.user.displayName || email.split('@')[0];
        document.getElementById('webResultEmail').textContent = data.user.email;
        
        const badgeEl = document.getElementById('webResultBadge');
        const countEl = document.getElementById('webResultUsageCount');
        const remEl = document.getElementById('webResultRemaining');
        const barEl = document.getElementById('webProgressBar');
        const noteEl = document.getElementById('webResultNote');

        const isDev = data.user.isDeveloper && data.user.developerBypass;
        const isPaid = data.user.isPaid;
        const used = data.user.usage?.translationsCount || 0;

        if (isDev) {
          badgeEl.textContent = 'DEVELOPER UNLIMITED';
          badgeEl.className = 'plan-badge-pill dev';
          countEl.textContent = `${used} Translations Used (Dev Bypass Active)`;
          remEl.textContent = 'Unlimited Quota';
          barEl.style.width = '100%';
          noteEl.textContent = 'Developer account detected! All metrics gating, usage counters, and paywalls are disabled.';
        } else if (isPaid) {
          badgeEl.textContent = 'PRO SUBSCRIBER';
          badgeEl.className = 'plan-badge-pill pro';
          countEl.textContent = `${used} Translations Used`;
          remEl.textContent = 'Unlimited Quota';
          barEl.style.width = '100%';
          noteEl.textContent = 'Active Pro subscriber with unlimited translation streaming.';
        } else {
          const rem = Math.max(0, 15 - used);
          badgeEl.textContent = 'FREE TRIAL';
          badgeEl.className = 'plan-badge-pill free';
          countEl.textContent = `${used} / 15 Translations Used`;
          remEl.textContent = `${rem} Remaining`;
          barEl.style.width = `${Math.min(100, Math.round((used / 15) * 100))}%`;
          noteEl.textContent = rem > 0 
            ? `You have ${rem} free translations left. Upgrade to Pro for unlimited live calls.` 
            : 'Free quota limit reached (15/15). Upgrade to Pro to continue translating.';
        }
      }
    } catch (e) {
      alert('Could not reach backend service: ' + e.message);
    } finally {
      btnCheck.textContent = 'Check Account Status';
    }
  });
}

