// Ledger — Research Data Marketplace
// Front-end auth uses localStorage (template/demo only — not for production)

var USERS_KEY    = 'ledger_users';
var SESSION_KEY  = 'ledger_session';
var DATASETS_KEY = 'ledger_datasets';

document.addEventListener('DOMContentLoaded', function () {
  seedAdmin();
  initNavToggle();
  initNavAuth();
  initAdminGuard();
  initFaqAccordion();
  initTabs();
  initBuyButtons();
  initUploadForm();
  initAuthForms();
  initContactForm();
  initSearchFilter();
  initDashboard();
  initAdminPanel();
});

/* ============================================================
   AUTH HELPERS
   ============================================================ */
function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
  catch (e) { return []; }
}
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCurrentUser() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); }
  catch (e) { return null; }
}
function setCurrentUser(user) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}
function clearCurrentUser() {
  sessionStorage.removeItem(SESSION_KEY);
}

function hashPw(pw) {
  // Simple obfuscation for demo purposes only
  return btoa(unescape(encodeURIComponent(pw)));
}
function genId() {
  return 'u-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
}

/* ============================================================
   SEED DEFAULT ADMIN ACCOUNT
   Credentials: admin@ledger.ng / Admin@1234
   ============================================================ */
function seedAdmin() {
  var users = getUsers();
  if (!users.some(function (u) { return u.email === 'admin@ledger.ng'; })) {
    users.push({
      id: 'admin-seed-001',
      firstName: 'Ledger',
      lastName: 'Admin',
      otherNames: '',
      email: 'admin@ledger.ng',
      passwordHash: hashPw('Admin@1234'),
      isAdmin: true,
      createdAt: new Date().toISOString()
    });
    saveUsers(users);
  }
}

/* ============================================================
   NAV: Swap "Log in" link for user info when logged in
   ============================================================ */
function initNavAuth() {
  var user = getCurrentUser();
  var navLinks = document.querySelector('.nav-links');
  if (!navLinks) return;

  var loginAnchor = navLinks.querySelector('a[href="login.html"]');
  if (!loginAnchor) return;
  var loginLi = loginAnchor.parentElement;

  if (user) {
    // Replace "Log in" with "Dashboard"
    loginAnchor.textContent = 'Dashboard';
    loginAnchor.href = 'dashboard.html';

    // Insert Admin link if applicable
    if (user.isAdmin) {
      var adminLi = document.createElement('li');
      adminLi.innerHTML = '<a href="admin.html">Admin</a>';
      loginLi.parentElement.insertBefore(adminLi, loginLi);
    }

    // Append Logout
    var logoutLi = document.createElement('li');
    logoutLi.innerHTML = '<a href="#" id="nav-logout-btn">Log out</a>';
    loginLi.parentElement.appendChild(logoutLi);
    document.getElementById('nav-logout-btn').addEventListener('click', function (e) {
      e.preventDefault();
      clearCurrentUser();
      window.location.href = 'index.html';
    });
  }
}

/* ============================================================
   ADMIN / AUTH GUARDS
   - upload.html & admin.html: must be admin
   - dashboard.html: must be logged in
   ============================================================ */
function initAdminGuard() {
  var page = window.location.pathname.split('/').pop() || 'index.html';

  if (page === 'upload.html' || page === 'admin.html') {
    var user = getCurrentUser();
    if (!user) {
      showToast('Please log in to access this page.');
      setTimeout(function () { window.location.href = 'login.html'; }, 1600);
      return;
    }
    if (!user.isAdmin) {
      showToast('Access denied. Administrator privileges required.');
      setTimeout(function () { window.location.href = 'index.html'; }, 1600);
    }
  }

  if (page === 'dashboard.html') {
    if (!getCurrentUser()) {
      window.location.href = 'login.html';
    }
  }
}

/* ============================================================
   MOBILE NAV TOGGLE
   ============================================================ */
function initNavToggle() {
  var toggle = document.querySelector('.nav-toggle');
  var links  = document.querySelector('.nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

/* ============================================================
   FAQ ACCORDION
   ============================================================ */
function initFaqAccordion() {
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (other) {
        if (other !== item) other.classList.remove('open');
      });
      item.classList.toggle('open', !isOpen);
    });
  });
}

