/**
 * Phase 2 — knowledge tools.
 * search_design_system · list_skills · get_skill · get_skill_reference · get_core_invariants
 */
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { search } from '../lib/search.js';
import {
  getSkillIndex,
  getSkill,
  getSkillReference,
  getCoreInvariants,
  getPrdTemplate,
} from '../lib/snapshot.js';
import { text, errorText } from './util.js';

export function registerKnowledgeTools(server: McpServer): void {
  server.registerTool(
    'search_design_system',
    {
      title: 'Search the OneUI design system',
      description:
        'Keyword search across the baked OneUI knowledge: skills, core invariants, the surface ' +
        'guide, component intents, and brand specs. Use this to ground any design/code decision ' +
        'before writing UI. Returns the top matches with snippets and their source.',
      inputSchema: {
        query: z.string().describe('What you want to know, e.g. "how do surface modes work" or "button attention levels".'),
        tags: z.array(z.string()).optional().describe('Optional source filter, e.g. ["surface","typography","component"].'),
        limit: z.number().int().min(1).max(15).optional().describe('Max results (default 5).'),
      },
    },
    async ({ query, tags, limit }) => {
      const results = search(query, { tags, limit });
      if (results.length === 0) {
        return text(`No matches for "${query}". Try broader terms or call list_skills / get_core_invariants.`);
      }
      const out = results
        .map(
          (r, i) =>
            `### ${i + 1}. ${r.title}  \n_source: ${r.source} · id: ${r.id} · tags: ${r.tags.join(', ') || '—'}_\n\n${r.snippet}`,
        )
        .join('\n\n---\n\n');
      return text(out);
    },
  );

  server.registerTool(
    'list_skills',
    {
      title: 'List OneUI design skills',
      description:
        'List the available OneUI design skills (composition, surface context, multi-brand, …). ' +
        'Each is a focused guide the agent should read before doing related work. ' +
        'Use get_skill to read one in full.',
      inputSchema: {},
    },
    async () => {
      const skills = getSkillIndex();
      if (skills.length === 0) return text('No skills are baked into this snapshot.');
      const out = skills
        .map((s) => `- **${s.name}**${s.category ? ` _(${s.category})_` : ''} — ${s.description}`)
        .join('\n');
      return text(`# OneUI skills\n\n${out}\n\nCall get_skill(name) to read one. References (if any) via get_skill_reference.`);
    },
  );

  server.registerTool(
    'get_skill',
    {
      title: 'Read a OneUI skill',
      description: 'Return the full markdown of a named skill, plus the list of its reference files.',
      inputSchema: {
        name: z.string().describe('Skill name from list_skills, e.g. "design-composition".'),
      },
    },
    async ({ name }) => {
      const skill = getSkill(name);
      if (!skill) return errorText(`Skill "${name}" not found. Call list_skills for valid names.`);
      const refs = skill.meta.files.filter((f) => f !== 'SKILL.md');
      const refNote = refs.length
        ? `\n\n---\n**Reference files** (read via get_skill_reference("${name}", path)):\n${refs.map((f) => `- ${f}`).join('\n')}`
        : '';
      return text(skill.body + refNote);
    },
  );

  server.registerTool(
    'get_skill_reference',
    {
      title: 'Read a skill reference file',
      description: 'Return the contents of a reference file that belongs to a skill (e.g. a patterns or token cheat-sheet).',
      inputSchema: {
        name: z.string().describe('Skill name.'),
        path: z.string().describe('Reference path relative to the skill, e.g. "references/composition-patterns.md".'),
      },
    },
    async ({ name, path }) => {
      const body = getSkillReference(name, path);
      if (body === null) return errorText(`Reference "${path}" not found for skill "${name}".`);
      return text(body);
    },
  );

  server.registerTool(
    'get_core_invariants',
    {
      title: 'Get OneUI core invariants',
      description:
        'Return the always-apply OneUI rules: zero literals, the 8 surface modes, mandatory <Surface> ' +
        'wrapping, attention→variant mapping, shape defaults, focus halo, role-explicit token naming, ' +
        'and the 9 appearance roles. Read this before generating any OneUI code.',
      inputSchema: {},
    },
    async () => {
      const inv = getCoreInvariants();
      return inv ? text(inv) : errorText('Core invariants are not present in this snapshot.');
    },
  );

  server.registerTool(
    'get_prd_template',
    {
      title: 'Get the OneUI PRD template',
      description:
        'Return the OneUI PRD template (a blank fill-in template + a worked example). Use this when ' +
        'the user wants to start a build from a structured brief: hand them the blank template to fill, ' +
        'then pass the completed template to the /oneui-build-from-prd prompt. Each section maps to an ' +
        'MCP step (brand→tokens, scope→don\'t over-build, screens→composition+components, ' +
        'constraints→invariants, acceptance→the self-heal stop condition).',
      inputSchema: {},
    },
    async () => {
      const tpl = getPrdTemplate();
      return tpl ? text(tpl) : errorText('PRD template is not present in this snapshot.');
    },
  );
}
