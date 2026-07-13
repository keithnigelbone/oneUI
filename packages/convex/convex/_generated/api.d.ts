/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agentChat from "../agentChat.js";
import type * as appearanceConfigs from "../appearanceConfigs.js";
import type * as auditLogs from "../auditLogs.js";
import type * as auth from "../auth.js";
import type * as brandCSSCache from "../brandCSSCache.js";
import type * as brandCSSExport from "../brandCSSExport.js";
import type * as brandCSSPrecompute from "../brandCSSPrecompute.js";
import type * as brandMembers from "../brandMembers.js";
import type * as brandOrnaments from "../brandOrnaments.js";
import type * as brandPublish from "../brandPublish.js";
import type * as brands from "../brands.js";
import type * as campaigns from "../campaigns.js";
import type * as colorScales from "../colorScales.js";
import type * as colorUtils from "../colorUtils.js";
import type * as componentDocs from "../componentDocs.js";
import type * as componentRecipeSelections from "../componentRecipeSelections.js";
import type * as componentTokenOverrides from "../componentTokenOverrides.js";
import type * as compositionConfigs from "../compositionConfigs.js";
import type * as compositionEmbeddings from "../compositionEmbeddings.js";
import type * as compositionEval from "../compositionEval.js";
import type * as compositionFeedback from "../compositionFeedback.js";
import type * as compositionPublish from "../compositionPublish.js";
import type * as compositionRetrieval from "../compositionRetrieval.js";
import type * as compositionRules from "../compositionRules.js";
import type * as compositionSkills from "../compositionSkills.js";
import type * as compositions from "../compositions.js";
import type * as contextPacks from "../contextPacks.js";
import type * as createProjects from "../createProjects.js";
import type * as createTemplates from "../createTemplates.js";
import type * as customFonts from "../customFonts.js";
import type * as dataVisPalettes from "../dataVisPalettes.js";
import type * as email from "../email.js";
import type * as experienceRuns from "../experienceRuns.js";
import type * as figmaConnections from "../figmaConnections.js";
import type * as figmaParity from "../figmaParity.js";
import type * as figmaSync from "../figmaSync.js";
import type * as foundations from "../foundations.js";
import type * as http from "../http.js";
import type * as imagine from "../imagine.js";
import type * as knowledge from "../knowledge.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_fontFiles from "../lib/fontFiles.js";
import type * as materialValidators from "../materialValidators.js";
import type * as materials from "../materials.js";
import type * as migrations from "../migrations.js";
import type * as nativeTheme from "../nativeTheme.js";
import type * as presetColorScales from "../presetColorScales.js";
import type * as referenceAnalyses from "../referenceAnalyses.js";
import type * as references from "../references.js";
import type * as renderedScreenshots from "../renderedScreenshots.js";
import type * as savedLightnessScales from "../savedLightnessScales.js";
import type * as seed from "../seed.js";
import type * as subBrandConfigs from "../subBrandConfigs.js";
import type * as supabaseSync from "../supabaseSync.js";
import type * as syncHistory from "../syncHistory.js";
import type * as tokenGenerators from "../tokenGenerators.js";
import type * as tokenOverrides from "../tokenOverrides.js";
import type * as tokens from "../tokens.js";
import type * as updateShapes from "../updateShapes.js";
import type * as userPreferences from "../userPreferences.js";
import type * as users from "../users.js";
import type * as utils_diffEngine from "../utils/diffEngine.js";
import type * as utils_encryption from "../utils/encryption.js";
import type * as utils_figmaTransformer from "../utils/figmaTransformer.js";
import type * as utils_tokenResolver from "../utils/tokenResolver.js";
import type * as voiceConfigs from "../voiceConfigs.js";
import type * as voiceEval from "../voiceEval.js";
import type * as voiceFeedback from "../voiceFeedback.js";
import type * as voicePublish from "../voicePublish.js";
import type * as voiceRules from "../voiceRules.js";
import type * as voiceSkills from "../voiceSkills.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  agentChat: typeof agentChat;
  appearanceConfigs: typeof appearanceConfigs;
  auditLogs: typeof auditLogs;
  auth: typeof auth;
  brandCSSCache: typeof brandCSSCache;
  brandCSSExport: typeof brandCSSExport;
  brandCSSPrecompute: typeof brandCSSPrecompute;
  brandMembers: typeof brandMembers;
  brandOrnaments: typeof brandOrnaments;
  brandPublish: typeof brandPublish;
  brands: typeof brands;
  campaigns: typeof campaigns;
  colorScales: typeof colorScales;
  colorUtils: typeof colorUtils;
  componentDocs: typeof componentDocs;
  componentRecipeSelections: typeof componentRecipeSelections;
  componentTokenOverrides: typeof componentTokenOverrides;
  compositionConfigs: typeof compositionConfigs;
  compositionEmbeddings: typeof compositionEmbeddings;
  compositionEval: typeof compositionEval;
  compositionFeedback: typeof compositionFeedback;
  compositionPublish: typeof compositionPublish;
  compositionRetrieval: typeof compositionRetrieval;
  compositionRules: typeof compositionRules;
  compositionSkills: typeof compositionSkills;
  compositions: typeof compositions;
  contextPacks: typeof contextPacks;
  createProjects: typeof createProjects;
  createTemplates: typeof createTemplates;
  customFonts: typeof customFonts;
  dataVisPalettes: typeof dataVisPalettes;
  email: typeof email;
  experienceRuns: typeof experienceRuns;
  figmaConnections: typeof figmaConnections;
  figmaParity: typeof figmaParity;
  figmaSync: typeof figmaSync;
  foundations: typeof foundations;
  http: typeof http;
  imagine: typeof imagine;
  knowledge: typeof knowledge;
  "lib/auth": typeof lib_auth;
  "lib/fontFiles": typeof lib_fontFiles;
  materialValidators: typeof materialValidators;
  materials: typeof materials;
  migrations: typeof migrations;
  nativeTheme: typeof nativeTheme;
  presetColorScales: typeof presetColorScales;
  referenceAnalyses: typeof referenceAnalyses;
  references: typeof references;
  renderedScreenshots: typeof renderedScreenshots;
  savedLightnessScales: typeof savedLightnessScales;
  seed: typeof seed;
  subBrandConfigs: typeof subBrandConfigs;
  supabaseSync: typeof supabaseSync;
  syncHistory: typeof syncHistory;
  tokenGenerators: typeof tokenGenerators;
  tokenOverrides: typeof tokenOverrides;
  tokens: typeof tokens;
  updateShapes: typeof updateShapes;
  userPreferences: typeof userPreferences;
  users: typeof users;
  "utils/diffEngine": typeof utils_diffEngine;
  "utils/encryption": typeof utils_encryption;
  "utils/figmaTransformer": typeof utils_figmaTransformer;
  "utils/tokenResolver": typeof utils_tokenResolver;
  voiceConfigs: typeof voiceConfigs;
  voiceEval: typeof voiceEval;
  voiceFeedback: typeof voiceFeedback;
  voicePublish: typeof voicePublish;
  voiceRules: typeof voiceRules;
  voiceSkills: typeof voiceSkills;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("@convex-dev/better-auth/_generated/component.js").ComponentApi<"betterAuth">;
};
