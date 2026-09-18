// Research Hub — Research Data Marketplace
// All data stored in localStorage (demo/template — NOT for production)

var USERS_KEY    = 'ledger_users';
var SESSION_KEY  = 'ledger_session';
var DATASETS_KEY = 'ledger_datasets';
var TICKETS_KEY  = 'ledger_tickets';
var PAYMENTS_KEY = 'ledger_payments';
var CONTENT_KEY  = 'ledger_site_content';

document.addEventListener('DOMContentLoaded', function () {
  seedAdmin();
  seedSiteContent();

  if (isAdminPage()) {
    if (initAdminPageGuard()) {
      initAdminSidebar();
      initAdminDashboard();
      initAdminUsers();
      initAdminPapers();
      initAdminUpload();
      initAdminPayments();
      initAdminTickets();
      initAdminProfile();
      initAdminContent();
    }
  } else {
    initNavToggle();
    initNavAuth();
    initDashboardGuard();
    initFaqAccordion();
    initTabs();
    initBuyButtons();
    initAuthForms();
    initAboutPage();
    initContactPage();
    initTicketForm();
    initBrowsePage();
    initSearchFilter();
    initUserDashboard();
    initProfileEditForms();
    initHomePage();
    initDatasetPage();
  }
});

/* ============================================================
   UTILITIES
   ============================================================ */
function isAdminPage() {
  var page = window.location.pathname.split('/').pop() || '';
  return page.indexOf('admin-') === 0;
}
function currentPage() {
  return window.location.pathname.split('/').pop() || 'index.html';
}

function getUsers()   { try { return JSON.parse(localStorage.getItem(USERS_KEY)    || '[]');  } catch(e) { return []; } }
function saveUsers(u) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }

function getCurrentUser()  { try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); } catch(e) { return null; } }
function setCurrentUser(u) { sessionStorage.setItem(SESSION_KEY, JSON.stringify(u)); }
function clearCurrentUser(){ sessionStorage.removeItem(SESSION_KEY); }

function hashPw(pw) { return btoa(unescape(encodeURIComponent(pw))); }
function genId(prefix) { return (prefix||'id')+'-'+Math.random().toString(36).substr(2,9)+'-'+Date.now(); }

function getDatasets()   { try { return JSON.parse(localStorage.getItem(DATASETS_KEY) || '[]');  } catch(e) { return []; } }
function saveDatasets(d) { localStorage.setItem(DATASETS_KEY, JSON.stringify(d)); }

function getTickets()    { try { return JSON.parse(localStorage.getItem(TICKETS_KEY)  || '[]');  } catch(e) { return []; } }
function saveTickets(t)  { localStorage.setItem(TICKETS_KEY, JSON.stringify(t)); }

function getPayments()   { try { return JSON.parse(localStorage.getItem(PAYMENTS_KEY) || '[]');  } catch(e) { return []; } }
function savePayments(p) { localStorage.setItem(PAYMENTS_KEY, JSON.stringify(p)); }

function getSiteContent()   { try { return JSON.parse(localStorage.getItem(CONTENT_KEY) || 'null'); } catch(e) { return null; } }
function saveSiteContent(c) { localStorage.setItem(CONTENT_KEY, JSON.stringify(c)); }

function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function setText(id, text) { var el=document.getElementById(id); if(el) el.textContent=text; }
function val(id) { var el=document.getElementById(id); return el ? el.value.trim() : ''; }

/* ============================================================
   URL PARAM HELPER
   ============================================================ */
function getUrlParam(name) {
  var params = new URLSearchParams(window.location.search);
  return params.get(name);
}

/* ============================================================
   SEEDING
   ============================================================ */
function seedAdmin() {
  var users = getUsers();
  if (!users.some(function(u){ return u.email==='admin@researchhub.ng'; })) {
    users.push({
      id:'admin-seed-001', firstName:'Research Hub', lastName:'Admin', otherNames:'',
      email:'admin@researchhub.ng', passwordHash:hashPw('Admin@1234'),
      isAdmin:true, createdAt:new Date().toISOString()
    });
    saveUsers(users);
  }
}

function seedSiteContent() {
  if (!getSiteContent()) {
    saveSiteContent({
      about: {
        researcherName:'Dr. A. Kenton', department:'Department of Accounting',
        initials:'AK',
        bio1:'Dr. Kenton has spent two decades researching tax compliance, audit practice and corporate governance across emerging markets. Research Hub was built to make that fieldwork — and the datasets built by colleagues working in the same space — available directly to the researchers who need it, without the delay of formal publication.',
        bio2:'Every dataset on Research Hub has been cleaned, documented and anonymised to the same standard used in Dr. Kenton\'s own published work, so you can build on it with confidence.',
        credentials:[
          'PhD in Accounting, University of Lagos',
          'Associate Professor, Department of Accounting',
          '15+ peer-reviewed publications in taxation and governance research',
          'Consultant to national tax authorities on SME compliance'
        ]
      },
      contact:{ email:'contact@researchhub.ng', phone:'+234 801 234 5678' }
    });
  }
}

/* ============================================================
   TOAST
   ============================================================ */
function showToast(message) {
  var toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast'; toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(function(){ toast.classList.remove('show'); }, 4200);
}

/* ============================================================
   PUBLIC NAV — MOBILE TOGGLE
   ============================================================ */
