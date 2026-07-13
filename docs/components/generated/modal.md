# Modal Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: Focused overlay with structured header/body/footer layout and scroll management. The modal popup is role-neutral; per-role styling is applied to the slot children (footer buttons, headerStart, body content).
- **Task contexts**: overlay, dialog, modal, popup, sheet, confirmation
- **Sentiments**: neutral

## Composition Rules

- **Requires**: 
- **Allows**: headerStart, children, footerStart, footerEnd
- **Forbids**: 

## Variant Logic

- **S**: use when Small
- **M**: use when Medium
- **L**: use when Large
- **FullWidth**: use when Full Width

## Relationships and Dependencies

- **Related**: 
- **Escalates to**: -
- **Degrades to**: -
- **Groups with**: -

## Context Signals

- **Density**: compact, default, open
- **Modality**: desktop, mobile
- **Brand**: theme-scope aware, recipe-driven
- **Mode**: light, dark

## Observability Hooks

- **Track**: 
- **Health**: a11y_violations

## Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `children` | `ReactNode` | Yes | - | Modal body content |
| `aria-label` | `string` | No | - | Accessible name for the dialog. Required when `header={false}` or `showTitle={false}` — without it, screen readers announce an unnamed dialog (WCAG 2.1 AA 4.1.2 violation). When the title is visible, Base UI auto-wires `aria-labelledby` from <Dialog.Title> and this is optional. |
| `aria-labelledby` | `string` | No | - | Optional id of an element labelling the dialog. Mutually exclusive with `aria-label`. Takes precedence over Base UI's auto-wired Title link. |
| `className` | `string` | No | - | Additional class name |
| `data-testid` | `string` | No | - | Test id forwarded to the dialog popup |
| `defaultOpen` | `boolean` | No | - | Default open state (uncontrolled) |
| `description` | `string` | No | - | Modal description text |
| `dismissible` | `boolean` | No | true | Whether Escape/outside press can dismiss the modal. Explicit close controls and controlled parent state changes still work. |
| `dividerBottomScrollPosition` | `DividerScrollPosition` | No | middle | Scroll threshold through which the bottom divider remains visible when `dividerBottomVisibility="onScroll"`. |
| `dividerBottomVisibility` | `DividerVisibility` | No | none | Bottom divider visibility behaviour. |
| `dividerTopScrollPosition` | `DividerScrollPosition` | No | middle | Scroll threshold at which the top divider appears when `dividerTopVisibility="onScroll"`. |
| `dividerTopVisibility` | `DividerVisibility` | No | none | Top divider visibility behaviour. |
| `footer` | `boolean` | No | true | Whether to show the footer section. |
| `footerEnd` | `ReactNode` | No | - | Footer content (typically action buttons) |
| `footerOrientation` | `FooterOrientation` | No | horizontal | Footer button orientation. |
| `footerStart` | `ReactNode` | No | - | Content for the footer start slot |
| `header` | `boolean` | No | true | Whether to show the header section. |
| `headerAlign` | `HeaderAlign` | No | left | Header content alignment. |
| `headerStart` | `ReactNode` | No | - | Content for the header start slot. Renders before the title. Per RFC 0001: presence/absence of the ReactNode is the visibility gate — no enum discriminator needed. |
| `onOpenChange` | `(open: boolean, details: ModalOpenChangeDetails) => void` | No | - | Called when the modal opens or closes. The `details.reason` arg lets you distinguish dismiss triggers (Escape vs outside-press vs close button) and inspect the underlying Base UI event/trigger details. |
| `open` | `boolean` | No | - | Whether the modal is open (controlled) |
| `showDescription` | `boolean` | No | true | Whether to show the description. |
| `showTitle` | `boolean` | No | true | Whether to show the title. |
| `size` | `ModalSize` | No | M | Modal size preset. |
| `style` | `CSSProperties` | No | - | Inline styles |
| `title` | `string` | No | - | Modal title text |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |
| `headerStart` | Icon, Badge |  |
| `children` | any |  |
| `footerStart` | any |  |
| `footerEnd` | Button |  |

## Code Snippets

### Basic Usage

```tsx
import { Modal } from '@oneui/ui';

<Modal />
```

### Recipe Decisions

```json
{
  "component": "Modal",
  "decisions": [
    "Shape",
    "Internal padding"
  ]
}
```
