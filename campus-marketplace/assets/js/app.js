/**
 * Campus Marketplace — App JavaScript
 * Handles: tabs, modals, form validation, cart, toasts, messaging
 */

/* ============================================================
   CART STATE
   ============================================================ */
const Cart = {
  items: JSON.parse(sessionStorage.getItem('cm_cart') || '[]'),
  save() { sessionStorage.setItem('cm_cart', JSON.stringify(this.items)); },
  add(item) {
    if (this.items.find(i => i.id === item.id)) {
      Toast.show('This item is already in your cart.', 'warning'); return;
    }
    this.items.push(item);
    this.save();
    this.updateBadge();
    Toast.show('Item added to cart!', 'success');
  },
  remove(id) {
    this.items = this.items.filter(i => i.id !== id);
    this.save();
    this.updateBadge();
  },
  clear() { this.items = []; this.save(); this.updateBadge(); },
  total() { return this.items.reduce((s, i) => s + parseFloat(i.price), 0); },
  updateBadge() {
    document.querySelectorAll('.cm-cart-badge').forEach(b => {
      b.textContent = this.items.length;
      b.style.display = this.items.length ? 'flex' : 'none';
    });
  }
};

/* ============================================================
   TOAST
   ============================================================ */
const Toast = {
  container: null,
  init() {
    if (!document.getElementById('cm-toast-container')) {
      this.container = document.createElement('div');
      this.container.id = 'cm-toast-container';
      document.body.appendChild(this.container);
    } else {
      this.container = document.getElementById('cm-toast-container');
    }
  },
  show(msg, type = 'default', duration = 3200) {
    if (!this.container) this.init();
    const icons = { success: '✓', error: '✕', warning: '⚠', default: 'ℹ' };
    const t = document.createElement('div');
    t.className = `cm-toast cm-toast--${type}`;
    t.innerHTML = `<span>${icons[type] || icons.default}</span><span>${msg}</span>`;
    this.container.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, duration);
  }
};

/* ============================================================
   MODAL
   ============================================================ */
const Modal = {
  open(id) {
    const el = document.getElementById(id);
    if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; }
  },
  close(id) {
    const el = document.getElementById(id);
    if (el) { el.classList.remove('open'); document.body.style.overflow = ''; }
  },
  closeAll() {
    document.querySelectorAll('.cm-overlay.open').forEach(o => {
      o.classList.remove('open');
    });
    document.body.style.overflow = '';
  }
};

/* ============================================================
   TABS
   ============================================================ */
function initTabs() {
  document.querySelectorAll('[data-tab-group]').forEach(group => {
    const groupId = group.getAttribute('data-tab-group');
    group.querySelectorAll('[data-tab]').forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-tab');
        // Deactivate all tabs in group
        group.querySelectorAll('[data-tab]').forEach(t => t.classList.remove('cm-tab--active'));
        tab.classList.add('cm-tab--active');
        // Switch content
        document.querySelectorAll(`[data-tab-content="${groupId}"]`).forEach(c => {
          c.classList.toggle('cm-tab-content--active', c.getAttribute('data-tab-id') === target);
        });
      });
    });
  });
}

/* ============================================================
   FORM VALIDATION
   ============================================================ */
const Validator = {
  required: v => v.trim().length > 0,
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  wsuEmail: v => /^[^\s@]+@(wsu\.edu|email\.wsu\.edu|vet\.wsu\.edu)$/.test(v),
  minLen: (v, n) => v.length >= n,
  positiveNum: v => parseFloat(v) > 0,
  match: (v, v2) => v === v2,

  showError(input, msg) {
    input.classList.add('cm-form__input--error');
    let err = input.nextElementSibling;
    if (!err || !err.classList.contains('cm-form__error')) {
      err = document.createElement('p');
      err.className = 'cm-form__error';
      input.parentNode.insertBefore(err, input.nextSibling);
    }
    err.textContent = msg;
    err.classList.add('show');
  },
  clearError(input) {
    input.classList.remove('cm-form__input--error');
    const err = input.nextElementSibling;
    if (err && err.classList.contains('cm-form__error')) err.classList.remove('show');
  },
  clearAll(form) {
    form.querySelectorAll('.cm-form__input--error').forEach(i => this.clearError(i));
  }
};

/* ============================================================
   REGISTRATION FORM (UC-B01)
   ============================================================ */