function initNavToggle() {
  var toggle = document.querySelector('.nav-toggle');
  var links  = document.querySelector('.nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', function() {
    var open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

/* ============================================================
   PUBLIC NAV — AUTH STATE
   ============================================================ */
var LOGOUT_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"' +
  ' stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"' +
  ' width="18" height="18" aria-hidden="true">' +
  '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>' +
  '<polyline points="16 17 21 12 16 7"/>' +
  '<line x1="21" y1="12" x2="9" y2="12"/>' +
  '</svg>';

function initNavAuth() {
  var user = getCurrentUser();
  var nav  = document.querySelector('.nav');
  var navLinks = document.querySelector('.nav-links');
  if (!nav || !navLinks) return;

  var loginAnchor = navLinks.querySelector('a[href="login.html"]');

  if (user) {
    if (loginAnchor) loginAnchor.parentElement.style.display = 'none';

    var fullName = escHtml(user.firstName + ' ' + user.lastName);
    var roleName = user.isAdmin ? 'Admin' : 'Researcher';

    var widget = document.createElement('div');
    widget.className = 'nav-user-widget';
    widget.innerHTML =
      '<div class="nav-user-info">' +
        '<div class="nav-user-name">' + fullName + '</div>' +
        '<div class="nav-user-role">' + roleName + '</div>' +
      '</div>' +
      '<button id="nav-logout-btn" class="nav-logout-icon" title="Log out" aria-label="Log out">' + LOGOUT_SVG + '</button>';
    nav.appendChild(widget);

    document.getElementById('nav-logout-btn').addEventListener('click', function() {
      clearCurrentUser();
      window.location.href = 'index.html';
    });
  }
  // Guest: Log in link already in HTML — leave visible
}

/* ============================================================
   GUARDS
   ============================================================ */
function initDashboardGuard() {
  if (currentPage() === 'dashboard.html' && !getCurrentUser()) {
    window.location.href = 'login.html';
  }
}

function initAdminPageGuard() {
  var user = getCurrentUser();
  if (!user) {
    showToast('Please log in to access this page.');
    setTimeout(function(){ window.location.href='login.html'; }, 1600);
    return false;
  }
  if (!user.isAdmin) {
    showToast('Access denied. Administrator privileges required.');
    setTimeout(function(){ window.location.href='index.html'; }, 1600);
    return false;
  }
  return true;
}

/* ============================================================
   ADMIN SIDEBAR — built dynamically (plain text labels, no emoji)
   ============================================================ */
function initAdminSidebar() {
  var pg      = currentPage();
  var sidebar = document.getElementById('admin-sidebar');
  var overlay = document.getElementById('admin-overlay');
  var toggle  = document.getElementById('admin-sidebar-toggle');

  // Mobile toggle
  if (toggle && sidebar) {
    toggle.addEventListener('click', function() {
      sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('open');
    });
  }
  if (overlay) {
    overlay.addEventListener('click', function() {
      if (sidebar) sidebar.classList.remove('open');
      overlay.classList.remove('open');
    });
  }

  // Rebuild nav links from a single source of truth — plain text, no emoji
  var sidebarNav = document.querySelector('.admin-sidebar-nav');
  if (sidebarNav) {
    var navItems = [
      { href: 'admin-dashboard.html', label: 'Dashboard' },
      { href: 'admin-users.html',     label: 'Users' },
      { href: 'admin-papers.html',    label: 'Papers' },
      { href: 'admin-upload.html',    label: 'Upload' },
      { href: 'admin-payments.html',  label: 'Payments' },
      { href: 'admin-tickets.html',   label: 'Support Tickets' },
      { href: 'admin-content.html',   label: 'Content' },
      { href: 'admin-profile.html',   label: 'My Profile' }
    ];
    sidebarNav.innerHTML = '';
    navItems.forEach(function(item) {
      var a = document.createElement('a');
      a.href = item.href;
      a.className = 'admin-nav-link' + (item.href === pg ? ' active' : '');
      a.textContent = item.label;
      sidebarNav.appendChild(a);
    });

    // Open ticket badge
    var openCount = getTickets().filter(function(t){ return t.status==='Open'; }).length;
    if (openCount > 0) {
      var ticketLink = sidebarNav.querySelector('a[href="admin-tickets.html"]');
      if (ticketLink) {
        var badge = document.createElement('span');
        badge.className = 'nav-badge';
        badge.textContent = String(openCount);
        ticketLink.appendChild(badge);
      }
    }
  }

  // Sidebar user info
  var user = getCurrentUser();
  if (user) {
    var infoEl = document.getElementById('sidebar-user-info');
    if (infoEl) {
      infoEl.innerHTML =
        '<div class="sidebar-user-name">' + escHtml(user.firstName + ' ' + user.lastName) + '</div>' +
        '<div class="sidebar-user-email">' + escHtml(user.email) + '</div>';
    }
  }

  // Logout — SVG icon
  var logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) {
    logoutBtn.innerHTML = LOGOUT_SVG + ' Log out';
    logoutBtn.addEventListener('click', function() {
      clearCurrentUser();
      window.location.href = 'index.html';
    });
  }
}

/* ============================================================
   FAQ ACCORDION
   ============================================================ */
function initFaqAccordion() {
  document.querySelectorAll('.faq-item').forEach(function(item) {
    var q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', function() {
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function(o){ if(o!==item) o.classList.remove('open'); });
      item.classList.toggle('open', !isOpen);
    });
  });
}

/* ============================================================
   TABS
   ============================================================ */
function initTabs() {
  var tabButtons = document.querySelectorAll('.tab-btn');
  if (!tabButtons.length) return;
  tabButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var target = btn.getAttribute('data-tab');
      document.querySelectorAll('.tab-btn').forEach(function(b){ b.classList.remove('active'); });
      document.querySelectorAll('.tab-panel').forEach(function(p){ p.classList.remove('active'); });
      btn.classList.add('active');
      var panel = document.getElementById(target);
      if (panel) panel.classList.add('active');
    });
  });
}

/* ============================================================
   BUY BUTTONS — with download count increment
   ============================================================ */
function initBuyButtons() {
  document.querySelectorAll('[data-buy]').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      if (!getCurrentUser()) {
        showToast('Please log in to purchase a dataset.');
        return;
      }
      var dsid = btn.getAttribute('data-dsid') || '';
      var name = btn.getAttribute('data-buy') || '';

      // Increment downloads on the dataset record
      if (dsid) {
        var datasets = getDatasets();
        var ds = datasets.find(function(d){ return d.id === dsid; });
        if (ds) {
          ds.downloads = (ds.downloads || 0) + 1;
          saveDatasets(datasets);
          // Update displayed count on page
          var countEl = document.getElementById('ds-download-count');
          if (countEl) countEl.textContent = ds.downloads;
        }
      }

      showToast('Added "' + name + '" to your order. A secure payment step would appear here once the gateway is connected.');
    });
  });
}

/* ============================================================
   AUTH FORMS
   ============================================================ */
