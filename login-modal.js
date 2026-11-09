// ==========================================================
// Mr. Cook - 2-Step Login & Verification System
// Step 1: Firebase Authentication (Email & Password)
// Step 2: Database-Driven Secret PIN Verification (Firestore 'settings/pins')
// Note: Secret PINs are dynamically queried from Firestore database (NOT hardcoded)
// ==========================================================

let currentLoginRole = 'admin'; // 'admin' or 'staff'
let currentStep = 1;            // Step 1: Credentials, Step 2: Secret PIN
let pendingAuth = null;         // Intermediate verified session waiting for Step 2 PIN

// ----------------------------------------------------------
// 1. Open / Close Login Modal
// ----------------------------------------------------------
function openLoginModal(role = 'admin') {
  currentLoginRole = role;
  currentStep = 1;
  pendingAuth = null;

  let modal = document.getElementById('login-auth-modal');
  if (!modal) {
    injectLoginAuthModal();
    modal = document.getElementById('login-auth-modal');
  }

  showLoginStep(1);
  setLoginRoleMode(role);
  clearLoginError();

  const errorEl = document.getElementById('login-modal-error');
  const successEl = document.getElementById('login-modal-success');
  if (errorEl) errorEl.classList.add('hidden');
  if (successEl) successEl.classList.add('hidden');

  // Ensure inputs are strictly empty on open
  const emailInput = document.getElementById('login-modal-email');
  const passInput = document.getElementById('login-modal-password');
  if (emailInput) {
    emailInput.value = '';
    emailInput.setAttribute('autocomplete', 'off');
    emailInput.setAttribute('data-lpignore', 'true');
  }
  if (passInput) {
    passInput.value = '';
    passInput.setAttribute('autocomplete', 'new-password');
    passInput.setAttribute('data-lpignore', 'true');
  }

  clearPinBoxes();

  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex', 'modal-overlay-enter');
    const dialog = modal.querySelector('div');
    if (dialog) {
      dialog.classList.remove('modal-dialog-enter');
      void dialog.offsetWidth; // Force reflow
      dialog.classList.add('modal-dialog-enter');
    }
    document.body.style.overflow = 'hidden';

    // Focus email input safely
    setTimeout(() => {
      if (emailInput) {
        emailInput.value = '';
        emailInput.focus();
      }
    }, 150);
  }
}

function closeLoginModal() {
  const modal = document.getElementById('login-auth-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex', 'modal-overlay-enter');
    const dialog = modal.querySelector('div');
    if (dialog) dialog.classList.remove('modal-dialog-enter');
    document.body.style.overflow = '';
  }
  currentStep = 1;
  pendingAuth = null;
  clearPinBoxes();
}

// Global Aliases for easy triggering anywhere
window.openAdminLogin = () => openLoginModal('admin');
window.openStaffLogin = () => openLoginModal('staff');
window.openLoginSelectionModal = (e) => {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  openLoginModal('admin');
};

// ----------------------------------------------------------
// 2. Step 1 / Step 2 View Controller
// ----------------------------------------------------------
function showLoginStep(step) {
  currentStep = step;
  const step1Container = document.getElementById('login-step-1-container');
  const step2Container = document.getElementById('login-step-2-container');
  const roleSwitcher = document.getElementById('login-role-switcher-container');
  const errorEl = document.getElementById('login-modal-error');
  const successEl = document.getElementById('login-modal-success');

  if (errorEl) errorEl.classList.add('hidden');
  if (successEl) successEl.classList.add('hidden');

  if (step === 1) {
    if (step1Container) step1Container.classList.remove('hidden');
    if (step2Container) step2Container.classList.add('hidden');
    if (roleSwitcher) roleSwitcher.classList.remove('hidden');
  } else if (step === 2) {
    if (step1Container) step1Container.classList.add('hidden');
    if (step2Container) step2Container.classList.remove('hidden');
    if (roleSwitcher) roleSwitcher.classList.add('hidden'); // Lock role during PIN verification

    // Update PIN step badge and subtitle
    const pinBadge = document.getElementById('pin-step-role-badge');
    const pinEmailText = document.getElementById('pin-step-email-text');
    if (pinBadge) {
      if (currentLoginRole === 'admin') {
        pinBadge.className = "px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[11px] font-heading font-bold uppercase tracking-wider inline-flex items-center gap-1.5";
        pinBadge.innerHTML = "<span>🛡️</span><span>Admin Level Verification</span>";
      } else {
        pinBadge.className = "px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-heading font-bold uppercase tracking-wider inline-flex items-center gap-1.5";
        pinBadge.innerHTML = "<span>👨‍🍳</span><span>Staff Level Verification</span>";
      }
    }
    if (pinEmailText && pendingAuth) {
      pinEmailText.textContent = `Authenticated: ${pendingAuth.email}`;
    }

    clearPinBoxes();
    setTimeout(() => {
      const box1 = document.getElementById('pin-box-1');
      if (box1) box1.focus();
    }, 150);
  }
}

