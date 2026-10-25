# Final Development Prompt — Customer Reservation & Booking Management System

Build a complete, real-working **Customer Reservation & Booking Management System** using HTML, CSS, JavaScript, Next.js, Node.js, Express.js, and a local JSON database.

This is an MCA college project. Develop the complete application with a premium UI, functional customer and admin modules, persistent data storage, authentication, reservation management, and payment records.

## 1. Mandatory Technology Stack

Use only the following core technologies:

- HTML5 — page structure and semantic markup.
- CSS3 — styling and responsive layouts.
- JavaScript — frontend and backend programming.
- Next.js — customer website and separate admin application.
- Node.js — backend runtime.
- Express.js — REST API.
- JSON files — local persistent database.

Additional utility libraries are allowed only when necessary for security, validation, icons, charts, or running multiple applications.

Do not use TypeScript, Tailwind CSS, Bootstrap, MongoDB, MySQL, PostgreSQL, Firebase, or Supabase.

Do not use localStorage as the primary database.

## 2. Three Separate Applications and Ports

Create three independent applications:

| Application | Technology | Port |
|---|---|---|
| Customer Website | Next.js + JavaScript + CSS | 3000 |
| Admin Panel | Next.js + JavaScript + CSS | 3001 |
| Backend API | Node.js + Express.js | 5000 |

URLs:
- Customer: `http://localhost:3000`
- Admin: `http://localhost:3001`
- Backend: `http://localhost:5000`

Both frontend applications must communicate with the same backend API and the same JSON database.

The customer website must not contain admin dashboard pages. The admin application must not contain customer booking dashboards.

## 3. Mandatory Separate CSS File Rule

**Every page must have its own separate CSS file.**

Do not place all styling in one large CSS file. Do not put page-specific styling inside JavaScript or JSX files.

Use regular CSS files and import them into their corresponding Next.js pages or components.

Examples:

Customer application:

- `app/page.js` → `styles/home.css`
- `app/login/page.js` → `styles/login.css`
- `app/register/page.js` → `styles/register.css`
- `app/services/page.js` → `styles/services.css`
- `app/booking/page.js` → `styles/booking.css`
- `app/dashboard/page.js` → `styles/customer-dashboard.css`
- `app/reservations/page.js` → `styles/reservations.css`
- `app/payments/page.js` → `styles/payments.css`
- `app/profile/page.js` → `styles/profile.css`

Admin application:

- `app/login/page.js` → `styles/admin-login.css`
- `app/dashboard/page.js` → `styles/admin-dashboard.css`
- `app/customers/page.js` → `styles/customers.css`
- `app/services/page.js` → `styles/admin-services.css`
- `app/reservations/page.js` → `styles/admin-reservations.css`
- `app/availability/page.js` → `styles/availability.css`
- `app/payments/page.js` → `styles/admin-payments.css`
- `app/settings/page.js` → `styles/settings.css`

Create a separate CSS file for every additional page.

Shared components may have their own CSS files, such as:
- `components/Navbar.js` → `styles/navbar.css`
- `components/Footer.js` → `styles/footer.css`
- `components/Sidebar.js` → `styles/sidebar.css`
- `components/Modal.js` → `styles/modal.css`

A small global stylesheet may contain only global resets, fonts, CSS variables, and basic body styles. All page-specific design must remain in its own CSS file.

Use normal CSS class names, reusable variables, and clear naming conventions. Avoid conflicting styles between pages.

## 4. Project Folder Structure

Create this monorepo:

`customer-reservation-system/`

- `apps/customer/` — Customer Next.js app.
- `apps/admin/` — Admin Next.js app.
- `apps/api/` — Node.js + Express backend.
- `database/` — Local JSON database.
- `package.json` — Root project scripts.
- `.env.example` — Environment configuration template.
- `.gitignore` — Ignore secrets and temporary files.
- `README.md` — Installation and usage guide.

Inside each Next.js application, use the App Router and JavaScript.

Organize frontend code into:
- `app/` for pages and layouts.
- `components/` for reusable components.
- `styles/` for separate CSS files.
- `lib/` for API clients and helpers.
- `public/` for images and static assets.

Organize the backend into:
- `routes/`
- `controllers/`
- `services/`
- `middleware/`
- `utils/`
- `config/`
- `server.js`
- `app.js`

## 5. Customer Website

Develop the following functional pages:

### Home Page
- Professional landing page.
- Header and navigation.
- Hero section with a booking button.
- Featured services.
- Benefits and service categories.
- How booking works.
- Contact section and footer.

### Registration and Login
- Customer registration.
- Email and password login.
- Input validation.
- Password hashing on the backend.
- Session-based authentication.
- Duplicate email prevention.
- Logout functionality.

### Services Page
- Display services from the JSON database.
- Search and filter services.
- Show service name, category, description, price, and availability.
- Provide a working booking button.

### Customer Dashboard
- Total bookings.
- Upcoming bookings.
- Completed bookings.
- Cancelled bookings.
- Recent reservation activity.

All statistics must come from real backend data.

### Booking Page
- Select service.
- Select date and time slot.
- Enter quantity or number of people.
- Add optional instructions.
- Calculate total price.
- Confirm reservation.
- Generate a unique booking ID.

Validate booking availability on the backend and prevent overbooking.

