# Mazadak Frontend (منصة مزادك) ⚡🏛️

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 18](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite 5](https://img.shields.io/badge/Vite_5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query_v5-FF4154?style=for-the-badge&logo=react-query&logoColor=white)](https://tanstack.com/query/latest)
[![GraphQL](https://img.shields.io/badge/GraphQL-E10098?style=for-the-badge&logo=graphql&logoColor=white)](https://graphql.org/)

The premier, enterprise-grade web client for **Mazadak (مزادك)** — a high-frequency, real-time live auction marketplace featuring digital wallet escrows, automated proxy bidding, WebSocket live events, bilingual localization (Arabic/English), and responsive dark/light aesthetics.

---

## 🏛️ Architectural Blueprint & Philosophy

The Mazadak frontend is architected using **Feature-Driven Clean Architecture** and strictly adheres to the core engineering principles documented in [`.agents/AGENTS.md`](.agents/AGENTS.md):

### 1. The Golden Separation of Concerns
```
┌────────────────────────────────────────────────────────┐
│  Page / Component (.tsx)                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Custom Hook (use[Feature].ts)                   │  │
│  │  ← Coordinates UI state & TanStack Query         │  │
│  │  ← Consumes dedicated Service APIs               │  │
│  │  ← Returns strictly what the view needs          │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  Component: Renders the UI only (Zero Axios/GraphQL)   │
│  Hook: Thinks & manages business logic                 │
│  Service: Communicates with GraphQL & REST APIs        │
└────────────────────────────────────────────────────────┘
```

### 2. Strict Module-by-Module Progression
Features are built sequentially with strict module boundaries. Cross-module contamination is prohibited; shared logic resides in `src/components/common/` or `src/utils/`, while domain-specific logic stays strictly encapsulated within its feature directory.

---

## 🛠️ Technology Stack

| Layer | Technology | Rationale & Specifications |
|:---|:---|:---|
| **Core Framework** | **React 18 + Vite 5** | Lightning-fast HMR, concurrent rendering, production bundle optimization. |
| **Language** | **TypeScript 5 (Strict Mode)** | 100% strict type safety — Zero `any` policy across the entire codebase. |
| **Styling & Design System** | **Tailwind CSS + CSS Variables** | Curated Navy (`#0F172A`) & Gold (`#F59E0B`) palette, dynamic Dark/Light modes. |
| **Server State & Caching** | **TanStack Query v5** | Intelligent caching (`staleTime`), query aliasing, automated background invalidation. |
| **Forms & Validation** | **React Hook Form + Zod** | High-performance uncontrolled inputs, strict schema validation, granular watchers. |
| **HTTP & GraphQL Client** | **Axios + Centralized Executor** | Centralized `executeGraphQL`, auto NestJS error unwrapping, single-flight refresh mutex. |
| **Real-time Subscriptions** | **GraphQL Subscriptions (WS)** | Live bidding ticks, dynamic countdowns, and auction status change listeners. |
| **Internationalization** | **i18next + react-i18next** | Full bilingual Arabic (RTL) and English (LTR) with instant locale switching. |
| **Icons** | **Lucide React** | Feather-light, consistent modern icon system. |

---

## 📂 Project Directory Structure

```
mazadak-frontend/
├── .agents/                          # Architectural contracts & AI rules
│   ├── AGENTS.md                     # Rules of engagement & module roadmap
│   ├── BACKEND_CONTRACT.md           # Full GraphQL & REST backend contract
│   └── schema.gql                    # Backend GraphQL schema snapshot
├── src/
│   ├── assets/                       # Static branding, images, and vectors
│   ├── components/
│   │   ├── common/                   # Global shared primitives (Button, Input, Card, Modal, Spinner...)
│   │   ├── layout/                   # Global shell (Navbar, Footer, AppLayout)
│   │   └── feedback/                 # UI notifications, alerts, and skeletons
│   ├── config/                       # Runtime environment configs (env.config.ts)
│   ├── constants/                    # Centralized route definitions & query keys
│   ├── context/                      # Global context providers (AuthContext, ThemeContext)
│   ├── features/                     # Feature modules (Domain-isolated)
│   │   ├── auth/                     # Login, Register, Google OAuth, Verification, Password Recovery
│   │   ├── auctions/                 # Browse, Detail, Create 3-Step Wizard, Edit, My Auctions
│   │   ├── users/                    # Public User Profiles & Seller Ratings
│   │   ├── bids/                     # Live Bidding Drawer & Auto-bid Modal (Upcoming)
│   │   ├── wallet/                   # Escrow Balances, Deposits, Withdrawals (Upcoming)
│   │   ├── escrow/                   # Protection & Dispute Resolution (Upcoming)
│   │   ├── chat/                     # Live Auction Chat (Upcoming)
│   │   ├── notifications/            # Real-time In-App Notification Center (Upcoming)
│   │   ├── reviews/                  # Multi-Criteria Seller Reviews (Upcoming)
│   │   └── admin/                    # Platform Moderation & Analytics (Upcoming)
│   ├── hooks/                        # Global custom utility hooks
│   ├── locales/                      # Bilingual translation dictionaries (ar / en)
│   ├── pages/                        # Root & system pages (HomePage, NotFound, Unauthorized)
│   ├── routes/                       # Route tree, guards (ProtectedRoute, GuestRoute)
│   ├── services/
│   │   └── api/                      # Centralized apiClient & graphqlClient
│   ├── types/                        # Core shared TypeScript contracts
│   └── utils/                        # Formatters, storage utils, error handling, cn
```

---

## 🚀 Key Architectural Highlights & Engineering Refactors

1. **Centralized GraphQL Engine (`src/services/api/graphqlClient.ts`):**
   - Single point of execution for all GraphQL queries and mutations.
   - Automatically parses NestJS `ValidationPipe` array errors, extracting clean human-readable messages.
2. **Bulletproof Authentication & Token Rotation (`src/utils/storage.utils.ts`):**
   - Safe `authStorage` with corruption recovery and event emission.
   - Single-Flight Refresh Promise mutex in `apiClient.ts` preventing simultaneous token refresh race conditions under parallel network requests.
3. **Resilient Global Error Boundary (`src/components/common/ErrorBoundary.tsx`):**
   - Intercepts uncaught runtime rendering errors, preventing the "White Screen of Death".
   - Full bilingual support (AR/EN) with action buttons for instant recovery and safe navigation.
4. **Polymorphic Design System (`src/components/common/Button.tsx`):**
   - Upgraded to support React Router `to` navigation natively.
   - Eliminates invalid HTML nesting (`<button>` inside `<a>`), ensuring 100% W3C and A11y compliance.
5. **High-Performance Image Upload Pipeline:**
   - Client-side parallel GPU canvas compression (~50KB lightweight payload in ~10ms).
   - Direct Cloudinary CDN signed uploads with timestamp integer normalization, eliminating Base64 leaks.
6. **Optimized Network Footprint & Zero-Lag Sync:**
   - Reduced `/my-auctions` network queries from 5 to 2 using GraphQL aliasing and 5-minute cache windows.
   - Instant local status synchronization (`localStatus`) in `AuctionCard.tsx` ensuring zero latency when countdown timers expire.

---

## 🚦 Roadmap & Module Progress

| Module | Status | Branch | Coverage |
|:---|:---:|:---|:---|
| **1️⃣ Foundation** | ✅ **100% Done** | `feature/foundation-setup` | Shell, Layout, Navbar, Footer, Routing, Theme |
| **2️⃣ Auth Module** | ✅ **100% Done** | `feature/auth-module` | Login, Register, Google OAuth, Verify, Reset, Reactivate |
| **3️⃣ Auctions Module** | ✅ **100% Done** | `feature/auctions-module` | Browse, Filter, Detail, Create Wizard, Edit, My Auctions |
| **4️⃣ Bids Module** | ⏳ **Next** | `feature/bids-module` | Live Bidding Panel, Auto-bid Proxy, Bid Streams |
| **5️⃣ Wallet Module** | ⏳ Queue | `feature/wallet-module` | Balances, Deposits (Stripe/Paymob), Withdrawals |
| **6️⃣ Escrow Module** | ⏳ Queue | `feature/escrow-module` | Buyer Escrow Lock, Dispute Center |
| **7️⃣ Chat Module** | ⏳ Queue | `feature/chat-module` | Live Auction Chat via WebSockets |
| **8️⃣ Notifications** | ⏳ Queue | `feature/notifications-module` | Dropdown & Notification Center |
| **9️⃣ Reviews Module** | ⏳ Queue | `feature/reviews-module` | Multi-Criteria Ratings & Seller Replies |
| **🔟 Users Module** | ⏳ Queue | `feature/users-module` | Public Profiles & User Management |
| **1️⃣1️⃣ Admin Module** | ⏳ Queue | `feature/admin-module` | Platform Dashboard & Dispute Resolution |

---

## 💻 Getting Started Locally

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm or yarn

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/adhamdr1/mazadak-frontend.git
   cd mazadak-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the project root:
   ```env
   VITE_API_URL=http://localhost:3000/graphql
   VITE_APP_NAME=Mazadak
   ```

4. **Launch Development Server:**
   ```bash
   npm run dev
   ```
   The application will be running at `http://localhost:5173`.

---

## 🛡️ The 4 Mandatory QA Checks (Zero-Defect Standard)

Before any commit or pull request, the project must pass all 4 checks with zero errors:

```bash
# 1. ESLint Check (0 errors, 0 warnings)
npm run lint

# 2. TypeScript Strict Check (0 errors)
npx tsc --noEmit

# 3. Production Build Validation
npm run build

# 4. Runtime Console Inspection
# Inspect browser console with F12 -> 0 red errors
```

---

## 📜 License & Ownership

Developed with pride for the **Mazadak Platform**. All rights reserved © 2026.