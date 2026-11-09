// ==========================================================
// Mr. Cook - Restaurant Kitchen & Order Fulfillment Dashboard
// Location: Pakistan | Helpline: 03144108033
// ==========================================================

const OFFICIAL_PHONE = "03144108033";
const WHATSAPP_NUMBER = "923144108033";

let orders = [];
let searchQuery = "";
let dashboardClockInterval = null;
let countdownInterval = null;

document.addEventListener('DOMContentLoaded', () => {
  // Authentication Guard for Staff / Restaurant Panel
  const sessionStr = sessionStorage.getItem('mr_cook_auth_session');
  let session = null;
  try { session = sessionStr ? JSON.parse(sessionStr) : null; } catch(e){}
  if (!session || (session.role !== 'staff' && session.role !== 'admin')) {
    if (typeof openLoginModal === 'function') {
      openLoginModal('staff');
    }
  }

  initLiveClock();
  loadOrdersFromStorage();
  initFirebaseLiveOrders();
  renderDashboard();
  startGlobalCountdowns();
});

// ----------------------------------------------------------
// 1. Storage & Data Initialization
// ----------------------------------------------------------
function initFirebaseLiveOrders() {
  function startSync() {
    if (window.MrCookFirebase && typeof window.MrCookFirebase.listenToOrders === 'function') {
      window.MrCookFirebase.listenToOrders((cloudOrders) => {
        if (Array.isArray(cloudOrders) && cloudOrders.length > 0) {
          const merged = [...cloudOrders];
          const cloudIds = new Set(cloudOrders.map(o => o.orderId));
          orders.forEach(localOrder => {
            if (!cloudIds.has(localOrder.orderId)) {
              merged.push(localOrder);
            }
          });
          merged.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          orders = merged;
          saveOrdersToStorage();
          renderDashboard();
        }
      });
    }
  }

  if (window.MrCookFirebase) {
    startSync();
  } else {
    window.addEventListener('mrcook:firebase-ready', startSync, { once: true });
  }
}
function loadOrdersFromStorage() {
  try {
    const stored = localStorage.getItem('mr_cook_all_orders');
    if (stored) {
      orders = JSON.parse(stored);
    } else {
      orders = [];
    }
  } catch (e) {
    orders = [];
  }

  if (!Array.isArray(orders)) {
    orders = [];
  }
}

function saveOrdersToStorage() {
  try {
    localStorage.setItem('mr_cook_all_orders', JSON.stringify(orders));
  } catch (e) {
    console.error("Storage error:", e);
  }
}

function generateInitialSampleOrders() {
  return [];
}
  const now = Date.now();
  return [
    {
      orderId: "MC-782194",
      createdAt: now - (4 * 60 * 1000), // 4 mins ago
      estimatedDeliveryTime: now + (31 * 60 * 1000),
      status: "pending",
      customer: {
        name: "Muhammad Ali",
        address: "House 24, Street 7, Sector Westridge III, Rawalpindi",
        phone: "03144108033",
        altPhone: "03009876543"
      },
      items: [
        {
          name: "Zinger Burger with Wings & Cheese",
          quantity: 2,
          price: 416.50,
          optionsText: "Extra Spicy Mayo • Crispy Fries"
        },
        {
          name: "Chicken Tikka Pizza",
          quantity: 1,
          price: 850.00,
          optionsText: "Medium • Deep Pan Crust • Extra Cheese"
        }
      ],
      pricing: {
        totalItems: 3,
        subtotal: 1683.00,
        deliveryFee: 0,
        finalTotal: 1683.00
      }
    },
    {
      orderId: "MC-619284",
      createdAt: now - (14 * 60 * 1000), // 14 mins ago
      estimatedDeliveryTime: now + (21 * 60 * 1000),
      status: "preparing",
      customer: {
        name: "Ayesha Bibi",
        address: "Flat 4B, Executive Heights, Peshawar Road, Rawalpindi",
        phone: "03335551234",
        altPhone: ""
      },
      items: [
        {
          name: "Alfredo Pasta",
          quantity: 2,
          price: 680.00,
          optionsText: "Creamy White Sauce • Extra Garlic Bread"
        },
        {
          name: "Chicken Steak Tarragon",
          quantity: 1,
          price: 1020.00,
          optionsText: "Tarragon Mushroom Sauce • Sautéed Veggies"
        }
      ],
      pricing: {
        totalItems: 3,
        subtotal: 2380.00,
        deliveryFee: 0,
        finalTotal: 2380.00
      }
    },
    {
      orderId: "MC-510482",
      createdAt: now - (24 * 60 * 1000), // 24 mins ago
      estimatedDeliveryTime: now + (11 * 60 * 1000),
      status: "on_the_way",
      rider: {
        name: "Tariq Mehmood",
        phone: "03144108033"
      },
      customer: {
        name: "Zainab Malik",
        address: "House 102, Lane 3, Chaklala Scheme III, Rawalpindi",
        phone: "03125554321",
        altPhone: "03451112233"
      },
      items: [
        {
          name: "Chicken Tikka Paratha Roll",
          quantity: 3,
          price: 272.00,
          optionsText: "Special Garlic Mayo • Chatni on side"
        },
        {
          name: "Deal 4 (3 Zinger Burgers & 1 Ltr Drink)",
          quantity: 1,
          price: 1105.00,
          optionsText: "Chilled Drink • Hot Crispy Fries"
        }
      ],
      pricing: {
        totalItems: 4,
        subtotal: 1921.00,
        deliveryFee: 0,
        finalTotal: 1921.00
      }
    },
    {
      orderId: "MC-401928",
      createdAt: now - (48 * 60 * 1000), // 48 mins ago
      estimatedDeliveryTime: now - (13 * 60 * 1000),
      status: "delivered",
      customer: {
        name: "Usman Tariq",
        address: "Plot 19, Saddar Bazaar, Rawalpindi",
        phone: "03214449876",
        altPhone: ""
      },
      items: [
        {
          name: "Double Decker Zinger Burger with Wings",
          quantity: 2,
          price: 654.50,
          optionsText: "Double Crisp Patty • Dip Sauces"
        }
      ],
      pricing: {
        totalItems: 2,
        subtotal: 1309.00,
        deliveryFee: 150.00,
        finalTotal: 1459.00
      }
    }
  ];
}

