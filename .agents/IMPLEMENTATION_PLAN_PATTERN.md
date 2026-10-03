# دليل إعداد خطط التنفيذ والأنماط المعمارية — مشروع مزادك Frontend
## (Mazadak Frontend — Implementation Plan Blueprint & Architecture Guide)

> **الهدف:** هذا الملف هو المرجع المعماري والقاعدي في مجلد `.agents/`.
> يُقرأ **أولاً** قبل كتابة أي Implementation Plan وقبل تنفيذ أي Feature أو Module جديد.
> يضمن الحفاظ على أعلى معايير الـ Best Practices وتوحيد الـ Pattern عبر كافة أجزاء المشروع.

---

## جدول المحتويات
1. [خريطة تقدم المشروع](#1-خريطة-تقدم-المشروع)
2. [البنية التقنية الثابتة للمشروع](#2-البنية-التقنية-الثابتة-للمشروع)
3. [المبادئ المعمارية غير القابلة للتفاوض](#3-المبادئ-المعمارية-غير-القابلة-للتفاوض)
4. [دورة حياة تنفيذ الـ Feature](#4-دورة-حياة-تنفيذ-الـ-feature)
5. [هيكل مجلد الـ Feature الموحد](#5-هيكل-مجلد-الـ-feature-الموحد)
6. [قالب Implementation Plan المعتمد — مفصل](#6-قالب-implementation-plan-المعتمد)
7. [قواعد الترجمة وثنائية اللغة](#7-قواعد-الترجمة-وثنائية-اللغة)
8. [أنماط الـ State Management و TanStack Query v5](#8-أنماط-الـ-state-management)
9. [قواعد الـ WebSocket Subscriptions](#9-قواعد-الـ-websocket-subscriptions)
10. [قواعد الأمان والأرقام المالية](#10-قواعد-الأمان-والأرقام-المالية)
11. [الـ Shared Components — قاعدة المكونات المشتركة](#11-الـ-shared-components)
12. [فحص الجودة الإلزامي — The 4-Gate](#12-فحص-الجودة-الإلزامي)
13. [قواعد الـ Git والـ Branch](#13-قواعد-الـ-git-والـ-branch)

---

## 1. خريطة تقدم المشروع

| الأولوية | الموديول | الـ Branch | الحالة |
|:---:|:---|:---|:---:|
| 1 | Foundation (Setup + AppShell + Routing + Theme + i18n) | `feature/foundation-setup` | **مكتمل 100% ومدمج في main** |
| 2 | Auth Module (Login, Register, Google Auth, Verify, Reset, Reactivate) | `feature/auth-module` | **مكتمل 100% ومدمج في main** |
| 3 | Auctions Module (Browse, Detail, Create Wizard, Edit, My Auctions, WebSocket) | `feature/auctions-module` | **مكتمل 100% ومدمج في main** |
| 4 | Bids Module (Live Bidding Box, Auto-bid Modal, My Bids) | `feature/bids-module` | **مكتمل 100% ومدمج في main** |
| 5 | Wallet Module (Balance, Deposit REST, Withdraw, Withdrawals, Transactions) | `feature/wallet-module` | **مكتمل 100% ومدمج في main** |
| 6 | Escrow Module (My Escrows, Escrow Detail, Open Dispute, Dispute Detail) | `feature/escrow-module` | **مكتمل 100% ومدمج في main** |
| 7 | Chat Module (Auction Chat Drawer, Direct Messages) | `feature/chat-module` | **مكتمل 100% ومدمج في main** |
| 8 | Notifications Module (Dropdown + Center) | `feature/notifications-module` | **مكتمل 100% ومدمج في main** |
| 9 | Reviews Module (Write Review, Reply) | `feature/reviews-module` | **مكتمل جزئياً (Batch 1 مُنجزة ومُجمدة مؤقتاً لصالح Users)** |
| 10 | Users Module (Profile Settings, Public User Page) | `feature/users-module` | **المرحلة الحالية — جاهز للتنفيذ (10/10 Gold Standard)** |
| 11 | Admin Module (Dashboard, Users, Auctions, Disputes, Financials) | `feature/admin-module` | قيد الانتظار |

---

## 2. البنية التقنية الثابتة للمشروع

```
Framework:      React 18 + Vite 5
Language:       TypeScript strict mode — no "any" إطلاقاً
Styling:        Tailwind CSS + CSS Variables
Routing:        React Router v6 + React.lazy + Suspense
Server State:   TanStack Query (React Query) v5
HTTP Client:    Axios (apiClient للـ GraphQL / restClient للـ REST)
WebSockets:     graphql-ws عبر socketClient.ts (singleton)
Forms:          React Hook Form + Zod
Icons:          Lucide React
i18n:           react-i18next — namespace لكل موديول
```

### نقاط الدخول الثابتة:
```
GraphQL API:    POST http://localhost:3000/graphql
REST (Payment): POST http://localhost:3000/payments/initialize
WebSocket:      ws://localhost:3000/graphql
```

### الـ Clients الجاهزة في `src/services/api/apiClient.ts`:
- `apiClient` — للـ GraphQL (baseURL: env.apiUrl) — مع Auto Token Refresh
- `restClient` — للـ REST (baseURL: env.restUrl) — مع Auto Token Refresh
- استخدام `executeGraphQL` من `graphqlClient.ts` لكل الـ GraphQL calls

### الـ WebSocket Client في `src/services/websocket/socketClient.ts`:
- `getSocketClient(token?)` — Singleton، يُعاد إنشاؤه فقط عند تغيير الـ Token
- `subscribeToSubscription(payload, handlers, token?)` — للـ Subscriptions مع auto cleanup

---

## 3. المبادئ المعمارية غير القابلة للتفاوض

### 3.1 القاعدة الذهبية لفصل المسؤوليات

```
Component (.tsx)
  ← يرسم الـ UI فقط
  ← لا يعرف Axios أو GraphQL أو أي Endpoint
  ← يستقبل البيانات والـ Callbacks من الـ Hook فقط

Custom Hook (.ts)
  ← يدير منطق الـ Feature وحالات Loading/Error/Success
  ← يستدعي دوال الـ Service
  ← يتعامل مع TanStack Query (Queries & Mutations)
  ← يُرجع فقط ما يحتاجه الـ Component

Service (.service.ts)
  ← يحتوي على استعلامات الـ GraphQL (Queries/Mutations/Subscriptions)
  ← يتحدث مع الباك إند عبر executeGraphQL أو restClient
  ← مسؤول عن Data Normalization وتمرير الـ Errors
```

### 3.2 صرامة TypeScript
- **ممنوع منعاً باتاً `any`** في أي سطر كود جديد
- استخدام `unknown` مع Type Guards أو Zod Parsers عند الحاجة
- مطابقة كل Types والـ Enums بدقة مع `schema.gql`

### 3.3 الإلزامية الثنائية للغات
- **ممنوع Hardcoded Strings** في أي Component (عربي أو إنجليزي)
- كل نص عبر `useTranslation('[module]')` أو `useTranslation('common')`
- كل Feature: ملفين بالتوازي `src/locales/ar/[module].json` + `src/locales/en/[module].json`

### 3.4 الأرقام والتنسيق
- الحقول المالية تأتي كـ `String!` من الباك إند — استخدم `Number(value)` أو `parseFloat(value)` قبل أي عمليات
- **ممنوع** استدعاء `value.toFixed()` مباشرةً على قيمة String
- الأرقام في الـ UI: `toLocalizedDigits(value, isRTL)` من `src/utils/formatters.ts`
- تطبيع الأرقام العربية في المدخلات: `normalizeArabicDigits(value)` من `formatters.ts`
- في Zod: استخدم `z.preprocess((val) => normalizeArabicDigits(val), z.coerce.number())`
- التواريخ من الـ API: `formatDateTime(date, isRTL)` أو `formatRelativeTime(date, isRTL)`
- تواريخ الفلاتر إلى ISO: `.toISOString()` مع ضبط بداية/نهاية اليوم

### 3.5 معالجة الأخطاء الموحدة
```ts
import { parseAppError, getLocalizedErrorMessage } from '@/utils/errorHandler';

// في الـ Hook:
onError: (error) => {
  const { code } = parseAppError(error);
  const message = getLocalizedErrorMessage(code, t);
  toast.error(message);
}
```
**ممنوع** hardcoded error strings في أي Hook أو Component.

---

## 4. دورة حياة تنفيذ الـ Feature

```
1. قراءة BACKEND_CONTRACT.md + schema.gql
       ↓
2. كتابة Implementation Plan مفصلة (بالقالب أدناه)
       ↓
3. موافقة المطور الصريحة على الخطة
       ↓
4. التنفيذ بالترتيب الإلزامي للطبقات:
   Types → Schemas → Service → Hooks → Components → Pages → i18n → Routing
       ↓
5. فحص البوابات الأربع (4-Gate Quality Check)
       ↓
6. انتظار OK المطور → git commit
```

### الترتيب الإلزامي للطبقات داخل كل Batch:
1. **Types & Enums** (`types/[module].types.ts`)
2. **Zod Schemas** (`schemas/[feature].schema.ts`)
3. **API Service** (`services/[module].service.ts`)
4. **Custom Hooks** (`hooks/use[Feature].ts`)
5. **Sub-components** (`components/[Component].tsx`)
6. **Pages** (`pages/[PageName]Page.tsx`)
7. **Translations** (`locales/ar/[module].json` + `locales/en/[module].json`)
8. **Routing & Exports** في Batch الأخيرة فقط

---

## 5. هيكل مجلد الـ Feature الموحد

```
src/features/[module-name]/
├── components/          # مكونات الـ UI الخاصة بالموديول فقط
│   └── [ComponentName].tsx
├── hooks/               # Custom Hooks (State & React Query logic)
│   └── use[FeatureName].ts
├── pages/               # صفحات كاملة تُربط في الـ Router
│   └── [FeatureName]Page.tsx
├── schemas/             # Zod Schemas للتحقق من صحة المدخلات
│   └── [feature].schema.ts
├── services/            # استعلامات الـ GraphQL والاتصال بالـ API
│   └── [module].service.ts
├── types/               # تعريفات الـ TypeScript والـ Enums
│   └── [module].types.ts
└── index.ts             # Barrel Export لكل ما يُصدر من الموديول
```

---

## 6. قالب Implementation Plan المعتمد

كل Implementation Plan يجب أن تكون **شريحة رأسية كاملة (Vertical Slice)** لكل Batch.

---

### [بداية القالب]

```markdown
# Implementation Plan — [اسم الموديول] [التقييم/10]

**Branch:** `feature/[module-name]`
**المراجع التقنية:** قسم [X] في `.agents/BACKEND_CONTRACT.md` + `.agents/schema.gql`
**الـ Namespace للترجمة:** `[module]`

---

## قواعد العمل الصارمة

- [ ] إنشاء الـ Branch أولاً: `git checkout main && git pull && git checkout -b feature/[module]`
- [ ] الشرائح الرأسية المنفصلة: كل Batch = صفحة كاملة بكافة ملفاتها. لا Batch أفقية.
- [ ] فحص الجودة بعد كل Batch: `lint` + `tsc --noEmit` + `build` → 0 errors.
- [ ] انتظار OK صريح قبل `git commit`.
- [ ] لا Git Push تلقائي — بأمر صريح فقط.

---

## الحلول المعمارية والقرارات التصميمية

### القرار 1: [عنوان القرار]
**المشكلة:** [وصف المشكلة]
**الحل:** [الحل المعتمد مع كود توضيحي]

### القرار 2: الـ Subscriptions — هل يوجد subscription مناسب؟
**المشكلة:** [وصف ما تحتاجه]
**الحل المعتمد إذا لا يوجد subscription:**
- استخدام `invalidateQueries` بعد كل Mutation.
- الاعتماد على `notificationAdded` الموجود في `SocketContext.tsx`.
- لا تفتح Subscription جديد من هذا الموديول.

**إذا تحتاج subscription جديد غير موجود في schema.gql:**
> ملاحظة للمطور: نحتاج `subscription { [subscriptionName](id: ID!) { ... } }` في الباك إند. Prompt: "[اكتب الـ Prompt للمطور]"

### القرار 3: الـ Shared Components — ما الذي يُشارك؟
| المكون | الموقع | السبب |
|:---|:---|:---|
| [Component] | `features/[module]/components/` | يُستخدم داخل الموديول فقط |
| [Component] | `src/components/common/` | يُستخدم في موديولات أخرى |

### القرار 4: الـ Routes — هل موجودة؟
**تحقق دائماً من `src/constants/routes.constants.ts` قبل إضافة routes جديدة.**

### القرار 5: الـ Query Keys — هل موجودة؟
**تحقق دائماً من `src/constants/queryKeys.constants.ts` قبل إضافة keys جديدة.**

---

## GraphQL Contracts الكاملة

| النوع | الاستعلام | المتغيرات | الاستخدام |
|:---|:---|:---|:---|
| Query | `[queryName](input: InputType!)` | `[vars]` | [صفحة/مكون] |
| Mutation | `[mutationName](input: InputType!)` | `[vars]` | [صفحة/مكون] |

---

## كودات الأخطاء المتوقعة

| كود الخطأ | ما يعرضه الفرونت |
|:---|:---|
| `ERROR_CODE` | "[رسالة للمستخدم]" |

---

## Scope Tracker

```
[ ] Batch 1: [اسم الصفحة] ([المسار])
[ ] Batch 2: [اسم الصفحة] ([المسار])
[ ] Batch N: التكامل النهائي (Routing + Exports + Global QA)
```

---

## تفاصيل كل Batch (Vertical Slices)

### Batch 1: [اسم الصفحة] (`[المسار]`)

#### الهدف:
[وصف واضح لما تبنيه]

#### Checklist:

**[A] طبقة الـ Types — `src/features/[module]/types/[module].types.ts` [NEW/MODIFY]**
```ts
// مطابقة حرفية لـ schema.gql
export type [EnumName] = '...' | '...';
export interface [TypeName] { ... }
```

**[B] طبقة الـ Service — `src/features/[module]/services/[module].service.ts` [NEW/MODIFY]**
```graphql
# GraphQL Operations
query [QueryName]($input: InputType!) { ... }
mutation [MutationName]($input: InputType!) { ... }
```

**[C] طبقة الـ Hook — `src/features/[module]/hooks/use[Feature].ts` [NEW]**
- `useQuery(QUERY_KEYS.[MODULE].[KEY], ...)` أو `useMutation(...)`
- Derived values
- Cache invalidation strategy

**[D] المكونات — `src/features/[module]/components/` [NEW]**
- [ComponentName]: [وصف]

**[E] الصفحة — `src/features/[module]/pages/[Page]Page.tsx` [NEW]**
- Loading: Skeleton
- Error: ErrorMessage + Retry
- Empty: EmptyState
- Success: [عرض البيانات]

**[F] ملفات الترجمة [NEW/MODIFY]**
- `src/locales/ar/[module].json` — النصوص العربية
- `src/locales/en/[module].json` — النصوص الإنجليزية

- [ ] فحص الجودة: `lint` + `tsc --noEmit` + `build` → 0 errors
- [ ] انتظار OK المطور → `git commit`

---

### Batch [N]: التكامل النهائي

#### Checklist:

**Barrel Export — `src/features/[module]/index.ts` [NEW]**

**i18n namespace — `src/config/i18n.config.ts` [MODIFY]**
- إضافة `'[module]'` للـ namespaces

**Routing — `src/routes/AppRoutes.tsx` [MODIFY]**
```tsx
// Lazy loading — نفس النمط الموجود
const LazyPage = lazy(() => import('@/features/[module]/pages/[Page]Page'));
// تحت ProtectedRoute أو AdminRoute حسب الحاجة
<Route path="[path]" element={<LazyPage />} />
```

**Security Checklist:**
- [ ] لا `any` في TypeScript
- [ ] لا Hardcoded Strings
- [ ] الأرقام المالية عبر `Number()` أو `parseFloat()`
- [ ] WebSocket Cleanup في كل useEffect
- [ ] setInterval Cleanup في كل useEffect

**الفحص الشامل النهائي (4-Gate + UI):**
- [ ] `npm run lint` → 0 errors, 0 warnings
- [ ] `npx tsc --noEmit` → 0 errors
- [ ] `npm run build` → Build successful
- [ ] Console: صفر أخطاء حمراء
- [ ] Network: كل calls ناجحة
- [ ] Dark Mode / Light Mode: سلس
- [ ] عربي RTL: نصوص يمين، أرقام عربية، أيقونات معكوسة
- [ ] إنجليزي LTR: نصوص يسار، أرقام إنجليزية
- [ ] Mobile Responsive

---

## هيكل الملفات الكاملة

```
src/features/[module]/
├── types/[module].types.ts          [NEW]
├── services/[module].service.ts     [NEW]
├── schemas/[feature].schema.ts      [NEW]
├── hooks/use[Feature].ts            [NEW × N]
├── components/[Component].tsx       [NEW × N]
├── pages/[Page]Page.tsx             [NEW × N]
└── index.ts                         [NEW]

src/locales/ar/[module].json         [NEW]
src/locales/en/[module].json         [NEW]

src/routes/AppRoutes.tsx             [MODIFY]
src/config/i18n.config.ts            [MODIFY]
src/constants/queryKeys.constants.ts [MODIFY — إذا احتجنا keys جديدة]
src/constants/routes.constants.ts    [MODIFY — إذا احتجنا routes جديدة]
src/components/common/[Banner].tsx   [NEW — إذا كان مكوناً مشتركاً خارج الموديول]
```
```

### [نهاية القالب]

---

## 7. قواعد الترجمة وثنائية اللغة

### هيكل مفاتيح الترجمة الموحد:
```json
{
  "pageTitle": "...",
  "sections": {
    "header": "...",
    "details": "..."
  },
  "form": {
    "labels": { ... },
    "placeholders": { ... },
    "buttons": { ... }
  },
  "validation": {
    "required": "...",
    "invalid": "..."
  },
  "errors": {
    "SPECIFIC_BACKEND_ERROR_CODE": "..."
  },
  "messages": {
    "success": "..."
  },
  "status": {
    "STATUS_NAME": "..."
  }
}
```

### التعامل مع الاتجاهات (RTL/LTR):
- استخدام Tailwind Logical Utilities: `start-`, `end-`, `ms-`, `me-`, `ps-`, `pe-`
- الأيقونات الاتجاهية: `isRTL ? <ArrowLeft /> : <ArrowRight />`
- الأرقام: `toLocalizedDigits(value, isRTL)` من `formatters.ts`
- مدخلات الأرقام: `normalizeArabicDigits(value)` لقبول الأرقام العربية والإنجليزية

---

## 8. أنماط الـ State Management

### Query Keys Factory Pattern:
```ts
// في queryKeys.constants.ts — استخدمها دائماً، لا تعرّف keys inline
export const QUERY_KEYS = {
  [MODULE]: {
    ALL: ['module'] as const,
    DETAIL: (id: string) => ['module', 'detail', id] as const,
    MY: ['module', 'my'] as const,
    // إلخ...
  }
}
```

**قبل إضافة Key جديد:** تحقق أولاً أنه غير موجود في `queryKeys.constants.ts`.

### Cache Invalidation بعد Mutations:
```ts
const mutation = useMutation({
  mutationFn: service.doSomething,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MODULE.ALL });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MODULE.MY });
    // invalidate المحفظة أيضاً إذا كانت العملية مالية:
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WALLET.MY_WALLET });
  },
  onError: (error) => {
    const { code } = parseAppError(error);
    toast.error(getLocalizedErrorMessage(code, t));
  }
});
```

### معالجة حالات الصفحات:
```tsx
// كل صفحة تعالج الحالات الأربع إلزامياً:
if (isLoading) return <Skeleton />;
if (error) return <ErrorMessage message={error.message} onRetry={refetch} />;
if (!data || data.items.length === 0) return <EmptyState />;
return <MainContent data={data} />;
```

---

## 9. قواعد الـ WebSocket Subscriptions

### قبل استخدام Subscription — تحقق من schema.gql:
```
Subscriptions المتاحة في المشروع:
- walletUpdated         → تحديثات المحفظة
- notificationAdded     → الإشعارات الفورية
- auctionCreated        → مزاد جديد
- auctionStatusChanged  → تغيير حالة مزاد
- bidAdded              → مزايدة جديدة
- myWithdrawalUpdated   → تحديث طلب سحب
- adminWithdrawalFeed   → (Admin) بث طلبات السحب
- messageSent           → رسالة شات جديدة
- messageUpdated        → تعديل رسالة شات
- chatReadStatusUpdated → تحديث حالة القراءة
```

**إذا لم يوجد Subscription مناسب:**
- لا تفتح Subscription جديداً — استخدم `invalidateQueries` + `notificationAdded`.
- أبلغ المطور: "نحتاج `subscription { [name](id: ID!) { ... } }` في الباك إند."
- اكتب الـ Prompt الجاهز للباك إند في الـ Implementation Plan.

### Cleanup إلزامي في كل Subscription:
```ts
// في الـ Hook أو المكون:
useEffect(() => {
  const unsubscribe = walletService.subscribeToWalletUpdated({
    next: (data) => {
      queryClient.setQueryData(QUERY_KEYS.WALLET.MY_WALLET, data.walletUpdated);
    },
  });
  return () => unsubscribe();  // MANDATORY — منع Memory Leak
}, []);

// في كل setInterval:
useEffect(() => {
  const interval = setInterval(callback, 1000);
  return () => clearInterval(interval);  // MANDATORY
}, [dependency]);
```

---

## 10. قواعد الأمان والأرقام المالية

### الأرقام المالية (Decimal as String):
```ts
// من الـ API: balance: String!, amount: String!, currentPrice: String!
// قبل أي عملية حسابية:
const balance = Number(wallet.balance);          // أو parseFloat()
const amount = parseFloat(transaction.amount);

// عرض في الـ UI:
const displayAmount = `${formatPrice(amount, isRTL)} ${t('common:currency.egp')}`;

// ممنوع:
wallet.balance.toFixed(2)  // ❌ TypeError: toFixed is not a function
```

### تحويل المبالغ للـ REST API:
```ts
// Paymob يقبل بالقروش (piasters):
const amountInPiasters = Math.round(amountInEgp * 100);
```

### أمان الـ Routes والصلاحيات:
```tsx
// في AppRoutes.tsx:
// ProtectedRoute — لأي مستخدم مسجل
<Route element={<ProtectedRoute />}>
  <Route path="/wallet" element={<WalletPage />} />
</Route>

// AdminRoute — للأدمن فقط
<Route element={<AdminRoute />}>
  <Route path="/admin" element={<AdminDashboard />} />
</Route>
```

### التحقق من الصلاحيات في الصفحات:
```ts
// في Hook أو Page:
const isBuyer = currentUser?._id === escrow?.buyerId;
const isSeller = currentUser?._id === escrow?.sellerId;
// إذا المستخدم ليس له صلاحية:
if (!isBuyer) navigate(ROUTES.UNAUTHORIZED);
```

---

## 11. الـ Shared Components

### قاعدة التوزيع:
| أين؟ | متى؟ |
|:---|:---|
| `features/[module]/components/` | يُستخدم داخل الموديول فقط |
| `src/components/common/` | يُستخدم في أكثر من موديول |
| `src/components/layout/` | مكونات هيكل الصفحة (Navbar, Footer, etc.) |
| `src/components/feedback/` | Toast, EmptyState, ErrorMessage, Spinner |

### Common Components الموجودة (لا تُعيد بناءها):
```
src/components/common/
├── Alert.tsx             ← تنبيهات ملونة
├── AutoResizeTextarea.tsx ← Textarea يكبر تلقائياً
├── BrandLogo.tsx
├── Button.tsx            ← الزر الأساسي بكل variants
├── Card.tsx
├── CustomSelect.tsx      ← Select مخصص
├── DatePicker.tsx        ← اختيار تاريخ متطور
├── ErrorBoundary.tsx
├── Input.tsx             ← Input بكل states
├── LanguageSwitcher.tsx
├── Modal.tsx             ← Modal قابل للتخصيص
├── Pagination.tsx
├── ScrollToTop.tsx
├── Spinner.tsx
└── ThemeToggle.tsx
```

---

## 12. فحص الجودة الإلزامي (The 4-Gate)

بعد إنهاء كل Batch وقبل طلب OK المطور:

```bash
# البوابة 1: التدقيق اللغوي والبرمجي
npm run lint
# الهدف: 0 errors, 0 warnings

# البوابة 2: فحص الأنواع الصارم
npx tsc --noEmit
# الهدف: لا output (= صفر أخطاء)

# البوابة 3: فحص بناء الـ Bundle
npm run build
# الهدف: "Build successful" بدون errors
```

**البوابة 4 — فحص المتصفح الحي (بعد الـ 3 أوامر):**
- [ ] Console → صفر أخطاء حمراء
- [ ] Network → كل الـ API calls ناجحة
- [ ] Dark Mode ↔ Light Mode → تبديل سلس
- [ ] عربي RTL → نصوص يمين، أرقام عربية، أيقونات معكوسة
- [ ] إنجليزي LTR → نصوص يسار، أرقام إنجليزية
- [ ] Mobile → تجاوب كامل

**إذا فشلت أي بوابة → توقف فوراً وأصلح قبل المتابعة.**

---

## 13. قواعد الـ Git والـ Branch

### إنشاء Branch جديد (أول خطوة في أي موديول):
```bash
git checkout main
git pull origin main
git checkout -b feature/[module-name]
```

### Commit Message Convention:
```
feat([module]): add [feature description]
feat(escrow): add my escrows page with status filtering
feat(escrow): add escrow detail page with inspection countdown
fix([module]): fix [issue description]
```

### دورة الـ Commit لكل Batch:
```
1. كتابة كود الـ Batch كاملاً
2. تشغيل الـ 4-Gate (lint + tsc + build)
3. إبلاغ المطور للفحص اليدوي
4. انتظار OK الصريح
5. git commit -m "feat([module]): add [batch description]"
6. الانتقال للـ Batch التالية
```

**لا Push تلقائي — فقط بأمر صريح من المطور.**

---

> **خلاصة للـ AI:** قبل بدء أي Implementation Plan جديدة، اقرأ هذا الملف كاملاً + ملف `BACKEND_CONTRACT.md` للقسم المطلوب + `schema.gql`. ثم اتبع القالب بدقة وأجب على القرارات المعمارية العشرة قبل كتابة أي Batch.