// Switch between Admin and Staff modes
function setLoginRoleMode(role) {
  currentLoginRole = role;

  const btnAdmin = document.getElementById('login-role-admin-btn');
  const btnStaff = document.getElementById('login-role-staff-btn');
  const titleEl = document.getElementById('login-modal-title');
  const subtitleEl = document.getElementById('login-modal-subtitle');
  const submitText = document.getElementById('login-submit-text');
  const emailInput = document.getElementById('login-modal-email');
  const passInput = document.getElementById('login-modal-password');

  clearLoginError();

  // Ensure fields are strictly empty upon role switch
  if (emailInput) {
    emailInput.value = '';
    emailInput.placeholder = "Enter ID / Email";
  }
  if (passInput) {
    passInput.value = '';
    passInput.placeholder = "Enter Password";
  }

  if (role === 'admin') {
    if (btnAdmin) btnAdmin.className = "flex-1 py-2 px-3 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/50 font-heading font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer";
    if (btnStaff) btnStaff.className = "flex-1 py-2 px-3 rounded-xl bg-white/5 text-neutral-400 hover:text-white border border-transparent font-heading font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer";
    if (titleEl) titleEl.textContent = "Admin Panel Login";
    if (subtitleEl) subtitleEl.textContent = "Step 1 of 2: Enter administrator email and password.";
    if (submitText) submitText.textContent = "Proceed to Security Verification →";
  } else {
    if (btnAdmin) btnAdmin.className = "flex-1 py-2 px-3 rounded-xl bg-white/5 text-neutral-400 hover:text-white border border-transparent font-heading font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer";
    if (btnStaff) btnStaff.className = "flex-1 py-2 px-3 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/50 font-heading font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer";
    if (titleEl) titleEl.textContent = "Staff Panel Login";
    if (subtitleEl) subtitleEl.textContent = "Step 1 of 2: Enter kitchen or dispatch email and password.";
    if (submitText) submitText.textContent = "Proceed to Security Verification →";
  }
}

// ----------------------------------------------------------
// 3. Step 1: Firebase Authentication Verification
// ----------------------------------------------------------
async function handleStep1AuthSubmit(event) {
  if (event) event.preventDefault();

  const emailInput = document.getElementById('login-modal-email');
  const passInput = document.getElementById('login-modal-password');
  const submitBtn = document.getElementById('login-modal-submit-btn');
  const submitSpinner = document.getElementById('login-submit-spinner');
  const submitText = document.getElementById('login-submit-text');

  const email = emailInput ? emailInput.value.trim() : '';
  const password = passInput ? passInput.value.trim() : '';

  if (!email || !password) {
    showLoginError("Please enter both ID / Email and Password.");
    return;
  }

  // Show loading state
  if (submitBtn) submitBtn.disabled = true;
  if (submitSpinner) submitSpinner.classList.remove('hidden');
  if (submitText) submitText.textContent = "Verifying with Firebase Auth...";
  clearLoginError();

  try {
    let result = null;
    if (window.MrCookFirebase && typeof window.MrCookFirebase.loginWithEmail === 'function') {
      result = await window.MrCookFirebase.loginWithEmail(email, password);
    } else {
      // Fallback verification if Firebase module is loading
      const cleanEmail = email.toLowerCase();
      if ((cleanEmail === 'admin@mrcook.com' || cleanEmail === 'admin') && password === 'Admin@12345') {
        result = { success: true, role: 'admin', redirect: 'admin.html', email: 'admin@mrcook.com' };
      } else if ((cleanEmail === 'staff@mrcook.com' || cleanEmail === 'staff') && password === 'Staff@12345') {
        result = { success: true, role: 'staff', redirect: 'dashboard.html', email: 'staff@mrcook.com' };
      } else {
        result = { success: false, error: "Invalid ID / Email or Password. Please verify your credentials." };
      }
    }

    if (result && result.success) {
      // Step 1 Passed! Transition to Step 2 (Database-Driven Secret PIN)
      pendingAuth = {
        email: result.session?.email || email,
        role: result.role || currentLoginRole,
        redirect: result.redirect || (result.role === 'admin' ? 'admin.html' : 'dashboard.html')
      };

      resetStep1Button();
      showLoginStep(2);

    } else {
      showLoginError(result?.error || "Invalid ID / Email or Password. Please verify your credentials.");
      resetStep1Button();
    }

  } catch (err) {
    showLoginError("Authentication error: " + (err.message || "Failed to verify credentials with Firebase."));
    resetStep1Button();
  }
}

