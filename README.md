# 🏛️ Mazadak Frontend - Real-Time Auction & Bidding Platform

<div align="center">

![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite_5-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query_v5-FF4154?style=for-the-badge&logo=react-query&logoColor=white)
![GraphQL](https://img.shields.io/badge/GraphQL_WS-E10098?style=for-the-badge&logo=graphql&logoColor=white)
![React Hook Form](https://img.shields.io/badge/React_Hook_Form-EC5990?style=for-the-badge&logo=reacthookform&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)
![i18next](https://img.shields.io/badge/i18next-26A69A?style=for-the-badge&logo=i18next&logoColor=white)
![Lucide](https://img.shields.io/badge/Lucide_Icons-F59E0B?style=for-the-badge&logo=feather&logoColor=white)

**A cutting-edge, high-performance, and enterprise-grade frontend client for the Mazadak real-time auction and bidding platform. Built from the ground up using React 18, TypeScript (Strict Mode), Tailwind CSS, TanStack Query v5, and GraphQL Subscriptions.**

[🚀 Quick Start & Installation](#-quick-start--installation) • [🌐 Platform Overview](#-platform-overview) • [📐 Architecture & Rule 6](#-architecture--rule-6) • [🔄 System & Data Flows](#-system--data-flows) • [📦 The 11 Core Modules](#-the-11-core-modules) • [🎨 Design System & Aesthetics](#-design-system--aesthetics) • [🛡️ Security & Performance Hardening](#-security--performance-hardening) • [📂 Project Structure](#-project-structure) • [🏆 The 4 Mandatory QA Checks](#-the-4-mandatory-qa-checks)

</div>

---

## 🚀 Quick Start & Installation

To get a local development copy up and running, follow these simple steps:

### Prerequisites

Ensure you have the following installed on your local machine:
- **Node.js** (v18.0.0 or higher recommended, tested on v20+)
- **NPM** (v9+ or v10+)
- **Mazadak Backend Server** running on `http://localhost:3000` (or configured remote URL)

### 1. Clone the Repository

```bash
git clone https://github.com/adhamdr1/mazadak-frontend.git
cd mazadak-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create your `.env` configuration file from the provided template:

```bash
cp .env.example .env
```

Review and adjust the configuration parameters in `.env`:

```env
# GraphQL & REST Backend Endpoints (Leave empty in local dev to utilize Vite Proxy)
VITE_API_URL=
VITE_WS_URL=ws://localhost:3000/graphql

# Google OAuth 2.0 Client ID (Public Web Client ID)
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 4. Run the Development Server

```bash
npm run dev
```

The application will start with Hot Module Replacement (HMR) at:  
👉 **http://localhost:5173**

### 5. Production Build & Preview

```bash
# Validate strict types and compile optimized production bundle
npm run build

# Preview the production build locally
npm run preview
```

---

## 🌐 Platform Overview

**Mazadak (مزادك)** is an enterprise-grade digital auction ecosystem engineered for high-concurrency bidding, secure financial escrows, and real-time user interaction. The frontend application provides an intuitive, responsive, and bilingual experience that mirrors the robustness of the NestJS + MongoDB + RabbitMQ distributed backend.

### Key Capabilities at a Glance

- **⚡ Real-Time Live Bidding Engine:** Sub-millisecond reactive price updates and instant leading bidder indicators powered by `graphql-ws`.
- **🤖 Proxy Auto-Bidding:** Client interface for automated proxy bidding with budget ceilings and available balance validation.
- **🛡️ Escrow Protection & Inspection Timer:** Dynamic countdown window for buyers, delivery confirmation modal, and formal dispute center.
- **💳 Multi-Tier Digital Wallet:** Instant balance tracking, deposit integration (Paymob Payment Gateway), and 3-step withdrawal wizard with Egyptian financial validation (Bank, Mobile Wallets, InstaPay).
- **💬 Post-Auction Private Chat:** WebSocket communication channel between sellers and winning bidders with unread counters and read receipts.
- **🔔 Live Notifications Center:** Instant in-app notification dropdown and categorized notifications hub.
- **⭐ Mutual Blind Reviews:** Rating and review workflow with criteria breakdown and seller reply capability.
- **👑 Full-Featured Admin Control Center:** 6 administrative dashboards for KPIs, user moderation, auction cancellation, dispute resolution, treasury oversight, and transaction audit ledger.
- **🌍 Bilingual & Bi-directional (RTL/LTR):** Seamless Arabic and English localization with dynamic layout adaptation and localized numeric typography.
- **🌓 Adaptive Theme:** Deep navy luxury Dark Mode and clean Cloud White Light Mode with persistent user preferences.

---

## 📐 Architecture & Rule 6

The frontend is architected around **Feature-Based Modular Isolation** adhering strictly to the platform's core architectural guideline:

> ### 🏆 The Golden Rule (Rule 6):
> **« Component يرسم — Hook يفكر — Service يتكلم »**
> *(Component renders — Hook thinks — Service speaks)*

```
┌────────────────────────────────────────────────────────┐
│  Page / Component (.tsx)                               │
│  ├── Pure Presentation Layer                           │
│  ├── Zero direct GraphQL / Axios network calls         │
│  └── Consumes data and actions from custom hooks       │
└──────────────────────────┬─────────────────────────────┘
                           │ Consumes Hook
┌──────────────────────────▼─────────────────────────────┐
│  Custom Hook (use[Feature].ts)                         │
│  ├── Manages Component State & React Query Cache       │
│  ├── Subscribes to WebSockets & handles teardown       │
│  └── Dispatches operations via Service Layer           │
└──────────────────────────┬─────────────────────────────┘
                           │ Calls Service
┌──────────────────────────▼─────────────────────────────┐
│  Service ([module].service.ts)                         │
│  ├── Pure JavaScript / TypeScript API Abstraction      │
│  ├── Executes GraphQL queries / Axios requests         │
│  └── Transforms DTOs and handles response normalization│
└────────────────────────────────────────────────────────┘
```

### State Management Separation
- **Server State:** 100% managed by **TanStack Query (React Query v5)** with fine-tuned `staleTime`, zero redundant network waterfalls, and targeted query invalidations.
- **Global Application State:** Strictly confined to 3 specialized React Contexts:
  1. `AuthContext`: Authentication lifecycle, access token storage, and multi-tab synchronization (`window.addEventListener('storage')`).
  2. `SocketContext`: Singleton WebSocket client connection and multi-channel subscription multiplexing.
  3. `ThemeContext`: Dark/Light theme switching and persistent storage.
- **Local UI State:** Isolated to primitive `useState` and `useReducer` hooks for modals, dropdowns, and ephemeral wizard steps.

---

## 🔄 System & Data Flows

### 1. Authentication & Route Guards Architecture

```mermaid
graph TD
    Request[User Navigates to Route] --> Guard{Route Guard Check}
    
    Guard -->|Public Route / or /auctions| PublicPage[Render Page]
    Guard -->|Guest Only Route /login or /register| GuestCheck{Is Authenticated?}
    GuestCheck -->|Yes| RedirectHome[Redirect to / or returnUrl]
    GuestCheck -->|No| RenderAuth[Render Login/Register Page]
    
    Guard -->|Protected Route /wallet, /my-bids...| AuthCheck{Is Authenticated?}
    AuthCheck -->|No| RedirectLogin[Redirect to /login with state.from]
    AuthCheck -->|Yes| BanCheck{Is Account Banned?}
    BanCheck -->|Yes| BannedPage[Redirect to /banned]
    BanCheck -->|No| RenderUserPage[Render Protected Page]

    Guard -->|Admin Route /admin/*| AdminCheck{Role == 'ADMIN'?}
    AdminCheck -->|No| UnauthorizedPage[Redirect to /unauthorized 403]
    AdminCheck -->|Yes| RenderAdmin[Render AdminLayout & Dashboard]
```

---

### 2. Single-Flight Token Refresh Mutex Pattern

To eliminate race conditions when access tokens expire under parallel asynchronous requests, `apiClient.ts` implements a centralized Mutex Promise:

```mermaid
sequenceDiagram
    autonumber
    participant CompA as 🖥️ Page Component A
    participant CompB as 🖥️ Page Component B
    participant Client as 🌐 apiClient (Axios Interceptors)
    participant Mutex as 🔒 Single-Flight Promise
    participant BE as ⚙️ Backend (NestJS GraphQL)

    CompA->>Client: Query 1 (Expired Bearer Token)
    CompB->>Client: Query 2 (Expired Bearer Token)
    Client->>BE: Dispatch Requests to Server
    BE-->>Client: 401 UNAUTHENTICATED Error Response

    Note over Client,Mutex: First 401 triggers attemptTokenRefresh()
    Client->>Mutex: Invoke Refresh Mutex
    Note over Mutex: Create single shared refreshPromise
    Client->>Mutex: Second request awaits the same Promise

    Mutex->>BE: Mutation: RefreshToken(refreshToken)
    BE-->>Mutex: New AccessToken + RefreshToken
    Mutex->>Client: Update authStorage & dispatch mazadak:token_refreshed
    Note over Mutex: Reset refreshPromise = null

    Note over Client: Replay queued requests with new Bearer token
    Client->>BE: Replay Request 1 (New Token)
    Client->>BE: Replay Request 2 (New Token)
    BE-->>CompA: Response 1 Success (200 OK)
    BE-->>CompB: Response 2 Success (200 OK)
```

---

### 3. Real-Time Live Bidding Engine & Teardown

```mermaid
sequenceDiagram
    autonumber
    participant U as 👤 Bidder (UI)
    participant H as 🧠 useAuctionDetail
    participant S as ⚡ bidsService
    participant WS as 🔄 graphql-ws (WebSocket)
    participant BE as ⚙️ Backend Engine
    participant Q as 🗄️ TanStack Query Cache

    Note over H,WS: Conditional Subscription: only opens when effectiveStatus === 'ACTIVE'
    H->>WS: Subscribe: bidAdded(auctionId)
    
    U->>H: Place Bid Action (Amount: 5,500 EGP)
    H->>S: mutation PlaceBid(auctionId, amount)
    S->>BE: POST /graphql (Bearer Auth)
    BE-->>S: 200 OK (Bid Placed)

    BE--)WS: Broadcast bidAdded Event to all active subscribers
    WS--)H: Stream payload { currentPrice, leadingBidderId, bid }

    Note over H,Q: Synchronous 0ms Cache Update
    H->>Q: setQueryData(AUCTIONS.DETAIL) -> Update Price & Winner
    H->>Q: setQueriesData(BIDS.BY_AUCTION) -> Prepend Winning Bid
    H->>Q: invalidateQueries(WALLET.MY_WALLET)

    opt Auction Timer Expires or Admin Cancels
        Note over H: effectiveStatus transitions to 'ENDED' / 'CANCELLED'
        H->>WS: Call unsubscribe() & Close Socket Channel
    end
```

---

### 4. Escrow Inspection Window & Auto-Expiration

```mermaid
sequenceDiagram
    autonumber
    participant Buyer as 👤 Buyer
    participant EscrowUI as 🖥️ EscrowDetailPage
    participant Timer as ⏳ InspectionCountdown
    participant Svc as 🛡️ escrowService
    participant BE as ⚙️ Backend

    Note over EscrowUI,Timer: Escrow Status: HELD (7 Days Inspection Window)
    Timer->>Timer: Reactive Tick Interval
    
    alt Buyer Confirms Delivery
        Buyer->>EscrowUI: Click "Confirm Delivery"
        EscrowUI->>Svc: mutation ConfirmDelivery(escrowId)
        Svc->>BE: Release Funds to Seller
        BE-->>EscrowUI: Escrow Status -> RELEASED
    else Buyer Opens Dispute
        Buyer->>EscrowUI: Click "Open Dispute" -> Upload Evidence
        EscrowUI->>Svc: mutation OpenDispute(escrowId, details)
        BE-->>EscrowUI: Escrow Status -> DISPUTED (Funds Locked)
    else Timer Reaches 00:00:00
        Timer->>EscrowUI: Trigger onExpired() Callback
        Note over EscrowUI: Automatically invalidateQueries & refetch()
        EscrowUI->>BE: Query fresh escrow status from server
    end
```

---

## 📦 The 11 Core Modules

The platform is partitioned into **11 domain-driven feature modules**, all built with strict TypeScript interfaces and identical structural patterns:

### 1. Foundation & Layout Module
- **Shell Layout (`src/components/layout/`):** Responsive Navbar, contextual header, footer navigation, and mobile drawer.
- **Shared Primitives (`src/components/common/`):** Accessible `Modal` with focus trap, polymorphic `Button`, dynamic `DatePicker`, unified `DateRangeFilter`, `FilterDropdown`, `Pagination`, `CustomSelect`, and `CategoryBadge`.
- **Feedback Elements:** Lightweight `Toast` notification dispatcher and smooth skeleton loaders.

### 2. Authentication & Authorization Module (`src/features/auth/`)
- **Login (`LoginPage.tsx`):** Strict email and password validation with explicit `sessionStorage` vs `localStorage` isolation based on "Remember Me".
- **Registration (`RegisterPage.tsx`):** Multi-field registration with Egyptian phone number normalization (`+20`, `01...`).
- **Google OAuth 2.0 (`GoogleRegisterPage.tsx`):** Seamless one-tap social authentication with router state token forwarding.
- **Account Recovery & Activation:** `ForgotPasswordPage`, `ResetPasswordPage`, `VerifyNoticePage`, `VerifyEmailPage`, and `ReactivatePage`.

### 3. Auctions Module (`src/features/auctions/`)
- **Auction Browsing (`AuctionListPage.tsx`):** Advanced server-side filtering (category, price range, status, sorting) with responsive Grid / List toggle.
- **Auction Detail (`AuctionDetailPage.tsx`):** Image gallery with fallback resilience, dynamic countdown timers, seller controls, and bidding action CTA.
- **3-Step Creation Wizard (`CreateAuctionPage.tsx`):** Step-by-step form validation, image upload preview, and minimum bid increment rules.
- **Auction Management:** `EditAuctionPage.tsx` for pending auctions and `MyAuctionsPage.tsx` with segmented status tabs.

### 4. Bids & Proxy Auto-Bidding Module (`src/features/bids/`)
- **Live Bidding CTA (`LiveBiddingBox.tsx`):** Instant bidding interface with calculated next minimum increments and wallet balance validation.
- **Proxy Auto-Bidding Modal (`AutoBidModal.tsx`):** Configuration modal allowing bidders to declare budget ceilings with real-time feedback.
- **My Bids Dashboard (`MyBidsPage.tsx`):** Historical stream of active, winning, and outbid transactions with BiDi numeric formatting.

### 5. Digital Wallet & Financial Module (`src/features/wallet/`)
- **Wallet Overview (`WalletPage.tsx`):** Available balance vs held balance breakdown with dynamic visual cards.
- **Deposit Engine (`DepositPage.tsx`):** Seamless Paymob deposit gateway with automated webhook status synchronization.
- **3-Step Withdrawal Wizard (`WithdrawPage.tsx`):** Dynamic amount validation capped at available balance, method selection (Bank Account, Mobile Wallets, InstaPay), and fee previews.
- **Audit Ledger (`TransactionsPage.tsx` & `WithdrawalsPage.tsx`):** Complete chronological financial transactions ledger with unified date filtering.

### 6. Escrow & Dispute Resolution Module (`src/features/escrow/`)
- **Escrow Transactions (`MyEscrowsPage.tsx`):** Filtering across `HELD`, `RELEASED`, `REFUNDED`, and `DISPUTED` transactions.
- **Escrow Details (`EscrowDetailPage.tsx`):** Full transaction lifecycle view, inspection countdown, and confirmation modal.
- **Dispute Filing (`OpenDisputePage.tsx`):** Formal dispute creator with evidence image uploader, direct Cloudinary signed upload, and reason categorization.
- **Dispute Inspection (`DisputeDetailPage.tsx`):** Adjudication review page with image portal lightbox and resolution notes.

### 7. Post-Auction Chat Module (`src/features/chat/`)
- **Private Room Engine (`MessagesPage.tsx`):** Secure chat between verified seller and winning bidder.
- **Auction Chat Drawer (`AuctionChatDrawer.tsx`):** Embedded drawer accessible directly on the auction page once concluded.
- **Real-Time Subscriptions:** 0ms message streaming, real-time read receipts (`chatReadStatusUpdated`), emoji panel, and auto-scroll.

### 8. Notifications Module (`src/features/notifications/`)
- **Navbar Dropdown (`NotificationDropdown.tsx`):** Real-time badge counter, optimistic mark-as-read, and quick view.
- **Notifications Hub (`NotificationsPage.tsx`):** Segmented tab view (System, Wallet, Auctions, Disputes) with server filtering and localization.

### 9. Reviews & Reputation Module (`src/features/reviews/`)
- **Eligibility Banner (`ReviewEligibilityBanner.tsx`):** Automatic prompt displayed upon escrow release.
- **Review Submission Modal (`WriteReviewModal.tsx`):** 1-5 star multi-criteria evaluation (communication, item accuracy, shipping speed).
- **Seller Reply Modal (`ReplyReviewModal.tsx`):** Public response interface for reviewed sellers.

### 10. Users & Profiles Module (`src/features/users/`)
- **Profile Center (`ProfilePage.tsx`):** User personal details management, avatar upload, and security password update form.
- **Public Profile (`PublicUserPage.tsx`):** Reputation score, completed auctions counter, and verified user reviews stream.

### 11. Admin Control Center (`src/features/admin/`)
- **Executive Dashboard (`AdminDashboardPage.tsx`):** Live platform KPIs, treasury metrics, and real-time activity feeds.
- **User Moderation (`AdminUsersPage.tsx`):** User management table, manual balance adjustment modal, and instant ban/unban toggles.
- **Auction Moderation (`AdminAuctionsPage.tsx`):** Live auction oversight, cancellation modal with mandatory administrative reason broadcasting.
- **Dispute Adjudication (`AdminDisputesPage.tsx`):** Comprehensive dispute management table with resolve/refund actions.
- **Treasury & Withdrawals (`AdminFinancialsPage.tsx`):** Withdrawal request approval, rejection with notes, and bank transfer receipt upload.
- **Transaction Audit Ledger (`AdminTransactionsPage.tsx`):** Complete system-wide financial audit trail with unified date range filtering.

---

## 🎨 Design System & Aesthetics

Mazadak features a tailored, luxury enterprise design system optimized for clarity, legibility, and visual hierarchy:

### Core Color Palette
| Token | Hex Code | Purpose |
|:---|:---:|:---|
| **Primary Navy** | `#0F172A` | Backgrounds, typography, and dark mode containers |
| **Accent Gold** | `#F59E0B` | Action buttons, bidding triggers, and winning badges |
| **Success Emerald** | `#10B981` | Available balance, winning bids, and confirmed escrows |
| **Danger Red** | `#EF4444` | Outbid alerts, urgent timer warnings (<1m), and dispute flags |
| **Pending Slate** | `#64748B` | Held balances, pending auctions, and neutral indicators |
| **Surface White** | `#F8FAFC` | Cloud white page backgrounds and card surfaces |

### Bilingual & RTL/LTR Typography
- **Arabic Typography:** Tailored font stacks with native RTL layout flow and localized digit formatting (`toLocalizedDigits`).
- **English Typography:** Modern sans-serif hierarchy with automated LTR alignment.
- **Responsive Layouts:** Mobile-first layout with smooth transitions, touch-friendly interactive targets, and zero horizontal scroll leaks.

---

## 🛡️ Security & Performance Hardening

### Enterprise Security Safeguards
1. **Zero XSS Vectors:** 100% free of `dangerouslySetInnerHTML`. All dynamic content relies on React's automatic string escaping.
2. **CSRF Immunity:** Pure GraphQL POST payloads with `Content-Type: application/json` and `Authorization: Bearer <token>` headers.
3. **Strict Session Isolation:** Complete separation between persistent `localStorage` and temporary `sessionStorage`, strictly respecting the user's "Remember Me" preference.
4. **Complete Logout Cache Wipe:** Dispatches `queryClient.clear()` and `cancelQueries()` upon logout to prevent cross-user memory leakage on shared devices.
5. **Direct Signed Cloudinary Uploads:** Client-side GPU canvas compression produces lightweight images (~50KB) uploaded directly to Cloudinary via temporary HMAC SHA-1 signatures, preventing server overload.

### Performance Optimizations
1. **Route-Level Code Splitting:** All 33+ pages use `React.lazy()` dynamic imports, achieving fast Initial Server Render (FCP < 1.2s).
2. **Conditional WebSocket Teardown:** Live bid subscriptions open strictly when `effectiveStatus === 'ACTIVE'` and automatically unsubscribe when auctions conclude.
3. **Stable Reference Guards:** Custom hooks use `useRef` callbacks to prevent stale closures and unwanted re-subscriptions during high-frequency WebSocket streams.
4. **Strict TypeScript Mode:** Verified with 0 `any` types across all 390+ files, eliminating runtime type casting errors.

---

## 📂 Project Structure

```
mazadak-frontend/
├── .agents/                          # System rules, backend contract & schema snapshots
│   ├── AGENTS.md                     # Core rules of engagement & stack definitions
│   ├── BACKEND_CONTRACT.md           # Authoritative backend GraphQL/REST contract
│   └── schema.gql                    # Snapshot of backend GraphQL schema
├── public/                           # Static assets, SVG fallbacks, and icons
├── src/
│   ├── assets/                       # Image assets and localized placeholders
│   ├── components/                   # Shared presentation components
│   │   ├── common/                   # Reusable UI primitives (Button, Modal, DatePicker...)
│   │   ├── feedback/                 # Toast alert system, loaders, empty states
│   │   └── layout/                   # Navbar, Footer, Mobile Drawer, AppShell
│   ├── config/                       # Environment config (env.config.ts)
│   ├── constants/                    # Centralized routes and query keys
│   ├── context/                      # Global state providers (Auth, Socket, Theme)
│   ├── features/                     # Domain modules (Feature-Based Architecture)
│   │   ├── admin/                    # Admin Dashboard, Users, Auctions, Disputes, Financials
│   │   ├── auctions/                 # Browse, Detail, 3-Step Wizard, Edit, My Auctions
│   │   ├── auth/                     # Login, Register, Google OAuth, Reset, Verify
│   │   ├── bids/                     # Live Bidding Drawer, Proxy Auto-Bid, My Bids
│   │   ├── chat/                     # Post-Auction Live Chat, Drawer, Inbox
│   │   ├── escrow/                   # Escrow Details, Inspection Countdown, Disputes
│   │   ├── notifications/            # In-App Center, Real-Time Dropdown
│   │   ├── reviews/                  # Multi-Criteria Rating, Eligibility Banner, Reply
│   │   ├── users/                    # Profile Management, Public Profile
│   │   └── wallet/                   # Balances, Deposit, 3-Step Withdrawal, Ledger
│   ├── hooks/                        # Global custom hooks (useAuth, useSocket, useCountdown)
│   ├── locales/                      # Bilingual translation dictionaries (ar / en)
│   ├── pages/                        # Root error and fallback pages (NotFound, Unauthorized, Banned)
│   ├── routes/                       # AppRoutes, ProtectedRoute, AdminRoute, GuestRoute
│   ├── services/                     # Network clients (apiClient, graphqlClient, socketClient)
│   ├── types/                        # Core shared TypeScript type definitions
│   └── utils/                        # Error normalization, storage utils, formatters, cn
├── eslint.config.js                  # Modern ESLint Flat Configuration
├── package.json                      # Dependencies and scripts
├── tailwind.config.js                # Design system tokens and plugins
├── tsconfig.json                     # Strict TypeScript configuration
└── vite.config.ts                    # Vite build settings and dev proxy
```

---

## 🏆 The 4 Mandatory QA Checks

Every contribution and release candidate must pass the **4 Golden QA Checks** with zero errors:

```bash
# 1. ESLint Check (0 errors, 0 warnings)
npm run lint

# 2. TypeScript Strict Check (0 errors)
npx tsc -b

# 3. Production Build Validation
npm run build

# 4. Runtime Console Inspection
# Launch browser DevTools (F12) -> Console must be completely free of red errors
```

---

## 📄 License & Attribution

Architected and developed with pride for the **Mazadak Platform**.  
Copyright © 2026 Mazadak. All rights reserved.
