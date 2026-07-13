import type { ComponentType } from 'react';
import { ALL_COMPONENT_METAS } from '@oneui/ui/registry/metaRegistry';

import { AgentPulseQaShowcase } from './agent-pulse/AgentPulseQaShowcase';
import { AvatarQaShowcase } from './avatar/AvatarQaShowcase';
import { BadgeQaShowcase } from './badge/BadgeQaShowcase';
import { BottomNavigationQaShowcase } from './bottom-navigation/BottomNavigationQaShowcase';
import { ButtonQaShowcase } from './button/ButtonQaShowcase';
import { CarouselQaShowcase } from './carousel/CarouselQaShowcase';
import { CheckboxQaShowcase } from './checkbox/CheckboxQaShowcase';
import { CheckboxFieldQaShowcase } from './checkbox-field/CheckboxFieldQaShowcase';
import { ChipGroupQaShowcase } from './chip-group/ChipGroupQaShowcase';
import { ChipQaShowcase } from './chip/ChipQaShowcase';
import { CircularProgressIndicatorQaShowcase } from './circular-progress-indicator/CircularProgressIndicatorQaShowcase';
import { ContainerQaShowcase } from './container/ContainerQaShowcase';
import { CounterBadgeQaShowcase } from './counter-badge/CounterBadgeQaShowcase';
import { DividerQaShowcase } from './divider/DividerQaShowcase';
import { FABQaShowcase } from './fab/FABQaShowcase';
import { GridQaShowcase } from './grid/GridQaShowcase';
import { IconButtonQaShowcase } from './icon-button/IconButtonQaShowcase';
import { IconContainedQaShowcase } from './icon-contained/IconContainedQaShowcase';
import { IconQaShowcase } from './icon/IconQaShowcase';
import { ImageQaShowcase } from './image/ImageQaShowcase';
import { IndicatorBadgeQaShowcase } from './indicator-badge/IndicatorBadgeQaShowcase';
import { InputFieldQaShowcase } from './input-field/InputFieldQaShowcase';
import { InputDynamicTextQaShowcase } from './input-dynamic-text/InputDynamicTextQaShowcase';
import { InputFeedbackQaShowcase } from './input-feedback/InputFeedbackQaShowcase';
import { InputQaShowcase } from './input/InputQaShowcase';
import { ModalQaShowcase } from './modal/ModalQaShowcase';
import { LinearProgressIndicatorQaShowcase } from './linear-progress-indicator/LinearProgressIndicatorQaShowcase';
import { ListItemGroupQaShowcase } from './list-item-group/ListItemGroupQaShowcase';
import { ListItemQaShowcase } from './list-item/ListItemQaShowcase';
import { LogoQaShowcase } from './logo/LogoQaShowcase';
import { PaginationDotsQaShowcase } from './pagination-dots/PaginationDotsQaShowcase';
import { PaginationQaShowcase } from './pagination/PaginationQaShowcase';
import { RadioFieldQaShowcase } from './radio-field/RadioFieldQaShowcase';
import { RadioQaShowcase } from './radio/RadioQaShowcase';
import { SelectQaShowcase } from './select/SelectQaShowcase';
import { SelectableButtonQaShowcase } from './selectable-button/SelectableButtonQaShowcase';
import { SelectableIconButtonQaShowcase } from './selectable-icon-button/SelectableIconButtonQaShowcase';
import { SelectableSingleTextButtonQaShowcase } from './selectable-single-text-button/SelectableSingleTextButtonQaShowcase';
import { SegmentedControlQaShowcase } from './segmented-control/SegmentedControlQaShowcase';
import { SingleTextButtonQaShowcase } from './single-text-button/SingleTextButtonQaShowcase';
import { SliderQaShowcase } from './slider/SliderQaShowcase';
import { SpinnerQaShowcase } from './spinner/SpinnerQaShowcase';
import { StepperQaShowcase } from './stepper/StepperQaShowcase';
import { SurfaceQaShowcase } from './surface/SurfaceQaShowcase';
import { SwitchQaShowcase } from './switch/SwitchQaShowcase';
import { TabsQaShowcase } from './tabs/TabsQaShowcase';
import { TextQaShowcase } from './text/TextQaShowcase';
import { TooltipQaShowcase } from './tooltip/TooltipQaShowcase';
import { TouchSliderQaShowcase } from './touch-slider/TouchSliderQaShowcase';
import { WebHeaderQaShowcase } from './web-header/WebHeaderQaShowcase';