/* ============================================================
   LOGIN / REGISTER TABS
   ============================================================ */
function initTabs() {
  var tabButtons = document.querySelectorAll('.tab-btn');
  if (!tabButtons.length) return;
  tabButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = btn.getAttribute('data-tab');
      document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
      document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
      btn.classList.add('active');
      var panel = document.getElementById(target);
      if (panel) panel.classList.add('active');
    });
  });
}

/* ============================================================
   BUY BUTTONS (mock purchase flow)
   ============================================================ */
function initBuyButtons() {
  document.querySelectorAll('[data-buy]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      if (!getCurrentUser()) {
        showToast('Please log in to purchase a dataset.');
        return;
      }
      var name = btn.getAttribute('data-buy');
      showToast('Added "' + name + '" to your order. A secure payment step would appear here once the gateway is connected.');
    });
  });
}

/* ============================================================
   TOAST NOTIFICATION
   ============================================================ */
function showToast(message) {
  var toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(function () { toast.classList.remove('show'); }, 4200);
}

/* ============================================================
   UPLOAD FORM (admin only — validated in initAdminGuard)
   ============================================================ */
function initUploadForm() {
  var form = document.getElementById('upload-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var valid = true;

    form.querySelectorAll('[data-required]').forEach(function (field) {
      var wrapper = field.closest('.field');
      var filled = field.type === 'file' ? field.files.length > 0 : field.value.trim().length > 0;
      if (!filled) { wrapper.classList.add('has-error'); valid = false; }
      else          { wrapper.classList.remove('has-error'); }
    });

    var priceField = form.querySelector('#price');
    if (priceField) {
      var priceVal = Number(priceField.value);
      if (!priceField.value || priceVal <= 0) {
        priceField.closest('.field').classList.add('has-error');
        valid = false;
      } else if (priceVal > 5000) {
        priceField.closest('.field').classList.add('has-error');
        showToast('Price cannot exceed ₦5,000.');
        valid = false;
      }
    }

    if (!valid) {
      var firstError = form.querySelector('.has-error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Store dataset in localStorage
    var datasets = getDatasets();
    var title    = (form.querySelector('#title') || {}).value || 'Untitled Dataset';
    datasets.push({
      id: 'ds-' + Date.now(),
      title: title,
      description: (form.querySelector('#description') || {}).value || '',
      category:    (form.querySelector('#category')    || {}).value || '',
      price:       priceField ? Number(priceField.value) : 0,
      downloads:   0,
      uploadedBy:  getCurrentUser() ? getCurrentUser().email : 'admin',
      createdAt:   new Date().toISOString()
    });
    saveDatasets(datasets);

    form.reset();
    showToast('"' + title + '" submitted for review. You\'ll be notified once it\'s live in the archive.');
  });
}

function getDatasets() {
  try { return JSON.parse(localStorage.getItem(DATASETS_KEY) || '[]'); }
  catch (e) { return []; }
}
function saveDatasets(ds) {
  localStorage.setItem(DATASETS_KEY, JSON.stringify(ds));
}

/* ============================================================
   AUTH FORMS: LOGIN & REGISTER
   ============================================================ */
function initAuthForms() {
  /* -- Login -- */
  var loginForm = document.querySelector('[data-auth-form="login"]');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      clearFormErrors(loginForm);

      var emailEl = document.getElementById('login-email');
      var pwEl    = document.getElementById('login-password');
      var email   = emailEl ? emailEl.value.trim().toLowerCase() : '';
      var pw      = pwEl    ? pwEl.value : '';
      var ok      = true;

      if (!email) { markError('login-email', 'Email address is required.'); ok = false; }
      if (!pw)    { markError('login-password', 'Password is required.'); ok = false; }
      if (!ok) return;

      var user = getUsers().find(function (u) {
        return u.email === email && u.passwordHash === hashPw(pw);
      });

      if (!user) {
        showToast('Incorrect email or password. Please try again.');
        return;
      }
      setCurrentUser(user);
      showToast('Welcome back, ' + user.firstName + '! Redirecting…');
      setTimeout(function () { window.location.href = 'dashboard.html'; }, 1300);
    });
  }

  /* -- Register -- */
  var regForm = document.querySelector('[data-auth-form="register"]');
  if (regForm) {
    regForm.addEventListener('submit', function (e) {
      e.preventDefault();
      clearFormErrors(regForm);

      var firstName   = val('reg-firstname');
      var lastName    = val('reg-lastname');
      var otherNames  = val('reg-othernames');
      var email       = val('reg-email').toLowerCase();
      var pw          = val('reg-password');
      var confirmPw   = val('reg-confirm-password');
      var ok = true;

      if (!firstName)  { markError('reg-firstname',        'First name is required.');              ok = false; }
      if (!lastName)   { markError('reg-lastname',         'Last name is required.');               ok = false; }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                         markError('reg-email',            'Please enter a valid email address.');   ok = false; }
      if (pw.length < 8){ markError('reg-password',       'Password must be at least 8 characters.'); ok = false; }
      if (pw !== confirmPw) { markError('reg-confirm-password', 'Passwords do not match.');         ok = false; }
      if (!ok) return;

      var users = getUsers();
      if (users.find(function (u) { return u.email === email; })) {
        showToast('An account with that email already exists. Please log in.');
        return;
      }

      var newUser = {
        id:           genId(),
        firstName:    firstName,
        lastName:     lastName,
        otherNames:   otherNames,
        email:        email,
        passwordHash: hashPw(pw),
        isAdmin:      false,
        createdAt:    new Date().toISOString()
      };
      users.push(newUser);
      saveUsers(users);
      setCurrentUser(newUser);
      showToast('Account created! Welcome, ' + firstName + '.');
      setTimeout(function () { window.location.href = 'dashboard.html'; }, 1300);
    });
  }
}