// ----------------------------------------------------------
// 2. Real-Time Clock & Countdown Timers
// ----------------------------------------------------------
function initLiveClock() {
  const clockEl = document.getElementById('dashboard-clock');
  function updateClock() {
    if (clockEl) {
      const now = new Date();
      clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
  }
  updateClock();
  dashboardClockInterval = setInterval(updateClock, 1000);
}

function startGlobalCountdowns() {
  if (countdownInterval) clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {
    // Update live countdown badges across all order cards
    document.querySelectorAll('[data-order-target-time]').forEach(el => {
      const targetTime = parseInt(el.getAttribute('data-order-target-time'), 10);
      const status = el.getAttribute('data-order-status');

      if (status === 'delivered') {
        el.textContent = "✓ Delivered";
        el.className = "text-[11px] font-mono font-bold text-emerald-400";
        return;
      }

      const diffMs = targetTime - Date.now();
      const diffSec = Math.floor(diffMs / 1000);

      if (diffSec <= 0) {
        el.textContent = "⚠️ Overdue / Arriving";
        el.className = "text-[11px] font-mono font-bold text-red-400 animate-pulse";
      } else {
        const mins = Math.floor(diffSec / 60);
        const secs = diffSec % 60;
        el.textContent = `⏳ ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} remaining`;
        
        if (mins < 8) {
          el.className = "text-[11px] font-mono font-bold text-amber-400 animate-pulse";
        } else {
          el.className = "text-[11px] font-mono font-bold text-neutral-300";
        }
      }
    });
  }, 1000);
}

// ----------------------------------------------------------
// 3. Render Dashboard Board & Columns
// ----------------------------------------------------------
function renderDashboard() {
  // Filter orders by search query if applicable
  const filtered = orders.filter(o => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const id = (o.orderId || '').toLowerCase();
    const name = (o.customer?.name || '').toLowerCase();
    const phone = (o.customer?.phone || '').toLowerCase();
    const address = (o.customer?.address || '').toLowerCase();
    return id.includes(q) || name.includes(q) || phone.includes(q) || address.includes(q);
  });

  const pending = filtered.filter(o => o.status === 'pending' || o.status === 'placed' || o.status === 'confirmed');
  const preparing = filtered.filter(o => o.status === 'preparing');
  const onTheWay = filtered.filter(o => o.status === 'on_the_way' || o.status === 'on the way');
  const delivered = filtered.filter(o => o.status === 'delivered');

  // Update Counters
  updateStat('stat-total', orders.length);
  updateStat('stat-pending', orders.filter(o => o.status === 'pending' || o.status === 'placed' || o.status === 'confirmed').length);
  updateStat('stat-preparing', orders.filter(o => o.status === 'preparing').length);
  updateStat('stat-ontheway', orders.filter(o => o.status === 'on_the_way' || o.status === 'on the way').length);
  updateStat('stat-delivered', orders.filter(o => o.status === 'delivered').length);

  const totalRev = orders.reduce((sum, o) => sum + (o.pricing?.finalTotal || 0), 0);
  updateStat('stat-revenue', formatCurrency(totalRev));

  // Update Badge Counts
  updateStat('badge-count-pending', pending.length);
  updateStat('badge-count-preparing', preparing.length);
  updateStat('badge-count-ontheway', onTheWay.length);
  updateStat('badge-count-delivered', delivered.length);

  // Render Column HTML
  renderOrderColumn('col-pending-orders', pending, 'pending');
  renderOrderColumn('col-preparing-orders', preparing, 'preparing');
  renderOrderColumn('col-ontheway-orders', onTheWay, 'on_the_way');
  renderOrderColumn('col-delivered-orders', delivered, 'delivered');
}

