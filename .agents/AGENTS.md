# قواعد العمل — مشروع مزادك Frontend
## (Mazadak Frontend — Rules of Engagement)

> هذا الملف يُقرأ قبل بدء أي Feature أو Module جديد.
> يحتوي على القواعد الكاملة المتفق عليها بين المطور والـ AI.

---

## 1. الـ Tech Stack المحدد — لا تغيير فيه

`
Framework:      React 18 + Vite 5
Language:       TypeScript (strict mode — no "any" إطلاقاً)
Styling:        Tailwind CSS + CSS Modules / Variables
Routing:        React Router v6
Server State:   TanStack Query (React Query) v5
HTTP Client:    Axios
WebSockets:     GraphQL Subscriptions عبر WebSocket
Forms:          React Hook Form + Zod
Icons:          Lucide React
`

**الباك إند:** NestJS + GraphQL + REST (للـ Payment فقط)

**مراجع الـ Backend المتاحة في المشروع:**
- 📜 ملف الـ GraphQL Schema الكامل: .agents/schema.gql
- 📑 مرجع العقود والأخطاء والـ REST: .agents/BACKEND_CONTRACT.md

**نقاط الدخول (Entry Points):**
- POST http://localhost:3000/graphql → كل الـ Mutations & Queries
- POST http://localhost:3000/payments/initialize → REST — بدء عملية الإيداع (يحتاج Auth)
- POST http://localhost:3000/payments/webhooks/stripe → REST — Webhook من Stripe (Public)
- POST http://localhost:3000/payments/webhooks/paymob → REST — Webhook من Paymob (Public)
- WS http://localhost:3000/graphql → WebSocket للـ Subscriptions الحية

---

## 2. قاعدة مراجعة الـ Backend Contract & Schema — قبل كل Feature

`
✅ قبل بناء أي Feature — اقرأ القسم المقابل لها في ملف .agents/BACKEND_CONTRACT.md وراجع .agents/schema.gql
✅ تأكد من: الـ Input المطلوب، الـ Response المتوقع، وكل كودات الأخطاء والـ Types
❌ ممنوع تبني Feature وتكتشف لاحقاً إن الـ API أو الـ Types مختلفة عما توقعته
`

---

## 3. قاعدة Module by Module — قاعدة صارمة لا استثناء فيها

`
✅ نخلص الموديول الحالي بالكامل قبل ما ننتقل للموديول اللي بعده
❌ ممنوع نبدأ في موديولين مع بعض في نفس الوقت
❌ ممنوع نبدأ Feature جديدة قبل ما نخلص الـ Feature اللي إحنا فيها
`

### ترتيب الـ Modules (بالتسلسل الإلزامي):

| الأولوية | الموديول | الـ Branch | السبب | قسم الـ Backend Contract |
|:---:|:---|:---|:---|:---|
| 1️⃣ | **Foundation** (Setup + Layout + Routes + Tailwind) | eature/foundation-setup | الأساس — كل حاجة بتبنى عليه | — |
| 2️⃣ | **Auth Module** (Login, Register, Verify, Reset) | eature/auth-module | كل الـ Modules التانية تعتمد عليه | القسم 1 |
| 3️⃣ | **Auctions Module** (Browse, Details, Create, My Auctions) | eature/auctions-module | اللب الأساسي للمنصة | القسم 3 |
| 4️⃣ | **Bids Module** (Live Bidding, Auto-bid, My Bids) | eature/bids-module | يعتمد على صفحة المزاد | القسم 4 |
| 5️⃣ | **Wallet Module** (Balance, Deposit, Withdraw, Transactions) | eature/wallet-module | يعتمد على Bids (رصيد كافي؟) | القسم 5 + 6 (Payment REST) |
| 6️⃣ | **Escrow Module** (Details, Disputes, My Escrows) | eature/escrow-module | يعتمد على Auctions + Wallet | القسم 7 |
| 7️⃣ | **Chat Module** (Auction Chat, Inbox) | eature/chat-module | WebSocket Subscriptions | القسم 9 + 11.4 |
| 8️⃣ | **Notifications Module** (Dropdown + Center) | eature/notifications-module | يعتمد على WebSocket | القسم 8 + 11.1 |
| 9️⃣ | **Reviews Module** (Write Review, Reply) | eature/reviews-module | يعتمد على Escrow | القسم 10 |
| 🔟 | **Users Module** (Profile, Public User Page) | eature/users-module | يعتمد على Auth | القسم 2 |
| 1️⃣1️⃣ | **Admin Module** (Dashboard, Users, Auctions, Disputes) | eature/admin-module | آخر حاجة — Role-Based Access | القسم 12 |

