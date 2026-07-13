// @generated — do not edit by hand.
// Source: packages/ui/src/components/Tooltip/Tooltip.shared.ts
// Regenerate with: pnpm docs:machine

import { z } from 'zod';
import type { PropDescriptor } from '../../types/componentMeta';

// Deprecated props (excluded): portal

export const TOOLTIP_GENERATED_PROPS: PropDescriptor[] = [
  { name: "children", type: "ReactNode", description: "The trigger element the tooltip attaches to", required: true },
  { name: "content", type: "ReactNode", description: "Text or content displayed inside the tooltip", required: true },
  { name: "position", type: "enum", options: ["top","topStart","topEnd","bottom","bottomStart","bottomEnd","left","leftStart","leftEnd","right","rightStart","rightEnd"] as const, description: "Convenience position prop matching Figma API.\nMaps to side+align internally. If both `position` and `side` are provided,\n`side`/`align` take precedence." },
  { name: "side", type: "enum", options: ["top","bottom","left","right"] as const, description: "Which side of the trigger to position against" },
  { name: "align", type: "enum", options: ["center","start","end"] as const, description: "Alignment along the side axis" },
  { name: "sideOffset", type: "number", description: "Distance from the trigger in pixels" },
  { name: "open", type: "boolean", description: "Whether the tooltip is open (controlled)" },
  { name: "defaultOpen", type: "boolean", description: "Default open state (uncontrolled)" },
  { name: "onOpenChange", type: "function", description: "Called when the tooltip opens or closes" },
  { name: "trigger", type: "enum", options: ["manual","hover","click","focus"] as const, description: "How the tooltip is triggered" },
  { name: "delay", type: "number", description: "Delay before showing (ms)" },
  { name: "closeDelay", type: "number", description: "Delay before hiding (ms)" },
  { name: "arrow", type: "boolean", description: "Whether to show the arrow/tip pointing to the trigger" },
  { name: "maxWidth", type: "object", description: "Maximum width of the tooltip; when set, copy wraps inside that width (default popup is single-line nowrap)." },
  { name: "hoverable", type: "boolean", description: "Whether the tooltip contents can be hovered without closing" },
  { name: "disabled", type: "boolean", description: "Whether tooltip is disabled" },
  { name: "zIndex", type: "number", description: "Custom z-index for the tooltip" },
  { name: "subtle", type: "boolean", description: "Force subtle motion (Motion Foundations a11y level): faster Subtle\ndurations/easings and opacity-only animation — no transform/translate.\nUse this to preview reduced motion without changing OS settings.\n`prefers-reduced-motion: reduce` triggers the same path automatically." }
];

export const TOOLTIP_PROPS_SCHEMA = z.object({
    children: z.string(),
    content: z.string(),
    position: z.enum(["top", "topStart", "topEnd", "bottom", "bottomStart", "bottomEnd", "left", "leftStart", "leftEnd", "right", "rightStart", "rightEnd"]).optional(),
    side: z.enum(["top", "bottom", "left", "right"]).optional(),
    align: z.enum(["center", "start", "end"]).optional(),
    sideOffset: z.number().optional(),
    open: z.boolean().optional(),
    defaultOpen: z.boolean().optional(),
    onOpenChange: z.any().optional(),
    trigger: z.enum(["manual", "hover", "click", "focus"]).optional(),
    delay: z.number().optional(),
    closeDelay: z.number().optional(),
    arrow: z.boolean().optional(),
    maxWidth: z.unknown().optional(),
    hoverable: z.boolean().optional(),
    disabled: z.boolean().optional(),
    zIndex: z.number().optional(),
    subtle: z.boolean().optional()
  }).strict();
