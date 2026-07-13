#!/usr/bin/env python3
"""Remove Playwright tests classified as visual category (colour/fill/computed layout checks)."""
from __future__ import annotations

import re
from pathlib import Path

E2E = Path(__file__).resolve().parent.parent / "e2e"

TEST_START = re.compile(r"(?:^|\n)([ \t]*)test(?!\.)\s*(?:\.(?:only|skip)\s*)?\(")
DESCRIBE_START = re.compile(
    r"(?:^|\n)([ \t]*)test\.describe\s*(?:\.(?:only|skip)\s*)?\("
)

VISUAL_DESCRIBE = re.compile(
    r"test\.describe\s*\(\s*['\"](?:Visual/Responsive Tests|Visual|Badge — Applitools Visual)['\"]",
    re.I,
)

KEEP_TITLE = re.compile(
    r"distinct focus|keyboard trap|focus targets|focus order|tab visit|"
    r"focus ring \(computed\)|visible focus ring|appearance colou?r — N/A|"
    r"Appearance colou?r \(N/A\)|Icon colou?r inheritance \(N/A\)|"
    r"data-appearance|emits data-appearance",
    re.I,
)

VISUAL_TITLE = re.compile(
    r"fill colou?rs?|"
    r"distinct.*(colou?r|fill|background|stroke|indicator|accent|icon|label)|"
    r"(colou?r|background|fill|stroke).*distinct|"
    r"computed rgb|computed background|computed --_|"
    r"non-transparent|transparent fill|"
    r"stroke (colou?r|thickness)|"
    r"reduced opacity|reduces opacity|opacity 1 and|opacity ≤|"
    r"backgrounds differ|colou?rs differ|colou?rs look|use distinct|"
    r"object-fit|flex-wrap reflects|"
    r"dark mode.*(fill|colou?r|stroke|opaque)|opaque fill|"
    r"accent.*(fill|checked)|checked fill|"
    r"indicator stroke|track fill|shell background|"
    r"high vs low.*background|"
    r"primary vs (negative|secondary|sparkle|warning)|"
    r"appearance strip uses distinct|selected-label colou?rs|"
    r"loading animation \(computed\)|--_slider-fill|"
    r"different colou?r than enabled|selected fill changes after toggle \(computed\)|"
    r"distinct bold background|non-transparent background|"
    r"scales progressively|height scales|chip height|stroke thickness scales|"
    r"border radius|shape.*pill|"
    r"icon glyph uses non-transparent|foreground colou?r|"
    r"distinct backgrounds \(BUG-MODAL|opened appearance dialog has non-transparent|"
    r"onScroll.*divider|divider.*onScroll|"
    r"maxHeight|max-h|--_modal-max-h|"
    r"dot-only|without numerals|"
    r"label text renders|icon visible inside|heart icon visible|"
    r"attention=high: root opacity|attention=low vs high|"
    r"appearance=.*non-transparent background|"
    r"selected primary vs warning have distinct|appearance backgrounds \(computed\)|"
    r"high-attention selected fill visible in dark|"
    r"screenshot|toHaveScreenshot|Applitools|"
    r"trim animation|rotate animation|animation on indicator|animation on svg|"
    r"indeterminate.*animation|"
    r"horizontal offset stable|"
    r"fullWidth row fills",
    re.I,
)


def find_matching_close(source: str, open_paren: int) -> int:
    i = open_paren + 1
    paren = 1
    in_string: str | None = None
    escaped = False

    while i < len(source):
        ch = source[i]
        if in_string:
            if escaped:
                escaped = False
            elif ch == "\\":
                escaped = True
            elif ch == in_string:
                in_string = None
            i += 1
            continue
        if ch in ("'", '"', "`"):
            in_string = ch
            i += 1
            continue
        if ch == "(":
            paren += 1
        elif ch == ")":
            paren -= 1
            if paren == 0:
                return i + 1
        i += 1
    return len(source)


def extract_test_title(block: str) -> str:
    m = re.search(r"test\s*(?:\.(?:only|skip)\s*)?\(\s*(['\"`])(.*?)\1", block, re.S)
    return m.group(2) if m else ""


def is_visual_test(block: str) -> bool:
    title = extract_test_title(block)
    if not title:
        return False
    if KEEP_TITLE.search(title):
        return False
    return bool(VISUAL_TITLE.search(title))


def strip_test_blocks(source: str) -> tuple[str, int]:
    removed = 0
    out: list[str] = []
    cursor = 0
    while cursor < len(source):
        m = TEST_START.search(source, cursor)
        if not m:
            out.append(source[cursor:])
            break
        start = m.start()
        if source[start] == "\n":
            start += 1
        out.append(source[cursor:start])
        open_paren = source.find("(", start)
        end = find_matching_close(source, open_paren)
        block = source[start:end]
        if is_visual_test(block):
            removed += 1
        else:
            out.append(block)
        cursor = end
        while cursor < len(source) and source[cursor] == "\n":
            cursor += 1
    return "".join(out), removed


def strip_visual_describes(source: str) -> tuple[str, int]:
    removed = 0
    out: list[str] = []
    cursor = 0
    while cursor < len(source):
        m = DESCRIBE_START.search(source, cursor)
        if not m:
            out.append(source[cursor:])
            break
        start = m.start()
        if source[start] == "\n":
            start += 1
        block_head = source[start : start + 200]
        if not VISUAL_DESCRIBE.search(block_head):
            out.append(source[cursor:start])
            # advance past this describe name only — let test strip handle inner tests
            open_paren = source.find("(", start)
            end = find_matching_close(source, open_paren)
            out.append(source[start:end])
            cursor = end
            while cursor < len(source) and source[cursor] == "\n":
                cursor += 1
            continue
        out.append(source[cursor:start])
        open_paren = source.find("(", start)
        end = find_matching_close(source, open_paren)
        removed += 1
        cursor = end
        while cursor < len(source) and source[cursor] == "\n":
            cursor += 1
    return "".join(out), removed


def clean_file(path: Path) -> tuple[int, int]:
    source = path.read_text(encoding="utf-8")
    source, d_removed = strip_visual_describes(source)
    source, t_removed = strip_test_blocks(source)
    if d_removed or t_removed:
        path.write_text(source, encoding="utf-8")
    return d_removed, t_removed


def main() -> None:
    files = sorted(E2E.glob("*-qa.spec.ts"))
    files.append(E2E / "badge-playground" / "functional.spec.ts")
    total_tests = 0
    total_describes = 0
    for path in files:
        if not path.exists():
            continue
        d, t = clean_file(path)
        if d or t:
            print(f"{path.relative_to(E2E.parent)}: removed {t} test(s), {d} describe(s)")
        total_tests += t
        total_describes += d

    for rel in ("e2e/button-visual.spec.ts", "e2e/badge-playground/visual.spec.ts"):
        path = E2E.parent / rel
        if path.exists():
            path.unlink()
            print(f"deleted {rel}")

    print(f"Done — {total_tests} tests, {total_describes} describe blocks removed")


if __name__ == "__main__":
    main()