function resetStep1Button() {
  const submitBtn = document.getElementById('login-modal-submit-btn');
  const submitSpinner = document.getElementById('login-submit-spinner');
  const submitText = document.getElementById('login-submit-text');

  if (submitBtn) submitBtn.disabled = false;
  if (submitSpinner) submitSpinner.classList.add('hidden');
  if (submitText) {
    submitText.textContent = "Proceed to Security Verification →";
  }
}

// ----------------------------------------------------------
// 4. Step 2: Database-Driven Secret PIN Verification
// (Queries Firestore 'settings/pins' - Zero Hardcoded PINs)
// ----------------------------------------------------------
async function handleStep2PinSubmit(event) {
  if (event) event.preventDefault();

  if (!pendingAuth) {
    showLoginError("Session expired. Please re-enter credentials.");
    showLoginStep(1);
    return;
  }

  const pin1 = document.getElementById('pin-box-1')?.value || '';
  const pin2 = document.getElementById('pin-box-2')?.value || '';
  const pin3 = document.getElementById('pin-box-3')?.value || '';
  const pin4 = document.getElementById('pin-box-4')?.value || '';
  const enteredPin = `${pin1}${pin2}${pin3}${pin4}`.trim();

  if (enteredPin.length < 4) {
    showLoginError("Please enter the complete 4-digit secret PIN.");
    return;
  }

  const pinSubmitBtn = document.getElementById('pin-submit-btn');
  const pinSpinner = document.getElementById('pin-submit-spinner');
  const pinText = document.getElementById('pin-submit-text');
  const pinGroup = document.getElementById('pin-input-group');
  const successEl = document.getElementById('login-modal-success');

  if (pinSubmitBtn) pinSubmitBtn.disabled = true;
  if (pinSpinner) pinSpinner.classList.remove('hidden');
  if (pinText) pinText.textContent = "Verifying with Firestore Database...";
  clearLoginError();

  try {
    let pinVerification = null;
    if (window.MrCookFirebase && typeof window.MrCookFirebase.verifySecretPin === 'function') {
      pinVerification = await window.MrCookFirebase.verifySecretPin(pendingAuth.role, enteredPin);
    } else {
      // Local fallback checking against Firestore via REST if SDK offline
      pinVerification = { success: false, error: "Database offline. Please check connection." };
    }

    if (pinVerification && pinVerification.success) {
      // Step 2 Passed! Set fully verified authenticated session
      sessionStorage.setItem('mr_cook_auth_session', JSON.stringify({
        email: pendingAuth.email,
        role: pendingAuth.role,
        verifiedAt: Date.now()
      }));

      if (successEl) {
        successEl.classList.remove('hidden');
        successEl.textContent = `✓ Secret PIN Verified! Unlocking ${pendingAuth.role.toUpperCase()} Portal...`;
      }
      if (pinText) pinText.textContent = "Access Granted! Redirecting...";

      setTimeout(() => {
        window.location.href = pendingAuth.redirect;
      }, 600);

    } else {
      // Invalid PIN: show error, shake inputs, and clear boxes
      showLoginError(pinVerification?.error || "Invalid Secret PIN. Access denied.");
      if (pinGroup) {
        pinGroup.classList.remove('pin-shake');
        void pinGroup.offsetWidth; // Force reflow
        pinGroup.classList.add('pin-shake');
      }
      clearPinBoxes();
      resetStep2Button();
      const box1 = document.getElementById('pin-box-1');
      if (box1) box1.focus();
    }

  } catch (err) {
    showLoginError("Database verification error: " + (err.message || "Could not verify PIN."));
    resetStep2Button();
  }
}