function initRegisterForm() {
  const form = document.getElementById('register-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    Validator.clearAll(form);
    let valid = true;
    const email = form.querySelector('#reg-email');
    const name  = form.querySelector('#reg-name');
    const pwd   = form.querySelector('#reg-pwd');
    const pwd2  = form.querySelector('#reg-pwd2');

    if (!Validator.required(email.value)) { Validator.showError(email, 'Email is required.'); valid = false; }
    else if (!Validator.wsuEmail(email.value)) { Validator.showError(email, 'Only WSU email addresses are permitted (e.g., name@wsu.edu).'); valid = false; }

    if (!Validator.required(name.value)) { Validator.showError(name, 'Display name is required.'); valid = false; }

    if (!Validator.required(pwd.value)) { Validator.showError(pwd, 'Password is required.'); valid = false; }
    else if (!Validator.minLen(pwd.value, 8)) { Validator.showError(pwd, 'Password must be at least 8 characters.'); valid = false; }

    if (!Validator.required(pwd2.value)) { Validator.showError(pwd2, 'Please confirm your password.'); valid = false; }
    else if (!Validator.match(pwd.value, pwd2.value)) { Validator.showError(pwd2, 'Passwords do not match.'); valid = false; }

    if (valid) {
      Toast.show('Account created! Welcome to Campus Marketplace.', 'success');
      setTimeout(() => { window.location.href = 'index.html'; }, 1400);
    }
  });
}

/* ============================================================
   LOGIN FORM (UC-B02)
   ============================================================ */
function initLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    Validator.clearAll(form);
    let valid = true;
    const email = form.querySelector('#login-email');
    const pwd   = form.querySelector('#login-pwd');
    if (!Validator.required(email.value)) { Validator.showError(email, 'Email is required.'); valid = false; }
    if (!Validator.required(pwd.value))   { Validator.showError(pwd,   'Password is required.'); valid = false; }

    if (valid) {
      // Simulate credential check
      if (email.value === 'wrong@wsu.edu') {
        Validator.showError(pwd, 'Incorrect email or password.');
      } else {
        sessionStorage.setItem('cm_user', email.value);
        Toast.show('Logged in successfully!', 'success');
        setTimeout(() => {
          const redirect = new URLSearchParams(window.location.search).get('redirect');
          window.location.href = redirect || 'index.html';
        }, 1000);
      }
    }
  });
}

/* ============================================================
   ADD TO CART BUTTON (UC-B05)
   ============================================================ */
function initAddToCart() {
  document.querySelectorAll('[data-add-cart]').forEach(btn => {
    btn.addEventListener('click', () => {
      const data = {
        id: btn.getAttribute('data-id'),
        title: btn.getAttribute('data-title'),
        price: btn.getAttribute('data-price'),
        seller: btn.getAttribute('data-seller')
      };
      Cart.add(data);
    });
  });
}

/* ============================================================
   CART PAGE (UC-B05)
   ============================================================ */
function initCartPage() {
  const container = document.getElementById('cart-items');
  if (!container) return;

  function render() {
    const total = document.getElementById('cart-total');
    const subtotal = document.getElementById('cart-subtotal');
    const count = document.getElementById('cart-count');
    const empty = document.getElementById('cart-empty');
    const panel = document.getElementById('cart-panel');

    if (Cart.items.length === 0) {
      if (empty) empty.classList.remove('cm-hidden');
      if (panel) panel.classList.add('cm-hidden');
      container.innerHTML = '';
      return;
    }
    if (empty) empty.classList.add('cm-hidden');
    if (panel) panel.classList.remove('cm-hidden');

    container.innerHTML = Cart.items.map(item => `
      <div class="cm-cart-item">
        <div class="cm-cart-item__img">📦</div>
        <div class="cm-cart-item__info">
          <p class="cm-cart-item__title">${item.title}</p>
          <p class="cm-cart-item__seller">Sold by ${item.seller}</p>
          <p class="cm-cart-item__price">$${parseFloat(item.price).toFixed(2)}</p>
        </div>
        <button class="cm-cart-item__remove" onclick="Cart.remove('${item.id}'); initCartPage();" title="Remove">✕</button>
      </div>
    `).join('');

    const t = Cart.total();
    if (subtotal) subtotal.textContent = '$' + t.toFixed(2);
    if (total) total.textContent = '$' + t.toFixed(2);
    if (count) count.textContent = Cart.items.length + (Cart.items.length === 1 ? ' item' : ' items');
  }
  render();
}

