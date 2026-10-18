// OmniTranslate Shared Authentication Library for Website
// Handles user session, auth modals, password & 6-digit OTP email verification

const OmniAuth = (() => {
  const STORAGE_KEY = 'omnitranslate_user_session';
  const BACKEND_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5050'
    : 'https://omnitranslate-backend.onrender.com';

  let currentSuccessCallback = null;
  let pendingRegistrationData = null; // { email, password, displayName }
  let pendingOtpEmail = null;

  // 1. Session Storage Helpers
  function getUser() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  function setUser(user) {
    if (!user) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
    updateNavBars();
    window.dispatchEvent(new CustomEvent('omniauth:changed', { detail: user }));
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    updateNavBars();
    window.dispatchEvent(new CustomEvent('omniauth:changed', { detail: null }));
    if (window.location.pathname.includes('checkout')) {
      window.location.reload();
    }
  }

  async function refreshProfile() {
    const user = getUser();
    if (!user || !user.email) return null;
    try {
      const res = await fetch(`${BACKEND_URL}/api/user/profile?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data && data.user) {
        const updated = { ...user, ...data.user, permission: data.permission };
        setUser(updated);
        return updated;
      }
    } catch (e) {
      console.warn('Could not refresh profile:', e);
    }
    return user;
  }

  // 2. Inject Modal Styles & HTML once into DOM
  function injectAuthModal() {
    if (document.getElementById('omniAuthModalOverlay')) return;

    const style = document.createElement('style');
    style.id = 'omniAuthModalStyles';
    style.textContent = `
      .omni-modal-overlay {
        position: fixed;
        inset: 0;
        z-index: 10000;
        background: rgba(4, 7, 13, 0.85);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.25s ease;
      }
      .omni-modal-overlay.active {
        opacity: 1;
        pointer-events: auto;
      }
      .omni-modal-card {
        background: #0E131E;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 20px;
        width: 100%;
        max-width: 440px;
        padding: 32px;
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 210, 180, 0.1);
        position: relative;
        transform: translateY(15px);
        transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        color: #FFF;
        font-family: var(--font-body, -apple-system, sans-serif);
      }
      .omni-modal-overlay.active .omni-modal-card {
        transform: translateY(0);
      }
      .omni-modal-close {
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #9BA3AF;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }
      .omni-modal-close:hover {
        background: rgba(255, 255, 255, 0.2);
        color: #FFF;
      }
      .omni-tabs {
        display: flex;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 4px;
        margin: 20px 0;
        gap: 4px;
      }
      .omni-tab-btn {
        flex: 1;
        background: transparent;
        border: none;
        color: #9BA3AF;
        padding: 9px;
        font-size: 13.5px;
        font-weight: 700;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .omni-tab-btn.active {
        background: #182234;
        color: #00D2B4;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }
      .omni-input-group {
        margin-bottom: 16px;
        text-align: left;
      }
      .omni-label {
        display: block;
        font-size: 12px;
        font-weight: 600;
        color: #9BA3AF;
        margin-bottom: 6px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .omni-input {
        width: 100%;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 10px;
        padding: 13px 14px;
        color: #FFF;
        font-size: 14.5px;
        outline: none;
        box-sizing: border-box;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .omni-input:focus {
        border-color: #00D2B4;
        box-shadow: 0 0 15px rgba(0, 210, 180, 0.25);
      }
      .omni-btn-submit {
        width: 100%;
        background: linear-gradient(135deg, #3875F6 0%, #00D2B4 100%);
        border: none;
        color: #070B14;
        font-size: 15px;
        font-weight: 800;
        padding: 14px;
        border-radius: 10px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-top: 20px;
        transition: transform 0.2s, box-shadow 0.2s;
        box-shadow: 0 10px 25px rgba(0, 210, 180, 0.3);
      }
      .omni-btn-submit:hover {
        transform: translateY(-2px);
        box-shadow: 0 15px 35px rgba(0, 210, 180, 0.45);
      }
      .omni-btn-submit:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }
      .omni-alert {
        padding: 12px;
        border-radius: 10px;
        font-size: 13px;
        margin-bottom: 16px;
        display: none;
        line-height: 1.4;
      }
      .omni-alert.error {
        background: rgba(239, 68, 68, 0.15);
        border: 1px solid rgba(239, 68, 68, 0.35);
        color: #FCA5A5;
        display: block;
      }
      .omni-alert.success {
        background: rgba(0, 210, 180, 0.15);
        border: 1px solid rgba(0, 210, 180, 0.35);
        color: #00D2B4;
        display: block;
      }
      .omni-helper-link {
        font-size: 12.5px;
        color: #9BA3AF;
        text-align: center;
        margin-top: 14px;
        display: block;
        cursor: pointer;
        text-decoration: underline;
      }
      .omni-helper-link:hover {
        color: #00D2B4;
      }
    `;
    document.head.appendChild(style);

    const overlay = document.createElement('div');
    overlay.id = 'omniAuthModalOverlay';
    overlay.className = 'omni-modal-overlay';
    overlay.innerHTML = `
      <div class="omni-modal-card">
        <button type="button" class="omni-modal-close" id="omniAuthModalClose">✕</button>

        <div style="text-align:center;">
          <span style="display:inline-block; background:rgba(0,210,180,0.15); border:1px solid rgba(0,210,180,0.3); color:#00D2B4; font-size:11px; font-weight:800; padding:4px 12px; border-radius:20px; letter-spacing:0.5px; text-transform:uppercase;">⚡ OmniTranslate Account</span>
          <h2 id="omniAuthTitle" style="font-size:22px; font-weight:800; color:#FFF; margin:10px 0 4px;">Sign In to OmniTranslate</h2>
          <p id="omniAuthSubtitle" style="font-size:13px; color:#9BA3AF; margin:0;">Access unlimited AI translation and sync your Pro license.</p>
        </div>

        <div class="omni-tabs" id="omniAuthTabs">
          <button type="button" class="omni-tab-btn active" id="tabBtnOmniSignIn">🔑 Sign In</button>
          <button type="button" class="omni-tab-btn" id="tabBtnOmniRegister">✨ Create Account</button>
        </div>

        <div id="omniAuthAlert" class="omni-alert"></div>

        <!-- FORM 1: Password Sign In -->
        <form id="omniFormSignIn">
          <div class="omni-input-group">
            <label class="omni-label">Account Email</label>
            <input type="email" id="omniSignInEmail" class="omni-input" placeholder="name@example.com" required autocomplete="username">
          </div>
          <div class="omni-input-group">
            <label class="omni-label">Password</label>
            <input type="password" id="omniSignInPassword" class="omni-input" placeholder="••••••••" required autocomplete="current-password">
          </div>
          <button type="submit" id="omniBtnSignInSubmit" class="omni-btn-submit">
            <span>Sign In</span>
          </button>
          <a class="omni-helper-link" id="linkSwitchToOtp">✉️ Sign in with 6-digit email OTP instead</a>
        </form>

        <!-- FORM 2: Create Account / Registration -->
        <form id="omniFormRegister" style="display:none;">
          <div class="omni-input-group">
            <label class="omni-label">Full Name</label>
            <input type="text" id="omniRegName" class="omni-input" placeholder="e.g. Alex Smith" autocomplete="name">
          </div>
          <div class="omni-input-group">
            <label class="omni-label">Email Address</label>
            <input type="email" id="omniRegEmail" class="omni-input" placeholder="name@example.com" required autocomplete="email">
          </div>
          <div class="omni-input-group">
            <label class="omni-label">Create Password (min 6 chars)</label>
            <input type="password" id="omniRegPassword" class="omni-input" placeholder="At least 6 characters" minlength="6" required autocomplete="new-password">
          </div>
          <button type="submit" id="omniBtnRegisterSubmit" class="omni-btn-submit">
            <span>✨ Create Account &amp; Send Code</span>
          </button>
        </form>

        <!-- FORM 3: Passwordless Email OTP Request -->
        <form id="omniFormOtp" style="display:none;">
          <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px; margin-bottom:16px; font-size:12.5px; color:#9BA3AF;">
            ✉️ Enter your email to receive a secure 6-digit one-time sign-in code.
          </div>
          <div class="omni-input-group">
            <label class="omni-label">Email Address</label>
            <input type="email" id="omniOtpEmail" class="omni-input" placeholder="name@example.com" required autocomplete="email">
          </div>
          <button type="submit" id="omniBtnOtpSubmit" class="omni-btn-submit">
            <span>✉️ Send 6-Digit Code</span>
          </button>
          <a class="omni-helper-link" id="linkBackToPassword">← Back to Password Sign In</a>
        </form>

        <!-- FORM 4: Verify 6-Digit Code (Sent via Email) -->
        <form id="omniFormVerify" style="display:none;">
          <div style="background:rgba(0,210,180,0.08); border:1px solid rgba(0,210,180,0.25); border-radius:10px; padding:12px; margin-bottom:16px; font-size:12.5px; color:#00D2B4;">
            📬 6-digit verification code sent to <strong id="omniVerifyTargetEmail" style="color:#FFF;">-</strong>. Enter it below:
          </div>
          <div class="omni-input-group">
            <label class="omni-label">6-Digit Verification Code</label>
            <input type="text" id="omniVerifyCode" class="omni-input" placeholder="123456" maxlength="6" pattern="[0-9]{6}" required style="text-align:center; letter-spacing:6px; font-size:22px; font-weight:800; font-family:monospace;">
          </div>
          <button type="submit" id="omniBtnVerifySubmit" class="omni-btn-submit">
            <span>✓ Complete Verification</span>
          </button>
          <a class="omni-helper-link" id="linkResendCode">Didn't receive code? Resend</a>
        </form>

      </div>
    `;

    document.body.appendChild(overlay);

    // Bind event listeners
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
    document.getElementById('omniAuthModalClose').addEventListener('click', closeModal);

    // Tab buttons
    const tabSignIn = document.getElementById('tabBtnOmniSignIn');
    const tabRegister = document.getElementById('tabBtnOmniRegister');

    tabSignIn.addEventListener('click', () => switchView('signin'));
    tabRegister.addEventListener('click', () => switchView('register'));

    document.getElementById('linkSwitchToOtp').addEventListener('click', () => switchView('otp'));
    document.getElementById('linkBackToPassword').addEventListener('click', () => switchView('signin'));
    document.getElementById('linkResendCode').addEventListener('click', () => {
      if (pendingRegistrationData) {
        handleRegisterSubmit();
      } else if (pendingOtpEmail) {
        handleOtpSubmit();
      }
    });

    // Form Submissions
    document.getElementById('omniFormSignIn').addEventListener('submit', handleSignInSubmit);
    document.getElementById('omniFormRegister').addEventListener('submit', handleRegisterSubmit);
    document.getElementById('omniFormOtp').addEventListener('submit', handleOtpSubmit);
    document.getElementById('omniFormVerify').addEventListener('submit', handleVerifySubmit);
  }

  function showAlert(msg, isError = true) {
    const el = document.getElementById('omniAuthAlert');
    if (!el) return;
    el.className = isError ? 'omni-alert error' : 'omni-alert success';
    el.innerHTML = msg;
    el.style.display = 'block';
  }

  function hideAlert() {
    const el = document.getElementById('omniAuthAlert');
    if (el) el.style.display = 'none';
  }

  function switchView(viewName) {
    hideAlert();
    const formSignIn = document.getElementById('omniFormSignIn');
    const formRegister = document.getElementById('omniFormRegister');
    const formOtp = document.getElementById('omniFormOtp');
    const formVerify = document.getElementById('omniFormVerify');
    const tabsContainer = document.getElementById('omniAuthTabs');
    const tabSignIn = document.getElementById('tabBtnOmniSignIn');
    const tabRegister = document.getElementById('tabBtnOmniRegister');

    formSignIn.style.display = 'none';
    formRegister.style.display = 'none';
    formOtp.style.display = 'none';
    formVerify.style.display = 'none';

    if (viewName === 'signin') {
      tabsContainer.style.display = 'flex';
      tabSignIn.classList.add('active');
      tabRegister.classList.remove('active');
      formSignIn.style.display = 'block';
      document.getElementById('omniSignInEmail').focus();
    } else if (viewName === 'register') {
      tabsContainer.style.display = 'flex';
      tabRegister.classList.add('active');
      tabSignIn.classList.remove('active');
      formRegister.style.display = 'block';
      document.getElementById('omniRegName').focus();
    } else if (viewName === 'otp') {
      tabsContainer.style.display = 'none';
      formOtp.style.display = 'block';
      document.getElementById('omniOtpEmail').focus();
    } else if (viewName === 'verify') {
      tabsContainer.style.display = 'none';
      formVerify.style.display = 'block';
      document.getElementById('omniVerifyCode').value = '';
      document.getElementById('omniVerifyCode').focus();
    }
  }

  // 3. API Handlers
  async function handleSignInSubmit(e) {
    if (e) e.preventDefault();
    hideAlert();
    const email = document.getElementById('omniSignInEmail').value.trim();
    const password = document.getElementById('omniSignInPassword').value;
    const btn = document.getElementById('omniBtnSignInSubmit');

    if (!email || !password) {
      showAlert('Email and password are required.');
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span>Signing in...</span>';

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Invalid email or password.');
      }

      setUser(data.user);
      showAlert('✓ Signed in successfully!', false);
      setTimeout(() => {
        closeModal();
        if (currentSuccessCallback) currentSuccessCallback(data.user);
      }, 500);
    } catch (err) {
      showAlert(err.message);
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<span>Sign In</span>';
    }
  }

  async function handleRegisterSubmit(e) {
    if (e) e.preventDefault();
    hideAlert();
    const displayName = document.getElementById('omniRegName').value.trim();
    const email = document.getElementById('omniRegEmail').value.trim();
    const password = document.getElementById('omniRegPassword').value;
    const btn = document.getElementById('omniBtnRegisterSubmit');

    if (!email || !email.includes('@')) {
      showAlert('A valid email address is required.');
      return;
    }
    if (!password || password.length < 6) {
      showAlert('Password must be at least 6 characters.');
      return;
    }

    pendingRegistrationData = { email, password, displayName };
    pendingOtpEmail = null;

    btn.disabled = true;
    btn.innerHTML = '<span>Sending code...</span>';

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/register-send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName })
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to send verification code.');
      }

      document.getElementById('omniVerifyTargetEmail').textContent = email;
      switchView('verify');
      showAlert('6-digit verification code sent to your email! (Valid 10 mins)', false);
    } catch (err) {
      showAlert(err.message);
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<span>✨ Create Account & Send Code</span>';
    }
  }

  async function handleOtpSubmit(e) {
    if (e) e.preventDefault();
    hideAlert();
    const email = document.getElementById('omniOtpEmail').value.trim();
    const btn = document.getElementById('omniBtnOtpSubmit');

    if (!email || !email.includes('@')) {
      showAlert('A valid email address is required.');
      return;
    }

    pendingOtpEmail = email;
    pendingRegistrationData = null;

    btn.disabled = true;
    btn.innerHTML = '<span>Sending code...</span>';

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to send code.');
      }

      document.getElementById('omniVerifyTargetEmail').textContent = email;
      switchView('verify');
      showAlert('6-digit code sent! Please check your inbox.', false);
    } catch (err) {
      showAlert(err.message);
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<span>✉️ Send 6-Digit Code</span>';
    }
  }

  async function handleVerifySubmit(e) {
    if (e) e.preventDefault();
    hideAlert();
    const code = document.getElementById('omniVerifyCode').value.trim();
    const btn = document.getElementById('omniBtnVerifySubmit');

    if (!code || code.length !== 6) {
      showAlert('Please enter the full 6-digit code.');
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span>Verifying...</span>';

    try {
      let endpoint = '';
      let payload = {};

      if (pendingRegistrationData) {
        endpoint = `${BACKEND_URL}/api/auth/verify-registration`;
        payload = { email: pendingRegistrationData.email, code, platform: 'web' };
      } else if (pendingOtpEmail) {
        endpoint = `${BACKEND_URL}/api/auth/verify-code`;
        payload = { email: pendingOtpEmail, code, platform: 'web' };
      } else {
        throw new Error('Verification session expired. Please try again.');
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Incorrect or expired code.');
      }

      setUser(data.user);
      showAlert('✓ Account verified successfully!', false);
      setTimeout(() => {
        closeModal();
        if (currentSuccessCallback) currentSuccessCallback(data.user);
      }, 500);
    } catch (err) {
      showAlert(err.message);
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<span>✓ Complete Verification</span>';
    }
  }

  // 4. Modal Open/Close Controls
  function openModal(options = {}) {
    injectAuthModal();
    hideAlert();
    currentSuccessCallback = options.onSuccess || null;

    if (options.title) {
      document.getElementById('omniAuthTitle').textContent = options.title;
    } else {
      document.getElementById('omniAuthTitle').textContent = 'Sign In to OmniTranslate';
    }

    if (options.subtitle) {
      document.getElementById('omniAuthSubtitle').textContent = options.subtitle;
    } else {
      document.getElementById('omniAuthSubtitle').textContent = 'Access unlimited AI translation and sync your Pro license.';
    }

    switchView(options.defaultTab || 'signin');

    const overlay = document.getElementById('omniAuthModalOverlay');
    overlay.classList.add('active');
  }

  function closeModal() {
    const overlay = document.getElementById('omniAuthModalOverlay');
    if (overlay) overlay.classList.remove('active');
    hideAlert();
  }

  // 5. Update Navigation Bars across website
  function updateNavBars() {
    const user = getUser();
    const navActions = document.querySelectorAll('.nav-actions');

    navActions.forEach(container => {
      let authBox = container.querySelector('#omniNavAuthBox');
      if (!authBox) {
        authBox = document.createElement('div');
        authBox.id = 'omniNavAuthBox';
        authBox.style.display = 'inline-flex';
        authBox.style.alignItems = 'center';
        authBox.style.gap = '8px';
        container.prepend(authBox);
      }

      if (user && user.email) {
        const isPaid = user.isPaid || user.tier === 'pro';
        const isDev = user.isDeveloper;
        const tierTag = isDev ? 'DEV' : (isPaid ? 'PRO' : 'FREE');
        const badgeColor = (isPaid || isDev) ? '#00D2B4' : '#9BA3AF';
        const badgeBg = (isPaid || isDev) ? 'rgba(0, 210, 180, 0.15)' : 'rgba(255, 255, 255, 0.08)';

        authBox.innerHTML = `
          <div style="display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); padding:4px 10px; border-radius:20px; font-size:12.5px;">
            <span style="width:7px; height:7px; border-radius:50%; background:${badgeColor};"></span>
            <span style="color:#FFF; font-weight:600; max-width:140px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${user.displayName || user.email.split('@')[0]}</span>
            <span style="font-size:10px; font-weight:800; background:${badgeBg}; color:${badgeColor}; padding:2px 6px; border-radius:10px;">${tierTag}</span>
            <button id="btnNavSignOut" style="background:transparent; border:none; color:#606876; font-size:12px; cursor:pointer; margin-left:4px; padding:0 2px;" title="Sign Out">✕</button>
          </div>
        `;

        const btnSignOut = authBox.querySelector('#btnNavSignOut');
        if (btnSignOut) {
          btnSignOut.addEventListener('click', (e) => {
            e.stopPropagation();
            logout();
          });
        }
      } else {
        authBox.innerHTML = `
          <button id="btnNavSignIn" class="btn btn-glass btn-sm" style="font-weight:700; color:#FFF;">
            🔑 Sign In
          </button>
        `;
        const btnSignIn = authBox.querySelector('#btnNavSignIn');
        if (btnSignIn) {
          btnSignIn.addEventListener('click', () => {
            openModal({ defaultTab: 'signin' });
          });
        }
      }
    });
  }

  // Initialize on load
  document.addEventListener('DOMContentLoaded', () => {
    injectAuthModal();
    updateNavBars();
    refreshProfile();
  });

  return {
    getUser,
    setUser,
    logout,
    refreshProfile,
    openModal,
    closeModal,
    updateNavBars,
    getBackendUrl: () => BACKEND_URL
  };
})();