### My Reservations
- Display customer bookings.
- Search and filter records.
- View booking details.
- Modify eligible reservations.
- Cancel eligible reservations.
- Print a booking receipt.

Customers must only access their own reservations.

### Payments
- Display reservation charges.
- Provide clearly labelled demo payment processing.
- Generate payment references.
- Save payment records.
- Display transaction status.
- Print receipts.

Do not claim to process real money without a genuine payment gateway.

### Profile
- View and update profile.
- Change password.
- View account information.
- Logout securely.

## 6. Admin Panel

Create a completely separate admin application on port 3001.

### Admin Login
- Dedicated admin login page.
- Secure password verification.
- Role-based authorization.
- Redirect unauthorized users to login.

Admin accounts must be created through a secure seed script. Public registration must never grant admin access.

### Admin Dashboard
Display:
- Total customers.
- Total reservations.
- Today's bookings.
- Upcoming bookings.
- Cancelled bookings.
- Paid payment records.
- Recorded revenue from eligible payments.

Add charts for reservation status, monthly bookings, and revenue trends.

### Customer Management
- View all customers.
- Search and filter customers.
- View customer details.
- View reservation history.
- Activate or deactivate accounts.

### Service Management
- Add services.
- Edit services.
- Set prices and categories.
- Configure capacity.
- Configure dates and time slots.
- Block unavailable dates.
- Activate or deactivate services.

### Reservation Management
- View all reservations.
- Search by booking ID.
- Filter by customer, date, and status.
- Confirm eligible reservations.
- Cancel reservations with reasons.
- Mark eligible reservations as completed.
- Review booking details.

### Availability Management
- Manage available dates.
- Manage time slots.
- Configure service capacity.
- Block unavailable dates and slots.
- Prevent capacity violations.

### Payment Management
- View payment records.
- Search by reference.
- Filter by payment status.
- Review pending and failed transactions.
- Record authorized refunds or adjustments.

### System Settings
- Application name.
- Currency in INR.
- Contact information.
- Cancellation rules.
- Booking restrictions.
- Enabled payment methods.

Every admin action must update the JSON database through the backend API.

## 7. Node.js Backend

Create a fully functional Express.js REST API on port 5000.

The backend must handle:
- Authentication.
- Authorization.
- User management.
- Service management.
- Reservation creation and modification.
- Availability validation.
- Payment records.
- Dashboard calculations.
- System settings.
- Input validation.
- Error handling.

Implement proper API endpoints for all customer and admin functions.

Use `bcryptjs` for password hashing and secure HTTP-only cookies for sessions.

Configure CORS to allow the two frontend origins on ports 3000 and 3001. Use credentials correctly, protect cookie-authenticated requests against CSRF, and enforce permissions on the backend.

Never trust frontend role checks alone.

## 8. Local JSON Database

Create these files inside `database/`:

- `users.json`
- `services.json`
- `reservations.json`
- `payments.json`
- `settings.json`
- `auditLogs.json`

The backend must be the only application that directly reads and writes these files.

Requirements:
- Automatically initialize missing files.
- Preserve existing data on restart.
- Generate unique record IDs.
- Validate data before saving.
- Handle missing or corrupted files.
- Prevent conflicting writes through serialized writes.
- Recheck availability before confirming bookings.
- Maintain relationships between customers, services, reservations, and payments.
- Keep passwords hashed.
- Never expose the database directory through the public frontend.

Document that JSON storage is for a local academic project and is not suitable for unrestricted multi-instance production deployment.

## 9. Root Commands

Create a root `package.json` with these commands:

- `npm install`
- `npm run dev:customer`
- `npm run dev:admin`
- `npm run dev:api`
- `npm run dev`
- `npm run seed`

Use a process manager such as `concurrently` so `npm run dev` starts all three applications.

Configure ports and API base URLs correctly. Provide `.env.example` and complete installation instructions.

## 10. UI Quality Requirements

- Premium, professional visual design.
- Consistent white, navy, and blue color palette.
- Responsive desktop, tablet, and mobile layouts.
- Separate CSS file for every page.
- Smooth but lightweight animations.
- Clean tables, forms, cards, and dashboard layouts.
- Proper loading, success, error, and empty states.
- Toast notifications.
- Form validation.
- Confirmation dialogs.
- Accessible labels and keyboard-friendly controls.
- No broken buttons or fake statistics.
- No placeholder actions presented as functional features.

## 11. Testing and Final Delivery

Test customer registration, login, service search, booking, availability, cancellation, payment records, receipt printing, and profile updates.

Test admin login, customer management, service CRUD operations, reservation management, availability changes, payment records, and dashboard statistics.

Verify:
- Data persists after restarting the backend.
- Both frontends use the same data.
- Customer access is restricted to the customer's own records.
- Admin routes reject customer accounts.
- All three applications run on their assigned ports.
- Every page imports its own CSS file.
- Every important UI action calls a working backend endpoint.

Deliver the complete source code, all separate CSS files, backend API, JSON database initialization, seed script, root package configuration, `.env.example`, `.gitignore`, and README.

Do not stop after creating the UI or project structure. Implement the entire application and test the actual workflows.

**Final requirement:** A real-working Customer Reservation & Booking Management System using HTML, CSS, JavaScript, Next.js, Node.js, Express.js, and local JSON storage, with a separate customer website on port 3000, admin panel on port 3001, backend API on port 5000, and an individual CSS file for every page.