/* ============================================================
   CHECKOUT (UC-B06)
   ============================================================ */
function initCheckout() {
  const form = document.getElementById('checkout-form');
  if (!form) return;

  // Populate order summary from cart
  const summaryEl = document.getElementById('checkout-items');
  if (summaryEl) {
    summaryEl.innerHTML = Cart.items.length
      ? Cart.items.map(i => `<div class="cm-summary-row"><span>${i.title}</span><span>$${parseFloat(i.price).toFixed(2)}</span></div>`).join('')
      : '<p class="cm-text-muted cm-text-sm">No items in cart.</p>';
    const el = document.getElementById('checkout-total');
    if (el) el.textContent = '$' + Cart.total().toFixed(2);
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (Cart.items.length === 0) { Toast.show('Your cart is empty.', 'error'); return; }
    const orderId = 'ORD-' + Math.floor(Math.random() * 90000 + 10000);
    sessionStorage.setItem('cm_last_order', orderId);
    Cart.clear();
    window.location.href = 'order-confirmation.html?order=' + orderId;
  });
}

/* ============================================================
   ORDER CONFIRMATION (UC-B06)
   ============================================================ */
function initOrderConfirmation() {
  const el = document.getElementById('order-id');
  if (!el) return;
  const id = new URLSearchParams(window.location.search).get('order')
    || sessionStorage.getItem('cm_last_order') || 'ORD-12345';
  el.textContent = id;
}

/* ============================================================
   PROFILE FORM (UC-B08)
   ============================================================ */
function initProfileForm() {
  const form = document.getElementById('profile-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    Validator.clearAll(form);
    let valid = true;
    const name = form.querySelector('#profile-name');
    const email = form.querySelector('#profile-email');
    if (!Validator.required(name.value))  { Validator.showError(name,  'Display name is required.'); valid = false; }
    if (!Validator.required(email.value)) { Validator.showError(email, 'Email is required.'); valid = false; }
    else if (!Validator.wsuEmail(email.value)) { Validator.showError(email, 'Must be a valid WSU email address.'); valid = false; }
    if (valid) { Toast.show('Profile updated successfully!', 'success'); }
  });
}

/* ============================================================
   CANCELLATION REQUEST (UC-B10)
   ============================================================ */
function initCancellationRequest() {
  const form = document.getElementById('cancel-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const reason = form.querySelector('#cancel-reason');
    if (!Validator.required(reason.value)) { Validator.showError(reason, 'Please provide a reason for cancellation.'); return; }
    Modal.close('cancel-modal');
    Toast.show('Cancellation request submitted. The seller has been notified.', 'success');
    const btn = document.querySelector('[data-cancel-order]');
    if (btn) { btn.disabled = true; btn.textContent = 'Cancellation Requested'; }
  });
}

/* ============================================================
   MESSAGING (UC-B09 / UC-S07)
   ============================================================ */
function initMessaging() {
  const sendBtn = document.getElementById('msg-send');
  const textarea = document.getElementById('msg-input');
  if (!sendBtn || !textarea) return;

  function sendMessage() {
    const text = textarea.value.trim();
    if (!text) { Toast.show('Message cannot be empty.', 'warning'); return; }
    if (text.length > 1000) { Toast.show('Message exceeds character limit (1000).', 'warning'); return; }
    const chat = document.getElementById('chat-messages');
    if (chat) {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const div = document.createElement('div');
      div.className = 'cm-msg cm-msg--out';
      div.innerHTML = `<div class="cm-msg__bubble">${escapeHtml(text)}</div><span class="cm-msg__time">${now}</span>`;
      chat.appendChild(div);
      chat.scrollTop = chat.scrollHeight;
    }
    textarea.value = '';
    Toast.show('Message sent!', 'success');
  }

  sendBtn.addEventListener('click', sendMessage);
  textarea.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });

  // Switch conversations
  document.querySelectorAll('.cm-conv-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.cm-conv-item').forEach(i => i.classList.remove('cm-conv-item--active'));
      item.classList.add('cm-conv-item--active');
      item.querySelector('.cm-conv-item__unread')?.remove();
    });
  });
}

