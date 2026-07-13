/// `globals.breakpoint` strings from web Storybook — width in px or `responsive`.
const List<String> kOneUiBreakpointValues = [
  'responsive',
  '360',
  '768',
  '1024',
  '1440',
  '1920',
];

String breakpointMenuLabel(String storageValue) {
  switch (storageValue) {
    case 'responsive':
      return 'Responsive';
    case '360':
      return 'Mobile (360px)';
    case '768':
      return 'Tablet (768px)';
    case '1024':
      return 'Tablet Landscape (1024px)';
    case '1440':
      return 'Desktop (1440px)';
    case '1920':
      return 'Desktop Large (1920px)';
    default:
      return storageValue;
  }
}