function initAuthForms() {
  // Login
  var loginForm = document.querySelector('[data-auth-form="login"]');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      clearFormErrors(loginForm);
      var email = val('login-email').toLowerCase();
      var pw    = val('login-password');
      var ok    = true;
      if (!email) { markError('login-email',    'Email address is required.'); ok=false; }
      if (!pw)    { markError('login-password', 'Password is required.');      ok=false; }
      if (!ok) return;
      var user = getUsers().find(function(u){ return u.email===email && u.passwordHash===hashPw(pw); });
      if (!user) { showToast('Incorrect email or password. Please try again.'); return; }
      setCurrentUser(user);
      showToast('Welcome back, '+user.firstName+'!');
      setTimeout(function(){
        // Admin goes to admin dashboard; regular users go to home page
        window.location.href = user.isAdmin ? 'admin-dashboard.html' : 'index.html';
      }, 1200);
    });
  }

  // Register
  var regForm = document.querySelector('[data-auth-form="register"]');
  if (regForm) {
    regForm.addEventListener('submit', function(e) {
      e.preventDefault();
      clearFormErrors(regForm);
      var firstName  = val('reg-firstname');
      var lastName   = val('reg-lastname');
      var otherNames = val('reg-othernames');
      var email      = val('reg-email').toLowerCase();
      var pw         = val('reg-password');
      var confirmPw  = val('reg-confirm-password');
      var ok = true;
      if (!firstName) { markError('reg-firstname','First name is required.');            ok=false; }
      if (!lastName)  { markError('reg-lastname', 'Last name is required.');             ok=false; }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                        markError('reg-email',    'Please enter a valid email address.'); ok=false; }
      if (pw.length<8){ markError('reg-password','Password must be at least 8 characters.'); ok=false; }
      if (pw!==confirmPw){ markError('reg-confirm-password','Passwords do not match.'); ok=false; }
      if (!ok) return;
      var users = getUsers();
      if (users.find(function(u){ return u.email===email; })) {
        showToast('An account with that email already exists. Please log in.'); return;
      }
      var newUser = {
        id:genId('u'), firstName:firstName, lastName:lastName, otherNames:otherNames,
        email:email, passwordHash:hashPw(pw), isAdmin:false, createdAt:new Date().toISOString()
      };
      users.push(newUser);
      saveUsers(users);
      setCurrentUser(newUser);
      showToast('Account created! Welcome, '+firstName+'.');
      // New users land on the home page
      setTimeout(function(){ window.location.href='index.html'; }, 1200);
    });
  }
}

function markError(inputId, message) {
  var el = document.getElementById(inputId); if (!el) return;
  var wrapper = el.closest('.field'); if (!wrapper) return;
  wrapper.classList.add('has-error');
  var errEl = wrapper.querySelector('.field-error');
  if (errEl) errEl.textContent = message;
}
function clearFormErrors(form) {
  form.querySelectorAll('.field').forEach(function(f){ f.classList.remove('has-error'); });
}

/* ============================================================
   ABOUT PAGE — load from localStorage
   ============================================================ */
function initAboutPage() {
  if (!document.getElementById('about-content')) return;
  var c = getSiteContent();
  if (!c || !c.about) return;
  var a = c.about;
  setText('about-initials', a.initials);
  setText('about-name',     a.researcherName);
  setText('about-dept',     a.department);
  setText('about-bio1',     a.bio1);
  setText('about-bio2',     a.bio2);
  var credList = document.getElementById('about-credentials');
  if (credList && a.credentials) {
    credList.innerHTML = '';
    a.credentials.forEach(function(cred) {
      var li = document.createElement('li'); li.textContent = cred;
      credList.appendChild(li);
    });
  }
}

/* ============================================================
   CONTACT PAGE — load clickable info from localStorage
   ============================================================ */
function initContactPage() {
  var c = getSiteContent();
  if (!c || !c.contact) return;
  var emailEl = document.getElementById('contact-email-link');
  if (emailEl) { emailEl.href = 'mailto:'+c.contact.email; emailEl.textContent = c.contact.email; }
  var phoneEl = document.getElementById('contact-phone-link');
  if (phoneEl) { phoneEl.href = 'tel:'+c.contact.phone.replace(/\s/g,''); phoneEl.textContent = c.contact.phone; }
}

/* ============================================================
   SUPPORT TICKET FORM
   ============================================================ */
function initTicketForm() {
  var form = document.getElementById('ticket-form');
  if (!form) return;
  var user       = getCurrentUser();
  var nameField  = document.getElementById('ticket-name');
  var emailField = document.getElementById('ticket-email');

  if (user) {
    if (nameField)  { nameField.value  = user.firstName+' '+user.lastName; nameField.readOnly  = true; }
    if (emailField) { emailField.value = user.email;                        emailField.readOnly = true; }
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var name     = nameField  ? nameField.value.trim()  : '';
    var email    = emailField ? emailField.value.trim() : '';
    var subject  = val('ticket-subject');
    var category = val('ticket-category');
    var message  = val('ticket-message');
    if (!name || !email || !subject || !category || !message) {
      showToast('Please fill in all required fields.'); return;
    }
    var tickets = getTickets();
    var refNum  = 'TKT-'+String(tickets.length+1).padStart(5,'0');
    tickets.push({
      ref:refNum, name:name, email:email,
      subject:subject, category:category, message:message,
      status:'Open', createdAt:new Date().toISOString()
    });
    saveTickets(tickets);
    form.style.display = 'none';
    var confirm = document.getElementById('ticket-confirm');
    if (confirm) {
      setText('ticket-ref-num', refNum);
      confirm.style.display = 'block';
    }
  });
}

/* ============================================================
   SEED DATASETS (used as fallback when localStorage is empty)
   ============================================================ */
