import { supabase } from './supabase.js';
// Research Hub — Research Data Marketplace
// All data stored in localStorage (demo/template — NOT for production)

var USERS_KEY    = 'ledger_users';
var SESSION_KEY  = 'ledger_session';
var DATASETS_KEY = 'ledger_datasets';
var TICKETS_KEY  = 'ledger_tickets';
var PAYMENTS_KEY = 'ledger_payments';
var CONTENT_KEY  = 'ledger_site_content';
// Inject CSS to prevent auth state flashing on page load
const authHideStyle = document.createElement('style');
authHideStyle.id = 'auth-hide-style';
authHideStyle.innerHTML = '.nav-links a[href="login.html"], .nav-user-widget { opacity: 0 !important; pointer-events: none !important; transition: opacity 0.3s ease; }';
document.head.appendChild(authHideStyle);

document.addEventListener('DOMContentLoaded', function () {
  // Restore custom logo and favicon from localStorage on every page
  applyStoredBrandAssets();

  if (isAdminPage()) {
    initAdminPageGuard(function() {
      initAdminSidebar();
      initAdminDashboard();
      initAdminUsers();
      initAdminPapers();
      initAdminUpload();
      initAdminPayments();
      initAdminTickets();
      initAdminProfile();
      initAdminContent();
    });
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
    initStorefront();
    initDatasetPage();
  }
});

/* ============================================================
   SUPABASE STOREFRONT
   ============================================================ */
function initStorefront() {
  const page = currentPage();
  if (page !== 'index.html' && page !== '' && page !== 'browse.html') return;
  loadStorefrontPapers();
}

function initAdminUploadForm() {
  const form = document.getElementById('admin-upload-form');
  const btn = document.getElementById('admin-submit-btn');
  if (!form) return;
  
  // Need to remove previous listener if any, but since it's a demo we'll just assign onsubmit
  form.onsubmit = async (e) => {
    e.preventDefault();
    const title = document.getElementById('admin-paper-title').value;
    const price = document.getElementById('admin-paper-price').value;
    const file = document.getElementById('admin-paper-file').files[0];
    if (!file) return;

    btn.textContent = 'Uploading...';
    btn.disabled = true;

    try {
      const fileName = Date.now() + '_' + file.name;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('papers_bucket')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('papers_bucket')
        .getPublicUrl(fileName);
        
      const downloadURL = publicUrlData.publicUrl;

      const { error: insertError } = await supabase.from('papers').insert([
        {
          title: title,
          price: Number(price),
          file_url: downloadURL
        }
      ]);
      
      if (insertError) throw insertError;

      alert('Paper uploaded successfully!');
      form.reset();
    } catch (error) {
      console.error(error);
      alert('Error uploading paper: ' + error.message);
    } finally {
      btn.textContent = 'Upload to Storefront';
      btn.disabled = false;
    }
  };
}

async function loadStorefrontPapers() {
  const grid = document.getElementById('storefront-papers-grid');
  if (!grid) return;
  
  grid.innerHTML = '<p>Loading papers...</p>';
  try {
    const { data: papers, error } = await supabase.from('papers').select('*');
    if (error) throw error;
    
    grid.innerHTML = '';
    
    if (!papers || papers.length === 0) {
      grid.innerHTML = '<p style="grid-column: 1 / -1;">No papers available at the moment.</p>';
      return;
    }
    
    papers.forEach((data) => {
      const div = document.createElement('div');
      div.style.cssText = 'padding: 20px; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); display: flex; flex-direction: column;';
      div.innerHTML = `
        <h3 style="margin-bottom: 10px;">${escHtml(data.title || 'Untitled')}</h3>
        <p style="font-weight: bold; color: var(--primary); margin-bottom: 15px;">₦${Number(data.price || 0).toLocaleString()}</p>
        <div class="payment-action-container" style="margin-top: auto; display: flex; flex-direction: column; gap: 10px;">
          <a href="dataset.html?id=${data.id}" class="btn btn-primary" style="width: 100%; text-align: center;">See more details</a>
        </div>
      `;

      grid.appendChild(div);
    });
  } catch (error) {
    console.error(error);
    grid.innerHTML = '<p>Error loading papers.</p>';
  }
}

/* ============================================================
   BRAND ASSETS Ã¢â‚¬â€ apply stored logo / favicon from localStorage
   ============================================================ */
async function applyStoredBrandAssets() {
  try {
    const { data: settings } = await supabase.from('site_settings').select('*').eq('id', 1).single();
    if (settings) {
      if (settings.logo_url) {
        document.querySelectorAll('img[alt="Research Hub"]').forEach(function(img) {
          img.src = settings.logo_url;
        });
      }
      if (settings.favicon_url) {
        document.querySelectorAll('link[rel*="icon"]').forEach(function(el) {
          el.href = settings.favicon_url;
        });
      }
    }
  } catch (err) {
    console.warn("Could not load brand assets", err);
  }
}

/* ============================================================
   UTILITIES
   ============================================================ */
function isAdminPage() {
  var page = window.location.pathname.split('/').pop() || '';
  return page.indexOf('admin-') === 0 || page === 'admin.html';
}
function currentPage() {
  return window.location.pathname.split('/').pop() || 'index.html';
}

let cachedSessionUser = null;
let sessionUserPromise = null;

async function getSessionUser() {
  if (cachedSessionUser) return cachedSessionUser;
  if (sessionUserPromise) return sessionUserPromise;
  
  sessionUserPromise = new Promise(async (resolve) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      cachedSessionUser = null;
      resolve(null);
      return;
    }
    
    try {
      const { data: userDoc, error } = await supabase.from('users').select('*').eq('id', session.user.id).single();
      
      cachedSessionUser = {
        ...session.user,
        role: userDoc?.role || 'user',
        isAdmin: userDoc?.role === 'admin',
        first_name: userDoc?.first_name || session.user.user_metadata?.first_name || ''
      };
      
    } catch (err) {
      cachedSessionUser = { ...session.user, role: 'user', isAdmin: false, first_name: session.user?.user_metadata?.first_name || '' };
    }
    resolve(cachedSessionUser);
  });
  
  return sessionUserPromise;
}

function clearSessionUserCache() {
  cachedSessionUser = null;
  sessionUserPromise = null;
}

