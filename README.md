# 4Lists Obsidian Plugin

4Lists sorts selected lines by a trailing hierarchy coordinate.

## Coordinate syntax

The preferred form is an explicit `//` suffix:

```text
banana // 2
apple // 1
quest // 1-2-3
iced coffee // 1 1
```

Coordinates sort hierarchically, so `111`, `112`, `12`, `21`, `22`, and `3`
sort in that order. Space-separated and hyphenated coordinates both make
deeper levels explicit.

For compatibility, bare trailing coordinates such as `apple 1-2` and
`banana 3` are still recognized when sorting a legacy block with no explicit
`//` coordinates. Once a selected block contains explicit coordinates, lines
without `//` are treated as unnumbered. This keeps names that naturally end
in numbers, such as `Starcraft 2`, safe.

Lines without a recognized coordinate sort afterward in case-insensitive
alphabetical order.

## Commands

- **Sort Lines by End Coordinate** sorts the selected lines and keeps suffixes.
- **Sort Lines by End Coordinate and Remove // Suffix** sorts the selected
  lines and removes only valid explicit `//` suffixes.

To use either command, select one or more lines in the editor and run it from
the Command Palette.

## Sorting logic is basically a hybrid of

- **Alphabetical fallback sorting**
- **Terminal numeric priority sorting**
- **Hierarchical grouping coordinates**
- **Progressive nesting**
- **Natural “human-readable” structure instead of strict machine indexing**

## Core Quirk Logic

### 1. End-number sorting priority

You sort by the **number at the END of the line**.

Example:

```text
Apple 111
Echo 112
Cream 12
Fox 21
Docks 22
Banana 3
```

Gets interpreted like:

```text
111
112
12
21
22
3
```

Which creates grouped ordering.

---

### 2. Nested group semantics

The numbers are not just numbers.

They are:

```text
[group][subgroup][subsubgroup]
```

So:

| Value | Meaning                |
| ----- | ---------------------- |
| 1     | Main group 1           |
| 11    | subgroup of 1          |
| 111   | subgroup of subgroup   |
| 112   | sibling subgroup       |
| 12    | another branch under 1 |
| 21    | branch under 2         |

So the sort becomes almost tree-like.

---

### 3. “No number” items go to bottom alphabetically

one of the strongest quirks.

Example:

```text
Apple 111
Echo 112
Cream 12
Fox
Docks
Banana
```

Would become:

```text
Apple
Echo
Cream
Banana
Docks
Fox
```

Because:

- numbered entries sort first
- non-numbered entries become:

  - alphabetically ordered
  - bottom-priority
  - “unassigned/free-floating”

Almost like an inbox layer beneath structured hierarchy.

---

### 4. Hyphen support

also evolved toward:

```text
Cream 1-2
Fox 2-1
Echo 1-1-2
```

Instead of:

```text
Cream 12
Fox 21
Echo 112
```

Which is MUCH cleaner structurally.

Because now the parser understands:

```text
1-1-2
```

As:

```python
[1,1,2]
```

instead of ambiguous integer `112`.

---

### 5. Endless nested order groups

This is the important part.

Your system is effectively:

```text
1
1-1
1-1-1
1-1-1-1
1-2
1-2-1
2
2-1
```

Which means:

- infinite depth
- stable hierarchy
- human writable
- filesystem-like
- outline-like
- tree-like
- Dataview compatible
- regex parsable
- YAML compatible

That’s why it fits Obsidian so naturally.

---

## What makes the system unique

Most sort systems are either:

- alphabetical
- numerical
- tree-based
- tag-based

combines:

```text
human naming
+
hierarchical coordinates
+
natural language
+
partial ordering
+
fallback alphabetical logic
```

So it feels more like:

- outlining
- thought grouping
- symbolic nesting
- semantic coordinates

than traditional sorting.

---

## Coordinate-based semantic ordering

Like:

```text
Task 1-2-3
Idea 1-2-4
Quest 2-1
Vault 7-4-1
```

Where the suffix acts like:

- path
- rank
- grouping
- relation
- order
- hierarchy

all simultaneously.

## Current explicit suffix form

The preferred syntax places the coordinate after the final `//` marker:

```text
banana // 2
iced coffee // 1 1
quest // 1-2-3
```

Space-separated, hyphenated, and compact coordinates are accepted. Coordinates
are compared from left to right, so parents sort before deeper descendants:

```text
1
1 1
1 2
1 2 1
2
```

Lines with the same complete coordinate retain their original order.

Which ties directly into:

- DCS
- Arrow Grammar
- XP4Life
- VaultForge lanes
- nested YAML structures
- recursive documentation coordinates

Ive been orbiting this same structural philosophy for a long time now across different projects.
