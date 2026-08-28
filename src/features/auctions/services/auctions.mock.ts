import type { Auction } from '../types/auctions.types';

const now = new Date();
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const MOCK_AUCTIONS: Auction[] = [
  // 1. WATCHES - ACTIVE (Ending in 45 seconds for Urgent < 1 min Red Flame Test!)
  {
    _id: 'auc-demo-2',
    sellerId: 'user-seller-2',
    title: 'Rolex Daytona Cosmograph 116500LN Panda (ساعة رولكس دايتونا)',
    description:
      'Iconic Rolex Daytona with white dial (Panda), black Cerachrom bezel, Oystersteel bracelet. Full set with box and 2022 warranty card. ساعة رولكس دايتونا أصلية بكافة أوراقها.',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=1000&q=80',
    ],
    category: 'WATCHES',
    startingPrice: '850000',
    minimumBidIncrement: '10000',
    currentPrice: '990000',
    status: 'ACTIVE',
    startTime: new Date(now.getTime() - 1 * DAY).toISOString(),
    endTime: new Date(now.getTime() + 45 * 1000).toISOString(), // 45s (Urgent Red Flame Demo)
    winnerId: null,
    isFinalized: false,
    createdAt: new Date(now.getTime() - 2 * DAY).toISOString(),
    updatedAt: new Date(now.getTime() - 10 * 1000).toISOString(),
  },

  // 2. MOTORCYCLES - ACTIVE (Ending in 25 minutes for Near-End < 1 hr Orange Clock Test!)
  {
    _id: 'auc-demo-6',
    sellerId: 'user-seller-2',
    title: 'Ducati Panigale V4 S 2023 Corse Livery (دراجة دوكاتي بانيجالي)',
    description:
      '1,103cc Desmosedici Stradale engine with 215.5 hp, Ohlins Smart EC 2.0 electronic suspension, Akrapovic full titanium exhaust. دراجة دوكاتي رياضية خارقة بحالة الزيرو.',
    images: [
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1000&q=80',
    ],
    category: 'MOTORCYCLES',
    startingPrice: '820000',
    minimumBidIncrement: '10000',
    currentPrice: '890000',
    status: 'ACTIVE',
    startTime: new Date(now.getTime() - 18 * HOUR).toISOString(),
    endTime: new Date(now.getTime() + 25 * MINUTE).toISOString(), // 25 min (Near-End Orange Clock Demo)
    winnerId: null,
    isFinalized: false,
    createdAt: new Date(now.getTime() - 1 * DAY).toISOString(),
    updatedAt: new Date(now.getTime() - 5 * MINUTE).toISOString(),
  },

  // 3. CARS - ACTIVE
  {
    _id: 'auc-demo-1',
    sellerId: 'user-seller-1',
    title: 'Mercedes-Benz G63 AMG 2023 - Obsidian Black (مرسيدس جي 63)',
    description:
      'Brand new luxury SUV with full carbon fiber package, red leather interior, 4.0L V8 Biturbo engine with 577 hp. Only 3,500 km. سيارة مرسيدس جي 63 بحالة الوكالة مع صيانة كاملة وضمان ساري.',
    images: [
      'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1000&q=80',
    ],
    category: 'CARS',
    startingPrice: '4500000',
    minimumBidIncrement: '50000',
    currentPrice: '5200000',
    status: 'ACTIVE',
    startTime: new Date(now.getTime() - 2 * DAY).toISOString(),
    endTime: new Date(now.getTime() + 5 * HOUR + 30 * MINUTE).toISOString(),
    winnerId: null,
    isFinalized: false,
    createdAt: new Date(now.getTime() - 3 * DAY).toISOString(),
    updatedAt: new Date(now.getTime() - 10 * MINUTE).toISOString(),
  },

  // 4. REAL_ESTATE - ACTIVE (Ends in 2 days -> tests "يومان")
  {
    _id: 'auc-demo-3',
    sellerId: 'user-seller-4',
    title: 'Modern Luxury Villa - New Cairo Golden Square (فيلا فاخرة بالتجمع الخامس)',
    description:
      'Standalone luxury villa (650 sqm) with private infinity pool, landscaped garden, smart home automation, 5 master suites. فيلا مستقلة بحمام سباحة خاص وحديقة في موقع متميز.',
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80',
    ],
    category: 'REAL_ESTATE',
    startingPrice: '28000000',
    minimumBidIncrement: '250000',
    currentPrice: '31500000',
    status: 'ACTIVE',
    startTime: new Date(now.getTime() - 3 * DAY).toISOString(),
    endTime: new Date(now.getTime() + 2 * DAY + 6 * HOUR).toISOString(),
    winnerId: null,
    isFinalized: false,
    createdAt: new Date(now.getTime() - 4 * DAY).toISOString(),
    updatedAt: new Date(now.getTime() - 2 * HOUR).toISOString(),
  },

  // 5. ELECTRONICS - ACTIVE (Ends in 1 day -> tests "يوم")
  {
    _id: 'auc-demo-4',
    sellerId: 'user-seller-1',
    title: 'Apple MacBook Pro 16" M3 Max Space Black (ماك بوك برو 16 إنش)',
    description:
      'M3 Max 16-Core CPU, 40-Core GPU, 64GB Unified RAM, 2TB SSD. Liquid Retina XDR display, pristine condition with 12 battery cycles. جهاز ماك بوك برو بأعلى مواصفات مع كرتونته الأصلية.',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=1000&q=80',
    ],
    category: 'ELECTRONICS',
    startingPrice: '140000',
    minimumBidIncrement: '2500',
    currentPrice: '162500',
    status: 'ACTIVE',
    startTime: new Date(now.getTime() - 12 * HOUR).toISOString(),
    endTime: new Date(now.getTime() + 1 * DAY + 4 * HOUR).toISOString(),
    winnerId: null,
    isFinalized: false,
    createdAt: new Date(now.getTime() - 1 * DAY).toISOString(),
    updatedAt: new Date(now.getTime() - 1 * HOUR).toISOString(),
  },

  // 6. JEWELRY - ACTIVE (Ends in 4 days -> tests "4 أيام")
  {
    _id: 'auc-demo-5',
    sellerId: 'user-seller-3',
    title: '18K White Gold Diamond Solitaire Ring 3.5 Carat (خاتم ألماس سوليتير)',
    description:
      'GIA certified 3.50 carat natural diamond ring, VVS1 clarity, E color, round brilliant cut set in 18k white gold. خاتم ألماس سوليتير نقي مع شهادة GIA المعتمدة.',
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=1000&q=80',
    ],
    category: 'JEWELRY',
    startingPrice: '950000',
    minimumBidIncrement: '15000',
    currentPrice: '1120000',
    status: 'ACTIVE',
    startTime: new Date(now.getTime() - 1 * DAY).toISOString(),
    endTime: new Date(now.getTime() + 4 * DAY).toISOString(),
    winnerId: null,
    isFinalized: false,
    createdAt: new Date(now.getTime() - 2 * DAY).toISOString(),
    updatedAt: new Date(now.getTime() - 30 * MINUTE).toISOString(),
  },

  // 7. ART - ACTIVE
  {
    _id: 'auc-demo-7',
    sellerId: 'user-seller-5',
    title: 'Contemporary Abstract Canvas "Echoes of Sahara" (لوحة تشكيلية معاصرة)',
    description:
      'Large original mixed media on linen canvas (180x120cm) by acclaimed Egyptian contemporary master. Signed and dated. لوحة زيتية أصلية موقعة مع شهادة الأصالة.',
    images: [
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1000&q=80',
    ],
    category: 'ART',
    startingPrice: '120000',
    minimumBidIncrement: '3000',
    currentPrice: '145000',
    status: 'ACTIVE',
    startTime: new Date(now.getTime() - 2 * DAY).toISOString(),
    endTime: new Date(now.getTime() + 12 * HOUR).toISOString(),
    winnerId: null,
    isFinalized: false,
    createdAt: new Date(now.getTime() - 3 * DAY).toISOString(),
    updatedAt: new Date(now.getTime() - 2 * HOUR).toISOString(),
  },

  // 8. ANTIQUES - PENDING (Starts in 2 days)
  {
    _id: 'auc-demo-8',
    sellerId: 'user-seller-3',
    title: '19th Century French Empire Gilt Bronze Clock (ساعة فرنسية أثرية مذهبة)',
    description:
      'Museum-quality antique French mantel clock with 8-day mechanical movement, fine gilding, mythological sculpture. ساعة فرنسية أثرية من البرونز المذهب بحالة متحفية نادرة.',
    images: [
      'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80',
    ],
    category: 'ANTIQUES',
    startingPrice: '320000',
    minimumBidIncrement: '5000',
    currentPrice: '320000',
    status: 'PENDING',
    startTime: new Date(now.getTime() + 2 * DAY).toISOString(),
    endTime: new Date(now.getTime() + 7 * DAY).toISOString(),
    winnerId: null,
    isFinalized: false,
    createdAt: new Date(now.getTime() - 1 * DAY).toISOString(),
    updatedAt: new Date(now.getTime() - 1 * DAY).toISOString(),
  },

  // 9. CARS - PENDING (Starts in 1 day)
  {
    _id: 'auc-demo-9',
    sellerId: 'user-seller-1',
    title: 'Porsche 911 GT3 RS 2024 Guards Red (سيارة بورش 911 جي تي 3)',
    description:
      'Weissach package with magnesium wheels, carbon ceramic brakes (PCCB), front axle lift. 0 km delivery mileage. بورش 911 جي تي 3 بأعلى باقة أداء وزيرو كيلومتر.',
    images: [
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80',
    ],
    category: 'CARS',
    startingPrice: '12500000',
    minimumBidIncrement: '100000',
    currentPrice: '12500000',
    status: 'PENDING',
    startTime: new Date(now.getTime() + 1 * DAY + 2 * HOUR).toISOString(),
    endTime: new Date(now.getTime() + 5 * DAY).toISOString(),
    winnerId: null,
    isFinalized: false,
    createdAt: new Date(now.getTime() - 12 * HOUR).toISOString(),
    updatedAt: new Date(now.getTime() - 12 * HOUR).toISOString(),
  },

  // 10. WATCHES - PENDING (Starts in 3 days)
  {
    _id: 'auc-demo-10',
    sellerId: 'user-seller-2',
    title: 'Patek Philippe Nautilus 5711/1A Blue Dial (ساعة باتيك فيليب نوتيلوس)',
    description:
      'Legendary stainless steel Patek Philippe Nautilus with gradient blue dial, caliber 324 S C movement. Full set with certificate of origin. ساعة باتيك فيليب الأصلية الأكثر طلباً بالعالم.',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1000&q=80',
    ],
    category: 'WATCHES',
    startingPrice: '3800000',
    minimumBidIncrement: '50000',
    currentPrice: '3800000',
    status: 'PENDING',
    startTime: new Date(now.getTime() + 3 * DAY).toISOString(),
    endTime: new Date(now.getTime() + 8 * DAY).toISOString(),
    winnerId: null,
    isFinalized: false,
    createdAt: new Date(now.getTime() - 2 * DAY).toISOString(),
    updatedAt: new Date(now.getTime() - 2 * DAY).toISOString(),
  },

  // 11. COLLECTIBLES - ACTIVE
  {
    _id: 'auc-demo-11',
    sellerId: 'user-seller-4',
    title: 'Michael Jordan 1986 Fleer Rookie Card PSA 9 (كارت مايكل جوردان الأسطوري)',
    description:
      'Ultra rare pristine 1986 Fleer #57 Michael Jordan rookie basketball card graded PSA 9 Mint. كارت مايكل جوردان النادر والموثق بشهادة PSA العالمية.',
    images: [
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1000&q=80',
    ],
    category: 'COLLECTIBLES',
    startingPrice: '450000',
    minimumBidIncrement: '5000',
    currentPrice: '510000',
    status: 'ACTIVE',
    startTime: new Date(now.getTime() - 1 * DAY).toISOString(),
    endTime: new Date(now.getTime() + 1 * DAY + 10 * HOUR).toISOString(),
    winnerId: null,
    isFinalized: false,
    createdAt: new Date(now.getTime() - 2 * DAY).toISOString(),
    updatedAt: new Date(now.getTime() - 5 * HOUR).toISOString(),
  },

  // 12. FASHION - ACTIVE
  {
    _id: 'auc-demo-12',
    sellerId: 'user-seller-5',
    title: 'Hermès Birkin 30 Togo Leather Gold (حقيبة هيرميس بيركين أصلية)',
    description:
      'Authentic Hermès Birkin 30 in Noir (Black) Togo calfskin with gleaming gold plated hardware. Never worn (Store Fresh) with full box and dustbag. حقيبة هيرميس بيركين الأصلية جديدة تماماً.',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80',
    ],
    category: 'FASHION',
    startingPrice: '780000',
    minimumBidIncrement: '10000',
    currentPrice: '840000',
    status: 'ACTIVE',
    startTime: new Date(now.getTime() - 2 * DAY).toISOString(),
    endTime: new Date(now.getTime() + 2 * DAY).toISOString(),
    winnerId: null,
    isFinalized: false,
    createdAt: new Date(now.getTime() - 3 * DAY).toISOString(),
    updatedAt: new Date(now.getTime() - 3 * HOUR).toISOString(),
  },

  // 13. FURNITURE - PENDING (Starts in 1 day)
  {
    _id: 'auc-demo-13',
    sellerId: 'user-seller-3',
    title: 'Chesterfield Oxblood Leather Sofa Set (طقم صالون تشيسترفيلد جلد طبيعي)',
    description:
      'Handcrafted genuine top-grain English leather buttoned sofa set with solid mahogany frame. طقم صالون تشيسترفيلد جلد طبيعي فاخر مستورد بحالة ممتازة.',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80',
    ],
    category: 'FURNITURE',
    startingPrice: '180000',
    minimumBidIncrement: '3000',
    currentPrice: '180000',
    status: 'PENDING',
    startTime: new Date(now.getTime() + 1 * DAY).toISOString(),
    endTime: new Date(now.getTime() + 6 * DAY).toISOString(),
    winnerId: null,
    isFinalized: false,
    createdAt: new Date(now.getTime() - 1 * DAY).toISOString(),
    updatedAt: new Date(now.getTime() - 1 * DAY).toISOString(),
  },

  // 14. HOME_APPLIANCES - ACTIVE
  {
    _id: 'auc-demo-14',
    sellerId: 'user-seller-1',
    title: 'La Marzocco Linea Mini Espresso Machine (ماكينة قهوة لا مارزوكو إيطالية)',
    description:
      'Handmade in Florence, dual boilers, integrated paddle, IoT connectivity. Stainless steel finish with walnut wood custom accents. ماكينة قهوة إيطالية احترافية للمحترفين.',
    images: [
      'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80',
    ],
    category: 'HOME_APPLIANCES',
    startingPrice: '210000',
    minimumBidIncrement: '2500',
    currentPrice: '235000',
    status: 'ACTIVE',
    startTime: new Date(now.getTime() - 12 * HOUR).toISOString(),
    endTime: new Date(now.getTime() + 1 * DAY).toISOString(),
    winnerId: null,
    isFinalized: false,
    createdAt: new Date(now.getTime() - 1 * DAY).toISOString(),
    updatedAt: new Date(now.getTime() - 4 * HOUR).toISOString(),
  },

  // 15. SPORTS - ACTIVE (Ends in 14 days -> tests "14 يوم")
  {
    _id: 'auc-demo-15',
    sellerId: 'user-seller-2',
    title: 'Pinarello Dogma F12 Carbon Racing Bike (دراجة سباق بيناريلو كربون)',
    description:
      'Torayca T1100 1K Dream Carbon frame, Shimano Dura-Ace Di2 electronic group, DT Swiss carbon wheels. دراجة سباق هوائية كربونية فائقة السرعة.',
    images: [
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=1000&q=80',
    ],
    category: 'SPORTS',
    startingPrice: '290000',
    minimumBidIncrement: '5000',
    currentPrice: '290000',
    status: 'ACTIVE',
    startTime: new Date(now.getTime() - 1 * DAY).toISOString(),
    endTime: new Date(now.getTime() + 14 * DAY).toISOString(), // 14 days
    winnerId: null,
    isFinalized: false,
    createdAt: new Date(now.getTime() - 2 * DAY).toISOString(),
    updatedAt: new Date(now.getTime() - 2 * DAY).toISOString(),
  },

  // 16. BOOKS - PENDING (Starts in 3 days)
  {
    _id: 'auc-demo-16',
    sellerId: 'user-seller-4',
    title: 'First Edition Description de l\'Egypte 1809 (كتاب وصف مصر الطبعة الأولى الأصلية)',
    description:
      'Monumental first imperial edition commissioned by Napoleon Bonaparte, complete with copperplate engravings and historic maps. مجلد الطبعة الأولى الأثرية من كتاب وصف مصر.',
    images: [
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1000&q=80',
    ],
    category: 'BOOKS',
    startingPrice: '650000',
    minimumBidIncrement: '10000',
    currentPrice: '650000',
    status: 'PENDING',
    startTime: new Date(now.getTime() + 3 * DAY).toISOString(),
    endTime: new Date(now.getTime() + 8 * DAY).toISOString(),
    winnerId: null,
    isFinalized: false,
    createdAt: new Date(now.getTime() - 2 * DAY).toISOString(),
    updatedAt: new Date(now.getTime() - 2 * DAY).toISOString(),
  },

  // 17. TOYS - ACTIVE
  {
    _id: 'auc-demo-17',
    sellerId: 'user-seller-5',
    title: 'LEGO Star Wars Millennium Falcon 75192 (مجسم ليجو ميلينيوم فالكون الأصلي)',
    description:
      'Brand new sealed collector edition with 7,541 pieces, certificate of authenticity. مجسم ليجو جامع الإصدار الخاص مختوم بحالته الأصلية.',
    images: [
      'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?auto=format&fit=crop&w=1000&q=80',
    ],
    category: 'TOYS',
    startingPrice: '42000',
    minimumBidIncrement: '1000',
    currentPrice: '49000',
    status: 'ACTIVE',
    startTime: new Date(now.getTime() - 2 * DAY).toISOString(),
    endTime: new Date(now.getTime() + 1 * DAY + 8 * HOUR).toISOString(),
    winnerId: null,
    isFinalized: false,
    createdAt: new Date(now.getTime() - 3 * DAY).toISOString(),
    updatedAt: new Date(now.getTime() - 6 * HOUR).toISOString(),
  },

  // 18. CARS - ENDED
  {
    _id: 'auc-demo-18',
    sellerId: 'user-seller-1',
    title: 'BMW M5 Competition 2022 Marina Bay Blue (سيارة بي إم دبليو إم 5)',
    description:
      '4.4L TwinPower Turbo V8 with 617 hp, M Carbon ceramic brakes, Bowers & Wilkins audio. سيارة بي إم دبليو إم 5 بحالة ممتازة وانتهى المزاد بنجاح.',
    images: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1000&q=80',
    ],
    category: 'CARS',
    startingPrice: '3800000',
    minimumBidIncrement: '50000',
    currentPrice: '4450000',
    status: 'ENDED',
    startTime: new Date(now.getTime() - 8 * DAY).toISOString(),
    endTime: new Date(now.getTime() - 1 * DAY).toISOString(),
    winnerId: '64abc1234567890abcdef123',
    isFinalized: true,
    createdAt: new Date(now.getTime() - 9 * DAY).toISOString(),
    updatedAt: new Date(now.getTime() - 1 * DAY).toISOString(),
  },

  // 19. WATCHES - ENDED
  {
    _id: 'auc-demo-19',
    sellerId: 'user-seller-2',
    title: 'Audemars Piguet Royal Oak Jumbo 15202ST (ساعة أوديمار بيغيه رويال أوك)',
    description:
      'Ultra-thin 39mm stainless steel case with "Petite Tapisserie" blue dial. Full collector set. ساعة أوديمار بيغيه رويال أوك الشهيرة بيعت بنجاح.',
    images: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1547996160-71dfabbce5ed?auto=format&fit=crop&w=1000&q=80',
    ],
    category: 'WATCHES',
    startingPrice: '2100000',
    minimumBidIncrement: '25000',
    currentPrice: '2650000',
    status: 'ENDED',
    startTime: new Date(now.getTime() - 5 * DAY).toISOString(),
    endTime: new Date(now.getTime() - 2 * DAY).toISOString(),
    winnerId: '64abc9999999999abcdef999',
    isFinalized: true,
    createdAt: new Date(now.getTime() - 6 * DAY).toISOString(),
    updatedAt: new Date(now.getTime() - 2 * DAY).toISOString(),
  },

  // 20. ART - ENDED
  {
    _id: 'auc-demo-20',
    sellerId: 'user-seller-5',
    title: 'Bronze Sculpture "The Nile Dancer" Signed (تمثال برونزي أصلي راقصة النيل)',
    description:
      'Solid lost-wax cast bronze sculpture on black marble base by renowned Egyptian sculptor. تمثال برونزي نقي موقع وموثق.',
    images: [
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1000&q=80',
    ],
    category: 'ART',
    startingPrice: '85000',
    minimumBidIncrement: '2000',
    currentPrice: '115000',
    status: 'ENDED',
    startTime: new Date(now.getTime() - 10 * DAY).toISOString(),
    endTime: new Date(now.getTime() - 3 * DAY).toISOString(),
    winnerId: '64abc1234567890abcdef123',
    isFinalized: true,
    createdAt: new Date(now.getTime() - 11 * DAY).toISOString(),
    updatedAt: new Date(now.getTime() - 3 * DAY).toISOString(),
  },
];