function hashPw(pw) { return btoa(unescape(encodeURIComponent(pw))); }
function genId(prefix) { return (prefix||'id')+'-'+Math.random().toString(36).substr(2,9)+'-'+Date.now(); }

// Site Content is now migrated to Supabase

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
  toast._timer = setTimeout(function(){ toast.classList.remove('show');  }, 3000);
}
window.showToast = showToast;

/* ============================================================
   PUBLIC NAV Ã¢â‚¬â€  MOBILE TOGGLE
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
   PUBLIC NAV Ã¢â‚¬â€ AUTH STATE
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
  var nav  = document.querySelector('.nav');
  var navLinks = document.querySelector('.nav-links');
  if (!nav || !navLinks) return;

  var loginAnchor = navLinks.querySelector('a[href="login.html"]');

  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT' || event === 'SIGNED_IN') {
      clearSessionUserCache();
    }
    const user = await getSessionUser();
    
    var oldWidget = nav.querySelector('.nav-user-widget');
    if (oldWidget) oldWidget.remove();

    if (user) {
      if (loginAnchor) loginAnchor.parentElement.style.display = 'none';

      let roleName = user.isAdmin ? 'Admin' : 'Researcher';
      let profileUrl = user.isAdmin ? 'admin-profile.html' : 'dashboard.html';
      let displayName = user.first_name || user.user_metadata?.first_name || (user.email ? user.email.split('@')[0] : 'User');

      var widget = document.createElement('div');
      widget.className = 'nav-user-widget';
      widget.innerHTML =
        '<a href="' + profileUrl + '" class="nav-user-info" style="text-decoration:none; color:inherit; display:flex; flex-direction:column; align-items:flex-start;">' +
          '<div class="nav-user-name">' + escHtml(displayName) + '</div>' +
          '<div class="nav-user-role">' + roleName + '</div>' +
        '</a>' +
        '<button id="nav-logout-btn" class="nav-logout-icon" title="Log out" aria-label="Log out">' + LOGOUT_SVG + '</button>';
      nav.appendChild(widget);

      document.getElementById('nav-logout-btn').addEventListener('click', async function() {
        await supabase.auth.signOut();
        window.location.href = 'index.html';
      });
    } else {
      if (loginAnchor) loginAnchor.parentElement.style.display = 'inline-block';
    }
    
    // Reveal auth area once session resolves
    const hideStyle = document.getElementById('auth-hide-style');
    if (hideStyle) hideStyle.remove();
  });
}

/* ============================================================
   GUARDS
   ============================================================ */
function initDashboardGuard() {
  if (currentPage() === 'dashboard.html') {
    getSessionUser().then((user) => {
      if (!user) {
        window.location.href = 'login.html';
      }
    });
  }
}

function initAdminPageGuard(onSuccess) {
  getSessionUser().then((user) => {
    if (!user) {
      showToast('Please log in to access this page.');
      setTimeout(function(){ window.location.href='login.html'; }, 1600);
      return;
    }
    
    if (!user.isAdmin) {
      showToast('Access denied. Administrator privileges required.');
      setTimeout(function(){ window.location.href='index.html'; }, 1600);
    } else {
      if (onSuccess) onSuccess();
    }
  });
}

/* ============================================================
   ADMIN SIDEBAR Ã¢â‚¬â€ built dynamically (plain text labels, no emoji)
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

  // Rebuild nav links from a single source of truth Ã¢â‚¬â€ plain text, no emoji
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
    supabase.from('tickets').select('id', { count: 'exact' }).eq('status', 'Open').then(({ count, error }) => {
      if (!error && count > 0) {
        var ticketLink = sidebarNav.querySelector('a[href="admin-tickets.html"]');
        if (ticketLink) {
          var badge = document.createElement('span');
          badge.className = 'nav-badge';
          badge.textContent = String(count);
          ticketLink.appendChild(badge);
        }
      }
    });
  }

  // Sidebar user info
  getSessionUser().then((user) => {
    if (user) {
      var infoEl = document.getElementById('sidebar-user-info');
      if (infoEl) {
        let displayName = user.first_name || (user.email ? user.email.split('@')[0] : 'Admin');
        infoEl.innerHTML =
          '<div class="sidebar-user-name">' + escHtml(displayName) + '</div>' +
          '<div class="sidebar-user-email">Admin</div>';
      }
    }
  });

  // Logout Ã¢â‚¬â€ SVG icon
  var logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) {
    logoutBtn.innerHTML = LOGOUT_SVG + ' Log out';
    logoutBtn.addEventListener('click', async function() {
      await supabase.auth.signOut();
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
   BUY BUTTONS Ã¢â‚¬â€ with download count increment
   ============================================================ */
