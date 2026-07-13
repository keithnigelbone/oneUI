/**
 * The canonical list of MCP tools this server registers — single source of
 * truth shared by scripts/smoke.mjs (runtime assertion: tools/list must
 * set-equal this) and scripts/build-plugin.mjs (docs/manifest "N tools"
 * claims must match EXPECTED_TOOLS.length).
 *
 * Adding or removing a server tool REQUIRES updating this list — the smoke
 * test and plugin build fail otherwise. That friction is intentional: it
 * keeps INSTALL.md and marketplace.json honest.
 */
export const EXPECTED_TOOLS = [
  // registry
  'check_oneui_registry',
  'get_registry_setup',
  // lifecycle (web)
  'setup_oneui_project',
  'check_oneui_versions',
  'update_oneui_packages',
  // lifecycle (native)
  'create_oneui_native_app',
  // knowledge
  'search_design_system',
  'list_skills',
  'get_skill',
  'get_skill_reference',
  'get_core_invariants',
  'get_prd_template',
  // components
  'list_components',
  'get_component_info',
  // project context
  'get_project_context',
  // brands
  'list_brands',
  'get_brand_tokens',
  'get_brand_design_spec',
  'get_surface_guide',
  // validator
  'validate_oneui_code',
  // figma
  'ensure_figma_bridge',
  'figma_download_images',
  'figma_to_code',
];

export const EXPECTED_PROMPTS = ['oneui-build-from-prd', 'oneui-prd'];

/**
 * The docs' "7 resources" = these 4 fixed URIs + 3 URI templates
 * (oneui://skills/{name}, oneui://components/{slug}, oneui://brands/{slug}).
 * resources/list enumerates each template's instances (skills + components +
 * brands), so its raw count is snapshot-dependent — assert on these instead.
 */
export const EXPECTED_FIXED_RESOURCES = [
  'oneui://invariants',
  'oneui://surface-guide',
  'oneui://registry-setup',
  'oneui://prd-template',
];

export const EXPECTED_RESOURCE_TEMPLATE_COUNT = 3;
