# IconButton Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: Trigger compact single actions with icon-only affordance.
- **Task contexts**: toolbar-action, inline-compact-action, navigation-control
- **Sentiments**: neutral, positive, warning

## Composition Rules

- **Requires**: icon, aria-label
- **Allows**: loading spinner
- **Forbids**: text-only content

## Variant Logic

- **bold**: use when primary compact action
- **subtle**: use when secondary compact action
- **ghost**: use when minimal chrome action

## Relationships and Dependencies

- **Related**: Button, Toggle
- **Escalates to**: -
- **Degrades to**: -
- **Groups with**: -

## Context Signals

- **Density**: compact, default, open
- **Modality**: desktop, mobile
- **Brand**: theme-scope aware
- **Mode**: light, dark

## Observability Hooks

- **Track**: click
- **Health**: a11y_violations

## Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `aria-label` | `string` | Yes | - | Required accessibility label (icon-only buttons must have this) |
| `icon` | `ComponentIconInput | ReactElement` | Yes | - | Semantic name, pack id (`IcCarSide`), icon component, or React element |
| `about` | `string | undefined` | No | - | about property |
| `accessKey` | `string | undefined` | No | - | accessKey property |
| `appearance` | `IconButtonAppearance` | No | - | Multi-accent appearance role. 'auto' resolves to 'primary'. |
| `aria-activedescendant` | `string | undefined` | No | - | Identifies the currently active element when DOM focus is on a composite widget, textbox, group, or application. |
| `aria-atomic` | `Booleanish | undefined` | No | - | Indicates whether assistive technologies will present all, or only parts of, the changed region based on the change notifications defined by the aria-relevant attribute. |
| `aria-autocomplete` | `"none" | "inline" | "list" | "both" | undefined` | No | - | Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for an input and specifies how predictions would be presented if they are made. |
| `aria-braillelabel` | `string | undefined` | No | - | Indicates an element is being modified and that assistive technologies MAY want to wait until the modifications are complete before exposing them to the user. |
| `aria-brailleroledescription` | `string | undefined` | No | - | Defines a human-readable, author-localized abbreviated description for the role of an element, which is intended to be converted into Braille. |
| `aria-busy` | `Booleanish | undefined` | No | - | aria-busy property |
| `aria-checked` | `boolean | "false" | "mixed" | "true" | undefined` | No | - | Indicates the current "checked" state of checkboxes, radio buttons, and other widgets. |
| `aria-colcount` | `number | undefined` | No | - | Defines the total number of columns in a table, grid, or treegrid. |
| `aria-colindex` | `number | undefined` | No | - | Defines an element's column index or position with respect to the total number of columns within a table, grid, or treegrid. |
| `aria-colindextext` | `string | undefined` | No | - | Defines a human readable text alternative of aria-colindex. |
| `aria-colspan` | `number | undefined` | No | - | Defines the number of columns spanned by a cell or gridcell within a table, grid, or treegrid. |
| `aria-controls` | `string | undefined` | No | - | Identifies the element (or elements) whose contents or presence are controlled by the current element. |
| `aria-current` | `boolean | "false" | "true" | "page" | "step" | "location" | "date" | "time" | undefined` | No | - | Indicates the element that represents the current item within a container or set of related elements. |
| `aria-describedby` | `string | undefined` | No | - | Identifies the element (or elements) that describes the object. |
| `aria-description` | `string | undefined` | No | - | Defines a string value that describes or annotates the current element. |
| `aria-details` | `string | undefined` | No | - | Identifies the element that provides a detailed, extended description for the object. |
| `aria-disabled` | `Booleanish | undefined` | No | - | Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable. |
| `aria-dropeffect` | `"none" | "copy" | "execute" | "link" | "move" | "popup" | undefined` | No | - | Indicates what functions can be performed when a dragged object is released on the drop target. |
| `aria-errormessage` | `string | undefined` | No | - | Identifies the element that provides an error message for the object. |
| `aria-expanded` | `boolean` | No | - | Expanded state when the icon button controls collapsible content. |
| `aria-flowto` | `string | undefined` | No | - | Identifies the next element (or elements) in an alternate reading order of content which, at the user's discretion, allows assistive technology to override the general default of reading in document source order. |
| `aria-grabbed` | `Booleanish | undefined` | No | - | Indicates an element's "grabbed" state in a drag-and-drop operation. |
| `aria-haspopup` | `boolean | "false" | "true" | "menu" | "listbox" | "tree" | "grid" | "dialog" | undefined` | No | - | Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. |
| `aria-hidden` | `Booleanish | undefined` | No | - | Indicates whether the element is exposed to an accessibility API. |
| `aria-invalid` | `boolean | "false" | "true" | "grammar" | "spelling" | undefined` | No | - | Indicates the entered value does not conform to the format expected by the application. |
| `aria-keyshortcuts` | `string | undefined` | No | - | Indicates keyboard shortcuts that an author has implemented to activate or give focus to an element. |
| `aria-labelledby` | `string | undefined` | No | - | Identifies the element (or elements) that labels the current element. |
| `aria-level` | `number | undefined` | No | - | Defines the hierarchical level of an element within a structure. |
| `aria-live` | `"off" | "assertive" | "polite" | undefined` | No | - | Indicates that an element will be updated, and describes the types of updates the user agents, assistive technologies, and user can expect from the live region. |
| `aria-modal` | `Booleanish | undefined` | No | - | Indicates whether an element is modal when displayed. |
| `aria-multiline` | `Booleanish | undefined` | No | - | Indicates whether a text box accepts multiple lines of input or only a single line. |
| `aria-multiselectable` | `Booleanish | undefined` | No | - | Indicates that the user may select more than one item from the current selectable descendants. |
| `aria-orientation` | `"horizontal" | "vertical" | undefined` | No | - | Indicates whether the element's orientation is horizontal, vertical, or unknown/ambiguous. |
| `aria-owns` | `string | undefined` | No | - | Identifies an element (or elements) in order to define a visual, functional, or contextual parent/child relationship between DOM elements where the DOM hierarchy cannot be used to represent the relationship. |
| `aria-placeholder` | `string | undefined` | No | - | Defines a short hint (a word or short phrase) intended to aid the user with data entry when the control has no value. A hint could be a sample value or a brief description of the expected format. |
| `aria-posinset` | `number | undefined` | No | - | Defines an element's number or position in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM. |
| `aria-pressed` | `boolean | "false" | "mixed" | "true" | undefined` | No | - | Indicates the current "pressed" state of toggle buttons. |
| `aria-readonly` | `Booleanish | undefined` | No | - | Indicates that the element is not editable, but is otherwise operable. |
| `aria-relevant` | `| "additions" | "additions removals" | "additions text" | "all" | "removals" | "removals additions" | "removals text" | "text" | "text additions" | "text removals" | undefined` | No | - | Indicates what notifications the user agent will trigger when the accessibility tree within a live region is modified. |
| `aria-required` | `Booleanish | undefined` | No | - | Indicates that user input is required on the element before a form may be submitted. |
| `aria-roledescription` | `string | undefined` | No | - | Defines a human-readable, author-localized description for the role of an element. |
| `aria-rowcount` | `number | undefined` | No | - | Defines the total number of rows in a table, grid, or treegrid. |
| `aria-rowindex` | `number | undefined` | No | - | Defines an element's row index or position with respect to the total number of rows within a table, grid, or treegrid. |
| `aria-rowindextext` | `string | undefined` | No | - | Defines a human readable text alternative of aria-rowindex. |
| `aria-rowspan` | `number | undefined` | No | - | Defines the number of rows spanned by a cell or gridcell within a table, grid, or treegrid. |
| `aria-selected` | `Booleanish | undefined` | No | - | Indicates the current "selected" state of various widgets. |
| `aria-setsize` | `number | undefined` | No | - | Defines the number of items in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM. |
| `aria-sort` | `"none" | "ascending" | "descending" | "other" | undefined` | No | - | Indicates if items in a table or grid are sorted in ascending or descending order. |
| `aria-valuemax` | `number | undefined` | No | - | Defines the maximum allowed value for a range widget. |
| `aria-valuemin` | `number | undefined` | No | - | Defines the minimum allowed value for a range widget. |
| `aria-valuenow` | `number | undefined` | No | - | Defines the current value for a range widget. |
| `aria-valuetext` | `string | undefined` | No | - | Defines the human readable text alternative of aria-valuenow for a range widget. |
| `attention` | `IconButtonAttention` | No | - | Emphasis level — high (bold fill), medium (subtle fill), low (ghost). Default high. |
| `autoCapitalize` | `"off" | "none" | "on" | "sentences" | "words" | "characters" | undefined | (string & {})` | No | - | autoCapitalize property |
| `autoCorrect` | `string | undefined` | No | - | autoCorrect property |
| `autoFocus` | `boolean | undefined` | No | - | autoFocus property |
| `autoSave` | `string | undefined` | No | - | autoSave property |
| `className` | `string` | No | - | Additional CSS class name |
| `color` | `string | undefined` | No | - | color property |
| `condensed` | `boolean` | No | - | Condensed mode: reduces container size while keeping same icon size |
| `contained` | `boolean` | No | - | When true (default), renders a contained icon chip with background and sized container. When false, renders icon only — no background, border, or fixed chip size. `condensed`, `fullWidth`, and `layout="3:2"` only apply when `contained={true}`. |
| `content` | `string | undefined` | No | - | content property |
| `contentEditable` | `Booleanish | "inherit" | "plaintext-only" | undefined` | No | - | contentEditable property |
| `contextMenu` | `string | undefined` | No | - | contextMenu property |
| `dangerouslySetInnerHTML` | `{ // Should be InnerHTML['innerHTML']. // But unfortunately we're mixing renderer-specific type declarations. __html: string | TrustedHTML; } | undefined` | No | - | dangerouslySetInnerHTML property |
| `data-testid` | `string` | No | - | Test ID for testing |
| `datatype` | `string | undefined` | No | - | datatype property |
| `defaultChecked` | `boolean | undefined` | No | - | defaultChecked property |
| `defaultValue` | `string | number | readonly string[] | undefined` | No | - | defaultValue property |
| `dir` | `string | undefined` | No | - | dir property |
| `disabled` | `boolean` | No | - | Disabled state |
| `draggable` | `Booleanish | undefined` | No | - | draggable property |
| `enterKeyHint` | `"enter" | "done" | "go" | "next" | "previous" | "search" | "send" | undefined` | No | - | enterKeyHint property |
| `exportparts` | `string | undefined` | No | - | exportparts property |
| `form` | `string | undefined` | No | - | form property |
| `formAction` | `| string | ((formData: FormData) => void | Promise<void>) | DO_NOT_USE_OR_YOU_WILL_BE_FIRED_EXPERIMENTAL_FORM_ACTIONS[ keyof DO_NOT_USE_OR_YOU_WILL_BE_FIRED_EXPERIMENTAL_FORM_ACTIONS ] | undefined` | No | - | formAction property |
| `formEncType` | `string | undefined` | No | - | formEncType property |
| `formMethod` | `string | undefined` | No | - | formMethod property |
| `formNoValidate` | `boolean | undefined` | No | - | formNoValidate property |
| `formTarget` | `string | undefined` | No | - | formTarget property |
| `fullWidth` | `boolean` | No | - | Stretch to fill container width (maintains height). Only when contained=true. |
| `hidden` | `boolean | undefined` | No | - | hidden property |
| `id` | `string | undefined` | No | - | id property |
| `inert` | `boolean | undefined` | No | - | inert property |
| `inlist` | `any` | No | - | inlist property |
| `inputMode` | `"none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search" | undefined` | No | - | Hints at the type of data that might be entered by the user while editing the element or its contents |
| `is` | `string | undefined` | No | - | Specify that a standard HTML element should behave like a defined custom built-in element |
| `itemID` | `string | undefined` | No | - | itemID property |
| `itemProp` | `string | undefined` | No | - | itemProp property |
| `itemRef` | `string | undefined` | No | - | itemRef property |
| `itemScope` | `boolean | undefined` | No | - | itemScope property |
| `itemType` | `string | undefined` | No | - | itemType property |
| `lang` | `string | undefined` | No | - | lang property |
| `layout` | `IconButtonLayout` | No | - | Shape layout: '1:1' (square, default) or '3:2' (wide rectangle) |
| `loading` | `boolean` | No | - | Loading state — shows circular progress indicator |
| `name` | `string | undefined` | No | - | name property |
| `nonce` | `string | undefined` | No | - | nonce property |
| `onAbort` | `ReactEventHandler<T> | undefined` | No | - | onAbort property |
| `onAbortCapture` | `ReactEventHandler<T> | undefined` | No | - | onAbortCapture property |
| `onAnimationEnd` | `AnimationEventHandler<T> | undefined` | No | - | onAnimationEnd property |
| `onAnimationEndCapture` | `AnimationEventHandler<T> | undefined` | No | - | onAnimationEndCapture property |
| `onAnimationIteration` | `AnimationEventHandler<T> | undefined` | No | - | onAnimationIteration property |
| `onAnimationIterationCapture` | `AnimationEventHandler<T> | undefined` | No | - | onAnimationIterationCapture property |
| `onAnimationStart` | `AnimationEventHandler<T> | undefined` | No | - | onAnimationStart property |
| `onAnimationStartCapture` | `AnimationEventHandler<T> | undefined` | No | - | onAnimationStartCapture property |
| `onAuxClick` | `MouseEventHandler<T> | undefined` | No | - | onAuxClick property |
| `onAuxClickCapture` | `MouseEventHandler<T> | undefined` | No | - | onAuxClickCapture property |
| `onBeforeInput` | `InputEventHandler<T> | undefined` | No | - | onBeforeInput property |
| `onBeforeInputCapture` | `InputEventHandler<T> | undefined` | No | - | onBeforeInputCapture property |
| `onBeforeToggle` | `ToggleEventHandler<T> | undefined` | No | - | onBeforeToggle property |
| `onBlur` | `FocusEventHandler<T> | undefined` | No | - | onBlur property |
| `onBlurCapture` | `FocusEventHandler<T> | undefined` | No | - | onBlurCapture property |
| `onCanPlay` | `ReactEventHandler<T> | undefined` | No | - | onCanPlay property |
| `onCanPlayCapture` | `ReactEventHandler<T> | undefined` | No | - | onCanPlayCapture property |
| `onCanPlayThrough` | `ReactEventHandler<T> | undefined` | No | - | onCanPlayThrough property |
| `onCanPlayThroughCapture` | `ReactEventHandler<T> | undefined` | No | - | onCanPlayThroughCapture property |
| `onChange` | `ChangeEventHandler<T> | undefined` | No | - | onChange property |
| `onChangeCapture` | `ChangeEventHandler<T> | undefined` | No | - | onChangeCapture property |
| `onClick` | `MouseEventHandler<HTMLButtonElement>` | No | - | Web-only alias for onPress |
| `onClickCapture` | `MouseEventHandler<T> | undefined` | No | - | onClickCapture property |
| `onCompositionEnd` | `CompositionEventHandler<T> | undefined` | No | - | onCompositionEnd property |
| `onCompositionEndCapture` | `CompositionEventHandler<T> | undefined` | No | - | onCompositionEndCapture property |
| `onCompositionStart` | `CompositionEventHandler<T> | undefined` | No | - | onCompositionStart property |
| `onCompositionStartCapture` | `CompositionEventHandler<T> | undefined` | No | - | onCompositionStartCapture property |
| `onCompositionUpdate` | `CompositionEventHandler<T> | undefined` | No | - | onCompositionUpdate property |
| `onCompositionUpdateCapture` | `CompositionEventHandler<T> | undefined` | No | - | onCompositionUpdateCapture property |
| `onContextMenu` | `MouseEventHandler<T> | undefined` | No | - | onContextMenu property |
| `onContextMenuCapture` | `MouseEventHandler<T> | undefined` | No | - | onContextMenuCapture property |
| `onCopy` | `ClipboardEventHandler<T> | undefined` | No | - | onCopy property |
| `onCopyCapture` | `ClipboardEventHandler<T> | undefined` | No | - | onCopyCapture property |
| `onCut` | `ClipboardEventHandler<T> | undefined` | No | - | onCut property |
| `onCutCapture` | `ClipboardEventHandler<T> | undefined` | No | - | onCutCapture property |
| `onDoubleClick` | `MouseEventHandler<T> | undefined` | No | - | onDoubleClick property |
| `onDoubleClickCapture` | `MouseEventHandler<T> | undefined` | No | - | onDoubleClickCapture property |
| `onDrag` | `DragEventHandler<T> | undefined` | No | - | onDrag property |
| `onDragCapture` | `DragEventHandler<T> | undefined` | No | - | onDragCapture property |
| `onDragEnd` | `DragEventHandler<T> | undefined` | No | - | onDragEnd property |
| `onDragEndCapture` | `DragEventHandler<T> | undefined` | No | - | onDragEndCapture property |
| `onDragEnter` | `DragEventHandler<T> | undefined` | No | - | onDragEnter property |
| `onDragEnterCapture` | `DragEventHandler<T> | undefined` | No | - | onDragEnterCapture property |
| `onDragExit` | `DragEventHandler<T> | undefined` | No | - | onDragExit property |
| `onDragExitCapture` | `DragEventHandler<T> | undefined` | No | - | onDragExitCapture property |
| `onDragLeave` | `DragEventHandler<T> | undefined` | No | - | onDragLeave property |
| `onDragLeaveCapture` | `DragEventHandler<T> | undefined` | No | - | onDragLeaveCapture property |
| `onDragOver` | `DragEventHandler<T> | undefined` | No | - | onDragOver property |
| `onDragOverCapture` | `DragEventHandler<T> | undefined` | No | - | onDragOverCapture property |
| `onDragStart` | `DragEventHandler<T> | undefined` | No | - | onDragStart property |
| `onDragStartCapture` | `DragEventHandler<T> | undefined` | No | - | onDragStartCapture property |
| `onDrop` | `DragEventHandler<T> | undefined` | No | - | onDrop property |
| `onDropCapture` | `DragEventHandler<T> | undefined` | No | - | onDropCapture property |
| `onDurationChange` | `ReactEventHandler<T> | undefined` | No | - | onDurationChange property |
| `onDurationChangeCapture` | `ReactEventHandler<T> | undefined` | No | - | onDurationChangeCapture property |
| `onEmptied` | `ReactEventHandler<T> | undefined` | No | - | onEmptied property |
| `onEmptiedCapture` | `ReactEventHandler<T> | undefined` | No | - | onEmptiedCapture property |
| `onEncrypted` | `ReactEventHandler<T> | undefined` | No | - | onEncrypted property |
| `onEncryptedCapture` | `ReactEventHandler<T> | undefined` | No | - | onEncryptedCapture property |
| `onEnded` | `ReactEventHandler<T> | undefined` | No | - | onEnded property |
| `onEndedCapture` | `ReactEventHandler<T> | undefined` | No | - | onEndedCapture property |
| `onError` | `ReactEventHandler<T> | undefined` | No | - | onError property |
| `onErrorCapture` | `ReactEventHandler<T> | undefined` | No | - | onErrorCapture property |
| `onFocus` | `FocusEventHandler<T> | undefined` | No | - | onFocus property |
| `onFocusCapture` | `FocusEventHandler<T> | undefined` | No | - | onFocusCapture property |
| `onGotPointerCapture` | `PointerEventHandler<T> | undefined` | No | - | onGotPointerCapture property |
| `onGotPointerCaptureCapture` | `PointerEventHandler<T> | undefined` | No | - | onGotPointerCaptureCapture property |
| `onInput` | `InputEventHandler<T> | undefined` | No | - | onInput property |
| `onInputCapture` | `InputEventHandler<T> | undefined` | No | - | onInputCapture property |
| `onInvalid` | `ReactEventHandler<T> | undefined` | No | - | onInvalid property |
| `onInvalidCapture` | `ReactEventHandler<T> | undefined` | No | - | onInvalidCapture property |
| `onKeyDown` | `KeyboardEventHandler<T> | undefined` | No | - | onKeyDown property |
| `onKeyDownCapture` | `KeyboardEventHandler<T> | undefined` | No | - | onKeyDownCapture property |
| `onKeyPress` | `KeyboardEventHandler<T> | undefined` | No | - | onKeyPress property |
| `onKeyPressCapture` | `KeyboardEventHandler<T> | undefined` | No | - | onKeyPressCapture property |
| `onKeyUp` | `KeyboardEventHandler<T> | undefined` | No | - | onKeyUp property |
| `onKeyUpCapture` | `KeyboardEventHandler<T> | undefined` | No | - | onKeyUpCapture property |
| `onLoad` | `ReactEventHandler<T> | undefined` | No | - | onLoad property |
| `onLoadCapture` | `ReactEventHandler<T> | undefined` | No | - | onLoadCapture property |
| `onLoadedData` | `ReactEventHandler<T> | undefined` | No | - | onLoadedData property |
| `onLoadedDataCapture` | `ReactEventHandler<T> | undefined` | No | - | onLoadedDataCapture property |
| `onLoadedMetadata` | `ReactEventHandler<T> | undefined` | No | - | onLoadedMetadata property |
| `onLoadedMetadataCapture` | `ReactEventHandler<T> | undefined` | No | - | onLoadedMetadataCapture property |
| `onLoadStart` | `ReactEventHandler<T> | undefined` | No | - | onLoadStart property |
| `onLoadStartCapture` | `ReactEventHandler<T> | undefined` | No | - | onLoadStartCapture property |
| `onLostPointerCapture` | `PointerEventHandler<T> | undefined` | No | - | onLostPointerCapture property |
| `onLostPointerCaptureCapture` | `PointerEventHandler<T> | undefined` | No | - | onLostPointerCaptureCapture property |
| `onMouseDown` | `MouseEventHandler<T> | undefined` | No | - | onMouseDown property |
| `onMouseDownCapture` | `MouseEventHandler<T> | undefined` | No | - | onMouseDownCapture property |
| `onMouseEnter` | `MouseEventHandler<T> | undefined` | No | - | onMouseEnter property |
| `onMouseLeave` | `MouseEventHandler<T> | undefined` | No | - | onMouseLeave property |
| `onMouseMove` | `MouseEventHandler<T> | undefined` | No | - | onMouseMove property |
| `onMouseMoveCapture` | `MouseEventHandler<T> | undefined` | No | - | onMouseMoveCapture property |
| `onMouseOut` | `MouseEventHandler<T> | undefined` | No | - | onMouseOut property |
| `onMouseOutCapture` | `MouseEventHandler<T> | undefined` | No | - | onMouseOutCapture property |
| `onMouseOver` | `MouseEventHandler<T> | undefined` | No | - | onMouseOver property |
| `onMouseOverCapture` | `MouseEventHandler<T> | undefined` | No | - | onMouseOverCapture property |
| `onMouseUp` | `MouseEventHandler<T> | undefined` | No | - | onMouseUp property |
| `onMouseUpCapture` | `MouseEventHandler<T> | undefined` | No | - | onMouseUpCapture property |
| `onPaste` | `ClipboardEventHandler<T> | undefined` | No | - | onPaste property |
| `onPasteCapture` | `ClipboardEventHandler<T> | undefined` | No | - | onPasteCapture property |
| `onPause` | `ReactEventHandler<T> | undefined` | No | - | onPause property |
| `onPauseCapture` | `ReactEventHandler<T> | undefined` | No | - | onPauseCapture property |
| `onPlay` | `ReactEventHandler<T> | undefined` | No | - | onPlay property |
| `onPlayCapture` | `ReactEventHandler<T> | undefined` | No | - | onPlayCapture property |
| `onPlaying` | `ReactEventHandler<T> | undefined` | No | - | onPlaying property |
| `onPlayingCapture` | `ReactEventHandler<T> | undefined` | No | - | onPlayingCapture property |
| `onPointerCancel` | `PointerEventHandler<T> | undefined` | No | - | onPointerCancel property |
| `onPointerCancelCapture` | `PointerEventHandler<T> | undefined` | No | - | onPointerCancelCapture property |
| `onPointerDown` | `PointerEventHandler<T> | undefined` | No | - | onPointerDown property |
| `onPointerDownCapture` | `PointerEventHandler<T> | undefined` | No | - | onPointerDownCapture property |
| `onPointerEnter` | `PointerEventHandler<T> | undefined` | No | - | onPointerEnter property |
| `onPointerLeave` | `PointerEventHandler<T> | undefined` | No | - | onPointerLeave property |
| `onPointerMove` | `PointerEventHandler<T> | undefined` | No | - | onPointerMove property |
| `onPointerMoveCapture` | `PointerEventHandler<T> | undefined` | No | - | onPointerMoveCapture property |
| `onPointerOut` | `PointerEventHandler<T> | undefined` | No | - | onPointerOut property |
| `onPointerOutCapture` | `PointerEventHandler<T> | undefined` | No | - | onPointerOutCapture property |
| `onPointerOver` | `PointerEventHandler<T> | undefined` | No | - | onPointerOver property |
| `onPointerOverCapture` | `PointerEventHandler<T> | undefined` | No | - | onPointerOverCapture property |
| `onPointerUp` | `PointerEventHandler<T> | undefined` | No | - | onPointerUp property |
| `onPointerUpCapture` | `PointerEventHandler<T> | undefined` | No | - | onPointerUpCapture property |
| `onPress` | `() => void` | No | - | Press/click handler |
| `onProgress` | `ReactEventHandler<T> | undefined` | No | - | onProgress property |
| `onProgressCapture` | `ReactEventHandler<T> | undefined` | No | - | onProgressCapture property |
| `onRateChange` | `ReactEventHandler<T> | undefined` | No | - | onRateChange property |
| `onRateChangeCapture` | `ReactEventHandler<T> | undefined` | No | - | onRateChangeCapture property |
| `onReset` | `ReactEventHandler<T> | undefined` | No | - | onReset property |
| `onResetCapture` | `ReactEventHandler<T> | undefined` | No | - | onResetCapture property |
| `onScroll` | `UIEventHandler<T> | undefined` | No | - | onScroll property |
| `onScrollCapture` | `UIEventHandler<T> | undefined` | No | - | onScrollCapture property |
| `onScrollEnd` | `UIEventHandler<T> | undefined` | No | - | onScrollEnd property |
| `onScrollEndCapture` | `UIEventHandler<T> | undefined` | No | - | onScrollEndCapture property |
| `onSeeked` | `ReactEventHandler<T> | undefined` | No | - | onSeeked property |
| `onSeekedCapture` | `ReactEventHandler<T> | undefined` | No | - | onSeekedCapture property |
| `onSeeking` | `ReactEventHandler<T> | undefined` | No | - | onSeeking property |
| `onSeekingCapture` | `ReactEventHandler<T> | undefined` | No | - | onSeekingCapture property |
| `onSelect` | `ReactEventHandler<T> | undefined` | No | - | onSelect property |
| `onSelectCapture` | `ReactEventHandler<T> | undefined` | No | - | onSelectCapture property |
| `onStalled` | `ReactEventHandler<T> | undefined` | No | - | onStalled property |
| `onStalledCapture` | `ReactEventHandler<T> | undefined` | No | - | onStalledCapture property |
| `onSubmit` | `SubmitEventHandler<T> | undefined` | No | - | onSubmit property |
| `onSubmitCapture` | `SubmitEventHandler<T> | undefined` | No | - | onSubmitCapture property |
| `onSuspend` | `ReactEventHandler<T> | undefined` | No | - | onSuspend property |
| `onSuspendCapture` | `ReactEventHandler<T> | undefined` | No | - | onSuspendCapture property |
| `onTimeUpdate` | `ReactEventHandler<T> | undefined` | No | - | onTimeUpdate property |
| `onTimeUpdateCapture` | `ReactEventHandler<T> | undefined` | No | - | onTimeUpdateCapture property |
| `onToggle` | `ToggleEventHandler<T> | undefined` | No | - | onToggle property |
| `onTouchCancel` | `TouchEventHandler<T> | undefined` | No | - | onTouchCancel property |
| `onTouchCancelCapture` | `TouchEventHandler<T> | undefined` | No | - | onTouchCancelCapture property |
| `onTouchEnd` | `TouchEventHandler<T> | undefined` | No | - | onTouchEnd property |
| `onTouchEndCapture` | `TouchEventHandler<T> | undefined` | No | - | onTouchEndCapture property |
| `onTouchMove` | `TouchEventHandler<T> | undefined` | No | - | onTouchMove property |
| `onTouchMoveCapture` | `TouchEventHandler<T> | undefined` | No | - | onTouchMoveCapture property |
| `onTouchStart` | `TouchEventHandler<T> | undefined` | No | - | onTouchStart property |
| `onTouchStartCapture` | `TouchEventHandler<T> | undefined` | No | - | onTouchStartCapture property |
| `onTransitionCancel` | `TransitionEventHandler<T> | undefined` | No | - | onTransitionCancel property |
| `onTransitionCancelCapture` | `TransitionEventHandler<T> | undefined` | No | - | onTransitionCancelCapture property |
| `onTransitionEnd` | `TransitionEventHandler<T> | undefined` | No | - | onTransitionEnd property |
| `onTransitionEndCapture` | `TransitionEventHandler<T> | undefined` | No | - | onTransitionEndCapture property |
| `onTransitionRun` | `TransitionEventHandler<T> | undefined` | No | - | onTransitionRun property |
| `onTransitionRunCapture` | `TransitionEventHandler<T> | undefined` | No | - | onTransitionRunCapture property |
| `onTransitionStart` | `TransitionEventHandler<T> | undefined` | No | - | onTransitionStart property |
| `onTransitionStartCapture` | `TransitionEventHandler<T> | undefined` | No | - | onTransitionStartCapture property |
| `onVolumeChange` | `ReactEventHandler<T> | undefined` | No | - | onVolumeChange property |
| `onVolumeChangeCapture` | `ReactEventHandler<T> | undefined` | No | - | onVolumeChangeCapture property |
| `onWaiting` | `ReactEventHandler<T> | undefined` | No | - | onWaiting property |
| `onWaitingCapture` | `ReactEventHandler<T> | undefined` | No | - | onWaitingCapture property |
| `onWheel` | `WheelEventHandler<T> | undefined` | No | - | onWheel property |
| `onWheelCapture` | `WheelEventHandler<T> | undefined` | No | - | onWheelCapture property |
| `part` | `string | undefined` | No | - | part property |
| `popover` | `"" | "auto" | "manual" | "hint" | undefined` | No | - | popover property |
| `popoverTarget` | `string | undefined` | No | - | popoverTarget property |
| `popoverTargetAction` | `"toggle" | "show" | "hide" | undefined` | No | - | popoverTargetAction property |
| `prefix` | `string | undefined` | No | - | prefix property |
| `property` | `string | undefined` | No | - | property property |
| `radioGroup` | `string | undefined` | No | - | radioGroup property |
| `rel` | `string | undefined` | No | - | rel property |
| `resource` | `string | undefined` | No | - | resource property |
| `results` | `number | undefined` | No | - | results property |
| `rev` | `string | undefined` | No | - | rev property |
| `role` | `AriaRole | undefined` | No | - | role property |
| `security` | `string | undefined` | No | - | security property |
| `size` | `IconButtonSize` | No | - | Button size — f-step number or t-shirt alias. Default: 10 (M). |
| `slot` | `string | undefined` | No | - | slot property |
| `spellCheck` | `Booleanish | undefined` | No | - | spellCheck property |
| `style` | `CSSProperties` | No | - | Inline styles |
| `suppressContentEditableWarning` | `boolean | undefined` | No | - | suppressContentEditableWarning property |
| `suppressHydrationWarning` | `boolean | undefined` | No | - | suppressHydrationWarning property |
| `tabIndex` | `number | undefined` | No | - | tabIndex property |
| `title` | `string | undefined` | No | - | title property |
| `translate` | `"yes" | "no" | undefined` | No | - | translate property |
| `type` | `"submit" | "reset" | "button" | undefined` | No | - | type property |
| `typeof` | `string | undefined` | No | - | typeof property |
| `unselectable` | `"on" | "off" | undefined` | No | - | unselectable property |
| `value` | `string | readonly string[] | number | undefined` | No | - | value property |
| `vocab` | `string | undefined` | No | - | vocab property |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |


## Code Snippets

### Basic Usage

```tsx
import { IconButton } from '@oneui/ui';

<IconButton icon="add" aria-label="Add item" />
```

### Recipe Decisions

```json
{
  "component": "IconButton",
  "decisions": [
    "Shape"
  ]
}
```
