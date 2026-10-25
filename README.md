# ReserveEase — Customer Reservation & Booking Management System

> **MCA Final Year Project**  
> A complete, enterprise-grade, multi-tenant Customer Reservation & Booking Management System built using **HTML5, CSS3, JavaScript, Next.js 14 (App Router), Node.js, Express.js, and local persistent JSON flat-file storage with mutex locks**.

---

## 🌐 Application Ports & Access URLs (दो नो / तीन पोर्ट्स)

System me 3 independent applications run hoti hain jo alag-alag ports par chalti hain:

| Application | Port | URL | Description (Kaam) |
|---|---|---|---|
| **Customer Portal** | **`3000`** | **`http://localhost:3000`** | Customers ke liye booking website: Browse services, real-time slot booking, live dashboard, payment checkout, and printable receipts. |
| **Admin Operations Panel** | **`3001`** | **`http://localhost:3001`** | Administrators ke liye management portal: KPI dashboard, service CRUD, reservation management, slot capacity & date blocking, refund handling, and audit logs. |
| **Backend REST API** | **`5000`** | **`http://localhost:5000/api`** | Central Node.js + Express REST API backend jo database operations, JWT authentication, capacity checks, and mutex file serialization handle karta hai. |

---

## 🔑 Login Credentials (लॉगिन क्रेडेंशियल्स)

Project ko test karne ke liye seeded default accounts:

### 🛡️ 1. Administrator Account (Admin Panel: `http://localhost:3001`)
- **Email:** `admin@reserveease.com`
- **Password:** `Admin@123`
- **Role:** `admin`
- **Permissions:** Full system access (Dashboard, Manage Bookings, Block Dates/Holidays, Add/Edit Services, Customer Accounts, Audit Logs).
- *Note:* Customer portal ke credentials admin portal me login nahi ho sakte (Role-Based Access Control enforced).

### 👤 2. Customer Accounts (Customer Portal: `http://localhost:3000`)
- **Customer 1:**
  - **Email:** `rohit@example.com`
  - **Password:** `Customer@123`
  - **Name:** Rohit Sharma
- **Customer 2:**
  - **Email:** `priya@example.com`
  - **Password:** `Customer@123`
  - **Name:** Priya Sharma
- *Or Naya Account Banayein:* `http://localhost:3000/register` par jaakar koi bhi user instantly apna account register kar sakta hai.

---

## ⚡ Quick Start Commands (प्रोजेक्ट कैसे चलाएं)

### Step 1: Dependencies Install Karein
```bash
npm run install:all
```
*(Ya simply root folder me `npm install` run karein)*

### Step 2: Database Seed Karein (Default data load karein)
```bash
npm run seed
```
*(Yeh command default admin, customers, 6 amenities, sample bookings, and payments ko `database/` folder me load kar degi)*

### Step 3: Saare Applications Ek Saath Start Karein
```bash
npm run dev
```
*(Yeh `concurrently` ke through Port 5000 API, Port 3000 Customer, aur Port 3001 Admin tino ko ek hi terminal se launch kar dega)*

#### Optional: Alag-Alag Terminals Me Chalana Ho Toh:
```bash
# Terminal 1 — Backend API (Port 5000)
npm run dev:api

# Terminal 2 — Customer Portal (Port 3000)
npm run dev:customer

# Terminal 3 — Admin Portal (Port 3001)
npm run dev:admin
```

---

## 📁 File Structure & Har Ek File Ka Kaam (Detailed File Explanation)

Project ka modular monorepo structure neeche diya gaya hai jisme har file aur directory ka specific kaam explain kiya gaya hai:

```
New1/
├── database/                    # Persistent Local JSON Flat-File Database
├── apps/
│   ├── api/                     # Node.js + Express.js Backend REST API (Port 5000)
│   ├── customer/                # Customer Next.js 14 App (Port 3000)
│   └── admin/                   # Admin Operations Next.js 14 App (Port 3001)
├── package.json                 # Monorepo root configuration & scripts
└── README.md                    # Project documentation
```

---

### 🗄️ 1. `database/` — Local Persistent JSON Database Files

Yeh folder local JSON files me persistent data save karta hai (server restart hone par bhi data delete nahi hota):