/* ============================================================
   LISTING FORM (UC-S01 / UC-S02)
   ============================================================ */
function initListingForm() {
  const form = document.getElementById('listing-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    Validator.clearAll(form);
    let valid = true;
    const title = form.querySelector('#lst-title');
    const price = form.querySelector('#lst-price');
    const category = form.querySelector('#lst-category');
    const desc = form.querySelector('#lst-desc');

    if (!Validator.required(title.value))    { Validator.showError(title,    'Title is required.'); valid = false; }
    if (!Validator.required(category.value)) { Validator.showError(category, 'Please select a category.'); valid = false; }
    if (!Validator.required(price.value))    { Validator.showError(price,    'Price is required.'); valid = false; }
    else if (!Validator.positiveNum(price.value)) { Validator.showError(price, 'Price must be a positive number.'); valid = false; }
    if (!Validator.required(desc.value))     { Validator.showError(desc,     'Description is required.'); valid = false; }

    if (valid) {
      const action = e.submitter?.value || 'publish';
      if (action === 'draft') {
        Toast.show('Listing saved as draft.', 'default');
      } else {
        Toast.show('Listing published successfully!', 'success');
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 1400);
      }
    }
  });
}

/* ============================================================
   SELLER ORDER ACTIONS (UC-S06 / UC-S08)
   ============================================================ */
function initSellerOrders() {
  // Mark as Fulfilled
  document.querySelectorAll('[data-fulfill]').forEach(btn => {
    btn.addEventListener('click', () => {
      const orderId = btn.getAttribute('data-fulfill');
      Modal.open('fulfill-modal');
      document.getElementById('fulfill-confirm')?.addEventListener('click', () => {
        Modal.close('fulfill-modal');
        btn.closest('tr').querySelector('.cm-badge').className = 'cm-badge cm-badge--fulfilled';
        btn.closest('tr').querySelector('.cm-badge').textContent = 'Fulfilled';
        btn.remove();
        Toast.show(`Order ${orderId} marked as fulfilled.`, 'success');
      }, { once: true });
    });
  });

  // Approve / Deny Cancellation
  document.querySelectorAll('[data-approve-cancel]').forEach(btn => {
    btn.addEventListener('click', () => {
      const orderId = btn.getAttribute('data-approve-cancel');
      Modal.close('cancel-review-modal');
      btn.closest('tr').querySelector('.cm-badge').className = 'cm-badge cm-badge--cancelled';
      btn.closest('tr').querySelector('.cm-badge').textContent = 'Cancelled';
      btn.closest('.cm-table__actions').innerHTML = '<span class="cm-text-muted cm-text-sm">Approved</span>';
      Toast.show(`Cancellation approved for order ${orderId}.`, 'success');
    });
  });
  document.querySelectorAll('[data-deny-cancel]').forEach(btn => {
    btn.addEventListener('click', () => {
      const orderId = btn.getAttribute('data-deny-cancel');
      btn.closest('tr').querySelector('.cm-badge').className = 'cm-badge cm-badge--pending';
      btn.closest('tr').querySelector('.cm-badge').textContent = 'Pending';
      btn.closest('.cm-table__actions').innerHTML = '<span class="cm-text-muted cm-text-sm">Denied</span>';
      Toast.show(`Cancellation denied for order ${orderId}.`, 'warning');
    });
  });
}

/* ============================================================
   ADMIN ACTIONS (UC-A03 / UC-A04)
   ============================================================ */
function initAdminActions() {
  // Suspend user
  document.querySelectorAll('[data-suspend]').forEach(btn => {
    btn.addEventListener('click', () => {
      const userId = btn.getAttribute('data-suspend');
      Modal.open('suspend-modal');
      document.getElementById('suspend-confirm')?.addEventListener('click', () => {
        Modal.close('suspend-modal');
        const row = btn.closest('tr');
        const statusCell = row.querySelector('.user-status');
        if (statusCell) { statusCell.innerHTML = '<span class="cm-badge cm-badge--suspended">Suspended</span>'; }
        btn.textContent = 'Reinstate';
        btn.setAttribute('data-reinstate', userId);
        btn.removeAttribute('data-suspend');
        btn.classList.replace('cm-btn--danger', 'cm-btn--success');
        Toast.show(`User account suspended.`, 'warning');
      }, { once: true });
    });
  });

  // Remove listing
  document.querySelectorAll('[data-remove-listing]').forEach(btn => {
    btn.addEventListener('click', () => {
      Modal.open('remove-listing-modal');
      document.getElementById('remove-listing-confirm')?.addEventListener('click', () => {
        Modal.close('remove-listing-modal');
        const row = btn.closest('tr');
        const statusCell = row.querySelector('.listing-status');
        if (statusCell) { statusCell.innerHTML = '<span class="cm-badge cm-badge--removed">Removed</span>'; }
        btn.textContent = 'Restore';
        btn.classList.replace('cm-btn--danger', 'cm-btn--success');
        Toast.show('Listing removed from marketplace.', 'warning');
      }, { once: true });
    });
  });

  // Dismiss report
  document.querySelectorAll('[data-dismiss-report]').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('tr').remove();
      Toast.show('Report dismissed.', 'default');
    });
  });
}

