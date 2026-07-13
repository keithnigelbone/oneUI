# Badge (native) — slot padding guide

RN `Badge` outer **container** padding depends on **`size`**, whether **`start` / `end`** slots are filled, and whether each slot root is treated as a **nested badge** or **icon-style** slot.

**Source**

| Piece | Location |
| --- | --- |
| Resolver | [`packages/ui-native/src/components/Badge/Badge.styles.native.ts`](../packages/ui-native/src/components/Badge/Badge.styles.native.ts) — `resolveBadgeContainerPadding()` |
| Flags from slots | [`packages/ui-native/src/components/Badge/Badge.native.tsx`](../packages/ui-native/src/components/Badge/Badge.native.tsx) — `slotUsesBadgeInset()` |

**Token rule:** every cell in the padding tables is **`tokens.spacing['key']`**, written as **`Spacing-{key}`** (e.g. `Spacing-1-5` → key `'1-5'`). Under the hood, **§3** uses `paddingHorizontal` / `paddingVertical` (symmetric L/R and T/B); the **Top / Bottom / Left / Right** columns list the **equivalent** edge values. Px changes by platform/density.

---

## 1. Badge vs icon (detection)

| Slot classification | Meaning |
| --- | --- |
| **Nested badge** | The **single root element** rendered in `start` or `end` is **`IndicatorBadge`** or **`CounterBadge`** (`node.type ===` that component). |
| **Icon-style** | Anything else: `Avatar`, `Icon`, or a **`View`/wrapper** around a badge (wrapper breaks detection — classify as icon). |

`Badge.native.tsx` builds:

```text
BadgeSlotPaddingFlags = {
  startIsBadge: slotUsesBadgeInset(start),
  endIsBadge: slotUsesBadgeInset(end),
}
```

---

## 2. Combination → resolver (logic order)

`resolveBadgeContainerPadding()` evaluates **in this order** (first match wins):

| Step | Condition | Resolver function |
| --- | --- | --- |
| A | No `start` **and** no `end` | Default `PAD_H` + `PAD_V` only |
| B | **`start` + `end` both filled**, icon start → badge end (`!startBadge && endBadge`) | **`slotPaddingMixedIconStartBadgeEnd`** |
| C | **`start` + `end` both filled**, badge start → icon end (`startBadge && !endBadge`) | **`slotPaddingMixedBadgeStartIconEnd`** |
| D | Else if **either** slot is nested badge (`startBadge` **or** `endBadge`): single-slot badge **or** badge+badge | **`slotPaddingNestedBadge`** |
| E | **`start` + `end`** both icon-only | **`slotPaddingBoth`** |
| F | `start` only (icon-only path; step D didn’t trigger) | **`slotPaddingStart`** |
| G | `end` only | **`slotPaddingEnd`** |

**Important**

- Mixed **icon + badge** rules apply only when **both slots are present**. If only one slot has a badge, step **D** uses **nested symmetric** padding.
- Badge+badge keeps **nested symmetric** (not mixed).



| Badge `size` | Top | Bottom | Left | Right |
| --- | --- | --- | --- | --- |
| xs, s | `Spacing-0-5` | `Spacing-0-5` | `Spacing-1` | `Spacing-1` |
| m | `Spacing-0-5` | `Spacing-0-5` | `Spacing-1-5` | `Spacing-1-5` |
| l | `Spacing-0-5` | `Spacing-0-5` | `Spacing-2` | `Spacing-2` |
| xl | `Spacing-1` | `Spacing-1` | `Spacing-2-5` | `Spacing-2-5` |

---

## 4. Mixed — icon start + nested badge end (step B)

**Both slots only.**

| size | Top | Bottom | Left | Right |
| --- | --- | --- | --- | --- |
| xs, s | `Spacing-0-5` | `Spacing-0-5` | `Spacing-0-5` | `Spacing-1` |
| m | `Spacing-0-5` | `Spacing-0-5` | `Spacing-1` | `Spacing-1-5` |
| l | `Spacing-0-5` | `Spacing-0-5` | `Spacing-1` | `Spacing-2` |
| xl | `Spacing-1` | `Spacing-1` | `Spacing-1-5` | `Spacing-2-5` |

---

## 5. Mixed — nested badge start + icon end (step C)

**Both slots only.** (Mirror L/R vs §4.)