const BY_SLUG: Record<string, ComponentType> = {
  "agent-pulse": AgentPulseQaShowcase,
  "avatar": AvatarQaShowcase,
  "badge": BadgeQaShowcase,
  "bottom-navigation": BottomNavigationQaShowcase,
  "button": ButtonQaShowcase,
  "carousel": CarouselQaShowcase,
  "checkbox": CheckboxQaShowcase,
  "checkbox-field": CheckboxFieldQaShowcase,
  "chip": ChipQaShowcase,
  "chip-group": ChipGroupQaShowcase,
  "circular-progress-indicator": CircularProgressIndicatorQaShowcase,
  "container": ContainerQaShowcase,
  "counter-badge": CounterBadgeQaShowcase,
  "divider": DividerQaShowcase,
  "fab": FABQaShowcase,
  "grid": GridQaShowcase,
  "icon": IconQaShowcase,
  "icon-button": IconButtonQaShowcase,
  "icon-contained": IconContainedQaShowcase,
  "image": ImageQaShowcase,
  "indicator-badge": IndicatorBadgeQaShowcase,
  "input": InputQaShowcase,
  "input-dynamic-text": InputDynamicTextQaShowcase,
  "input-feedback": InputFeedbackQaShowcase,
  "input-field": InputFieldQaShowcase,
  "modal": ModalQaShowcase,
  "linear-progress-indicator": LinearProgressIndicatorQaShowcase,
  "list-item": ListItemQaShowcase,
  "list-item-group": ListItemGroupQaShowcase,
  "logo": LogoQaShowcase,
  "pagination-dots": PaginationDotsQaShowcase,
  "pagination": PaginationQaShowcase,
  "radio": RadioQaShowcase,
  "radio-field": RadioFieldQaShowcase,
  select: SelectQaShowcase,
  "selectable-button": SelectableButtonQaShowcase,
  "selectable-icon-button": SelectableIconButtonQaShowcase,
  "selectable-single-text-button": SelectableSingleTextButtonQaShowcase,
  "segmented-control": SegmentedControlQaShowcase,
  "single-text-button": SingleTextButtonQaShowcase,
  "slider": SliderQaShowcase,
  "spinner": SpinnerQaShowcase,
  "stepper": StepperQaShowcase,
  "surface": SurfaceQaShowcase,
  "switch": SwitchQaShowcase,
  "tabs": TabsQaShowcase,
  "text": TextQaShowcase,
  "tooltip": TooltipQaShowcase,
  "touch-slider": TouchSliderQaShowcase,
  "web-header": WebHeaderQaShowcase,
};

const REGISTRY_SLUGS = new Set(ALL_COMPONENT_METAS.map((m) => m.slug));

/** Full QA canvas per slug — registry metas + QA-only routes (e.g. `input`). */
export const COMPONENT_QA_SHOWCASES: Record<string, ComponentType> = {
  ...Object.fromEntries(
    ALL_COMPONENT_METAS.map((m) => [m.slug, BY_SLUG[m.slug]]).filter((entry): entry is [string, ComponentType] => {
      const [, component] = entry;
      return component != null;
    }),
  ),
  ...Object.fromEntries(
    Object.entries(BY_SLUG).filter(([slug]) => !REGISTRY_SLUGS.has(slug)),
  ),
} as Record<string, ComponentType>;
