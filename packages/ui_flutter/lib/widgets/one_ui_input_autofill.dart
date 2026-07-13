/// Maps web/RN `autoComplete` strings to Flutter [AutofillHints].
library;

import 'package:flutter/services.dart';

List<String>? oneUiInputAutofillHints(String? autoComplete) {
  final raw = autoComplete?.trim();
  if (raw == null || raw.isEmpty) return null;
  switch (raw) {
    case 'email':
      return const [AutofillHints.email];
    case 'username':
      return const [AutofillHints.username];
    case 'password':
    case 'current-password':
      return const [AutofillHints.password];
    case 'new-password':
      return const [AutofillHints.newPassword];
    case 'tel':
    case 'tel-national':
      return const [AutofillHints.telephoneNumber];
    case 'name':
      return const [AutofillHints.name];
    case 'given-name':
      return const [AutofillHints.givenName];
    case 'family-name':
      return const [AutofillHints.familyName];
    case 'street-address':
      return const [AutofillHints.streetAddressLine1];
    case 'postal-code':
      return const [AutofillHints.postalCode];
    case 'cc-number':
      return const [AutofillHints.creditCardNumber];
    case 'off':
      return null;
    default:
      return [raw];
  }
}
