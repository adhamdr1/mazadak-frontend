# Implementation Plan — Reviews Module (Module 9) [10/10 Gold Standard — Production-Ready]

**Branch:** `feature/reviews-module`  
**المراجع التقنية المعتمدة:**
- 📜 قسم 10 وقسم 11 في [.agents/BACKEND_CONTRACT.md](file:///d:/Projects/mazadak-frontend/.agents/BACKEND_CONTRACT.md) (محدث بالكامل وشامل لكافة الاستعلامات والاشتراكات)
- 📑 ملف الـ Schema الرسمي [.agents/schema.gql](file:///d:/Projects/mazadak-frontend/.agents/schema.gql)
- 📐 دليل الأنماط المعمارية [.agents/IMPLEMENTATION_PLAN_PATTERN.md](file:///d:/Projects/mazadak-frontend/.agents/IMPLEMENTATION_PLAN_PATTERN.md)
**الـ Namespaces للترجمة:** `reviews` + `common`  
**حالة الباك إند:** جاهز ومُعتمد بنسبة 100% (Production-Ready 10/10) بعد تطبيق الفهارس المركبة الكاملة، اشتراك السوكت، الـ Filter/Sort على كافة الاستعلامات، وكودات الأخطاء المخصصة.

---

## 1. قواعد العمل الصارمة (Rules of Engagement)

- [ ] **1. إنشاء الـ Branch أولاً (إلزامي قبل أي تعديل كود):**
  ```bash
  git checkout main
  git pull origin main
  git checkout -b feature/reviews-module
  ```
- [ ] **2. الشرائح الرأسية المنفصلة (Vertical Slices):**
  - **Batch 1:** البنية الأساسية والمفاتيح والترجمة وبطاقات العرض والإحصائيات (`queryKeys` [REVIEWS] + `i18n.config` + `reviews.types.ts` + `reviews.utils.ts` + `reviews.service.ts` Core + Hooks + `StarRating` + `RatingBreakdownCard` + `ReviewCard` + `ReviewFilters` + `ReviewSkeleton` + `index.ts` Core + i18n ar/en).
  - **Batch 2:** نافذة كتابة التقييم والتحقق الاستباقي من الأهلية (`createReview.schema` + `reviews.service` Extend + `useCanReviewAuction` [staleTime: 0] + `useCreateReview` + `CriteriaRatingInput` + `ReviewEligibilityBanner` + `WriteReviewModal` [Blind Review Notice] + i18n ar/en Extend).
  - **Batch 3:** نافذة الرد على التقييم وقسم تقييماتي والدمج الموحد (`replyReview.schema` + `reviews.service` Extend + `useReplyReview` + `useMyWrittenReviews` + `ReplyReviewModal` + `MyWrittenReviewCard` + `UserReviewsSection` [dual pagination: reviewPage] + i18n ar/en Extend).
  - **Batch 4:** التكامل النهائي، مزامنة السوكت المزدوجة، والـ Barrel Export الشامل (`SocketContext` Integration + `useReviewSubscription` [Loop-Safe with optionsRef] + `index.ts` Final + 4-Gate Global Verification).
- [ ] **3. قاعدة التوسعة التدريجية (Incremental Extension):**
  - كل Batch توسّع `reviews.service.ts` و `index.ts` بإضافة دوال ومكونات جديدة دون إعادة كتابة أو تكرار الكود السابق.
- [ ] **4. دورة حياة كل Batch (Lifecycle):**
  1. كتابة كود الـ Batch بالكامل.
  2. تشغيل الفحوصات الثلاثة: `npm run lint` + `npx tsc --noEmit` + `npm run build` → 0 errors.
  3. إبلاغ المطور بجاهزية الـ Batch للمعاينة اليدوية (UI / Themes / RTL / Network).
  4. انتظار موافقة صريحة ("OK" أو "تمام") من المطور قبل عمل أي `git commit`.
- [ ] **5. عدم عمل `git push` إطلاقاً إلا بأمر صريح بعد اكتمال واختبار كل الـ Batches.**
- [ ] **6. ممنوع كتابة أي سطر كود قبل اعتماد هذه الخطة بالكامل.**

---

## 2. تقييم جاهزية الباك إند والسياسات المعمارية (Backend Readiness & Architecture Policies)

### 2.1 ما تم اعتماده وتطبيقه في الباك إند بنسبة 100%:
1. **فهارس MongoDB المركبة الكاملة (Compound ESR Indexes):**
   - `{ reviewedUserId: 1, status: 1, createdAt: -1 }` (تسريع الاستعلام الافتراضي للأحدث).
   - `{ reviewedUserId: 1, status: 1, overallRating: -1 }` (تسريع الفرز بالأعلى تقييماً).
   - `{ reviewerId: 1, createdAt: -1 }` (تسريع استعلام تقييماتي المكتوبة).
   - `{ auctionId: 1, reviewerId: 1 }` مع `unique: true` (ضمان عدم تكرار التقييم لنفس المزاد من نفس المستخدم).
   - `{ status: 1, createdAt: 1 }` (فحص مهلة التقييمات المنتهية).
2. **استعلام تقييمات المستخدم (`userReviews`):**
   - يطبق **Option A**: يعيد التقييمات المنشورة `PUBLISHED` فقط لجميع الزوار وصاحب الحساب لضمان أقصى كفاءة لكاش Redis SWR.
   - يدعم Pagination (`page`, `limit`) + Filter (`type`, `minRating`) + Sort (`field: CREATED_AT | RATING`, `order: ASC | DESC`).
3. **استعلام تقييماتي المكتوبة (`myWrittenReviews`):**
   - يعيد كافة حالات التقييمات التي كتبها المستخدم بما فيها `PENDING` لدعم نظام التقييم الأعمى (Blind Review).
   - يدعم Pagination + Filter + Sort.
4. **اشتراك السوكت اللحظي (`reviewAddedToUser`):**
   - يبث الحدث عبر Redis PubSub عند تحول التقييم إلى `PUBLISHED` ويحمل `reviewedUserId` و `review` و `updatedRatingStats` لتحديث البروفايل لحظياً بـ 0ms.
5. **استعلام فحص الأهلية المسبق (`canReviewAuction`):**
   - يعيد `{ canReview: Boolean!, reason: String }` مع رسائل تعليل دقيقة لكل حالة.
6. **استعلام التقييم المفرد (`review(id: ID!)`):**
   - يحلل ويرجع الكيانات المترابطة بالكامل (`reviewer`, `reviewedUser`, `auction`).
7. **مهلة التقييم (TTL Window):**
   - 14 يوماً من تاريخ انتهاء المزاد (`auction.endTime`).

### 2.2 سياسة عرض حالات التقييم (ReviewStatus Policy):
- `PUBLISHED`: يُعرض للعامة كاملاً في كافة القوائم والإحصائيات.
- `PENDING`: يُعرض للمستخدم الكاتب فقط في استعلام `myWrittenReviews` مع شارة صفراء توضيحية "قيد المراجعة / Under Review" (Blind Review حتى يقيّم الطرف الآخر أو تنقضي الـ 14 يوماً).
- `HIDDEN`: مفلتر ومخفي من العرض العام.

---

## 3. العقد البرمجي الكامل للـ GraphQL والأنواع (GraphQL Contracts & Type Safety)

### 3.1 تجنب التعارض واستيراد الأنواع المشتركة
في [reviews.types.ts](file:///d:/Projects/mazadak-frontend/src/features/reviews/types/reviews.types.ts):
```ts
// استيراد مباشر من موديول المستخدمين لمنع تكرار التعريفات وتفادي أي TypeScript Conflicts
import type {
  RatingBreakdown,
  RatingStats as UserRatingStats,
  PublicProfile,
} from '@/features/users/types/users.types';

export type { RatingBreakdown, UserRatingStats, PublicProfile };
```

### 3.2 الكيانات والـ Enums الخاصة بموديول التقييمات
```graphql
enum ReviewType {
  BUYER_TO_SELLER
  SELLER_TO_BUYER
}

enum ReviewStatus {
  PENDING
  PUBLISHED
  HIDDEN
}

enum ReviewsSortField {
  CREATED_AT
  RATING
}

type ReviewCriteria {
  itemAccuracy: Int
  communication: Int
  packaging: Int
  smoothExperience: Int
}

type Review {
  _id: ID!
  auctionId: ID!
  reviewerId: ID!
  reviewedUserId: ID!
  type: ReviewType!
  status: ReviewStatus!
  overallRating: Float!
  criteria: ReviewCriteria
  comment: String
  reply: String
  repliedAt: DateTime
  publishedAt: DateTime
  createdAt: DateTime!
  updatedAt: DateTime!
  reviewer: PublicProfile
  reviewedUser: PublicProfile
  auction: Auction
}

type ReviewsPage {
  items: [Review!]!
  total: Int!
  totalPages: Int!
  hasNextPage: Boolean!
}

type ReviewAddedPayload {
  reviewedUserId: ID!
  review: Review!
  updatedRatingStats: UserRatingStats!
}

type CanReviewAuctionResponse {
  canReview: Boolean!
  reason: String
}
```

### 3.3 استعلامات وطفرات واشتراكات الـ GraphQL
```graphql
# 1. استعلام تقييمات المستخدم مع الفلترة والترتيب والترقيم
query UserReviews(
  $userId: ID!
  $input: PaginationInput
  $filter: ReviewsFilterInput
  $sort: ReviewsSortInput
) {
  userReviews(userId: $userId, input: $input, filter: $filter, sort: $sort) {
    total
    totalPages
    hasNextPage
    items {
      _id
      auctionId
      reviewerId
      reviewedUserId
      type
      status
      overallRating
      criteria { itemAccuracy communication packaging smoothExperience }
      comment
      reply
      repliedAt
      publishedAt
      createdAt
      reviewer { id firstName lastName city ratingStats { averageRating totalReviews } }
      auction { _id title images currentPrice }
    }
  }
}

# 2. استعلام إحصائيات تقييم المستخدم وتوزيع النجوم
query UserRatingStats($userId: ID!) {
  userRatingStats(userId: $userId) {
    averageRating
    totalReviews
    asSellerAverageRating
    asSellerTotalReviews
    asBuyerAverageRating
    asBuyerTotalReviews
    breakdown { oneStar twoStar threeStar fourStar fiveStar }
  }
}

# 3. فحص أهلية تقييم مزاد
query CanReviewAuction($auctionId: ID!) {
  canReviewAuction(auctionId: $auctionId) {
    canReview
    reason
  }
}

# 4. التقييمات التي كتبها المستخدم الحالي
query MyWrittenReviews(
  $input: PaginationInput
  $filter: ReviewsFilterInput
  $sort: ReviewsSortInput
) {
  myWrittenReviews(input: $input, filter: $filter, sort: $sort) {
    total
    totalPages
    hasNextPage
    items {
      _id
      auctionId
      reviewedUserId
      type
      status
      overallRating
      criteria { itemAccuracy communication packaging smoothExperience }
      comment
      reply
      repliedAt
      createdAt
      reviewedUser { id firstName lastName city }
      auction { _id title images currentPrice }
    }
  }
}

# 5. استعلام تقييم مفرد
query GetReview($id: ID!) {
  review(id: $id) {
    _id
    auctionId
    reviewerId
    reviewedUserId
    type
    status
    overallRating
    criteria { itemAccuracy communication packaging smoothExperience }
    comment
    reply
    repliedAt
    publishedAt
    createdAt
    reviewer { id firstName lastName city }
    reviewedUser { id firstName lastName city }
    auction { _id title images currentPrice }
  }
}

# 6. طفرة إنشاء تقييم
mutation CreateReview($input: CreateReviewInput!) {
  createReview(input: $input) {
    _id
    auctionId
    reviewerId
    reviewedUserId
    type
    status
    overallRating
    criteria { itemAccuracy communication packaging smoothExperience }
    comment
    createdAt
  }
}

# 7. طفرة الرد على تقييم
mutation ReplyToReview($input: ReplyReviewInput!) {
  replyToReview(input: $input) {
    _id
    reply
    repliedAt
  }
}

# 8. اشتراك إضافة تقييم لحظي لمستخدم
subscription OnReviewAddedToUser($userId: ID!) {
  reviewAddedToUser(userId: $userId) {
    reviewedUserId
    review {
      _id
      overallRating
      comment
      createdAt
      reviewer { id firstName lastName }
    }
    updatedRatingStats {
      averageRating
      totalReviews
      breakdown { oneStar twoStar threeStar fourStar fiveStar }
    }
  }
}
```

---

## 4. مصفوفة كودات الأخطاء ومعالجتها في الواجهة (Error Handling Matrix)

| كود الخطأ | HTTP Status | السبب والمعنى | ما يعرضه الفرونت إند (مترجم) | الإجراء التصحيحي في الواجهة |
|:---|:---|:---|:---|:---|
| `REVIEW_ALREADY_EXISTS` | 409 Conflict | المستخدم قيّم هذا المزاد مسبقاً | "لقد قمت بتقييم هذا المزاد مسبقاً." | إغلاق الـ Modal وتحديث الكاش لتعطيل زر التقييم |
| `REVIEW_WINDOW_EXPIRED` | 400 Bad Request | انتهت مهلة الـ 14 يوماً بعد انتهاء المزاد | "انتهت المهلة المحددة لتقييم هذه المعاملة (14 يوماً)." | إظهار تنبيه توضيحي وتعطيل زر التقييم |
| `CANNOT_REVIEW_YOURSELF` | 400 Bad Request | محاولة تقييم المستخدم لنفسه | "لا يمكنك تقييم نفسك." | إخفاء زر التقييم تلقائياً |
| `AUCTION_NOT_ELIGIBLE_FOR_REVIEW` | 400 Bad Request | المزاد ليس في حالة مكتملة أو معلق بنزاع | "لا يمكن تقييم هذا المزاد في حالته الحالية." | عرض نص `canReviewAuction.reason` القادم من السيرفر |
| `NOT_AUCTION_PARTICIPANT` | 403 Forbidden | المستخدم ليس المشتري الفائز ولا البائع | "عذراً، التقييم متاح فقط لأطراف المعاملة الفعلية." | منع فتح الـ Modal وإخفاء البانر |
| `REPLY_ALREADY_EXISTS` | 409 Conflict | تم الرد على هذا التقييم مسبقاً | "لقد قمت بالرد على هذا التقييم مسبقاً." | تحديث الكاش لعرض الرد القائم وإخفاء زر الرد |
| `REVIEW_REPLY_FORBIDDEN` | 403 Forbidden | محاولة الرد من غير صاحب الحساب المُقيَّم | "غير مصرح لك بالرد على هذا التقييم." | إخفاء زر الرد فوراً |
| `REVIEW_NOT_FOUND` | 404 Not Found | التقييم المطلوب غير موجود أو محذوف | "التقييم المطلوب غير موجود." | إغلاق النافذة المنبثقة |

---

## 5. القرارات المعمارية القياسية وحلول الدروس المستفادة (10/10 Architecture Decisions)

### القرار 1: التزامن اللحظي المزدوج عبر السوكت (Dual-Channel Real-time Sync & Anti-Loop)
* **المشكلة:** ضمان وصول التقييمات فوراً دون تأخير وبأقصى كفاءة، وتجنب الـ Resubscription Loops التي واجهتنا سابقاً في موديول Bids (Commit `25048c2`).
* **الحل المعماري:**
  1. **القناة العامة للإشعارات (Global Invalidation):** في [SocketContext.tsx](file:///d:/Projects/mazadak-frontend/src/context/SocketContext.tsx) عند استقبال `notificationAdded`:
     ```ts
     if (newNotif.type === 'REVIEW_RECEIVED' || newNotif.type === 'REVIEW_REPLIED') {
       queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REVIEWS.ALL });
       if (newNotif.referenceId) {
         queryClient.invalidateQueries({
           queryKey: QUERY_KEYS.USERS.PUBLIC_PROFILE(newNotif.referenceId),
         });
       }
     }
     ```
  2. **القناة الخاصة بالبروفايل المفتوح (`useReviewSubscription`):**
     - حفظ كائن الخيارات والدوال التابعة داخل `useRef` لمنع إعادة الاشتراك في كل render:
     ```ts
     const optionsRef = useRef(options);
     optionsRef.current = options;

     useEffect(() => {
       if (!userId) return; // حماية من استدعاء السوكت بـ ID فارغ (درس Chat)

       const unsubscribe = reviewsService.subscribeToReviewAddedToUser(userId, {
         next: (payload) => {
           // تحديث مباشر بـ 0ms لإحصائيات المستخدم
           queryClient.setQueryData(
             QUERY_KEYS.REVIEWS.USER_STATS(userId),
             payload.updatedRatingStats
           );
           // إبطال نظيف لقائمة التقييمات لإعادة الجلب بدون مشاكل تكرار
           queryClient.invalidateQueries({
             queryKey: QUERY_KEYS.REVIEWS.USER_REVIEWS(userId),
           });
           optionsRef.current?.onReviewAdded?.(payload);
         },
         error: (err) => console.warn('ReviewAdded subscription error:', err),
       });

       return () => unsubscribe(); // إلزامي لمنع تسريب الذاكرة
     }, [userId, queryClient]); // مصفوفة اعتماديات نظيفة ومستقرة تماماً
     ```

---

### القرار 2: التحقق الاستباقي من الأهلية (`staleTime: 0`)
* **المشكلة:** منع ظهور زر "قيّم تجربتك" لمستخدم قيّم المزاد للتو من جهاز آخر أو انتهت مهلته.
* **الحل:**
  - هوك `useCanReviewAuction(auctionId)` مع `staleTime: 0` لضمان الحصول على أحدث حالة أهلية دائماً.
  - إذا `canReview === true` → عرض `ReviewEligibilityBanner` المميز.
  - إذا `canReview === false` → إخفاء الزر أو عرض الشارة المناسبة وفق السبب.

---

### القرار 3: توضيح نظام التقييم الأعمى وعدم قابلية التعديل (Blind Review UX Clarity)
* **المشكلة:** المستخدم قد يتساءل لماذا لم يظهر تقييمه فوراً في صفحة البائع العامة، أو يبحث عن زر تعديل بعد الإرسال.
* **الحل:**
  - عرض تنبيه واضح داخل `WriteReviewModal`: *"التقييم نهائي وسيتم نشره وفق سياسة التقييم المعتمدة، ولا يمكن تعديله لاحقاً."*
  - إشعار النجاح (Toast Alert): *"تم إرسال تقييمك بنجاح! سيتم نشره تلقائياً فور تقييم الطرف الآخر أو بانقضاء مهلة الـ 14 يوماً."*

---

### القرار 4: عزل بارامتر الترقيم بالـ URL (`reviewPage`) لمنع التعارض
* **المشكلة:** إذا كانت صفحة الملف الشخصي تعرض مزادات المستخدم (`?page=...`) ومراجعاته في نفس الصفحة، فإن استخدام `?page=` للتقييمات سيُحدث تعارضاً في الترقيم.
* **الحل:**
  - دعم `paginationMode?: 'url' | 'local'` (الافتراضي `'url'`).
  - عند ضبط `paginationMode="url"` يتم استخدام `?reviewPage=...` عبر `useSearchParams`.
  - عند ضبط `paginationMode="local"` يتم إدارة الصفحة محلياً عبر `useState(1)` (مناسب للنوافذ المنبثقة والتبويبات المضمنة).

---

### القرار 5: عزل منطق الحسابات في `utils/reviews.utils.ts`
* **المشكلة:** تكرار حساب نسب توزيع النجوم، تقريب أنصاف النجوم، وتنسيق التواريخ والمعايير في أكثر من مكون.
* **الحل:**
  - إنشاء `src/features/reviews/utils/reviews.utils.ts` يحتوي على:
    - `roundToHalfStar(rating: number): number`
    - `calculateBreakdownPercentage(count: number, total: number): number`
    - `getReviewTypeLabel(type: ReviewType, t: TFunction): string`
    - `getCriteriaLabel(key: string, t: TFunction): string`
    - `getReviewStatusBadgeProps(status: ReviewStatus)`

---

### القرار 6: التحقق والتطبيع الصارم عبر Zod (Empty Text Sanitization)
* في `createReview.schema.ts`:
  - `overallRating`: رقم إلزامي من 1 إلى 5 (`z.number().int().min(1).max(5)`).
  - `comment`: حقل نصي اختياري مع تطبيع المسافات البيضاء وتحويل النص الفارغ إلى `undefined` حتى لا يُرسل `""` للسيرفر:
    ```ts
    comment: z.string().trim().max(500).optional().transform((v) => (v && v.length > 0 ? v : undefined))
    ```
* في `replyReview.schema.ts`:
  - `reply`: نص إلزامي من 2 إلى 500 حرف (`z.string().trim().min(2).max(500)`).

---

### القرار 7: ثوابت مفاتيح TanStack Query ومطابقة المفاتيح (Query Keys Factory)
* لتفادي مشكلة الـ Double Array (درس Commit `80bcaf6`):
```ts
REVIEWS: {
  ALL: ['reviews'] as const,
  USER_REVIEWS: (userId: string, page?: number, limit?: number, filter?: unknown, sort?: unknown) =>
    ['reviews', 'user', userId, page, limit, filter, sort] as const,
  USER_STATS: (userId: string) => ['reviews', 'stats', userId] as const,
  CAN_REVIEW: (auctionId: string) => ['reviews', 'can-review', auctionId] as const,
  MY_WRITTEN: (page?: number, limit?: number, filter?: unknown, sort?: unknown) =>
    ['reviews', 'my-written', page, limit, filter, sort] as const,
  DETAIL: (id: string) => ['reviews', 'detail', id] as const,
}
```
* **سياسة الكاش:**
  - `useUserReviews`: `staleTime: 5 * 60 * 1000` (5 دقائق).
  - `useUserRatingStats`: `staleTime: 5 * 60 * 1000` (5 دقائق).
  - `useMyWrittenReviews`: `staleTime: 2 * 60 * 1000` (دقيقتان).
  - `useCanReviewAuction`: `staleTime: 0` (لحظي دائم).

---

## 6. هيكل الملفات الكامل للموديول (Feature Architecture Tree)

```
src/features/reviews/
├── types/
│   └── reviews.types.ts             [NEW — مطابقة كاملة لـ schema.gql واستيراد من users.types]
├── utils/
│   └── reviews.utils.ts             [NEW — دوال حساب النسب والنجوم والترجمات والمعايير]
├── schemas/
│   ├── createReview.schema.ts       [NEW — Zod validation لإنشاء التقييم وتطهير النصوص الفارغة]
│   └── replyReview.schema.ts        [NEW — Zod validation للرد على التقييم]
├── services/
│   └── reviews.service.ts           [NEW — GraphQL Queries, Mutations, & Subscriptions]
├── hooks/
│   ├── useUserReviews.ts            [NEW — استعلام تقييمات المستخدم مع الفلترة والترتيب]
│   ├── useUserRatingStats.ts        [NEW — استعلام الإحصائيات وتوزيع النجوم الخمس]
│   ├── useCanReviewAuction.ts       [NEW — استعلام فحص الأهلية المسبق للمزاد بـ staleTime: 0]
│   ├── useMyWrittenReviews.ts       [NEW — استعلام التقييمات المكتوبة مع الفلترة والترتيب]
│   ├── useReviewSubscription.ts     [NEW — اشتراك السوكت اللحظي الآمن مع optionsRef]
│   ├── useCreateReview.ts           [NEW — طفرة إنشاء تقييم مع إبطال الكاش وتنبيه Blind Review]
│   └── useReplyReview.ts            [NEW — طفرة الرد على تقييم مع إبطال الكاش]
├── components/
│   ├── StarRating.tsx               [NEW — مكون النجوم التفاعلي والثابت مع أنصاف النجوم]
│   ├── RatingBreakdownCard.tsx      [NEW — بطاقة إحصائيات التقييم الشاملة وأشرطة التقدم]
│   ├── CriteriaRatingInput.tsx      [NEW — مكون إدخال معايير التقييم الأربعة التفاعلي]
│   ├── ReviewCard.tsx               [NEW — بطاقة عرض التقييم مع الرد والمعايير وشارات الحالة]
│   ├── MyWrittenReviewCard.tsx      [NEW — بطاقة التقييم المكتوب مع شارة قيد المراجعة الصفراء]
│   ├── ReviewFilters.tsx            [NEW — شريط فلاتر التصنيف BUYER/SELLER والنجوم والترتيب]
│   ├── ReviewSkeleton.tsx           [NEW — هيكل التحميل الشبحي المتوافق مع الثيمات]
│   ├── ReviewEligibilityBanner.tsx  [NEW — بانر التقييم التفاعلي لصفحات المزادات والضمان]
│   ├── WriteReviewModal.tsx         [NEW — نافذة كتابة التقييم المنبثقة المتجاوبة مع تنبيه النهائي]
│   ├── ReplyReviewModal.tsx         [NEW — نافذة الرد على التقييم المنبثقة]
│   └── UserReviewsSection.tsx       [NEW — القسم المجمّع الجاهز للتضمين مع reviewPage URL]
└── index.ts                         [NEW — Barrel Export الموحد لجميع المكونات والخدمات]

src/locales/ar/reviews.json          [NEW — النصوص العربية والتحذيرات والمعايير]
src/locales/en/reviews.json          [NEW — النصوص الإنجليزية والتحذيرات والمعايير]

src/constants/queryKeys.constants.ts [MODIFY — تحديث مفاتيح REVIEWS مبكراً في Batch 1]
src/config/i18n.config.ts            [MODIFY — تسجيل namespace 'reviews' مبكراً في Batch 1]
src/context/SocketContext.tsx        [MODIFY — إضافة invalidation لأحداث التقييمات في Batch 4]
```

---

## 7. خطة التنفيذ التفصيلية بالشرائح الرأسية (Detailed Batches Execution)

```
[ ] Batch 1: البنية الأساسية والمفاتيح والترجمة وبطاقات العرض والإحصائيات
    (queryKeys constants + i18n.config registration + reviews.types + reviews.utils + reviews.service core + useUserReviews + useUserRatingStats + StarRating + RatingBreakdownCard + ReviewCard + ReviewFilters + ReviewSkeleton + index.ts core + i18n ar/en)

[ ] Batch 2: نافذة كتابة التقييم والتحقق الاستباقي من الأهلية
    (createReview.schema + reviews.service extend + useCanReviewAuction + useCreateReview + CriteriaRatingInput + ReviewEligibilityBanner + WriteReviewModal + index.ts extend + i18n ar/en extend)

[ ] Batch 3: نافذة الرد على التقييم وقسم تقييماتي والدمج الموحد
    (replyReview.schema + reviews.service extend + useReplyReview + useMyWrittenReviews + ReplyReviewModal + MyWrittenReviewCard + UserReviewsSection + index.ts extend + i18n ar/en extend)

[ ] Batch 4: التكامل النهائي، مزامنة السوكت المزدوجة، والـ Barrel Export الشامل
    (SocketContext update + useReviewSubscription + index.ts finalize + 4-Gate Global QA)
```

---

### 🔹 Batch 1: البنية الأساسية والمفاتيح والترجمة وبطاقات العرض والإحصائيات

#### المهام التنفيذية:
1. **تحديث [queryKeys.constants.ts](file:///d:/Projects/mazadak-frontend/src/constants/queryKeys.constants.ts):**
   - إضافة كافة مفاتيح `REVIEWS` المعتمدة (`ALL`, `USER_REVIEWS`, `USER_STATS`, `CAN_REVIEW`, `MY_WRITTEN`, `DETAIL`) لضمان عدم حدوث أي أخطاء في الـ TypeScript خلال الـ Hooks.
2. **إنشاء ملفات الترجمة وتسجيلها في [i18n.config.ts](file:///d:/Projects/mazadak-frontend/src/config/i18n.config.ts):**
   - إنشاء `src/locales/ar/reviews.json` و `src/locales/en/reviews.json`.
   - تسجيل الـ Namespace `'reviews'` في `i18n.config.ts` لضمان عمل الترجمة فورياً.
3. **إنشاء [reviews.types.ts](file:///d:/Projects/mazadak-frontend/src/features/reviews/types/reviews.types.ts):**
   - استيراد `RatingBreakdown`, `RatingStats`, `PublicProfile` من `@/features/users/types/users.types`.
   - تعريف `ReviewType`, `ReviewStatus`, `ReviewsSortField`, `ReviewCriteria`, `Review`, `ReviewsPage`, `CanReviewAuctionResponse`, `ReviewAddedPayload`.
   - تعريف مدخلات `ReviewsFilterInput`, `ReviewsSortInput`, `CreateReviewInput`, `ReplyReviewInput`.
4. **إنشاء [reviews.utils.ts](file:///d:/Projects/mazadak-frontend/src/features/reviews/utils/reviews.utils.ts):**
   - دوال تقريب النجوم لأنصاف النجوم `roundToHalfStar`.
   - حساب نسب أشرطة التقدم `calculateBreakdownPercentage`.
   - استخراج تسميات المعايير والأنواع وشارات الحالة.
5. **إنشاء [reviews.service.ts](file:///d:/Projects/mazadak-frontend/src/features/reviews/services/reviews.service.ts) (Core):**
   - استعلام `getUserReviews(userId, input, filter, sort)`.
   - استعلام `getUserRatingStats(userId)`.
   - استعلام `getReviewById(id)`.
6. **إنشاء الـ Hooks:**
   - `useUserReviews`: استعلام TanStack Query مع القيم الافتراضية (`page: 1, limit: 10`, `sort: CREATED_AT DESC`, `staleTime: 5 min`).
   - `useUserRatingStats`: استعلام TanStack Query مع `staleTime: 5 min`.
7. **إنشاء مكونات العرض:**
   - `StarRating.tsx`: رسم النجوم الذهبية التفاعلية أو الثابتة بأحجام مختلفة وعرض دقيق لأنصاف النجوم.
   - `RatingBreakdownCard.tsx`: عرض المتوسط الكبير، النجوم، وتوزيع الـ 5 نجوم بأشرطة تقدم متدرجة ونسب مئوية، مع التبديل بين كبائع / كمشتري.
   - `ReviewCard.tsx`: بطاقة المراجعة مع صورة الكاتب، شارة نوع التقييم، النجوم، المعايير التفصيلية، وتاريخ التقييم، وفقاعة رد البائع.
   - `ReviewFilters.tsx`: أزرار الفلترة بنوع التقييم، فلتر النجوم الأدنى، وقائمة الترتيب.
   - `ReviewSkeleton.tsx`: شاشات التحميل الشبحي المتجاوبة.
8. **إنشاء [index.ts](file:///d:/Projects/mazadak-frontend/src/features/reviews/index.ts) (Core):**
   - تصدير أولي لكافة مكونات وهوكس وأنواع Batch 1.

#### فحص الجودة لـ Batch 1:
- [ ] `npm run lint` → 0 errors
- [ ] `npx tsc --noEmit` → 0 errors
- [ ] `npm run build` → Build successful
- [ ] فحص النجوم، التقسيمات، أشرطة التقدم، والـ Dark/Light mode بصرياً.
- [ ] **انتظار موافقة المطور ("OK" / "تمام") → عمل `git commit -m "feat(reviews): implement queryKeys, i18n, display components, rating breakdown card, and data hooks"`**

---

### 🔹 Batch 2: نافذة كتابة التقييم والتحقق الاستباقي من الأهلية

#### المهام التنفيذية:
1. **إنشاء [createReview.schema.ts](file:///d:/Projects/mazadak-frontend/src/features/reviews/schemas/createReview.schema.ts):**
   - `overallRating`: رقم إلزامي من 1 إلى 5.
   - `criteria`: معايير اختيارية من 1 إلى 5 لكل من (`itemAccuracy`, `communication`, `packaging`, `smoothExperience`).
   - `comment`: نص اختياري حتى 500 حرف مع `.transform(v => (v && v.length > 0 ? v : undefined))` لتطهير النصوص الفارغة.
2. **توسيع [reviews.service.ts](file:///d:/Projects/mazadak-frontend/src/features/reviews/services/reviews.service.ts):**
   - إضافة دالة `canReviewAuction(auctionId)`.
   - إضافة دالة `createReview(input)`.
3. **إنشاء الـ Hooks:**
   - `useCanReviewAuction(auctionId)`: مع `staleTime: 0`.
   - `useCreateReview()`: طفرة الإرسال مع معالجة الأخطاء وإبطال الكاش وإظهار رسالة الـ Blind Review الواضحة.
4. **إنشاء المكونات:**
   - `CriteriaRatingInput.tsx`: تحكم بالنجوم للمعايير التفصيلية الأربعة مع نصوص استرشادية.
   - `WriteReviewModal.tsx`: نافذة التقييم الفاخرة مع النجوم التفاعلية، المعايير، حقل التعليق، عداد الأحرف (0/500)، وتنبيه "التقييم نهائي".
   - `ReviewEligibilityBanner.tsx`: بانر سياقي لصفحات المزادات والضمان يفتح الـ Modal فوراً عند الأهلية.
5. **توسيع الترجمات في `ar/reviews.json` و `en/reviews.json`.**
6. **توسيع [index.ts](file:///d:/Projects/mazadak-frontend/src/features/reviews/index.ts):**
   - تصدير مكونات وهوكس Batch 2.

#### فحص الجودة لـ Batch 2:
- [ ] `npm run lint` → 0 errors
- [ ] `npx tsc --noEmit` → 0 errors
- [ ] `npm run build` → Build successful
- [ ] فحص تفاعل إدخال النجوم والمعايير والتحقق من الأخطاء في النموذج.
- [ ] **انتظار موافقة المطور ("OK" / "تمام") → عمل `git commit -m "feat(reviews): add write review modal, criteria rating inputs, and eligibility checking"`**

---

### 🔹 Batch 3: نافذة الرد على التقييم وقسم تقييماتي والدمج الموحد

#### المهام التنفيذية:
1. **إنشاء [replyReview.schema.ts](file:///d:/Projects/mazadak-frontend/src/features/reviews/schemas/replyReview.schema.ts):**
   - `reply`: نص إلزامي من 2 إلى 500 حرف مع `.trim()`.
2. **توسيع [reviews.service.ts](file:///d:/Projects/mazadak-frontend/src/features/reviews/services/reviews.service.ts):**
   - إضافة دالة `replyToReview(input)`.
   - إضافة دالة `getMyWrittenReviews(input, filter, sort)`.
3. **إنشاء الـ Hooks:**
   - `useReplyReview()`: طفرة إرسال الرد وتحديث الكاش فورياً.
   - `useMyWrittenReviews(input, filter, sort)`: استعلام التقييمات المكتوبة.
4. **إنشاء المكونات:**
   - `ReplyReviewModal.tsx`: نافذة رد البائع مع عرض التعليق الأصلي وحقل الرد وعداد الحروف.
   - `MyWrittenReviewCard.tsx`: بطاقة التقييم المكتوب مع شارة "قيد المراجعة" للحالات `PENDING`.
   - `UserReviewsSection.tsx`: **المكون الرئيسي الجامع للموديول**:
     - يقبل `userId: string`, `currentUserId?: string`, `showWriteReviewBanner?: boolean`, و `paginationMode?: 'url' | 'local'`.
     - عند وضع `url` يستخدم بارامتر `?reviewPage=` لمنع أي تضارب مع ترقيم المزادات.
     - يدمج الهيدر `RatingBreakdownCard`، الفلاتر `ReviewFilters`، بطاقات `ReviewCard`، والترقيم `Pagination`.
     - يتيح فتح `ReplyReviewModal` للبائع مباشرة.
5. **توسيع الترجمات في `ar/reviews.json` و `en/reviews.json`.**
6. **توسيع [index.ts](file:///d:/Projects/mazadak-frontend/src/features/reviews/index.ts):**
   - تصدير مكونات وهوكس Batch 3.

#### فحص الجودة لـ Batch 3:
- [ ] `npm run lint` → 0 errors
- [ ] `npx tsc --noEmit` → 0 errors
- [ ] `npm run build` → Build successful
- [ ] فحص نافذة الرد، فحص بطاقات التقييمات المكتوبة، وفحص `UserReviewsSection` بنمطي الترقيم.
- [ ] **انتظار موافقة المطور ("OK" / "تمام") → عمل `git commit -m "feat(reviews): implement reply review modal, my written reviews, and embeddable user reviews section"`**

---

### 🔹 Batch 4: التكامل النهائي، مزامنة السوكت المزدوجة، والـ Barrel Export الشامل

#### المهام التنفيذية:
1. **توسيع [reviews.service.ts](file:///d:/Projects/mazadak-frontend/src/features/reviews/services/reviews.service.ts) باشتراك السوكت:**
   - إضافة دالة `subscribeToReviewAddedToUser(userId, observer)`.
2. **إنشاء [useReviewSubscription.ts](file:///d:/Projects/mazadak-frontend/src/features/reviews/hooks/useReviewSubscription.ts):**
   - تطبيق نمط حماية الـ Loop عبر `optionsRef`.
   - حماية الـ ID الفارغ `if (!userId) return;`.
   - تحديث مباشر لإحصائيات النجوم `USER_STATS` وإبطال `USER_REVIEWS`.
3. **تحديث [SocketContext.tsx](file:///d:/Projects/mazadak-frontend/src/context/SocketContext.tsx):**
   - ربط إبطال كاش `QUERY_KEYS.REVIEWS.ALL` و `QUERY_KEYS.USERS.PUBLIC_PROFILE` عند استقبال إشعارات `REVIEW_RECEIVED` أو `REVIEW_REPLIED`.
4. **تحديث [index.ts](file:///d:/Projects/mazadak-frontend/src/features/reviews/index.ts) النهائي:**
   - تصدير شامل ومكتمل لكافة الأدوات والمكونات والخدمات والأنواع.
5. **الفحص الشامل للبوابات الأربع (The 4-Gate Quality Verification):**
   - [ ] البوابة 1: `npm run lint` → 0 errors, 0 warnings.
   - [ ] البوابة 2: `npx tsc --noEmit` → 0 errors.
   - [ ] البوابة 3: `npm run build` → Build successful بدون أي تحذيرات.
   - [ ] البوابة 4: التحقق العملي في المتصفح (النجوم، النوافذ، الإحصائيات، الفلاتر، التجاوب، Dark/Light Mode، RTL/LTR).

#### فحص الجودة لـ Batch 4:
- [ ] اكتمال كافة البوابات بنجاح 100%.
- [ ] **انتظار موافقة المطور ("OK" / "تمام") → عمل `git commit -m "feat(reviews): complete reviews module with full socket sync, barrel exports, and 4-gate verification"`**

---

## 8. مصفوفة التحقق اليدوي الشاملة (Comprehensive Manual Verification Matrix)

| السيناريو التجريبي | النتيجة المتوقعة | كيفية التحقق في المتصفح والـ DevTools |
|:---|:---|:---|
| **1. فحص أهلية مستخدم مؤهل للتقييم** | يعيد `canReview: true` ويظهر بانر `ReviewEligibilityBanner` المميز مع زر "قيّم تجربتك". | فحص استعلام GraphQL وظهور البانر في الواجهة. |
| **2. فحص أهلية مستخدم غير مؤهل (`canReview: false`)** | يعيد `canReview: false` مع سبب واضح (مثل: لم ينتهِ المزاد أو لست طرفاً)، ويختفي زر التقييم أو تظهر رسالة التوضيح. | فحص حقل `reason` في رد الـ Query وعدم فتح الـ Modal. |
| **3. فتح نافذة التقييم وإرسال تقييم بمعايير تفصيلية** | فتح `WriteReviewModal`، تحديد التقييم الكلي ونجوم المعايير، كتابة التعليق (مع عداد الأحرف 0/500)، إرسال ناجح عبر `createReview`، إغلاق المودال وظهور Toast النجاح مع رسالة توضيح الـ Blind Review. | مراقبة شبكة GraphQL، واختفاء الـ Modal وتحديث الكاش. |
| **4. نظام التقييم الأعمى (Blind Review State)** | التقييم المرسل يظهر في `myWrittenReviews` بشارة "قيد المراجعة" الصفراء حتى يقيّم الطرف الآخر أو تنقضي الـ 14 يوماً. | فحص حالة التقييم `status: PENDING` وظهور الشارة المخصصة. |
| **5. الرد على تقييم مستلم** | فتح `ReplyReviewModal` للبائع، كتابة الرد، إرساله عبر `replyToReview`، وظهور فقاعة الرد فوراً أسفل بطاقة التقييم مع توقيت الرد. | مراقبة Network payload وتحديث بطاقة التقييم فورياً. |
| **6. الفلترة والتصنيف والترتيب** | التبديل بين تابات (الكل / كبائع / كمشتري)، واختيار الحد الأدنى للنجوم (4+ نجوم)، والترتيب بالأعلى تقييماً. | فحص ردود الـ GraphQL وانعكاس الفلاتر على القائمة والترقيم. |
| **7. استلام تحديث لحظي عبر السوكت (`reviewAddedToUser`)** | عند نشر تقييم جديد للبروفايل المفتوح، يستقبل السوكت الحدث ويتم تحديث بطاقة الإحصائيات `RatingBreakdownCard` والقائمة بـ 0ms وبدون أي Loop أو إعادة اتصال مكررة. | فحص WS Frames في DevTools وتحديث أرقام النجوم مباشرة. |
| **8. التحقق من نمطي الترقيم (`url` vs `local`)** | عند ضبط `paginationMode="url"` يتغير عنوان الصفحة `?reviewPage=2` بدون مساس بـ `page` الخاص بالمزادات، وعند ضبط `"local"` تتغير الصفحة داخلياً دون المساس بالـ URL. | فحص شريط العنوان في المتصفح والتنقل بين الصفحات. |
| **9. فحص الثيمات واللغات والتجاوب (Dark/Light + RTL/LTR + Mobile)** | تناسق تام للألوان الذهبية والزجاجية، محاذاة صحيحة للغة العربية، وتجاوب سلس على الشاشات من 360px إلى 4K. | فحص DevTools Responsive Mode وتبديل اللغات والثيمات. |
