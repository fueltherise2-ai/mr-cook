// ==========================================================
// Mr. Cook - Dedicated Cart & Checkout Controller
// Location: Pakistan | Phone: 03144108033 | WhatsApp: 923144108033
// ==========================================================

const OFFICIAL_PHONE = "03144108033";
const WHATSAPP_NUMBER = "923144108033";
const FREE_DELIVERY_THRESHOLD = 1500;
function getStandardDeliveryFee() {
  if (window.MrCookTheme && typeof window.MrCookTheme.getSettings === 'function') {
    const fee = window.MrCookTheme.getSettings().deliveryFee;
    if (typeof fee === 'number') return fee;
  }
  return 150;
}
const STANDARD_DELIVERY_FEE = 150;

let cart = [];

document.addEventListener('DOMContentLoaded', () => {
  loadCartFromStorage();
  renderDedicatedCart();
  renderPersistentOrderTracker();
});

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

function formatCurrency(num) {
  if (isNaN(num)) return 'Rs. 0';
  const hasDecimals = num % 1 !== 0;
  return 'Rs. ' + Number(num).toLocaleString('en-US', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2
  });
}

// ----------------------------------------------------------
// 1. Render Dedicated Cart Page View
// ----------------------------------------------------------
function renderDedicatedCart() {
  const emptyView = document.getElementById('empty-cart-view');
  const filledView = document.getElementById('filled-cart-view');
  const itemsContainer = document.getElementById('cart-items-list');
  const countPill = document.getElementById('cart-count-pill');
  const summaryCount = document.getElementById('summary-items-count');
  const summarySubtotal = document.getElementById('summary-subtotal');
  const summaryDelivery = document.getElementById('summary-delivery');
  const summaryTotal = document.getElementById('summary-total');
  const deliveryHintText = document.getElementById('delivery-hint-text');

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);

  if (countPill) {
    countPill.textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'items'}`;
  }

  // Handle Empty State
  if (cart.length === 0) {
    if (emptyView) {
      emptyView.classList.remove('hidden');
      emptyView.classList.add('flex');
    }
    if (filledView) {
      filledView.classList.add('hidden');
      filledView.classList.remove('flex');
    }
    return;
  }

  // Handle Filled State
  if (emptyView) {
    emptyView.classList.add('hidden');
    emptyView.classList.remove('flex');
  }
  if (filledView) {
    filledView.classList.remove('hidden');
    filledView.classList.add('flex');
  }

  // Render Itemized List
  if (itemsContainer) {
    let html = '';
    cart.forEach((item, idx) => {
      const lineTotal = item.price * item.quantity;

      html += `
        <div class="glass-card card-entry-animated hover-elevate-card bg-[#1b1b1b] border border-white/5 hover:border-amber-500/30 rounded-2xl p-4 sm:p-5 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style="animation-delay: ${(idx % 8) * 50}ms;">
          
          <!-- Image & Info -->
          <div class="flex items-center gap-3.5 flex-grow min-w-0">
            <img 
              src="${item.img || './images/burger.jpg'}" 
              onerror="this.src='./images/burger.jpg'" 
              alt="${escapeHTML(item.name)}" 
              class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 border border-white/5 card-zoom-img" 
            />
            <div class="min-w-0 flex-grow">
              <h3 class="font-heading font-bold text-white text-sm sm:text-base mb-1 truncate">
                ${escapeHTML(item.name)}
              </h3>
              ${item.optionsText ? `
                <p class="text-neutral-400 text-xs leading-snug line-clamp-2 mb-1.5">
                  <span class="inline-block px-2 py-0.5 rounded bg-white/5 text-neutral-300 text-[11px] border border-white/5">
                    ${escapeHTML(item.optionsText)}
                  </span>
                </p>
              ` : ''}
              <div class="flex items-center gap-2 text-xs">
                <span class="text-neutral-400">Unit Base Price:</span>
                <span class="font-bold text-amber-400">${formatCurrency(item.price)}</span>
              </div>
            </div>
          </div>

          <!-- Quantity Controls & Line Total -->
          <div class="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5 shrink-0">
            
            <!-- Stepper -->
            <div class="flex items-center gap-1 bg-[#252525] border border-white/10 rounded-xl p-1">
              <button 
                onclick="updateCartItemQty('${escapeJS(item.key)}', -1)" 
                class="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-sm flex items-center justify-center transition-colors"
                aria-label="Decrease quantity"
              >-</button>
              <span class="w-8 text-center text-sm font-bold text-white">${item.quantity}</span>
              <button 
                onclick="updateCartItemQty('${escapeJS(item.key)}', 1)" 
                class="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-sm flex items-center justify-center transition-colors"
                aria-label="Increase quantity"
              >+</button>
            </div>

            <!-- Total Price -->
            <div class="text-right min-w-[5.5rem]">
              <span class="text-[10px] text-neutral-500 block uppercase">Subtotal</span>
              <span class="font-heading font-black text-sm sm:text-base text-white">
                ${formatCurrency(lineTotal)}
              </span>
            </div>

            <!-- Remove Button -->
            <button 
              onclick="removeCartItem('${escapeJS(item.key)}')" 
              class="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors" 
              title="Remove item from cart"
              aria-label="Remove ${escapeHTML(item.name)}"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>

          </div>

        </div>
      `;
    });
    itemsContainer.innerHTML = html;
  }

  // Calculate delivery fee
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : getStandardDeliveryFee();
  const finalTotal = subtotal + deliveryFee;

  if (summaryCount) summaryCount.textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'items'}`;
  if (summarySubtotal) summarySubtotal.textContent = formatCurrency(subtotal);
  if (summaryDelivery) {
    if (deliveryFee === 0) {
      summaryDelivery.innerHTML = `<span class="text-emerald-400 font-bold">FREE (Promo Unlocked)</span>`;
    } else {
      summaryDelivery.innerHTML = `<span class="text-neutral-200 font-bold">${formatCurrency(deliveryFee)}</span>`;
    }
  }

  if (deliveryHintText) {
    if (subtotal >= FREE_DELIVERY_THRESHOLD) {
      deliveryHintText.innerHTML = `🎉 <span class="text-emerald-400 font-bold">Free Delivery Unlocked!</span> Enjoy zero delivery fee across Rawalpindi.`;
    } else {
      const needed = FREE_DELIVERY_THRESHOLD - subtotal;
      deliveryHintText.innerHTML = `Add <strong>${formatCurrency(needed)}</strong> more to get <strong>Free Delivery</strong>!`;
    }
  }

  if (summaryTotal) summaryTotal.textContent = formatCurrency(finalTotal);

  if (window.MrCookFX && itemsContainer) {
    window.MrCookFX.init3DTilt(itemsContainer);
  }
}

