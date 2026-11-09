// ==========================================================
// Mr. Cook - Official Menu Controller
// Location: Pakistan | Phone: 03144108033 | WhatsApp: 923144108033
// ==========================================================

const OFFICIAL_PHONE = "03144108033";
const WHATSAPP_NUMBER = "923144108033";

let cart = [];

// State for active item in customization modal
let modalState = {
  item: null,
  qty: 1,
  selectedSizePrice: 0,
  selectedSizeLabel: "",
  selectedSelections: {},
  selectedAddOns: [],
  unitPrice: 0
};

// Firestore Dynamic Menu Cache
window._firestoreMenuData = null;

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('menu-sections-container');
  if (container && window.MrCookFX) {
    window.MrCookFX.renderMenuSkeletons(container, 8);
  }

  // Smooth transition from shimmering skeleton placeholders to live items
  setTimeout(() => {
    renderMenuUI();
    loadCartFromStorage();
    updateCartBadge(false);
    initCategoryScrollSpy();
    checkActiveOrderBanner();
    initDynamicFirestoreMenu();
  }, 100);
});

// Dynamic menu fetching from Firebase Firestore 'menu' collection
function initDynamicFirestoreMenu() {
  async function loadMenuFromCloud() {
    if (window.MrCookFirebase && typeof window.MrCookFirebase.fetchMenu === 'function') {
      try {
        const cloudMenu = await window.MrCookFirebase.fetchMenu();
        if (cloudMenu && Array.isArray(cloudMenu) && cloudMenu.length > 0) {
          console.log('[Firestore] Rendered dynamic items from "menu" collection:', cloudMenu.length);
          window._firestoreMenuData = cloudMenu;
          renderMenuUI();
          initCategoryScrollSpy();
        }
      } catch (e) {
        console.warn('[Firestore] Error loading "menu" collection:', e);
      }

      // Real-time listener for any Firestore 'menu' document additions/updates
      if (typeof window.MrCookFirebase.listenToMenu === 'function') {
        window.MrCookFirebase.listenToMenu((liveMenu) => {
          if (liveMenu && Array.isArray(liveMenu) && liveMenu.length > 0) {
            window._firestoreMenuData = liveMenu;
            renderMenuUI();
            initCategoryScrollSpy();
          }
        });
      }
    }
  }

  if (window.MrCookFirebase) {
    loadMenuFromCloud();
  } else {
    window.addEventListener('mrcook:firebase-ready', loadMenuFromCloud, { once: true });
  }
}

// Helper for price formatting
function formatCurrency(num) {
  if (isNaN(num)) return 'Rs. 0';
  const hasDecimals = num % 1 !== 0;
  return 'Rs. ' + Number(num).toLocaleString('en-US', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2
  });
}