---

## 4. قواعد الـ Git — إلزامية

### 3.1 إنشاء الـ Branch
`ash
# قبل بدء أي Module — إنشاء Branch باسم الموديول
git checkout -b feature/auth-module
git checkout -b feature/auctions-module
`

**قاعدة:** اسم الـ Branch = eature/ + اسم الموديول بالإنجليزي بـ kebab-case

### 3.2 الـ Commit بعد كل Feature
`ash
# بعد إنهاء كل Feature كاملة
git add .
git commit -m "feat(auth): add login page with form validation"
git commit -m "feat(auth): add register page with Zod schema"
git commit -m "feat(auctions): add auction list page with filters"
`

**قاعدة Commit Message:**
`
feat(module-name): وصف قصير ما تم عمله
`

### 3.3 الـ Push بعد كل Feature
`ash
# بعد كل Feature وبعد التأكد من الأخطاء الأربعة
git push origin feature/auth-module
`

**ممنوع:** Push بدون مراجعة الأخطاء الأربعة أولاً.

---

## 5. الأخطاء الأربعة — فحص إلزامي بعد كل Feature

بعد إنهاء **كل Feature** (مش كل ملف، كل Feature كاملة)، لازم التحقق من:

### ❶ ESLint Errors
`ash
npm run lint
# الهدف: 0 errors, 0 warnings
`

### ❷ TypeScript Errors
`ash
npx tsc --noEmit
# الهدف: لا يطلع أي output (يعني صفر أخطاء)
`

### ❸ Build / Compiler Errors
`ash
npm run build
# الهدف: تنتهي بـ "Build successful" بدون أي errors
`

### ❹ Runtime Errors
`
- افتح المتصفح
- افتح الـ Console (F12)
- تصفح الصفحات اللي اتعملت في الـ Feature دي
- الهدف: صفر errors حمرا في الـ Console
`

> **قاعدة صارمة:** لو في أي Error من الأربعة دول — نوقف، نصلح، ونتأكد مرة تانية قبل أي خطوة تانية.

### أخطاء إضافية خاصة بالـ Frontend:
- **❺ Network Errors:** تأكد إن كل الـ API calls بتنجح (Network tab في DevTools)
- **❻ React Warnings:** أي Warning في الـ Console محتاج يتحل — مش Optional
- **❼ Memory Leaks:** لو في useEffect بيفتح Socket أو Interval، لازم يكون فيه Cleanup function

---

## 6. قواعد الـ Architecture الثابتة — Pattern موحد لكل الـ Modules

### 5.1 هيكل كل Feature Folder (Pattern إلزامي)

`
features/[module-name]/
├── pages/              # صفحات كاملة (Page-level components)
│   └── [Name]Page.tsx  # مثال: LoginPage.tsx, AuctionListPage.tsx
├── components/         # مكونات خاصة بالموديول ده بس
│   └── [Name].tsx      # مثال: LoginForm.tsx, AuctionCard.tsx
├── hooks/              # Custom Hooks الخاصة بالموديول
│   └── use[Name].ts    # مثال: useLogin.ts, useAuctions.ts
├── services/           # دوال الـ API الخاصة بالموديول
│   └── [module].service.ts  # مثال: auth.service.ts
├── schemas/            # Zod Schemas للـ Validation
│   └── [name].schema.ts     # مثال: login.schema.ts
├── types/              # TypeScript Types خاصة بالموديول
│   └── [module].types.ts    # مثال: auth.types.ts
└── index.ts            # Barrel Export — تصدير كل حاجة من هنا
`

**القاعدة:** كل موديول = نفس الـ Structure. Auth, Auctions, Wallet — كلهم نفس الـ Pattern.

---

### 5.2 القاعدة الذهبية: "Component يرسم — Hook يفكر — Service يتكلم"