var SEED_DATASETS = [
  { id:'seed-001', title:'SME Tax Compliance Panel, 2015–2024',
    description:'Firm-level compliance and filing behaviour across 4,200 small and medium enterprises.',
    category:'Taxation', tags:['Taxation','Panel data'], price:4500, downloads:0,
    uploadedBy:'admin@researchhub.ng',
    createdAt:'2024-01-10T00:00:00.000Z' },
  { id:'seed-002', title:'Audit Fee Determinants Dataset',
    description:'Ten years of audit fee, tenure and firm-size data across listed companies in 12 markets.',
    category:'Auditing', tags:['Auditing','Cross-country'], price:5000, downloads:0,
    uploadedBy:'admin@researchhub.ng',
    createdAt:'2024-02-14T00:00:00.000Z' },
  { id:'seed-003', title:'Corporate Governance Index Data',
    description:'Governance scoring for 600 emerging-market firms, built from board and disclosure records.',
    category:'Governance', tags:['Governance','Emerging markets'], price:4800, downloads:0,
    uploadedBy:'admin@researchhub.ng',
    createdAt:'2024-03-01T00:00:00.000Z' },
  { id:'seed-004', title:'SME Working Capital Survey',
    description:'Survey responses on liquidity management practices from 1,050 small business owners.',
    category:'Corporate finance', tags:['Corporate finance','Survey data'], price:3500, downloads:0,
    uploadedBy:'admin@researchhub.ng',
    createdAt:'2024-04-05T00:00:00.000Z' },
  { id:'seed-005', title:'Informal Sector Revenue Estimates',
    description:'Municipal-level revenue estimates for informal trading activity across 40 districts.',
    category:'Economics', tags:['Economics','Regional data'], price:2500, downloads:0,
    uploadedBy:'admin@researchhub.ng',
    createdAt:'2024-05-20T00:00:00.000Z' },
  { id:'seed-006', title:'Dividend Policy Panel, 2012–2023',
    description:'Payout ratios and dividend announcements for 300 listed firms over eleven years.',
    category:'Corporate finance', tags:['Corporate finance','Panel data'], price:4900, downloads:0,
    uploadedBy:'admin@researchhub.ng',
    createdAt:'2024-06-11T00:00:00.000Z' }
];

/* Returns all datasets: uploaded first (newest), then seeds that don't overlap */
function getAllDatasets() {
  var uploaded = getDatasets();
  var uploadedIds = uploaded.map(function(d){ return d.id; });
  var seeds = SEED_DATASETS.filter(function(s){ return uploadedIds.indexOf(s.id) === -1; });
  return uploaded.concat(seeds);
}

/* ============================================================
   HOME PAGE — live recent papers + featured datasets
   ============================================================ */
