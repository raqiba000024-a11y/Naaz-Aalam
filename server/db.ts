import fs from 'fs';
import path from 'path';
import { Product, Category, User, Order, Coupon, ProductReview, StoreSettings } from '../src/types/index.js';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export interface DatabaseSchema {
  products: Product[];
  categories: Category[];
  users: (User & { passwordHash: string })[];
  orders: Order[];
  reviews: ProductReview[];
  coupons: Coupon[];
  settings: StoreSettings;
}

const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-audio',
    slug: 'audio',
    name: 'High-Fidelity Audio',
    description: 'Acoustic mastery engineered with aerospace alloys and beryllium drivers.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
    itemCount: 4,
  },
  {
    id: 'cat-horology',
    slug: 'horology',
    name: 'Haute Horlogerie',
    description: 'Precision mechanical timepieces crafted with sapphire crystals and hand-finished calibers.',
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80',
    itemCount: 4,
  },
  {
    id: 'cat-leather',
    slug: 'leather-goods',
    name: 'Leather & Travel',
    description: 'Full-grain Tuscan vegetable-tanned leather essentials built to patina gracefully.',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80',
    itemCount: 3,
  },
  {
    id: 'cat-fragrance',
    slug: 'fragrance',
    name: 'Artisanal Fragrance',
    description: 'Rare botanical extractions and bespoke amber accords bottled in minimalist glass.',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=80',
    itemCount: 3,
  },
  {
    id: 'cat-eyewear',
    slug: 'eyewear',
    name: 'Optical & Eyewear',
    description: 'Japanese titanium and hand-beveled Italian acetate frames with polarized mineral lenses.',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=80',
    itemCount: 2,
  },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-01',
    slug: 'aura-soundmaster-pro-headphones',
    name: 'AURA Master One Wireless Headphones',
    tagline: 'Custom 45mm Beryllium Drivers with Active Spatial Acoustic Calibration',
    description: 'Engineered for audio purists, the Master One merges CNC-machined anodized aluminum gimbals with buttery lambskin memory cushions. Features 42-hour continuous lossless wireless playback, ultra-low-distortion DSP, and hybrid feedforward noise isolation that adapts to your ear anatomy in real-time.',
    story: 'Conceived in collaboration with sound engineers from Abbey Road and finished in our Copenhagen laboratory, each component is calibrated by ear before laser serialisation.',
    brand: 'AURA Audio Lab',
    category: 'audio',
    price: 495,
    originalPrice: 590,
    stock: 24,
    rating: 4.9,
    reviewCount: 38,
    featured: true,
    trending: true,
    bestSeller: true,
    isNew: false,
    flashSale: {
      discountPercent: 16,
      endsAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    },
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=85',
    ],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    variants: [
      {
        id: 'var-01-dark',
        name: 'Space Graphite & Obsidian',
        colorHex: '#1f2937',
        sku: 'AURA-AUD-01-GRPH',
        price: 495,
        originalPrice: 590,
        stock: 14,
      },
      {
        id: 'var-01-silver',
        name: 'Brushed Silver & Ecru',
        colorHex: '#e5e7eb',
        sku: 'AURA-AUD-01-SLVR',
        price: 495,
        originalPrice: 590,
        stock: 10,
      },
    ],
    attributes: {
      material: 'Aircraft-grade 7075 Aluminum & Lambskin',
      origin: 'Designed in Copenhagen, Hand-tuned in Germany',
      warranty: '3-Year Global Atelier Guarantee',
      batteryLife: '42 Hours Lossless Wireless (USB-C Fast Charge)',
      weight: '318 grams',
      dimensions: '190 x 175 x 80 mm',
    },
    careInstructions: 'Clean leather earcups with conditioned damp microfiber. Store in the included molded magnetic leather case.',
    tags: ['audio', 'wireless', 'audiophile', 'noise-cancelling', 'best-seller'],
    createdAt: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'prod-02',
    slug: 'chronos-monolith-automatic-titanium-watch',
    name: 'Chronos Monolith Automatic Watch',
    tagline: 'Grade 5 Titanium Monobloc Case with High-Beat Swiss Caliber',
    description: 'An architectural study in horological minimalism. The Monolith features an ultra-thin 8.8mm profile milled from solid Grade 5 aerospace titanium, an antireflective double-domed sapphire crystal, and an automatic mechanical movement with 68 hours of reserve power.',
    story: 'Hand-assembled in the Jura Mountains. The stark matte sandblasted dial plays subtly with natural light, featuring heat-blued seconds hand and Super-LumiNova BGW9 indices.',
    brand: 'Chronos Atelier',
    category: 'horology',
    price: 1850,
    originalPrice: 2200,
    stock: 9,
    rating: 5.0,
    reviewCount: 22,
    featured: true,
    trending: true,
    bestSeller: false,
    isNew: true,
    images: [
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1200&q=85',
    ],
    variants: [
      {
        id: 'var-02-slate',
        name: 'Matte Titanium & Saddle Leather',
        colorHex: '#4b5563',
        sku: 'CHRONO-MONO-TIT-01',
        price: 1850,
        originalPrice: 2200,
        stock: 5,
      },
      {
        id: 'var-02-mesh',
        name: 'Titanium Milanese Mesh Bracelet',
        colorHex: '#9ca3af',
        sku: 'CHRONO-MONO-TIT-02',
        price: 2050,
        originalPrice: 2450,
        stock: 4,
      },
    ],
    attributes: {
      material: 'Grade 5 Titanium & Domed Sapphire Crystal',
      movement: 'Swiss High-Beat Automatic 28,800 vph',
      origin: 'Le Locle, Switzerland',
      warranty: '5-Year International Movement Guarantee',
      waterResistance: '100m / 10 ATM',
      dimensions: '39mm diameter, 8.8mm thickness',
    },
    careInstructions: 'Rinse with fresh water after saltwater exposure. Have seals inspected triennially.',
    tags: ['horology', 'automatic', 'titanium', 'luxury', 'swiss-made'],
    createdAt: '2026-02-01T10:00:00.000Z',
  },
  {
    id: 'prod-03',
    slug: 'atelier-tuscany-weekender-leather-duffle',
    name: 'Via Condotti 48H Weekender Duffle',
    tagline: 'Hand-burnished Full-Grain Tuscan Saddle Leather with Solid Brass Hardware',
    description: 'Cut from premium French hides and vegetable-tanned over forty days in San Miniato, Tuscany. Designed for discerning travelers, featuring a separate ventilated shoe compartment, padded 16-inch laptop cocoon, and dual Raccagni zippers that glide effortlessly.',
    story: 'No synthetic linings or cardboard stiffeners. Every stitch is secured using durable waxed linen thread, ensuring this heirloom piece will develop a magnificent deep amber patina over decades.',
    brand: 'Atelier Pellame',
    category: 'leather-goods',
    price: 680,
    originalPrice: 795,
    stock: 15,
    rating: 4.95,
    reviewCount: 45,
    featured: true,
    trending: false,
    bestSeller: true,
    isNew: false,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1559563458-527698bf5295?auto=format&fit=crop&w=1200&q=85',
    ],
    variants: [
      {
        id: 'var-03-cognac',
        name: 'Rich Cognac Amber',
        colorHex: '#9a3412',
        sku: 'ATELIER-DUF-CGN',
        price: 680,
        originalPrice: 795,
        stock: 8,
      },
      {
        id: 'var-03-espresso',
        name: 'Dark Espresso Brown',
        colorHex: '#451a03',
        sku: 'ATELIER-DUF-ESP',
        price: 680,
        originalPrice: 795,
        stock: 7,
      },
    ],
    attributes: {
      material: 'Vegetable-Tanned Full Grain Tuscan Leather & Raw Brass',
      origin: 'Florence, Italy',
      warranty: 'Lifetime Craftsmanship Guarantee',
      dimensions: '52 x 28 x 25 cm (Carry-on compliant)',
      weight: '1.85 kg',
    },
    careInstructions: 'Apply organic beeswax leather balm once every autumn. Avoid prolonged water immersion.',
    tags: ['leather', 'travel', 'weekender', 'luggage', 'handcrafted'],
    createdAt: '2026-01-20T11:00:00.000Z',
  },
  {
    id: 'prod-04',
    slug: 'solstice-noir-eau-de-parfum-extract',
    name: 'Solstice Noir Extrait de Parfum',
    tagline: 'Aged Bourbon Vetiver, Smoked Guaiacwood & Black Amber Accords',
    description: 'An evocative olfactory portrait of twilight over Nordic pine forests. Concentrated at an opulent 30% extrait concentration, Solstice Noir opens with bergamot mist and pink pepper before descending into velvety heart notes of cedar resin and golden frankincense.',
    story: 'Macerated for twelve months in Grasse, France. Poured into hand-polished heavy basalt-tinted flacons sealed with an engraved magnetic cap.',
    brand: 'Maison Noirceur',
    category: 'fragrance',
    price: 240,
    originalPrice: 280,
    stock: 32,
    rating: 4.88,
    reviewCount: 29,
    featured: false,
    trending: true,
    bestSeller: true,
    isNew: false,
    images: [
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1200&q=85',
    ],
    variants: [
      {
        id: 'var-04-100ml',
        name: '100ml Flacon Fluted Glass',
        size: '100ml / 3.4 fl. oz.',
        sku: 'FRAG-SOLST-100',
        price: 240,
        originalPrice: 280,
        stock: 22,
      },
      {
        id: 'var-04-50ml',
        name: '50ml Travel Atelier Atomizer',
        size: '50ml / 1.7 fl. oz.',
        sku: 'FRAG-SOLST-50',
        price: 155,
        originalPrice: 180,
        stock: 10,
      },
    ],
    attributes: {
      origin: 'Grasse, France',
      concentration: 'Extrait de Parfum (30% pure perfume oil)',
      topNotes: 'Calabrian Bergamot, Pink Peppercorn, Wild Juniper',
      heartNotes: 'Bourbon Vetiver, Iris Root, Smoked Guaiacwood',
      baseNotes: 'Black Amber, Cistus Labdanum, White Cedar',
    },
    careInstructions: 'Store away from direct sunlight in a temperate environment.',
    tags: ['fragrance', 'niche', 'perfume', 'unisex', 'vetiver'],
    createdAt: '2026-02-10T14:00:00.000Z',
  },
  {
    id: 'prod-05',
    slug: 'kyoto-titanium-optical-spectacles',
    name: 'Kyoto Beta-Titanium Round Spectacles',
    tagline: 'Featherlight 9-gram Monoblock Frame with Hand-Polished Bevels',
    description: 'Forged in Sabae, Japan—the world cradle of precision eyewear. Milled from single sheets of ultra-flexible beta-titanium that exerts gentle, uniform pressure without screw degradation. Paired with anti-reflective Zeiss blue-light filtering lenses.',
    brand: 'Sabae Optical',
    category: 'eyewear',
    price: 380,
    originalPrice: 440,
    stock: 18,
    rating: 4.92,
    reviewCount: 16,
    featured: false,
    trending: false,
    bestSeller: false,
    isNew: true,
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=1200&q=85',
    ],
    variants: [
      {
        id: 'var-05-gunmetal',
        name: 'Matte Gunmetal Titanium',
        colorHex: '#374151',
        sku: 'OPT-KYO-GUN',
        price: 380,
        originalPrice: 440,
        stock: 11,
      },
      {
        id: 'var-05-gold',
        name: 'Brushed Champagne Gold',
        colorHex: '#d97706',
        sku: 'OPT-KYO-GLD',
        price: 380,
        originalPrice: 440,
        stock: 7,
      },
    ],
    attributes: {
      material: '100% Japanese Beta-Titanium',
      origin: 'Fukui / Sabae, Japan',
      weight: '9.2 grams',
      lenses: 'Zeiss Duravision Clear AR Coated',
      dimensions: '48mm lens width, 21mm bridge, 145mm temple',
    },
    careInstructions: 'Clean with included ultrasonic microfiber pouch and alcohol-free solution.',
    tags: ['eyewear', 'titanium', 'japanese-craft', 'minimalist'],
    createdAt: '2026-02-18T10:00:00.000Z',
  },
  {
    id: 'prod-06',
    slug: 'lumiere-portable-tactile-sound-lantern',
    name: 'Lumière Brass & Acoustic Lantern',
    tagline: 'Omnidirectional 360° Studio Sound Integrated with Warm Candlelight Glow',
    description: 'An evocative centerpiece combining warm 2200K filament OLED illumination with dual balanced-armature sound radiators. Machined from solid brushed brass with an integrated capacitive dimmer ring.',
    brand: 'AURA Audio Lab',
    category: 'audio',
    price: 340,
    originalPrice: 395,
    stock: 20,
    rating: 4.87,
    reviewCount: 31,
    featured: true,
    trending: true,
    bestSeller: false,
    isNew: false,
    images: [
      'https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=85',
    ],
    variants: [
      {
        id: 'var-06-brass',
        name: 'Living Raw Brass',
        colorHex: '#ca8a04',
        sku: 'LUM-LANT-BRS',
        price: 340,
        originalPrice: 395,
        stock: 12,
      },
      {
        id: 'var-06-black',
        name: 'Anodized Matte Onyx',
        colorHex: '#18181b',
        sku: 'LUM-LANT-BLK',
        price: 340,
        originalPrice: 395,
        stock: 8,
      },
    ],
    attributes: {
      material: 'Machined Solid Brass & Borosilicate Glass',
      origin: 'Stockholm, Sweden',
      batteryLife: '18 Hours Audio + Illumination',
      connectivity: 'Bluetooth 5.3 aptX Adaptive & Auracast',
      waterResistance: 'IPX5 Splash-Resistant',
    },
    careInstructions: 'Raw brass will develop a unique patina over time. Polish with metal cloth if desired.',
    tags: ['audio', 'lighting', 'scandinavian', 'portable', 'speaker'],
    createdAt: '2026-01-25T12:00:00.000Z',
  },
  {
    id: 'prod-07',
    slug: 'geneva-perpetual-desk-chronometer',
    name: 'Geneva Architectural Desk Chronometer',
    tagline: 'Visible Skeleton Escapement in Beveled Optical Crystal Cube',
    description: 'A sculptural table timepiece designed for architect studios and executive libraries. The 8-day mechanical clock movement beats in hypnotic rhythm behind six hand-polished optical crystal facets.',
    brand: 'Chronos Atelier',
    category: 'horology',
    price: 1250,
    originalPrice: 1450,
    stock: 6,
    rating: 5.0,
    reviewCount: 11,
    featured: false,
    trending: false,
    bestSeller: false,
    isNew: false,
    images: [
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=85',
    ],
    variants: [
      {
        id: 'var-07-crystal',
        name: 'Optical Crystal & Rhodium Plating',
        colorHex: '#cbd5e1',
        sku: 'CHR-DESK-RHO',
        price: 1250,
        originalPrice: 1450,
        stock: 6,
      },
    ],
    attributes: {
      material: 'K9 Optical Crystal & Rhodium-Plated Brass',
      movement: '8-Day Manual Wind In-House Caliber',
      origin: 'Geneva, Switzerland',
      dimensions: '140 x 140 x 140 mm',
      weight: '3.4 kg',
    },
    careInstructions: 'Wound once weekly with the included ergonomic engraved brass key.',
    tags: ['horology', 'clock', 'desk-decor', 'sculpture', 'swiss'],
    createdAt: '2026-02-05T09:00:00.000Z',
  },
  {
    id: 'prod-08',
    slug: 'florentine-minimalist-card-wallet',
    name: 'Florentine Minimalist Slim Cardholder',
    tagline: 'Ultra-slim 4mm Saddle Stitched Shell Cordovan with RFID Shield',
    description: 'Hand-sewn from prized Horween Shell Cordovan, known for its mirror-like luster and near-indestructible grain. Holds up to 8 cards and folded currency with seamless ease.',
    brand: 'Atelier Pellame',
    category: 'leather-goods',
    price: 145,
    originalPrice: 175,
    stock: 28,
    rating: 4.9,
    reviewCount: 42,
    featured: false,
    trending: false,
    bestSeller: true,
    isNew: false,
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=85',
    ],
    variants: [
      {
        id: 'var-08-burgundy',
        name: 'Color No. 8 Deep Burgundy',
        colorHex: '#4a0404',
        sku: 'PEL-CARD-BUR',
        price: 145,
        originalPrice: 175,
        stock: 16,
      },
      {
        id: 'var-08-black',
        name: 'Onyx Black Glazed Cordovan',
        colorHex: '#18181b',
        sku: 'PEL-CARD-BLK',
        price: 145,
        originalPrice: 175,
        stock: 12,
      },
    ],
    attributes: {
      material: 'Genuine Shell Cordovan Leather',
      origin: 'Florence, Italy',
      warranty: 'Lifetime Stitch Guarantee',
      dimensions: '100 x 70 x 4 mm',
    },
    careInstructions: 'Buff occasionally with horsehair brush. Natural oils within cordovan will maintain shine.',
    tags: ['leather', 'wallet', 'cardholder', 'accessories', 'cordovan'],
    createdAt: '2026-01-10T15:00:00.000Z',
  },
];