`
┌──────────────────────────────────────────────────────┐
│  Page / Component (.tsx)                             │
│  ┌────────────────────────────────────────────────┐  │
│  │  Custom Hook (use[Feature].ts)                │  │
│  │  ← يستدعي Service                            │  │
│  │  ← يدير isLoading, error, data               │  │
│  │  ← يرجع ما يحتاجه الـ Component فقط        │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  الـ Component:                                       │
│  ← يرسم واجهة فقط                                   │
│  ← لا يعرف أي شيء عن Axios أو GraphQL              │
│  ← لا يحتوي على Business Logic                      │
└──────────────────────────────────────────────────────┘
`

**أمثلة على التطبيق الصح:**

`	sx
// ✅ الصح — LoginPage.tsx
const LoginPage = () => {
  const { login, isLoading, error } = useLogin(); // ← Hook بيعمل الشغل
  return <LoginForm onSubmit={login} isLoading={isLoading} error={error} />;
};

// ❌ الغلط — اتصال مباشر بالـ API في المكون
const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const handleLogin = async () => {
    setLoading(true);
    await axios.post('/graphql', { query: LOGIN_MUTATION }); // ❌
  };
};
`

---

### 5.3 قواعد الـ Shared Components (DRY — Don't Repeat Yourself)

**لو مكون اتستخدم في أكتر من موديول واحد → يتحط في components/common/**

`
components/
├── common/       # مكونات مشتركة عبر كل المشروع
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   ├── Spinner.tsx
│   ├── Badge.tsx
│   ├── Avatar.tsx
│   └── Dropdown.tsx
├── layout/       # هيكل الصفحة
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── PageContainer.tsx
└── feedback/     # حالات الـ UI
    ├── ToastAlert.tsx
    ├── EmptyState.tsx
    └── ErrorMessage.tsx
`

**لو مكون خاص بموديول واحد → يتحط جوا eatures/[module]/components/**

---

### 5.4 قواعد التسمية (Naming Conventions)

| النوع | الـ Convention | مثال |
|:---|:---|:---|
| **Pages** | PascalCase + Page suffix | LoginPage.tsx, AuctionListPage.tsx |
| **Components** | PascalCase | AuctionCard.tsx, BidButton.tsx |
| **Custom Hooks** | camelCase + use prefix | useLogin.ts, useAuctions.ts |
| **Services** | camelCase + .service suffix | uth.service.ts, uction.service.ts |
| **Types** | PascalCase + Type أو Interface | LoginFormData, AuctionType |
| **Zod Schemas** | camelCase + Schema suffix | loginSchema, egisterSchema |
| **Constants** | SCREAMING_SNAKE_CASE | ROUTES.LOGIN, QUERY_KEYS.AUCTIONS |

---

## 7. قواعد الـ State Management

### ما يدخل في الـ Context (Global State):
`	sx
// ✅ يدخل في Context
AuthContext   → بيانات المستخدم المسجل، الـ Token
SocketContext → اتصال الـ WebSocket المركزي
ThemeContext  → Dark/Light mode

// ❌ لا يدخل في Context
auctions      → ده شغل TanStack Query
notifications → ده شغل TanStack Query + Socket events
`

### ما يُدار بـ TanStack Query (Server State):
`	s
// كل البيانات الجاية من الـ Server
useQuery(['auctions'], auctionService.getAll)
useQuery(['auction', id], () => auctionService.getById(id))
useMutation(auctionService.create)
`

### ما يُدار بـ useState (Local UI State):
`	s
// حالات الـ UI فقط — مش بيانات سيرفر
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedTab, setSelectedTab] = useState('details');
`

---

## 8. قواعد الـ Error Handling

### في الـ Services:
`	s
// كل service دالة لازم تـ throw الـ error بشكل واضح
export const login = async (data: LoginFormData) => {
  const response = await apiClient.post('/graphql', {
    query: LOGIN_MUTATION,
    variables: data,
  });
  if (response.data.errors) throw new Error(response.data.errors[0].message);
  return response.data.data.login;
};
`

### في الـ Pages:
`	sx
// كل صفحة لازم تتعامل مع حالات Loading و Error
if (isLoading) return <Spinner />;
if (error) return <ErrorMessage message={error.message} />;
if (!data) return <EmptyState />;
return <MainContent data={data} />;
`

---

## 9. قواعد الـ WebSocket Subscriptions

`	sx
// ✅ الـ Cleanup إلزامي في أي useEffect يفتح Socket listener
useEffect(() => {
  socket.on('bid:placed', handleNewBid);
  socket.on('auction:status_changed', handleStatusChange);

  return () => {
    socket.off('bid:placed', handleNewBid);       // ← إلزامي
    socket.off('auction:status_changed', handleStatusChange); // ← إلزامي
  };
}, [auctionId]);
`

**بدون الـ Cleanup = Memory Leak = تطبيق بيتبطأ مع الوقت.**

---

## 10. الـ Design System — الألوان والـ Tailwind Config

`css
/* src/index.css — التعريف المركزي للألوان */
:root {
  --color-primary:       #0F172A;   /* Navy — Backgrounds & primary text */
  --color-primary-light: #1E293B;
  --color-accent:        #F59E0B;   /* Gold — Bidding buttons & badges */
  --color-accent-dark:   #D97706;
  --color-danger:        #EF4444;   /* Red — Outbid & urgent timer (<1 min) */
  --color-success:       #10B981;   /* Emerald — Winning & available balance */
  --color-pending:       #78716C;   /* Warm Gray — Pending & hold states */
  --color-bg:            #F8FAFC;   /* Cloud White — Page background */
  --color-bg-card:       #FFFFFF;
}

