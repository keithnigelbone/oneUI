import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_sample/demo_tira_auth.dart';

void main() {
  test('sanitiseTiraPhone keeps up to 10 digits', () {
    expect(sanitiseTiraPhone('98 7654 3210'), '9876543210');
    expect(sanitiseTiraPhone('98765432109'), '9876543210');
  });

  test('isValidTiraPhone requires exactly 10 digits', () {
    expect(isValidTiraPhone('9876543210'), isTrue);
    expect(isValidTiraPhone('987654321'), isFalse);
  });

  test('randomTiraUserProfile returns full profile', () {
    final user = randomTiraUserProfile('9876543210');
    expect(user.firstName, isNotEmpty);
    expect(user.lastName, isNotEmpty);
    expect(user.email, contains('@'));
    expect(user.addressLine, isNotEmpty);
    expect(user.pincode.length, 6);
  });

  test('formatTiraPhoneDisplay formats Indian mobile', () {
    expect(formatTiraPhoneDisplay('8097854975'), '+91 80978 54975');
  });
}