function initHomePage() {
  var page = currentPage();
  if (page !== 'index.html' && page !== '') return;

  var all = getAllDatasets();

  // Sort by createdAt descending (newest first)
  var sorted = all.slice().sort(function(a, b){
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  /* --- Ledger card (recently added) --- */
  var ledgerContainer = document.getElementById('home-ledger-rows');
  if (ledgerContainer) {
    ledgerContainer.innerHTML = '';
    var recent = sorted.slice(0, 4);
    if (recent.length === 0) {
      ledgerContainer.innerHTML = '<div class="ledger-row"><span class="name">No datasets yet.</span></div>';
    } else {
      recent.forEach(function(ds) {
        var row = document.createElement('div');
        row.className = 'ledger-row';
        var meta = ds.category || '';
        row.innerHTML =
          '<span class="name">' + escHtml(ds.title) +
            (meta ? '<span class="meta">' + escHtml(meta) + '</span>' : '') +
          '</span>' +
          '<span class="amount">₦' + Number(ds.price).toLocaleString() + '</span>';
        row.style.cursor = 'pointer';
        row.addEventListener('click', function(){
          window.location.href = 'dataset.html?id=' + encodeURIComponent(ds.id);
        });
        ledgerContainer.appendChild(row);
      });
    }
  }

  /* --- Featured datasets section --- */
  var featuredList = document.getElementById('home-featured-list');
  if (featuredList) {
    featuredList.innerHTML = '';
    var featured = sorted.slice(0, 3);
    if (featured.length === 0) {
      featuredList.innerHTML = '<p style="color:var(--ink-soft);padding:16px 0;">No datasets have been uploaded yet.</p>';
    } else {
      featured.forEach(function(ds) {
        var tags = (ds.tags || [ds.category]).slice(0, 2);
        var tagHtml = tags.map(function(t){ return '<span class="tag">' + escHtml(t || '') + '</span>'; }).join('');
        var a = document.createElement('a');
        a.href = 'dataset.html?id=' + encodeURIComponent(ds.id);
        a.className = 'data-item';
        a.innerHTML =
          '<div>' +
            '<h3 class="data-title">' + escHtml(ds.title) + '</h3>' +
            '<p class="data-desc">' + escHtml(ds.description || '') + '</p>' +
            '<div class="data-tags">' + tagHtml + '</div>' +
          '</div>' +
          '<div class="data-stats"><span class="dl-icon">⬇</span> ' + (ds.downloads || 0) + '</div>' +
          '<div class="data-price">₦' + Number(ds.price).toLocaleString() + '</div>';
        featuredList.appendChild(a);
      });
    }
  }
}

/* ============================================================
   BROWSE — always render dynamically from localStorage
   ============================================================ */
function initBrowsePage() {
  var list = document.getElementById('dataset-list'); if (!list) return;

  var all = getAllDatasets();

  // Sort newest first
  all.sort(function(a, b){ return new Date(b.createdAt) - new Date(a.createdAt); });

  list.innerHTML = '';
  all.forEach(function(ds) {
    var tags = (ds.tags || []).slice(0, 2);
    if (!tags.length && ds.category) tags = [ds.category];
    var tagHtml = tags.map(function(t){ return '<span class="tag">' + escHtml(t) + '</span>'; }).join('');
    var catLower = (ds.category || '').toLowerCase().replace(/\s+/g, '_');
    var a = document.createElement('a');
    a.href = 'dataset.html?id=' + encodeURIComponent(ds.id);
    a.className = 'data-item';
    a.setAttribute('data-category', catLower);
    a.setAttribute('data-search', (ds.title + ' ' + (ds.description||'') + ' ' + (ds.tags||[]).join(' ')).toLowerCase());
    a.setAttribute('data-dsid', ds.id);
    a.innerHTML =
      '<div>' +
        '<h3 class="data-title">' + escHtml(ds.title) + '</h3>' +
        '<p class="data-desc">'  + escHtml(ds.description || '') + '</p>' +
        '<div class="data-tags">' + tagHtml + '</div>' +
      '</div>' +
      '<div class="data-stats"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14" style="vertical-align:middle;margin-right:3px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>' + (ds.downloads || 0) + '</div>' +
      '<div class="data-price">₦' + Number(ds.price).toLocaleString() + '</div>';
    list.appendChild(a);
  });
}

function initSearchFilter() {
  var searchInput = document.getElementById('dataset-search');
  var list        = document.getElementById('dataset-list');
  if (!list) return;
  var emptyState = document.getElementById('empty-state');

  function getItems() {
    return Array.prototype.slice.call(list.querySelectorAll('.data-item'));
  }

  var checkboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');

  function applyFilters() {
    var items = getItems();
    var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var activeCats = Array.prototype.slice.call(checkboxes)
      .filter(function(c){ return c.checked; }).map(function(c){ return c.value.toLowerCase().replace(/\s+/g,'_'); });
    var visible = 0;
    items.forEach(function(item) {
      var text = (item.getAttribute('data-search')||'').toLowerCase();
      var cat  =  item.getAttribute('data-category')||'';
      var show = (!query || text.indexOf(query)!==-1) && (activeCats.length===0 || activeCats.indexOf(cat)!==-1);
      item.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    if (emptyState) emptyState.style.display = visible===0 ? 'block' : 'none';
  }
  if (searchInput) searchInput.addEventListener('input', applyFilters);
  checkboxes.forEach(function(c){ c.addEventListener('change', applyFilters); });
}

/* ============================================================
   DATASET DETAIL PAGE — load from URL ?id= param
   ============================================================ */
function initDatasetPage() {
  if (currentPage() !== 'dataset.html') return;

  var dsid = getUrlParam('id');
  var all  = getAllDatasets();
  var ds   = null;

  if (dsid) {
    ds = all.find(function(d){ return d.id === dsid; });
  }
  if (!ds && all.length > 0) {
    ds = all[0]; // fallback to first available
  }
  if (!ds) {
    // No datasets at all — show a message
    var main = document.getElementById('main');
    if (main) main.innerHTML = '<section><div class="wrap"><p style="padding:40px 0;color:var(--ink-soft);">No dataset found. <a href="browse.html">Browse all datasets &rarr;</a></p></div></section>';
    return;
  }

  // Update page title
  document.title = escHtml(ds.title) + ' — Research Hub';

  // Breadcrumb
  setText('ds-category-crumb', ds.category || 'Research');

  // Main content
  setText('ds-title',       ds.title);
  setText('ds-description', ds.description || '');
  setText('ds-category',    ds.category || '—');
  setText('ds-price',       '₦' + Number(ds.price).toLocaleString());
  setText('ds-uploader',    ds.uploadedBy || '—');
  setText('ds-download-count', ds.downloads || 0);

  // Date
  if (ds.createdAt) {
    setText('ds-date', new Date(ds.createdAt).toLocaleDateString('en-NG', {year:'numeric',month:'long',day:'numeric'}));
  }

  // Tags
  var tagsEl = document.getElementById('ds-tags');
  if (tagsEl) {
    var tags = ds.tags || (ds.category ? [ds.category] : []);
    tagsEl.innerHTML = tags.map(function(t){ return '<span class="tag">' + escHtml(t) + '</span>'; }).join('');
  }

  // Buy button — wire up data attributes
  var buyBtn = document.getElementById('ds-buy-btn');
  if (buyBtn) {
    buyBtn.setAttribute('data-buy',  ds.title);
    buyBtn.setAttribute('data-dsid', ds.id);
  }

  // Buy panel price display
  var priceEl = document.getElementById('ds-buy-price');
  if (priceEl) priceEl.textContent = '₦' + Number(ds.price).toLocaleString();

  // File download link — if file data was stored as base64
  var fileLink = document.getElementById('ds-file-link');
  if (fileLink) {
    if (ds.fileData) {
      fileLink.href = ds.fileData;
      fileLink.download = ds.fileName || (ds.title + '.pdf');
      fileLink.style.display = 'inline';
      fileLink.textContent = 'Download full paper (' + (ds.fileName || 'file') + ')';
    } else if (ds.fileName) {
      fileLink.textContent = ds.fileName + ' (file stored externally)';
      fileLink.removeAttribute('href');
      fileLink.style.color = 'var(--ink-soft)';
    } else {
      fileLink.style.display = 'none';
    }
  }
}

/* ============================================================
   USER DASHBOARD / MY PROFILE
   ============================================================ */
function initUserDashboard() {
  if (!document.getElementById('dashboard-main')) return;
  var user = getCurrentUser();
  if (!user) return;

  var fullName = user.firstName+' '+user.lastName+(user.otherNames?' '+user.otherNames:'');
  setText('dash-name',   fullName);
  setText('dash-email',  user.email);
  setText('dash-role',   user.isAdmin ? 'Administrator' : 'Researcher');
  setText('dash-joined', new Date(user.createdAt).toLocaleDateString('en-NG',{year:'numeric',month:'long',day:'numeric'}));

  var adminLink = document.getElementById('dash-admin-link');
  if (adminLink) adminLink.style.display = user.isAdmin ? 'inline-flex' : 'none';

  var logoutBtn = document.getElementById('dash-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault(); clearCurrentUser(); window.location.href='index.html';
    });
  }

  // Mirror to detail table
  setTimeout(function() {
    var m = function(f,t){ var s=document.getElementById(f),d=document.getElementById(t); if(s&&d) d.textContent=s.textContent; };
    m('dash-name','dash-name-detail'); m('dash-email','dash-email-detail');
    m('dash-role','dash-role-detail'); m('dash-joined','dash-joined-detail');
  }, 60);

  // Recent transfers
  var payments = getPayments().filter(function(p){ return p.userEmail===user.email; });
  var tbody = document.getElementById('transfers-tbody');
  var emptyState = document.getElementById('transfers-empty');
  var tableWrap  = document.getElementById('transfers-table-wrap');
  if (tbody) {
    if (payments.length===0) {
      if (emptyState) emptyState.style.display='block';
      if (tableWrap)  tableWrap.style.display='none';
    } else {
      if (emptyState) emptyState.style.display='none';
      var totalSpent = payments.reduce(function(s,p){ return s+Number(p.amount); }, 0);
      setText('dash-total-spent',        '₦'+totalSpent.toLocaleString());
      setText('dash-total-purchases',    String(payments.length));
      setText('dash-total-purchases-dl', String(payments.length));
      payments.slice().reverse().forEach(function(p) {
        var tr = document.createElement('tr');
        tr.innerHTML =
          '<td>'+new Date(p.createdAt).toLocaleDateString('en-NG')+'</td>'+
          '<td>'+escHtml(p.datasetTitle)+'</td>'+
          '<td>₦'+Number(p.amount).toLocaleString()+'</td>'+
          '<td><span class="status-badge status-'+p.status.toLowerCase()+'">'+escHtml(p.status)+'</span></td>';
        tbody.appendChild(tr);
      });
    }
  }
}

/* ============================================================
   ADMIN — DASHBOARD STATS
   ============================================================ */
function initAdminDashboard() {
  if (!document.getElementById('admin-dash-stats')) return;
  var datasets  = getDatasets();
  var users     = getUsers();
  var payments  = getPayments();
  var totalDL   = datasets.reduce(function(s,d){ return s+(d.downloads||0); }, 0);
  var totalRev  = payments.reduce(function(s,p){ return s+Number(p.amount); }, 0);
  setText('stat-papers',    String(datasets.length));
  setText('stat-downloads', String(totalDL));
  setText('stat-revenue',   '₦'+totalRev.toLocaleString());
  setText('stat-users',     String(users.length));

  // Recent activity
  var actEl = document.getElementById('admin-recent-activity');
  if (!actEl) return;
  var allEvents = [];
  getUsers().slice(-3).forEach(function(u){ allEvents.push({type:'user',label:'New user registered: '+escHtml(u.firstName+' '+u.lastName),date:u.createdAt}); });
  getTickets().slice(-3).forEach(function(t){ allEvents.push({type:'ticket',label:'Support ticket '+escHtml(t.ref)+': '+escHtml(t.subject),date:t.createdAt}); });
  getPayments().slice(-3).forEach(function(p){ allEvents.push({type:'payment',label:'Payment received — '+escHtml(p.datasetTitle)+' ₦'+Number(p.amount).toLocaleString(),date:p.createdAt}); });
  allEvents.sort(function(a,b){ return new Date(b.date)-new Date(a.date); });
  actEl.innerHTML = '';
  if (allEvents.length===0) { actEl.innerHTML='<p style="color:var(--ink-soft);padding:16px 0;">No recent activity yet.</p>'; return; }
  allEvents.slice(0,8).forEach(function(ev) {
    var div = document.createElement('div');
    div.className = 'activity-item activity-'+ev.type;
    div.innerHTML = '<span class="activity-label">'+ev.label+'</span><span class="activity-date">'+new Date(ev.date).toLocaleDateString('en-NG')+'</span>';
    actEl.appendChild(div);
  });
}

/* ============================================================
   ADMIN — USERS
   ============================================================ */
function initAdminUsers() {
  if (!document.getElementById('admin-users-tbody')) return;
  renderAdminUsers();
}
function renderAdminUsers() {
  var tbody = document.getElementById('admin-users-tbody'); if (!tbody) return;
  var users = getUsers();
  tbody.innerHTML = '';
  users.forEach(function(u) {
    var prot = u.id==='admin-seed-001';
    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td>'+escHtml(u.firstName+' '+u.lastName)+(u.otherNames?' <span class="other-names">'+escHtml(u.otherNames)+'</span>':'')+'</td>'+
      '<td>'+escHtml(u.email)+'</td>'+
      '<td>'+new Date(u.createdAt).toLocaleDateString('en-NG')+'</td>'+
      '<td><span class="role-badge '+(u.isAdmin?'role-admin':'role-user')+'">'+(u.isAdmin?'Admin':'User')+'</span></td>'+
      '<td>'+(prot?'<span style="font-size:0.8rem;color:var(--ink-soft);">Protected</span>':
        '<button class="btn btn-small '+(u.isAdmin?'btn-secondary':'btn-primary')+' toggle-admin-btn" data-uid="'+escHtml(u.id)+'">'+(u.isAdmin?'Revoke Admin':'Make Admin')+'</button>')+'</td>';
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll('.toggle-admin-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var uid = btn.getAttribute('data-uid');
      var users = getUsers();
      var target = users.find(function(u){ return u.id===uid; }); if(!target) return;
      target.isAdmin = !target.isAdmin;
      saveUsers(users);
      showToast(target.firstName+' '+target.lastName+(target.isAdmin?' is now an admin.':"'s admin role removed."));
      renderAdminUsers();
    });
  });
}

/* ============================================================
   ADMIN — PAPERS
   ============================================================ */
function initAdminPapers() {
  if (!document.getElementById('admin-papers-tbody')) return;
  renderAdminPapers();
}
function renderAdminPapers() {
  var tbody = document.getElementById('admin-papers-tbody'); if (!tbody) return;
  var datasets = getDatasets();
  tbody.innerHTML = '';
  if (!datasets.length) {
    tbody.innerHTML='<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--ink-soft);">No datasets uploaded yet.</td></tr>'; return;
  }
  datasets.forEach(function(ds) {
    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td>'+escHtml(ds.title)+'</td>'+
      '<td>'+escHtml(ds.category)+'</td>'+
      '<td>₦'+Number(ds.price).toLocaleString()+'</td>'+
      '<td class="dl-stat">⬇ '+(ds.downloads||0)+'</td>'+
      '<td>'+escHtml(ds.uploadedBy||'—')+'</td>'+
      '<td>'+new Date(ds.createdAt).toLocaleDateString('en-NG')+'</td>'+
      '<td><button class="btn btn-small btn-secondary delete-ds-btn" data-dsid="'+escHtml(ds.id)+'">Delete</button></td>';
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll('.delete-ds-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      if (!confirm('Delete this dataset? This cannot be undone.')) return;
      var dsid = btn.getAttribute('data-dsid');
      saveDatasets(getDatasets().filter(function(d){ return d.id!==dsid; }));
      showToast('Dataset deleted.'); renderAdminPapers();
    });
  });
}

