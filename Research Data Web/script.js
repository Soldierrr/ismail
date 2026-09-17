// Ledger — Research Data Marketplace
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
    initSearchFilter();
    initUserDashboard();
    initProfileEditForms();
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
   SEEDING
   ============================================================ */
function seedAdmin() {
  var users = getUsers();
  if (!users.some(function(u){ return u.email==='admin@ledger.ng'; })) {
    users.push({
      id:'admin-seed-001', firstName:'Ledger', lastName:'Admin', otherNames:'',
      email:'admin@ledger.ng', passwordHash:hashPw('Admin@1234'),
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
        bio1:'Dr. Kenton has spent two decades researching tax compliance, audit practice and corporate governance across emerging markets. Ledger was built to make that fieldwork — and the datasets built by colleagues working in the same space — available directly to the researchers who need it, without the delay of formal publication.',
        bio2:'Every dataset on Ledger has been cleaned, documented and anonymised to the same standard used in Dr. Kenton\'s own published work, so you can build on it with confidence.',
        credentials:[
          'PhD in Accounting, University of Lagos',
          'Associate Professor, Department of Accounting',
          '15+ peer-reviewed publications in taxation and governance research',
          'Consultant to national tax authorities on SME compliance'
        ]
      },
      contact:{ email:'contact@ledger.ng', phone:'+234 801 234 5678' }
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
   PUBLIC NAV — AUTH STATE (guest / user)
   Guest:  Log in link visible, no user widget
   User:   Log in link hidden, stacked name + role (not linked) + door logout
   ============================================================ */
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
      '<button id="nav-logout-btn" class="nav-logout-icon" title="Log out" aria-label="Log out">&#x1F6AA;</button>';
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

  // Logout — door emoji
  var logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) {
    logoutBtn.innerHTML = '&#x1F6AA; Log out';
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
   BUY BUTTONS
   ============================================================ */
function initBuyButtons() {
  document.querySelectorAll('[data-buy]').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      if (!getCurrentUser()) { showToast('Please log in to purchase a dataset.'); return; }
      var name = btn.getAttribute('data-buy');
      showToast('Added "'+name+'" to your order. A secure payment step would appear here once the gateway is connected.');
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
        window.location.href = user.isAdmin ? 'admin-dashboard.html' : 'dashboard.html';
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
      setTimeout(function(){ window.location.href='dashboard.html'; }, 1200);
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
   BROWSE — live search + filter
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
      .filter(function(c){ return c.checked; }).map(function(c){ return c.value; });
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
   ADMIN — UPLOAD
   ============================================================ */
function initAdminUpload() {
  var form = document.getElementById('admin-upload-form'); if (!form) return;
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var title    = val('a-title');
    var desc     = val('a-description');
    var category = val('a-category');
    var price    = Number(val('a-price'));
    var user     = getCurrentUser();
    if (!title||!category||!price) { showToast('Please fill in all required fields.'); return; }
    if (price>5000) { showToast('Price cannot exceed ₦5,000.'); return; }
    var datasets = getDatasets();
    datasets.push({
      id:genId('ds'), title:title, description:desc, category:category,
      price:price, downloads:0, uploadedBy:user?user.email:'admin', createdAt:new Date().toISOString()
    });
    saveDatasets(datasets);
    form.reset();
    showToast('"'+title+'" added to the archive successfully.');
  });
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