| File Name | Kaam & Description |
|---|---|
| **`users.json`** | Sabhi users (Admin aur Customers) ka record rakhta hai. Passwords `bcryptjs` se securely hash kiye gaye hain. Fields: `id`, `name`, `email`, `password`, `role` (`admin`/`customer`), `phone`, `status`. |
| **`services.json`** | Sabhi bookable amenities aur services ki list rakhta hai (Boardroom, Spa, Dining, Banquet, Co-Working Desk, Photo Studio). Fields: `id`, `name`, `category`, `price`, `durationMinutes`, `capacityPerSlot`, `availableSlots`, `blockedDates`, `imageUrl`. |
| **`reservations.json`** | Customers dwara ki gayi sabhi bookings ko store karta hai. Har booking ka unique ID hota hai (e.g., `BK-W6HE2`). Fields: `bookingId`, `customerId`, `serviceId`, `date`, `timeSlot`, `totalPrice`, `paymentStatus` (`paid`/`unpaid`), `status` (`confirmed`/`pending`/`cancelled`/`completed`). |
| **`payments.json`** | Financial transaction records rakhta hai. Fields: `id` (`PAY-XXXXXX`), `reservationId`, `bookingId`, `amount`, `paymentMethod` (Card, UPI, Net Banking), `transactionRef`, `status`, `paidAt`. |
| **`settings.json`** | Global application parameters save karta hai: Company Name, Currency (`INR`), GST Tax Rate (18%), Support Email, Contact Phone, and Cancellation Notice rules. |
| **`auditLogs.json`** | Security aur administrative action logs rakhta hai (e.g., kis user ne kab login kiya, booking cancel ki, service edit ki, ya date block ki). |

---

### ⚙️ 2. `apps/api/` — Backend REST API (Node.js + Express on Port 5000)

Yeh backend application sabhi client requests ko process karta hai, authorization verify karta hai, aur database me atomic writes perform karta hai:

#### Entry Points & Configurations
- **`apps/api/server.js`**: Backend ka main entrypoint. Express server ko port 5000 par start karta hai aur unhandled exceptions ko handle karta hai.
- **`apps/api/app.js`**: Express application create karta hai, CORS, cookie parser, JSON body parser configure karta hai aur sabhi routes mount karta hai.
- **`apps/api/config/index.js`**: Environment variables, Port (5000), JWT secret keys, aur database file paths define karta hai.

#### Database Service (Atomic Write Queue)
- **`apps/api/services/db.service.js`**: **Project ka sabse critical core component!** Yeh class `database/*.json` files ko read aur write karti hai. Isme Promise-based serialized write queue (`writeQueue`) implement kiya gaya hai taaki concurrent requests ke time file corruption ya race conditions na hon (Atomic Mutex Locking).

#### Middleware
- **`apps/api/middleware/auth.js`**: JWT authentication middleware. Cookies ya `Authorization: Bearer <token>` header se token verify karta hai aur user payload `req.user` me attach karta hai.
- **`apps/api/middleware/adminOnly.js`**: RBAC (Role-Based Access Control) guard jo check karta hai ki user ka role `'admin'` hai ya nahi. Agar customer admin route access kare toh 403 Forbidden return karta hai.
- **`apps/api/middleware/errorHandler.js`**: Central error handling middleware jo saare runtime errors ko uniform JSON format me catch karta hai.

