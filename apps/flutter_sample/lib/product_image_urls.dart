/// Stable Unsplash crop URLs for demo product photos (OneUiImage network `src`).
const kDemoProductImageFallback =
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=400&fit=crop&q=85';

const kDemoProductImageUrls = <String, String>{
  'oil': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop&q=85',
  'salt':
      'https://cdn1.jiomartjcp.com/v2/catalog-cloud/jiomar/t.resize(w:300)/images/othe/egurhk/.j/pg/0000000004900000731.jpg.a7bd44e3df.jpg',
  'milk': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop&q=85',
  'banana': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop&q=85',
  'vlcc-sun':
      'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop&q=85',
  'mamaearth-sun':
      'https://cdn1.jiomartjcp.com/v2/catalog-cloud/jiomar/t.resize(w:300)/images/othe/egurhk/.j/pg/0000000004919382901.jpg.b35220b6ca.jpg',
  'lakme-sun':
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&q=85',
  'shinique-sun':
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop&q=85',
  'buds': 'https://images.unsplash.com/photo-1598331668826-20cecc596b86?w=400&h=400&fit=crop&q=85',
  'headphones':
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&q=85',
  'cookies':
      'https://cdn1.jiomartjcp.com/v2/catalog-cloud/jiomar/t.resize(w:300)/images/othe/egurhk/.j/pg/0000000004913907141.jpg.fb071cde2d.jpg',
  'tomato':
      'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&h=400&fit=crop&q=85',
  // Tira beauty demo
  'boj-sun':
      'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop&q=85',
  'cosrx-snail':
      'https://images.unsplash.com/photo-1620916564558-607581eea1d0?w=400&h=400&fit=crop&q=85',
  'ordinary-toner':
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop&q=85',
  'dr-althea':
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&q=85',
  'axis-y-serum':
      'https://images.unsplash.com/photo-1617897903246-3693941e5ef5?w=400&h=400&fit=crop&q=85',
  'skin1004':
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&q=85',
  'huda-lip':
      'https://images.unsplash.com/photo-1586495777744-4413c210d0c1?w=400&h=400&fit=crop&q=85',
  'fenty-gloss':
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop&q=85',
  'plum-mist':
      'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop&q=85',
  'minimalist-vitc':
      'https://images.unsplash.com/photo-1570194065650-d99fb4cbed6a?w=400&h=400&fit=crop&q=85',
  'face-shop-foam':
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&q=85',
  'celimax-retinal':
      'https://images.unsplash.com/photo-1617897903246-3693941e5ef5?w=400&h=400&fit=crop&q=85',
  'benefit-mascara':
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop&q=85',
  'cerave-cleanser':
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&q=85',
  'clayco-scrub':
      'https://images.unsplash.com/photo-1570194065650-d99fb4cbed6a?w=400&h=400&fit=crop&q=85',
};

String demoProductImageUrl(String productId) =>
    kDemoProductImageUrls[productId] ?? kDemoProductImageFallback;

/// Bundled assets — offline / corp-network fallback when CDN URLs fail.
const kDemoProductImageAssetFallback = 'assets/products/fallback.png';

const kDemoProductImageAssets = <String, String>{
  'oil': 'assets/products/oil.jpg',
  'salt': 'assets/products/salt.png',
  'milk': 'assets/products/milk.jpg',
  'banana': 'assets/products/banana.jpg',
  'vlcc-sun': 'assets/products/sunscreen1.jpg',
  'mamaearth-sun': 'assets/products/sunscreen2.png',
  'lakme-sun': 'assets/products/sunscreen3.jpg',
  'shinique-sun': 'assets/products/sunscreen4.jpg',
  'buds': 'assets/products/buds.jpg',
  'headphones': 'assets/products/headphones.jpg',
  'cookies': 'assets/products/cookies.png',
  'tomato': 'assets/products/tomato.jpg',
  'boj-sun': 'assets/products/sunscreen1.jpg',
  'cosrx-snail': 'assets/products/sunscreen2.png',
  'ordinary-toner': 'assets/products/sunscreen3.jpg',
  'dr-althea': 'assets/products/sunscreen4.jpg',
  'axis-y-serum': 'assets/products/sunscreen1.jpg',
  'skin1004': 'assets/products/sunscreen3.jpg',
  'huda-lip': 'assets/products/sunscreen2.png',
  'fenty-gloss': 'assets/products/sunscreen4.jpg',
  'plum-mist': 'assets/products/buds.jpg',
  'minimalist-vitc': 'assets/products/sunscreen1.jpg',
  'face-shop-foam': 'assets/products/milk.jpg',
  'celimax-retinal': 'assets/products/sunscreen3.jpg',
  'benefit-mascara': 'assets/products/sunscreen2.png',
  'cerave-cleanser': 'assets/products/sunscreen3.jpg',
  'clayco-scrub': 'assets/products/sunscreen1.jpg',
};

String demoProductImageAsset(String productId) =>
    kDemoProductImageAssets[productId] ?? kDemoProductImageAssetFallback;
