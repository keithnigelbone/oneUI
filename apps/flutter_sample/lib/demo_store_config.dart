import 'demo_app_settings.dart';
import 'demo_peoplefirst_data.dart';
import 'demo_product_catalog.dart';
import 'demo_tira_catalog.dart';

/// One curated storefront demo (JioMart, Tira, …).
class DemoStoreConfig {
  const DemoStoreConfig({
    required this.id,
    required this.hubTitle,
    required this.hubDescription,
    required this.logoAlt,
    required this.searchPlaceholder,
    required this.products,
    required this.coupons,
    required this.categoryChips,
    required this.categoryShortcuts,
    required this.gridSectionTitle,
    required this.cartDividerLabel,
    required this.profileEmail,
    required this.couponPlaceholder,
    required this.freeDeliveryThreshold,
    required this.initialSettings,
    this.promoBanner,
  });

  final String id;
  final String hubTitle;
  final String hubDescription;
  final String logoAlt;
  final String searchPlaceholder;
  final List<DemoProduct> products;
  final Map<String, DemoCoupon> coupons;
  final List<DemoCategoryChip> categoryChips;
  final List<DemoCategoryShortcut> categoryShortcuts;
  final String gridSectionTitle;
  final String cartDividerLabel;
  final String profileEmail;
  final String couponPlaceholder;
  final int freeDeliveryThreshold;
  final DemoAppSettings initialSettings;
  final String? promoBanner;
}

class DemoCategoryChip {
  const DemoCategoryChip({required this.value, required this.label});

  final String value;
  final String label;
}

class DemoCategoryShortcut {
  const DemoCategoryShortcut({required this.label, required this.icon});

  final String label;
  final String icon;
}

class DemoCoupon {
  const DemoCoupon({
    required this.label,
    required this.discount,
    required this.message,
  });

  final String label;
  final int discount;
  final String message;
}

final kJioMartStoreConfig = DemoStoreConfig(
  id: 'jiomart',
  hubTitle: 'JioMart Demo',
  hubDescription:
      'Grocery & daily essentials storefront — browse, cart, coupons, and checkout.',
  logoAlt: 'JioMart',
  searchPlaceholder: 'Search products',
  products: kDemoProducts,
  coupons: {
    'SAVE50': DemoCoupon(
      label: 'SAVE50',
      discount: 50,
      message: '₹50 off applied',
    ),
    'FREEDEL': DemoCoupon(
      label: 'FREEDEL',
      discount: 0,
      message: 'Free delivery unlocked',
    ),
  },
  categoryChips: [
    DemoCategoryChip(value: 'all', label: 'All'),
    DemoCategoryChip(value: 'grocery', label: 'Grocery'),
    DemoCategoryChip(value: 'fresh', label: 'Fresh'),
    DemoCategoryChip(value: 'personal', label: 'Personal care'),
    DemoCategoryChip(value: 'electronics', label: 'Electronics'),
  ],
  categoryShortcuts: [
    DemoCategoryShortcut(label: 'Grocery', icon: 'home'),
    DemoCategoryShortcut(label: 'Fresh', icon: 'sun'),
    DemoCategoryShortcut(label: 'Deals', icon: 'starFilled'),
    DemoCategoryShortcut(label: 'Secure', icon: 'lock'),
  ],
  gridSectionTitle: 'Top deals',
  cartDividerLabel: 'Quick Delivery · Groceries',
  profileEmail: 'swapnil@jiomart.com',
  couponPlaceholder: 'Enter coupon (SAVE50, FREEDEL)',
  freeDeliveryThreshold: 199,
  initialSettings: DemoAppSettings(
    brandSlug: 'jio',
    brandPickerLabel: 'Jio',
    accentAppearance: 'primary',
    mode: 'light',
    platformId: 'S-360',
  ),
);

final kTiraStoreConfig = DemoStoreConfig(
  id: 'tira',
  hubTitle: 'Tira Beauty Demo',
  hubDescription:
      'Makeup, skin, hair & fragrance — inspired by tirabeauty.com with full shop flow.',
  logoAlt: 'Tira',
  searchPlaceholder: 'Search makeup, skin, hair',
  products: kTiraProducts,
  coupons: {
    'TIRA500': DemoCoupon(
      label: 'TIRA500',
      discount: 500,
      message: '₹500 off on your first order',
    ),
    'FREEDEL': DemoCoupon(
      label: 'FREEDEL',
      discount: 0,
      message: 'Free delivery unlocked',
    ),
  },
  categoryChips: [
    DemoCategoryChip(value: 'all', label: 'All'),
    DemoCategoryChip(value: 'makeup', label: 'Makeup'),
    DemoCategoryChip(value: 'skin', label: 'Skin'),
    DemoCategoryChip(value: 'hair', label: 'Hair'),
    DemoCategoryChip(value: 'fragrance', label: 'Fragrance'),
    DemoCategoryChip(value: 'bath', label: 'Bath & Body'),
  ],
  categoryShortcuts: [
    DemoCategoryShortcut(label: 'Makeup', icon: 'starFilled'),
    DemoCategoryShortcut(label: 'Skin', icon: 'sun'),
    DemoCategoryShortcut(label: 'Hair', icon: 'heart'),
    DemoCategoryShortcut(label: 'Offers', icon: 'starFilled'),
  ],
  gridSectionTitle: 'Top picks for you',
  cartDividerLabel: 'Beauty haul',
  profileEmail: 'beauty@tirabeauty.com',
  couponPlaceholder: 'Enter coupon (TIRA500, FREEDEL)',
  freeDeliveryThreshold: 499,
  promoBanner: '₹500 off on your first order',
  initialSettings: DemoAppSettings(
    brandSlug: 'tira',
    brandPickerLabel: 'Tira',
    mode: 'light',
    platformId: 'S-360',
  ),
);

final kPeopleFirstStoreConfig = DemoStoreConfig(
  id: 'peoplefirst',
  hubTitle: 'PeopleFirst Demo',
  hubDescription:
      'Employee portal — home dashboard, my profile, and benefits inspired by peoplefirst.ril.com.',
  logoAlt: 'PeopleFirst',
  searchPlaceholder: 'Search',
  products: const [],
  coupons: const {},
  categoryChips: const [],
  categoryShortcuts: const [],
  gridSectionTitle: '',
  cartDividerLabel: '',
  profileEmail: kPeopleFirstEmail,
  couponPlaceholder: '',
  freeDeliveryThreshold: 0,
  initialSettings: DemoAppSettings(
    brandSlug: 'jio',
    brandPickerLabel: 'Jio',
    accentAppearance: 'informative',
    mode: 'light',
    platformId: 'L-1440',
  ),
);

final kDemoStoreConfigs = <DemoStoreConfig>[
  kJioMartStoreConfig,
  kTiraStoreConfig,
  kPeopleFirstStoreConfig,
];