const INITIAL_REVIEWS: ProductReview[] = [
  {
    id: 'rev-01',
    productId: 'prod-01',
    userName: 'Marcus Sterling',
    userEmail: 'marcus.s@invest.co',
    rating: 5,
    title: 'Transcendental acoustic stage',
    comment: 'Having owned Sennheiser HD800s and Focal Clears for mixing, I was skeptical of a wireless headphone. The Master One stunned me. The detail resolution in the upper registers and separation of string instruments is pristine without fatigue. Build quality is sublime.',
    verifiedPurchase: true,
    createdAt: '2026-02-14T11:20:00.000Z',
    helpfulCount: 19,
  },
  {
    id: 'rev-02',
    productId: 'prod-01',
    userName: 'Claire Delacroix',
    userEmail: 'c.delacroix@paris.fr',
    rating: 5,
    title: 'Exquisite ergonomic comfort',
    comment: 'The lambskin memory pads do not pinch even during 8-hour transatlantic flights. Noise cancellation is remarkably gentle—no cabin pressure feeling. Worth every single cent.',
    verifiedPurchase: true,
    createdAt: '2026-02-28T16:45:00.000Z',
    helpfulCount: 8,
  },
  {
    id: 'rev-03',
    productId: 'prod-02',
    userName: 'Julian Vance',
    userEmail: 'julian@vance.design',
    rating: 5,
    title: 'Purist horology perfection',
    comment: 'The 8.8mm thickness slips effortlessly underneath double cuffs. The sandblasted titanium finish has a warm, tactile presence that stainless steel simply cannot replicate. Keeps within +1.8 seconds per day.',
    verifiedPurchase: true,
    createdAt: '2026-03-02T09:12:00.000Z',
    helpfulCount: 14,
  },
  {
    id: 'rev-04',
    productId: 'prod-03',
    userName: 'David Thorne',
    userEmail: 'thorne.d@architect.uk',
    rating: 5,
    title: 'The ultimate gentleman weekender',
    comment: 'Carried this through Rome, London, and Tokyo. The scent of genuine Tuscan vegetable leather is intoxicating. Beautiful solid brass zip that never catches.',
    verifiedPurchase: true,
    createdAt: '2026-02-19T14:30:00.000Z',
    helpfulCount: 23,
  },
];