// Helper to retrieve active menu catalog (Firestore 'menu' collection, custom via Admin, or default)
function getActiveMenuData() {
  if (window._firestoreMenuData && Array.isArray(window._firestoreMenuData) && window._firestoreMenuData.length > 0) {
    return window._firestoreMenuData;
  }

  try {
    const custom = localStorage.getItem('mr_cook_menu_catalog');
    if (custom) {
      const parsed = JSON.parse(custom);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Guarantee Drinks & Beverages category is synchronized
        if (typeof OFFICIAL_MENU_DATA !== 'undefined') {
          const hasDrinks = parsed.some(c => c.id === 'drinks-beverages');
          if (!hasDrinks) {
            const drinksCat = OFFICIAL_MENU_DATA.find(c => c.id === 'drinks-beverages');
            if (drinksCat) {
              parsed.push(JSON.parse(JSON.stringify(drinksCat)));
              try {
                localStorage.setItem('mr_cook_menu_catalog', JSON.stringify(parsed));
              } catch (err) {}
            }
          }
        }
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read custom menu catalog:', e);
  }
  return typeof OFFICIAL_MENU_DATA !== 'undefined' ? OFFICIAL_MENU_DATA : [];
}

// Universal menu item finder by ID or index tuple
function findMenuItem(catOrId, itemIdx) {
  const catalog = getActiveMenuData();
  if (typeof catOrId === 'string') {
    for (const cat of catalog) {
      const match = (cat.items || []).find(i => i.id === catOrId);
      if (match) return match;
    }
  }
  if (typeof catOrId === 'number' && typeof itemIdx === 'number') {
    return catalog[catOrId]?.items[itemIdx] || null;
  }
  return null;
}

// ----------------------------------------------------------
// 1. Render Menu UI (Clean Sidebar - Text Labels Only)
// ----------------------------------------------------------
function renderMenuUI() {
  const catalog = getActiveMenuData();
  if (!catalog || catalog.length === 0) {
    console.error('Menu catalog not available.');
    return;
  }

  const sidebarNav = document.getElementById('sidebar-nav');
  const mobileBar = document.getElementById('mobile-categories-bar');
  const sectionsContainer = document.getElementById('menu-sections-container');

  if (!sidebarNav || !mobileBar || !sectionsContainer) return;

  let sidebarHTML = '';
  let mobileHTML = '';
  let sectionsHTML = '';

  let visibleCatCount = 0;

  catalog.forEach((category, catIdx) => {
    // Filter out items that admin marked as hidden
    const visibleItems = (category.items || []).filter(item => !item.hidden);
    if (visibleItems.length === 0) {
      // Skip empty categories on customer menu
      return;
    }

    const isFirst = visibleCatCount === 0;
    visibleCatCount++;

    // 1. Sidebar link: ONLY CLEAN TEXT LABELS - NO NUMBERS, NO ICONS
    sidebarHTML += `
      <a href="#${category.id}" class="sidebar-link block px-3.5 py-2.5 rounded-xl transition-all ${isFirst ? 'bg-amber-500 text-black font-bold active-cat' : 'text-neutral-300 hover:text-white hover:bg-white/5'}" data-target="${category.id}">
        <span class="truncate tracking-wide text-xs">${category.name}</span>
      </a>
    `;

    // 2. Mobile horizontal pill: ONLY CLEAN TEXT LABELS
    mobileHTML += `
      <a href="#${category.id}" class="mobile-cat-pill whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${isFirst ? 'bg-amber-500 text-black active-pill' : 'bg-neutral-800 text-neutral-300'}" data-target="${category.id}">
        <span>${category.name}</span>
      </a>
    `;

    // 3. Compact Grid Cards
    let cardsHTML = '';
    visibleItems.forEach((item, itemIdx) => {
      cardsHTML += `
        <div class="food-card card-entry-animated h-full w-full min-w-0 bg-[#1b1b1b] border border-white/5 rounded-2xl overflow-hidden flex flex-col group cursor-pointer relative" style="animation-delay: ${(itemIdx % 8) * 45}ms;" onclick="handleCardClick(event, '${item.id}')" data-title="${escapeHTML(item.name)}" data-desc="${escapeHTML(item.desc)}">
          
          <!-- Accurate Photo Thumbnail -->
          <div class="relative h-28 sm:h-32 overflow-hidden bg-neutral-900 shrink-0">
            <img 
              src="${item.img}" 
              onerror="this.onerror=null;this.src='./images/burger.jpg'"
              alt="${escapeHTML(item.name)}" 
              class="food-card-img w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
              loading="lazy"
            />
            <!-- Tag Badge (if any) -->
            ${item.tag ? `
              <div class="absolute top-2 left-2 z-10 pointer-events-none">
                <span class="bg-amber-500 text-black text-[9px] font-black uppercase px-2 py-0.5 rounded shadow">
                  ${item.tag}
                </span>
              </div>
            ` : ''}
          </div>

          <!-- Structured Content Body -->
          <div class="food-card-body p-3 sm:p-3.5 flex flex-col flex-1 min-w-0 justify-between">
            
            <!-- Title & Description Block with Proper Text Wrapping & Ellipsis -->
            <div class="min-w-0 mb-3">
              <h3 class="food-card-title font-heading font-bold text-xs sm:text-sm text-white group-hover:text-amber-400 transition-colors leading-snug mb-1">
                ${escapeHTML(item.name)}
              </h3>
              <p class="food-card-desc text-neutral-400 text-[11px] leading-relaxed">
                ${escapeHTML(item.desc)}
              </p>
            </div>

            <!-- Anchored Bottom Footer (Price & Add to Order Button) -->
            <div class="food-card-footer mt-auto pt-2.5 border-t border-white/5 flex flex-col gap-2 shrink-0">
              <div class="flex items-center justify-between gap-1.5 min-w-0">
                <span class="text-[10px] uppercase font-bold tracking-wider text-neutral-400 shrink-0">Price</span>
                <span class="food-card-price font-heading font-black text-xs sm:text-sm text-amber-400 truncate text-right">
                  ${item.price}
                </span>
              </div>

              <button 
                onclick="event.stopPropagation(); handleAddButtonClick('${item.id}')" 
                class="w-full py-2 px-2.5 rounded-xl bg-white/5 hover:bg-amber-500 hover:text-black text-neutral-200 border border-white/10 hover:border-amber-500 font-heading font-bold text-xs tracking-wide transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95 group/btn shrink-0 shadow-sm"
                aria-label="Add ${escapeHTML(item.name)} to order"
              >
                <span class="text-amber-400 group-hover/btn:text-black transition-colors font-black text-sm leading-none">+</span>
                <span>Add to Order</span>
              </button>
            </div>

          </div>

        </div>
      `;
    });

    sectionsHTML += `
      <section id="${category.id}" class="menu-section scroll-mt-28 entry-fade-up">
        <div class="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
          <div>
            <span class="text-amber-500 font-heading font-bold text-[10px] uppercase tracking-widest block">${category.badge || 'Mr. Cook'}</span>
            <h2 class="font-heading font-black text-xl sm:text-2xl text-white">
              ${category.name}
            </h2>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 items-stretch">
          ${cardsHTML}
        </div>
      </section>
    `;
  });

  sidebarNav.innerHTML = sidebarHTML;
  mobileBar.innerHTML = mobileHTML;
  sectionsContainer.innerHTML = sectionsHTML;

  // Initialize 3D Tilt and Category Gliding on newly rendered cards
  if (window.MrCookFX) {
    window.MrCookFX.init3DTilt(sectionsContainer);
    window.MrCookFX.initCategoryGliding();
  }
}

function handleCardClick(event, catOrId, itemIdx) {
  openOptionsModal(catOrId, itemIdx);
}

function handleAddButtonClick(catOrId, itemIdx) {
  const item = findMenuItem(catOrId, itemIdx);
  if (!item) return;

  // If item has required options (like Pizza sizes or choice of drink/sides), open options modal
  if (item.options && (item.options.size || item.options.drink || item.options.side || item.options.crust)) {
    openOptionsModal(catOrId, itemIdx);
  } else {
    // Add silently with micro-interaction
    quickAddToCart(item);
  }
}

// ----------------------------------------------------------
// 2. Interactive Options Selection Modal
// ----------------------------------------------------------
function openOptionsModal(catOrId, itemIdx) {
  const item = findMenuItem(catOrId, itemIdx);
  if (!item) return;

  modalState.item = item;
  modalState.qty = 1;
  modalState.selectedAddOns = [];
  modalState.selectedSelections = {};
  modalState.selectedSizePrice = item.numPrice;
  modalState.selectedSizeLabel = "";

  const opts = item.options || {};

  // Default size if size array exists (e.g. Pizzas: Small, Medium, Large)
  if (opts.size && opts.size.length > 0) {
    modalState.selectedSizePrice = opts.size[0].price;
    modalState.selectedSizeLabel = opts.size[0].label;
  }

  // Pre-select first choice for other options
  const singleChoiceKeys = [
    'drink', 'side', 'sauce', 'crust', 'flavor', 'spice', 
    'wingsStyle', 'wingsFlavor', 'glaze', 'heat', 'style', 
    'pastaType', 'patty', 'chutney', 'condiments'
  ];
  singleChoiceKeys.forEach(k => {
    if (opts[k] && opts[k].length > 0) {
      modalState.selectedSelections[k] = opts[k][0];
    }
  });

  // Populate Header
  const imgEl = document.getElementById('modal-item-img');
  const nameEl = document.getElementById('modal-item-name');
  const descEl = document.getElementById('modal-item-desc');
  const basePriceEl = document.getElementById('modal-item-base-price');
  const qtyEl = document.getElementById('modal-qty');

  if (imgEl) {
    imgEl.src = item.img;
    imgEl.onerror = () => { imgEl.src = './images/burger.jpg'; };
  }
  if (nameEl) nameEl.textContent = item.name;
  if (descEl) descEl.textContent = item.desc;
  if (basePriceEl) basePriceEl.textContent = item.price;
  if (qtyEl) qtyEl.textContent = "1";

  // Render options form
  renderModalOptions();
  updateModalTotal();

  // Show Modal with hardware-accelerated cubic-bezier transitions
  const modal = document.getElementById('options-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex', 'modal-overlay-enter');
    const dialog = modal.querySelector('div');
    if (dialog) {
      dialog.classList.remove('modal-dialog-enter');
      void dialog.offsetWidth;
      dialog.classList.add('modal-dialog-enter');
    }
    document.body.style.overflow = 'hidden';
  }
}