/* ============================================================
   ADMIN — UPLOAD (PDF / DOCX only) — stores file as base64
   ============================================================ */
function initAdminUpload() {
  var form      = document.getElementById('admin-upload-form'); if (!form) return;
  var fileInput = document.getElementById('a-file');

  // Restrict file picker to PDF / DOCX at the browser level
  if (fileInput) {
    fileInput.setAttribute('accept', '.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var title    = val('a-title');
    var desc     = val('a-description');
    var category = val('a-category');
    var price    = Number(val('a-price'));
    var user     = getCurrentUser();

    if (!title || !category || !price) { showToast('Please fill in all required fields.'); return; }
    if (price > 5000) { showToast('Price cannot exceed ₦5,000.'); return; }

    var file = fileInput && fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;

    // File type validation
    if (file) {
      var name = file.name.toLowerCase();
      var ok   = name.endsWith('.pdf') || name.endsWith('.docx');
      if (!ok) {
        showToast('Only PDF and DOCX files are accepted.');
        return;
      }
    }

    // Tags from category
    var tags = category ? [category] : [];

    if (file) {
      // Read file as base64 DataURL so it can be served from localStorage
      var reader = new FileReader();
      reader.onload = function(ev) {
        var dataUrl = ev.target.result;
        saveNewDataset(title, desc, category, tags, price, user, file.name, file.type, dataUrl);
      };
      reader.onerror = function() {
        showToast('Could not read file. Please try again.');
      };
      reader.readAsDataURL(file);
    } else {
      saveNewDataset(title, desc, category, tags, price, user, '', '', null);
    }
  });

  function saveNewDataset(title, desc, category, tags, price, user, fileName, fileType, fileData) {
    var datasets = getDatasets();
    var record = {
      id:          genId('ds'),
      title:       title,
      description: desc,
      category:    category,
      tags:        tags,
      price:       price,
      downloads:   0,
      uploadedBy:  user ? user.email : 'admin',
      fileName:    fileName,
      fileType:    fileType,
      createdAt:   new Date().toISOString()
    };
    if (fileData) record.fileData = fileData;
    datasets.push(record);
    saveDatasets(datasets);
    form.reset();
    showToast('"' + title + '" added to the archive successfully.');
  }
}