function initBuyButtons() {
  document.querySelectorAll('[data-buy]').forEach(function(btn) {
    btn.addEventListener('click', async function(e) {
      e.preventDefault();
      const user = await getSessionUser();
      if (!user) {
        showToast('Please log in to purchase a dataset.');
        return;
      }
      var dsid = btn.getAttribute('data-dsid') || '';
      var name = btn.getAttribute('data-buy') || '';

      // Increment downloads on the dataset record
      if (dsid) {
        supabase.from('papers').select('*').eq('id', dsid).single().then(async ({ data: ds }) => {
          if (ds) {
            var newDownloads = (ds.downloads || 0) + 1;
            await supabase.from('papers').update({ downloads: newDownloads }).eq('id', dsid);
            var countEl = document.getElementById('ds-download-count');
            if (countEl) countEl.textContent = newDownloads;
            
            // Record mock payment
            const payload = {
              user_email: user.email,
              dataset_title: ds.title,
              amount: ds.price,
              status: 'Completed'
            };
            await supabase.from('payments').insert([payload]);
            showToast('Added "' + name + '" to your order. A secure payment step would appear here once the gateway is connected.');
          }
        });
      }
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
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      clearFormErrors(loginForm);
      var email = val('login-email').toLowerCase();
      var pw    = val('login-password');
      var ok    = true;
      if (!email) { markError('login-email',    'Email address is required.'); ok=false; }
      if (!pw)    { markError('login-password', 'Password is required.');      ok=false; }
      if (!ok) return;
      
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Logging in...';
      submitBtn.disabled = true;

      try {
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: pw,
        });
        if (error) throw error;
        
        let redirectPage = 'index.html';
        if (authData.user) {
          clearSessionUserCache();
          const userObj = await getSessionUser();
            
          if (userObj && userObj.isAdmin) {
            redirectPage = 'admin-dashboard.html';
          } else {
            redirectPage = 'index.html';
          }
        }
        
        showToast('Logged in successfully!');
        setTimeout(function(){ window.location.href = redirectPage; }, 1000);
      } catch (error) {
        showToast('Login failed: ' + error.message);
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // Register
  var regForm = document.querySelector('[data-auth-form="register"]');
  if (regForm) {
    regForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      clearFormErrors(regForm);
      var email      = val('reg-email').toLowerCase();
      var pw         = val('reg-password');
      var confirmPw  = val('reg-confirm-password');
      var ok = true;
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                        markError('reg-email',    'Please enter a valid email address.'); ok=false; }
      if (pw.length<8){ markError('reg-password','Password must be at least 8 characters.'); ok=false; }
      if (pw!==confirmPw){ markError('reg-confirm-password','Passwords do not match.'); ok=false; }
      if (!ok) return;

      const submitBtn = regForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Creating account...';
      submitBtn.disabled = true;

      var fn = val('reg-firstname');
      var ln = val('reg-lastname');
      var on = val('reg-othernames');

      try {
        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: pw,
          options: {
            data: { first_name: fn, last_name: ln, other_names: on }
          }
        });
        if (error) throw error;
        
        // Insert into public.users table as requested by the plan
        if (data?.user) {
          await supabase.from('users').insert([{
            id: data.user.id,
            email: email,
            role: 'user',
            first_name: fn,
            last_name: ln,
            other_names: on,
            created_at: new Date().toISOString()
          }]);
        }

        showToast('Account created!');
        setTimeout(function(){ window.location.href = 'index.html'; }, 1000);
      } catch (error) {
        showToast('Registration failed: ' + error.message);
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
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
   ABOUT PAGE Ã¢â‚¬â€ load from localStorage
   ============================================================ */
async function initAboutPage() {
  if (!document.getElementById('about-content')) return;
  const { data: a } = await supabase.from('site_settings').select('*').eq('id', 1).single();
  if (!a) return;
  setText('about-title',     a.about_title || 'About Research Hub');
  setText('about-subtitle',  a.about_subtitle || '');
  setText('about-mission',   a.about_mission || '');
  setText('about-challenge', a.about_challenge || '');
  setText('about-solution',  a.about_solution || '');
}

/* ============================================================
   CONTACT PAGE Ã¢â‚¬â€ load clickable info from localStorage
   ============================================================ */
async function initContactPage() {
  const { data: c } = await supabase.from('site_settings').select('*').eq('id', 1).single();
  if (!c) return;
  var emailEl = document.getElementById('contact-email-link');
  if (emailEl && c.contact_email) { emailEl.href = 'mailto:'+c.contact_email; emailEl.textContent = c.contact_email; }
  var phoneEl = document.getElementById('contact-phone-link');
  if (phoneEl && c.contact_phone) { phoneEl.href = 'tel:'+c.contact_phone.replace(/\s/g,''); phoneEl.textContent = c.contact_phone; }
}

/* ============================================================
   SUPPORT TICKET FORM
   ============================================================ */
async function initTicketForm() {
  var form = document.getElementById('ticket-form');
  if (!form) return;
  var user       = await getSessionUser();
  var nameField  = document.getElementById('ticket-name');
  var emailField = document.getElementById('ticket-email');



  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    var name     = nameField  ? nameField.value.trim()  : '';
    var email    = emailField ? emailField.value.trim() : '';
    var subject  = val('ticket-subject');
    var category = val('ticket-category');
    var message  = val('ticket-message');
    if (!name || !email || !subject || !category || !message) {
      showToast('Please fill in all required fields.'); return;
    }
    const { count } = await supabase.from('tickets').select('id', { count: 'exact' });
    var refNum  = 'TKT-'+String((count || 0)+1).padStart(5,'0');
    
    const payload = {
      ref: refNum, name: name, user_email: email,
      subject: subject, category: category, message: message,
      status: 'Open'
    };
    const { error } = await supabase.from('tickets').insert([payload]);
    if (error) {
      showToast('Error submitting ticket. Please try again.');
      return;
    }
    
    form.style.display = 'none';
    var confirm = document.getElementById('ticket-confirm');
    if (confirm) {
      setText('ticket-ref-num', refNum);
      confirm.style.display = 'block';
    }
  });
}

/* ============================================================
   BROWSE
   ============================================================ */
async function initBrowsePage() {
  var list = document.getElementById('dataset-list'); if (!list) return;
  list.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--ink-soft);">Loading datasets...</div>';

  const { data: papers, error } = await supabase
    .from('papers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !papers) {
    list.innerHTML = '<p style="color:red;">Error loading papers.</p>';
    return;
  }

  list.innerHTML = '';
  papers.forEach(function(ds) {
    var tags = ['Paper'];
    var tagHtml = tags.map(function(t){ return '<span class="tag">' + escHtml(t) + '</span>'; }).join('');
    var catLower = 'paper';
    var a = document.createElement('a');
    a.href = 'dataset.html?id=' + encodeURIComponent(ds.id);
    a.className = 'data-item';
    a.setAttribute('data-category', catLower);
    a.setAttribute('data-search', (ds.title + ' ' + (ds.description||'')).toLowerCase());
    a.setAttribute('data-dsid', ds.id);
    a.innerHTML =
      '<div>' +
        '<h3 class="data-title">' + escHtml(ds.title) + '</h3>' +
        '<div class="data-tags" style="margin:10px 0;">' + tagHtml + '</div>' +
      '</div>' +
      '<div style="display:flex; flex-direction:column; align-items:flex-end; gap:8px;">' +
        '<div class="data-price" style="font-size:1.2rem; font-weight:700; color:var(--teal-dark);">₦' + Number(ds.price).toLocaleString() + '</div>' +
        '<div class="btn btn-primary btn-small" style="pointer-events:none;">View & Purchase</div>' +
      '</div>';
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
async function initDatasetPage() {
  if (currentPage() !== 'dataset.html') return;

  var dsid = getUrlParam('id');
  if (!dsid) {
    showNoDataset();
    return;
  }

  const { data: ds, error } = await supabase
    .from('papers')
    .select('*')
    .eq('id', dsid)
    .single();

  if (error || !ds) {
    showNoDataset();
    return;
  }

  function showNoDataset() {
    var main = document.getElementById('main');
    if (main) main.innerHTML = '<section><div class="wrap"><p style="padding:40px 0;color:var(--ink-soft);">No dataset found. <a href="browse.html">Browse all datasets &rarr;</a></p></div></section>';
  }

  // Update page title
  document.title = escHtml(ds.title) + ' — Research Hub';

  // Breadcrumb
  setText('ds-category-crumb', 'Paper');

  // Main content
  setText('ds-title',       ds.title);
  setText('ds-description', ds.description || 'No description provided.');
  setText('ds-category',    'Paper');
  setText('ds-price',       '₦' + Number(ds.price).toLocaleString());
  setText('ds-uploader',    'Admin'); // since only admin uploads currently
  setText('ds-download-count', 0); // Not implemented yet

  // Date
  if (ds.created_at) {
    setText('ds-date', new Date(ds.created_at).toLocaleDateString('en-NG', {year:'numeric',month:'long',day:'numeric'}));
  }

  // Tags
  var tagsEl = document.getElementById('ds-tags');
  if (tagsEl) {
    tagsEl.innerHTML = '<span class="tag">Paper</span>';
  }

  // Buy button — wire up data attributes
  var buyBtn = document.getElementById('ds-buy-btn');
  if (buyBtn) {
    buyBtn.setAttribute('data-buy',  ds.title);
    buyBtn.setAttribute('data-dsid', ds.id);
    
    var fullDownloadLink = document.getElementById('ds-full-download-btn');
    
    buyBtn.addEventListener('click', function() {
      // Mock processing state
      buyBtn.textContent = 'Processing...';
      buyBtn.disabled = true;
      buyBtn.style.opacity = '0.7';
      buyBtn.style.cursor = 'not-allowed';

      // Simulate payment delay
      setTimeout(function() {
        buyBtn.style.display = 'none';
        
        if (fullDownloadLink) {
          fullDownloadLink.href = ds.file_url;
          fullDownloadLink.style.display = 'block';
        }
      }, 1500);
    });
  }

  // Buy panel price display
  var priceEl = document.getElementById('ds-buy-price');
  if (priceEl) priceEl.textContent = '₦' + Number(ds.price).toLocaleString();

  // PDF Preview logic
  if (ds.file_url) {
    const canvas = document.getElementById('pdf-preview-canvas');
    const controls = document.getElementById('pdf-controls');
    const heading = document.getElementById('pdf-preview-heading');
    const pageNumEl = document.getElementById('pdf-page-num');
    const pageCountEl = document.getElementById('pdf-page-count');
    const prevBtn = document.getElementById('pdf-prev');
    const nextBtn = document.getElementById('pdf-next');

    if (canvas && typeof pdfjsLib !== 'undefined') {
      canvas.style.display = 'block';
      controls.style.display = 'flex';
      if (heading) heading.style.display = 'block';
      
      let pdfDoc = null;
      let startPage = ds.preview_start || 1;
      let endPage = ds.preview_end || 5;
      let pageNum = startPage;
      let pageRendering = false;
      let pageNumPending = null;
      const ctx = canvas.getContext('2d');

      const renderPage = (num) => {
        pageRendering = true;
        pdfDoc.getPage(num).then((page) => {
          const viewport = page.getViewport({ scale: 1.5 });
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          const renderContext = {
            canvasContext: ctx,
            viewport: viewport
          };
          
          const renderTask = page.render(renderContext);
          renderTask.promise.then(() => {
            pageRendering = false;
            if (pageNumPending !== null) {
              renderPage(pageNumPending);
              pageNumPending = null;
            }
          });
        });

        pageNumEl.textContent = (num - startPage + 1);
      };

      const queueRenderPage = (num) => {
        if (pageRendering) {
          pageNumPending = num;
        } else {
          renderPage(num);
        }
      };

      const onPrevPage = () => {
        if (pageNum <= startPage) return;
        pageNum--;
        queueRenderPage(pageNum);
      };

      const onNextPage = () => {
        if (pageNum >= endPage || pageNum >= pdfDoc.numPages) return;
        pageNum++;
        queueRenderPage(pageNum);
      };

      prevBtn.addEventListener('click', onPrevPage);
      nextBtn.addEventListener('click', onNextPage);

      pdfjsLib.getDocument(ds.file_url).promise.then((pdf) => {
        pdfDoc = pdf;
        // Adjust endPage if the document has fewer pages
        endPage = Math.min(endPage, pdf.numPages);
        
        // Handle invalid startPage gracefully
        if (startPage > pdf.numPages) startPage = 1;

        pageCountEl.textContent = (endPage - startPage + 1);
        pageNum = startPage;
        renderPage(pageNum);
      }).catch((err) => {
        console.error('Error loading PDF preview: ', err);
        canvas.style.display = 'none';
        controls.style.display = 'none';
        if (heading) heading.style.display = 'none';
      });
    }
  }

}

/* ============================================================
   USER DASHBOARD / MY PROFILE
   ============================================================ */
function initUserDashboard() {
  if (!document.getElementById('dashboard-main')) return;
  getSessionUser().then(async (user) => {
    if (!user) return;
    
    // Fetch from public.users table to get the true registered name and role
    const { data: dbUser } = await supabase.from('users').select('*').eq('id', user.id).single();

    const firstName = dbUser?.first_name || user.user_metadata?.first_name || '';
    const lastName = dbUser?.last_name || user.user_metadata?.last_name || '';
    const otherNames = dbUser?.other_names || user.user_metadata?.other_names || '';
    const createdAt = user.created_at || new Date().toISOString();

    var fullName = (firstName || lastName) ? (firstName + ' ' + lastName + (otherNames?' '+otherNames:'')) : 'Standard User';
    setText('dash-name',   fullName);
    setText('dash-email',  user.email);
    
    // Fallback: If role is empty or explicitly 'user', show 'Researcher'
    const displayRole = (user.role === 'admin' || dbUser?.role === 'admin') ? 'Administrator' : 'Researcher';
    setText('dash-role',   displayRole);
    setText('dash-joined', new Date(createdAt).toLocaleDateString('en-NG',{year:'numeric',month:'long',day:'numeric'}));

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
  const { data: paymentsData } = await supabase.from('payments').select('*').eq('user_email', user.email).order('created_at', { ascending: false });
  var payments = paymentsData || [];
  
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
      payments.forEach(function(p) {
        var tr = document.createElement('tr');
        tr.innerHTML =
          '<td>'+new Date(p.created_at).toLocaleDateString('en-NG')+'</td>'+
          '<td>'+escHtml(p.dataset_title)+'</td>'+
          '<td>₦'+Number(p.amount).toLocaleString()+'</td>'+
          '<td><span class="status-badge status-'+p.status.toLowerCase()+'">'+escHtml(p.status)+'</span></td>';
        tbody.appendChild(tr);
      });
    }
  }
  });
}

async function initAdminDashboard() {
  if (!document.getElementById('admin-dash-stats')) return;

  setText('stat-papers',    '...');
  setText('stat-downloads', '...');
  setText('stat-revenue',   '...');
  setText('stat-users',     '...');

  var actEl = document.getElementById('admin-recent-activity');
  if (actEl) actEl.innerHTML = '<p style="color:var(--ink-soft);padding:16px 0;">Loading activity...</p>';

  try {
    const [ { data: papersData }, { data: usersData }, { data: ticketsData }, { data: paymentsData } ] = await Promise.all([
      supabase.from('papers').select('*'),
      supabase.from('users').select('*'),
      supabase.from('tickets').select('*'),
      supabase.from('payments').select('*')
    ]);

    var datasets = papersData || [];
    var users = usersData || [];
    var payments  = paymentsData || [];
    var tickets   = ticketsData || [];

    var totalDL   = datasets.reduce(function(s,d){ return s+(d.downloads||0); }, 0);
    var totalRev  = payments.reduce(function(s,p){ return s+Number(p.amount); }, 0);
    
    setText('stat-papers',    String(datasets.length));
    setText('stat-downloads', String(totalDL));
    setText('stat-revenue',   '₦'+totalRev.toLocaleString());
    setText('stat-users',     String(users.length));

    if (!actEl) return;
    var allEvents = [];
    users.slice(-3).forEach(function(u){ 
      let name = u.email || 'User';
      if (u.firstName && u.lastName) name = u.firstName + ' ' + u.lastName;
      allEvents.push({type:'user',label:'New user registered: '+escHtml(name),date:u.created_at || new Date().toISOString()}); 
    });
    tickets.slice(-3).forEach(function(t){ allEvents.push({type:'ticket',label:'Support ticket '+escHtml(t.ref)+': '+escHtml(t.subject),date:t.created_at}); });
    payments.slice(-3).forEach(function(p){ allEvents.push({type:'payment',label:'Payment received — '+escHtml(p.dataset_title)+' ₦'+Number(p.amount).toLocaleString(),date:p.created_at}); });
    
    allEvents.sort(function(a,b){ return new Date(b.date)-new Date(a.date); });
    actEl.innerHTML = '';
    if (allEvents.length===0) { actEl.innerHTML='<p style="color:var(--ink-soft);padding:16px 0;">No recent activity yet.</p>'; return; }
    allEvents.slice(0,8).forEach(function(ev) {
      var div = document.createElement('div');
      div.className = 'activity-item activity-'+ev.type;
      div.innerHTML = '<span class="activity-label">'+ev.label+'</span><span class="activity-date">'+new Date(ev.date).toLocaleDateString('en-NG')+'</span>';
      actEl.appendChild(div);
    });
  } catch(e) {
    console.error(e);
    if (actEl) actEl.innerHTML = '<p style="color:var(--ink-soft);padding:16px 0;">Error loading dashboard.</p>';
  }
}

/* ============================================================
   ADMIN Ã¢â‚¬â€ USERS
   ============================================================ */
function initAdminUsers() {
  if (!document.getElementById('admin-users-tbody')) return;
  renderAdminUsers();
}
async function renderAdminUsers() {
  var tbody = document.getElementById('admin-users-tbody'); if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--ink-soft);">Loading...</td></tr>';
  
  const { data: users, error } = await supabase.from('users').select('*');
  
  tbody.innerHTML = '';
  
  if (error || !users || !users.length) {
     tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--ink-soft);">Could not load users. (Ensure RLS policy allows admins to SELECT)</td></tr>';
     return;
  }
  
  const { data: { session } } = await supabase.auth.getSession();
  const currentUserId = session?.user?.id || '';

  // Calculate full names and sort alphabetically
  users.forEach(function(u) {
    u._fullName = ((u.first_name || '') + ' ' + (u.last_name || '')).trim() || '—';
  });
  users.sort(function(a, b) {
    return a._fullName.localeCompare(b._fullName);
  });

  users.forEach(function(u) {
    var isAdmin = u.role === 'admin';
    // Basic protection to avoid locking out the main admin
    var prot = isAdmin && u.id === currentUserId; 
    
    let fullName = u._fullName;
    
    let createdAt = u.created_at ? new Date(u.created_at).toLocaleDateString('en-NG') : '—';
    
    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td>'+escHtml(fullName)+'</td>'+
      '<td>'+escHtml(u.email)+'</td>'+
      '<td>'+createdAt+'</td>'+
      '<td><span class="role-badge '+(isAdmin?'role-admin':'role-user')+'">'+(isAdmin?'Admin':'Researcher')+'</span></td>'+
      '<td>'+(prot?'<span style="font-size:0.8rem;color:var(--ink-soft);">Protected</span>':
        '<button class="btn btn-small '+(isAdmin?'btn-secondary':'btn-primary')+' toggle-admin-btn" data-uid="'+escHtml(u.id)+'" data-isadmin="'+isAdmin+'">'+(isAdmin?'Revoke Admin':'Make Admin')+'</button>')+'</td>';
    tbody.appendChild(tr);
  });
  
  tbody.querySelectorAll('.toggle-admin-btn').forEach(function(btn) {
    btn.addEventListener('click', async function() {
      var uid = btn.getAttribute('data-uid');
      var isCurrentlyAdmin = btn.getAttribute('data-isadmin') === 'true';
      var newRole = isCurrentlyAdmin ? 'user' : 'admin';
      
      const { data, error } = await supabase.from('users').update({ role: newRole }).eq('id', uid).select();
      if (error) {
        showToast('Error updating role: ' + error.message);
      } else if (!data || data.length === 0) {
        showToast('Error: Role update blocked (Likely RLS policy on users table).');
      } else {
        showToast('Role updated to ' + newRole + '.');
        renderAdminUsers();
      }
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
async function renderAdminPapers() {
  var tbody = document.getElementById('admin-papers-tbody'); if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--ink-soft);">Loading...</td></tr>';
  
  const { data: datasets, error } = await supabase.from('papers').select('*').order('created_at', { ascending: false });
  
  tbody.innerHTML = '';
  if (error || !datasets || !datasets.length) {
    tbody.innerHTML='<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--ink-soft);">No datasets uploaded yet.</td></tr>'; 
    return;
  }
  
  datasets.forEach(function(ds) {
    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td>'+escHtml(ds.title)+'</td>'+
      '<td>—</td>'+ // category not in new schema
      '<td>₦'+Number(ds.price).toLocaleString()+'</td>'+
      '<td class="dl-stat">⬇ 0</td>'+ // downloads not in new schema
      '<td>Admin</td>'+
      '<td>'+new Date(ds.created_at).toLocaleDateString('en-NG')+'</td>'+
      '<td>'+
        '<button class="btn btn-small btn-primary edit-ds-btn" style="margin-right:8px;" data-ds=\''+JSON.stringify(ds).replace(/'/g, "&apos;")+'\'>Edit</button>'+
        '<button class="btn btn-small btn-secondary delete-ds-btn" data-dsid="'+escHtml(ds.id)+'">Delete</button>'+
      '</td>';
    tbody.appendChild(tr);
  });
  
  tbody.querySelectorAll('.delete-ds-btn').forEach(function(btn) {
    btn.addEventListener('click', async function() {
      if (!confirm('Delete this dataset? This cannot be undone.')) return;
      var dsid = btn.getAttribute('data-dsid');
      
      const { error } = await supabase.from('papers').delete().eq('id', dsid);
      if (error) {
        showToast('Error deleting paper: ' + error.message);
      } else {
        renderAdminPapers();
        showToast('Paper deleted successfully.');
      }
    });
  });

  // Edit logic
  const modal = document.getElementById('admin-edit-modal');
  if (modal) {
    const closeBtn = document.getElementById('admin-edit-close');
    const form = document.getElementById('admin-edit-form');
    
    // Close modal
    const closeModal = () => { modal.style.display = 'none'; };
    closeBtn.onclick = closeModal;
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };

    // Open modal
    tbody.querySelectorAll('.edit-ds-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const ds = JSON.parse(btn.getAttribute('data-ds').replace(/&apos;/g, "'"));
        setVal('edit-paper-id', ds.id);
        setVal('edit-paper-title', ds.title);
        setVal('edit-paper-price', ds.price);
        setVal('edit-preview-start', ds.preview_start || 1);
        setVal('edit-preview-end', ds.preview_end || 5);
        document.getElementById('edit-paper-file').value = ''; // clear file input
        modal.style.display = 'flex';
      });
    });

    // Handle form submit
    form.onsubmit = async function(e) {
      e.preventDefault();
      const id = document.getElementById('edit-paper-id').value;
      const title = document.getElementById('edit-paper-title').value;
      const price = Number(document.getElementById('edit-paper-price').value);
      const pStart = Number(document.getElementById('edit-preview-start').value);
      const pEnd = Number(document.getElementById('edit-preview-end').value);
      const fileInput = document.getElementById('edit-paper-file');
      const file = fileInput.files[0];
      const submitBtn = form.querySelector('button[type="submit"]');

      if (!title || price === undefined || !pStart || !pEnd) {
        showToast('Please fill in all required fields.');
        return;
      }
      if (price > 5000) { showToast('Price cannot exceed ₦5,000.'); return; }
      if (pStart > pEnd) { showToast('Preview start page must be less than or equal to end page.'); return; }

      submitBtn.textContent = 'Saving...';
      submitBtn.disabled = true;

      try {
        let updateData = {
          title, price, preview_start: pStart, preview_end: pEnd
        };

        if (file) {
          if (!file.name.toLowerCase().endsWith('.pdf')) {
            showToast('Only PDF files are accepted.');
            submitBtn.textContent = 'Save Changes';
            submitBtn.disabled = false;
            return;
          }
          const fileName = Date.now() + '_' + file.name;
          const { error: uploadError } = await supabase.storage.from('papers_bucket').upload(fileName, file);
          if (uploadError) throw uploadError;
          const { data: publicUrlData } = supabase.storage.from('papers_bucket').getPublicUrl(fileName);
          updateData.file_url = publicUrlData.publicUrl;
        }

        const { error: updateError } = await supabase.from('papers').update(updateData).eq('id', id);
        if (updateError) throw updateError;

        showToast('Dataset updated successfully!');
        closeModal();
        renderAdminPapers();
      } catch (err) {
        console.error(err);
        showToast('Error: ' + err.message);
      } finally {
        submitBtn.textContent = 'Save Changes';
        submitBtn.disabled = false;
      }
    };
  }
}

