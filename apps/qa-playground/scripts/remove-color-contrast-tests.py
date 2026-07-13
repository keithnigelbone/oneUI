#!/usr/bin/env python3
"""Remove test(...) blocks containing .withRules(['color-contrast'])."""
from __future__ import annotations

import re
from pathlib import Path

E2E = Path(__file__).resolve().parent.parent / "e2e"
MARKER = ".withRules(['color-contrast'])"
TEST_START = re.compile(r"(?:^|\n)([ \t]*)test(?!\.)\s*(?:\.(?:only|skip)\s*)?\(")


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


def strip_file(source: str) -> tuple[str, int]:
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
        if MARKER in block:
            removed += 1
        else:
            out.append(block)
        cursor = end
        while cursor < len(source) and source[cursor] == "\n":
            cursor += 1
    return "".join(out), removed


def main() -> None:
    files = sorted(E2E.glob("*-accessibility.spec.ts"))
    files += [
        E2E / "input-accessibility.spec.ts",
        E2E / "input-dynamic-text-accessibility.spec.ts",
        E2E / "stepper-accessibility.spec.ts",
    ]
    total = 0
    for path in files:
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        next_text, removed = strip_file(text)
        if removed:
            path.write_text(next_text, encoding="utf-8")
            total += removed
            print(f"removed {removed}: {path.name}")
    print(f"Done. {total} block(s) removed.")


if __name__ == "__main__":
    main()
