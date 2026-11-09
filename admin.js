// ==========================================================
// Mr. Cook - Enterprise Admin Dashboard Controller
// 1. Sales & Analytics Dashboard (Metrics & Interactive SVG Graphs)
// 2. Menu Catalog CRUD Manager
// 3. Store Customization & Dynamic Branding
// 4. Staff Directory & Permissions Management
// 5. System Settings & JSON Backup
// ==========================================================

let activeTab = 'dashboard';
let currentBrandSettings = {};
let currentCatalog = [];
let currentStaff = [];
let analyticsTimeframe = 'weekly'; // 'weekly' or 'monthly'
let selectedCategoryFilter = 'all';
let searchQuery = '';
let staffSearchQuery = '';
let selectedStaffRoleFilter = 'all';

// Helper for currency formatting
function formatCurrency(num) {
  if (isNaN(num)) return 'Rs. 0';
  const hasDecimals = num % 1 !== 0;
  return 'Rs. ' + Number(num).toLocaleString('en-US', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2
  });
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Default Seeded Staff Members (Strictly Zero / Empty Slate)
const DEFAULT_STAFF_MEMBERS = [];

// ----------------------------------------------------------
// 1. Initialization
// ----------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Authentication Guard for Admin Panel
  const sessionStr = sessionStorage.getItem('mr_cook_auth_session');
  let session = null;
  try { session = sessionStr ? JSON.parse(sessionStr) : null; } catch(e){}
  if (!session || session.role !== 'admin') {
    if (typeof openLoginModal === 'function') {
      openLoginModal('admin');
    }
  }

  loadBrandSettingsIntoForm();
  loadCatalogData();
  loadStaffData();
  renderSalesAnalyticsDashboard();
  setupColorListeners();
  setupLogoUploadListeners();

  // Listen for storage events from other tabs
  window.addEventListener('storage', (e) => {
    if (e.key === 'mr_cook_all_orders' || e.key === 'mr_cook_active_order') {
      if (activeTab === 'dashboard') {
        renderSalesAnalyticsDashboard();
      }
    }
  });
});

// ----------------------------------------------------------
// 2. Navigation Tab Switching (5 Dedicated Modules)
// ----------------------------------------------------------
function switchAdminTab(tabName) {
  activeTab = tabName;

  const tabs = ['dashboard', 'catalog', 'branding', 'staff', 'settings'];

  tabs.forEach(t => {
    const contentEl = document.getElementById(`tab-content-${t}`);
    const btnEl = document.getElementById(`tab-btn-${t}`);
    if (contentEl) {
      if (t === tabName) {
        contentEl.classList.remove('hidden');
      } else {
        contentEl.classList.add('hidden');
      }
    }
    if (btnEl) {
      if (t === tabName) {
        btnEl.className = "admin-tab-btn px-4 py-2 rounded-xl text-xs sm:text-sm font-heading font-bold transition-all flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 shadow-sm";
      } else {
        btnEl.className = "admin-tab-btn px-4 py-2 rounded-xl text-xs sm:text-sm font-heading font-bold transition-all flex items-center gap-2 text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent";
      }
    }
  });

  if (tabName === 'dashboard') {
    renderSalesAnalyticsDashboard();
  } else if (tabName === 'catalog') {
    renderCatalogUI();
  } else if (tabName === 'staff') {
    renderStaffDirectory();
  } else if (tabName === 'branding') {
    loadBrandSettingsIntoForm();
  }
}

// Auto-clear lingering demo orders and staff so system starts fresh from strictly ZERO
(function resetStorageOrdersToZero() {
  try {
    localStorage.removeItem('mr_cook_all_orders');
    localStorage.removeItem('mr_cook_active_order');
    localStorage.removeItem('mr_cook_cart');
    const storedStaff = localStorage.getItem('mr_cook_staff_directory');
    if (storedStaff) {
      try {
        const parsedStaff = JSON.parse(storedStaff);
        if (Array.isArray(parsedStaff) && parsedStaff.some(s => s.id === 'MC-101' && s.name === 'Hamza Malik')) {
          localStorage.removeItem('mr_cook_staff_directory');
        }
      } catch (err) {
        localStorage.removeItem('mr_cook_staff_directory');
      }
    }
  } catch (e) {}
})();

// ----------------------------------------------------------
// 3. Sales & Analytics Dashboard Engine
// ----------------------------------------------------------
function getLiveOrdersMetrics() {
  let orders = [];
  try {
    const stored = localStorage.getItem('mr_cook_all_orders');
    if (stored) orders = JSON.parse(stored);
  } catch (e) {
    orders = [];
  }

  if (!orders || orders.length === 0) {
    try {
      const active = localStorage.getItem('mr_cook_active_order');
      if (active) orders = [JSON.parse(active)];
    } catch (e) {}
  }

  // Base is strictly 0
  let totalRevenue = 0;
  let activeOrders = 0;
  let deliveriesInTransit = 0;
  let deliveredOrders = 0;

  (orders || []).forEach(o => {
    const total = (o.pricing && o.pricing.finalTotal) || 0;
    totalRevenue += total;

    if (o.status === 'pending' || o.status === 'in_preparation' || o.status === 'placed' || o.status === 'preparing') {
      activeOrders++;
    } else if (o.status === 'on_the_way') {
      deliveriesInTransit++;
    } else if (o.status === 'delivered') {
      deliveredOrders++;
    }
  });

  const completionRate = (orders && orders.length > 0)
    ? ((deliveredOrders / orders.length) * 100).toFixed(1) + '%'
    : '0%';

  return {
    totalRevenue,
    activeOrders,
    deliveriesInTransit,
    deliveredOrders,
    totalCount: (orders || []).length,
    completionRate,
    orders: orders || []
  };
}

function renderSalesAnalyticsDashboard() {
  const metrics = getLiveOrdersMetrics();

  // 1. Update 4 Key Metric Cards
  const revEl = document.getElementById('metric-total-revenue');
  const activeEl = document.getElementById('metric-active-orders');
  const transitEl = document.getElementById('metric-deliveries-transit');
  const branchEl = document.getElementById('metric-branch-performance');

  if (revEl) revEl.textContent = formatCurrency(metrics.totalRevenue);
  if (activeEl) activeEl.textContent = `${metrics.activeOrders} Active`;
  if (transitEl) transitEl.textContent = `${metrics.deliveriesInTransit} On the Way`;
  if (branchEl) branchEl.textContent = metrics.completionRate;

  // Date badge
  const dateBadge = document.getElementById('analytics-date-badge');
  if (dateBadge) {
    const now = new Date();
    dateBadge.textContent = `Today: ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Live Sync`;
  }

  // 2. Render Revenue Graph
  renderRevenueChart(analyticsTimeframe);

  // 3. Render Top Selling Items Table
  renderTopItemsLeaderboard();

  // 4. Render Category Progress Bars
  renderCategoryProgressBars();

  // 5. Initialize 3D Perspective Tilt on Analytics & Metric Cards
  if (window.MrCookFX) {
    window.MrCookFX.init3DTilt(document.getElementById('tab-content-dashboard') || document);
  }
}

function setAnalyticsTimeframe(timeframe) {
  analyticsTimeframe = timeframe;
  const btnWeekly = document.getElementById('chart-btn-weekly');
  const btnMonthly = document.getElementById('chart-btn-monthly');

  if (timeframe === 'weekly') {
    if (btnWeekly) btnWeekly.className = "px-3.5 py-1.5 rounded-xl text-xs font-heading font-bold transition-all bg-amber-500 text-black shadow";
    if (btnMonthly) btnMonthly.className = "px-3.5 py-1.5 rounded-xl text-xs font-heading font-bold transition-all text-neutral-400 hover:text-white";
  } else {
    if (btnWeekly) btnWeekly.className = "px-3.5 py-1.5 rounded-xl text-xs font-heading font-bold transition-all text-neutral-400 hover:text-white";
    if (btnMonthly) btnMonthly.className = "px-3.5 py-1.5 rounded-xl text-xs font-heading font-bold transition-all bg-amber-500 text-black shadow";
  }

  renderRevenueChart(timeframe);
}