/* ============================================================
   ADMIN Ã¢â‚¬â€ UPLOAD (PDF / DOCX only) Ã¢â‚¬â€ stores file as base64
   ============================================================ */
function initAdminUpload() {
  var form      = document.getElementById('admin-upload-form');
  var btn       = document.getElementById('admin-submit-btn');
  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    var title    = document.getElementById('admin-paper-title').value;
    var price    = Number(document.getElementById('admin-paper-price').value);
    var pStart   = Number(document.getElementById('admin-preview-start').value);
    var pEnd     = Number(document.getElementById('admin-preview-end').value);
    var fileInput= document.getElementById('admin-paper-file');
    var file     = fileInput.files[0];

    if (!title || price === undefined || !file || !pStart || !pEnd) { 
      showToast('Please fill in all required fields.'); 
      return; 
    }
    if (price > 5000) { showToast('Price cannot exceed ₦5,000.'); return; }
    if (pStart > pEnd) { showToast('Preview start page must be less than or equal to end page.'); return; }

    var name = file.name.toLowerCase();
    if (!name.endsWith('.pdf')) {
      showToast('Only PDF files are accepted for preview.');
      return;
    }

    btn.textContent = 'Uploading...';
    btn.disabled = true;

    try {
      const fileName = Date.now() + '_' + file.name;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('papers_bucket')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('papers_bucket')
        .getPublicUrl(fileName);
        
      const downloadURL = publicUrlData.publicUrl;

      const { error: insertError } = await supabase.from('papers').insert([{
        title: title,
        price: price,
        file_url: downloadURL,
        preview_start: pStart,
        preview_end: pEnd
      }]);
      
      if (insertError) throw insertError;

      showToast('Paper uploaded successfully!');
      form.reset();
    } catch (error) {
      console.error(error);
      showToast('Error uploading paper: ' + error.message);
    } finally {
      btn.textContent = 'Upload to Storefront';
      btn.disabled = false;
    }
  });
}