// ----------------------------------------------------------
// 2. Quantity & Item Removal Handlers
// ----------------------------------------------------------
function updateCartItemQty(key, delta) {
  const item = cart.find(i => i.key === key);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter(i => i.key !== key);
    showCartToast("Item removed from cart");
  } else {
    showCartToast("Quantity updated");
  }

  saveCartToStorage();
  renderDedicatedCart();
}

function removeCartItem(key) {
  const item = cart.find(i => i.key === key);
  const name = item ? item.name : "Item";
  cart = cart.filter(i => i.key !== key);
  saveCartToStorage();
  renderDedicatedCart();
  showCartToast(`Removed "${name}" from cart`);
}

function clearEntireCart() {
  if (cart.length === 0) return;
  if (confirm("Are you sure you want to remove all items from your cart?")) {
    cart = [];
    saveCartToStorage();
    renderDedicatedCart();
    showCartToast("Cart cleared");
  }
}

// ----------------------------------------------------------
// 3. Customer Information Form & Checkout Flow
// ----------------------------------------------------------
function openCheckoutSummaryModal() {
  if (cart.length === 0) {
    showCartToast("Your cart is empty! Add items to checkout.");
    return;
  }

  const modal = document.getElementById('checkout-modal');
  const itemsCountEl = document.getElementById('modal-summary-items');
  const subtotalEl = document.getElementById('modal-subtotal');
  const deliveryEl = document.getElementById('modal-delivery');
  const totalEl = document.getElementById('modal-total');

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : getStandardDeliveryFee();
  const finalTotal = subtotal + deliveryFee;

  if (itemsCountEl) itemsCountEl.textContent = `${totalItems} Items`;
  if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
  if (deliveryEl) {
    deliveryEl.textContent = deliveryFee === 0 ? "FREE (Rawalpindi Promo)" : formatCurrency(deliveryFee);
  }
  if (totalEl) totalEl.textContent = formatCurrency(finalTotal);

  // Pre-fill customer input fields if saved previously
  const savedName = localStorage.getItem('mr_cook_customer_name') || '';
  const savedAddress = localStorage.getItem('mr_cook_customer_address') || '';
  const savedPhone = localStorage.getItem('mr_cook_customer_phone') || '';
  const savedAltPhone = localStorage.getItem('mr_cook_customer_alt_phone') || '';

  const nameInput = document.getElementById('checkout-fullname');
  const addressInput = document.getElementById('checkout-address');
  const phoneInput = document.getElementById('checkout-phone');
  const altPhoneInput = document.getElementById('checkout-alt-phone');

  if (nameInput && !nameInput.value) nameInput.value = savedName;
  if (addressInput && !addressInput.value) addressInput.value = savedAddress;
  if (phoneInput && !phoneInput.value) phoneInput.value = savedPhone;
  if (altPhoneInput && !altPhoneInput.value) altPhoneInput.value = savedAltPhone;

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

function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex', 'modal-overlay-enter');
    const dialog = modal.querySelector('div');
    if (dialog) dialog.classList.remove('modal-dialog-enter');
    document.body.style.overflow = '';
  }
}