[data-theme="dark"] {
  --color-primary:       #F8FAFC;
  --color-bg:            #0F172A;
  --color-bg-card:       #1E293B;
}
`

---

## 11. الـ Feature Checklist — قبل الـ Commit

قبل ما تعمل Commit لأي Feature، تأكد من:

`
□ 1. ESLint: npm run lint → 0 errors
□ 2. TypeScript: npx tsc --noEmit → 0 errors
□ 3. Build: npm run build → successful
□ 4. Runtime: الـ Console في المتصفح → 0 red errors
□ 5. Network: كل الـ API calls بتنجح في Network tab
□ 6. React Warnings: 0 warnings في الـ Console
□ 7. WebSocket Cleanup: أي socket.on عنده socket.off مقابله
□ 8. لا يوجد "any" في الـ TypeScript الجديد
□ 9. لا يوجد Hardcoded strings للـ Routes (استخدم ROUTES constants)
□ 10. الـ Pattern موحد مع باقي الـ Features (نفس البنية)
`

---

## 12. الصفحات الكاملة للمشروع (33+ شاشة)

### Module 1: Foundation
- AppShell (Navbar, Footer, PageContainer)
- ProtectedRoute component
- AdminRoute component
- NotFoundPage (404)
- UnauthorizedPage (403)

### Module 2: Auth
- /login — LoginPage
- /register — RegisterPage
- /verify-email?token=... — VerifyEmailPage
- /verify-notice — VerifyNoticePage
- /forgot-password — ForgotPasswordPage
- /reset-password?token=... — ResetPasswordPage
- /reactivate — ReactivatePage

### Module 3: Auctions
- / — HomePage
- /auctions — AuctionListPage
- /auctions/:id — AuctionDetailPage (يحتوي على LiveBiddingBox + ChatDrawer)
- /auctions/create — CreateAuctionPage (Wizard 3 خطوات)
- /auctions/:id/edit — EditAuctionPage
- /my-auctions — MyAuctionsPage

### Module 4: Bids
- /my-bids — MyBidsPage
- AutoBidModal — نافذة منبثقة
- LiveBiddingBox — مكون مدمج في صفحة المزاد

### Module 5: Wallet
- /wallet — WalletPage
- /wallet/deposit — DepositPage
- /wallet/withdraw — WithdrawPage
- /wallet/transactions — TransactionsPage

### Module 6: Escrow
- /my-escrows — MyEscrowsPage
- /escrow/:id — EscrowDetailPage
- /escrow/:id/dispute — OpenDisputePage
- /disputes/:id — DisputeDetailPage

### Module 7: Chat
- /messages — MessagesPage
- AuctionChatDrawer — مكون مدمج في صفحة المزاد

### Module 8: Notifications
- /notifications — NotificationsPage
- NotificationDropdown — مكون في الـ Navbar

### Module 9: Reviews
- WriteReviewModal — نافذة منبثقة
- ReplyReviewModal — نافذة منبثقة

### Module 10: Users
- /profile — ProfilePage
- /users/:id — PublicUserPage

### Module 11: Admin
- /admin — AdminDashboardPage
- /admin/users — AdminUsersPage
- /admin/auctions — AdminAuctionsPage
- /admin/disputes — AdminDisputesPage
- /admin/transactions — AdminTransactionsPage