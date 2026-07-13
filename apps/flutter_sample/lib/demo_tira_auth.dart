import 'dart:math';

/// Demo OTP — always `1234` for local verification.
const kTiraStaticOtp = '1234';

const _kFirstNames = <String>[
  'Aisha',
  'Rohan',
  'Priya',
  'Arjun',
  'Meera',
  'Vikram',
  'Ananya',
  'Kabir',
  'Swapnil',
  'Neha',
];

const _kLastNames = <String>[
  'Sharma',
  'Patel',
  'Iyer',
  'Singh',
  'Reddy',
  'Nair',
  'Gupta',
  'Khan',
  'Parab',
  'Desai',
];

const _kStreets = <String>[
  'Andheri East',
  'Bandra West',
  'Powai',
  'Lower Parel',
  'Juhu',
  'Worli',
];

const _kGenders = <String>['female', 'male', 'non-binary'];

/// Logged-in demo user generated after OTP verification.
class TiraDemoUser {
  const TiraDemoUser({
    required this.firstName,
    required this.lastName,
    required this.phone,
    required this.gender,
    required this.email,
    required this.addressLine,
    required this.city,
    required this.pincode,
    required this.treatsPoints,
  });

  final String firstName;
  final String lastName;
  final String phone;
  final String gender;
  final String email;
  final String addressLine;
  final String city;
  final String pincode;
  final int treatsPoints;

  String get fullName => '$firstName $lastName';

  String get deliveryAddressBlock =>
      '$addressLine, $city, Maharashtra $pincode';

  String get genderLabel => switch (gender) {
        'female' => 'Female',
        'male' => 'Male',
        'non-binary' => 'Non Binary',
        _ => gender,
      };
}

/// Sanitise phone input to at most 10 digits.
String sanitiseTiraPhone(String raw) {
  final digits = raw.replaceAll(RegExp(r'\D'), '');
  if (digits.length <= 10) return digits;
  return digits.substring(0, 10);
}

bool isValidTiraPhone(String phone) => RegExp(r'^\d{10}$').hasMatch(phone);

String formatTiraPhoneDisplay(String phone) {
  final digits = sanitiseTiraPhone(phone);
  if (digits.length != 10) return digits;
  return '+91 ${digits.substring(0, 5)} ${digits.substring(5)}';
}

/// Random demo profile after OTP verification.
TiraDemoUser randomTiraUserProfile(String phone, [Random? rng]) {
  final random = rng ?? Random();
  final first = _kFirstNames[random.nextInt(_kFirstNames.length)];
  final last = _kLastNames[random.nextInt(_kLastNames.length)];
  final street = _kStreets[random.nextInt(_kStreets.length)];
  final gender = _kGenders[random.nextInt(_kGenders.length)];
  final pincode = '${400000 + random.nextInt(89)}';
  return TiraDemoUser(
    firstName: first,
    lastName: last,
    phone: sanitiseTiraPhone(phone),
    gender: gender,
    email: '${first.toLowerCase()}.${last.toLowerCase()}@email.com',
    addressLine: 'Flat ${10 + random.nextInt(80)}, ${street}',
    city: 'Mumbai',
    pincode: pincode,
    treatsPoints: random.nextInt(120),
  );
}

/// @deprecated Use [randomTiraUserProfile].
({String firstName, String lastName}) randomTiraUserName([Random? rng]) {
  final user = randomTiraUserProfile('9000000000', rng);
  return (firstName: user.firstName, lastName: user.lastName);
}

String formatInr(int amount) {
  final s = amount.toString();
  if (s.length <= 3) return s;
  final buf = StringBuffer();
  final rem = s.length % 3;
  if (rem > 0) {
    buf.write(s.substring(0, rem));
    if (s.length > rem) buf.write(',');
  }
  for (var i = rem; i < s.length; i += 3) {
    buf.write(s.substring(i, i + 3));
    if (i + 3 < s.length) buf.write(',');
  }
  return buf.toString();
}
