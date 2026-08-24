# Mazadak Frontend 🚀

The modern frontend application for **Mazadak** — a high-frequency, real-time live auction platform equipped with integrated digital wallets, escrow protection, and live bidding.

Built with **React 18**, **Vite 5**, **TypeScript**, **Tailwind CSS**, **TanStack Query v5**, and **GraphQL Subscriptions**.

---

## 🛠️ Tech Stack

- **Core:** React 18 + Vite 5
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS + CSS Custom Properties (Theme Tokens)
- **Routing:** React Router v6
- **Server State & Caching:** TanStack Query (React Query) v5
- **Forms & Validation:** React Hook Form + Zod
- **Networking:** Axios (GraphQL & REST)
- **Real-time Engine:** GraphQL Subscriptions via WebSockets
- **Icons:** Lucide React

---

## 📁 Architecture & Project Structure

The project follows a **Feature-Driven Clean Architecture**:

`
mazadak-frontend/
├── .agents/                       # AI Agent & Engineering Rules
│   ├── AGENTS.md                  # Strict rules of engagement, module sequence, checklists
│   ├── BACKEND_CONTRACT.md        # Complete Backend API specification, mutations, queries & error codes
│   └── schema.gql                 # GraphQL Schema definition from backend
├── docs/                          # Architecture & design reviews (local reference)
└── src/
    ├── assets/                    # Static assets (icons, images)
    ├── components/                # Shared reusable UI
    │   ├── common/                # (Button, Input, Modal, Spinner, Badge, Dropdown...)
    │   ├── layout/                # (Navbar, Footer, AppShell, PageContainer)
    │   └── feedback/              # (ToastAlert, EmptyState, ConfirmDialog)
    ├── config/                    # Environment & runtime configurations
    ├── constants/                 # Route paths, Query keys, API constants
    ├── context/                   # Global state (AuthContext, SocketContext, ThemeContext)
    ├── features/                  # Independent business modules:
    │   ├── auth/                  # Login, Register, Verify Email, Password Reset
    │   ├── users/                 # Profile, Account Settings, Public User Cards
    │   ├── auctions/              # Browse, Detail, Create Wizard, Seller Management
    │   ├── bids/                  # Live Bidding Panel, Auto-bid (Proxy), Bid History
    │   ├── wallet/                # Balance, Stripe/Paymob Deposit, Withdraw, Transactions
    │   ├── escrow/                # Buyer Protection, Delivery Confirmation, Disputes
    │   ├── chat/                  # Live Auction Chat & Direct Messaging
    │   ├── notifications/         # Real-time In-App Notification Center
    │   ├── reviews/               # 4-Criteria Reputation & Ratings System
    │   └── admin/                 # Admin Dashboard, Moderation & Arbitration
    ├── hooks/                     # Shared Custom Hooks (useCountdown, useDebounce...)
    ├── routes/                    # Route definitions & guards (ProtectedRoute, AdminRoute)
    ├── services/                  # API clients (Axios, GraphQL, WebSocket)
    ├── types/                     # Shared TypeScript interfaces & types
    └── utils/                     # Formatters, helpers, and utilities
`

---

## 🚦 Module Implementation Sequence

Development strictly follows the module-by-module plan defined in [.agents/AGENTS.md](.agents/AGENTS.md):

1. **Foundation:** eature/foundation-setup (Scaffolding, Layout, Routes, Tailwind setup)
2. **Auth:** eature/auth-module (Authentication & Verification flows)
3. **Auctions:** eature/auctions-module (Marketplace & Auction details)
4. **Bids:** eature/bids-module (Live bidding & Proxy auto-bid)
5. **Wallet:** eature/wallet-module (Wallet management & Payment gateways)
6. **Escrow:** eature/escrow-module (Escrow hold & Dispute resolution)
7. **Chat:** eature/chat-module (Real-time messaging)
8. **Notifications:** eature/notifications-module (In-app live alerts)
9. **Reviews:** eature/reviews-module (Reputation system)
10. **Users:** eature/users-module (Public profile & Settings)
11. **Admin:** eature/admin-module (Platform administration & Moderation)

---

## 🔒 Verification & Quality Assurance

Every feature must pass all 4 checks before committing:
- 
pm run lint → 0 errors, 0 warnings
- 
px tsc --noEmit → 0 TypeScript errors
- 
pm run build → Build successful
- Runtime check → 0 console errors & clean network requests