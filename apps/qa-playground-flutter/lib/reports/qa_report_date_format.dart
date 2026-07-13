/// Formats `generatedAt` ISO timestamps from QA report summaries into the
/// user-facing format `12-June-2026 2:30 PM (IST)`.
///
/// Why IST: this codebase ships from Reliance Jio's India teams; everyone
/// reading the dashboard is reasoning in Asia/Kolkata. Showing a local-zoned
/// timestamp without the timezone tag was confusing on Slack pastes — the
/// `(IST)` suffix makes the offset unambiguous regardless of the reader's
/// system clock.
///
/// Falls back to the raw input on parse failure so older reports stay legible.
library;

const List<String> _kMonthLong = [
  '',
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/// Asia/Kolkata UTC offset (no DST). Hard-coded because Flutter does not ship
/// an IANA timezone database — converting via system `toLocal()` would render
/// "10:30 AM" on a developer's machine in San Francisco, which defeats the
/// "everyone sees the same time" goal.
const Duration _kIstOffset = Duration(hours: 5, minutes: 30);

String formatQaReportTimestamp(String? raw) {
  if (raw == null || raw.isEmpty) return '';
  final DateTime? parsed = DateTime.tryParse(raw);
  if (parsed == null) return raw;

  final ist = parsed.toUtc().add(_kIstOffset);
  final day = ist.day;
  final month = _kMonthLong[ist.month];
  final year = ist.year;
  final h24 = ist.hour;
  final h12 = h24 == 0 ? 12 : (h24 > 12 ? h24 - 12 : h24);
  final mm = ist.minute.toString().padLeft(2, '0');
  final ampm = h24 < 12 ? 'AM' : 'PM';
  return '$day-$month-$year $h12:$mm $ampm (IST)';
}
