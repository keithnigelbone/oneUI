/// Static copy and navigation data for the PeopleFirst employee portal demo.

class PfNavItem {
  const PfNavItem({
    required this.id,
    required this.label,
    required this.icon,
    this.enabled = true,
  });

  final String id;
  final String label;
  final String icon;
  final bool enabled;
}

const kPeopleFirstNavItems = <PfNavItem>[
  PfNavItem(id: 'home', label: 'Home', icon: 'home'),
  PfNavItem(id: 'profile', label: 'My Profile', icon: 'user'),
  PfNavItem(id: 'leave', label: 'Leave and Attendance', icon: 'calendar'),
  PfNavItem(id: 'payroll', label: 'Payroll', icon: 'file'),
  PfNavItem(id: 'reimburse', label: 'Reimbursements', icon: 'document'),
  PfNavItem(id: 'benefits', label: 'Benefits', icon: 'heart'),
  PfNavItem(id: 'self', label: 'Self Services', icon: 'settings'),
  PfNavItem(id: 'corporate', label: 'Corporate Services', icon: 'layers'),
  PfNavItem(id: 'security', label: 'Security Services', icon: 'lock'),
  PfNavItem(
    id: 'performance',
    label: 'Performance Management',
    icon: 'starFilled',
  ),
  PfNavItem(id: 'travel', label: 'Travel & Guest House', icon: 'bus'),
  PfNavItem(id: 'engagement', label: 'Employee Engagement', icon: 'sparkles'),
  PfNavItem(id: 'talent', label: 'Talent Management', icon: 'bookmark'),
  PfNavItem(id: 'compliance', label: 'Compliance Management', icon: 'document'),
];

class PfQuickLink {
  const PfQuickLink({
    required this.label,
    required this.icon,
    this.subtitle,
  });

  final String label;
  final String icon;
  final String? subtitle;
}

const kPeopleFirstQuickLinks = <PfQuickLink>[
  PfQuickLink(
    label: 'HR Buddy',
    subtitle: 'Query Management',
    icon: 'user',
  ),
  PfQuickLink(label: 'Emergency Contacts', icon: 'phone'),
  PfQuickLink(label: 'Information Security', icon: 'lock'),
  PfQuickLink(label: 'Company Policies', icon: 'document'),
  PfQuickLink(
    label: 'Portals, Websites and Useful Links',
    icon: 'grid',
  ),
  PfQuickLink(label: 'Recruitment - Jio', icon: 'users'),
  PfQuickLink(label: 'Learning-JIO', icon: 'bookmark'),
];

class PfBenefitTile {
  const PfBenefitTile({
    required this.id,
    required this.title,
    required this.icon,
    this.amount,
    this.subtitle,
    this.appearance = 'informative',
  });

  final String id;
  final String title;
  final String icon;
  final String? amount;
  final String? subtitle;
  final String appearance;
}

const kPeopleFirstBenefitTiles = <PfBenefitTile>[
  PfBenefitTile(
    id: 'health',
    title: 'Health & Wellness',
    icon: 'heart',
  ),
  PfBenefitTile(
    id: 'maternity',
    title: 'Maternity/ Paternity',
    icon: 'user',
  ),
  PfBenefitTile(
    id: 'vehicle',
    title: 'Vehicle',
    icon: 'bus',
  ),
  PfBenefitTile(
    id: 'voucher',
    title: 'Retail Gift Voucher',
    icon: 'starFilled',
    amount: '₹5,000.00',
  ),
  PfBenefitTile(
    id: 'mobile',
    title: 'Mobile Services',
    icon: 'phone',
    subtitle:
        'Claim reimbursement up to INR 15,000.00 for handset purchase.',
    appearance: 'positive',
  ),
];

const kPeopleFirstNewsImageUrl =
    'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80';

const kPeopleFirstBannerImageUrl =
    'https://peoplefirst.ril.com/v2/assets/images/homepage-banner.svg';

/// Bundled copy of [kPeopleFirstBannerImageUrl] for offline / CORS-blocked loads.
const kPeopleFirstBannerAssetPath = 'assets/peoplefirst/homepage-banner.svg';

class PfNewsSlide {
  const PfNewsSlide({
    required this.title,
    required this.imageUrl,
    required this.alt,
  });

  final String title;
  final String imageUrl;
  final String alt;
}

const kPeopleFirstNewsSlides = <PfNewsSlide>[
  PfNewsSlide(
    title: 'JioStar: A landmark year of growth and scale',
    imageUrl: kPeopleFirstNewsImageUrl,
    alt: 'JioStar production update',
  ),
  PfNewsSlide(
    title: 'PeopleFirst platform updates for 2026',
    imageUrl: kPeopleFirstNewsImageUrl,
    alt: 'PeopleFirst update',
  ),
];

class PfAttendanceStat {
  const PfAttendanceStat({
    required this.label,
    required this.value,
    this.showProgress = false,
  });

  final String label;
  final String value;
  final bool showProgress;
}

const kPeopleFirstAttendanceStats = <PfAttendanceStat>[
  PfAttendanceStat(label: 'Punch In-Out', value: '10:05/13:36'),
  PfAttendanceStat(label: 'Expected mark-out time', value: '19:05'),
  PfAttendanceStat(label: 'Weekly hours complete', value: '9:03/9:00'),
  PfAttendanceStat(label: 'Weekly shortfall hours', value: '00:00 Hour(s)'),
  PfAttendanceStat(
    label: 'Absent for current and last month',
    value: '--',
  ),
];

const kPeopleFirstBirthdayEmptyTitle =
    'No Birthdays or Work Anniversaries today';
const kPeopleFirstBirthdayEmptySubtitle =
    'Here, you can view all the birthdays and work anniversaries of your colleagues.';
const kPeopleFirstBirthdayUpcomingTitle = 'No upcoming events this week';
const kPeopleFirstBirthdayUpcomingSubtitle =
    'Check back later for birthdays and work anniversaries.';

const kPeopleFirstCalendarMonthLabel = 'June 2026';
const kPeopleFirstCalendarWeekdays = <String>[
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
];

const kPeopleFirstCalendarLeadingBlanks = 1;
const kPeopleFirstCalendarDaysInMonth = 30;
const kPeopleFirstCalendarToday = 23;

const kPeopleFirstCalendarPresentDays = <int>{
  1, 2, 3, 4, 5, 8, 9, 10, 11, 12, 15, 16, 17, 18, 19, 22, 24, 25, 26,
};

/// Weekend / inactive days shown in muted grey (no green circle).
const kPeopleFirstCalendarInactiveDays = <int>{6, 7, 13, 14, 20, 21};

/// Future month-end days shown as plain blue text (no circle).
const kPeopleFirstCalendarFuturePlainDays = <int>{27, 28, 29, 30};

/// Days with an attendance/event marker asterisk in the calendar.
const kPeopleFirstCalendarMarkedDays = <int>{8, 24, 25, 26};

const kPeopleFirstCallRefersHeadline = 'We have your family covered 24x7!';
const kPeopleFirstCallRefersLines = <String>[
  'Family support helpline: 1800-123-4567',
  'Employee assistance: 022-4936-8888',
];

const kPeopleFirstAnnouncementDate = '16/12/2025';

const kPeopleFirstUserName = 'Swapnil';
const kPeopleFirstFullName = 'Swapnil Parab';
const kPeopleFirstLocation = 'NHQ - Mumbai';
const kPeopleFirstEmail = 'swapnil@ril.com';
const kPeopleFirstPhone = '+91 98765 43210';
const kPeopleFirstEmployeeId = '10001234';
