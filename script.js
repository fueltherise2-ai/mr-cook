// ==========================================================
// Mr. Cook - Landing Page Interactive Script
// Location: Pakistan
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initScrollSpy();
  initExploreMenuButton();
});

// State for active order item
let currentOrder = {
  itemName: "The Westridge Double Smash",
  price: 850
};

// ----------------------------------------------------------
// 1. Mobile Menu Drawer Toggle
// ----------------------------------------------------------
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const hamburgerIcon = document.getElementById('hamburger-icon');
  const closeIcon = document.getElementById('close-icon');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (!menuBtn || !mobileMenu) return;

  function toggleMenu() {
    const isExpanded = !mobileMenu.classList.contains('hidden');
    if (isExpanded) {
      mobileMenu.classList.add('hidden');
      mobileMenu.classList.remove('drawer-slide-down');
      hamburgerIcon.classList.remove('hidden');
      closeIcon.classList.add('hidden');
    } else {
      mobileMenu.classList.remove('hidden');
      mobileMenu.classList.remove('drawer-slide-down');
      void mobileMenu.offsetWidth; // Force reflow for smooth animation
      mobileMenu.classList.add('drawer-slide-down');
      hamburgerIcon.classList.add('hidden');
      closeIcon.classList.remove('hidden');
    }
  }

  menuBtn.addEventListener('click', toggleMenu);

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      mobileMenu.classList.remove('drawer-slide-down');
      hamburgerIcon.classList.remove('hidden');
      closeIcon.classList.add('hidden');
    });
  });
}

// ----------------------------------------------------------
// 2. Explore Menu Button
// ----------------------------------------------------------
function initExploreMenuButton() {
  // Let the Explore Menu button navigate directly to menu.html as requested
}

// ----------------------------------------------------------
// 3. ScrollSpy for Active Nav Link
// ----------------------------------------------------------
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('header nav a.nav-link');

  window.addEventListener('scroll', () => {
    let scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active', 'text-amber-400');
          link.classList.add('text-neutral-300');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active', 'text-amber-400');
            link.classList.remove('text-neutral-300');
          }
        });
      }
    });
  });
}

// ----------------------------------------------------------
// 4. Modal Item Selection Handler
// ----------------------------------------------------------
function handleItemSelect(selectEl) {
  const selectedOption = selectEl.options[selectEl.selectedIndex];
  currentOrder.itemName = selectedOption.value;
  currentOrder.price = parseInt(selectedOption.getAttribute('data-price'), 10) || 850;

  const nameEl = document.getElementById('selected-item-name');
  const priceEl = document.getElementById('selected-item-price');
  if (nameEl) nameEl.textContent = currentOrder.itemName;
  if (priceEl) priceEl.textContent = `Rs. ${currentOrder.price}`;
}

// ----------------------------------------------------------
// 5. Order Modal Handlers
// ----------------------------------------------------------
function openOrderModal(itemName = null, price = null) {
  if (itemName && price) {
    currentOrder.itemName = itemName;
    currentOrder.price = price;
    
    // Select in dropdown if exists
    const selectEl = document.getElementById('item-select');
    if (selectEl) {
      for (let i = 0; i < selectEl.options.length; i++) {
        if (selectEl.options[i].value === itemName) {
          selectEl.selectedIndex = i;
          break;
        }
      }
    }
  }

  const nameEl = document.getElementById('selected-item-name');
  const priceEl = document.getElementById('selected-item-price');
  if (nameEl) nameEl.textContent = currentOrder.itemName;
  if (priceEl) priceEl.textContent = `Rs. ${currentOrder.price}`;

  const modal = document.getElementById('order-modal');
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

function closeOrderModal() {
  const modal = document.getElementById('order-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex', 'modal-overlay-enter');
    const dialog = modal.querySelector('div');
    if (dialog) dialog.classList.remove('modal-dialog-enter');
    document.body.style.overflow = '';
  }
}

// Close modal on escape or background click
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeOrderModal();
});

document.addEventListener('click', (e) => {
  const modal = document.getElementById('order-modal');
  if (e.target === modal) closeOrderModal();
});

// ----------------------------------------------------------
// 6. Toast Notification
// ----------------------------------------------------------
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.remove('translate-y-24', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');

  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-24', 'opacity-0');
  }, 3200);
}

// ----------------------------------------------------------
// 7. WhatsApp Order Submission
// ----------------------------------------------------------
function handleOrderSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('cust-name').value.trim();
  const address = document.getElementById('cust-address').value.trim();
  const notes = document.getElementById('cust-notes').value.trim();

  // Save customer info for seamless reordering
  if (name) localStorage.setItem('mr_cook_customer_name', name);
  if (address) localStorage.setItem('mr_cook_customer_address', address);

  const message = `🍔 *NEW ORDER FOR MR. COOK*\n` +
    `---------------------------------------\n` +
    `👤 *Customer:* ${name}\n` +
    `📍 *Delivery Address:* ${address}\n` +
    `🍽️ *Food Item:* ${currentOrder.itemName}\n` +
    `💰 *Price:* Rs. ${currentOrder.price}\n` +
    (notes ? `📝 *Special Notes:* ${notes}\n` : '') +
    `---------------------------------------\n` +
    `*Taste the Legacy of Rawalpindi!*`;

  // WhatsApp number
  const phone = "923144108033";
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  window.open(whatsappUrl, '_blank');
  closeOrderModal();
  showToast("Order placed successfully! 🚀");
}