// Interactive Responsive SVG Chart Renderer
function renderRevenueChart(timeframe) {
  const container = document.getElementById('analytics-revenue-chart-svg');
  if (!container) return;

  const metrics = getLiveOrdersMetrics();
  const peakDayEl = document.getElementById('chart-stat-peak-day');
  const aovEl = document.getElementById('chart-stat-aov');
  const totalOrdersEl = document.getElementById('chart-stat-total-orders');
  const avgTimeEl = document.getElementById('chart-stat-avg-time');

  let labels = [];
  let currentData = [];
  let baselineData = [];
  let maxVal = 10000;

  if (timeframe === 'weekly') {
    labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    currentData = [0, 0, 0, 0, 0, 0, 0];
    baselineData = [0, 0, 0, 0, 0, 0, 0];

    if (metrics.orders.length > 0) {
      metrics.orders.forEach(o => {
        const d = new Date(o.createdAt || Date.now()).getDay();
        const idx = d === 0 ? 6 : d - 1;
        currentData[idx] += (o.pricing && o.pricing.finalTotal) || 0;
      });
      maxVal = Math.max(...currentData, 10000);
    }

    if (peakDayEl) peakDayEl.textContent = metrics.orders.length > 0 ? "Active Day" : "None (Rs. 0)";
    if (aovEl) aovEl.textContent = metrics.orders.length > 0 ? formatCurrency(metrics.totalRevenue / metrics.orders.length) : "Rs. 0";
    if (totalOrdersEl) totalOrdersEl.textContent = `${metrics.orders.length} Orders`;
    if (avgTimeEl) avgTimeEl.textContent = metrics.orders.length > 0 ? "24.5 Mins" : "0 Mins";
  } else {
    labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    currentData = [0, 0, 0, 0];
    baselineData = [0, 0, 0, 0];

    if (metrics.orders.length > 0) {
      currentData[3] = metrics.totalRevenue;
      maxVal = Math.max(metrics.totalRevenue, 10000);
    }

    if (peakDayEl) peakDayEl.textContent = metrics.orders.length > 0 ? "Current Week" : "None (Rs. 0)";
    if (aovEl) aovEl.textContent = metrics.orders.length > 0 ? formatCurrency(metrics.totalRevenue / metrics.orders.length) : "Rs. 0";
    if (totalOrdersEl) totalOrdersEl.textContent = `${metrics.orders.length} Orders`;
    if (avgTimeEl) avgTimeEl.textContent = metrics.orders.length > 0 ? "24.5 Mins" : "0 Mins";
  }

  const svgWidth = 800;
  const svgHeight = 260;
  const paddingLeft = 65;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartW = svgWidth - paddingLeft - paddingRight;
  const chartH = svgHeight - paddingTop - paddingBottom;
  const numPoints = currentData.length;
  const colWidth = chartW / numPoints;
  const barW = Math.min(38, colWidth * 0.45);

  // Background Grid Lines
  const gridSteps = 4;
  let gridHTML = '';
  for (let i = 0; i <= gridSteps; i++) {
    const y = paddingTop + (chartH / gridSteps) * i;
    const value = Math.round(maxVal - (maxVal / gridSteps) * i);
    const labelStr = value >= 1000 ? `Rs. ${(value / 1000).toFixed(0)}k` : `Rs. ${value}`;

    gridHTML += `
      <line x1="${paddingLeft}" y1="${y}" x2="${svgWidth - paddingRight}" y2="${y}" stroke="rgba(255,255,255,0.08)" stroke-dasharray="3 3"/>
      <text x="${paddingLeft - 10}" y="${y + 4}" fill="#737373" font-size="10" font-family="'JetBrains Mono', monospace" text-anchor="end">${labelStr}</text>
    `;
  }

  // Baseline Polyline points
  const baselinePoints = baselineData.map((val, idx) => {
    const x = paddingLeft + (idx * colWidth) + (colWidth / 2);
    const y = paddingTop + chartH - (val / maxVal) * chartH;
    return `${x},${y}`;
  }).join(' ');

  // Bar elements with hover interactions
  let barsHTML = '';
  currentData.forEach((val, idx) => {
    const x = paddingLeft + (idx * colWidth) + (colWidth / 2) - (barW / 2);
    const barHeight = Math.max(3, (val / maxVal) * chartH); // minimal line if 0
    const y = paddingTop + chartH - barHeight;
    const label = labels[idx];
    const formattedVal = formatCurrency(val);

    barsHTML += `
      <g class="chart-bar-group cursor-pointer group" data-idx="${idx}">
        <!-- Transparent hover target -->
        <rect x="${x - 10}" y="${paddingTop}" width="${barW + 20}" height="${chartH}" fill="transparent"/>
        
        <!-- Bar with Gradient -->
        <rect 
          x="${x}" 
          y="${y}" 
          width="${barW}" 
          height="${barHeight}" 
          rx="6" 
          fill="url(#brandGradientChart)" 
          class="transition-all duration-300 group-hover:brightness-125"
          opacity="${val === 0 ? '0.2' : '1'}"
        />

        <!-- Value floating text above bar -->
        <text 
          x="${x + barW / 2}" 
          y="${y - 8}" 
          fill="#fbbf24" 
          font-size="10" 
          font-weight="bold" 
          font-family="'Outfit', sans-serif" 
          text-anchor="middle"
          class="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          ${formattedVal}
        </text>

        <!-- X-Axis Label -->
        <text 
          x="${x + barW / 2}" 
          y="${svgHeight - 12}" 
          fill="#a3a3a3" 
          font-size="11" 
          font-weight="600" 
          font-family="'Plus Jakarta Sans', sans-serif" 
          text-anchor="middle"
        >
          ${label}
        </text>
      </g>
    `;
  });

  const svgContent = `
    <svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="w-full h-full overflow-visible" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="brandGradientChart" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--brand-primary, #f59e0b)"/>
          <stop offset="100%" stop-color="var(--brand-secondary, #f97316)"/>
        </linearGradient>
      </defs>

      <!-- Background Grid -->
      ${gridHTML}

      <!-- Baseline Trend Area & Line (Previous Period) -->
      <polyline points="${baselinePoints}" fill="none" stroke="#a855f7" stroke-width="2" stroke-dasharray="4 4" opacity="0.4"/>

      <!-- Bars -->
      ${barsHTML}
    </svg>
  `;

  container.innerHTML = svgContent;
}

function renderCategoryProgressBars() {
  const container = document.getElementById('analytics-category-progress-bars');
  if (!container) return;

  const metrics = getLiveOrdersMetrics();
  const totalRev = metrics.totalRevenue;

  let catTotals = {
    'Exclusive Deals': 0,
    'Gourmet Burgers': 0,
    'Hand-Crafted Pizzas': 0,
    'Fried Chicken & Wings': 0,
    'Beverages & Sides': 0
  };

  if (totalRev > 0) {
    metrics.orders.forEach(o => {
      (o.items || []).forEach(it => {
        const cat = it.category || 'Gourmet Burgers';
        const price = (it.numPrice || it.price || 0) * (it.quantity || it.qty || 1);
        if (catTotals[cat] !== undefined) {
          catTotals[cat] += price;
        } else {
          catTotals['Drinks & Beverages'] = (catTotals['Drinks & Beverages'] || 0) + price;
        }
      });
    });
  }

  const categories = [
    { name: 'Exclusive Deals', grad: 'from-amber-500 to-orange-500' },
    { name: 'Gourmet Burgers', grad: 'from-amber-500 to-yellow-500' },
    { name: 'Hand-Crafted Pizzas', grad: 'from-red-500 to-orange-500' },
    { name: 'Fried Chicken & Wings', grad: 'from-purple-500 to-indigo-500' },
    { name: 'Drinks & Beverages', grad: 'from-blue-500 to-cyan-500' }
  ];

  let barsHTML = '';
  categories.forEach(cat => {
    const val = catTotals[cat.name] || 0;
    const pct = totalRev > 0 ? Math.round((val / totalRev) * 100) : 0;

    barsHTML += `
      <div>
        <div class="flex justify-between text-xs mb-1">
          <span class="text-neutral-200 font-medium">${cat.name}</span>
          <span class="font-mono font-bold text-amber-400">${pct}% (${formatCurrency(val)})</span>
        </div>
        <div class="w-full bg-[#141414] rounded-full h-2 overflow-hidden">
          <div class="bg-gradient-to-r ${cat.grad} h-2 rounded-full transition-all duration-500" style="width: ${pct}%"></div>
        </div>
      </div>
    `;
  });

  container.innerHTML = barsHTML;
}