function renderModalOptions() {
  const container = document.getElementById('modal-options-container');
  if (!container) return;

  const item = modalState.item;
  const opts = item.options || {};
  let html = '';

  // 1. Size / Portion Option (e.g. Pizza Sizes: Small, Medium, Large)
  if (opts.size && opts.size.length > 0) {
    html += `
      <div class="space-y-2">
        <div class="flex justify-between items-center text-xs font-bold text-white uppercase tracking-wider">
          <span>Choose Size / Portion</span>
          <span class="text-amber-400 text-[10px]">Required</span>
        </div>
        <div class="space-y-1.5">
          ${opts.size.map((s, idx) => `
            <label class="flex items-center justify-between p-2.5 rounded-xl bg-[#252525] border ${idx === 0 ? 'border-amber-500/70 bg-amber-500/10' : 'border-white/5'} hover:border-amber-500/50 cursor-pointer transition-all opt-size-label">
              <span class="flex items-center gap-2.5">
                <input type="radio" name="opt_size" value="${s.label}" data-price="${s.price}" onchange="onSizeChange(this)" ${idx === 0 ? 'checked' : ''} class="text-amber-500 focus:ring-0" />
                <span class="text-xs text-neutral-200 font-semibold">${s.label}</span>
              </span>
              <span class="text-xs font-bold text-amber-400">${formatCurrency(s.price)}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Single select fields
  const singleFields = [
    { key: 'drink', title: 'Select Drink' },
    { key: 'side', title: 'Choice of Side' },
    { key: 'sauce', title: 'Choice of Sauce' },
    { key: 'crust', title: 'Crust Selection' },
    { key: 'flavor', title: 'Flavor / Style' },
    { key: 'wingsFlavor', title: 'Wings Flavor' },
    { key: 'wingsStyle', title: 'Wings Style' },
    { key: 'glaze', title: 'Glaze Selection' },
    { key: 'heat', title: 'Heat Level' },
    { key: 'style', title: 'Preparation Style' },
    { key: 'pastaType', title: 'Pasta Type' },
    { key: 'patty', title: 'Patty Selection' },
    { key: 'chutney', title: 'Chutney Selection' },
    { key: 'spice', title: 'Spice Level' },
    { key: 'condiments', title: 'Condiments' }
  ];

  singleFields.forEach(f => {
    if (opts[f.key] && opts[f.key].length > 0) {
      html += `
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-white uppercase tracking-wider">${f.title}</label>
          <select onchange="onSingleSelectChange('${f.key}', this.value)" class="w-full px-3 py-2 rounded-xl bg-[#252525] border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500">
            ${opts[f.key].map(opt => `<option value="${escapeHTML(opt)}">${escapeHTML(opt)}</option>`).join('')}
          </select>
        </div>
      `;
    }
  });

  // 2. Extra Add-ons
  if (opts.addOns && opts.addOns.length > 0) {
    html += `
      <div class="space-y-2 pt-1 border-t border-white/5">
        <div class="flex justify-between items-center text-xs font-bold text-white uppercase tracking-wider">
          <span>Extra Add-ons</span>
          <span class="text-neutral-400 text-[10px]">Optional</span>
        </div>
        <div class="space-y-1.5">
          ${opts.addOns.map(add => `
            <label class="flex items-center justify-between p-2 rounded-xl bg-[#252525] border border-white/5 hover:border-amber-500/40 cursor-pointer">
              <span class="flex items-center gap-2">
                <input type="checkbox" value="${escapeHTML(add.name)}" data-price="${add.price}" onchange="onAddOnToggle(this)" class="rounded text-amber-500 focus:ring-0" />
                <span class="text-xs text-neutral-200">${escapeHTML(add.name)}</span>
              </span>
              <span class="text-xs text-amber-400 font-bold">+${formatCurrency(add.price)}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 3. Special instructions input
  html += `
    <div class="space-y-1.5 pt-2 border-t border-white/5">
      <label class="block text-xs font-bold text-neutral-300 uppercase tracking-wider">Special Requests</label>
      <input type="text" id="modal-item-note" placeholder="e.g. Extra spicy, extra napkins, no onions" class="w-full px-3 py-2 rounded-xl bg-[#252525] border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500" />
    </div>
  `;

  container.innerHTML = html;
}

function onSizeChange(radio) {
  modalState.selectedSizePrice = parseFloat(radio.getAttribute('data-price')) || modalState.item.numPrice;
  modalState.selectedSizeLabel = radio.value;

  const allLabels = document.querySelectorAll('.opt-size-label');
  allLabels.forEach(lbl => {
    lbl.classList.remove('border-amber-500/70', 'bg-amber-500/10');
    lbl.classList.add('border-white/5');
  });
  const parent = radio.closest('.opt-size-label');
  if (parent) {
    parent.classList.add('border-amber-500/70', 'bg-amber-500/10');
    parent.classList.remove('border-white/5');
  }

  updateModalTotal();
}

function onSingleSelectChange(key, value) {
  modalState.selectedSelections[key] = value;
  updateModalTotal();
}

function onAddOnToggle(checkbox) {
  const name = checkbox.value;
  const price = parseFloat(checkbox.getAttribute('data-price')) || 0;

  if (checkbox.checked) {
    modalState.selectedAddOns.push({ name, price });
  } else {
    modalState.selectedAddOns = modalState.selectedAddOns.filter(a => a.name !== name);
  }
  updateModalTotal();
}

function changeModalQty(delta) {
  modalState.qty = Math.max(1, modalState.qty + delta);
  const qtyEl = document.getElementById('modal-qty');
  if (qtyEl) qtyEl.textContent = modalState.qty;
  updateModalTotal();
}

function updateModalTotal() {
  let unit = modalState.selectedSizePrice || modalState.item.numPrice;

  // Crust stuffed pricing
  const crustVal = modalState.selectedSelections['crust'] || "";
  if (crustVal.includes('+Rs.')) {
    const match = crustVal.match(/\+Rs\.\s*(\d+)/);
    if (match) unit += parseFloat(match[1]);
  }

  // Add-ons total
  const addOnsTotal = modalState.selectedAddOns.reduce((sum, a) => sum + a.price, 0);
  unit += addOnsTotal;

  modalState.unitPrice = unit;
  const total = unit * modalState.qty;

  const btnPriceEl = document.getElementById('modal-total-btn-price');
  if (btnPriceEl) btnPriceEl.textContent = `• ${formatCurrency(total)}`;
}

function closeOptionsModal() {
  const modal = document.getElementById('options-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex', 'modal-overlay-enter');
    const dialog = modal.querySelector('div');
    if (dialog) dialog.classList.remove('modal-dialog-enter');
    document.body.style.overflow = '';
  }
}

// ----------------------------------------------------------
// 3. Silent Add-to-Cart with Micro-interaction
// ----------------------------------------------------------
function confirmOptionsAddToCart() {
  if (!modalState.item) return;

  const noteInput = document.getElementById('modal-item-note');
  const userNote = noteInput ? noteInput.value.trim() : '';

  const details = [];
  if (modalState.selectedSizeLabel) details.push(modalState.selectedSizeLabel);
  Object.values(modalState.selectedSelections).forEach(val => {
    if (val) details.push(val);
  });
  modalState.selectedAddOns.forEach(a => details.push(`+${a.name}`));
  if (userNote) details.push(`Note: ${userNote}`);

  const itemTitle = modalState.item.name;
  const optionsText = details.join(' • ');

  const cartKey = `${itemTitle} [${optionsText}]`;
  const existing = cart.find(i => i.key === cartKey);

  if (existing) {
    existing.quantity += modalState.qty;
  } else {
    cart.push({
      key: cartKey,
      name: itemTitle,
      optionsText: optionsText,
      price: modalState.unitPrice,
      img: modalState.item.img,
      quantity: modalState.qty
    });
  }

  saveCartToStorage();
  closeOptionsModal();

  // Log Firebase Analytics Event
  if (window.MrCookFirebase && typeof window.MrCookFirebase.logEvent === 'function') {
    window.MrCookFirebase.logEvent('add_to_cart', {
      item_name: itemTitle,
      value: modalState.unitPrice,
      quantity: modalState.qty,
      currency: 'PKR'
    });
  }

  // Micro-interaction & silent addition (No side panel!)
  updateCartBadge(true);
  showToast(`
    <span>Added <strong>${modalState.qty}x ${escapeHTML(itemTitle)}</strong> to Cart!</span>
    <a href="cart.html" class="underline font-bold text-amber-400 ml-2 hover:text-white transition-colors">View Cart →</a>
  `);
}

function quickAddToCart(item) {
  const itemTitle = item.name;
  const cartKey = `${itemTitle} []`;
  const existing = cart.find(i => i.key === cartKey);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      key: cartKey,
      name: itemTitle,
      optionsText: "",
      price: item.numPrice,
      img: item.img,
      quantity: 1
    });
  }

  saveCartToStorage();

  if (window.MrCookFirebase && typeof window.MrCookFirebase.logEvent === 'function') {
    window.MrCookFirebase.logEvent('add_to_cart', {
      item_name: itemTitle,
      value: item.numPrice,
      quantity: 1,
      currency: 'PKR'
    });
  }

  updateCartBadge(true);
  showToast(`
    <span>Added <strong>1x ${escapeHTML(itemTitle)}</strong> to Cart!</span>
    <a href="cart.html" class="underline font-bold text-amber-400 ml-2 hover:text-white transition-colors">View Cart →</a>
  `);
}