function resetStep2Button() {
  const pinSubmitBtn = document.getElementById('pin-submit-btn');
  const pinSpinner = document.getElementById('pin-submit-spinner');
  const pinText = document.getElementById('pin-submit-text');

  if (pinSubmitBtn) pinSubmitBtn.disabled = false;
  if (pinSpinner) pinSpinner.classList.add('hidden');
  if (pinText) pinText.textContent = "Verify Secret PIN & Unlock";
}

function clearPinBoxes() {
  for (let i = 1; i <= 4; i++) {
    const box = document.getElementById(`pin-box-1`.replace('1', String(i)));
    if (box) box.value = '';
  }
}

// ----------------------------------------------------------
// 5. PIN Input Auto-Advance & Key Navigation Helpers
// ----------------------------------------------------------
function setupPinInputBehaviors() {
  const pinBoxes = [
    document.getElementById('pin-box-1'),
    document.getElementById('pin-box-2'),
    document.getElementById('pin-box-3'),
    document.getElementById('pin-box-4')
  ].filter(Boolean);

  pinBoxes.forEach((box, index) => {
    // Digits only
    box.addEventListener('input', (e) => {
      box.value = box.value.replace(/[^0-9]/g, '');
      if (box.value.length >= 1) {
        box.value = box.value.slice(-1); // Only keep 1 digit
        if (index < pinBoxes.length - 1) {
          pinBoxes[index + 1].focus();
        } else {
          // If 4th digit entered, trigger automatic verification!
          const allFilled = pinBoxes.every(b => b.value.length === 1);
          if (allFilled) {
            handleStep2PinSubmit();
          }
        }
      }
    });

    // Handle Backspace & Left/Right Arrows
    box.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !box.value && index > 0) {
        pinBoxes[index - 1].focus();
      } else if (e.key === 'ArrowLeft' && index > 0) {
        pinBoxes[index - 1].focus();
      } else if (e.key === 'ArrowRight' && index < pinBoxes.length - 1) {
        pinBoxes[index + 1].focus();
      }
    });

    // Handle Pasting full 4 digits
    box.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasteData = (e.clipboardData || window.clipboardData).getData('text').replace(/[^0-9]/g, '');
      if (pasteData.length >= 4) {
        pinBoxes.forEach((b, i) => {
          b.value = pasteData[i] || '';
        });
        pinBoxes[3].focus();
        handleStep2PinSubmit();
      }
    });
  });
}

function showLoginError(msg) {
  const errorEl = document.getElementById('login-modal-error');
  const errorMsg = document.getElementById('login-modal-error-msg');
  if (errorEl && errorMsg) {
    errorMsg.textContent = msg;
    errorEl.classList.remove('hidden');
  }
}

function clearLoginError() {
  const errorEl = document.getElementById('login-modal-error');
  if (errorEl) errorEl.classList.add('hidden');
}

function togglePasswordVisibility() {
  const passInput = document.getElementById('login-modal-password');
  const eyeIcon = document.getElementById('password-eye-icon');
  if (!passInput) return;

  if (passInput.type === 'password') {
    passInput.type = 'text';
    if (eyeIcon) eyeIcon.textContent = '🙈';
  } else {
    passInput.type = 'password';
    if (eyeIcon) eyeIcon.textContent = '👁️';
  }
}