/* ============================================================
   ADMIN — PAYMENTS
   ============================================================ */
async function initAdminPayments() {
  if (!document.getElementById('admin-payments-tbody')) return;
  var tbody = document.getElementById('admin-payments-tbody');
  
  const { data: payments, error } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
  
  tbody.innerHTML = '';
  if (error || !payments || !payments.length) {
    tbody.innerHTML='<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--ink-soft);">No payment records yet.</td></tr>'; return;
  }
  payments.forEach(function(p) {
    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td>'+new Date(p.created_at).toLocaleDateString('en-NG')+'</td>'+
      '<td>—</td>'+
      '<td>'+escHtml(p.user_email||'—')+'</td>'+
      '<td>'+escHtml(p.dataset_title||'—')+'</td>'+
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
async function renderAdminTickets() {
  var tbody = document.getElementById('admin-tickets-tbody'); if (!tbody) return;
  
  const { data: tickets, error } = await supabase.from('tickets').select('*').order('created_at', { ascending: false });
  
  tbody.innerHTML = '';
  if (error || !tickets || !tickets.length) {
    tbody.innerHTML='<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--ink-soft);">No support tickets yet.</td></tr>'; return;
  }
  tickets.forEach(function(t) {
    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td><strong>'+escHtml(t.ref)+'</strong></td>'+
      '<td>'+new Date(t.created_at).toLocaleDateString('en-NG')+'</td>'+
      '<td>'+escHtml(t.name)+'<br><small style="color:var(--ink-soft);">'+escHtml(t.user_email)+'</small></td>'+
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
      var ticket = tickets.find(function(t){ return t.ref===ref; }); if (!ticket) return;
      var modal = document.getElementById('ticket-modal'); if (!modal) return;
      setText('modal-ref',      ticket.ref);
      setText('modal-from',     ticket.name+' ('+ticket.user_email+')');
      setText('modal-subject',  ticket.subject);
      setText('modal-category', ticket.category);
      setText('modal-message',  ticket.message);
      setText('modal-status',   ticket.status);
      setText('modal-date',     new Date(ticket.created_at).toLocaleString('en-NG'));
      modal.style.display = 'flex';
    });
  });
  tbody.querySelectorAll('.resolve-ticket-btn').forEach(function(btn) {
    btn.addEventListener('click', async function() {
      var ref = btn.getAttribute('data-ref');
      
      const { error } = await supabase.from('tickets').update({ status: 'Resolved' }).eq('ref', ref);
      if (error) {
        showToast('Error updating ticket.');
        return;
      }
      showToast('Ticket '+ref+' marked as resolved.');
      renderAdminTickets();
      // Update sidebar badge
      supabase.from('tickets').select('id', { count: 'exact' }).eq('status', 'Open').then(({ count }) => {
        var badge = document.querySelector('.admin-nav-link[href="admin-tickets.html"] .nav-badge');
        if (badge) {
          if (count > 0) badge.textContent = String(count);
          else badge.remove();
        }
      });
    });
  });
}
/* ============================================================
   ADMIN Ã¢â‚¬â€ PROFILE (personal info + password change only)
   ============================================================ */
function initAdminProfile() {
  var profileForm = document.getElementById('admin-profile-form'); if (!profileForm) return;

  getSessionUser().then(async (user) => {
    if (!user) return;

    // Fallbacks if columns don't exist yet
    const firstName = user.user_metadata?.first_name || '';
    const lastName = user.user_metadata?.last_name || '';
    const otherNames = user.user_metadata?.other_names || '';
    const createdAt = user.created_at || new Date().toISOString();
    const role = user.role || 'user';

    // Pre-fill
    setVal('ap-firstname',  firstName);
    setVal('ap-lastname',   lastName);
    setVal('ap-othernames', otherNames);
    setVal('ap-email',      user.email);

    // Display info
    const fullName = (firstName || lastName) ? (firstName + ' ' + lastName) : 'Admin User';
    setText('ap-display-name',  fullName);
    setText('ap-display-email', user.email);
    setText('ap-display-role',  role === 'admin' ? 'Administrator' : 'Researcher');
    setText('ap-display-joined', new Date(createdAt).toLocaleDateString('en-NG', {year:'numeric',month:'long',day:'numeric'}));

    // Save personal info
    profileForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      var fn = val('ap-firstname'); var ln = val('ap-lastname'); var on = val('ap-othernames');
      
      const { error } = await supabase.auth.updateUser({
        data: { first_name: fn, last_name: ln, other_names: on }
      });

      if (error) {
        showToast('Error updating profile: ' + error.message);
      } else {
        const updatedName = (fn || ln) ? (fn + ' ' + ln) : 'Admin User';
        setText('ap-display-name', updatedName);
        showToast('Profile updated successfully.');
      }
    });

    // Password change
    var pwForm = document.getElementById('admin-pw-form');
    if (pwForm) {
      pwForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        var curPw = val('ap-current-pw'); // We can't verify current password client-side securely in Supabase without a sign-in, we just rely on updateUser
        var newPw = val('ap-new-pw');
        var conPw = val('ap-confirm-pw');
        
        if (!curPw || !newPw || !conPw) { showToast('Please fill in all password fields.'); return; }
        if (newPw.length < 8) { showToast('New password must be at least 8 characters.'); return; }
        if (newPw !== conPw)  { showToast('New passwords do not match.'); return; }
        
        const { error } = await supabase.auth.updateUser({ password: newPw });
        if (error) {
          showToast('Error updating password: ' + error.message);
        } else {
          pwForm.reset();
          showToast('Password changed successfully.');
        }
      });
    }
  });
}