function renderTopItemsLeaderboard() {
  const tbody = document.getElementById('analytics-top-items-tbody');
  if (!tbody) return;

  const metrics = getLiveOrdersMetrics();
  const itemMap = {};

  metrics.orders.forEach(o => {
    (o.items || []).forEach(it => {
      const key = it.name || it.id;
      if (!itemMap[key]) {
        itemMap[key] = {
          name: it.name,
          category: it.category || "Menu Item",
          units: 0,
          price: it.price || it.numPrice || 0,
          revenue: 0,
          img: it.img || "./images/burger.jpg"
        };
      }
      const qty = it.quantity || it.qty || 1;
      const unitPrice = it.numPrice || it.price || 0;
      itemMap[key].units += qty;
      itemMap[key].revenue += qty * unitPrice;
    });
  });

  const topItems = Object.values(itemMap).sort((a, b) => b.units - a.units).slice(0, 5);

  if (topItems.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="py-8 text-center text-xs text-neutral-500">
          <div class="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-2 text-lg">🍽️</div>
          <span class="font-bold text-neutral-300 block">No Sales Recorded Yet</span>
          <span class="text-[11px] text-neutral-500 mt-0.5 block">0 units sold • All sales & volume metrics currently at zero.</span>
        </td>
      </tr>
    `;
    return;
  }

  let rowsHTML = '';
  topItems.forEach((item, idx) => {
    rowsHTML += `
      <tr class="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
        <td class="py-2.5 px-3">
          <div class="flex items-center gap-2.5">
            <span class="font-mono font-bold text-amber-500 text-xs w-4">#${idx + 1}</span>
            <div class="w-8 h-8 rounded-lg bg-neutral-900 overflow-hidden shrink-0 border border-white/10">
              <img src="${item.img}" onerror="this.onerror=null;this.src='./images/burger.jpg'" alt="${escapeHTML(item.name)}" class="w-full h-full object-cover" />
            </div>
            <div>
              <span class="font-heading font-bold text-xs text-white block">${escapeHTML(item.name)}</span>
              <span class="text-[10px] text-neutral-400 block">${escapeHTML(item.category)}</span>
            </div>
          </div>
        </td>
        <td class="py-2.5 px-3 font-mono text-white text-xs">
          ${item.units} Sold
        </td>
        <td class="py-2.5 px-3 font-mono text-neutral-300 text-xs">
          ${formatCurrency(item.price)}
        </td>
        <td class="py-2.5 px-3 font-mono font-bold text-amber-400 text-xs text-right">
          ${formatCurrency(item.revenue)}
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = rowsHTML;
}

// ----------------------------------------------------------
// 4. Staff Management Module (CRUD & Role Directory)
// ----------------------------------------------------------
function loadStaffData() {
  try {
    const stored = localStorage.getItem('mr_cook_staff_directory');
    if (stored) {
      currentStaff = JSON.parse(stored);
      if (!Array.isArray(currentStaff)) currentStaff = [];
    } else {
      currentStaff = [];
      saveStaffData();
    }
  } catch (e) {
    currentStaff = [];
  }
}

function saveStaffData() {
  try {
    localStorage.setItem('mr_cook_staff_directory', JSON.stringify(currentStaff));
    if (window.MrCookFirebase && typeof window.MrCookFirebase.syncStaffDirectory === 'function') {
      window.MrCookFirebase.syncStaffDirectory(currentStaff);
    }
  } catch (e) {
    console.error("Error saving staff data:", e);
  }
}

function renderStaffDirectory() {
  const tbody = document.getElementById('staff-directory-tbody');
  const countBadge = document.getElementById('tab-staff-count-badge');
  const metricTotal = document.getElementById('staff-metric-total');
  const metricActive = document.getElementById('staff-metric-active');
  const metricRiders = document.getElementById('staff-metric-riders');
  const metricKitchen = document.getElementById('staff-metric-kitchen');

  if (!tbody) return;

  const total = currentStaff.length;
  const activeCount = currentStaff.filter(s => s.status === 'active').length;
  const ridersCount = currentStaff.filter(s => s.role.toLowerCase().includes('rider')).length;
  const kitchenCount = currentStaff.filter(s => s.role.toLowerCase().includes('chef') || s.role.toLowerCase().includes('kitchen')).length;

  if (countBadge) countBadge.textContent = `${total} Staff`;
  if (metricTotal) metricTotal.textContent = `${total} Members`;
  if (metricActive) metricActive.textContent = `${activeCount} Active`;
  if (metricRiders) metricRiders.textContent = `${ridersCount} Fleet`;
  if (metricKitchen) metricKitchen.textContent = `${kitchenCount} Culinary`;

  // Filter staff list
  let filtered = currentStaff;

  if (selectedStaffRoleFilter !== 'all') {
    if (selectedStaffRoleFilter === 'manager') {
      filtered = filtered.filter(s => s.role.toLowerCase().includes('manager') || s.role.toLowerCase().includes('supervisor'));
    } else if (selectedStaffRoleFilter === 'chef') {
      filtered = filtered.filter(s => s.role.toLowerCase().includes('chef') || s.role.toLowerCase().includes('cook'));
    } else if (selectedStaffRoleFilter === 'rider') {
      filtered = filtered.filter(s => s.role.toLowerCase().includes('rider'));
    } else if (selectedStaffRoleFilter === 'cashier') {
      filtered = filtered.filter(s => s.role.toLowerCase().includes('cashier'));
    }
  }

  if (staffSearchQuery) {
    const q = staffSearchQuery.toLowerCase();
    filtered = filtered.filter(s => 
      s.name.toLowerCase().includes(q) || 
      s.phone.toLowerCase().includes(q) || 
      s.id.toLowerCase().includes(q) || 
      s.role.toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="py-12 text-center text-xs text-neutral-400">
          <div class="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-2 text-2xl">👥</div>
          <span class="font-bold text-white text-sm block">No Staff Members Registered</span>
          <span class="text-neutral-500 text-xs mt-1 block">Staff directory is currently zero. Click "+ Add New Staff Member" above to create employee records.</span>
        </td>
      </tr>
    `;
    return;
  }

  let rowsHTML = '';
  filtered.forEach(staff => {
    // Role Badge Color
    let roleBadgeColor = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    if (staff.role.includes('Manager')) roleBadgeColor = 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    else if (staff.role.includes('Chef')) roleBadgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    else if (staff.role.includes('Rider')) roleBadgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    else if (staff.role.includes('Cashier')) roleBadgeColor = 'bg-pink-500/20 text-pink-300 border-pink-500/30';

    // Status Badge
    let statusHTML = '';
    if (staff.status === 'active') {
      statusHTML = `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase border border-emerald-500/30"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active</span>`;
    } else if (staff.status === 'on_leave') {
      statusHTML = `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase border border-amber-500/30"><span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span> On Leave</span>`;
    } else {
      statusHTML = `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-400 text-[10px] font-bold uppercase border border-neutral-700"><span class="w-1.5 h-1.5 rounded-full bg-neutral-500"></span> Inactive</span>`;
    }

    // Initials for avatar
    const initials = staff.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    rowsHTML += `
      <tr class="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
        
        <!-- Member Name & ID -->
        <td class="py-3 px-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br ${staff.avatarBg || 'from-blue-600 to-indigo-600'} text-white font-heading font-black text-xs flex items-center justify-center shrink-0 shadow">
              ${initials}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-heading font-bold text-sm text-white">${escapeHTML(staff.name)}</span>
                <span class="font-mono text-[10px] text-neutral-500 font-semibold">${staff.id}</span>
              </div>
              <span class="text-[11px] text-neutral-400 block">${escapeHTML(staff.email || 'staff@mrcook.pk')}</span>
            </div>
          </div>
        </td>

        <!-- Role -->
        <td class="py-3 px-4">
          <span class="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${roleBadgeColor}">
            ${escapeHTML(staff.role)}
          </span>
        </td>

        <!-- Phone / Contact -->
        <td class="py-3 px-4 font-mono text-xs">
          <a href="tel:${staff.phone}" class="text-neutral-200 hover:text-amber-400 transition-colors flex items-center gap-1.5">
            <span>📞</span>
            <span>${staff.phone}</span>
          </a>
        </td>

        <!-- Branch -->
        <td class="py-3 px-4 text-xs text-neutral-300">
          <div class="flex items-center gap-1.5">
            <span>📍</span>
            <span class="truncate max-w-[180px]">${escapeHTML(staff.branch || 'Westridge III Main Branch')}</span>
          </div>
        </td>

        <!-- Access Level -->
        <td class="py-3 px-4 text-xs">
          <span class="px-2 py-0.5 rounded bg-white/10 text-neutral-300 font-mono text-[10px] font-bold">
            ${escapeHTML(staff.accessLevel || 'Kitchen Ops')}
          </span>
        </td>

        <!-- Status -->
        <td class="py-3 px-4">
          ${statusHTML}
        </td>

        <!-- Actions -->
        <td class="py-3 px-4 text-right whitespace-nowrap">
          <div class="inline-flex items-center gap-1.5">
            <!-- Edit Button -->
            <button 
              onclick="openStaffModal('edit', '${staff.id}')" 
              class="px-2.5 py-1.5 rounded-lg bg-[#242424] hover:bg-white/10 text-neutral-200 border border-white/5 text-xs font-semibold transition-all"
              title="Edit Staff Member"
            >
              ✏️ Edit
            </button>

            <!-- Toggle Status Button -->
            <button 
              onclick="toggleStaffStatus('${staff.id}')" 
              class="px-2 py-1.5 rounded-lg bg-[#242424] hover:bg-amber-500 hover:text-black text-neutral-300 border border-white/5 text-xs transition-all"
              title="Toggle Active / Inactive Status"
            >
              🔄
            </button>

            <!-- Remove / Deactivate Button -->
            <button 
              onclick="handleDeleteStaff('${staff.id}')" 
              class="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 border border-red-500/20 text-xs transition-all"
              title="Remove or Deactivate Staff Member"
            >
              🗑️
            </button>
          </div>
        </td>

      </tr>
    `;
  });

  tbody.innerHTML = rowsHTML;
}