// ----------------------------------------------------------
// 4. Order Placement & 2-Second Notification Feedback
// ----------------------------------------------------------
function handlePlaceOrderSubmit(event) {
  if (event) event.preventDefault();

  if (cart.length === 0) {
    showCartToast("Your cart is empty! Add items to checkout.");
    closeCheckoutModal();
    return;
  }

  const nameInput = document.getElementById('checkout-fullname');
  const addressInput = document.getElementById('checkout-address');
  const phoneInput = document.getElementById('checkout-phone');
  const altPhoneInput = document.getElementById('checkout-alt-phone');

  const fullname = nameInput ? nameInput.value.trim() : '';
  const address = addressInput ? addressInput.value.trim() : '';
  const phone = phoneInput ? phoneInput.value.trim() : '';
  const altPhone = altPhoneInput ? altPhoneInput.value.trim() : '';

  if (!fullname || !address || !phone) {
    showCartToast("Please fill in Full Name, Delivery Address & Phone Number.");
    return;
  }

  // Compile active order object
  const orderId = `MC-${Math.floor(100000 + Math.random() * 900000)}`;
  const now = Date.now();
  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : getStandardDeliveryFee();
  const finalTotal = subtotal + deliveryFee;

  const activeOrder = {
    orderId: orderId,
    createdAt: now,
    estimatedDeliveryTime: now + (35 * 60 * 1000), // 35-minute delivery window
    customer: {
      name: fullname,
      address: address,
      phone: phone,
      altPhone: altPhone || ''
    },
    items: JSON.parse(JSON.stringify(cart)),
    pricing: {
      totalItems: totalItems,
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      finalTotal: finalTotal
    },
    status: 'pending' // Initial status: pending
  };

  // Persist order & customer preferences to localStorage
  try {
    localStorage.setItem('mr_cook_active_order', JSON.stringify(activeOrder));
    
    // Also save to all orders list for Restaurant Dashboard
    let allOrders = [];
    try {
      const storedAll = localStorage.getItem('mr_cook_all_orders');
      allOrders = storedAll ? JSON.parse(storedAll) : [];
    } catch (e) {
      allOrders = [];
    }
    allOrders.unshift(activeOrder);
    localStorage.setItem('mr_cook_all_orders', JSON.stringify(allOrders));

    localStorage.setItem('mr_cook_customer_name', fullname);
    localStorage.setItem('mr_cook_customer_address', address);
    localStorage.setItem('mr_cook_customer_phone', phone);
    if (altPhone) {
      localStorage.setItem('mr_cook_customer_alt_phone', altPhone);
    }

    // Add new order document to Firebase Firestore 'orders' collection
    if (window.MrCookFirebase && typeof window.MrCookFirebase.addOrder === 'function') {
      window.MrCookFirebase.addOrder(activeOrder);
    } else if (window.MrCookFirebase && typeof window.MrCookFirebase.placeOrder === 'function') {
      window.MrCookFirebase.placeOrder(activeOrder);
    }
  } catch (e) {
    console.error("Storage error:", e);
  }

  // Close checkout input modal
  closeCheckoutModal();

  // Clear cart
  cart = [];
  saveCartToStorage();
  renderDedicatedCart();

  // Display 'Order Placed!' full-screen modal for exactly 2 seconds
  const feedbackModal = document.getElementById('order-placed-feedback-modal');
  const feedbackOrderIdEl = document.getElementById('feedback-order-id');
  const feedbackProgressBar = document.getElementById('feedback-progress-bar');

  if (feedbackOrderIdEl) feedbackOrderIdEl.textContent = `#${orderId}`;

  if (feedbackModal) {
    feedbackModal.classList.remove('hidden');
    feedbackModal.classList.add('flex', 'modal-overlay-enter');
    const dialog = feedbackModal.querySelector('div');
    if (dialog) {
      dialog.classList.remove('modal-dialog-enter');
      void dialog.offsetWidth;
      dialog.classList.add('modal-dialog-enter');
    }
    document.body.style.overflow = 'hidden';

    if (feedbackProgressBar) {
      feedbackProgressBar.style.width = '100%';
      setTimeout(() => {
        feedbackProgressBar.style.width = '0%';
      }, 30);
    }

    // Auto-close after exactly 2 seconds (2000 ms)
    setTimeout(() => {
      feedbackModal.classList.add('hidden');
      feedbackModal.classList.remove('flex', 'modal-overlay-enter');
      const dialog = feedbackModal.querySelector('div');
      if (dialog) dialog.classList.remove('modal-dialog-enter');
      document.body.style.overflow = '';

      // Activate Persistent Tracker & Expand Details
      renderPersistentOrderTracker();
      
      const detailsPanel = document.getElementById('tracker-details-panel');
      const chevron = document.getElementById('tracker-chevron-icon');
      const toggleText = document.getElementById('tracker-toggle-text');
      if (detailsPanel && detailsPanel.classList.contains('hidden')) {
        detailsPanel.classList.remove('hidden');
        if (chevron) chevron.classList.add('rotate-180');
        if (toggleText) toggleText.textContent = "Hide Details";
      }

      // Smooth scroll to tracker banner
      const trackerContainer = document.getElementById('persistent-order-container');
      if (trackerContainer) {
        trackerContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 2000);
  } else {
    renderPersistentOrderTracker();
  }
}

// ----------------------------------------------------------
// 5. Persistent Order Tracker & Live Countdown
// ----------------------------------------------------------
let trackerTimerInterval = null;

function renderPersistentOrderTracker() {
  const container = document.getElementById('persistent-order-container');
  if (!container) return;

  const storedOrder = localStorage.getItem('mr_cook_active_order');
  if (!storedOrder) {
    container.classList.add('hidden');
    return;
  }

  let order;
  try {
    order = JSON.parse(storedOrder);
  } catch (e) {
    container.classList.add('hidden');
    return;
  }

  if (!order || !order.orderId) {
    container.classList.add('hidden');
    return;
  }

  // Subscribe to real-time status updates from Firebase Firestore
  if (window.MrCookFirebase && typeof window.MrCookFirebase.listenToOrder === 'function' && !window._activeFirebaseOrderListener) {
    window._activeFirebaseOrderListener = window.MrCookFirebase.listenToOrder(order.orderId, (cloudOrder) => {
      if (cloudOrder && cloudOrder.status) {
        try {
          localStorage.setItem('mr_cook_active_order', JSON.stringify(cloudOrder));
        } catch (e) {}
      }
    });
  }

  // Populate order header
  const orderIdEl = document.getElementById('tracker-order-id');
  const orderTimeEl = document.getElementById('tracker-order-time');
  if (orderIdEl) orderIdEl.textContent = `#${order.orderId}`;
  if (orderTimeEl) {
    const timeString = new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    orderTimeEl.textContent = `Placed at ${timeString}`;
  }

  // Populate Itemized Receipt
  const receiptCountEl = document.getElementById('tracker-receipt-count');
  const receiptItemsEl = document.getElementById('tracker-receipt-items');
  const subtotalEl = document.getElementById('tracker-subtotal');
  const deliveryEl = document.getElementById('tracker-delivery');
  const totalEl = document.getElementById('tracker-total');

  if (receiptCountEl) receiptCountEl.textContent = `${order.pricing.totalItems} items`;
  if (subtotalEl) subtotalEl.textContent = formatCurrency(order.pricing.subtotal);
  if (deliveryEl) deliveryEl.textContent = order.pricing.deliveryFee === 0 ? 'FREE' : formatCurrency(order.pricing.deliveryFee);
  if (totalEl) totalEl.textContent = formatCurrency(order.pricing.finalTotal);

  if (receiptItemsEl && Array.isArray(order.items)) {
    let itemsHTML = '';
    order.items.forEach(item => {
      itemsHTML += `
        <div class="flex items-center justify-between p-2 rounded-xl bg-[#222222] border border-white/5">
          <div class="min-w-0 pr-2">
            <span class="font-bold text-white block truncate">${escapeHTML(item.name)} <span class="text-amber-400">×${item.quantity}</span></span>
            ${item.optionsText ? `<span class="text-[10px] text-neutral-400 block truncate">${escapeHTML(item.optionsText)}</span>` : ''}
          </div>
          <span class="font-heading font-bold text-amber-400 shrink-0">
            ${formatCurrency(item.price * item.quantity)}
          </span>
        </div>
      `;
    });
    receiptItemsEl.innerHTML = itemsHTML;
  }

  // Populate Customer & Delivery Details
  const custNameEl = document.getElementById('tracker-cust-name');
  const custAddressEl = document.getElementById('tracker-cust-address');
  const custPhoneEl = document.getElementById('tracker-cust-phone');
  const custAltPhoneEl = document.getElementById('tracker-cust-alt-phone');

  if (custNameEl) custNameEl.textContent = order.customer.name;
  if (custAddressEl) custAddressEl.textContent = order.customer.address;
  if (custPhoneEl) custPhoneEl.textContent = order.customer.phone;
  if (custAltPhoneEl) custAltPhoneEl.textContent = order.customer.altPhone || 'None provided';

  // Show container
  container.classList.remove('hidden');

  // Start live countdown timer
  startLiveDeliveryCountdown(order);
}

function startLiveDeliveryCountdown(order) {
  if (trackerTimerInterval) {
    clearInterval(trackerTimerInterval);
  }

  function tick() {
    const countdownEl = document.getElementById('tracker-countdown');
    if (!countdownEl) return;

    const remainingMs = order.estimatedDeliveryTime - Date.now();
    const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));

    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    if (remainingSeconds <= 0) {
      countdownEl.textContent = "Arriving Now! 🛵";
      updateLiveTrackerStepper(4);
    } else {
      countdownEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      
      // Check if order status in localStorage was advanced by the restaurant dashboard
      let currentStatus = order.status;
      let orderRider = order.rider;
      try {
        const freshActive = localStorage.getItem('mr_cook_active_order');
        if (freshActive) {
          const parsed = JSON.parse(freshActive);
          if (parsed.orderId === order.orderId && parsed.status) {
            currentStatus = parsed.status;
            if (parsed.rider) orderRider = parsed.rider;
          }
        }
      } catch (e) {}

      const riderCard = document.getElementById('tracker-rider-card');
      const deliveredCard = document.getElementById('tracker-delivered-card');

      if (currentStatus === 'delivered') {
        countdownEl.textContent = "Delivered ✓";
        updateLiveTrackerStepper(4);
        if (riderCard) riderCard.classList.add('hidden');
        if (deliveredCard) deliveredCard.classList.remove('hidden');

        // Automatically complete and clear tracker after 6 seconds
        if (!window._deliveredClearTimer) {
          window._deliveredClearTimer = setTimeout(() => {
            dismissCompletedOrder();
          }, 6000);
        }
      } else if (currentStatus === 'on_the_way' || currentStatus === 'on the way') {
        updateLiveTrackerStepper(3);
        if (deliveredCard) deliveredCard.classList.add('hidden');
        if (riderCard) {
          riderCard.classList.remove('hidden');
          const riderNameEl = document.getElementById('tracker-rider-name');
          const riderPhoneEl = document.getElementById('tracker-rider-phone');
          const riderVehicleEl = document.getElementById('tracker-rider-vehicle');
          if (riderNameEl) riderNameEl.textContent = orderRider?.name || 'Tariq Mehmood';
          if (riderPhoneEl) riderPhoneEl.textContent = orderRider?.phone || OFFICIAL_PHONE;
          if (riderVehicleEl) riderVehicleEl.textContent = orderRider?.vehicle || 'Honda 125 (ICT-784) • Heated Bag';
        }
      } else if (currentStatus === 'preparing') {
        updateLiveTrackerStepper(2);
        if (riderCard) riderCard.classList.add('hidden');
        if (deliveredCard) deliveredCard.classList.add('hidden');
      } else if (currentStatus === 'confirmed') {
        updateLiveTrackerStepper(1);
        if (riderCard) riderCard.classList.add('hidden');
        if (deliveredCard) deliveredCard.classList.add('hidden');
      } else {
        if (riderCard) riderCard.classList.add('hidden');
        if (deliveredCard) deliveredCard.classList.add('hidden');
        updateLiveTrackerStepper(1); // 'pending'
      }
    }
  }

  tick();
  trackerTimerInterval = setInterval(tick, 1000);
}

