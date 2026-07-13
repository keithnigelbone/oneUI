/// Catalog product for the JioMart-style demo storefront.
class DemoProduct {
  const DemoProduct({
    required this.id,
    required this.name,
    required this.price,
    required this.mrp,
    required this.category,
    this.brandName,
    this.packLabel = '1 Pack',
    this.inStock = true,
    this.bestseller = false,
    this.quickDelivery = true,
    this.rating,
    this.reviewCount,
    this.offerLabel,
    this.badgeLabel,
  });

  final String id;
  final String name;
  final int price;
  final int mrp;
  final String category;
  final String? brandName;
  final String packLabel;
  final bool inStock;
  final bool bestseller;
  final bool quickDelivery;
  final double? rating;
  final int? reviewCount;
  final String? offerLabel;
  final String? badgeLabel;

  String get priceLabel => '₹$price';
  String get mrpLabel => '₹$mrp';

  int get discountPercent =>
      mrp > price ? (((mrp - price) * 100) / mrp).round() : 0;

  String get displayBrand {
    if (brandName != null && brandName!.isNotEmpty) return brandName!;
    final dot = name.indexOf('.');
    if (dot > 0 && dot < 24) return name.substring(0, dot).trim();
    final space = name.indexOf(' ');
    if (space > 0 && space < 20) return name.substring(0, space).trim();
    return name;
  }

  String formatReviewCount() {
    final count = reviewCount;
    if (count == null) return '';
    if (count >= 1000) {
      final k = count / 1000;
      return k >= 10 ? '${k.round()}K' : '${k.toStringAsFixed(1)}K';
    }
    return '$count';
  }
}

const kDemoCoupons = <String, ({String label, int discount, String message})>{
  'SAVE50': (label: 'SAVE50', discount: 50, message: '₹50 off applied'),
  'FREEDEL': (label: 'FREEDEL', discount: 0, message: 'Free delivery unlocked'),
};

final kDemoProducts = <DemoProduct>[
  DemoProduct(
    id: 'oil',
    name: 'Fortune Sunlite Refined Oil 1L',
    price: 149,
    mrp: 175,
    category: 'grocery',
    bestseller: true,
  ),
  DemoProduct(
    id: 'salt',
    name: 'Tata Salt 1 kg',
    price: 28,
    mrp: 32,
    category: 'grocery',
  ),
  DemoProduct(
    id: 'milk',
    name: 'Amul Taaza Toned Milk 1L',
    price: 58,
    mrp: 62,
    category: 'fresh',
    bestseller: true,
  ),
  DemoProduct(
    id: 'banana',
    name: 'Fresh Bananas 1 dozen',
    price: 45,
    mrp: 55,
    category: 'fresh',
  ),
  DemoProduct(
    id: 'vlcc-sun',
    name: 'VLCC 3D Youth Boost SPF 40 Sunscreen 25 g',
    price: 49,
    mrp: 99,
    category: 'personal',
    bestseller: true,
  ),
  DemoProduct(
    id: 'mamaearth-sun',
    name: 'Mamaearth Ultra Light Indian Sunscreen 80 ml',
    price: 199,
    mrp: 249,
    category: 'personal',
  ),
  DemoProduct(
    id: 'lakme-sun',
    name: 'Lakmé Sun Expert SPF 50 PA+++ Gel 50 g',
    price: 175,
    mrp: 225,
    category: 'personal',
  ),
  DemoProduct(
    id: 'buds',
    name: 'Samsung Galaxy Buds',
    price: 4999,
    mrp: 6999,
    category: 'electronics',
    packLabel: '1 Unit',
    quickDelivery: false,
  ),
  DemoProduct(
    id: 'headphones',
    name: 'boAt Rockerz 450 Headphones',
    price: 1299,
    mrp: 2990,
    category: 'electronics',
    inStock: false,
    packLabel: '1 Unit',
  ),
  DemoProduct(
    id: 'cookies',
    name: 'Britannia Good Day Cookies 200 g',
    price: 35,
    mrp: 40,
    category: 'grocery',
  ),
  DemoProduct(
    id: 'tomato',
    name: 'Organic Tomatoes 500 g',
    price: 32,
    mrp: 42,
    category: 'fresh',
  ),
  DemoProduct(
    id: 'shinique-sun',
    name: 'SHINIQUE SunSlay Sunscreen Lotion 50 ml',
    price: 89,
    mrp: 120,
    category: 'personal',
  ),
];

DemoProduct? findDemoProduct(List<DemoProduct> products, String id) {
  for (final p in products) {
    if (p.id == id) return p;
  }
  return null;
}

int demoCartSubtotalFor(List<DemoProduct> products, Map<String, int> cart) {
  var total = 0;
  for (final entry in cart.entries) {
    final product = findDemoProduct(products, entry.key);
    if (product != null) total += product.price * entry.value;
  }
  return total;
}

int demoCartMrpTotalFor(List<DemoProduct> products, Map<String, int> cart) {
  var total = 0;
  for (final entry in cart.entries) {
    final product = findDemoProduct(products, entry.key);
    if (product != null) total += product.mrp * entry.value;
  }
  return total;
}

DemoProduct? demoProductById(String id) => findDemoProduct(kDemoProducts, id);

int demoCartSubtotal(Map<String, int> cart) =>
    demoCartSubtotalFor(kDemoProducts, cart);

int demoCartMrpTotal(Map<String, int> cart) =>
    demoCartMrpTotalFor(kDemoProducts, cart);

int demoCartItemCount(Map<String, int> cart) {
  var count = 0;
  for (final qty in cart.values) {
    count += qty;
  }
  return count;
}