function val(id) {
  var el = document.getElementById(id);
  return el ? el.value.trim() : '';
}
function markError(inputId, message) {
  var el = document.getElementById(inputId);
  if (!el) return;
  var wrapper = el.closest('.field');
  if (!wrapper) return;
  wrapper.classList.add('has-error');
  var errEl = wrapper.querySelector('.field-error');
  if (errEl) errEl.textContent = message;
}
function clearFormErrors(form) {
  form.querySelectorAll('.field').forEach(function (f) { f.classList.remove('has-error'); });
}

/* ============================================================
   CONTACT FORM (mock submit)
   ============================================================ */
function initContactForm() {
  var form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    form.reset();
    showToast('Message sent. Expect a reply within two business days.');
  });
}

/* ============================================================
   BROWSE PAGE: live search + category filter
   ============================================================ */
function initSearchFilter() {
  var searchInput = document.getElementById('dataset-search');
  var list        = document.getElementById('dataset-list');
  if (!list) return;
  var items      = Array.prototype.slice.call(list.querySelectorAll('.data-item'));
  var checkboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');
  var emptyState = document.getElementById('empty-state');

  function applyFilters() {
    var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var activeCats = Array.prototype.slice.call(checkboxes)
      .filter(function (c) { return c.checked; })
      .map(function (c) { return c.value; });
    var visible = 0;
    items.forEach(function (item) {
      var text = (item.getAttribute('data-search') || '').toLowerCase();
      var cat  = item.getAttribute('data-category') || '';
      var show = (!query || text.indexOf(query) !== -1) &&
                 (activeCats.length === 0 || activeCats.indexOf(cat) !== -1);
      item.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    if (emptyState) emptyState.style.display = visible === 0 ? 'block' : 'none';
  }

  if (searchInput) searchInput.addEventListener('input', applyFilters);
  checkboxes.forEach(function (c) { c.addEventListener('change', applyFilters); });
}

/* ============================================================
   DASHBOARD
   ============================================================ */
function initDashboard() {
  if (!document.getElementById('dashboard-main')) return;
  var user = getCurrentUser();
  if (!user) return;

  setText('dash-name',   user.firstName + ' ' + user.lastName + (user.otherNames ? ' ' + user.otherNames : ''));
  setText('dash-email',  user.email);
  setText('dash-role',   user.isAdmin ? 'Administrator' : 'Researcher');
  setText('dash-joined', new Date(user.createdAt).toLocaleDateString('en-NG', { year:'numeric', month:'long', day:'numeric' }));

  var adminLink = document.getElementById('dash-admin-link');
  if (adminLink) adminLink.style.display = user.isAdmin ? 'inline-flex' : 'none';

  var logoutBtn = document.getElementById('dash-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function (e) {
      e.preventDefault();
      clearCurrentUser();
      window.location.href = 'index.html';
    });
  }
}