function updateLiveTrackerStepper(activeStep) {
  const steps = [
    { el: document.getElementById('step-placed'), icon: document.getElementById('step-icon-1'), activeColor: 'border-emerald-500/60' },
    { el: document.getElementById('step-preparing'), icon: document.getElementById('step-icon-2'), activeColor: 'border-amber-500/60' },
    { el: document.getElementById('step-delivery'), icon: document.getElementById('step-icon-3'), activeColor: 'border-blue-500/60' },
    { el: document.getElementById('step-completed'), icon: document.getElementById('step-icon-4'), activeColor: 'border-emerald-500/60' }
  ];

  steps.forEach((step, index) => {
    if (!step.el) return;
    const stepNumber = index + 1;
    if (stepNumber <= activeStep) {
      step.el.classList.add('bg-[#282828]', step.activeColor);
      step.el.classList.remove('bg-[#242424]', 'border-white/10', 'text-neutral-400');
    } else {
      step.el.classList.remove('bg-[#282828]', step.activeColor);
      step.el.classList.add('bg-[#242424]', 'border-white/10', 'text-neutral-400');
    }
  });
}

function toggleOrderTrackerDetails() {
  const panel = document.getElementById('tracker-details-panel');
  const chevron = document.getElementById('tracker-chevron-icon');
  const toggleBtn = document.getElementById('tracker-toggle-btn');
  const toggleText = document.getElementById('tracker-toggle-text');

  if (!panel) return;

  const isHidden = panel.classList.contains('hidden');
  if (isHidden) {
    panel.classList.remove('hidden');
    panel.classList.remove('drawer-slide-down');
    void panel.offsetWidth; // Force reflow
    panel.classList.add('drawer-slide-down');
    if (chevron) chevron.classList.add('rotate-180');
    if (toggleText) toggleText.textContent = "Hide Details";
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
  } else {
    panel.classList.add('hidden');
    panel.classList.remove('drawer-slide-down');
    if (chevron) chevron.classList.remove('rotate-180');
    if (toggleText) toggleText.textContent = "View Receipt & Details";
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
  }
}

