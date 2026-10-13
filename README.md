# 📝 NoteFlow Vault — Secure Full-Stack Notes Management Application

A clean, modern, and responsive Notes Management Studio built with **React + Vite**, **Node.js + Express**, and **MongoDB (Mongoose)** with persistent storage fallback and **Zero-Knowledge 3-Layer Authentication**.

---

## 🔐 Authentication & Security Model

### 3-Layer Password Protection
1. **Browser**: `SHA-256(username:password)` is computed client-side using Web Crypto API. Raw passwords **never** leave the browser or traverse the network.
2. **Server**: Double-hashes incoming pre-hashes using `bcrypt` (cost factor 12). Even a database breach exposes nothing usable.
3. **Database**: Stores only `bcrypt(SHA-256(username:password))` with user-scoped data isolation.

### One-Time Recovery Key
- A cryptographically secure 32-character **recovery key** is generated and displayed **once** at signup.
- Enables password reset via `POST /api/auth/reset` if a user forgets their password.
- Resetting a password automatically rotates and issues a new recovery key.

### Session & Protection Features
- **Session Tokens**: JWT stored in `sessionStorage` (automatically cleared on tab close) with 1-hour expiry.
- **Account Lockout**: 5 consecutive failed login attempts trigger an automatic 15-minute cooldown.
- **Rate Limiting**: Authentication endpoints are rate-limited to 10 attempts per 15 minutes per IP.
- **User-Scoped Isolation**: Every note query enforces `owner: req.userId` — cross-user data access is impossible.
- **Generic Errors**: "Invalid username or password" prevents username enumeration.

---

## 🌟 Features & Capabilities