const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'coup-01',
    code: 'AURA10',
    description: '10% atelier courtesy on all premier collections',
    discountType: 'percentage',
    discountValue: 10,
    minSpend: 0,
    isActive: true,
    usageCount: 142,
  },
  {
    id: 'coup-02',
    code: 'WELCOME20',
    description: '20% off for prospective collectors on orders over $250',
    discountType: 'percentage',
    discountValue: 20,
    minSpend: 250,
    isActive: true,
    usageCount: 89,
  },
  {
    id: 'coup-03',
    code: 'VIP50',
    description: '$50 instant atelier credit on orders exceeding $400',
    discountType: 'fixed',
    discountValue: 50,
    minSpend: 400,
    isActive: true,
    usageCount: 47,
  },
];

const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'AURA Atelier',
  tagline: 'World-Class Craftsmanship & High-Fidelity Living',
  announcementText: 'Complimentary insured courier delivery & signature gift packaging on all orders over $150',
  announcementActive: true,
  freeShippingThreshold: 150,
  standardShippingFee: 15,
  expressShippingFee: 35,
  whiteGloveShippingFee: 75,
  gstRate: 0.18, // 18% standard
  currencySymbol: '$',
  currencyCode: 'USD',
  supportEmail: 'concierge@aura-atelier.store',
  supportPhone: '+1 (800) 428-AURA',
  allowGuestCheckout: true,
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return parsed;
      }
    } catch (err) {
      console.warn('Could not read existing db.json, re-initializing...', err);
    }

    // Initialize fresh seed
    const adminPasswordHash = bcrypt.hashSync('Admin@Aura2026!', 10);
    const customerPasswordHash = bcrypt.hashSync('Customer123!', 10);

    const initialUsers = [
      {
        id: 'usr-admin-01',
        email: 'admin@aura-atelier.com',
        fullName: 'Atelier Director',
        role: 'admin' as const,
        phone: '+1 (415) 555-0199',
        passwordHash: adminPasswordHash,
        addresses: [
          {
            fullName: 'Atelier Director',
            street: '450 Sutter St, Suite 1200',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94108',
            country: 'United States',
            phone: '+1 (415) 555-0199',
            isDefault: true,
          },
        ],
        wishlistIds: ['prod-01', 'prod-02'],
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'usr-cust-01',
        email: 'elena.vance@atelier.com',
        fullName: 'Elena Vance',
        role: 'customer' as const,
        phone: '+1 (212) 555-0144',
        passwordHash: customerPasswordHash,
        addresses: [
          {
            fullName: 'Elena Vance',
            street: '740 Park Avenue, Apt 11B',
            city: 'New York',
            state: 'NY',
            postalCode: '10021',
            country: 'United States',
            phone: '+1 (212) 555-0144',
            isDefault: true,
          },
        ],
        wishlistIds: ['prod-03'],
        createdAt: '2026-01-10T12:00:00.000Z',
      },
    ];

    const initialOrders: Order[] = [
      {
        id: 'ord-8801',
        orderNumber: 'AURA-2026-8801',
        userId: 'usr-cust-01',
        guestEmail: undefined,
        items: [
          {
            productId: 'prod-01',
            productName: 'AURA Master One Wireless Headphones',
            productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
            variantName: 'Space Graphite & Obsidian',
            quantity: 1,
            unitPrice: 495,
            totalPrice: 495,
          },
        ],
        shippingAddress: {
          fullName: 'Elena Vance',
          street: '740 Park Avenue, Apt 11B',
          city: 'New York',
          state: 'NY',
          postalCode: '10021',
          country: 'United States',
          phone: '+1 (212) 555-0144',
        },
        shippingMethod: {
          id: 'express',
          name: 'Complimentary Insured Courier',
          price: 0,
          estimatedDays: '2-3 Business Days',
        },
        pricing: {
          subtotal: 495,
          discount: 49.5,
          couponCode: 'AURA10',
          tax: 80.19,
          shippingFee: 0,
          total: 525.69,
        },
        payment: {
          method: 'card',
          status: 'paid',
          transactionId: 'TXN-AURA-8801-92B',
          paidAt: '2026-03-01T14:22:00.000Z',
          last4: '4242',
        },
        status: 'in_transit' as any,
        timeline: [
          {
            status: 'pending',
            label: 'Order Verified',
            description: 'Payment authorized via verified 3D-Secure gateway.',
            timestamp: '2026-03-01T14:22:00.000Z',
            completed: true,
          },
          {
            status: 'processing',
            label: 'Atelier Calibration',
            description: 'Acoustic testing and serial number logging.',
            timestamp: '2026-03-01T16:40:00.000Z',
            completed: true,
          },
          {
            status: 'quality_check',
            label: 'Hand-Packaging Inspection',
            description: 'Sealed with signature wax atelier seal.',
            timestamp: '2026-03-02T10:15:00.000Z',
            completed: true,
          },
          {
            status: 'shipped',
            label: 'Handed to Carrier',
            description: 'Transferred to DHL Express International.',
            timestamp: '2026-03-02T18:00:00.000Z',
            completed: true,
          },
          {
            status: 'out_for_delivery',
            label: 'Out for Courier Delivery',
            description: 'Courier assigned for local destination route.',
            timestamp: '',
            completed: false,
          },
          {
            status: 'delivered',
            label: 'Delivered & Signed',
            description: 'Recipient signature confirmed.',
            timestamp: '',
            completed: false,
          },
        ],
        trackingNumber: 'AURA-DHL-9948210492',
        carrier: 'DHL Express Premier',
        createdAt: '2026-03-01T14:22:00.000Z',
        updatedAt: '2026-03-02T18:00:00.000Z',
      },
    ];

    const freshData: DatabaseSchema = {
      products: INITIAL_PRODUCTS,
      categories: INITIAL_CATEGORIES,
      users: initialUsers,
      orders: initialOrders,
      reviews: INITIAL_REVIEWS,
      coupons: INITIAL_COUPONS,
      settings: INITIAL_SETTINGS,
    };

    this.saveData(freshData);
    return freshData;
  }

  private saveData(data: DatabaseSchema): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
      this.data = data;
    } catch (err) {
      console.error('Error saving database:', err);
    }
  }

  public getProducts(filter?: {
    category?: string;
    search?: string;
    tag?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
  }): Product[] {
    let result = [...this.data.products];

    if (filter?.category && filter.category !== 'all') {
      result = result.filter(p => p.category.toLowerCase() === filter.category!.toLowerCase());
    }

    if (filter?.tag) {
      result = result.filter(p => p.tags.includes(filter.tag!));
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase().trim();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (filter?.minPrice !== undefined) {
      result = result.filter(p => p.price >= filter.minPrice!);
    }

    if (filter?.maxPrice !== undefined) {
      result = result.filter(p => p.price <= filter.maxPrice!);
    }

    if (filter?.sort) {
      switch (filter.sort) {
        case 'price-asc':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          result.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'popular':
        default:
          result.sort((a, b) => (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0));
          break;
      }
    }

    return result;
  }

  public getProductBySlugOrId(idOrSlug: string): Product | undefined {
    return this.data.products.find(p => p.id === idOrSlug || p.slug === idOrSlug);
  }

  public addProduct(product: Omit<Product, 'id' | 'createdAt'>): Product {
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.data.products.unshift(newProduct);
    this.saveData(this.data);
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.products[idx] = { ...this.data.products[idx], ...updates };
    this.saveData(this.data);
    return this.data.products[idx];
  }

  public deleteProduct(id: string): boolean {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    if (this.data.products.length !== initialLen) {
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  public getCategories(): Category[] {
    return this.data.categories;
  }

  public getUserByEmail(email: string) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserById(id: string) {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(userData: {
    email: string;
    fullName: string;
    passwordHash: string;
    role?: 'customer' | 'admin';
    phone?: string;
  }): User {
    const newUser = {
      id: `usr-${Date.now()}`,
      email: userData.email.toLowerCase(),
      fullName: userData.fullName,
      role: userData.role || 'customer',
      phone: userData.phone,
      passwordHash: userData.passwordHash,
      addresses: [],
      wishlistIds: [],
      createdAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.saveData(this.data);
    const { passwordHash, ...cleanUser } = newUser;
    return cleanUser;
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.saveData(this.data);
    const { passwordHash, ...cleanUser } = this.data.users[idx];
    return cleanUser;
  }

  public getAllUsers(): User[] {
    return this.data.users.map(({ passwordHash, ...u }) => u);
  }

  public getOrders(userId?: string): Order[] {
    if (userId) {
      return this.data.orders.filter(o => o.userId === userId);
    }
    return [...this.data.orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getOrderByIdOrTracking(query: string): Order | undefined {
    return this.data.orders.find(
      o => o.id === query || o.orderNumber === query || o.trackingNumber === query
    );
  }

  public createOrder(orderInput: Omit<Order, 'id' | 'orderNumber' | 'timeline' | 'trackingNumber' | 'carrier' | 'createdAt' | 'updatedAt'>): Order {
    const timestamp = Date.now();
    const orderNumber = `AURA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const trackingNumber = `AURA-EXP-${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    const newOrder: Order = {
      ...orderInput,
      id: `ord-${timestamp}`,
      orderNumber,
      carrier: 'DHL Express Premier Air',
      trackingNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          status: 'pending',
          label: 'Order Placed & Verified',
          description: `Payment confirmed via ${orderInput.payment.method.toUpperCase()} gateway.`,
          timestamp: new Date().toISOString(),
          completed: true,
        },
        {
          status: 'processing',
          label: 'Atelier Processing & Allocation',
          description: 'Items allocated and assigned to packaging team.',
          timestamp: new Date(timestamp + 30 * 60 * 1000).toISOString(),
          completed: false,
        },
        {
          status: 'quality_check',
          label: 'Master Artisan Quality Check',
          description: 'Acoustic / material inspection and custom verification certificate.',
          timestamp: '',
          completed: false,
        },
        {
          status: 'shipped',
          label: 'Dispatched with Carrier',
          description: 'Handed over for secure global tracking transit.',
          timestamp: '',
          completed: false,
        },
        {
          status: 'out_for_delivery',
          label: 'Out for Courier Delivery',
          description: 'En route with local delivery executive.',
          timestamp: '',
          completed: false,
        },
        {
          status: 'delivered',
          label: 'Delivered & Confirmed',
          description: 'Package delivered at designated shipping address.',
          timestamp: '',
          completed: false,
        },
      ],
    };

    // Decrement stock for ordered products
    for (const item of newOrder.items) {
      const prod = this.data.products.find(p => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
        if (item.variantName) {
          const variant = prod.variants.find(v => v.name === item.variantName);
          if (variant) {
            variant.stock = Math.max(0, variant.stock - item.quantity);
          }
        }
      }
    }

    this.data.orders.unshift(newOrder);
    this.saveData(this.data);
    return newOrder;
  }

  public updateOrderStatus(orderId: string, status: Order['status']): Order | null {
    const order = this.data.orders.find(o => o.id === orderId || o.orderNumber === orderId);
    if (!order) return null;

    order.status = status;
    order.updatedAt = new Date().toISOString();

    // Update timeline completion
    const statusOrder: Order['status'][] = [
      'pending',
      'processing',
      'quality_check',
      'shipped',
      'out_for_delivery',
      'delivered',
    ];
    const currentIndex = statusOrder.indexOf(status);

    order.timeline.forEach((step, idx) => {
      if (idx <= currentIndex) {
        step.completed = true;
        if (!step.timestamp) step.timestamp = new Date().toISOString();
      }
    });

    this.saveData(this.data);
    return order;
  }

  public getReviewsForProduct(productId: string): ProductReview[] {
    return this.data.reviews
      .filter(r => r.productId === productId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addReview(review: Omit<ProductReview, 'id' | 'createdAt' | 'helpfulCount'>): ProductReview {
    const newReview: ProductReview = {
      ...review,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
      helpfulCount: 0,
    };
    this.data.reviews.unshift(newReview);

    // Recalculate product rating
    const allReviews = this.getReviewsForProduct(review.productId);
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    const prod = this.data.products.find(p => p.id === review.productId);
    if (prod) {
      prod.rating = Number(avg.toFixed(1));
      prod.reviewCount = allReviews.length;
    }

    this.saveData(this.data);
    return newReview;
  }

  public getCoupons(): Coupon[] {
    return this.data.coupons;
  }

  public getCouponByCode(code: string): Coupon | undefined {
    return this.data.coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
  }

  public createCoupon(coupon: Omit<Coupon, 'id' | 'usageCount'>): Coupon {
    const newCoupon: Coupon = {
      ...coupon,
      code: coupon.code.toUpperCase(),
      id: `coup-${Date.now()}`,
      usageCount: 0,
    };
    this.data.coupons.push(newCoupon);
    this.saveData(this.data);
    return newCoupon;
  }

  public toggleCoupon(id: string): Coupon | null {
    const coupon = this.data.coupons.find(c => c.id === id);
    if (!coupon) return null;
    coupon.isActive = !coupon.isActive;
    this.saveData(this.data);
    return coupon;
  }

  public getSettings(): StoreSettings {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<StoreSettings>): StoreSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.saveData(this.data);
    return this.data.settings;
  }

  public getAnalytics() {
    const totalRevenue = this.data.orders.reduce((sum, o) => sum + (o.pricing.total || 0), 0);
    const totalOrders = this.data.orders.length;
    const totalCustomers = this.data.users.filter(u => u.role === 'customer').length;
    const totalProducts = this.data.products.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Category breakdown
    const categoryCounts: Record<string, number> = {};
    const categoryRevenue: Record<string, number> = {};
    for (const order of this.data.orders) {
      for (const item of order.items) {
        const prod = this.data.products.find(p => p.id === item.productId);
        const cat = prod?.category || 'general';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + item.quantity;
        categoryRevenue[cat] = (categoryRevenue[cat] || 0) + item.totalPrice;
      }
    }

    return {
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      avgOrderValue,
      categoryCounts,
      categoryRevenue,
      recentOrders: this.data.orders.slice(0, 5),
    };
  }
}

export const db = new Database();