/* ============================================================
   SEARCH / FILTER (UC-B03)
   ============================================================ */
function initSearch() {
  const form = document.getElementById('search-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const q = document.getElementById('search-q')?.value.trim();
    if (q) {
      const cards = document.querySelectorAll('.cm-product-card');
      let found = 0;
      cards.forEach(card => {
        const title = card.querySelector('.cm-product-card__title')?.textContent.toLowerCase() || '';
        const match = title.includes(q.toLowerCase());
        card.style.display = match ? '' : 'none';
        if (match) found++;
      });
      const noResult = document.getElementById('no-results');
      if (noResult) noResult.classList.toggle('cm-hidden', found > 0);
    }
  });

  // Clear filters
  document.getElementById('clear-filters')?.addEventListener('click', () => {
    document.querySelectorAll('.cm-product-card').forEach(c => c.style.display = '');
    document.getElementById('no-results')?.classList.add('cm-hidden');
    if (form) form.reset();
  });
}

/* ============================================================
   DELETE LISTING (UC-S03)
   ============================================================ */
function initDeleteListing() {
  document.querySelectorAll('[data-delete-listing]').forEach(btn => {
    btn.addEventListener('click', () => {
      Modal.open('delete-confirm-modal');
      document.getElementById('delete-confirm-btn')?.addEventListener('click', () => {
        Modal.close('delete-confirm-modal');
        Toast.show('Listing deleted.', 'default');
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 1200);
      }, { once: true });
    });
  });
  document.querySelectorAll('[data-deactivate-listing]').forEach(btn => {
    btn.addEventListener('click', () => {
      Modal.open('deactivate-modal');
      document.getElementById('deactivate-confirm-btn')?.addEventListener('click', () => {
        Modal.close('deactivate-modal');
        Toast.show('Listing deactivated. It is no longer visible to buyers.', 'warning');
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 1200);
      }, { once: true });
    });
  });
}

/* ============================================================
   UTILITIES
   ============================================================ */
function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ============================================================
   GLOBAL INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  Toast.init();
  Cart.updateBadge();
  initTabs();
  initRegisterForm();
  initLoginForm();
  initAddToCart();
  initCartPage();
  initCheckout();
  initOrderConfirmation();
  initProfileForm();
  initCancellationRequest();
  initMessaging();
  initListingForm();
  initSellerOrders();
  initAdminActions();
  initSearch();
  initDeleteListing();

  // Modal close on overlay click or close button
  document.querySelectorAll('.cm-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) Modal.close(overlay.id);
    });
  });
  document.querySelectorAll('[data-modal-close]').forEach(btn => {
    btn.addEventListener('click', () => Modal.close(btn.getAttribute('data-modal-close')));
  });
  document.querySelectorAll('[data-modal-open]').forEach(btn => {
    btn.addEventListener('click', () => Modal.open(btn.getAttribute('data-modal-open')));
  });

  // Deactivate listing from table
  document.querySelectorAll('[data-deactivate-row]').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('tr');
      const statusCell = row.querySelector('.listing-row-status');
      if (statusCell) statusCell.innerHTML = '<span class="cm-badge cm-badge--inactive">Inactive</span>';
      btn.textContent = 'Activate';
      Toast.show('Listing deactivated.', 'warning');
    });
  });

  // Contact seller button (UC-B09) opens messaging or redirects
  document.querySelectorAll('[data-contact-seller]').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.href = 'messages.html';
    });
  });
});