1. **Vault Authentication Screen**: Dedicated Sign In, Create Account, and Password Reset tabs with live password strength meter and theme switching.
2. **One-Time Recovery Banner**: High-visibility banner allowing users to copy their recovery key immediately upon signup.
3. **User-Scoped Notes**: Notes belong strictly to the authenticated user.
4. **Modern Notes Dashboard**: Sleek, distraction-free dashboard with Dark and Light mode support, glassmorphism navbar, and crisp typography.
5. **Complete CRUD Operations**: Create, view, edit, and permanently delete notes with real-time UI updates.
6. **Pin & Unpin**: Pin priority notes to keep them anchored at the top of your dashboard.
7. **Archive & Restore**: Clean archive management to declutter active notes without losing valuable ideas.
8. **Real-Time Full-Text Search**: Instant search by note title and content body with debounced queries.
9. **Categories & Labels**: Organize notes by categories (*Work, Personal, Ideas, Study, Tasks, Custom*) and hashtags/labels (*#design, #sprint*).
10. **Sorting & Filtering**: Sort by *Latest Updated*, *Oldest*, and *Title (A-Z)*. Filter by active category, tag, or view mode.
11. **View Modes**: Switch dynamically between responsive **Grid View** (multi-column cards) and **List View** (compact rows).
12. **Form Validation & Safety**: Inline form validations preventing empty titles or content, enforcing character limits (120 chars for title, 10,000 for body).
13. **Visual Feedback & Modals**: Smooth animated modals, confirmation dialogs before note deletion, and instant toast notifications.
14. **Responsive Design**: Optimized across mobile phones, tablets, laptops, and desktop screens with a mobile drawer navigation.
15. **Database Integration**: Fully connected with MongoDB (via Mongoose) and resilient persistent file fallback (`data/notes.json` and `data/users.json`).

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | React 19, Vite 8 | Ultra-fast client-side application with HMR |
| **Icons & UI** | Lucide React | Modern, clean vector iconography |
| **Styling** | Custom CSS System | Tailored responsive design system with theme variables |
| **Backend** | Node.js, Express 4 / 5 | Modular REST API server with routing & middleware |
| **Authentication** | JWT, bcryptjs, Web Crypto SHA-256 | 3-layer zero-knowledge authentication pipeline |
| **Security** | Helmet, express-rate-limit, express-mongo-sanitize, HPP | Rate limiting, security headers, injection guards |
| **Database** | MongoDB & Mongoose 8 | Document database with user-scoped indexes |
| **Persistence** | Mongoose + Local JSON | Dual-mode persistence ensuring data longevity |

---

## 📂 Project Structure

```text
Notepad/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database connection & health status manager
│   ├── controllers/
│   │   ├── authController.js     # Register, Login, Reset, Me endpoints
│   │   └── notes.controller.js   # User-scoped REST CRUD controller
│   ├── data/
│   │   ├── notes.json            # Fallback persistent note storage
│   │   └── users.json            # Fallback persistent user storage
│   ├── middleware/
│   │   ├── auth.js               # JWT verification middleware (requireAuth)
│   │   ├── errorHandler.js       # Centralized 404 & error formatting middleware
│   │   └── validate.js           # Request payload & ID validation middleware
│   ├── models/
│   │   ├── Note.js               # Mongoose Note schema with owner reference
│   │   └── User.js               # Mongoose User schema with authHash & lockout
│   ├── routes/
│   │   ├── authRoutes.js         # Rate-limited auth endpoints
│   │   └── notes.routes.js       # Protected routes for /api/notes
│   ├── .env                      # Environment variables (PORT, MONGO_URI, JWT_SECRET)
│   ├── .env.example              # Environment variables template
│   ├── package.json              # Backend dependencies & scripts
│   └── server.js                 # Express server entry point
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── authApi.js        # Auth API client & session storage
│   │   │   └── notesApi.js       # Notes API client with Bearer token interceptor
│   │   ├── components/
│   │   │   ├── AuthScreen.jsx    # Sign In, Create Account, Reset Password modal
│   │   │   ├── RecoveryBanner.jsx# One-time recovery key display banner
│   │   │   ├── Navbar.jsx        # Top bar with user chip, sign-out, theme & DB badge
│   │   │   ├── Sidebar.jsx       # Views, category filter, tag cloud
│   │   │   ├── Toolbar.jsx       # Active view title, sorting & grid/list toggle
│   │   │   ├── NoteCard.jsx      # Note item with color accents & actions
│   │   │   ├── NoteEditorModal.jsx # Create & edit note modal with validations
│   │   │   ├── NoteViewModal.jsx # Note reader dialog with metadata
│   │   │   ├── ConfirmModal.jsx  # Deletion confirmation dialog
│   │   │   ├── Toast.jsx         # Success / Error / Info toast notifications
│   │   │   ├── EmptyState.jsx    # Context-aware empty state illustrations
│   │   │   └── SkeletonLoader.jsx# Shimmer loading placeholders
│   │   ├── hooks/
│   │   │   └── useAuth.js        # Authentication lifecycle & session restore hook
│   │   ├── lib/
│   │   │   └── crypto.js         # Client-side SHA-256 derivation helper
│   │   ├── App.jsx               # Auth gate & main dashboard layout
│   │   ├── App.css               # Component layout styling
│   │   ├── index.css             # Theme design system & typography tokens
│   │   └── main.jsx              # React mounting root
│   ├── index.html                # App HTML template with SEO tags
│   ├── package.json              # Frontend dependencies & scripts
│   └── vite.config.js            # Vite build configuration with /api proxy
├── .gitignore                    # Git ignore file
├── package.json                  # Root npm scripts
└── README.md                     # Documentation
```

---

## 🚀 Getting Started & Installation

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```

Configure `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/notesapp
JWT_SECRET=your_96_character_hex_secret_here
NODE_ENV=development
```

Start the backend:
```bash
npm run dev
# Server starts on http://localhost:5000
```

### 2. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
# App starts on http://localhost:5173
```

Open **`http://localhost:5173`** in your browser to sign in or create an account.

---

## 📡 REST API Documentation

### Authentication (`/api/auth`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new account with client SHA-256 pre-hash; returns JWT & one-time recovery key |
| `POST` | `/api/auth/login` | Authenticate with client SHA-256 pre-hash; returns JWT |
| `GET` | `/api/auth/me` | Fetch current user profile (requires `Bearer <token>`) |
| `POST` | `/api/auth/reset` | Reset password using 32-character recovery key; returns new JWT & new recovery key |

### Notes (`/api/notes` - All require `Authorization: Bearer <token>`)

| Method | Endpoint | Query Parameters | Description |
|---|---|---|---|
| `GET` | `/api/notes` | `search`, `category`, `label`, `sort`, `archived`, `pinned` | Fetch notes owned by authenticated user |
| `GET` | `/api/notes/meta/stats` | — | Aggregate statistics for current user's notes |
| `GET` | `/api/notes/:id` | — | Retrieve a single user-owned note |
| `POST` | `/api/notes` | — | Create a note scoped to current user |
| `PUT` | `/api/notes/:id` | — | Update user-owned note |
| `DELETE` | `/api/notes/:id` | — | Permanently delete user-owned note |
| `PATCH` | `/api/notes/:id/pin` | — | Pin/unpin note |
| `PATCH` | `/api/notes/:id/archive` | — | Archive/restore note |

---

## 📄 License
This project is open-source and available under the MIT License.