/* ============================================================
   ADMIN — PAYMENTS
   ============================================================ */
function initAdminPayments() {
  var tbody = document.getElementById('admin-payments-tbody'); if (!tbody) return;
  var payments = getPayments();
  tbody.innerHTML = '';
  if (!payments.length) {
    tbody.innerHTML='<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--ink-soft);">No payment records yet.</td></tr>'; return;
  }
  payments.slice().reverse().forEach(function(p) {
    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td>'+new Date(p.createdAt).toLocaleDateString('en-NG')+'</td>'+
      '<td>'+escHtml(p.userName||'—')+'</td>'+
      '<td>'+escHtml(p.userEmail||'—')+'</td>'+
      '<td>'+escHtml(p.datasetTitle||'—')+'</td>'+
      '<td>₦'+Number(p.amount).toLocaleString()+'</td>'+
      '<td><span class="status-badge status-'+(p.status||'pending').toLowerCase()+'">'+escHtml(p.status||'Pending')+'</span></td>';
    tbody.appendChild(tr);
  });
}

/* ============================================================
   ADMIN — TICKETS
   ============================================================ */
function initAdminTickets() {
  if (!document.getElementById('admin-tickets-tbody')) return;
  renderAdminTickets();

  // Modal close
  var closeBtn = document.getElementById('modal-close');
  var modal    = document.getElementById('ticket-modal');
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', function(){ modal.style.display='none'; });
    modal.addEventListener('click', function(e){ if(e.target===modal) modal.style.display='none'; });
  }
}
function renderAdminTickets() {
  var tbody = document.getElementById('admin-tickets-tbody'); if (!tbody) return;
  var tickets = getTickets();
  tbody.innerHTML = '';
  if (!tickets.length) {
    tbody.innerHTML='<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--ink-soft);">No support tickets yet.</td></tr>'; return;
  }
  tickets.slice().reverse().forEach(function(t) {
    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td><strong>'+escHtml(t.ref)+'</strong></td>'+
      '<td>'+new Date(t.createdAt).toLocaleDateString('en-NG')+'</td>'+
      '<td>'+escHtml(t.name)+'<br><small style="color:var(--ink-soft);">'+escHtml(t.email)+'</small></td>'+
      '<td><span class="tag">'+escHtml(t.category)+'</span></td>'+
      '<td>'+escHtml(t.subject)+'</td>'+
      '<td><span class="status-badge status-'+t.status.toLowerCase()+'">'+t.status+'</span></td>'+
      '<td>'+
        '<button class="btn btn-small btn-secondary view-ticket-btn" data-ref="'+escHtml(t.ref)+'">View</button> '+
        (t.status==='Open'?'<button class="btn btn-small btn-primary resolve-ticket-btn" data-ref="'+escHtml(t.ref)+'">Resolve</button>':'')+
      '</td>';
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll('.view-ticket-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var ref = btn.getAttribute('data-ref');
      var ticket = getTickets().find(function(t){ return t.ref===ref; }); if (!ticket) return;
      var modal = document.getElementById('ticket-modal'); if (!modal) return;
      setText('modal-ref',      ticket.ref);
      setText('modal-from',     ticket.name+' ('+ticket.email+')');
      setText('modal-subject',  ticket.subject);
      setText('modal-category', ticket.category);
      setText('modal-message',  ticket.message);
      setText('modal-status',   ticket.status);
      setText('modal-date',     new Date(ticket.createdAt).toLocaleString('en-NG'));
      modal.style.display = 'flex';
    });
  });
  tbody.querySelectorAll('.resolve-ticket-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var ref = btn.getAttribute('data-ref');
      var tickets = getTickets();
      var target  = tickets.find(function(t){ return t.ref===ref; }); if (!target) return;
      target.status = 'Resolved';
      saveTickets(tickets);
      showToast('Ticket '+ref+' marked as resolved.');
      renderAdminTickets();
      // Update sidebar badge
      var openCount = tickets.filter(function(t){ return t.status==='Open'; }).length;
      var badge = document.querySelector('.admin-nav-link[href="admin-tickets.html"] .nav-badge');
      if (badge) { if (openCount>0) badge.textContent=String(openCount); else badge.remove(); }
    });
  });
}

/* ============================================================
   ADMIN — PROFILE (personal info + password change only)
   ============================================================ */
