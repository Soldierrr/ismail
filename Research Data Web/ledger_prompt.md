# AI Prompt — Ledger Research Data Marketplace (Full Build)

Use this prompt with any AI coding assistant to recreate or extend the **Ledger** research data marketplace website from scratch with all the features described below.

---

```text
Build a multi-page research data marketplace website called "Ledger" using plain HTML, CSS, and vanilla JavaScript. All user data, session state, and content must be stored using localStorage and sessionStorage only — no backend required. This is a fully functional template/prototype.

---

## TECH STACK
- HTML5 (semantic tags)
- Vanilla CSS with CSS custom properties (design tokens)
- Vanilla JavaScript (ES5/ES6 compatible, no frameworks)
- Google Fonts: Fraunces (serif headings) + Inter (sans-serif body)
- All state: localStorage for persistence, sessionStorage for current session

---

## DESIGN SYSTEM (CSS Variables)

  --paper: #F9F4EC;
  --paper-dim: #F1EADC;
  --ink: #2B2A28;
  --ink-soft: #5B5852;
  --teal: #1F3A3D;
  --teal-dark: #16292B;
  --gold: #C98A3E;
  --gold-dark: #A96F2C;
  --sage: #7A8B6F;
  --rule: #DCD2BE;
  --rule-strong: #C9BC9E;
  --white: #FFFFFF;
  --serif: "Fraunces", Georgia, serif;
  --sans: "Inter", system-ui, sans-serif;
  --radius: 4px;
  --max-width: 1080px;

---

## AUTH SYSTEM (localStorage)

### User object schema:
{
  "id": "u-xxxxxxx",
  "firstName": "string",
  "lastName": "string",
  "otherNames": "string (optional)",
  "email": "string",
  "passwordHash": "btoa(password) — demo only",
  "isAdmin": true or false,
  "createdAt": "ISO date string"
}

### Default admin seed (auto-created on first page load):
- Email: admin@ledger.ng
- Password: Admin@1234
- isAdmin: true

### localStorage keys:
- ledger_users        — JSON array of all users
- ledger_datasets     — JSON array of all uploaded datasets
- ledger_tickets      — JSON array of all support tickets
- ledger_payments     — JSON array of all payment records
- ledger_site_content — JSON object for editable site content (about + contact info)

### sessionStorage:
- ledger_session — currently logged-in user object

---

## NAVIGATION BEHAVIOUR

### Not logged in (guest):
Nav links: Home | Browse | About | Contact | [Log in button]

### Logged in as regular USER:
Nav links: Home | Browse | About | Contact
Right side of nav: [First Name] [User/Admin badge] [Logout icon button — power icon or right-arrow]
- "Sell your data" link is HIDDEN for users
- No "Log in" link shown

### Logged in as ADMIN:
Completely separate admin navigation (sidebar or dedicated admin header — NOT the same public nav).
Admin nav links: Dashboard | Users | Papers | Upload | Payments | Support Tickets | My Profile
- Admin pages must have their own nav/shell and must NOT show or append to the public nav
- No public nav links (Home, Browse, About, Contact) appear on admin pages
- Logout button at bottom of admin sidebar or top right corner

---

## PUBLIC PAGES (guests + logged-in users)

### 1. index.html — Home
- Hero section: tagline, CTA buttons ("Browse the archive", "List your dataset")
- Ledger card: recently added datasets with NGN prices (no dollar signs)
- "How it works" 3-step section
- Featured datasets section (3 cards) with download icon (Unicode down arrow) + count
- All prices in NGN, not exceeding N5,000

### 2. browse.html — Browse Datasets
- Page header
- Sidebar filters: keyword search, field checkboxes, price range in NGN
- Dataset list: each item shows title, description, tags, download icon + count, and NGN price
- Live JS filtering
- "Sell your data" nav link must NOT appear for regular users or guests

### 3. about.html — About
- Displays researcher/platform information
- Content (researcher name, bio, credentials) is loaded from localStorage (ledger_site_content.about)
- If no content in localStorage, show default hardcoded values
- Content is editable ONLY by admin through admin-profile.html

### 4. contact.html — Contact & Support
- Contact information displayed as solid clickable elements (NOT input fields):
  - Email shown as: a clickable mailto: link, e.g. contact@ledger.ng
  - Phone shown as: a clickable tel: link, e.g. +234 801 234 5678 (Nigerian format)
  - Both values loaded from localStorage (ledger_site_content.contact)
- FAQ accordion (5 existing FAQs)
- Support ticket form (replaces the old message/contact form entirely):
  - If user is logged in: name and email auto-populated and read-only
  - If guest: show name + email text fields
  - Additional fields: Subject (text input), Category (select: General Enquiry, Dataset Issue, Payment Issue, Technical Problem), Message (textarea)
  - On submit: ticket saved to ledger_tickets with ref number (TKT-00001 format), status "Open", and timestamp
  - Show success confirmation with ticket reference number
  - Admin views all tickets in admin-tickets.html

### 5. dataset.html — Dataset Detail
- Dataset title, description, tags, full metadata table
- Price in NGN, download count as icon + number
- "Buy this dataset" button (requires login)

### 6. login.html — Log in / Create Account
- Two tabs: Log In | Create Account
- Log In: Email + Password
- Create Account: First Name, Last Name, Other Names (optional), Email, Password, Confirm Password
- Inline validation error messages per field
- On success: redirect to dashboard.html (user) or admin-dashboard.html (admin)
- Accounts stored in localStorage

---

## USER PAGES (logged-in regular users only)

### dashboard.html — My Profile
Redirect to login.html if not authenticated.
Layout:
- Left column: profile card
  - Avatar circle with user initials
  - Full name (First + Last + Other)
  - Role badge (Researcher or Administrator)
  - Email, member since date
  - Logout button (danger/outline style)
  - Admin panel link (only shown if isAdmin is true)
- Right column:
  - 3 stat cards: Datasets purchased, Downloads used, Total spent in NGN
  - "Recent Transfers" section: table showing the user's payment history pulled from ledger_payments by matching userEmail. Columns: Date, Dataset Title, Amount (NGN), Status
  - If no transfers: empty state with browse CTA
  - Account information table (read-only)

---

## ADMIN PAGES (logged-in admins only — completely separate experience)

All admin pages must:
- Redirect non-admins to index.html with a toast message
- Use a dedicated admin layout with its own sidebar nav (not the public nav)
- Admin sidebar nav items: Dashboard, Users, Papers, Upload, Payments, Support Tickets, My Profile
- Admin nav must NOT contain or reference the public site nav (Home, Browse, About, Contact)
- Each admin page is a separate HTML file

### admin-dashboard.html — Admin Dashboard
- Admin sidebar nav (persistent across all admin pages)
- Page title: "Dashboard"
- 4 large stat cards:
  1. Total Papers — count of items in ledger_datasets
  2. Total Downloads — sum of all dataset download counts
  3. Total Revenue — sum of all payment amounts from ledger_payments, displayed as NGN
  4. Total Users — count of ledger_users
- Recent activity list (last 5 tickets, payments, or registrations)

### admin-users.html — Users
- Admin sidebar nav
- Table: Full Name, Email, Joined, Role badge (Admin/User), Actions
- Toggle admin: "Make Admin" or "Revoke Admin" button
- Protected seed admin cannot be changed
- Toast confirmation on role change

### admin-papers.html — Papers
- Admin sidebar nav
- Table: Title, Field, Price (NGN), Download count (icon + number), Uploaded by, Date
- Delete paper button (removes from ledger_datasets)

### admin-upload.html — Upload Dataset
- Admin sidebar nav
- Upload form: Dataset title, Description, Field/category (select), Price in NGN (max N5,000), Dataset file input, Sample file input (optional)
- On submit: save to ledger_datasets, show toast

### admin-payments.html — Payments
- Admin sidebar nav
- Table: Date, User Name, User Email, Dataset, Amount (NGN), Status (Verified/Pending)
- Data from ledger_payments localStorage
- Demo data can be seeded if no real payments exist

### admin-tickets.html — Support Tickets
- Admin sidebar nav
- Table: Ref#, Date, From (name/email), Category, Subject, Status (Open/Resolved)
- Click a row or an expand button to see full message
- "Mark as Resolved" button per ticket
- Toast on resolve
- Unread/open ticket count shown as a badge on the sidebar nav item

### admin-profile.html — My Profile (Admin)
- Admin sidebar nav
- Admin's personal info with editable form (first name, last name, email)
- Site content editor (admin only):
  Section 1 — About Page Content:
    - Researcher name, department, initials, bio text, credentials (one per line textarea)
    - Save button — saves to ledger_site_content.about
  Section 2 — Contact Information:
    - Contact email input
    - Contact phone input (Nigerian format, e.g. +234 801 234 5678)
    - Save button — saves to ledger_site_content.contact
- Toast confirmation on save

---

## BUG FIX REQUIRED
In the previous version, script.js's initNavAuth() function dynamically appended "Admin", "Dashboard", and "Log out" links to the public nav. When navigating to admin.html (which also had these items hardcoded), the nav showed duplicate entries.

FIX: 
- Admin pages must have their OWN dedicated HTML nav (a sidebar or admin header) baked into each admin page's HTML.
- script.js must NOT call initNavAuth() on admin pages, OR initNavAuth() must detect when the current page is an admin-*.html page and skip all nav modifications on admin pages entirely.
- The simplest fix: check if the current page filename starts with "admin-" and if so, do not run initNavAuth() at all on that page.

---

## FILE STRUCTURE
Research Data Web/
├── index.html              (public home)
├── browse.html             (public browse)
├── about.html              (public about — content from localStorage)
├── contact.html            (public contact + support ticket form)
├── dataset.html            (public dataset detail)
├── login.html              (login/register)
├── dashboard.html          (user: my profile + recent transfers)
├── admin-dashboard.html    (admin: overview stats)
├── admin-users.html        (admin: user management)
├── admin-papers.html       (admin: dataset list)
├── admin-upload.html       (admin: upload new dataset)
├── admin-payments.html     (admin: payment records)
├── admin-tickets.html      (admin: support tickets)
├── admin-profile.html      (admin: profile + edit site content)
├── script.js               (shared JS — see modules below)
└── styles.css              (all styles)

Note: The old admin.html, upload.html (public-facing), and admin-related dashboard.html are replaced by the above.

---

## KEY JavaScript MODULES IN script.js

seedAdmin()            — Create default admin if not exists
seedSiteContent()      — Create default contact/about content in localStorage  
isAdminPage()          — Returns true if current page filename starts with "admin-"
initNavAuth()          — Render correct nav for guest/user/admin (skip on admin pages)
initAdminGuard()       — Redirect non-admins from admin-*.html
initDashboardGuard()   — Redirect unauthenticated from dashboard.html
initAuthForms()        — Login + register forms with validation
initSearchFilter()     — Browse page filtering
initTicketForm()       — Contact page support ticket submission
initAboutPage()        — Load about content from localStorage
initContactPage()      — Load contact info from localStorage  
initAdminDashboard()   — Admin dashboard stat cards
initAdminUsers()       — Admin users table with toggle
initAdminPapers()      — Admin papers table
initAdminUpload()      — Admin upload form
initAdminPayments()    — Admin payments table
initAdminTickets()     — Admin tickets table with resolve action
initAdminProfile()     — Admin profile + site content editor
initUserDashboard()    — User profile + recent transfers table
showToast(msg)         — Bottom-right floating notification

---

## DATA SCHEMAS

### Support Ticket (ledger_tickets):
{
  "ref": "TKT-00001",
  "name": "Chukwuemeka Obi",
  "email": "user@example.com",
  "subject": "Cannot download dataset",
  "category": "Dataset Issue",
  "message": "Full message text",
  "status": "Open",
  "createdAt": "2026-09-16T20:00:00.000Z"
}

### Payment Record (ledger_payments):
{
  "id": "pay-xxxxx",
  "userEmail": "user@example.com",
  "userName": "Chukwuemeka Obi",
  "datasetId": "ds-xxxxx",
  "datasetTitle": "SME Tax Compliance Panel, 2015-2024",
  "amount": 4500,
  "status": "Verified",
  "createdAt": "2026-09-16T20:00:00.000Z"
}

### Site Content (ledger_site_content):
{
  "about": {
    "researcherName": "Dr. A. Kenton",
    "department": "Department of Accounting",
    "initials": "AK",
    "bio": "Dr. Kenton has spent two decades...",
    "credentials": [
      "PhD in Accounting, University of Lagos",
      "Associate Professor, Department of Accounting"
    ]
  },
  "contact": {
    "email": "contact@ledger.ng",
    "phone": "+234 801 234 5678"
  }
}

---

Prompt version: 1.0 — September 2026
Project: Ledger Research Data Marketplace
```