function updateStat(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function renderOrderColumn(containerId, columnOrders, columnType) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (columnOrders.length === 0) {
    container.innerHTML = `
      <div class="py-12 text-center text-neutral-500 text-xs border border-dashed border-white/10 rounded-2xl p-4">
        <span class="text-2xl block mb-1">📭</span>
        <span>No orders in this stage</span>
      </div>
    `;
    return;
  }

  let html = '';
  columnOrders.forEach(order => {
    html += buildOrderCardHTML(order, columnType);
  });
  container.innerHTML = html;
}

// ----------------------------------------------------------
// 4. Build Detailed Order Card HTML
// ----------------------------------------------------------
function buildOrderCardHTML(order, columnType) {
  const placedTime = new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const elapsedMins = Math.max(0, Math.floor((Date.now() - order.createdAt) / 60000));

  // Determine countdown time string
  const diffSec = Math.floor((order.estimatedDeliveryTime - Date.now()) / 1000);
  let countdownText = "";
  if (order.status === 'delivered') {
    countdownText = "✓ Delivered";
  } else if (diffSec <= 0) {
    countdownText = "⚠️ Overdue";
  } else {
    const mins = Math.floor(diffSec / 60);
    const secs = diffSec % 60;
    countdownText = `⏳ ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} remaining`;
  }

  // Itemized List HTML
  let itemsHTML = '';
  if (order.items && Array.isArray(order.items)) {
    order.items.forEach(item => {
      const lineCost = (item.price || 0) * (item.quantity || 1);
      itemsHTML += `
        <div class="flex items-start justify-between py-1 border-b border-white/5 last:border-b-0 text-[11px]">
          <div class="pr-2 min-w-0">
            <span class="font-bold text-white block">
              <span class="text-amber-400 font-black">×${item.quantity}</span> ${escapeHTML(item.name)}
            </span>
            ${item.optionsText ? `<span class="text-[10px] text-neutral-400 block truncate">${escapeHTML(item.optionsText)}</span>` : ''}
          </div>
          <span class="font-mono font-bold text-neutral-200 shrink-0">
            ${formatCurrency(lineCost)}
          </span>
        </div>
      `;
    });
  }

  // Action Buttons according to pipeline stage
  let actionButtonsHTML = '';
  if (columnType === 'pending') {
    actionButtonsHTML = `
      <div class="space-y-1.5 pt-2">
        <button 
          onclick="advanceOrderStatus('${order.orderId}', 'preparing')" 
          class="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-heading font-black text-xs tracking-wide shadow-glow-amber transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
        >
          <span>Accept & Start Cooking</span>
          <span>👨‍🍳</span>
        </button>
        <div class="grid grid-cols-2 gap-1.5">
          <button 
            onclick="openKotModal('${order.orderId}')" 
            class="py-1.5 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-[10px] transition-colors"
          >
            🖨️ Print KOT
          </button>
          <a 
            href="https://wa.me/92${formatPhoneForWhatsApp(order.customer?.phone)}?text=${encodeURIComponent(`Assalam o Alaikum ${order.customer?.name || 'Customer'}, Mr. Cook has received your order #${order.orderId} and our kitchen is preparing it fresh! 🍔`)}" 
            target="_blank" 
            class="py-1.5 px-2 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 font-bold text-[10px] text-center transition-colors"
          >
            💬 WhatsApp
          </a>
        </div>
      </div>
    `;
  } else if (columnType === 'preparing') {
    actionButtonsHTML = `
      <div class="space-y-1.5 pt-2">
        <button 
          onclick="openRiderAssignmentModal('${order.orderId}')" 
          class="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-400 hover:to-blue-400 text-white font-heading font-black text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
        >
          <span>Assign Rider & Dispatch</span>
          <span>🛵</span>
        </button>
        <div class="flex items-center justify-between">
          <button 
            onclick="advanceOrderStatus('${order.orderId}', 'pending')" 
            class="text-[10px] text-neutral-500 hover:text-neutral-300 underline"
          >
            ← Move back to Pending
          </button>
          <button 
            onclick="openKotModal('${order.orderId}')" 
            class="text-[10px] text-neutral-400 hover:text-white"
          >
            🖨️ KOT
          </button>
        </div>
      </div>
    `;
  } else if (columnType === 'on_the_way') {
    actionButtonsHTML = `
      <div class="space-y-1.5 pt-2">
        <button 
          onclick="advanceOrderStatus('${order.orderId}', 'delivered')" 
          class="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-400 hover:to-emerald-400 text-black font-heading font-black text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
        >
          <span>Mark as Delivered</span>
          <span>✓</span>
        </button>
        <div class="flex items-center justify-between">
          <button 
            onclick="advanceOrderStatus('${order.orderId}', 'preparing')" 
            class="text-[10px] text-neutral-500 hover:text-neutral-300 underline"
          >
            ← Back to Kitchen
          </button>
          <a 
            href="tel:${order.customer?.phone || '03144108033'}" 
            class="text-[10px] text-amber-400 hover:underline"
          >
            📞 Call Customer
          </a>
        </div>
      </div>
    `;
  } else if (columnType === 'delivered') {
    actionButtonsHTML = `
      <div class="pt-2 flex items-center justify-between text-xs">
        <span class="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
          <span>✓</span> Fulfilled
        </span>
        <button 
          onclick="advanceOrderStatus('${order.orderId}', 'on_the_way')" 
          class="text-[10px] text-neutral-500 hover:text-neutral-300 underline"
        >
          Reopen Order
        </button>
      </div>
    `;
  }

  return `
    <article class="order-card glass-card bg-[#202020] hover:bg-[#252525] border border-white/5 hover:border-amber-500/40 rounded-2xl p-3.5 space-y-3 transition-all duration-200 shadow-sm relative group">
      
      <!-- Card Top: Order ID & Timer -->
      <div class="flex items-start justify-between gap-2 pb-2.5 border-b border-white/5">
        <div>
          <span class="font-mono font-black text-sm text-white block">#${escapeHTML(order.orderId)}</span>
          <span class="text-[10px] text-neutral-400 block">${placedTime} (${elapsedMins}m ago)</span>
        </div>
        <div class="text-right">
          <!-- Live Countdown Hook -->
          <span 
            data-order-target-time="${order.estimatedDeliveryTime}" 
            data-order-status="${order.status}"
            class="text-[11px] font-mono font-bold text-neutral-300 block"
          >
            ${countdownText}
          </span>
          <span class="text-[9px] uppercase font-bold tracking-wider text-amber-500/80">Est. 35m</span>
        </div>
      </div>

      <!-- Customer Details Section -->
      <div class="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5 text-xs">
        <div class="flex items-center justify-between">
          <span class="font-bold text-white truncate">${escapeHTML(order.customer?.name || 'Walk-in / Customer')}</span>
          <a href="tel:${escapeHTML(order.customer?.phone || OFFICIAL_PHONE)}" class="text-amber-400 font-mono font-bold hover:underline flex items-center gap-1">
            <span>📞</span> <span>${escapeHTML(order.customer?.phone || OFFICIAL_PHONE)}</span>
          </a>
        </div>
        
        <div class="text-[11px] text-neutral-300 leading-tight flex items-start gap-1">
          <span class="text-amber-500 shrink-0">📍</span>
          <span class="break-words">${escapeHTML(order.customer?.address || 'Pakistan')}</span>
        </div>

        ${order.customer?.altPhone ? `
          <div class="text-[10px] text-neutral-400 flex items-center justify-between pt-1 border-t border-white/5">
            <span>Alt Phone:</span>
            <span class="font-mono text-neutral-300">${escapeHTML(order.customer.altPhone)}</span>
          </div>
        ` : ''}
      </div>

      <!-- Prominently Display Assigned Delivery Rider Info (Name & Phone) for Direct Communication -->
      ${order.rider ? `
        <div class="p-2.5 rounded-xl bg-gradient-to-r from-blue-950/60 via-[#162035] to-[#1c1c1c] border border-blue-500/50 space-y-1.5 text-xs">
          <div class="flex items-center justify-between">
            <span class="text-[10px] uppercase font-bold tracking-wider text-blue-400 flex items-center gap-1.5">
              <span>🛵</span> Assigned Delivery Rider
            </span>
            <span class="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[9px] font-bold border border-blue-500/30">Dispatched</span>
          </div>
          <div class="flex items-center justify-between pt-1">
            <div>
              <span class="text-neutral-400 block text-[9px] uppercase font-bold">Rider Name:</span>
              <span class="font-heading font-black text-white text-sm block">${escapeHTML(order.rider.name)}</span>
            </div>
            <div class="text-right">
              <span class="text-neutral-400 block text-[9px] uppercase font-bold">Direct Phone:</span>
              <a href="tel:${escapeHTML(order.rider.phone)}" class="px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 border border-blue-500/40 font-mono font-bold text-xs inline-flex items-center gap-1.5 transition-colors" title="Call Assigned Rider">
                <span>📞</span> <span>${escapeHTML(order.rider.phone)}</span>
              </a>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Itemized Receipt Section -->
      <div class="space-y-1">
        <div class="flex items-center justify-between text-[10px] font-heading font-bold text-neutral-400 uppercase tracking-wider">
          <span>Itemized Receipt (${order.pricing?.totalItems || order.items?.length || 0})</span>
          <span>Price</span>
        </div>
        <div class="max-h-36 overflow-y-auto no-scrollbar pr-0.5 space-y-0.5">
          ${itemsHTML}
        </div>
      </div>

      <!-- Total Cost Summary -->
      <div class="pt-2 border-t border-white/10 flex items-baseline justify-between text-xs">
        <div>
          <span class="text-neutral-400 text-[10px]">Delivery: ${order.pricing?.deliveryFee === 0 ? '<strong class="text-emerald-400">FREE</strong>' : formatCurrency(order.pricing?.deliveryFee || 0)}</span>
        </div>
        <div class="text-right">
          <span class="text-[10px] text-neutral-400 mr-1">Final Total:</span>
          <span class="font-heading font-black text-amber-400 text-sm">
            ${formatCurrency(order.pricing?.finalTotal || 0)}
          </span>
        </div>
      </div>

      <!-- Interactive Controls -->
      ${actionButtonsHTML}

    </article>
  `;
}

// ----------------------------------------------------------
// 5. Interactive Pipeline Controls
// ----------------------------------------------------------
function advanceOrderStatus(orderId, newStatus) {
  const index = orders.findIndex(o => o.orderId === orderId);
  if (index === -1) return;

  orders[index].status = newStatus;

  // If advancing to on_the_way, assign delivery rider details
  if (newStatus === 'on_the_way') {
    orders[index].rider = {
      name: "Tariq Mehmood",
      phone: "03144108033",
      vehicle: "Honda 125 (ICT-784) • Heated Bag",
      badge: "Mr. Cook Express Rider",
      assignedAt: Date.now()
    };
  }

  saveOrdersToStorage();

  // Sync status update to Firebase Cloud Firestore
  if (window.MrCookFirebase && typeof window.MrCookFirebase.updateOrderStatus === 'function') {
    const payload = { status: newStatus };
    if (orders[index].rider) {
      payload.rider = orders[index].rider;
    }
    window.MrCookFirebase.updateOrderStatus(orderId, payload);
  }

  // If customer has an active order matching this ID, update it too
  try {
    const active = localStorage.getItem('mr_cook_active_order');
    if (active) {
      const activeObj = JSON.parse(active);
      if (activeObj.orderId === orderId) {
        activeObj.status = newStatus;
        if (orders[index].rider) {
          activeObj.rider = orders[index].rider;
        }
        localStorage.setItem('mr_cook_active_order', JSON.stringify(activeObj));
      }
    }
  } catch (e) {}

  renderDashboard();

  let statusLabel = "";
  if (newStatus === 'preparing') statusLabel = "Kitchen Prep 👨‍🍳";
  else if (newStatus === 'on_the_way') statusLabel = "On the Way (Rider: Tariq Mehmood) 🛵";
  else if (newStatus === 'delivered') statusLabel = "Delivered Today ✓";
  else statusLabel = "Status Updated";

  showDashToast(`Order #${orderId} moved to: ${statusLabel}`);
}

// ----------------------------------------------------------
// 6. Rider Assignment Modal Workflow & Dynamic Quick-Presets
// ----------------------------------------------------------
function openRiderAssignmentModal(orderId) {
  const order = orders.find(o => o.orderId === orderId);
  if (!order) return;

  const modal = document.getElementById('rider-assignment-modal');
  const orderIdEl = document.getElementById('modal-rider-order-id');
  const targetIdInput = document.getElementById('modal-rider-target-order-id');
  const custNameEl = document.getElementById('modal-rider-cust-name');
  const custAddressEl = document.getElementById('modal-rider-cust-address');
  const nameInput = document.getElementById('rider-name-input');
  const phoneInput = document.getElementById('rider-phone-input');

  if (!modal) return;

  if (orderIdEl) orderIdEl.textContent = `#${order.orderId}`;
  if (targetIdInput) targetIdInput.value = order.orderId;
  if (custNameEl) custNameEl.textContent = order.customer?.name || 'Customer';
  if (custAddressEl) custAddressEl.textContent = order.customer?.address || 'Rawalpindi';

  // Manual Rider Assignment: Always provide empty, manual text input fields
  if (nameInput) {
    nameInput.value = '';
  }
  if (phoneInput) {
    phoneInput.value = '';
  }

  // Render dynamic quick-presets saved from previous assignments
  renderDynamicRiderPresets();

  modal.classList.remove('hidden');
  modal.classList.add('flex', 'modal-overlay-enter');
  const dialog = modal.querySelector('div');
  if (dialog) {
    dialog.classList.remove('modal-dialog-enter');
    void dialog.offsetWidth;
    dialog.classList.add('modal-dialog-enter');
  }
  document.body.style.overflow = 'hidden';

  setTimeout(() => {
    if (nameInput) nameInput.focus();
  }, 100);
}

function closeRiderAssignmentModal() {
  const modal = document.getElementById('rider-assignment-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex', 'modal-overlay-enter');
    const dialog = modal.querySelector('div');
    if (dialog) dialog.classList.remove('modal-dialog-enter');
    document.body.style.overflow = '';
  }
}

function renderDynamicRiderPresets() {
  const listContainer = document.getElementById('dynamic-presets-list');
  const countBadge = document.getElementById('dynamic-presets-count');
  if (!listContainer) return;

  let presets = [];
  try {
    const stored = localStorage.getItem('mr_cook_rider_presets');
    presets = stored ? JSON.parse(stored) : [];
  } catch (e) {
    presets = [];
  }

  if (countBadge) {
    countBadge.textContent = `${presets.length} saved`;
  }

  if (presets.length === 0) {
    listContainer.innerHTML = `
      <span class="text-[11px] text-neutral-500 italic">
        No saved riders yet. Enter rider name & phone below to save for 1-click selection next time.
      </span>
    `;
    return;
  }

  let html = '';
  presets.forEach((preset) => {
    html += `
      <button 
        type="button" 
        onclick="selectDynamicRiderPreset('${escapeJS(preset.name)}', '${escapeJS(preset.phone)}')" 
        class="px-2.5 py-1 rounded-xl bg-[#1e1e1e] hover:bg-blue-600/30 text-neutral-200 hover:text-blue-300 border border-white/10 hover:border-blue-500/40 text-xs transition-all flex items-center gap-1.5 active:scale-95 group"
        title="Click to auto-fill ${escapeHTML(preset.name)} (${escapeHTML(preset.phone)})"
      >
        <span>🛵</span>
        <span class="font-bold">${escapeHTML(preset.name)}</span>
        <span class="text-[10px] text-neutral-400 font-mono">(${escapeHTML(preset.phone)})</span>
      </button>
    `;
  });
  listContainer.innerHTML = html;
}

function selectDynamicRiderPreset(name, phone) {
  const nameInput = document.getElementById('rider-name-input');
  const phoneInput = document.getElementById('rider-phone-input');
  if (nameInput) nameInput.value = name;
  if (phoneInput) phoneInput.value = phone;
  if (nameInput) nameInput.focus();
}

function handleConfirmRiderAssignment(event) {
  if (event) event.preventDefault();

  const targetIdInput = document.getElementById('modal-rider-target-order-id');
  const nameInput = document.getElementById('rider-name-input');
  const phoneInput = document.getElementById('rider-phone-input');

  const orderId = targetIdInput ? targetIdInput.value : '';
  const riderName = nameInput ? nameInput.value.trim() : '';
  const riderPhone = phoneInput ? phoneInput.value.trim() : '';

  if (!riderName || !riderPhone) {
    alert("Please fill in both Rider Name and Rider Phone Number.");
    return;
  }

  const index = orders.findIndex(o => o.orderId === orderId);
  if (index === -1) return;

  // 1. Dynamic Quick-Presets: Save to localStorage for future use
  let presets = [];
  try {
    const stored = localStorage.getItem('mr_cook_rider_presets');
    presets = stored ? JSON.parse(stored) : [];
  } catch (e) {
    presets = [];
  }

  const existingIdx = presets.findIndex(p => 
    p.phone === riderPhone || p.name.toLowerCase() === riderName.toLowerCase()
  );

  if (existingIdx !== -1) {
    presets[existingIdx] = { name: riderName, phone: riderPhone };
  } else {
    presets.unshift({ name: riderName, phone: riderPhone });
  }

  if (presets.length > 15) presets = presets.slice(0, 15);
  try {
    localStorage.setItem('mr_cook_rider_presets', JSON.stringify(presets));
  } catch (e) {}

  // 2. Assign rider and shift order to 'on_the_way'
  orders[index].status = 'on_the_way';
  orders[index].rider = {
    name: riderName,
    phone: riderPhone,
    assignedAt: Date.now()
  };

  saveOrdersToStorage();

  // Sync status update to Firebase Cloud Firestore
  if (window.MrCookFirebase && typeof window.MrCookFirebase.updateOrderStatus === 'function') {
    const payload = { status: newStatus };
    if (orders[index].rider) {
      payload.rider = orders[index].rider;
    }
    window.MrCookFirebase.updateOrderStatus(orderId, payload);
  }

  // If customer has an active order matching this ID, update it too
  try {
    const active = localStorage.getItem('mr_cook_active_order');
    if (active) {
      const activeObj = JSON.parse(active);
      if (activeObj.orderId === orderId) {
        activeObj.status = 'on_the_way';
        activeObj.rider = orders[index].rider;
        localStorage.setItem('mr_cook_active_order', JSON.stringify(activeObj));
      }
    }
  } catch (e) {}

  closeRiderAssignmentModal();
  renderDashboard();

  showDashToast(`Order #${orderId} shifted to On the Way! Assigned Rider: ${riderName} 🛵`);
}

// ----------------------------------------------------------
// 7. Simulate New Customer Order (Instant Testing)
// ----------------------------------------------------------
function simulateCustomerOrder() {
  const sampleNames = ["Hamza Khan", "Bilal Ahmed", "Sarmad Butt", "Faizan Shah", "Hassan Raza", "Rabia Noor", "Farhan Saeed"];
  const sampleAddresses = [
    "House 15, Street 4, Sector Westridge III, Rawalpindi",
    "Villa 22, Sector B, Bahria Town Phase 7, Rawalpindi",
    "Apartment 302, Royal Avenue, Saddar, Rawalpindi",
    "House 88, Lane 2, Askari 14, Rawalpindi",
    "Main Peshawar Road near Kohinoor Mills, Rawalpindi"
  ];
  const sampleFoodItems = [
    { name: "Zinger Burger with Wings", price: 365.50, options: "Extra Sauce • Spicy" },
    { name: "Double Decker Zinger Burger", price: 552.50, options: "Cheesy • Crispy Bun" },
    { name: "Chicken Tikka Pizza", price: 510.00, options: "Small • Hand Tossed" },
    { name: "Chicken Fajita Pizza", price: 850.00, options: "Medium • Extra Topping" },
    { name: "Alfredo Pasta", price: 680.00, options: "Rich Cream Sauce" },
    { name: "Chicken Tikka Paratha Roll", price: 272.00, options: "Spicy Garlic Roll" }
  ];

  const now = Date.now();
  const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
  const randomAddress = sampleAddresses[Math.floor(Math.random() * sampleAddresses.length)];
  const randomPhone = `0314${Math.floor(1000000 + Math.random() * 9000000)}`;

  // Pick 2 random items
  const item1 = sampleFoodItems[Math.floor(Math.random() * sampleFoodItems.length)];
  const item2 = sampleFoodItems[Math.floor(Math.random() * sampleFoodItems.length)];
  
  const selectedItems = [
    { name: item1.name, price: item1.price, quantity: 1, optionsText: item1.options },
    { name: item2.name, price: item2.price, quantity: Math.random() > 0.5 ? 2 : 1, optionsText: item2.options }
  ];

  const subtotal = selectedItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const deliveryFee = subtotal >= 1500 ? 0 : 150;
  const finalTotal = subtotal + deliveryFee;
  const orderId = `MC-${Math.floor(100000 + Math.random() * 900000)}`;

  const newOrder = {
    orderId: orderId,
    createdAt: now,
    estimatedDeliveryTime: now + (35 * 60 * 1000),
    status: 'pending',
    customer: {
      name: randomName,
      address: randomAddress,
      phone: randomPhone,
      altPhone: Math.random() > 0.5 ? '03001234567' : ''
    },
    items: selectedItems,
    pricing: {
      totalItems: selectedItems.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      finalTotal: finalTotal
    }
  };

  orders.unshift(newOrder);
  saveOrdersToStorage();
  renderDashboard();

  showDashToast(`⚡ New simulated order #${orderId} arrived!`);
}

function resetSampleOrders() {
  orders = [];
  try {
    localStorage.removeItem('mr_cook_all_orders');
    localStorage.removeItem('mr_cook_active_order');
  } catch (e) {}
  saveOrdersToStorage();
  renderDashboard();
  showDashToast("All orders reset to zero!");
}

// ----------------------------------------------------------
// 7. Kitchen Order Ticket (KOT) Modal
// ----------------------------------------------------------
function openKotModal(orderId) {
  const order = orders.find(o => o.orderId === orderId);
  if (!order) return;

  const modal = document.getElementById('kot-modal');
  const content = document.getElementById('kot-ticket-content');
  if (!modal || !content) return;

  let itemsHTML = '';
  order.items.forEach(item => {
    itemsHTML += `
      <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
        <span><strong>${item.quantity}x</strong> ${item.name}</span>
        <span>${formatCurrency(item.price * item.quantity)}</span>
      </div>
      ${item.optionsText ? `<div style="font-size:10px; color:#555; padding-left:15px; margin-bottom:4px;">* ${item.optionsText}</div>` : ''}
    `;
  });

  content.innerHTML = `
    <div style="text-align:center; border-bottom:1px dashed #000; padding-bottom:8px;">
      <h3 style="font-size:16px; font-weight:900; margin:0;">MR. COOK</h3>
      <p style="font-size:10px; margin:2px 0;">KITCHEN ORDER TICKET (KOT)</p>
      <p style="font-size:11px; font-weight:bold; margin:0;">ORDER #${order.orderId}</p>
      <p style="font-size:10px; margin:0;">${new Date(order.createdAt).toLocaleString()}</p>
    </div>
    
    <div style="padding:8px 0; border-bottom:1px dashed #000;">
      <p style="margin:2px 0;"><strong>Customer:</strong> ${order.customer?.name || 'Walk-in'}</p>
      <p style="margin:2px 0;"><strong>Phone:</strong> ${order.customer?.phone || OFFICIAL_PHONE}</p>
      <p style="margin:2px 0;"><strong>Address:</strong> ${order.customer?.address || 'Rawalpindi'}</p>
      ${order.customer?.altPhone ? `<p style="margin:2px 0;"><strong>Alt Phone:</strong> ${order.customer.altPhone}</p>` : ''}
    </div>

    <div style="padding:8px 0; border-bottom:1px dashed #000;">
      <div style="font-weight:bold; margin-bottom:6px;">ORDER ITEMS:</div>
      ${itemsHTML}
    </div>

    <div style="padding-top:6px; text-align:right;">
      <p style="margin:2px 0;">Subtotal: ${formatCurrency(order.pricing?.subtotal || 0)}</p>
      <p style="margin:2px 0;">Delivery: ${order.pricing?.deliveryFee === 0 ? 'FREE' : formatCurrency(order.pricing?.deliveryFee || 0)}</p>
      <p style="font-size:14px; font-weight:900; margin:4px 0;">TOTAL: ${formatCurrency(order.pricing?.finalTotal || 0)}</p>
    </div>

    <div style="text-align:center; font-size:10px; margin-top:8px; border-top:1px dashed #000; padding-top:6px;">
      Fresh Kitchen Preparation • Rawalpindi
    </div>
  `;

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeKotModal() {
  const modal = document.getElementById('kot-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// ----------------------------------------------------------
// 8. Search & Toast Utilities
// ----------------------------------------------------------
function handleSearchOrders(val) {
  searchQuery = val.trim();
  renderDashboard();
}

function showDashToast(msg) {
  const toast = document.getElementById('dash-toast');
  const msgEl = document.getElementById('dash-toast-msg');
  if (!toast || !msgEl) return;

  msgEl.textContent = msg;
  toast.classList.remove('translate-y-24', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');

  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-24', 'opacity-0');
  }, 2200);
}

function formatCurrency(num) {
  if (isNaN(num)) return 'Rs. 0';
  const hasDecimals = num % 1 !== 0;
  return 'Rs. ' + Number(num).toLocaleString('en-US', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2
  });
}

function formatPhoneForWhatsApp(phone) {
  if (!phone) return "3144108033";
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) clean = clean.substring(1);
  if (clean.startsWith('92')) clean = clean.substring(2);
  return clean || "3144108033";
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