function dismissCompletedOrder() {
  if (trackerTimerInterval) clearInterval(trackerTimerInterval);
  if (window._deliveredClearTimer) clearTimeout(window._deliveredClearTimer);
  window._deliveredClearTimer = null;
  if (window._activeFirebaseOrderListener) {
    try { window._activeFirebaseOrderListener(); } catch (e) {}
    window._activeFirebaseOrderListener = null;
  }

  localStorage.removeItem('mr_cook_active_order');
  const container = document.getElementById('persistent-order-container');
  if (container) {
    container.classList.add('opacity-0', 'transition-opacity', 'duration-500');
    setTimeout(() => {
      container.classList.add('hidden');
      container.classList.remove('opacity-0');
    }, 500);
  }
  showCartToast("Order delivered & completed! Ready for your next meal.");
}

function dispatchFinalWhatsAppNotification(order) {
  let orderItemsText = "";
  order.items.forEach((item, index) => {
    orderItemsText += `${index + 1}. *${item.name}* (x${item.quantity}) - ${formatCurrency(item.price * item.quantity)}\n`;
    if (item.optionsText) {
      orderItemsText += `   _${item.optionsText}_\n`;
    }
  });

  const message = `🍔 *NEW ORDER PLACED - MR. COOK (Pakistan)*\n` +
    `🆔 *Order ID:* #${order.orderId}\n` +
    `---------------------------------------\n` +
    `👤 *Customer Name:* ${order.customer.name}\n` +
    `📍 *Delivery Address:* ${order.customer.address}\n` +
    `📞 *Phone Number:* ${order.customer.phone}\n` +
    (order.customer.altPhone ? `📱 *Alternative Phone:* ${order.customer.altPhone}\n` : '') +
    `---------------------------------------\n` +
    `📋 *ITEMIZED ORDER RECEIPT:*\n${orderItemsText}` +
    `---------------------------------------\n` +
    `📦 *Total Items:* ${order.pricing.totalItems} items\n` +
    `💵 *Subtotal:* ${formatCurrency(order.pricing.subtotal)}\n` +
    `🛵 *Delivery Fee:* ${order.pricing.deliveryFee === 0 ? 'FREE' : formatCurrency(order.pricing.deliveryFee)}\n` +
    `💰 *FINAL TOTAL:* *${formatCurrency(order.pricing.finalTotal)}*\n` +
    `---------------------------------------\n` +
    `⚡ *Est. Delivery:* 30 - 45 Minutes\n` +
    `📞 *Direct Helpline:* ${OFFICIAL_PHONE}`;

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}

// Legacy alias compatibility
const confirmFinalWhatsAppOrder = handlePlaceOrderSubmit;
const placeOrder = handlePlaceOrderSubmit;

// ----------------------------------------------------------
// 6. Utility Functions
// ----------------------------------------------------------
function showCartToast(message) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.remove('translate-y-24', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');

  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-24', 'opacity-0');
  }, 2200);
}

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