// ----------------------------------------------------------
// 4. Cart Storage & Micro-interaction Badge
// ----------------------------------------------------------
function loadCartFromStorage() {
  try {
    const saved = localStorage.getItem('mr_cook_cart');
    cart = saved ? JSON.parse(saved) : [];
  } catch (e) {
    cart = [];
  }
}

function saveCartToStorage() {
  try {
    localStorage.setItem('mr_cook_cart', JSON.stringify(cart));
  } catch (e) {}
}

function updateCartBadge(animate = false) {
  const badge = document.getElementById('cart-badge');
  const headerCartBtn = document.getElementById('header-cart-btn');
  const cartIcon = headerCartBtn ? headerCartBtn.querySelector('svg') : null;
  const mobileBadge = document.getElementById('mobile-cart-badge');
  const mobileSubtotal = document.getElementById('mobile-cart-subtotal');
  const mobileBar = document.getElementById('mobile-cart-bar');
  const mobileBarLink = mobileBar ? mobileBar.querySelector('a') : null;

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);

  if (badge) {
    badge.textContent = totalItems;
  }

  // Mobile floating cart update
  if (mobileBadge) mobileBadge.textContent = totalItems;
  if (mobileSubtotal) mobileSubtotal.textContent = formatCurrency(subtotal);
  if (mobileBar) {
    if (totalItems > 0) {
      mobileBar.classList.remove('hidden');
      mobileBar.classList.add('flex', 'drawer-slide-up');
    } else {
      mobileBar.classList.add('hidden');
      mobileBar.classList.remove('flex', 'drawer-slide-up');
    }
  }

  if (animate) {
    // 1. Header Cart Button Bounce & Pulse
    if (headerCartBtn) {
      headerCartBtn.classList.remove('animate-cart-bounce');
      void headerCartBtn.offsetWidth; // Force reflow
      headerCartBtn.classList.add('animate-cart-bounce');
      setTimeout(() => {
        headerCartBtn.classList.remove('animate-cart-bounce');
      }, 700);
    }

    // 2. Cart Icon Micro-Wiggle
    if (cartIcon) {
      cartIcon.classList.remove('animate-cart-wiggle');
      void cartIcon.offsetWidth;
      cartIcon.classList.add('animate-cart-wiggle');
      setTimeout(() => {
        cartIcon.classList.remove('animate-cart-wiggle');
      }, 700);
    }

    // 3. Cart Badge Dynamic Pop
    if (badge) {
      badge.classList.remove('animate-badge-pop');
      void badge.offsetWidth;
      badge.classList.add('animate-badge-pop');
      setTimeout(() => {
        badge.classList.remove('animate-badge-pop');
      }, 550);
    }

    // 4. Mobile Bar Bounce & Mobile Badge Pop
    if (mobileBarLink) {
      mobileBarLink.classList.remove('animate-cart-bounce');
      void mobileBarLink.offsetWidth;
      mobileBarLink.classList.add('animate-cart-bounce');
      setTimeout(() => {
        mobileBarLink.classList.remove('animate-cart-bounce');
      }, 700);
    }
    if (mobileBadge) {
      mobileBadge.classList.remove('animate-badge-pop');
      void mobileBadge.offsetWidth;
      mobileBadge.classList.add('animate-badge-pop');
      setTimeout(() => {
        mobileBadge.classList.remove('animate-badge-pop');
      }, 550);
    }
  }
}

