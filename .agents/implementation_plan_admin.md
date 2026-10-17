# Implementation Plan — Admin Module (Module 11) [10/10 Gold Standard — Production-Ready]

**Branch:** `feature/admin-module`  
**المراجع التقنية المعتمدة:**
- 📜 قسم 12 وقسم 13 في [.agents/BACKEND_CONTRACT.md](file:///d:/Projects/mazadak-frontend/.agents/BACKEND_CONTRACT.md) (إدارة النظام، السحوبات، الخزينة، والمزادات)
- 📑 ملف الـ Schema الرسمي [.agents/schema.gql](file:///d:/Projects/mazadak-frontend/.agents/schema.gql)
- 📐 دليل الأنماط المعمارية [.agents/IMPLEMENTATION_PLAN_PATTERN.md](file:///d:/Projects/mazadak-frontend/.agents/IMPLEMENTATION_PLAN_PATTERN.md)
**الـ Namespaces للترجمة:** `admin` + `common`  
**حالة الباك إند:** جاهز ومُعتمد بنسبة 100% (Production-Ready 10/10) — كافة الاستعلامات، الطفرات، الاشتراكات الحية، وحقول الإحصائيات والخزينة معرفة بالكامل في `schema.gql`.

---

## 1. قواعد العمل الصارمة (Rules of Engagement)

- [ ] **1. إنشاء الـ Branch أولاً (إلزامي قبل أي تعديل كود):**
  ```bash
  git checkout main
  git pull origin main
  git checkout -b feature/admin-module
  ```
- [ ] **2. الشرائح الرأسية المنفصلة (Vertical Slices):**
  - **Batch 1:** البنية الأساسية ومفاتيح الكاش، الترجمة، الـ Admin Layout ولوحة المؤشرات العامة (`admin.types.ts` + `queryKeys` + `i18n` + `admin.service.ts` Core + `useAdminDashboardStats` + `AdminLayout` + `AdminSidebar` + `AdminHeader` + `AdminDashboardPage` + `StatKpiCard` + `TreasuryKpiCard` + `RecentActivityFeed` + Routing).
  - **Batch 2:** شاشة إدارة المستخدمين والتسويات المالية (`admin.service` extend + `useAdminUsers` + `useAdminUserDetails` + `useAdminToggleBan` + `useAdminAdjustBalance` + `AdminUsersPage` + `AdminUsersTable` + `UserDetailsDrawer` + `AdjustBalanceModal` + `BanUserConfirmModal` + i18n extend).
  - **Batch 3:** شاشة مراقبة المزادات وإلغائها وإدارة المراجعات (`admin.service` extend + `useAdminAuctions` + `useAdminCancelAuction` + `useAdminAuctionReviews` + `useAdminReviewModeration` + `AdminAuctionsPage` + `AdminAuctionsTable` + `CancelAuctionModal` + `AuctionReviewsModerationModal` + i18n extend).
  - **Batch 4:** شاشة فض النزاعات وإدارة الضمان المالي (`admin.service` extend + `useAdminDisputes` + `useAdminEscrows` + `useResolveDispute` + `useUpdateDisputeStatus` + `useEscrowAdminActions` + `AdminDisputesPage` + `AdminDisputesTable` + `DisputeResolveModal` + `AdminEscrowsTable` + i18n extend).
  - **Batch 5:** شاشة إدارة السحوبات، الخزينة، والمعاملات مع السوكت اللحظي والتكامل النهائي (`admin.service` extend + `useAdminWithdrawals` + `useAdminTreasuryStats` + `useAdminTransactions` + `useAdminWithdrawalActions` + `useAdminWithdrawalSubscription` + `AdminFinancialsPage` + `WithdrawalsTable` + `CompleteWithdrawalModal` + `RejectWithdrawalModal` + `TreasuryOverviewSection` + `TransactionsAuditTable` + Navbar Switcher Integration + i18n extend + 4-Gate Final Verification).
- [ ] **3. قاعدة التوسعة التدريجية (Incremental Extension):**
  - كل Batch توسّع `admin.service.ts` و `index.ts` وملفات الترجمة دون تكرار أو كسر ما سبق بناؤه.
- [ ] **4. دورة حياة كل Batch (Lifecycle):**
  1. كتابة كود الـ Batch بالكامل.
  2. تشغيل الفحوصات الثلاثة: `npm run lint` + `npx tsc --noEmit` + `npm run build` → 0 errors.
  3. إبلاغ المطور بجاهزية الـ Batch للمعاينة اليدوية (UI / Themes / RTL / Network).
  4. انتظار موافقة صريحة ("OK" أو "تمام") من المطور قبل عمل أي `git commit`.
- [ ] **5. عدم عمل `git push` إطلاقاً إلا بأمر صريح بعد اكتمال واختبار كل الـ Batches.**
- [ ] **6. ممنوع كتابة أي سطر كود قبل اعتماد هذه الخطة بالكامل.**

---

## 2. تقييم جاهزية الباك إند والسياسات المعمارية (Backend Readiness & Architecture Policies)

### 2.1 تقرير فحص الباك إند (100% Ready):
1. **استعلام إحصائيات لوحة التحكم (`adminGetDashboardStats`):**
   - الحقول: `totalUsers`, `verifiedUsers`, `activeAuctions`, `completedAuctions`, `cancelledAuctions`, `totalWalletBalance`, `todaysRevenue`, `totalTransactions`, `pendingWithdrawalsCount`, `pendingWithdrawalsAmount`, `totalCompletedPayouts`, `totalCollectedFees`.
2. **إدارة المستخدمين (`adminGetUsers`, `adminGetUserDetails`, `adminToggleUserBan`, `adminUpdateUser`, `adminDeleteUser`, `adminAdjustUserBalance`):**
   - يدعم Pagination + Search + Sort (`CREATED_AT`, `FIRST_NAME`, `LAST_NAME`).
   - جلب ملف المستخدم الإداري الشامل `adminGetUserDetails` (بيانات الحساب + المحفظة + آخر المزادات + المعاملات).
   - تسوية الرصيد اليدوية `adminAdjustUserBalance` بنوع `CREDIT` أو `DEBIT` مع سبب إلزامي.
3. **إدارة المزادات والمراجعات (`adminGetAuctions`, `adminCancelAuction`, `adminBids`, `adminAuctionReviews`, `hideReview`, `unhideReview`):**
   - إلغاء المزاد الإداري مع سبب توثيقي وإرجاع مبالغ المزايدات تلقائياً في الباك إند.
   - مراجعة مزايدات المزاد `adminBids`.
   - إخفاء/إظهار المراجعات المخالفة `hideReview` / `unhideReview`.
4. **النزاعات والضمان المالي (`allDisputes`, `allEscrows`, `resolveDispute`, `updateDisputeStatus`, `releaseEscrow`, `refundEscrow`):**
   - استعراض كافة النزاعات مع فلاتر الحالة والأطراف ودعم البحث السيرفري المتقدم `search: String` (بالاسم الكامل، الاسم المركب، الإيميل، المعرفات المختصرة، والبيان).
   - حل النزاع بقرار إداري `REFUND_BUYER` أو `PAY_SELLER` مع ملاحظات إدارية `adminNotes`.
5. **السحوبات والخزينة والسيولة (`adminGetTreasuryStats`, `adminGetWithdrawals`, `adminStartWithdrawalProcessing`, `adminCompleteWithdrawal`, `adminRejectWithdrawal`):**
   - استعراض تقرير الخزينة والسيولة المباشر.
   - دورة حياة السحب الإدارية: قفل الطلب للمعالجة `PROCESSING` -> إتمام مع إرفاق رقم الحوالة والإيصال `COMPLETED` -> أو رفض مع ذكر السبب `REJECTED` وإعادة الرصيد للمحفظة فوراً.
   - البث المباشر لطلبات السحب عبر السوكت `adminWithdrawalFeed`.

---

## 3. القرارات المعمارية القياسية وحلول الدروس المستفادة (10/10 Architecture Decisions)

### القرار 1: هيكل الـ Admin Layout المتكامل والمنفصل (Integrated Dedicated Layout)
* **المشكلة:** هل يحتاج الأدمن تطبيقاً منفصلاً تماماً أم صفحات مدمجة في نفس التطبيق؟ وكيف نتجنب التداخل مع واجهة المتجر العامة؟
* **الحل المعماري:**
  - بناء `AdminLayout.tsx` مخصص يعيش تحت مسار `/admin/*` محمي بـ `AdminRoute`.
  - يتضمن:
    1. **AdminSidebar:** شريط جانبي ثابت/قابل للطي للشاشات الكبيرة ودرج منزلق للموبايل، مصمم بأناقة داكنة مميزة (Dark Slate & Gold Accent) ليمنح شعوراً إدارياً فخماً، مع شارات حية لعدد السحوبات المعلقة والنزاعات المفتوحة.
    2. **AdminHeader:** هيدر علوي مدمج يحتوي على Breadcrumb ديناميكي، زر الرجوع السريع لواجهة المتجر ("العودة للمنصة الرئيسية")، محول اللغة والثيم، وبيانات الأدمن.
    3. **Content Outlet:** حاوية رئيسية عالية الكثافة للمعلومات والجداول.
  - إضافة زر انتقال سريع للأدمن في الـ Navbar العام عند تسجيل الدخول بحساب `role === 'ADMIN'`.

---

### القرار 2: التزامن اللحظي لطلبات السحب والنزاعات بدون حلقات تكرار (Anti-Loop Subscriptions)
* **المشكلة:** تجنب حدوث Resubscription Loops عند استقبال أحداث `adminWithdrawalFeed` أو تغييرات النزاعات والضمان.
* **الحل المعماري:**
  - استخدام `useRef` للـ handlers في هوك `useAdminWithdrawalSubscription`:
  ```ts
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (!isAdmin) return;

    const unsubscribe = adminService.subscribeToWithdrawalFeed({
      next: (withdrawal) => {
        // تحديث كاش السحوبات وإحصائيات لوحة التحكم والخزينة
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.WITHDRAWALS });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.STATS });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.TREASURY });
        optionsRef.current?.onNewWithdrawal?.(withdrawal);
      },
      error: (err) => console.warn('Admin withdrawal feed subscription error:', err),
    });

    return () => unsubscribe();
  }, [isAdmin, queryClient]);
  ```

---

### القرار 3: عزل بارامترات الترقيم بالـ URL لكل جدول إداري
* **المشكلة:** وجود أكثر من جدول وفلاتر متعددة في صفحات الأدمن (مثل السحوبات والمعاملات، أو النزاعات والضمان).
* **الحل:**
  - في صفحة المستخدمين: `?usersPage=...&search=...&sort=...`
  - في صفحة المزادات: `?auctionsPage=...&category=...&status=...`
  - في صفحة النزاعات: `?disputesPage=...&escrowsPage=...`
  - في صفحة السحوبات والخزينة: `?withdrawalsPage=...&trxPage=...`

---

### القرار 4: معالجة القيم المالية والكسور العشرية بدقة صارمة
* **المشكلة:** حقول المبالغ تأتي من الباك إند كـ `String!` أو `Float!` في الإحصائيات.
* **الحل:**
  - استخدام دوال التنسيق الآمنة: `formatCurrency(amount)` التي تتعامل مع القيم سواء كانت `string` أو `number`.
  - التحقق من الإدخال في Zod لنموذج تسوية الرصيد `adminAdjustBalance.schema.ts` وطلب السحب:
    `amount: z.preprocess((val) => normalizeArabicDigits(val), z.coerce.number().positive().min(1))`

---

### القرار 5: هيكل مفاتيح TanStack Query الموحد (Query Keys Factory)
* في [src/constants/queryKeys.constants.ts](file:///d:/Projects/mazadak-frontend/src/constants/queryKeys.constants.ts):
```ts
ADMIN: {
  ALL: ['admin'] as const,
  STATS: ['admin', 'stats'] as const,
  TREASURY: ['admin', 'treasury'] as const,
  USERS: (page?: number, limit?: number, filter?: unknown) =>
    ['admin', 'users', page, limit, filter] as const,
  USER_DETAILS: (userId: string) => ['admin', 'user-details', userId] as const,
  AUCTIONS: (page?: number, limit?: number, filter?: unknown) =>
    ['admin', 'auctions', page, limit, filter] as const,
  AUCTION_REVIEWS: (auctionId: string) => ['admin', 'auction-reviews', auctionId] as const,
  DISPUTES: (page?: number, limit?: number, filter?: unknown) =>
    ['admin', 'disputes', page, limit, filter] as const,
  ESCROWS: (page?: number, limit?: number, filter?: unknown) =>
    ['admin', 'escrows', page, limit, filter] as const,
  WITHDRAWALS: (page?: number, limit?: number, filter?: unknown) =>
    ['admin', 'withdrawals', page, limit, filter] as const,
  WITHDRAWAL_DETAIL: (id: string) => ['admin', 'withdrawal', id] as const,
  TRANSACTIONS: (page?: number, limit?: number, filter?: unknown) =>
    ['admin', 'transactions', page, limit, filter] as const,
}
```

---

## 4. العقد البرمجي الكامل للـ GraphQL والأنواع (GraphQL Contracts & Types)

### 4.1 الكيانات والأنواع في `src/features/admin/types/admin.types.ts`:
```ts
import type { User, Address, UserRole, AuthProvider } from '@/types';
import type { Auction, AuctionStatus, AuctionCategory } from '@/features/auctions/types/auctions.types';
import type { Transaction, TransactionType, TransactionStatus } from '@/features/wallet/types/wallet.types';
import type { PayoutMethod, WithdrawalStatus, WithdrawalRequest } from '@/features/wallet/types/withdrawals.types';
import type { Dispute, DisputeStatus, DisputeReason, DisputeResolution, Escrow, EscrowStatus } from '@/features/escrow/types/escrow.types';
import type { Review } from '@/features/reviews/types/reviews.types';

export interface DashboardStats {
  totalUsers: number;
  verifiedUsers: number;
  activeAuctions: number;
  completedAuctions: number;
  cancelledAuctions: number;
  totalWalletBalance: number;
  todaysRevenue: number;
  totalTransactions: number;
  pendingWithdrawalsCount: number;
  pendingWithdrawalsAmount: number;
  totalCompletedPayouts: number;
  totalCollectedFees: number;
}

export interface TreasuryStats {
  totalWalletBalance: number;
  totalHeldInWallets: number;
  totalPendingWithdrawals: number;
  pendingWithdrawalsCount: number;
  totalHeldInEscrow: number;
  totalCompletedPayouts: number;
  totalCollectedFees: number;
}

export interface AdminUserDetails {
  user: User;
  wallet?: {
    _id: string;
    userId: string;
    balance: string;
    heldBalance: string;
    availableBalance: string;
    createdAt: string;
    updatedAt: string;
  };
  recentAuctions?: {
    items: Auction[];
    total: number;
    totalPages: number;
    hasNextPage: boolean;
  };
  recentTransactions?: {
    items: Transaction[];
    total: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}

export type AdminAdjustBalanceType = 'CREDIT' | 'DEBIT';

export interface AdminAdjustBalanceInput {
  userId: string;
  amount: number;
  type: AdminAdjustBalanceType;
  reason: string;
}

export interface AdminCompleteWithdrawalInput {
  withdrawalId: string;
  adminReference: string;
  receiptUrl: string;
}

export interface AdminRejectWithdrawalInput {
  withdrawalId: string;
  rejectionReason: string;
}

export interface ResolveDisputeInput {
  disputeId: string;
  decision: DisputeResolution;
  adminNotes?: string;
}

export interface UsersFilterInput {
  search?: string;
  sort?: {
    field: 'CREATED_AT' | 'FIRST_NAME' | 'LAST_NAME';
    order: 'ASC' | 'DESC';
  };
}
```

---

### 4.2 استعلامات وطفرات واشتراكات الـ GraphQL:

```graphql
# 1. إحصائيات لوحة التحكم الرئيسية
query AdminGetDashboardStats {
  adminGetDashboardStats {
    totalUsers
    verifiedUsers
    activeAuctions
    completedAuctions
    cancelledAuctions
    totalWalletBalance
    todaysRevenue
    totalTransactions
    pendingWithdrawalsCount
    pendingWithdrawalsAmount
    totalCompletedPayouts
    totalCollectedFees
  }
}

# 2. تقرير الخزينة والسيولة الشامل
query AdminGetTreasuryStats {
  adminGetTreasuryStats {
    totalWalletBalance
    totalHeldInWallets
    totalPendingWithdrawals
    pendingWithdrawalsCount
    totalHeldInEscrow
    totalCompletedPayouts
    totalCollectedFees
  }
}

# 3. استعراض المستخدمين مع البحث والترتيب والترقيم
query AdminGetUsers($input: PaginationInput!, $filter: UsersFilterInput) {
  adminGetUsers(input: $input, filter: $filter) {
    total
    totalPages
    hasNextPage
    items {
      _id
      firstName
      lastName
      email
      role
      authProvider
      phoneNumber
      dateOfBirth
      address { city street }
      isEmailVerified
      isBanned
      ratingStats { averageRating totalReviews }
      createdAt
    }
  }
}

# 4. تفاصيل المستخدم الإدارية الشاملة
query AdminGetUserDetails($userId: ID!) {
  adminGetUserDetails(userId: $userId) {
    user {
      _id
      firstName
      lastName
      email
      role
      phoneNumber
      address { city street }
      isEmailVerified
      isBanned
      createdAt
    }
    wallet {
      _id
      balance
      heldBalance
      availableBalance
    }
    recentAuctions {
      total
      items {
        _id
        title
        currentPrice
        status
        createdAt
      }
    }
    recentTransactions {
      total
      items {
        _id
        type
        amount
        currency
        status
        createdAt
      }
    }
  }
}

# 5. استعراض المزادات في الإدارة (مطابق بدقة 100% لـ schema.gql)
query AdminGetAuctions($input: PaginationInput!, $filter: AuctionsFilterInput) {
  adminGetAuctions(input: $input, filter: $filter) {
    total
    totalPages
    hasNextPage
    items {
      _id
      title
      description
      category
      startingPrice
      currentPrice
      status
      startTime
      endTime
      images
      sellerId
      winnerId
      isFinalized
      adminActionReason
      createdAt
    }
  }
}

# 6. استعراض مراجعات المزاد للإشراف
query AdminAuctionReviews($auctionId: ID!) {
  adminAuctionReviews(auctionId: $auctionId) {
    _id
    overallRating
    comment
    reply
    status
    createdAt
    reviewer { id firstName lastName }
    reviewedUser { id firstName lastName }
  }
}

# 7. استعراض النزاعات
query AdminAllDisputes($input: PaginationInput, $filter: DisputeFilterInput) {
  allDisputes(input: $input, filter: $filter) {
    total
    totalPages
    hasNextPage
    items {
      _id
      escrowId
      auctionId
      openedById
      againstUserId
      reason
      description
      evidenceUrls
      status
      adminDecision
      adminNotes
      resolvedAt
      createdAt
    }
  }
}

# 8. استعراض معاملات الضمان المالي
query AdminAllEscrows($input: PaginationInput, $filter: EscrowFilterInput) {
  allEscrows(input: $input, filter: $filter) {
    total
    totalPages
    hasNextPage
    items {
      _id
      auctionId
      buyerId
      sellerId
      amount
      currency
      status
      inspectionPeriodEndsAt
      releasedAt
      refundedAt
      releaseReason
      createdAt
    }
  }
}

# 9. استعراض طلبات السحب
query AdminGetWithdrawals($pagination: PaginationInput!, $filter: WithdrawalsFilterInput) {
  adminGetWithdrawals(pagination: $pagination, filter: $filter) {
    total
    totalPages
    hasNextPage
    items {
      _id
      userId
      amount
      fee
      feePercentage
      netAmount
      currency
      payoutMethod
      payoutDetails {
        accountHolderName
        bankName
        accountNumber
        iban
        phoneNumber
        ipaAddress
      }
      status
      adminReference
      receiptUrl
      rejectionReason
      processedAt
      completedAt
      createdAt
    }
  }
}

# 10. استعراض كافة المعاملات المالية للنظام
query AdminGetTransactions($input: PaginationInput!, $filter: TransactionsFilterInput) {
  adminGetTransactions(input: $input, filter: $filter) {
    total
    totalPages
    hasNextPage
    items {
      _id
      walletId
      type
      amount
      currency
      status
      referenceId
      referenceType
      createdAt
    }
  }
}

# ----------------- Mutations -----------------

# حظر / إلغاء حظر مستخدم
mutation AdminToggleUserBan($userId: ID!) {
  adminToggleUserBan(userId: $userId) {
    _id
    isBanned
  }
}

# تعديل رصيد مستخدم يدوياً (تسوية مالية)
mutation AdminAdjustUserBalance($input: AdminAdjustBalanceInput!) {
  adminAdjustUserBalance(input: $input) {
    _id
    balance
    heldBalance
    availableBalance
  }
}

# إلغاء مزاد إدارياً
mutation AdminCancelAuction($auctionId: ID!, $reason: String!) {
  adminCancelAuction(auctionId: $auctionId, reason: $reason)
}

# إخفاء مراجعة مخالفة
mutation AdminHideReview($reviewId: ID!) {
  hideReview(reviewId: $reviewId) {
    _id
    status
  }
}

# إعادة إظهار مراجعة
mutation AdminUnhideReview($reviewId: ID!) {
  unhideReview(reviewId: $reviewId) {
    _id
    status
  }
}

# حل نزاع مالي
mutation AdminResolveDispute($input: ResolveDisputeInput!) {
  resolveDispute(input: $input) {
    _id
    status
    adminDecision
    adminNotes
    resolvedAt
  }
}

# تغيير حالة النزاع
mutation AdminUpdateDisputeStatus($input: UpdateDisputeStatusInput!) {
  updateDisputeStatus(input: $input) {
    _id
    status
  }
}

# فك الضمان يدوياً للبائع
mutation AdminReleaseEscrow($escrowId: ID!, $reason: String) {
  releaseEscrow(escrowId: $escrowId, reason: $reason) {
    _id
    status
    releasedAt
  }
}

# رد الضمان يدوياً للمشتري
mutation AdminRefundEscrow($escrowId: ID!, $reason: String) {
  refundEscrow(escrowId: $escrowId, reason: $reason) {
    _id
    status
    refundedAt
  }
}

# بدء معالجة طلب سحب
mutation AdminStartWithdrawalProcessing($requestId: ID!) {
  adminStartWithdrawalProcessing(requestId: $requestId) {
    _id
    status
    processedAt
  }
}

# إتمام السحب وإرفاق الإيصال
mutation AdminCompleteWithdrawal($input: AdminCompleteWithdrawalInput!) {
  adminCompleteWithdrawal(input: $input) {
    _id
    status
    adminReference
    receiptUrl
    completedAt
  }
}

# رفض طلب السحب مع السبب
mutation AdminRejectWithdrawal($input: AdminRejectWithdrawalInput!) {
  adminRejectWithdrawal(input: $input) {
    _id
    status
    rejectionReason
  }
}

# ----------------- Subscriptions -----------------

# بث طلبات السحب اللحظي
subscription AdminWithdrawalFeed {
  adminWithdrawalFeed {
    _id
    userId
    amount
    netAmount
    payoutMethod
    status
    createdAt
  }
}
```

---

## 5. مصفوفة كودات الأخطاء الإدارية (Error Handling Matrix)

| كود الخطأ | HTTP Status | السبب والمعنى | ما يعرضه الفرونت إند (مترجم) | الإجراء التصحيحي في الواجهة |
|:---|:---|:---|:---|:---|
| `UNAUTHORIZED` | 401 | الجلسة منتهية أو المستخدم غير مسجل | "انتهت جلستك، يرجى تسجيل الدخول مجدداً." | توجيه فوري لـ `/login` مع الاحتفاظ بالمسار |
| `FORBIDDEN` | 403 | المستخدم ليس لديه صلاحية `role: ADMIN` | "غير مصرح لك بالوصول إلى لوحة التحكم الإدارية." | توجيه فوري لـ `/unauthorized` |
| `USER_NOT_FOUND` | 404 | المستخدم المطلوب غير موجود | "المستخدم المطلوب غير موجود في النظام." | إغلاق الـ Drawer وتحديث قائمة المستخدمين |
| `AMOUNT_MUST_BE_POSITIVE` | 400 | مبلغ التسوية المالية أقل من أو يساوي صفر | "يجب أن يكون مبلغ التسوية أكبر من الصفر." | تنبيه الحقل في النموذج |
| `REASON_REQUIRED` / `REASON_TOO_SHORT` | 400 | سبب التسوية المالية أو الإلغاء أقل من 10 أحرف | "سبب الإجراء إلزامي ويجب ألا يقل عن 10 أحرف للتوثيق المالي." | إظهار خطأ Validation أسفل حقل النص |
| `AUCTION_NOT_FOUND` | 404 | المزاد المحدد غير موجود | "المزاد المحدد غير موجود." | إغلاق الـ Modal وتحديث القائمة |
| `AUCTION_CANNOT_BE_CANCELLED` | 400 | المزاد مكتمل بالفعل أو ملغي مسبقاً | "لا يمكن إلغاء هذا المزاد في حالته الحالية." | تعطيل زر الإلغاء وتحديث البيانات |
| `DISPUTE_NOT_FOUND` | 404 | النزاع المطلوب غير موجود | "ملف النزاع غير موجود." | تحديث قائمة النزاعات |
| `DISPUTE_ALREADY_RESOLVED` | 400 | النزاع تم حله مسبقاً | "تم فض هذا النزاع مسبقاً." | إغلاق نافذة الحل وتحديث الحالة |
| `WITHDRAWAL_NOT_FOUND` | 404 | طلب السحب غير موجود | "طلب السحب المحدد غير موجود." | تحديث قائمة السحوبات |
| `WITHDRAWAL_NOT_PENDING` | 400 | محاولة بدء معالجة طلب تم البت فيه | "الطلب ليس في حالة انتظار للمعالجة." | تحديث الكاش وعرض الحالة الحالية |
| `WITHDRAWAL_NOT_IN_PROGRESS` | 400 | محاولة إتمام طلب ليس قيد المعالجة | "يجب بدء معالجة الطلب أولاً قبل إتمامه." | تحديث حالة الطلب |
| `WITHDRAWAL_NOT_REJECTABLE` | 400 | محاولة رفض طلب مكتمل بالفعل | "لا يمكن رفض طلب سحب مكتمل." | إخفاء زر الرفض |

---

## 6. هيكل الملفات الكامل لموديول الأدمن (Feature Architecture Tree)

```
src/features/admin/
├── types/
│   └── admin.types.ts                [NEW — مطابقة كاملة لـ schema.gql وكافة أنواع الإدارة]
├── utils/
│   └── admin.utils.ts                [NEW — دوال تنسيق الإحصائيات، الحالات، والشارات الإدارية]
├── schemas/
│   ├── adminAdjustBalance.schema.ts  [NEW — Zod schema لتسوية الرصيد اليدوية]
│   ├── adminCancelAuction.schema.ts  [NEW — Zod schema لإلغاء المزاد الإداري]
│   ├── adminResolveDispute.schema.ts [NEW — Zod schema لفض النزاعات وتوثيق القرار]
│   ├── adminCompleteWithdrawal.schema.ts [NEW — Zod schema لإتمام السحب ورقم الحوالة]
│   └── adminRejectWithdrawal.schema.ts   [NEW — Zod schema لرفض السحب وسبب الرفض]
├── services/
│   └── admin.service.ts              [NEW — GraphQL Queries, Mutations & Subscriptions للإدارة]
├── hooks/
│   ├── useAdminDashboardStats.ts     [NEW — استعلام إحصائيات الداشبورد العامة]
│   ├── useAdminTreasuryStats.ts      [NEW — استعلام تقرير الخزينة والسيولة]
│   ├── useAdminUsers.ts              [NEW — استعلام وإدارة المستخدمين مع البحث والفرز]
│   ├── useAdminUserDetails.ts        [NEW — استعلام تفاصيل المستخدم الشاملة والمحفظة]
│   ├── useAdminToggleBan.ts          [NEW — طفرة حظر / فك حظر المستخدم]
│   ├── useAdminAdjustBalance.ts      [NEW — طفرة تسوية رصيد المستخدم مع التوثيق]
│   ├── useAdminAuctions.ts           [NEW — استعلام المزادات الإداري والفلترة]
│   ├── useAdminCancelAuction.ts      [NEW — طفرة إلغاء المزاد الإداري]
│   ├── useAdminAuctionReviews.ts     [NEW — استعلام مراجعات المزاد للإشراف]
│   ├── useAdminReviewModeration.ts   [NEW — طفرات إخفاء وإظهار المراجعات]
│   ├── useAdminDisputes.ts           [NEW — استعلام النزاعات الشامل والفلترة]
│   ├── useAdminEscrows.ts            [NEW — استعلام معاملات الضمان المالي]
│   ├── useResolveDispute.ts          [NEW — طفرة فض النزاع وقرار الإدارة]
│   ├── useAdminWithdrawals.ts        [NEW — استعلام طلبات السحب والفلاتر]
│   ├── useAdminWithdrawalActions.ts  [NEW — طفرات بدء المعالجة، الإتمام، والرفض]
│   ├── useAdminWithdrawalSubscription.ts [NEW — اشتراك السوكت اللحظي لطلبات السحب]
│   └── useAdminTransactions.ts       [NEW — استعلام سجل المعاملات المالية العام]
├── components/
│   ├── layout/
│   │   ├── AdminLayout.tsx           [NEW — الهيكل الرئيسي للوحة التحكم مع الـ Sidebar والـ Header]
│   │   ├── AdminSidebar.tsx          [NEW — الشريط الجانبي الفاخر مع الشارات الحية والتنقل]
│   │   └── AdminHeader.tsx           [NEW — الهيدر العلوي مع Breadcrumbs وزر الانتقال للمتجر]
│   ├── dashboard/
│   │   ├── StatKpiCard.tsx           [NEW — بطاقة المؤشرات الإحصائية الفاخرة مع الرسوم التوضيحية]
│   │   ├── TreasuryKpiCard.tsx       [NEW — بطاقة مؤشرات الخزينة والأموال المعلقة]
│   │   └── RecentActivityFeed.tsx    [NEW — شريط آخر الأنشطة والعمليات في المنصة]
│   ├── users/
│   │   ├── AdminUsersTable.tsx       [NEW — جدول المستخدمين عالي الكثافة مع الفلاتر]
│   │   ├── UserDetailsDrawer.tsx     [NEW — درج جانبي لتفاصيل المستخدم والمحفظة والنشاط]
│   │   ├── AdjustBalanceModal.tsx    [NEW — نافذة منبثقة لتسوية الرصيد اليدوية مع التحقق]
│   │   └── BanUserConfirmModal.tsx   [NEW — نافذة تأكيد حظر / فك حظر المستخدم]
│   ├── auctions/
│   │   ├── AdminAuctionsTable.tsx    [NEW — جدول المزادات الإداري مع مؤشرات الأسعار والحالات]
│   │   ├── AdminCancelAuctionModal.tsx [NEW — نافذة إلغاء المزاد مع سبب الإلغاء]
│   │   └── AuctionReviewsModerationModal.tsx [NEW — نافذة إشراف مراجعات المزاد وإخفائها]
│   ├── disputes/
│   │   ├── AdminDisputesTable.tsx    [NEW — جدول النزاعات مع فلاتر الحالات والأطراف]
│   │   ├── AdminEscrowsTable.tsx     [NEW — جدول معاملات الضمان المالي وفك الحجز]
│   │   └── DisputeResolveModal.tsx   [NEW — نافذة فض النزاع وتحديد المستحق والملاحظات]
│   └── financials/
│       ├── WithdrawalsTable.tsx      [NEW — جدول طلبات السحب مع شارات الوسائل والحالات]
│       ├── CompleteWithdrawalModal.tsx [NEW — نافذة إتمام السحب مع رقم الحوالة والإيصال]
│       ├── RejectWithdrawalModal.tsx [NEW — نافذة رفض السحب مع سبب الرفض]
│       ├── TreasuryOverviewSection.tsx [NEW — بطاقات الخزينة ورصيد المنصة الإجمالي]
│       └── TransactionsAuditTable.tsx [NEW — جدول سجل التدقيق المالي لكافة المعاملات]
├── pages/
│   ├── AdminDashboardPage.tsx        [NEW — الصفحة الرئيسية للوحة التحكم والإحصائيات العامة]
│   ├── AdminUsersPage.tsx            [NEW — صفحة إدارة المستخدمين والتسويات]
│   ├── AdminAuctionsPage.tsx         [NEW — صفحة مراقبة المزادات والمراجعات]
│   ├── AdminDisputesPage.tsx         [NEW — صفحة فض النزاعات وإدارة الضمان]
│   └── AdminFinancialsPage.tsx       [NEW — صفحة السحوبات والخزينة والمعاملات المالية]
└── index.ts                          [NEW — Barrel Export الشامل لكافة خدمات وهوكس ومكونات الأدمن]

src/locales/ar/admin.json             [NEW — ملف الترجمة العربية الشامل لكافة شاشات ومودالات الأدمن]
src/locales/en/admin.json             [NEW — ملف الترجمة الإنجليزية الشامل لكافة شاشات ومودالات الأدمن]

src/constants/routes.constants.ts     [MODIFY — توسيع ثوابت مسارات الأدمن لتشمل FINANCIALS]
src/constants/queryKeys.constants.ts  [MODIFY — تحديث وتوسيع مفاتيح QUERY_KEYS.ADMIN]
src/config/i18n.config.ts             [MODIFY — تسجيل namespace 'admin']
src/routes/AppRoutes.tsx              [MODIFY — تسجيل كافة صفحات الأدمن داخل AdminRoute و AdminLayout]
src/components/layout/Navbar.tsx      [MODIFY — إضافة رابط لوحة التحكم في الهيدر والدرج للأدمن فقط]
```

---

## 7. خطة التنفيذ التفصيلية بالشرائح الرأسية (Detailed Batches Execution)

```
[ ] Batch 1: البنية التحتية، مفاتيح الكاش، الترجمة، الـ Admin Layout ولوحة المؤشرات العامة
    (admin.types + queryKeys + i18n + admin.utils + admin.service Core + useAdminDashboardStats + useAdminTreasuryStats + AdminLayout + AdminSidebar + AdminHeader + StatKpiCard + TreasuryKpiCard + RecentActivityFeed + AdminDashboardPage + AppRoutes registration + index.ts Core)

[ ] Batch 2: شاشة إدارة المستخدمين والتسويات المالية
    (adminAdjustBalance.schema + admin.service extend + useAdminUsers + useAdminUserDetails + useAdminToggleBan + useAdminAdjustBalance + AdminUsersTable + UserDetailsDrawer + AdjustBalanceModal + BanUserConfirmModal + AdminUsersPage + index.ts extend + i18n ar/en extend)

[ ] Batch 3: شاشة مراقبة المزادات وإلغائها وإدارة المراجعات
    (adminCancelAuction.schema + admin.service extend + useAdminAuctions + useAdminCancelAuction + useAdminAuctionReviews + useAdminReviewModeration + AdminAuctionsTable + AdminCancelAuctionModal + AuctionReviewsModerationModal + AdminAuctionsPage + index.ts extend + i18n ar/en extend)

[ ] Batch 4: شاشة فض النزاعات وإدارة الضمان المالي
    (adminResolveDispute.schema + admin.service extend + useAdminDisputes + useAdminEscrows + useResolveDispute + useAdminDisputeStatus + useEscrowAdminActions + AdminDisputesTable + AdminEscrowsTable + DisputeResolveModal + AdminDisputesPage + index.ts extend + i18n ar/en extend)

[ ] Batch 5: شاشة السحوبات، الخزينة، والمعاملات مع السوكت اللحظي والتكامل النهائي
    (adminCompleteWithdrawal.schema + adminRejectWithdrawal.schema + admin.service extend + useAdminWithdrawals + useAdminWithdrawalActions + useAdminWithdrawalSubscription + useAdminTransactions + WithdrawalsTable + CompleteWithdrawalModal + RejectWithdrawalModal + TreasuryOverviewSection + TransactionsAuditTable + AdminFinancialsPage + Navbar Admin Switcher Integration + index.ts finalize + 4-Gate Global QA)
```

---

### 🔹 Batch 1: البنية التحتية، مفاتيح الكاش، الترجمة، الـ Admin Layout ولوحة المؤشرات العامة

#### المهام التنفيذية:
1. **تحديث [queryKeys.constants.ts](file:///d:/Projects/mazadak-frontend/src/constants/queryKeys.constants.ts) و [routes.constants.ts](file:///d:/Projects/mazadak-frontend/src/constants/routes.constants.ts):**
   - إضافة مفاتيح `ADMIN` الكاملة (`STATS`, `TREASURY`, `USERS`, `USER_DETAILS`, `AUCTIONS`, `AUCTION_REVIEWS`, `DISPUTES`, `ESCROWS`, `WITHDRAWALS`, `WITHDRAWAL_DETAIL`, `TRANSACTIONS`).
   - إضافة مسارات `ROUTES.ADMIN` (`DASHBOARD: '/admin'`, `USERS: '/admin/users'`, `AUCTIONS: '/admin/auctions'`, `DISPUTES: '/admin/disputes'`, `FINANCIALS: '/admin/financials'`, `TRANSACTIONS: '/admin/transactions'`).
2. **إنشاء ملفات الترجمة وتسجيلها في [i18n.config.ts](file:///d:/Projects/mazadak-frontend/src/config/i18n.config.ts):**
   - إنشاء `src/locales/ar/admin.json` و `src/locales/en/admin.json`.
   - تسجيل الـ Namespace `'admin'` في `i18n.config.ts`.
3. **إنشاء [admin.types.ts](file:///d:/Projects/mazadak-frontend/src/features/admin/types/admin.types.ts) و [admin.utils.ts](file:///d:/Projects/mazadak-frontend/src/features/admin/utils/admin.utils.ts):**
   - تعريف كافة الـ Interfaces والـ Types الخاصة بالأدمن وفق `schema.gql`.
   - دوال التنسيق المالي المخصص، حساب نسب التغير، استخراج ألوان شارات الحالات الإدارية.
4. **إنشاء [admin.service.ts](file:///d:/Projects/mazadak-frontend/src/features/admin/services/admin.service.ts) (Core):**
   - دالة `getDashboardStats()`.
   - دالة `getTreasuryStats()`.
5. **إنشاء الـ Hooks:**
   - `useAdminDashboardStats`: جلب إحصائيات الداشبورد العامة مع `staleTime: 2 min`.
   - `useAdminTreasuryStats`: جلب تقرير الخزينة والسيولة مع `staleTime: 2 min`.
6. **بناء مكونات الـ Layout:**
   - `AdminLayout.tsx`: الهيكل الإداري الفاخر مع حماية الـ Responsive Sidebar والـ Header.
   - `AdminSidebar.tsx`: القائمة الجانبية الإدارية الداكنة مع شارات العدادات اللحظية والتنقل السلس.
   - `AdminHeader.tsx`: الهيدر العلوي الذكي مع Breadcrumbs وزر العودة السريعة للمنصة العامة `ROUTES.HOME` وقائمة الحساب.
7. **بناء مكونات الداشبورد:**
   - `StatKpiCard.tsx`: بطاقة الإحصائيات الفاخرة مع الأيقونات والمؤشرات الرقمية.
   - `TreasuryKpiCard.tsx`: بطاقة مؤشرات السيولة والأموال المحتجزة.
   - `RecentActivityFeed.tsx`: ملخص سريع لآخر العمليات في المنصة (يستعرض أحدث العمليات الحقيقية عبر `getAdminTransactions` بـ `limit: 5` مع شارات الحالات).
8. **إنشاء [AdminDashboardPage.tsx](file:///d:/Projects/mazadak-frontend/src/features/admin/pages/AdminDashboardPage.tsx):**
   - تجميع مؤشرات المستخدمين، المزادات، الإيرادات، والسيولة في شبكة متجاوبة متناسقة.
9. **تحديث [AppRoutes.tsx](file:///d:/Projects/mazadak-frontend/src/routes/AppRoutes.tsx):**
   - إدراج مسار `/admin` داخل `AdminRoute` و `AdminLayout`.
10. **إنشاء [index.ts](file:///d:/Projects/mazadak-frontend/src/features/admin/index.ts) (Core).**

#### فحص الجودة لـ Batch 1:
- [ ] `npm run lint` → 0 errors
- [ ] `npx tsc --noEmit` → 0 errors
- [ ] `npm run build` → Build successful
- [ ] معاينة الداشبورد، الـ Sidebar، الـ Header، والتنقل بين الثيمات واللغات.
- [ ] **انتظار موافقة المطور ("OK" / "تمام") → عمل `git commit -m "feat(admin): implement core infrastructure, admin layout, dashboard KPIs, and navigation"`**

---

### 🔹 Batch 2: شاشة إدارة المستخدمين والتسويات المالية

#### المهام التنفيذية:
1. **إنشاء [adminAdjustBalance.schema.ts](file:///d:/Projects/mazadak-frontend/src/features/admin/schemas/adminAdjustBalance.schema.ts):**
   - `amount`: رقم موجب أكبر من الصفر (`z.number().positive()`).
   - `type`: خيار إلزامي `'CREDIT' | 'DEBIT'`.
   - `reason`: نص إلزامي لا يقل عن 10 أحرف (`z.string().trim().min(10)`).
2. **توسيع [admin.service.ts](file:///d:/Projects/mazadak-frontend/src/features/admin/services/admin.service.ts):**
   - إضافة دالة `getAdminUsers(input, filter)` (مع الالتزام بـ `UsersFilterInput: { search, sort }`).
   - إضافة دالة `getAdminUserDetails(userId)`.
   - إضافة دالة `toggleUserBan(userId)`.
   - إضافة دالة `adjustUserBalance(input)`.
   - إضافة دوال `adminUpdateUser(targetUser, input)` و `adminDeleteUser(targetUser)` للتحكم الإداري الكامل.
3. **إنشاء الـ Hooks:**
   - `useAdminUsers(page, limit, filter)`: استعلام المستخدمين مع البحث والفرز والترقيم.
   - `useAdminUserDetails(userId)`: استعلام تفاصيل المستخدم الشاملة والمحفظة.
   - `useAdminToggleBan()`: طفرة حظر/فك حظر المستخدم مع تحديث الكاش فورياً.
   - `useAdminAdjustBalance()`: طفرة تسوية الرصيد اليدوية مع إبطال كاش المحفظة والداشبورد.
4. **إنشاء المكونات:**
   - `AdminUsersTable.tsx`: جدول المستخدمين عالي الكثافة مع البحث والترتيب بالأحدث/الاسم عبر السيرفر، مع فلترة سريعة محلية (Client-side) للمحظورين والمفعلين لعدم إرسال حقول غير مدعومة للـ GraphQL، وشارات الرتب والتحقق.
   - `UserDetailsDrawer.tsx`: درج جانبي منزلق يعرض بيانات المستخدم، رصيد محفظته، وآخر نشاطاته مع أزرار الإجراءات السريعة والتعديل.
   - `AdjustBalanceModal.tsx`: نافذة منبثقة لتسوية الرصيد (إضافة/خصم) مع حقول المبلغ والنوع والسبب الإلزامي.
   - `BanUserConfirmModal.tsx`: نافذة تأكيد لحظر أو فك حظر الحساب مع توضيح العواقب.
5. **إنشاء [AdminUsersPage.tsx](file:///d:/Projects/mazadak-frontend/src/features/admin/pages/AdminUsersPage.tsx):**
   - إدارة حالة البحث، الترقيم بالـ URL (`?usersPage=`), فتح الأدراج والنوافذ المنبثقة.
6. **توسيع الترجمات في `ar/admin.json` و `en/admin.json` وتوسيع [index.ts](file:///d:/Projects/mazadak-frontend/src/features/admin/index.ts).**

#### فحص الجودة لـ Batch 2:
- [ ] `npm run lint` → 0 errors
- [ ] `npx tsc --noEmit` → 0 errors
- [ ] `npm run build` → Build successful
- [ ] تجربة البحث في المستخدمين، فتح الـ Drawer، تجربة مودال تسوية الرصيد، وتأكيد الحظر.
- [ ] **انتظار موافقة المطور ("OK" / "تمام") → عمل `git commit -m "feat(admin): implement user management, user details drawer, balance adjustment, and ban workflows"`**

---

### 🔹 Batch 3: شاشة مراقبة المزادات وإلغائها وإدارة المراجعات

#### المهام التنفيذية:
1. **إنشاء [adminCancelAuction.schema.ts](file:///d:/Projects/mazadak-frontend/src/features/admin/schemas/adminCancelAuction.schema.ts):**
   - `reason`: نص إلزامي لا يقل عن 10 أحرف (`z.string().trim().min(10)`).
2. **توسيع [admin.service.ts](file:///d:/Projects/mazadak-frontend/src/features/admin/services/admin.service.ts):**
   - إضافة دالة `getAdminAuctions(input, filter)`.
   - إضافة دالة `cancelAuction(auctionId, reason)`.
   - إضافة دالة `getAuctionReviews(auctionId)`.
   - إضافة دوال `hideReview(reviewId)` و `unhideReview(reviewId)`.
3. **إنشاء الـ Hooks:**
   - `useAdminAuctions(page, limit, filter)`: استعلام المزادات الإداري مع الفلترة حسب الفئة والحالة والبحث.
   - `useAdminCancelAuction()`: طفرة إلغاء المزاد مع إبطال كاش المزادات والداشبورد.
   - `useAdminAuctionReviews(auctionId)`: استعلام مراجعات المزاد.
   - `useAdminReviewModeration()`: طفرات إخفاء وإعادة إظهار المراجعات المخالفة.
4. **إنشاء المكونات:**
   - `AdminAuctionsTable.tsx`: جدول المزادات الشامل مع الصور المصغرة، السعر الحالي، صاحب المزاد، الحالة، وأزرار الإشراف.
   - `AdminCancelAuctionModal.tsx`: نافذة إلغاء المزاد مع حقل كتابة سبب الإلغاء وتنبيه برد أموال المزايدين.
   - `AuctionReviewsModerationModal.tsx`: نافذة عرض مراجعات المزاد مع إمكانية حجب/إظهار أي مراجعة مخالفة بنقرة واحدة.
5. **إنشاء [AdminAuctionsPage.tsx](file:///d:/Projects/mazadak-frontend/src/features/admin/pages/AdminAuctionsPage.tsx):**
   - دمج الجدول وفلاتر التصنيف والبحث ونوافذ الإلغاء والرقابة.
6. **توسيع الترجمات في `ar/admin.json` و `en/admin.json` وتوسيع [index.ts](file:///d:/Projects/mazadak-frontend/src/features/admin/index.ts).**

#### فحص الجودة لـ Batch 3:
- [ ] `npm run lint` → 0 errors
- [ ] `npx tsc --noEmit` → 0 errors
- [ ] `npm run build` → Build successful
- [ ] تجربة فلاتر المزادات، معاينة نافذة إلغاء المزاد، وتجربة نافذة إشراف المراجعات.
- [ ] **انتظار موافقة المطور ("OK" / "تمام") → عمل `git commit -m "feat(admin): implement auctions moderation, admin cancel auction modal, and review moderation tools"`**

---

### 🔹 Batch 4: شاشة فض النزاعات وإدارة الضمان المالي

#### المهام التنفيذية:
1. **إنشاء [adminResolveDispute.schema.ts](file:///d:/Projects/mazadak-frontend/src/features/admin/schemas/adminResolveDispute.schema.ts):**
   - `decision`: خيار إلزامي `'REFUND_BUYER' | 'PAY_SELLER'`.
   - `adminNotes`: نص اختياري حتى 500 حرف.
2. **توسيع [admin.service.ts](file:///d:/Projects/mazadak-frontend/src/features/admin/services/admin.service.ts):**
   - إضافة دالة `getAllDisputes(input, filter)`.
   - إضافة دالة `getAllEscrows(input, filter)`.
   - إضافة دالة `resolveDispute(input)`.
   - إضافة دالة `updateDisputeStatus(input)`.
   - إضافة دوال `releaseEscrow(escrowId, reason)` و `refundEscrow(escrowId, reason)`.
3. **إنشاء الـ Hooks:**
   - `useAdminDisputes(page, limit, filter)`: استعلام النزاعات مع فلترة الحالات والأطراف.
   - `useAdminEscrows(page, limit, filter)`: استعلام معاملات الضمان المالي.
   - `useResolveDispute()`: طفرة فض النزاع وتحديد الطرف المستحق.
   - `useEscrowAdminActions()`: طفرات فك حجز الضمان أو رده يدوياً.
4. **إنشاء المكونات:**
   - `AdminDisputesTable.tsx`: جدول النزاعات مع أسباب النزاع، روابط الأدلة، الحالة الحالية، وأزرار البت في النزاع.
   - `AdminEscrowsTable.tsx`: جدول معاملات الضمان المالي مع مؤقتات الفحص، الأطراف، المبالغ، وأزرار الفك والرد.
   - `DisputeResolveModal.tsx`: نافذة فض النزاع الفاخرة التي تعرض أسباب النزاع والأدلة مع خياري (رد المبلغ للمشتري / تحويل المبلغ للبائع) وكتابة التقرير الإداري.
5. **إنشاء [AdminDisputesPage.tsx](file:///d:/Projects/mazadak-frontend/src/features/admin/pages/AdminDisputesPage.tsx):**
   - تبويبات التنقل السلس بين (النزاعات المفتوحة والجارية / سجل معاملات الضمان المالي).
6. **توسيع الترجمات في `ar/admin.json` و `en/admin.json` وتوسيع [index.ts](file:///d:/Projects/mazadak-frontend/src/features/admin/index.ts).**

#### فحص الجودة لـ Batch 4:
- [ ] `npm run lint` → 0 errors
- [ ] `npx tsc --noEmit` → 0 errors
- [ ] `npm run build` → Build successful
- [ ] فحص جدول النزاعات، التبديل لتبويب الضمان، وتجربة نافذة فض النزاع.
- [ ] **انتظار موافقة المطور ("OK" / "تمام") → عمل `git commit -m "feat(admin): implement disputes resolution page, escrow management table, and resolve dispute modal"`**

---

### 🔹 Batch 5: شاشة السحوبات، الخزينة، والمعاملات مع السوكت اللحظي والتكامل النهائي

#### المهام التنفيذية:
1. **إنشاء Zod Schemas:**
   - [adminCompleteWithdrawal.schema.ts](file:///d:/Projects/mazadak-frontend/src/features/admin/schemas/adminCompleteWithdrawal.schema.ts): `adminReference` نص إلزامي + `receiptUrl` رابط صالح.
   - [adminRejectWithdrawal.schema.ts](file:///d:/Projects/mazadak-frontend/src/features/admin/schemas/adminRejectWithdrawal.schema.ts): `rejectionReason` نص إلزامي لا يقل عن 10 أحرف.
2. **توسيع [admin.service.ts](file:///d:/Projects/mazadak-frontend/src/features/admin/services/admin.service.ts):**
   - إضافة دالة `getAdminWithdrawals(pagination, filter)`.
   - إضافة دالة `startWithdrawalProcessing(requestId)`.
   - إضافة دالة `completeWithdrawal(input)`.
   - إضافة دالة `rejectWithdrawal(input)`.
   - إضافة دالة `getAdminTransactions(input, filter)`.
   - إضافة اشتراك السوكت `subscribeToWithdrawalFeed(observer)`.
3. **إنشاء الـ Hooks:**
   - `useAdminWithdrawals(page, limit, filter)`: استعلام طلبات السحب مع فلاتر الحالة ووسيلة الدفع.
   - `useAdminWithdrawalActions()`: طفرات بدء المعالجة والإتمام والرفض مع التحديث الفوري.
   - `useAdminWithdrawalSubscription()`: اشتراك السوكت اللحظي الآمن عبر `optionsRef`.
   - `useAdminTransactions(page, limit, filter)`: استعلام سجل المعاملات المالية العام.
4. **إنشاء المكونات:**
   - `TreasuryOverviewSection.tsx`: لوحة مؤشرات الخزينة والسيولة الشاملة ومبالغ السحوبات المعلقة.
   - `WithdrawalsTable.tsx`: جدول طلبات السحب مع تفاصيل الحسابات البنكية وانستاباي والمحافظ، وإجراءات البت السريع.
   - `CompleteWithdrawalModal.tsx`: نافذة إتمام السحب مع إدخال رقم الحوالة ورابط الإيصال المرفوع.
   - `RejectWithdrawalModal.tsx`: نافذة رفض السحب مع كتابة السبب التوضيحي للمستخدم.
   - `TransactionsAuditTable.tsx`: جدول التدقيق المالي لكافة حركات المحافظ في المنصة.
5. **إنشاء [AdminFinancialsPage.tsx](file:///d:/Projects/mazadak-frontend/src/features/admin/pages/AdminFinancialsPage.tsx):**
   - دمج مؤشرات الخزينة، جدول طلبات السحب الحية، وجدول المعاملات المالية.
6. **تحديث [Navbar.tsx](file:///d:/Projects/mazadak-frontend/src/components/layout/Navbar.tsx):**
   - إضافة رابط لوحة التحكم الإدارية `ROUTES.ADMIN.DASHBOARD` في الهيدر والدرج الجانبي يظهر حصراً عندما يكون `user?.role === 'ADMIN'`.
7. **تحديث [index.ts](file:///d:/Projects/mazadak-frontend/src/features/admin/index.ts) النهائي.**
8. **الفحص الشامل للبوابات الأربع (The 4-Gate Quality Verification):**
   - [ ] البوابة 1: `npm run lint` → 0 errors, 0 warnings.
   - [ ] البوابة 2: `npx tsc --noEmit` → 0 errors.
   - [ ] البوابة 3: `npm run build` → Build successful بدون أي أخطاء.
   - [ ] البوابة 4: الفحص العملي في المتصفح لكافة الشاشات والمودالات، التجاوب، الثيمات، واللغات.

#### فحص الجودة لـ Batch 5:
- [ ] اكتمال كافة البوابات بنجاح 100%.
- [ ] **انتظار موافقة المطور ("OK" / "تمام") → عمل `git commit -m "feat(admin): finalize admin module with financials, withdrawals lifecycle, live socket feed, and navbar switcher"`**

---

## 8. مصفوفة التحقق اليدوي الشاملة (Comprehensive Manual Verification Matrix)

| السيناريو التجريبي | النتيجة المتوقعة | كيفية التحقق في المتصفح والـ DevTools |
|:---|:---|:---|
| **1. وصول مستخدم غير مسؤول (`role: USER`) لمسار `/admin`** | يتم اعتراض الطلب وتوجيهه فورياً إلى صفحة `/unauthorized` (403). | تجربة كتابة `/admin` في المتصفح بحساب عادي. |
| **2. وصول مسؤول (`role: ADMIN`) لمسار `/admin`** | تفتح لوحة التحكم الإدارية مع عرض `AdminLayout`، الشريط الجانبي الفاخر، وبطاقات المؤشرات الإحصائية `DashboardStats`. | فحص تحميل الصفحة وعرض الأرقام والرسوم. |
| **3. البحث عن مستخدم وتعديل حالته (حظر / تسوية رصيد)** | ظهور نتائج البحث الفورية، فتح `UserDetailsDrawer`، تعديل الرصيد بنجاح عبر `adminAdjustUserBalance` وتحديث رصيد المحفظة فورياً. | فحص ردود الـ GraphQL وانعكاس الرصيد في الجدول والـ Drawer. |
| **4. مراقبة وإلغاء مزاد مخالف** | استعراض المزادات، فتح `AdminCancelAuctionModal`، كتابة سبب الإلغاء، إلغاء المزاد بنجاح عبر `adminCancelAuction` وتغير حالته إلى ملغي. | فحص تغير حالة المزاد وتحديث قائمة المزادات. |
| **5. فض نزاع مالي معلق** | فتح صفحة النزاعات، استعراض الأدلة في `DisputeResolveModal`، اتخاذ قرار (رد للمشتري / صرف للبائع)، وتغير حالة النزاع والضمان فوراً. | فحص تحديث حالة النزاع في الجدول وظهور تاريخ الحل. |
| **6. معالجة وإتمام طلب سحب أرباح** | انتقال طلب السحب من `PENDING` إلى `PROCESSING` ثم فتح `CompleteWithdrawalModal` وإرفاق رقم الحوالة والإيصال ليصبح `COMPLETED`. | مراقبة شبكة الـ API وتحديث شارات الحالة. |
| **7. استقبال طلب سحب جديد عبر السوكت اللحظي (`adminWithdrawalFeed`)** | يظهر الطلب الجديد فورياً في قمة جدول السحوبات وتحديث عداد السحوبات المعلقة في الداشبورد والـ Sidebar بـ 0ms. | فحص رسائل الـ WebSocket Frame في DevTools. |
| **8. التبديل بين لوحة التحكم الإدارية والمتجر العام** | نقر زر "العودة للمنصة الرئيسية" في الـ Admin Header ينقل إلى المتجر (`/`)، ونقر زر "لوحة التحكم" في الـ Navbar العام يعيد إلى `/admin`. | فحص سلاسة التنقل والاحتفاظ بحالة الجلسة. |
| **9. فحص اللغات والثيمات والتجاوب** | توافق كامل بين Dark/Light mode، RTL/LTR، وتناسق الجداول على الشاشات الكبيرة والموبايل. | فحص تبديل اللغة والثيم وتجربة أحجام الشاشات المختلفة. |