#### Controllers (Business Logic)
- **`apps/api/controllers/auth.controller.js`**: Login, Registration, Logout, aur `/me` verification logic. Passwords verify karta hai aur JWT issue karta hai.
- **`apps/api/controllers/service.controller.js`**: Services list karna, category filter, aur Admin dwara naye services create/update/delete karne ka logic.
- **`apps/api/controllers/availability.controller.js`**: Kisi particular date aur time slot par available capacity calculate karta hai aur Admin dwara dates ko block/unblock karta hai.
- **`apps/api/controllers/reservation.controller.js`**: Real-time booking creation (with capacity check lock), unique `BK-XXXXX` ID generation, customer reservations list, rescheduling, aur cancellation.
- **`apps/api/controllers/payment.controller.js`**: Payment checkout process karta hai, transaction save karta hai, reservation ko `paid` mark karta hai, receipt data deta hai, aur admin refunds execute karta hai.
- **`apps/api/controllers/customer.controller.js`**: Admin ke liye registered customers ki list, unka booking history, aur account activate/deactivate logic.
- **`apps/api/controllers/dashboard.controller.js`**: Admin dashboard ke liye real-time metrics compute karta hai (Total Revenue, Monthly Trends, Active Bookings, Today's Count).
- **`apps/api/controllers/settings.controller.js`**: System settings read/update karna aur audit logs retrieve karna.

#### Routes (API Endpoints)
- **`apps/api/routes/auth.routes.js`**: `/api/auth/login`, `/register`, `/logout`, `/me`.
- **`apps/api/routes/service.routes.js`**: `/api/services` (GET, POST, PUT, DELETE).
- **`apps/api/routes/availability.routes.js`**: `/api/availability/check`, `/block-date`, `/unblock-date`.
- **`apps/api/routes/reservation.routes.js`**: `/api/reservations/my`, `/all`, `/create`, `/:id/status`, `/:id/reschedule`.
- **`apps/api/routes/payment.routes.js`**: `/api/payments/my`, `/all`, `/demo-pay`, `/:id/receipt`, `/:id/refund`.
- **`apps/api/routes/customer.routes.js`**: `/api/customers`, `/:id/history`, `/:id/status`.
- **`apps/api/routes/dashboard.routes.js`**: `/api/dashboard/stats`, `/trends`.
- **`apps/api/routes/settings.routes.js`**: `/api/settings`, `/audit-logs`.

#### Scripts
- **`apps/api/scripts/seed.js`**: `npm run seed` command run karne par demo admin, customers, 6 amenities, aur initial records create karta hai.
- **`apps/api/scripts/verify-all.js`**: Automated integration test suite jo backend ke sabhi 18 endpoints ko test karta hai.

---

### 💻 3. `apps/customer/` — Customer Portal (Next.js 14 on Port 3000)

Customer portal users ko modern, interactive, aur animated interface provide karta hai:

#### Pages (`apps/customer/app/`)
- **`app/page.js`**: Customer Landing Page. Isme animated cosmic hero section, glowing orbs, live metrics strip (12,500+ Bookings, 100% Slot Accuracy), category explorer cards, **Popular Bookings section (6 interactive cards)**, Why ReserveEase feature grid, executive customer testimonials, aur interactive FAQ accordion shamil hain.
- **`app/services/page.js`**: Complete catalogue browser. Real-time search bar aur category pills ("Workspace & Meeting", "Health & Wellness", "Dining & Hospitality", "Creative Studio").
- **`app/booking/page.js`**: Real-time slot booking engine. Date selector, slot matrix, live capacity indicators, 18% GST calculator, aur booking confirm trigger.
- **`app/dashboard/page.js`**: Logged-in customer ka personal dashboard. Total bookings, upcoming appointments, aur quick action cards.
- **`app/reservations/page.js`**: "My Bookings" page. Customer apni saari bookings dekh sakta hai, slot reschedule kar sakta hai, cancel kar sakta hai, aur receipt print kar sakta hai.
- **`app/payments/page.js`**: **Brand-new bank-grade payment gateway portal**. Zero demo warning text. Isme realistic 3D Debit Card preview with EMV chip, live card input formatting, UPI / Dynamic QR Code scanner with countdown timer, Net Banking selector, order summary, aur official tax receipt generator shamil hain.
- **`app/login/page.js`**: Customer login page with email & password validation.
- **`app/register/page.js`**: Naye customers ke liye instant registration page.
- **`app/profile/page.js`**: User profile information aur password change form.
- **`app/layout.js`**: Customer app ka root layout jo Google Fonts, Navbar, Footer, AuthProvider, aur ToastProvider load karta hai.

#### Components (`apps/customer/components/`)
- **`Navbar.js`**: Sticky glassmorphic navigation bar with animated gradient logo, nav links with icons (Home, Amenities, Dashboard, My Bookings, Billing), live slot engine status indicator (`● Live Slot Engine`), and user profile dropdown.
- **`Footer.js`**: Site footer with navigational links, contact info, and security badges.
- **`Modal.js`**: Reusable modal dialog with custom `maxWidth` support (used for wide 920px payment portal).
- **`ReceiptModal.js`**: Computerized tax receipt with booking ID, customer details, itemized rate and GST, and print button.
- **`Toast.js`**: Floating toast notification popup (success, error, info).

#### Styles (`apps/customer/styles/`) — Dedicated CSS Files
*Har ek page aur component ki apni dedicated CSS file hai:*
- **`globals.css`**: CSS variables, color palettes, reset, and keyframe animations (`floatAnimation`, `pulseGlow`, `gradientShift`).
- **`navbar.css`**: Navigation bar styling, pill tabs, and animated glow effects.
- **`home.css`**: Hero section, floating cards, 4-column category cards, 6 showcase cards, why grid, testimonials, and accordion styles.
- **`payments.css`**: 3D metallic card, input fields with prefix icons, UPI box, Net Banking grid, and order summary card.
- **`services.css`**, **`booking.css`**, **`reservations.css`**, **`customer-dashboard.css`**, **`login.css`**, **`register.css`**, **`profile.css`**, **`modal.css`**, **`receipt.css`**, **`toast.css`**, **`footer.css`**.

#### Client Libraries (`apps/customer/lib/`)
- **`api.js`**: Backend API calling utility (handles base URL `http://localhost:5000/api`, cookies, and error handling).
- **`auth-context.js`**: React Context for persistent customer authentication state.
- **`toast-context.js`**: React Context for triggering alerts across pages.

---

### 🛡️ 4. `apps/admin/` — Admin Operations Portal (Next.js 14 on Port 3001)

Administrators ke liye enterprise command center:

#### Pages (`apps/admin/app/`)
- **`app/page.js`**: Root router jo admin auth state check karke `/dashboard` ya `/login` redirect karta hai.
- **`app/login/page.js`**: Dedicated Administrator Login page. Public customer accounts ko strictly reject karta hai.
- **`app/dashboard/page.js`**: Executive Command Dashboard. Real-time KPI statistics (Total Customers, Total Bookings, Today's Schedule, Gross Revenue), CSS monthly booking trend chart, booking status breakdown, aur live audit trail.
- **`app/reservations/page.js`**: Master Reservations Registry. Date aur status filter, booking confirmation, completion, cancellation with recorded reasons, and receipt viewing.
- **`app/availability/page.js`**: Slot Capacity & Date Lock Matrix. Specific dates ko maintenance ya holidays ke liye lock/block karne ka control.
- **`app/services/page.js`**: Service Catalogue CRUD. New service add karna, price change karna, slot capacity update karna, aur image URLs manage karna.
- **`app/customers/page.js`**: Customer Directory. Sabhi registered customers ki list, complete booking history modal, aur account activate/deactivate toggle.
- **`app/payments/page.js`**: Financial Transactions Registry. Sabhi recorded payments, transaction IDs, aur authorized refund execution.
- **`app/settings/page.js`**: System parameters (Tax rates, business contact, currency) and system-wide Audit Logs.
- **`app/layout.js`**: Admin layout jisme AdminSidebar, AdminNavbar, aur contextual providers shamil hain.

#### Components & Styles (`apps/admin/components/` & `apps/admin/styles/`)
- **`AdminSidebar.js`**: Collapsible dark blue enterprise sidebar with icons and active routes.
- **`AdminNavbar.js`**: Top bar with administrator badge, quick status, and logout button.
- Dedicated stylesheets: `admin-dashboard.css`, `admin-reservations.css`, `admin-services.css`, `admin-payments.css`, `availability.css`, `customers.css`, `settings.css`, `admin-login.css`, `admin-sidebar.css`, `admin-navbar.css`.

---

## 🔒 Security & Key Architectural Rules Implemented

1. **Mutex Serialized Writes**: `database/*.json` files ko concurrently modify karte waqt data overwrite na ho, iske liye `apps/api/services/db.service.js` me async promise queue implement kiya gaya hai.
2. **Zero Overbooking Engine**: Jab customer time slot select karta hai, toh backend live capacity count check karta hai (`reservations.filter(...) < capacityPerSlot`). Agar full ho, toh slot lock ho jata hai.
3. **No Inline CSS Rule**: Har page aur component ka code saaf aur maintainable hai kyonki har page apni dedicated `.css` file import karta hai.
4. **Authentic Payment Experience**: Payment page se saare jarring demo labels hata diye gaye hain; ab yeh 100% professional PCI-DSS compliant checkout portal ki tarah visual card, UPI QR, aur Net Banking options show karta hai.
5. **No Third-Party Database Dependencies**: Poora system pure Node.js local file storage par chalta hai, isliye bina kisi external MongoDB ya SQL installation ke directly kisi bhi system par chalaya ja sakta hai.

---

## 👨‍💻 Viva & Presentation Q&A Reference (कॉलेज वाइवा के मुख्य सवाल)

- **Q1: Tino apps aapas me communicate kaise karti hain?**  
  *Ans:* Customer (Port 3000) aur Admin (Port 3001) dono frontend Next.js applications hain. Dono `fetch/axios` calls ke zariye Port 5000 par chal rahi Express.js REST API se communicate karti hain.
  
- **Q2: Local JSON database me race condition kaise solve ki gayi hai?**  
  *Ans:* `apps/api/services/db.service.js` me ek `writeQueue` (Promise chain) implement kiya gaya hai jo har file write operation ko serialize karta hai. Ek operation complete hone ke baad hi agla operation start hota hai.

- **Q3: Password security kaise handle ki gayi hai?**  
  *Ans:* Passwords plain text me save nahi hote; unhe `bcryptjs` ke 10 salt rounds ke saath hash karke `database/users.json` me store kiya jata hai. Authentication ke liye JWT (JSON Web Tokens) ka use hota hai.

- **Q4: Zero Overbooking kaise guarantee hoti hai?**  
  *Ans:* Booking create hone se pehle backend `database/reservations.json` me us service aur date ke active bookings count karta hai. Agar count `capacityPerSlot` ke barabar ya zyada ho, toh request reject ho jati hai.
