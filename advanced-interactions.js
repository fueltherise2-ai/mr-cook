// ==========================================================
// Mr. Cook - Advanced Interactions & High-End FX Engine
// 1. 3D Tilt & Perspective Hover with Specular Light Flares
// 2. Floating Background Elements & Mouse Parallax
// 3. Liquid Ripple Feedback on Clicks
// 4. Skeleton Shimmer Loading Generator
// 5. Smooth Category Gliding Transitions
// ==========================================================

const MrCookFX = {
  // ----------------------------------------------------------
  // 1. 3D Tilt & Perspective Hover Effect
  // ----------------------------------------------------------
  init3DTilt(root = document) {
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
      return; // Do not apply on touch-only mobile devices to preserve native touch scrolling
    }

    const cards = root.querySelectorAll('.food-card, .deal-card, .hover-elevate-card, .tilt-card');

    cards.forEach(card => {
      if (card._has3DTilt) return;
      card._has3DTilt = true;

      let rafId = null;
      let targetX = 0;
      let targetY = 0;
      const maxTilt = 8.5; // Optimal degree for crisp luxury feel without text distortion

      function applyTilt() {
        card.style.transform = `perspective(1000px) rotateX(${targetX.toFixed(2)}deg) rotateY(${targetY.toFixed(2)}deg) translate3d(0, -6px, 0) scale3d(1.018, 1.018, 1.018)`;
        rafId = null;
      }

      card.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'touch') return;
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;

        targetX = (0.5 - py) * maxTilt;
        targetY = (px - 0.5) * maxTilt;

        // Specular dynamic light glare coordinates
        card.style.setProperty('--glare-x', `${(px * 100).toFixed(1)}%`);
        card.style.setProperty('--glare-y', `${(py * 100).toFixed(1)}%`);
        card.style.setProperty('--glare-opacity', '0.22');

        if (!rafId) {
          rafId = requestAnimationFrame(applyTilt);
        }
      }, { passive: true });

      card.addEventListener('pointerleave', () => {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease';
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0) scale3d(1, 1, 1)';
        card.style.setProperty('--glare-opacity', '0');

        setTimeout(() => {
          card.style.transition = '';
        }, 500);
      });

      card.addEventListener('pointerenter', () => {
        card.style.transition = 'none';
      });
    });
  },

  // ----------------------------------------------------------
  // 2. Liquid Ripple Feedback on Clicks
  // ----------------------------------------------------------
  initLiquidRipple() {
    if (this._rippleInitialized) return;
    this._rippleInitialized = true;

    document.addEventListener('pointerdown', (e) => {
      // Find eligible clickable elements
      const target = e.target.closest('button, .btn-ripple, .sidebar-link, .mobile-cat-pill, #explore-menu-btn, .header-cart-btn, #header-cart-btn, a[href*="menu.html"], .food-card button');
      if (!target) return;

      // Prevent attaching multiple waves if already busy
      if (!target.classList.contains('btn-ripple-container')) {
        target.classList.add('btn-ripple-container');
      }

      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const size = Math.max(rect.width, rect.height) * 2.2;

      const ripple = document.createElement('span');
      ripple.className = 'liquid-ripple-wave';
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${x - size / 2}px`;
      ripple.style.top = `${y - size / 2}px`;

      target.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 650);
    }, { passive: true });
  },

  // ----------------------------------------------------------
  // 3. Hero Mouse Parallax Effect
  // ----------------------------------------------------------
  initHeroParallax() {
    const heroSection = document.getElementById('home');
    if (!heroSection) return;

    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

    const layers = heroSection.querySelectorAll('.parallax-layer');
    if (layers.length === 0) return;

    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;
    let isTicking = false;

    heroSection.addEventListener('pointermove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      mouseX = (e.clientX - rect.left - rect.width / 2);
      mouseY = (e.clientY - rect.top - rect.height / 2);

      if (!isTicking) {
        isTicking = true;
        requestAnimationFrame(renderParallax);
      }
    }, { passive: true });

    function renderParallax() {
      currentX += (mouseX - currentX) * 0.07;
      currentY += (mouseY - currentY) * 0.07;

      layers.forEach(layer => {
        const depth = parseFloat(layer.getAttribute('data-depth')) || 0.03;
        const x = currentX * depth;
        const y = currentY * depth;
        layer.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      });

      if (Math.abs(mouseX - currentX) > 0.4 || Math.abs(mouseY - currentY) > 0.4) {
        requestAnimationFrame(renderParallax);
      } else {
        isTicking = false;
      }
    }

    heroSection.addEventListener('pointerleave', () => {
      mouseX = 0;
      mouseY = 0;
      if (!isTicking) {
        isTicking = true;
        requestAnimationFrame(renderParallax);
      }
    });
  },

  // ----------------------------------------------------------
  // 4. Skeleton Shimmer Loading Generator
  // ----------------------------------------------------------
  renderMenuSkeletons(container, count = 8) {
    if (!container) return;

    let html = `
      <div class="menu-skeleton-grid grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 items-stretch mb-12">
    `;

    for (let i = 0; i < count; i++) {
      html += `
        <div class="food-card bg-[#1b1b1b] border border-white/5 rounded-2xl overflow-hidden flex flex-col pointer-events-none p-0">
          <!-- Thumbnail shimmer -->
          <div class="h-28 sm:h-32 w-full skeleton-shimmer bg-white/[0.04]"></div>
          
          <!-- Content shimmer -->
          <div class="p-3 sm:p-3.5 flex-1 flex flex-col justify-between space-y-3">
            <div class="space-y-2">
              <div class="h-3.5 w-3/4 rounded-md skeleton-shimmer bg-white/[0.08]"></div>
              <div class="h-2.5 w-full rounded skeleton-shimmer bg-white/[0.04]"></div>
              <div class="h-2.5 w-4/5 rounded skeleton-shimmer bg-white/[0.04]"></div>
            </div>
            <div class="pt-2 border-t border-white/5 space-y-2">
              <div class="flex justify-between items-center">
                <div class="h-2.5 w-8 rounded skeleton-shimmer bg-white/[0.04]"></div>
                <div class="h-3.5 w-16 rounded skeleton-shimmer bg-amber-500/20"></div>
              </div>
              <div class="h-8 w-full rounded-xl skeleton-shimmer bg-white/[0.05]"></div>
            </div>
          </div>
        </div>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;
  },

  // ----------------------------------------------------------
  // 5. Smooth Category Gliding Transitions
  // ----------------------------------------------------------
  initCategoryGliding() {
    const categoryLinks = document.querySelectorAll('.sidebar-link, .mobile-cat-pill');

    categoryLinks.forEach(link => {
      if (link._hasGlideListener) return;
      link._hasGlideListener = true;

      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('data-target') || link.getAttribute('href')?.replace('#', '');
        if (!targetId) return;

        const targetSection = document.getElementById(targetId);
        if (!targetSection) return;

        e.preventDefault();

        // 1. Cross-fade & fluid slide glide on target section
        targetSection.classList.remove('category-gliding');
        void targetSection.offsetWidth; // Force reflow
        targetSection.classList.add('category-gliding');

        // 2. Smoothly scroll with fixed header clearance
        const headerOffset = 100;
        const elementPosition = targetSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        // 3. Smoothly center mobile pills on mobile viewports
        if (link.classList.contains('mobile-cat-pill')) {
          link.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      });
    });
  }
};

// Auto-initialize base FX when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  MrCookFX.initLiquidRipple();
  MrCookFX.init3DTilt();
  MrCookFX.initHeroParallax();
  MrCookFX.initCategoryGliding();
});

window.MrCookFX = MrCookFX;