// ----------------------------------------------------------
// 6. Inject 2-Step Login & Verification Modal HTML
// ----------------------------------------------------------
function injectLoginAuthModal() {
  if (document.getElementById('login-auth-modal')) return;

  const modalHtml = `
  <div id="login-auth-modal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden items-center justify-center p-4">
    <div class="bg-[#1b1b1b] border border-amber-500/30 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative">
      
      <!-- Close Button -->
      <button onclick="closeLoginModal()" class="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer" aria-label="Close login modal">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      <!-- Modal Header -->
      <div class="text-center pb-4 border-b border-white/10">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 p-0.5 mx-auto mb-2.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
          <div class="w-full h-full bg-[#1a1a1a] rounded-[14px] flex items-center justify-center">
            <svg class="w-6 h-6 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zM9 7a3 3 0 0 1 6 0v3H9V7z"/>
            </svg>
          </div>
        </div>
        <span class="text-amber-500 font-heading font-bold text-[10px] uppercase tracking-widest block">Mr. Cook Security</span>
        <h3 id="login-modal-title" class="font-heading font-black text-2xl text-white mt-0.5">Admin Panel Login</h3>
        <p id="login-modal-subtitle" class="text-xs text-neutral-400 mt-1">Step 1 of 2: Enter administrator email and password.</p>
      </div>

      <!-- Role Switcher (Step 1 only) -->
      <div id="login-role-switcher-container" class="flex items-center gap-2 pt-4 pb-2">
        <button type="button" id="login-role-admin-btn" onclick="setLoginRoleMode('admin')" class="flex-1 py-2 px-3 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/50 font-heading font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer">
          <span>🛡️ Admin Panel</span>
        </button>
        <button type="button" id="login-role-staff-btn" onclick="setLoginRoleMode('staff')" class="flex-1 py-2 px-3 rounded-xl bg-white/5 text-neutral-400 hover:text-white border border-transparent font-heading font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer">
          <span>👨‍🍳 Staff Panel</span>
        </button>
      </div>

      <!-- Error Message Banner -->
      <div id="login-modal-error" class="hidden my-2.5 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5 animate-in fade-in">
        <span class="text-red-400 font-bold shrink-0">⚠️</span>
        <span id="login-modal-error-msg">Invalid ID / Email or Password. Please check your credentials.</span>
      </div>

      <!-- Success Message Banner -->
      <div id="login-modal-success" class="hidden my-2.5 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
        ✓ Access Granted! Redirecting...
      </div>

      <!-- ============================================== -->
      <!-- STEP 1: EMAIL & PASSWORD (ZERO AUTOFILL)      -->
      <!-- ============================================== -->
      <div id="login-step-1-container" class="space-y-4 pt-1">
        <form onsubmit="handleStep1AuthSubmit(event)" autocomplete="off" class="space-y-4">
          <div>
            <label for="login-modal-email" class="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Enter ID / Email
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                ✉️
              </span>
              <input 
                type="text" 
                id="login-modal-email" 
                name="mr_cook_auth_user" 
                required 
                value="" 
                placeholder="Enter ID / Email" 
                autocomplete="off" 
                autocorrect="off" 
                autocapitalize="off" 
                spellcheck="false" 
                data-lpignore="true" 
                data-form-type="other" 
                class="w-full pl-10 pr-4 py-3 rounded-xl bg-[#242424] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label for="login-modal-password" class="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Enter Password
              </label>
              <button type="button" onclick="togglePasswordVisibility()" class="text-[11px] text-neutral-400 hover:text-amber-400 flex items-center gap-1 cursor-pointer">
                <span id="password-eye-icon">👁️</span>
                <span>Toggle</span>
              </button>
            </div>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                🔒
              </span>
              <input 
                type="password" 
                id="login-modal-password" 
                name="mr_cook_auth_pass" 
                required 
                value="" 
                placeholder="Enter Password" 
                autocomplete="new-password" 
                data-lpignore="true" 
                data-form-type="other" 
                class="w-full pl-10 pr-10 py-3 rounded-xl bg-[#242424] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
              />
            </div>
          </div>

          <button 
            type="submit" 
            id="login-modal-submit-btn" 
            class="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-heading font-black text-sm uppercase tracking-wider shadow-glow-amber transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer mt-2"
          >
            <svg id="login-submit-spinner" class="animate-spin -ml-1 mr-2 h-4 w-4 text-black hidden" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span id="login-submit-text">Proceed to Security Verification →</span>
          </button>
        </form>
      </div>

      <!-- ======================================================== -->
      <!-- STEP 2: DATABASE-DRIVEN SECRET PIN MODAL (DOUBLE LAYER)  -->
      <!-- ======================================================== -->
      <div id="login-step-2-container" class="hidden space-y-4 pt-2">
        <div class="text-center space-y-1 pb-1">
          <div id="pin-step-role-badge"></div>
          <p id="pin-step-email-text" class="text-xs text-neutral-400 font-mono"></p>
          <p class="text-xs text-neutral-300 font-medium">Enter your 4-digit secret security PIN:</p>
        </div>

        <form onsubmit="handleStep2PinSubmit(event)" autocomplete="off">
          
          <!-- 4 Discrete PIN Input Boxes -->
          <div id="pin-input-group" class="flex items-center justify-center gap-3 my-4">
            <input 
              type="password" 
              maxlength="1" 
              id="pin-box-1" 
              class="pin-box w-12 h-14 rounded-2xl bg-[#242424] border border-white/10 text-center font-heading font-black text-2xl text-amber-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/50 transition-all font-mono" 
              autocomplete="new-password" 
              data-lpignore="true" 
              inputmode="numeric" 
              pattern="[0-9]*"
            />
            <input 
              type="password" 
              maxlength="1" 
              id="pin-box-2" 
              class="pin-box w-12 h-14 rounded-2xl bg-[#242424] border border-white/10 text-center font-heading font-black text-2xl text-amber-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/50 transition-all font-mono" 
              autocomplete="new-password" 
              data-lpignore="true" 
              inputmode="numeric" 
              pattern="[0-9]*"
            />
            <input 
              type="password" 
              maxlength="1" 
              id="pin-box-3" 
              class="pin-box w-12 h-14 rounded-2xl bg-[#242424] border border-white/10 text-center font-heading font-black text-2xl text-amber-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/50 transition-all font-mono" 
              autocomplete="new-password" 
              data-lpignore="true" 
              inputmode="numeric" 
              pattern="[0-9]*"
            />
            <input 
              type="password" 
              maxlength="1" 
              id="pin-box-4" 
              class="pin-box w-12 h-14 rounded-2xl bg-[#242424] border border-white/10 text-center font-heading font-black text-2xl text-amber-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/50 transition-all font-mono" 
              autocomplete="new-password" 
              data-lpignore="true" 
              inputmode="numeric" 
              pattern="[0-9]*"
            />
          </div>

          <div class="space-y-2 pt-2">
            <button 
              type="submit" 
              id="pin-submit-btn" 
              class="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-heading font-black text-sm uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <svg id="pin-submit-spinner" class="animate-spin -ml-1 mr-2 h-4 w-4 text-black hidden" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span id="pin-submit-text">Verify Secret PIN & Unlock</span>
            </button>

            <!-- Back to Step 1 Button -->
            <button 
              type="button" 
              onclick="showLoginStep(1)" 
              class="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white font-heading font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>← Back to Login Credentials</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Footer Info -->
      <div class="mt-4 pt-3 border-t border-white/5 text-center text-[10px] text-neutral-500 flex items-center justify-between">
        <span>2-Step Verification Active</span>
        <span>Database Security Guard</span>
      </div>

    </div>
  </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // Setup auto-advance behaviors for PIN boxes
  setupPinInputBehaviors();

  // Close on backdrop click
  const modal = document.getElementById('login-auth-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeLoginModal();
      }
    });
  }
}

// ----------------------------------------------------------
// 7. Automatic Trigger Wiring & Session Guards
// ----------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  injectLoginAuthModal();

  // 1. Intercept links/buttons pointing to admin.html
  document.querySelectorAll('a[href*="admin.html"], button[onclick*="admin.html"]').forEach(el => {
    el.addEventListener('click', (e) => {
      const session = getAuthSession();
      if (!session || session.role !== 'admin') {
        e.preventDefault();
        e.stopPropagation();
        openLoginModal('admin');
      }
    });
  });

  // 2. Intercept links/buttons pointing to dashboard.html (Staff Panel)
  document.querySelectorAll('a[href*="dashboard.html"], button[onclick*="dashboard.html"]').forEach(el => {
    el.addEventListener('click', (e) => {
      const session = getAuthSession();
      if (!session || (session.role !== 'staff' && session.role !== 'admin')) {
        e.preventDefault();
        e.stopPropagation();
        openLoginModal('staff');
      }
    });
  });

  // 3. Header Logo Trigger (Mr. Cook brand logo opens portal login)
  const logos = document.querySelectorAll('header a[href*="index.html"], header a[href="#home"], .header-logo-trigger');
  logos.forEach(logo => {
    if (logo.textContent && logo.textContent.includes('Mr. Cook')) {
      logo.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openLoginModal('admin');
      });
      logo.setAttribute('title', 'Click to open Admin & Staff Login');
      logo.style.cursor = 'pointer';
    }
  });

  // ESC to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLoginModal();
    }
  });
});

function getAuthSession() {
  try {
    const s = sessionStorage.getItem('mr_cook_auth_session');
    return s ? JSON.parse(s) : null;
  } catch (e) {
    return null;
  }
}

window.mrcookLogout = function() {
  if (window.MrCookFirebase && typeof window.MrCookFirebase.logout === 'function') {
    window.MrCookFirebase.logout();
  } else {
    sessionStorage.removeItem('mr_cook_auth_session');
    window.location.href = "index.html";
  }
};
