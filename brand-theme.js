// ==========================================================
// Mr. Cook - Centralized Brand & Theme Engine
// Handles dynamic theme colors, store branding, and custom logo injection
// ==========================================================

const MR_COOK_DEFAULT_BRAND = {
  storeName: "Mr. Cook",
  tagline: "Fast Food & Legacy Flavors",
  branchName: "Westridge III, Rawalpindi",
  locationTag: "Pakistan",
  fullAddress: "Main Peshawar Road, Westridge III, Rawalpindi, Pakistan",
  phone: "03144108033",
  whatsapp: "03144108033",
  deliveryFee: 150,
  estimatedDelivery: "30-45 Mins",
  primaryColor: "#f59e0b",   // warm amber/gold
  secondaryColor: "#f97316", // flame orange
  logoType: "default",       // "default" or "custom"
  customLogoUrl: ""          // Data URL or image path
};

const MrCookTheme = {
  getSettings() {
    try {
      const stored = localStorage.getItem('mr_cook_brand_settings');
      if (stored) {
        return Object.assign({}, MR_COOK_DEFAULT_BRAND, JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Error reading mr_cook_brand_settings:', e);
    }
    return Object.assign({}, MR_COOK_DEFAULT_BRAND);
  },

  saveSettings(settings) {
    try {
      const merged = Object.assign({}, this.getSettings(), settings);
      localStorage.setItem('mr_cook_brand_settings', JSON.stringify(merged));
      this.applyTheme(merged);
      // Dispatch custom event for current window
      window.dispatchEvent(new CustomEvent('mr_cook_brand_updated', { detail: merged }));
      return true;
    } catch (e) {
      console.error('Error saving mr_cook_brand_settings:', e);
      return false;
    }
  },

  resetSettings() {
    try {
      localStorage.removeItem('mr_cook_brand_settings');
      this.applyTheme(MR_COOK_DEFAULT_BRAND);
      window.dispatchEvent(new CustomEvent('mr_cook_brand_updated', { detail: MR_COOK_DEFAULT_BRAND }));
      return true;
    } catch (e) {
      console.error('Error resetting brand settings:', e);
      return false;
    }
  },

  hexToRgb(hex) {
    let cleanHex = hex.replace('#', '').trim();
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map(c => c + c).join('');
    }
    const num = parseInt(cleanHex, 16);
    if (isNaN(num) || cleanHex.length !== 6) return [245, 158, 11];
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  },

  applyTheme(customSettings) {
    const settings = customSettings || this.getSettings();
    const primary = settings.primaryColor || MR_COOK_DEFAULT_BRAND.primaryColor;
    const secondary = settings.secondaryColor || MR_COOK_DEFAULT_BRAND.secondaryColor;
    const [r1, g1, b1] = this.hexToRgb(primary);
    const [r2, g2, b2] = this.hexToRgb(secondary);

    // 1. Inject or update CSS stylesheet
    let styleEl = document.getElementById('mr-cook-dynamic-brand-styles');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'mr-cook-dynamic-brand-styles';
      document.head.appendChild(styleEl);
    }

    styleEl.textContent = `
      :root {
        --brand-primary: ${primary};
        --brand-secondary: ${secondary};
        --brand-primary-rgb: ${r1}, ${g1}, ${b1};
        --brand-secondary-rgb: ${r2}, ${g2}, ${b2};
      }

      /* Core Dynamic Colors across Tailwind components */
      .bg-amber-500, .bg-amber-600 {
        background-color: var(--brand-primary) !important;
      }
      .bg-amber-500\\/10 {
        background-color: rgba(var(--brand-primary-rgb), 0.1) !important;
      }
      .bg-amber-500\\/20 {
        background-color: rgba(var(--brand-primary-rgb), 0.2) !important;
      }
      .text-amber-400, .text-amber-500 {
        color: var(--brand-primary) !important;
      }
      .text-amber-300 {
        color: var(--brand-primary) !important;
      }
      .border-amber-500,
      .border-amber-500\\/20,
      .border-amber-500\\/30,
      .border-amber-500\\/40,
      .border-amber-500\\/60 {
        border-color: var(--brand-primary) !important;
      }
      .hover\\:bg-amber-500:hover, .hover\\:bg-amber-600:hover {
        background-color: var(--brand-primary) !important;
      }
      .hover\\:text-amber-400:hover, .hover\\:text-amber-500:hover {
        color: var(--brand-primary) !important;
      }
      .hover\\:border-amber-500:hover, .hover\\:border-amber-500\\/40:hover, .hover\\:border-amber-500\\/60:hover {
        border-color: var(--brand-primary) !important;
      }
      .from-amber-500, .from-amber-600 {
        --tw-gradient-from: var(--brand-primary) var(--tw-gradient-from-position) !important;
      }
      .to-orange-500, .to-orange-600, .to-amber-700 {
        --tw-gradient-to: var(--brand-secondary) var(--tw-gradient-to-position) !important;
      }
      .via-amber-500 {
        --tw-gradient-stops: var(--tw-gradient-from), var(--brand-primary) var(--tw-gradient-via-position), var(--tw-gradient-to) !important;
      }
      .active-cat, .active-pill {
        background-color: var(--brand-primary) !important;
        color: #000000 !important;
      }
      .shadow-glow-amber {
        box-shadow: 0 0 25px -4px rgba(var(--brand-primary-rgb), 0.45) !important;
      }
      .shadow-amber-500\\/20 {
        box-shadow: 0 10px 15px -3px rgba(var(--brand-primary-rgb), 0.2) !important;
      }
      .selection\\:bg-amber-500 *::selection,
      ::selection {
        background-color: var(--brand-primary) !important;
        color: #000000 !important;
      }
      .dynamic-brand-btn {
        background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary)) !important;
        color: #000000 !important;
      }
    `;

    // 2. Update Brand Name, Location and Logo across DOM
    if (document.body) {
      this.updateDOMTextAndLogos(settings);
    }
  },

  updateDOMTextAndLogos(settings) {
    if (!settings) settings = this.getSettings();

    // 1. Update text elements explicitly tagged with .brand-text-name
    document.querySelectorAll('.brand-text-name').forEach(el => {
      el.textContent = settings.storeName || "Mr. Cook";
    });

    // 2. Update text elements explicitly tagged with .brand-text-location
    document.querySelectorAll('.brand-text-location').forEach(el => {
      el.textContent = settings.locationTag || "Pakistan";
    });

    // 3. Update telephone links
    if (settings.phone) {
      document.querySelectorAll('a[href^="tel:"]').forEach(a => {
        a.href = `tel:${settings.phone}`;
        const span = a.querySelector('span');
        if (span) {
          if (span.textContent.includes('For Assistance:')) {
            span.textContent = `For Assistance: ${settings.phone}`;
          } else if (span.textContent.includes('For Help:')) {
            span.textContent = `For Assistance: ${settings.phone}`;
          } else if (span.textContent.match(/0314\d{7}/)) {
            span.textContent = settings.phone;
          }
        } else if (a.textContent.includes('For Assistance:')) {
          a.textContent = `For Assistance: ${settings.phone}`;
        } else if (a.textContent.includes('For Help:')) {
          a.textContent = `For Assistance: ${settings.phone}`;
        } else if (a.textContent.trim().match(/^0314\d{7}$/)) {
          a.textContent = settings.phone;
        }
      });
    }

    // 4. Update Header Logo Trigger text if default
    const headerLogoLinks = document.querySelectorAll('.header-logo-trigger, header a[href*="index.html"]');
    headerLogoLinks.forEach(link => {
      // Find the text container
      const nameSpans = link.querySelectorAll('span');
      nameSpans.forEach(span => {
        const txt = span.textContent.trim();
        // If it's the brand title
        if (txt === 'Mr. Cook' || span.classList.contains('font-black')) {
          span.textContent = settings.storeName;
        } else if (txt === 'Pakistan' || span.classList.contains('tracking-widest')) {
          span.textContent = settings.locationTag;
        }
      });

      // Custom Logo Icon Replacement
      const logoIconContainer = link.querySelector('div.w-full.h-full, .brand-logo-container');
      if (logoIconContainer) {
        if (settings.logoType === 'custom' && settings.customLogoUrl) {
          logoIconContainer.innerHTML = `<img src="${settings.customLogoUrl}" alt="${settings.storeName}" class="w-full h-full object-cover rounded-[14px]" />`;
        } else {
          // Restore default SVG if it was replaced with custom image
          if (logoIconContainer.querySelector('img')) {
            logoIconContainer.innerHTML = `
              <svg class="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/>
                <line x1="6" y1="17" x2="18" y2="17"/>
              </svg>
            `;
          }
        }
      }
    });
  }
};

// Immediate execution to prevent theme flash
MrCookTheme.applyTheme();

// Re-apply once DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    MrCookTheme.applyTheme();
  });
} else {
  MrCookTheme.applyTheme();
}

// Listen for updates from other tabs
window.addEventListener('storage', (e) => {
  if (e.key === 'mr_cook_brand_settings') {
    MrCookTheme.applyTheme();
  }
});

// Export globally
window.MrCookTheme = MrCookTheme;
window.MR_COOK_DEFAULT_BRAND = MR_COOK_DEFAULT_BRAND;