// ----------------------------------------------------------
// 5. Category ScrollSpy for Sidebar & Mobile Pills (Clean Labels)
// ----------------------------------------------------------
function initCategoryScrollSpy() {
  const sections = document.querySelectorAll('.menu-section');
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  const mobilePills = document.querySelectorAll('.mobile-cat-pill');

  window.addEventListener('scroll', () => {
    let scrollY = window.pageYOffset;

    sections.forEach(sec => {
      const secHeight = sec.offsetHeight;
      const secTop = sec.offsetTop - 140;
      const secId = sec.getAttribute('id');

      if (scrollY >= secTop && scrollY < secTop + secHeight) {
        sidebarLinks.forEach(link => {
          if (link.getAttribute('data-target') === secId) {
            link.classList.remove('text-neutral-300', 'hover:bg-white/5');
            link.classList.add('bg-amber-500', 'text-black', 'font-bold', 'active-cat');
          } else {
            link.classList.remove('bg-amber-500', 'text-black', 'font-bold', 'active-cat');
            link.classList.add('text-neutral-300');
          }
        });

        mobilePills.forEach(pill => {
          if (pill.getAttribute('data-target') === secId) {
            pill.classList.remove('bg-neutral-800', 'text-neutral-300');
            pill.classList.add('bg-amber-500', 'text-black', 'active-pill');
          } else {
            pill.classList.remove('bg-amber-500', 'text-black', 'active-pill');
            pill.classList.add('bg-neutral-800', 'text-neutral-300');
          }
        });
      }
    });
  });
}