/* ============================================================
   ADMIN Ã¢â‚¬â€  CONTENT EDITOR (About + Contact pages)
   ============================================================ */
async function initAdminContent() {
  var aboutForm   = document.getElementById('admin-about-form');
  var contactForm = document.getElementById('admin-contact-form');
  if (!aboutForm && !contactForm) return;

  const { data: c } = await supabase.from('site_settings').select('*').eq('id', 1).single();
  if (c) {
    setVal('sc-about-title',     c.about_title     || 'About Research Hub');
    setVal('sc-about-subtitle',  c.about_subtitle  || 'Advancing the global scientific community through secure, verified data exchange and intellectual property licensing.');
    setVal('sc-about-mission',   c.about_mission   || 'Research Hub was established with a singular objective: to democratize access to high-quality, empirical research data while ensuring primary researchers and authors retain control and receive appropriate compensation for their intellectual property.');
    setVal('sc-about-challenge', c.about_challenge || 'For decades, critical raw datasets and specialized research papers have remained siloed within specific academic departments or lost entirely post-publication. Students, data scientists, and independent researchers often struggle to find verified, secondary data necessary to replicate findings, conduct meta-analyses, or train computational models. Concurrently, original authors lack a streamlined, secure mechanism to license their datasets to the broader academic community.');
    setVal('sc-about-solution',  c.about_solution  || 'By leveraging robust cloud infrastructure and modern web technologies, Research Hub provides a secure digital marketplace. We meticulously vet the integrity of uploaded papers and datasets, offering institutional-grade Row Level Security to protect data at rest and in transit. Researchers can confidently browse, evaluate, and securely acquire the exact data they need to drive their thesis or specialized studies forward.');
    setVal('sc-email', c.contact_email || '');
    setVal('sc-phone', c.contact_phone || '');
  }

  if (aboutForm) {
    aboutForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const payload = {
        id: 1,
        about_title: val('sc-about-title'),
        about_subtitle: val('sc-about-subtitle'),
        about_mission: val('sc-about-mission'),
        about_challenge: val('sc-about-challenge'),
        about_solution: val('sc-about-solution')
      };
      const { error } = await supabase.from('site_settings').upsert(payload);
      if (error) {
        showToast('Error: ' + error.message);
      } else {
        showToast('About page saved. Changes are now live.');
        aboutForm.reset();
      }
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const payload = {
        id: 1,
        contact_email: val('sc-email'),
        contact_phone: val('sc-phone')
      };
      const { error } = await supabase.from('site_settings').upsert(payload);
      if (error) {
        showToast('Error: ' + error.message);
      } else {
        showToast('Contact info saved. Changes are now live.');
        contactForm.reset();
      }
    });
  }
}