function handleSearchStaff(query) {
  staffSearchQuery = query.trim();
  renderStaffDirectory();
}

function filterStaffByRole(role) {
  selectedStaffRoleFilter = role;
  const roles = ['all', 'manager', 'chef', 'rider', 'cashier'];
  roles.forEach(r => {
    const btn = document.getElementById(`staff-filter-${r}`);
    if (btn) {
      if (r === role) {
        btn.className = "px-3 py-1.5 rounded-full text-xs font-bold transition-all bg-blue-500 text-white";
      } else {
        btn.className = "px-3 py-1.5 rounded-full text-xs font-bold transition-all bg-neutral-800 text-neutral-300 hover:bg-neutral-700";
      }
    }
  });
  renderStaffDirectory();
}

function openStaffModal(mode, staffId) {
  const modal = document.getElementById('modal-staff');
  const title = document.getElementById('modal-staff-title');
  const modeInput = document.getElementById('staff-form-mode');
  const idInput = document.getElementById('staff-form-id');
  const nameInput = document.getElementById('staff-form-name');
  const codeInput = document.getElementById('staff-form-code');
  const roleSelect = document.getElementById('staff-form-role');
  const accessSelect = document.getElementById('staff-form-access');
  const phoneInput = document.getElementById('staff-form-phone');
  const emailInput = document.getElementById('staff-form-email');
  const branchInput = document.getElementById('staff-form-branch');
  const statusSelect = document.getElementById('staff-form-status');

  if (mode === 'edit' && staffId) {
    const staff = currentStaff.find(s => s.id === staffId);
    if (!staff) return;

    title.textContent = "Edit Staff Member";
    modeInput.value = 'edit';
    idInput.value = staff.id;
    nameInput.value = staff.name || '';
    codeInput.value = staff.id || '';
    roleSelect.value = staff.role || 'Line Chef (Burgers & Wings)';
    accessSelect.value = staff.accessLevel || 'Kitchen Ops';
    phoneInput.value = staff.phone || '';
    emailInput.value = staff.email || '';
    branchInput.value = staff.branch || 'Westridge III Main Branch, Rawalpindi';
    statusSelect.value = staff.status || 'active';
  } else {
    title.textContent = "Add New Staff Member";
    modeInput.value = 'add';
    idInput.value = '';
    nameInput.value = '';
    codeInput.value = `MC-${100 + currentStaff.length + 1}`;
    roleSelect.value = 'Delivery Rider';
    accessSelect.value = 'Rider Dispatch';
    phoneInput.value = '03144108033';
    emailInput.value = '';
    branchInput.value = 'Westridge III Main Branch, Rawalpindi';
    statusSelect.value = 'active';
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeStaffModal() {
  const modal = document.getElementById('modal-staff');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function handleSaveStaffSubmit(e) {
  e.preventDefault();
  const mode = document.getElementById('staff-form-mode').value;
  const staffId = document.getElementById('staff-form-id').value;
  const name = document.getElementById('staff-form-name').value.trim();
  const code = document.getElementById('staff-form-code').value.trim();
  const role = document.getElementById('staff-form-role').value;
  const accessLevel = document.getElementById('staff-form-access').value;
  const phone = document.getElementById('staff-form-phone').value.trim();
  const email = document.getElementById('staff-form-email').value.trim();
  const branch = document.getElementById('staff-form-branch').value.trim();
  const status = document.getElementById('staff-form-status').value;

  if (!name || !phone) {
    alert("Please provide the staff member name and phone number.");
    return;
  }

  if (mode === 'edit') {
    const staff = currentStaff.find(s => s.id === staffId);
    if (staff) {
      staff.name = name;
      staff.id = code || staffId;
      staff.role = role;
      staff.accessLevel = accessLevel;
      staff.phone = phone;
      staff.email = email;
      staff.branch = branch;
      staff.status = status;
      showToast("Staff Member Updated", `Credentials for ${name} updated.`);
    }
  } else {
    // Add mode
    const newStaff = {
      id: code || `MC-${Date.now().toString().slice(-3)}`,
      name: name,
      role: role,
      accessLevel: accessLevel,
      phone: phone,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@mrcook.pk`,
      branch: branch || 'Westridge III Main Branch, Rawalpindi',
      status: status || 'active',
      avatarBg: 'from-blue-600 to-indigo-600'
    };
    currentStaff.unshift(newStaff);
    showToast("Staff Member Added", `${name} added to ${role} team.`);
  }

  saveStaffData();
  closeStaffModal();
  renderStaffDirectory();
}

function toggleStaffStatus(staffId) {
  const staff = currentStaff.find(s => s.id === staffId);
  if (!staff) return;

  staff.status = staff.status === 'active' ? 'inactive' : 'active';
  saveStaffData();
  renderStaffDirectory();
  showToast("Status Toggled", `${staff.name} is now ${staff.status.toUpperCase()}.`);
}

function handleDeleteStaff(staffId) {
  const staff = currentStaff.find(s => s.id === staffId);
  if (!staff) return;

  if (confirm(`Are you sure you want to remove or deactivate staff member "${staff.name}" (${staff.role})?`)) {
    currentStaff = currentStaff.filter(s => s.id !== staffId);
    saveStaffData();
    renderStaffDirectory();
    showToast("Staff Member Removed", `${staff.name} has been removed from staff directory.`);
  }
}

// ----------------------------------------------------------
// 5. Store Branding & Theme Customization
// ----------------------------------------------------------
function loadBrandSettingsIntoForm() {
  currentBrandSettings = window.MrCookTheme ? window.MrCookTheme.getSettings() : Object.assign({}, MR_COOK_DEFAULT_BRAND);

  // Populate inputs
  const storeNameEl = document.getElementById('brand-store-name-input');
  if (storeNameEl) storeNameEl.value = currentBrandSettings.storeName || 'Mr. Cook';
  
  const taglineEl = document.getElementById('brand-tagline-input');
  if (taglineEl) taglineEl.value = currentBrandSettings.tagline || 'Fast Food & Legacy Flavors';
  
  const branchEl = document.getElementById('brand-branch-input');
  if (branchEl) branchEl.value = currentBrandSettings.branchName || 'Westridge III, Rawalpindi';
  
  const locEl = document.getElementById('brand-location-input');
  if (locEl) locEl.value = currentBrandSettings.locationTag || 'Pakistan';
  
  const phoneEl = document.getElementById('brand-phone-input');
  if (phoneEl) phoneEl.value = currentBrandSettings.phone || '03144108033';
  
  const waEl = document.getElementById('brand-whatsapp-input');
  if (waEl) waEl.value = currentBrandSettings.whatsapp || '03144108033';
  
  const feeEl = document.getElementById('brand-delivery-fee-input');
  if (feeEl) feeEl.value = currentBrandSettings.deliveryFee !== undefined ? currentBrandSettings.deliveryFee : 150;
  
  const timeEl = document.getElementById('brand-delivery-time-input');
  if (timeEl) timeEl.value = currentBrandSettings.estimatedDelivery || '30-45 Mins';
  
  const addrEl = document.getElementById('brand-address-input');
  if (addrEl) addrEl.value = currentBrandSettings.fullAddress || 'Main Peshawar Road, Westridge III, Rawalpindi, Pakistan';

  // Colors
  const primary = currentBrandSettings.primaryColor || '#f59e0b';
  const secondary = currentBrandSettings.secondaryColor || '#f97316';
  
  const cp1 = document.getElementById('color-picker-primary');
  const ch1 = document.getElementById('color-hex-primary');
  const cp2 = document.getElementById('color-picker-secondary');
  const ch2 = document.getElementById('color-hex-secondary');

  if (cp1) cp1.value = primary;
  if (ch1) ch1.value = primary;
  if (cp2) cp2.value = secondary;
  if (ch2) ch2.value = secondary;

  // Logo Preview
  updateLogoPreviewBox(currentBrandSettings);
}

function setupColorListeners() {
  const picker1 = document.getElementById('color-picker-primary');
  const hex1 = document.getElementById('color-hex-primary');
  const picker2 = document.getElementById('color-picker-secondary');
  const hex2 = document.getElementById('color-hex-secondary');

  if (!picker1 || !hex1 || !picker2 || !hex2) return;

  picker1.addEventListener('input', (e) => {
    hex1.value = e.target.value.toUpperCase();
    currentBrandSettings.primaryColor = e.target.value;
    previewLiveTheme();
  });

  hex1.addEventListener('input', (e) => {
    let val = e.target.value.trim();
    if (!val.startsWith('#')) val = '#' + val;
    if (/^#[0-9A-F]{6}$/i.test(val)) {
      picker1.value = val;
      currentBrandSettings.primaryColor = val;
      previewLiveTheme();
    }
  });

  picker2.addEventListener('input', (e) => {
    hex2.value = e.target.value.toUpperCase();
    currentBrandSettings.secondaryColor = e.target.value;
    previewLiveTheme();
  });

  hex2.addEventListener('input', (e) => {
    let val = e.target.value.trim();
    if (!val.startsWith('#')) val = '#' + val;
    if (/^#[0-9A-F]{6}$/i.test(val)) {
      picker2.value = val;
      currentBrandSettings.secondaryColor = val;
      previewLiveTheme();
    }
  });
}

function applyColorThemePreset(primary, secondary) {
  const cp1 = document.getElementById('color-picker-primary');
  const ch1 = document.getElementById('color-hex-primary');
  const cp2 = document.getElementById('color-picker-secondary');
  const ch2 = document.getElementById('color-hex-secondary');

  if (cp1) cp1.value = primary;
  if (ch1) ch1.value = primary.toUpperCase();
  if (cp2) cp2.value = secondary;
  if (ch2) ch2.value = secondary.toUpperCase();

  currentBrandSettings.primaryColor = primary;
  currentBrandSettings.secondaryColor = secondary;
  previewLiveTheme();
  showToast("Theme Preset Applied", `Primary: ${primary} | Secondary: ${secondary}`);
}

function previewLiveTheme() {
  if (window.MrCookTheme) {
    window.MrCookTheme.applyTheme({
      primaryColor: currentBrandSettings.primaryColor,
      secondaryColor: currentBrandSettings.secondaryColor
    });
  }
}

// Logo Management
function setupLogoUploadListeners() {
  const fileInput = document.getElementById('admin-logo-file-input');
  if (!fileInput) return;

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Please upload a valid image file (PNG, JPG, SVG, WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = function(evt) {
      const dataUrl = evt.target.result;
      currentBrandSettings.logoType = 'custom';
      currentBrandSettings.customLogoUrl = dataUrl;
      updateLogoPreviewBox(currentBrandSettings);
      showToast("Custom Logo Uploaded", "Image converted to permanent data format and previewed.");
    };
    reader.readAsDataURL(file);
  });
}

function handleApplyLogoUrl() {
  const input = document.getElementById('admin-logo-url-input');
  const url = input.value.trim();
  if (!url) return;

  currentBrandSettings.logoType = 'custom';
  currentBrandSettings.customLogoUrl = url;
  updateLogoPreviewBox(currentBrandSettings);
  showToast("Custom Logo Set", "Logo URL applied to live preview.");
}

function handleResetLogoToDefault() {
  currentBrandSettings.logoType = 'default';
  currentBrandSettings.customLogoUrl = '';
  const urlInput = document.getElementById('admin-logo-url-input');
  const fileInput = document.getElementById('admin-logo-file-input');
  if (urlInput) urlInput.value = '';
  if (fileInput) fileInput.value = '';
  updateLogoPreviewBox(currentBrandSettings);
  showToast("Default Logo Restored", "Chef Hat icon active.");
}

function updateLogoPreviewBox(settings) {
  const inner = document.getElementById('admin-logo-preview-inner');
  const status = document.getElementById('admin-logo-status-text');
  if (!inner || !status) return;

  if (settings.logoType === 'custom' && settings.customLogoUrl) {
    inner.innerHTML = `<img src="${settings.customLogoUrl}" alt="Store Logo" class="w-full h-full object-cover" />`;
    status.innerHTML = `<span class="text-emerald-400 font-bold">Custom Brand Logo Active</span>`;
  } else {
    inner.innerHTML = `
      <svg class="w-9 h-9 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/>
        <line x1="6" y1="17" x2="18" y2="17"/>
      </svg>
    `;
    status.innerHTML = `<span>Using Official Chef Icon Logo</span>`;
  }
}

// ----------------------------------------------------------
// 6. Menu Item & Category Manager (CRUD Operations)
// ----------------------------------------------------------
function loadCatalogData() {
  try {
    const saved = localStorage.getItem('mr_cook_menu_catalog');
    if (saved) {
      currentCatalog = JSON.parse(saved);
      // Guarantee Drinks & Beverages category is synchronized
      if (typeof OFFICIAL_MENU_DATA !== 'undefined') {
        const hasDrinks = currentCatalog.some(c => c.id === 'drinks-beverages');
        if (!hasDrinks) {
          const drinksCat = OFFICIAL_MENU_DATA.find(c => c.id === 'drinks-beverages');
          if (drinksCat) {
            currentCatalog.push(JSON.parse(JSON.stringify(drinksCat)));
            try {
              localStorage.setItem('mr_cook_menu_catalog', JSON.stringify(currentCatalog));
            } catch (err) {}
          }
        }
      }
    } else if (typeof OFFICIAL_MENU_DATA !== 'undefined') {
      currentCatalog = JSON.parse(JSON.stringify(OFFICIAL_MENU_DATA));
    } else {
      currentCatalog = [];
    }
  } catch (e) {
    console.error("Error loading catalog:", e);
    currentCatalog = typeof OFFICIAL_MENU_DATA !== 'undefined' ? JSON.parse(JSON.stringify(OFFICIAL_MENU_DATA)) : [];
  }
}

// Persistent storage helper for live menu catalog
function persistCatalogChanges() {
  try {
    localStorage.setItem('mr_cook_menu_catalog', JSON.stringify(currentCatalog));
    if (window.MrCookFirebase && typeof window.MrCookFirebase.syncMenuCatalog === 'function') {
      window.MrCookFirebase.syncMenuCatalog(currentCatalog);
    }
  } catch (e) {
    console.error("Error persisting catalog to storage:", e);
  }
}

// ----------------------------------------------------------
// Multimedia Dish Photo Studio & Rich Description Helpers
// ----------------------------------------------------------
function handleDishFileSelect(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert("Please select a valid image file (.jpg, .png, .webp, .svg)");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    setDishPhoto(dataUrl);
    showToast("Photo Uploaded", "High-quality dish photo ready for preview.");
  };
  reader.readAsDataURL(file);
}

function setDishPhoto(imgSrc) {
  const previewEl = document.getElementById('item-form-preview-img');
  const inputEl = document.getElementById('item-form-img');
  if (previewEl) previewEl.src = imgSrc;
  if (inputEl) inputEl.value = imgSrc;
}

function handleDishUrlInput(url) {
  const previewEl = document.getElementById('item-form-preview-img');
  if (previewEl) {
    previewEl.src = url.trim() || './images/burger.jpg';
  }
}

function selectDishPhotoPreset(presetPath) {
  setDishPhoto(presetPath);
}

function resetDishPhotoToDefault() {
  setDishPhoto('./images/burger.jpg');
  const fileInput = document.getElementById('item-form-file');
  if (fileInput) fileInput.value = '';
}

function insertDescSnippet(snippet) {
  const descEl = document.getElementById('item-form-desc');
  if (!descEl) return;
  const start = descEl.selectionStart !== undefined ? descEl.selectionStart : descEl.value.length;
  const end = descEl.selectionEnd !== undefined ? descEl.selectionEnd : descEl.value.length;
  const val = descEl.value;
  descEl.value = val.substring(0, start) + snippet + val.substring(end);
  descEl.focus();
  descEl.selectionStart = descEl.selectionEnd = start + snippet.length;
  updateDescCharCount(descEl.value);
}

function updateDescCharCount(text) {
  const counter = document.getElementById('item-form-desc-count');
  if (counter) {
    counter.textContent = `${(text || '').length} chars`;
  }
}

function renderCatalogUI() {
  const container = document.getElementById('admin-menu-sections-container');
  const filterPillsContainer = document.getElementById('admin-category-filter-pills');
  const badgeCountEl = document.getElementById('tab-item-count-badge');

  if (!container) return;

  // Calculate total items & stats
  let totalDishes = 0;
  let activeDishes = 0;
  let hiddenDishes = 0;
  currentCatalog.forEach(cat => {
    (cat.items || []).forEach(it => {
      totalDishes++;
      if (it.hidden) hiddenDishes++;
      else activeDishes++;
    });
  });

  const statTotal = document.getElementById('catalog-stat-total');
  const statActive = document.getElementById('catalog-stat-active');
  const statHidden = document.getElementById('catalog-stat-hidden');
  const statCats = document.getElementById('catalog-stat-categories');
  if (statTotal) statTotal.textContent = totalDishes;
  if (statActive) statActive.textContent = activeDishes;
  if (statHidden) statHidden.textContent = hiddenDishes;
  if (statCats) statCats.textContent = currentCatalog.length;
  if (badgeCountEl) badgeCountEl.textContent = `${totalDishes} Dishes`;

  // 1. Render Category Quick Filter Pills
  let pillsHTML = `
    <button 
      onclick="filterCatalogByCategory('all')" 
      class="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${selectedCategoryFilter === 'all' ? 'bg-amber-500 text-black active-pill' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'}"
    >
      All Categories (${totalDishes})
    </button>
  `;

  currentCatalog.forEach(cat => {
    const isSelected = selectedCategoryFilter === cat.id;
    pillsHTML += `
      <button 
        onclick="filterCatalogByCategory('${cat.id}')" 
        class="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${isSelected ? 'bg-amber-500 text-black active-pill' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'}"
      >
        ${escapeHTML(cat.name)} (${(cat.items || []).length})
      </button>
    `;
  });
  if (filterPillsContainer) filterPillsContainer.innerHTML = pillsHTML;

  // 2. Filter categories to display
  let filteredCategories = currentCatalog;
  if (selectedCategoryFilter !== 'all') {
    filteredCategories = currentCatalog.filter(c => c.id === selectedCategoryFilter);
  }

  // 3. Render Categories & Items
  if (filteredCategories.length === 0) {
    container.innerHTML = `
      <div class="p-12 text-center bg-[#1b1b1b] border border-white/5 rounded-3xl">
        <span class="text-4xl block mb-2">🍽️</span>
        <h3 class="font-heading font-bold text-lg text-white">No categories found</h3>
        <p class="text-xs text-neutral-400 mt-1">Click "+ Add New Category" to create one.</p>
      </div>
    `;
    return;
  }

  let sectionsHTML = '';

  filteredCategories.forEach(category => {
    let items = category.items || [];

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(it => 
        it.name.toLowerCase().includes(q) || 
        it.desc.toLowerCase().includes(q) ||
        (it.tag && it.tag.toLowerCase().includes(q))
      );
    }

    let itemsTableHTML = '';
    if (items.length === 0) {
      itemsTableHTML = `
        <div class="p-6 text-center text-xs text-neutral-500 bg-[#161616] rounded-2xl border border-white/5">
          ${searchQuery ? 'No dishes match your search in this category.' : 'No dishes in this category yet. Click "+ Add Dish" above.'}
        </div>
      `;
    } else {
      let rowsHTML = '';
      items.forEach(item => {
        const isHidden = !!item.hidden;
        rowsHTML += `
          <tr class="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
            
            <!-- Item Thumbnail & Name -->
            <td class="py-3 px-4">
              <div class="flex items-center gap-3">
                <div class="w-14 h-14 rounded-xl bg-neutral-900 overflow-hidden shrink-0 border border-white/10 relative shadow-sm">
                  <img 
                    src="${item.img || './images/burger.jpg'}" 
                    onerror="this.onerror=null;this.src='./images/burger.jpg'" 
                    alt="${escapeHTML(item.name)}" 
                    class="w-full h-full object-cover" 
                  />
                  ${isHidden ? `
                    <div class="absolute inset-0 bg-black/75 flex flex-col items-center justify-center text-[9px] text-amber-300 font-bold" title="Hidden from customer site">
                      <span>🔒</span>
                      <span>Hidden</span>
                    </div>
                  ` : ''}
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-heading font-bold text-sm text-white ${isHidden ? 'line-through text-neutral-400' : ''}">${escapeHTML(item.name)}</span>
                    ${item.tag ? `<span class="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">${escapeHTML(item.tag)}</span>` : ''}
                  </div>
                  <p class="text-[11px] text-neutral-400 line-clamp-1 max-w-sm mt-0.5">${escapeHTML(item.desc)}</p>
                </div>
              </div>
            </td>

            <!-- Price -->
            <td class="py-3 px-4 font-mono font-bold text-sm text-amber-400 whitespace-nowrap">
              ${item.price}
            </td>

            <!-- Visibility Status -->
            <td class="py-3 px-4 whitespace-nowrap">
              ${isHidden ? `
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-400 text-[10px] font-bold uppercase border border-neutral-700">
                  <span class="w-1.5 h-1.5 rounded-full bg-neutral-500"></span>
                  Hidden / Offline
                </span>
              ` : `
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase border border-emerald-500/30">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Active Online
                </span>
              `}
            </td>

            <!-- Actions Controls -->
            <td class="py-3 px-4 text-right whitespace-nowrap">
              <div class="inline-flex items-center gap-1.5">
                
                <!-- Quick Edit Price Button -->
                <button 
                  onclick="openQuickPriceModal('${category.id}', '${item.id}')" 
                  title="Quick Price Edit" 
                  class="px-2.5 py-1.5 rounded-lg bg-[#242424] hover:bg-amber-500 hover:text-black text-neutral-200 border border-white/5 text-xs font-semibold transition-all flex items-center gap-1"
                >
                  <span>💰 Edit Price</span>
                </button>

                <!-- Full Edit Dish Modal Button -->
                <button 
                  onclick="openItemModal('edit', '${category.id}', '${item.id}')" 
                  title="Edit Dish & Photo Studio" 
                  class="px-2.5 py-1.5 rounded-lg bg-[#242424] hover:bg-white/10 text-neutral-200 border border-white/5 text-xs font-semibold transition-all flex items-center gap-1"
                >
                  <span>✏️ Edit Dish</span>
                </button>

                <!-- Hide / Show Toggle Button -->
                <button 
                  onclick="toggleItemVisibility('${category.id}', '${item.id}')" 
                  title="${isHidden ? 'Make dish available on customer storefront' : 'Hide dish from customer storefront'}" 
                  class="px-2.5 py-1.5 rounded-lg ${isHidden ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-black border-emerald-500/30' : 'bg-neutral-800 text-neutral-400 hover:text-white border-white/5'} border text-xs font-semibold transition-all flex items-center gap-1"
                >
                  <span>${isHidden ? '👁️ Show' : '🔒 Hide'}</span>
                </button>

                <!-- Delete Item Button -->
                <button 
                  onclick="handleDeleteItem('${category.id}', '${item.id}')" 
                  title="Permanently remove dish from menu" 
                  class="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 border border-red-500/20 text-xs transition-all"
                >
                  🗑️
                </button>

              </div>
            </td>

          </tr>
        `;
      });

      itemsTableHTML = `
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="text-[11px] uppercase tracking-wider text-neutral-400 bg-[#161616] border-b border-white/5">
              <tr>
                <th class="py-2.5 px-4">Item & Description</th>
                <th class="py-2.5 px-4">Price</th>
                <th class="py-2.5 px-4">Menu Visibility</th>
                <th class="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHTML}
            </tbody>
          </table>
        </div>
      `;
    }

    sectionsHTML += `
      <div class="bg-[#1b1b1b] border border-white/10 rounded-3xl p-5 shadow-xl">
        <!-- Category Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-white/10 gap-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-amber-500 font-heading font-bold text-[10px] uppercase tracking-widest block">${category.badge || 'Mr. Cook'}</span>
              <span class="px-2 py-0.5 rounded bg-white/10 text-[10px] text-neutral-300 font-mono">${(category.items || []).length} items</span>
            </div>
            <h2 class="font-heading font-black text-xl text-white mt-0.5">${escapeHTML(category.name)}</h2>
          </div>

          <div class="flex items-center gap-2">
            <!-- Add Item directly to this category -->
            <button 
              onclick="openItemModal('add', '${category.id}')" 
              class="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-black border border-amber-500/30 text-xs font-heading font-bold transition-all flex items-center gap-1.5"
            >
              <span>+ Add Item</span>
            </button>

            <!-- Edit Category Details -->
            <button 
              onclick="openCategoryModal('edit', '${category.id}')" 
              class="px-3 py-1.5 rounded-xl bg-[#242424] hover:bg-[#2e2e2e] text-neutral-200 border border-white/5 text-xs font-semibold transition-all"
            >
              ✏️ Rename
            </button>

            <!-- Delete Category -->
            <button 
              onclick="handleDeleteCategory('${category.id}')" 
              class="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 border border-red-500/20 text-xs font-semibold transition-all"
            >
              🗑️
            </button>
          </div>
        </div>

        <!-- Category Items Table -->
        ${itemsTableHTML}
      </div>
    `;
  });

  container.innerHTML = sectionsHTML;
}

function filterCatalogByCategory(catId) {
  selectedCategoryFilter = catId;
  renderCatalogUI();
}

function handleSearchMenu(query) {
  searchQuery = query.trim();
  renderCatalogUI();
}

function toggleItemVisibility(catId, itemId) {
  const cat = currentCatalog.find(c => c.id === catId);
  if (!cat) return;
  const item = cat.items.find(i => i.id === itemId);
  if (!item) return;

  item.hidden = !item.hidden;
  persistCatalogChanges();
  renderCatalogUI();
  showToast(
    item.hidden ? "Dish Hidden" : "Dish Available Online",
    `"${item.name}" is now ${item.hidden ? 'hidden from' : 'shown on'} the live customer storefront.`
  );
}

function handleDeleteItem(catId, itemId) {
  const cat = currentCatalog.find(c => c.id === catId);
  if (!cat) return;
  const itemIndex = cat.items.findIndex(i => i.id === itemId);
  if (itemIndex === -1) return;

  const item = cat.items[itemIndex];
  if (confirm(`Are you sure you want to permanently delete "${item.name}" from the menu catalog?`)) {
    cat.items.splice(itemIndex, 1);
    persistCatalogChanges();
    renderCatalogUI();
    showToast("Dish Removed", `"${item.name}" was permanently deleted from ${cat.name}.`);
  }
}

// Quick Price Modal
function openQuickPriceModal(catId, itemId) {
  const cat = currentCatalog.find(c => c.id === catId);
  if (!cat) return;
  const item = cat.items.find(i => i.id === itemId);
  if (!item) return;

  document.getElementById('modal-quick-price-item-name').textContent = item.name;
  document.getElementById('quick-price-item-id').value = `${catId}:::${itemId}`;
  document.getElementById('quick-price-input').value = item.numPrice !== undefined ? item.numPrice : 0;

  const modal = document.getElementById('modal-quick-price');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeQuickPriceModal() {
  const modal = document.getElementById('modal-quick-price');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function handleSaveQuickPrice(e) {
  e.preventDefault();
  const compoundId = document.getElementById('quick-price-item-id').value;
  const [catId, itemId] = compoundId.split(':::');
  const newNumPrice = parseFloat(document.getElementById('quick-price-input').value);

  if (isNaN(newNumPrice) || newNumPrice < 0) {
    alert("Please enter a valid price amount.");
    return;
  }

  const cat = currentCatalog.find(c => c.id === catId);
  if (!cat) return;
  const item = cat.items.find(i => i.id === itemId);
  if (!item) return;

  item.numPrice = newNumPrice;
  item.price = formatCurrency(newNumPrice);

  persistCatalogChanges();
  closeQuickPriceModal();
  renderCatalogUI();
  showToast("Price Updated", `"${item.name}" updated to ${item.price} (instantly live on menu).`);
}

// Full Item Add / Edit Modal with Multimedia Photo Studio
function openItemModal(mode, preselectCatId, itemId) {
  const modal = document.getElementById('modal-item');
  const title = document.getElementById('modal-item-title');
  const badge = document.getElementById('modal-item-badge');
  const modeInput = document.getElementById('item-form-mode');
  const idInput = document.getElementById('item-form-id');
  const catSelect = document.getElementById('item-form-category');
  const nameInput = document.getElementById('item-form-name');
  const numPriceInput = document.getElementById('item-form-num-price');
  const tagInput = document.getElementById('item-form-tag');
  const descInput = document.getElementById('item-form-desc');
  const imgInput = document.getElementById('item-form-img');
  const previewImg = document.getElementById('item-form-preview-img');
  const hiddenCheckbox = document.getElementById('item-form-hidden');
  const fileInput = document.getElementById('item-form-file');

  if (fileInput) fileInput.value = '';

  let catOptionsHTML = '';
  currentCatalog.forEach(cat => {
    catOptionsHTML += `<option value="${cat.id}">${escapeHTML(cat.name)}</option>`;
  });
  if (catSelect) catSelect.innerHTML = catOptionsHTML;

  if (mode === 'edit' && preselectCatId && itemId) {
    if (title) title.textContent = "Edit Menu Dish";
    if (badge) badge.textContent = "Dish Editor";
    modeInput.value = 'edit';
    idInput.value = `${preselectCatId}:::${itemId}`;

    const cat = currentCatalog.find(c => c.id === preselectCatId);
    const item = cat ? cat.items.find(i => i.id === itemId) : null;
    if (item) {
      if (catSelect) catSelect.value = preselectCatId;
      if (nameInput) nameInput.value = item.name || '';
      if (numPriceInput) numPriceInput.value = item.numPrice !== undefined ? item.numPrice : '';
      if (tagInput) tagInput.value = item.tag || '';
      if (descInput) {
        descInput.value = item.desc || '';
        updateDescCharCount(item.desc || '');
      }
      const initialImg = item.img || './images/burger.jpg';
      if (imgInput) imgInput.value = initialImg;
      if (previewImg) previewImg.src = initialImg;
      if (hiddenCheckbox) hiddenCheckbox.checked = !!item.hidden;
    }
  } else {
    if (title) title.textContent = "Add New Food Dish";
    if (badge) badge.textContent = "Dish Creator";
    modeInput.value = 'add';
    idInput.value = '';

    if (preselectCatId && catSelect) {
      catSelect.value = preselectCatId;
    }
    if (nameInput) nameInput.value = '';
    if (numPriceInput) numPriceInput.value = '';
    if (tagInput) tagInput.value = '';
    if (descInput) {
      descInput.value = '';
      updateDescCharCount('');
    }
    if (imgInput) imgInput.value = './images/burger.jpg';
    if (previewImg) previewImg.src = './images/burger.jpg';
    if (hiddenCheckbox) hiddenCheckbox.checked = false;
  }

  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeItemModal() {
  const modal = document.getElementById('modal-item');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function handleSaveItemSubmit(e) {
  e.preventDefault();
  const mode = document.getElementById('item-form-mode').value;
  const targetCatId = document.getElementById('item-form-category').value;
  const name = document.getElementById('item-form-name').value.trim();
  const numPrice = parseFloat(document.getElementById('item-form-num-price').value);
  const tag = document.getElementById('item-form-tag').value.trim();
  const desc = document.getElementById('item-form-desc').value.trim();
  const img = document.getElementById('item-form-img').value.trim() || './images/burger.jpg';
  const hidden = document.getElementById('item-form-hidden').checked;

  if (!name || isNaN(numPrice)) {
    alert("Please fill in the dish name and a valid price.");
    return;
  }

  const formattedPrice = formatCurrency(numPrice);

  if (mode === 'edit') {
    const compoundId = document.getElementById('item-form-id').value;
    const [origCatId, itemId] = compoundId.split(':::');

    const origCat = currentCatalog.find(c => c.id === origCatId);
    if (!origCat) return;
    const itemIdx = origCat.items.findIndex(i => i.id === itemId);
    if (itemIdx === -1) return;

    const existingItem = origCat.items[itemIdx];
    existingItem.name = name;
    existingItem.numPrice = numPrice;
    existingItem.price = formattedPrice;
    existingItem.tag = tag;
    existingItem.desc = desc;
    existingItem.img = img;
    existingItem.hidden = hidden;

    if (origCatId !== targetCatId) {
      const [movedItem] = origCat.items.splice(itemIdx, 1);
      const newCat = currentCatalog.find(c => c.id === targetCatId);
      if (newCat) {
        if (!newCat.items) newCat.items = [];
        newCat.items.push(movedItem);
      }
    }

    persistCatalogChanges();
    showToast("Dish Updated", `Changes to "${name}" saved and published to live menu.`);
  } else {
    const targetCat = currentCatalog.find(c => c.id === targetCatId);
    if (!targetCat) return;

    const newItemId = 'dish-' + Date.now();
    const newItem = {
      id: newItemId,
      name: name,
      price: formattedPrice,
      numPrice: numPrice,
      desc: desc,
      img: img,
      tag: tag || undefined,
      hidden: hidden,
      options: {}
    };

    if (!targetCat.items) targetCat.items = [];
    targetCat.items.push(newItem);

    persistCatalogChanges();
    showToast("New Dish Added", `"${name}" added to ${targetCat.name} and published live.`);
  }

  closeItemModal();
  renderCatalogUI();
}

// Category CRUD Actions
function openCategoryModal(mode, catId) {
  const modal = document.getElementById('modal-category');
  const title = document.getElementById('modal-category-title');
  const modeInput = document.getElementById('category-form-mode');
  const origIdInput = document.getElementById('category-form-orig-id');
  const nameInput = document.getElementById('category-form-name');
  const badgeInput = document.getElementById('category-form-badge');
  const idInput = document.getElementById('category-form-id');

  if (mode === 'edit' && catId) {
    title.textContent = "Edit Category";
    modeInput.value = 'edit';
    origIdInput.value = catId;

    const cat = currentCatalog.find(c => c.id === catId);
    if (cat) {
      nameInput.value = cat.name || '';
      badgeInput.value = cat.badge || '';
      idInput.value = cat.id || '';
    }
  } else {
    title.textContent = "Add New Category";
    modeInput.value = 'add';
    origIdInput.value = '';
    nameInput.value = '';
    badgeInput.value = 'Chef Special';
    idInput.value = '';
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeCategoryModal() {
  const modal = document.getElementById('modal-category');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function handleSaveCategorySubmit(e) {
  e.preventDefault();
  const mode = document.getElementById('category-form-mode').value;
  const name = document.getElementById('category-form-name').value.trim();
  const badge = document.getElementById('category-form-badge').value.trim();
  let slug = document.getElementById('category-form-id').value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');

  if (!name || !slug) {
    alert("Please enter a category name and slug.");
    return;
  }

  if (mode === 'edit') {
    const origId = document.getElementById('category-form-orig-id').value;
    const cat = currentCatalog.find(c => c.id === origId);
    if (cat) {
      cat.name = name;
      cat.badge = badge;
      cat.id = slug;
      showToast("Category Updated", `Renamed to "${name}".`);
    }
  } else {
    if (currentCatalog.some(c => c.id === slug)) {
      slug = slug + '-' + Date.now();
    }

    currentCatalog.push({
      id: slug,
      name: name,
      badge: badge,
      items: []
    });

    showToast("Category Created", `"${name}" added to menu catalog.`);
  }

  persistCatalogChanges();
  closeCategoryModal();
  renderCatalogUI();
}

function handleDeleteCategory(catId) {
  const cat = currentCatalog.find(c => c.id === catId);
  if (!cat) return;

  const itemCount = (cat.items || []).length;
  const promptMsg = itemCount > 0 
    ? `Warning: "${cat.name}" has ${itemCount} food item(s). Deleting this category will delete all items inside it. Continue?`
    : `Are you sure you want to delete category "${cat.name}"?`;

  if (confirm(promptMsg)) {
    currentCatalog = currentCatalog.filter(c => c.id !== catId);
    if (selectedCategoryFilter === catId) {
      selectedCategoryFilter = 'all';
    }
    persistCatalogChanges();
    renderCatalogUI();
    showToast("Category Removed", `"${cat.name}" has been deleted.`);
  }
}

// ----------------------------------------------------------
// 7. System Settings & JSON Backup / Export / Import
// ----------------------------------------------------------
function handleExportSystemBackup() {
  const backupData = {
    exportDate: new Date().toISOString(),
    store: "Mr. Cook - Rawalpindi",
    branding: window.MrCookTheme ? window.MrCookTheme.getSettings() : currentBrandSettings,
    catalog: currentCatalog,
    staff: currentStaff,
    orders: JSON.parse(localStorage.getItem('mr_cook_all_orders') || '[]')
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
  const downloadAnchor = document.createElement('a');
  const filename = `mr_cook_backup_${new Date().toISOString().slice(0, 10)}.json`;
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  showToast("Backup Exported 💾", `Saved ${filename} with full store state.`);
}

function handleImportSystemBackup(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (imported.branding) {
        localStorage.setItem('mr_cook_brand_settings', JSON.stringify(imported.branding));
      }
      if (imported.catalog && Array.isArray(imported.catalog)) {
        localStorage.setItem('mr_cook_menu_catalog', JSON.stringify(imported.catalog));
        currentCatalog = imported.catalog;
      }
      if (imported.staff && Array.isArray(imported.staff)) {
        localStorage.setItem('mr_cook_staff_directory', JSON.stringify(imported.staff));
        currentStaff = imported.staff;
      }
      if (imported.orders && Array.isArray(imported.orders)) {
        localStorage.setItem('mr_cook_all_orders', JSON.stringify(imported.orders));
      }

      loadBrandSettingsIntoForm();
      loadCatalogData();
      loadStaffData();
      renderSalesAnalyticsDashboard();
      renderCatalogUI();
      renderStaffDirectory();

      showToast("Backup Restored! 🚀", "Store branding, menu catalog, staff, and orders successfully restored.");
    } catch (err) {
      alert("Invalid JSON backup file format.");
    }
  };
  reader.readAsText(file);
}

function handleClearOrdersHistory() {
  if (confirm("⚠️ CLEAR ORDER HISTORY?\n\nThis will clear all past orders and reset the active order tracker. Menu catalog and branding will remain safe.")) {
    localStorage.removeItem('mr_cook_all_orders');
    localStorage.removeItem('mr_cook_active_order');
    renderSalesAnalyticsDashboard();
    showToast("Orders Cleared", "Order history and active dispatch pipeline have been reset.");
  }
}

// ----------------------------------------------------------
// 8. Global Actions (Save All Changes & Reset to Default)
// ----------------------------------------------------------
function handleSaveAllAdminChanges() {
  // 1. Gather all branding values from form
  currentBrandSettings.storeName = document.getElementById('brand-store-name-input')?.value.trim() || 'Mr. Cook';
  currentBrandSettings.tagline = document.getElementById('brand-tagline-input')?.value.trim() || 'Fast Food & Legacy Flavors';
  currentBrandSettings.branchName = document.getElementById('brand-branch-input')?.value.trim() || 'Westridge III, Rawalpindi';
  currentBrandSettings.locationTag = document.getElementById('brand-location-input')?.value.trim() || 'Pakistan';
  currentBrandSettings.phone = document.getElementById('brand-phone-input')?.value.trim() || '03144108033';
  currentBrandSettings.whatsapp = document.getElementById('brand-whatsapp-input')?.value.trim() || '03144108033';
  
  const fee = parseFloat(document.getElementById('brand-delivery-fee-input')?.value);
  currentBrandSettings.deliveryFee = isNaN(fee) ? 150 : fee;
  currentBrandSettings.estimatedDelivery = document.getElementById('brand-delivery-time-input')?.value.trim() || '30-45 Mins';
  currentBrandSettings.fullAddress = document.getElementById('brand-address-input')?.value.trim() || 'Main Peshawar Road, Westridge III, Rawalpindi, Pakistan';

  const cp1 = document.getElementById('color-picker-primary');
  const cp2 = document.getElementById('color-picker-secondary');
  if (cp1) currentBrandSettings.primaryColor = cp1.value;
  if (cp2) currentBrandSettings.secondaryColor = cp2.value;

  // 2. Save branding & apply theme
  if (window.MrCookTheme) {
    window.MrCookTheme.saveSettings(currentBrandSettings);
  } else {
    localStorage.setItem('mr_cook_brand_settings', JSON.stringify(currentBrandSettings));
  }

  // 3. Save Menu Catalog
  try {
    localStorage.setItem('mr_cook_menu_catalog', JSON.stringify(currentCatalog));
    window.dispatchEvent(new CustomEvent('mr_cook_catalog_updated'));
  } catch (e) {
    console.error("Error saving catalog:", e);
  }

  // 4. Save Staff Directory
  saveStaffData();

  // 5. Refresh Sales Dashboard
  renderSalesAnalyticsDashboard();

  // 6. Feedback
  showToast("All Changes Published! 🚀", "Sales metrics, staff directory, store branding, and menu catalog saved storewide.");
}

function handleResetToDefaultWithConfirm() {
  const confirmed = confirm(
    "⚠️ RESET FACTORY DEFAULTS?\n\nAre you sure you want to reset all store branding, theme colors, staff directory, and the menu catalog back to original defaults?\n\nAny custom items, staff members, or modified prices will be restored to factory data."
  );

  if (!confirmed) return;

  // 1. Reset branding
  if (window.MrCookTheme) {
    window.MrCookTheme.resetSettings();
  } else {
    localStorage.removeItem('mr_cook_brand_settings');
  }

  // 2. Reset catalog
  localStorage.removeItem('mr_cook_menu_catalog');

  // 3. Reset staff
  localStorage.removeItem('mr_cook_staff_directory');

  // 4. Reload state
  loadBrandSettingsIntoForm();
  loadCatalogData();
  loadStaffData();
  selectedCategoryFilter = 'all';
  searchQuery = '';
  staffSearchQuery = '';
  selectedStaffRoleFilter = 'all';

  const searchInput = document.getElementById('admin-search-input');
  if (searchInput) searchInput.value = '';

  renderSalesAnalyticsDashboard();
  renderCatalogUI();
  renderStaffDirectory();

  showToast("Factory Defaults Restored ↺", "All store branding, staff directory, and official menu restored to original.");
}

// ----------------------------------------------------------
// 9. Toast Notification Helper
// ----------------------------------------------------------
let toastTimeout = null;
function showToast(title, message) {
  const toast = document.getElementById('admin-toast');
  const titleEl = document.getElementById('admin-toast-title');
  const msgEl = document.getElementById('admin-toast-message');

  if (!toast) return;

  if (titleEl) titleEl.textContent = title;
  if (msgEl) msgEl.textContent = message;

  toast.classList.remove('hidden');
  toast.classList.add('flex', 'animate-in', 'fade-in', 'slide-in-from-top-4');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
    toast.classList.remove('flex');
  }, 3500);
}