// ----------------------------------------------------------
// 6. Live Search Filter
// ----------------------------------------------------------
function handleMenuSearch(keyword) {
  const query = keyword.toLowerCase().trim();
  const cards = document.querySelectorAll('.food-card');
  const sections = document.querySelectorAll('.menu-section');

  cards.forEach(card => {
    const title = (card.getAttribute('data-title') || '').toLowerCase();
    const desc = (card.getAttribute('data-desc') || '').toLowerCase();

    if (title.includes(query) || desc.includes(query)) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });

  sections.forEach(sec => {
    const visibleCards = sec.querySelectorAll('.food-card[style*="display: flex"]');
    if (query !== '' && visibleCards.length === 0) {
      sec.style.display = 'none';
    } else {
      sec.style.display = 'block';
    }
  });
}

// ----------------------------------------------------------
// 7. Toast Notification
// ----------------------------------------------------------
function showToast(htmlContent) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  if (!toast || !toastMsg) return;

  toastMsg.innerHTML = htmlContent;
  toast.classList.remove('translate-y-24', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');

  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-24', 'opacity-0');
  }, 2600);
}

// String escape utilities
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

function escapeJS(str) {
  if (!str) return '';
  return str.replace(/'/g, "\\'");
}

// Check and render persistent active order tracker on menu page
function checkActiveOrderBanner() {
  const container = document.getElementById('persistent-order-container');
  if (!container) return;

  const storedOrder = localStorage.getItem('mr_cook_active_order');
  if (!storedOrder) return;

  try {
    const order = JSON.parse(storedOrder);
    if (!order || !order.orderId) return;

    const orderIdEl = document.getElementById('menu-tracker-order-id');
    const countdownEl = document.getElementById('menu-tracker-countdown');

    if (orderIdEl) orderIdEl.textContent = `#${order.orderId}`;
    container.classList.remove('hidden');

    function update() {
      // Re-read active order in case status changed
      try {
        const fresh = localStorage.getItem('mr_cook_active_order');
        if (!fresh) {
          container.classList.add('hidden');
          return;
        }
        const freshOrder = JSON.parse(fresh);
        if (freshOrder.status === 'delivered') {
          if (countdownEl) countdownEl.textContent = "Delivered ✓";
          setTimeout(() => {
            container.classList.add('hidden');
            localStorage.removeItem('mr_cook_active_order');
          }, 5000);
          return;
        } else if (freshOrder.status === 'on_the_way') {
          const riderName = freshOrder.rider?.name || 'Tariq Mehmood';
          const infoP = container.querySelector('p.text-xs');
          if (infoP) infoP.innerHTML = `Order <strong class="text-white font-mono">#${freshOrder.orderId}</strong> is out with rider <strong>${riderName}</strong>`;
        }
      } catch (e) {}

      const remainingSeconds = Math.max(0, Math.floor((order.estimatedDeliveryTime - Date.now()) / 1000));
      const m = Math.floor(remainingSeconds / 60);
      const s = remainingSeconds % 60;
      if (countdownEl) {
        countdownEl.textContent = remainingSeconds <= 0 ? "Arriving Now! 🛵" : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      }
    }
    update();
    setInterval(update, 1000);
  } catch (e) {}
}

// Listen for catalog updates from Admin panel
window.addEventListener('storage', (e) => {
  if (e.key === 'mr_cook_menu_catalog') {
    renderMenuUI();
    initCategoryScrollSpy();
  }
});
window.addEventListener('mr_cook_catalog_updated', () => {
  renderMenuUI();
  initCategoryScrollSpy();
});