/* ============================================================
   USER Ã¢â‚¬â€ PROFILE EDIT (name + password change in dashboard)
   ============================================================ */
function initProfileEditForms() {
  if (currentPage() !== 'dashboard.html') return;
  
  getSessionUser().then(async (user) => {
    if (!user) return;

    // Fetch from public.users table
    const { data: dbUser } = await supabase.from('users').select('*').eq('id', user.id).single();
    
    const firstName = dbUser?.first_name || user.user_metadata?.first_name || '';
    const lastName = dbUser?.last_name || user.user_metadata?.last_name || '';
    const otherNames = dbUser?.other_names || user.user_metadata?.other_names || '';
    const createdAt = dbUser?.created_at || user.created_at || new Date().toISOString();
    const role = dbUser?.role || user.role || 'user';

    // Pre-fill profile form
    setVal('up-firstname',  firstName);
    setVal('up-lastname',   lastName);
    setVal('up-othernames', otherNames);

    // Populate dashboard display info
    const fullName = (firstName || lastName || otherNames) ? (firstName + ' ' + lastName + (otherNames ? ' ' + otherNames : '')).trim() : 'Standard User';
    setText('dash-name',        fullName);
    setText('dash-name-detail', fullName);
    setText('dash-email-detail', user.email);
    setText('dash-role-detail', role === 'admin' ? 'Administrator' : 'Researcher');
    setText('dash-joined-detail', new Date(createdAt).toLocaleDateString('en-NG', {year:'numeric',month:'long',day:'numeric'}));

    var infoForm = document.getElementById('user-profile-form');
    if (infoForm) {
      infoForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        var fn = val('up-firstname'); var ln = val('up-lastname'); var on = val('up-othernames');
        if (!fn || !ln) { showToast('First and last name are required.'); return; }
        
        var submitBtn = infoForm.querySelector('button[type="submit"]');
        var originalText = submitBtn.textContent;
        submitBtn.textContent = 'Saving...';
        submitBtn.disabled = true;
        
        const { error } = await supabase.auth.updateUser({
          data: { first_name: fn, last_name: ln, other_names: on }
        });
        
        const { error: dbError } = await supabase.from('users').update({
          first_name: fn,
          last_name: ln,
          other_names: on
        }).eq('id', user.id);

        if (error || dbError) {
          showToast('Error updating profile: ' + (error ? error.message : dbError.message));
        } else {
          var full = fn + ' ' + ln + (on ? ' ' + on : '');
          setText('dash-name',        full);
          setText('dash-name-detail', full);
          showToast('Profile updated.');
          setVal('up-firstname', '');
          setVal('up-lastname', '');
          setVal('up-othernames', '');
          var overviewBtn = document.querySelector('.dash-tab-btn[data-dtab="overview"]');
          if (overviewBtn) overviewBtn.click();
        }
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      });
    }

    // Password change
    var pwForm = document.getElementById('user-pw-form');
    if (pwForm) {
      pwForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        var curPw = val('up-current-pw');
        var newPw = val('up-new-pw');
        var conPw = val('up-confirm-pw');
        
        if (!curPw || !newPw || !conPw) { showToast('Please fill in all password fields.'); return; }
        if (newPw.length < 8) { showToast('New password must be at least 8 characters.'); return; }
        if (newPw !== conPw)  { showToast('New passwords do not match.'); return; }
        
        var submitBtn = pwForm.querySelector('button[type="submit"]');
        var originalText = submitBtn.textContent;
        submitBtn.textContent = 'Updating...';
        submitBtn.disabled = true;
        
        const { error } = await supabase.auth.updateUser({ password: newPw });
        if (error) {
          showToast('Error updating password: ' + error.message);
        } else {
          pwForm.reset();
          showToast('Password changed successfully.');
        }
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      });
    }
  });
}

/* ============================================================
   UTILITY Ã¢â‚¬â€ set a field value by id
   ============================================================ */
function setVal(id, v) { var el = document.getElementById(id); if (el) el.value = v; }

