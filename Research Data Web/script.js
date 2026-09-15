// Ledger — shared front-end behaviour (no backend; all data is mocked)

document.addEventListener('DOMContentLoaded', function () {
  initNavToggle();
  initFaqAccordion();
  initTabs();
  initBuyButtons();
  initUploadForm();
  initAuthForms();
  initContactForm();
  initSearchFilter();
});

/* ---------- Mobile nav ---------- */
function initNavToggle() {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

/* ---------- FAQ accordion ---------- */
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

/* ---------- Login / Register tabs ---------- */
function initTabs() {
  var tabButtons = document.querySelectorAll('.tab-btn');
  if (!tabButtons.length) return;
  tabButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = btn.getAttribute('data-tab');
      document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
      document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
      btn.classList.add('active');
      document.getElementById(target).classList.add('active');
    });
  });
}

/* ---------- Mock buy flow ---------- */
function initBuyButtons() {
  document.querySelectorAll('[data-buy]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var name = btn.getAttribute('data-buy');
      showToast('Added "' + name + '" to your order. A secure payment step would appear here once the gateway is connected.');
    });
  });
}

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
  toast._timer = setTimeout(function () {
    toast.classList.remove('show');
  }, 4200);
}

/* ---------- Upload form validation (mock submit) ---------- */
function initUploadForm() {
  var form = document.getElementById('upload-form');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var valid = true;

    var requiredFields = form.querySelectorAll('[data-required]');
    requiredFields.forEach(function (field) {
      var wrapper = field.closest('.field');
      var filled = field.type === 'file' ? field.files.length > 0 : field.value.trim().length > 0;
      if (!filled) {
        wrapper.classList.add('has-error');
        valid = false;
      } else {
        wrapper.classList.remove('has-error');
      }
    });

    var priceField = form.querySelector('#price');
    if (priceField && priceField.value && Number(priceField.value) <= 0) {
      priceField.closest('.field').classList.add('has-error');
      valid = false;
    }

    if (!valid) {
      var firstError = form.querySelector('.has-error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    var titleField = form.querySelector('#title');
    var title = titleField ? titleField.value : 'your dataset';
    form.reset();
    showToast('"' + title + '" was submitted for review. You\'ll be notified once it\'s live in the archive.');
  });
}

/* ---------- Login / register mock submit ---------- */
function initAuthForms() {
  document.querySelectorAll('[data-auth-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var kind = form.getAttribute('data-auth-form');
      showToast(kind === 'login' ? 'Signed in. Redirecting to the archive would happen here.' : 'Account created. A confirmation email would be sent here.');
    });
  });
}

/* ---------- Contact form mock submit ---------- */
function initContactForm() {
  var form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    form.reset();
    showToast('Message sent. Expect a reply within two business days.');
  });
}

/* ---------- Browse page: live search + category filter ---------- */
function initSearchFilter() {
  var searchInput = document.getElementById('dataset-search');
  var list = document.getElementById('dataset-list');
  if (!list) return;
  var items = Array.prototype.slice.call(list.querySelectorAll('.data-item'));
  var checkboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');
  var emptyState = document.getElementById('empty-state');

  function applyFilters() {
    var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var activeCats = Array.prototype.slice.call(checkboxes)
      .filter(function (c) { return c.checked; })
      .map(function (c) { return c.value; });

    var visibleCount = 0;
    items.forEach(function (item) {
      var text = item.getAttribute('data-search') || '';
      var cat = item.getAttribute('data-category') || '';
      var matchesQuery = !query || text.toLowerCase().indexOf(query) !== -1;
      var matchesCat = activeCats.length === 0 || activeCats.indexOf(cat) !== -1;
      var show = matchesQuery && matchesCat;
      item.style.display = show ? '' : 'none';
      if (show) visibleCount++;
    });

    if (emptyState) emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
  }

  if (searchInput) searchInput.addEventListener('input', applyFilters);
  checkboxes.forEach(function (c) { c.addEventListener('change', applyFilters); });
}