| size | Top | Bottom | Left | Right |
| --- | --- | --- | --- | --- |
| xs, s | `Spacing-0-5` | `Spacing-0-5` | `Spacing-1` | `Spacing-0-5` |
| m | `Spacing-0-5` | `Spacing-0-5` | `Spacing-1-5` | `Spacing-1` |
| l | `Spacing-0-5` | `Spacing-0-5` | `Spacing-2` | `Spacing-1` |
| xl | `Spacing-1` | `Spacing-1` | `Spacing-2-5` | `Spacing-1-5` |

---

## 6. Nested symmetric — badge-only slot(s) incl. badge+badge (step D)

Used when:

- **`start`** is nested badge **or** **`end`** is nested badge, **and**
- not matched by mixed B/C (either only **one** slot is used **or** **both** are badges).

| size | Top | Bottom | Left | Right |
| --- | --- | --- | --- | --- |
| xs, s | `Spacing-0-5` | `Spacing-0-5` | `Spacing-1` | `Spacing-1` |
| m | `Spacing-0-5` | `Spacing-0-5` | `Spacing-1-5` | `Spacing-1-5` |
| l | `Spacing-0-5` | `Spacing-0-5` | `Spacing-2` | `Spacing-2` |
| xl | `Spacing-1` | `Spacing-1` | `Spacing-2-5` | `Spacing-2-5` |

---

## 7. Icon-only — single start slot (step F)

| size | Top | Bottom | Left | Right |
| --- | --- | --- | --- | --- |
| xs, s | `Spacing-0-5` | `Spacing-0-5` | `Spacing-0-5` | `Spacing-1` |
| m | `Spacing-0-5` | `Spacing-0-5` | `Spacing-1` | `Spacing-1-5` |
| l | `Spacing-0-5` | `Spacing-0-5` | `Spacing-1` | `Spacing-2` |
| xl | `Spacing-1` | `Spacing-1` | `Spacing-1-5` | `Spacing-2-5` |

---

## 8. Icon-only — single end slot (step G)

(Mirror L/R vs §7; same Top/Bottom.)

| size | Top | Bottom | Left | Right |
| --- | --- | --- | --- | --- |
| xs, s | `Spacing-0-5` | `Spacing-0-5` | `Spacing-1` | `Spacing-0-5` |
| m | `Spacing-0-5` | `Spacing-0-5` | `Spacing-1-5` | `Spacing-1` |
| l | `Spacing-0-5` | `Spacing-0-5` | `Spacing-2` | `Spacing-1` |
| xl | `Spacing-1` | `Spacing-1` | `Spacing-2-5` | `Spacing-1-5` |

---

## 9. Icon-only — both slots (step E)

| size | Top | Bottom | Left | Right |
| --- | --- | --- | --- | --- |
| xs, s | `Spacing-0-5` | `Spacing-0-5` | `Spacing-0-5` | `Spacing-0-5` |
| m, l | `Spacing-0-5` | `Spacing-0-5` | `Spacing-1` | `Spacing-1` |
| xl | `Spacing-1` | `Spacing-1` | `Spacing-1-5` | `Spacing-1-5` |

---

## 10. Quick reference matrix (start/end content)

Assume **Y** = slot filled with nested badge (**IndicatorBadge** / **CounterBadge** root), **N** = filled with icon-style content **or empty**.

| start | end | Padding path (see §) |
| --- | --- | --- |
| empty | empty | §3 Default |
| N (icon) | empty | §7 Icon start |
| empty | N (icon) | §8 Icon end |
| N | N | §9 Icon both |
| Y | empty | §6 Nested |
| empty | Y | §6 Nested |
| Y | Y | §6 Nested |
| N | Y | §4 Mixed icon→badge |
| Y | N | §5 Mixed badge→icon |

---

## 11. Slot gaps (additional to padding)

Outer padding above is on the Badge **container**. Between the slot wrappers and label, **`SLOT_LEFT` / `SLOT_RIGHT`** still apply **`marginRight` / `marginLeft`** from **`GAP`** in `Badge.styles.native.ts`:

| size | Gap token (approx. role) |
| --- | --- |
| xs, s | `Spacing-0-5` |
| m, l | `Spacing-1` |
| xl | `Spacing-1-5` |

Combine padding + margins when auditing total spacing.

---

## 12. Web parity note

Web `Badge.module.css` uses `:has(.start)` and token-only padding. Native uses explicit TS branches for nested-badge detection + mixed icon/badge rows. Behaviour is **aligned in intent** where specified; mismatches should be tracked in [`badge-web-native-parity.md`](parity/badge-web-native-parity.md).

