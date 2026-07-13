/// Taxonomy for QA playground "Test Scenarios" tab bands.
enum QaScenarioCategory {
  api(
    'API-based scenarios',
    'Prop matrices — sizes, appearances, states, and variants exposed by the component API.',
  ),
  realWorld(
    'Real-world usage scenarios',
    'Composed patterns mirroring product screens, forms, and nested surface layouts.',
  ),
  edgeCases(
    'Edge cases',
    'Disabled, invalid, empty, fallback, read-only, and boundary prop combinations.',
  ),
  interaction(
    'Interaction validations',
    'Tap, toggle, selection, navigation, and callback behaviour.',
  );

  const QaScenarioCategory(this.title, this.description);

  final String title;
  final String description;
}

/// Display order on the Test Scenarios tab.
const List<QaScenarioCategory> kQaScenarioCategoryOrder = [
  QaScenarioCategory.api,
  QaScenarioCategory.realWorld,
  QaScenarioCategory.edgeCases,
  QaScenarioCategory.interaction,
];