function setText(id, text) {
  var el = document.getElementById(id);
  if (el) el.textContent = text;
}

/* ============================================================
   ADMIN PANEL
   ============================================================ */
function initAdminPanel() {
  if (!document.getElementById('admin-main')) return;
  var user = getCurrentUser();
  if (!user || !user.isAdmin) return;

  renderUserTable();
  renderDatasetTable();

  // Upload form on admin page
  var adminUploadForm = document.getElementById('admin-upload-form');
  if (adminUploadForm) {
    adminUploadForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var title    = (adminUploadForm.querySelector('#a-title')       || {}).value || '';
      var desc     = (adminUploadForm.querySelector('#a-description') || {}).value || '';
      var category = (adminUploadForm.querySelector('#a-category')    || {}).value || '';
      var price    = Number((adminUploadForm.querySelector('#a-price') || {}).value || 0);
      if (!title || !category || !price) { showToast('Please fill in all required fields.'); return; }
      if (price > 5000) { showToast('Price cannot exceed ₦5,000.'); return; }
      var datasets = getDatasets();
      datasets.push({ id:'ds-'+Date.now(), title:title, description:desc, category:category, price:price, downloads:0, uploadedBy:user.email, createdAt:new Date().toISOString() });
      saveDatasets(datasets);
      adminUploadForm.reset();
      showToast('"' + title + '" added to the archive.');
      renderDatasetTable();
    });
  }
}

function renderUserTable() {
  var tbody = document.getElementById('admin-users-tbody');
  if (!tbody) return;
  var users = getUsers();
  tbody.innerHTML = '';
  users.forEach(function (u) {
    var isProtected = u.id === 'admin-seed-001';
    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td>' + escHtml(u.firstName + ' ' + u.lastName) + (u.otherNames ? ' <span class="other-names">' + escHtml(u.otherNames) + '</span>' : '') + '</td>' +
      '<td>' + escHtml(u.email) + '</td>' +
      '<td>' + new Date(u.createdAt).toLocaleDateString('en-NG') + '</td>' +
      '<td><span class="role-badge ' + (u.isAdmin ? 'role-admin' : 'role-user') + '">' + (u.isAdmin ? 'Admin' : 'User') + '</span></td>' +
      '<td>' + (isProtected
        ? '<span style="font-size:0.8rem;color:var(--ink-soft);">Protected</span>'
        : '<button class="btn btn-small ' + (u.isAdmin ? 'btn-secondary' : 'btn-primary') + ' toggle-admin-btn" data-uid="' + escHtml(u.id) + '">' + (u.isAdmin ? 'Revoke Admin' : 'Make Admin') + '</button>') +
      '</td>';
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.toggle-admin-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var uid   = btn.getAttribute('data-uid');
      var users = getUsers();
      var target = users.find(function (u) { return u.id === uid; });
      if (!target) return;
      target.isAdmin = !target.isAdmin;
      saveUsers(users);
      showToast((target.isAdmin ? '✓ ' : '✗ ') + target.firstName + ' ' + target.lastName + (target.isAdmin ? ' is now an administrator.' : '\'s admin role has been removed.'));
      renderUserTable();
    });
  });
}

function renderDatasetTable() {
  var tbody = document.getElementById('admin-datasets-tbody');
  if (!tbody) return;
  var datasets = getDatasets();
  tbody.innerHTML = '';
  if (datasets.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="color:var(--ink-soft);text-align:center;padding:24px 0;">No datasets uploaded yet via this panel.</td></tr>';
    return;
  }
  datasets.forEach(function (ds) {
    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td>' + escHtml(ds.title) + '</td>' +
      '<td>' + escHtml(ds.category) + '</td>' +
      '<td>₦' + Number(ds.price).toLocaleString() + '</td>' +
      '<td class="dl-stat">⬇ ' + ds.downloads + '</td>' +
      '<td>' + new Date(ds.createdAt).toLocaleDateString('en-NG') + '</td>';
    tbody.appendChild(tr);
  });
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