function initAdminProfile() {
  var profileForm = document.getElementById('admin-profile-form'); if (!profileForm) return;
  var user = getCurrentUser(); if (!user) return;

  // Pre-fill
  setVal('ap-firstname',  user.firstName);
  setVal('ap-lastname',   user.lastName);
  setVal('ap-othernames', user.otherNames || '');
  setVal('ap-email',      user.email);

  // Display info
  setText('ap-display-name',  user.firstName + ' ' + user.lastName);
  setText('ap-display-email', user.email);
  setText('ap-display-role',  user.isAdmin ? 'Administrator' : 'Researcher');
  setText('ap-display-joined', new Date(user.createdAt).toLocaleDateString('en-NG', {year:'numeric',month:'long',day:'numeric'}));

  // Save personal info
  profileForm.addEventListener('submit', function(e) {
    e.preventDefault();
    var users = getUsers();
    var idx = users.findIndex(function(u){ return u.id === user.id; }); if (idx === -1) return;
    var fn = val('ap-firstname'); var ln = val('ap-lastname'); var on = val('ap-othernames');
    if (fn) users[idx].firstName  = fn;
    if (ln) users[idx].lastName   = ln;
    users[idx].otherNames = on;
    saveUsers(users);
    setCurrentUser(users[idx]);
    user = users[idx];
    setText('ap-display-name', users[idx].firstName + ' ' + users[idx].lastName);
    showToast('Profile updated successfully.');
  });

  // Password change
  var pwForm = document.getElementById('admin-pw-form');
  if (pwForm) {
    pwForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var u = getCurrentUser(); if (!u) return;
      var curPw = val('ap-current-pw');
      var newPw = val('ap-new-pw');
      var conPw = val('ap-confirm-pw');
      if (!curPw || !newPw || !conPw) { showToast('Please fill in all password fields.'); return; }
      if (u.passwordHash !== hashPw(curPw))  { showToast('Current password is incorrect.'); return; }
      if (newPw.length < 8) { showToast('New password must be at least 8 characters.'); return; }
      if (newPw !== conPw)  { showToast('New passwords do not match.'); return; }
      var users = getUsers();
      var idx   = users.findIndex(function(u2){ return u2.id === u.id; }); if (idx === -1) return;
      users[idx].passwordHash = hashPw(newPw);
      saveUsers(users);
      setCurrentUser(users[idx]);
      pwForm.reset();
      showToast('Password changed successfully.');
    });
  }
}

/* ============================================================
   ADMIN — CONTENT EDITOR (About + Contact pages)
   ============================================================ */
function initAdminContent() {
  var aboutForm   = document.getElementById('admin-about-form');
  var contactForm = document.getElementById('admin-contact-form');
  if (!aboutForm && !contactForm) return;

  var c = getSiteContent();
  if (c) {
    if (c.about) {
      setVal('sc-researcher-name', c.about.researcherName || '');
      setVal('sc-department',      c.about.department     || '');
      setVal('sc-initials',        c.about.initials       || '');
      setVal('sc-bio1',            c.about.bio1           || '');
      setVal('sc-bio2',            c.about.bio2           || '');
      setVal('sc-credentials',     (c.about.credentials   || []).join('\n'));
    }
    if (c.contact) {
      setVal('sc-email', c.contact.email || '');
      setVal('sc-phone', c.contact.phone || '');
    }
  }

  if (aboutForm) {
    aboutForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var c = getSiteContent() || { about:{}, contact:{} };
      if (!c.about) c.about = {};
      c.about.researcherName = val('sc-researcher-name');
      c.about.department     = val('sc-department');
      c.about.initials       = val('sc-initials');
      c.about.bio1           = val('sc-bio1');
      c.about.bio2           = val('sc-bio2');
      c.about.credentials    = val('sc-credentials').split('\n').map(function(s){ return s.trim(); }).filter(Boolean);
      saveSiteContent(c);
      showToast('About page saved. Changes are now live.');
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var c = getSiteContent() || { about:{}, contact:{} };
      if (!c.contact) c.contact = {};
      c.contact.email = val('sc-email');
      c.contact.phone = val('sc-phone');
      saveSiteContent(c);
      showToast('Contact info saved. Changes are now live.');
    });
  }
}

/* ============================================================
   USER — PROFILE EDIT (name + password change in dashboard)
   ============================================================ */
function initProfileEditForms() {
  if (currentPage() !== 'dashboard.html') return;
  var user = getCurrentUser(); if (!user) return;

  // Pre-fill profile form
  setVal('up-firstname',  user.firstName);
  setVal('up-lastname',   user.lastName);
  setVal('up-othernames', user.otherNames || '');

  var infoForm = document.getElementById('user-profile-form');
  if (infoForm) {
    infoForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var fn = val('up-firstname'); var ln = val('up-lastname'); var on = val('up-othernames');
      if (!fn || !ln) { showToast('First and last name are required.'); return; }
      var users = getUsers();
      var idx   = users.findIndex(function(u){ return u.id === user.id; }); if (idx === -1) return;
      users[idx].firstName  = fn;
      users[idx].lastName   = ln;
      users[idx].otherNames = on;
      saveUsers(users);
      setCurrentUser(users[idx]);
      user = users[idx];
      var full = fn + ' ' + ln + (on ? ' ' + on : '');
      setText('dash-name',        full);
      setText('dash-name-detail', full);
      showToast('Profile updated.');
    });
  }

  // Password change
  var pwForm = document.getElementById('user-pw-form');
  if (pwForm) {
    pwForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var u = getCurrentUser(); if (!u) return;
      var curPw = val('up-current-pw');
      var newPw = val('up-new-pw');
      var conPw = val('up-confirm-pw');
      if (!curPw || !newPw || !conPw) { showToast('Please fill in all password fields.'); return; }
      if (u.passwordHash !== hashPw(curPw))  { showToast('Current password is incorrect.'); return; }
      if (newPw.length < 8) { showToast('New password must be at least 8 characters.'); return; }
      if (newPw !== conPw)  { showToast('New passwords do not match.'); return; }
      var users = getUsers();
      var idx   = users.findIndex(function(u2){ return u2.id === u.id; }); if (idx === -1) return;
      users[idx].passwordHash = hashPw(newPw);
      saveUsers(users);
      setCurrentUser(users[idx]);
      pwForm.reset();
      showToast('Password changed successfully.');
    });
  }
}

/* ============================================================
   UTILITY — set a field value by id
   ============================================================ */
function setVal(id, v) { var el = document.getElementById(id); if (el) el.value = v; }
