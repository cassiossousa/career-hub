---
name: context-scout
description: Refresh .agents/context/ project context files via the scout subagent — run after meaningful changes or when context is stale.
argument-hint: '[area]'
agent: scout
---

Refresh the career-hub project context store.

1. Read `.agents/context/index.md` to learn the area files and protocol.
2. If an area argument was provided (e.g. `job-tracker-app`), scope the review to that file; otherwise determine scope from `git status` and `git log` since the oldest `last-reviewed:` SHA in the area files' frontmatter.
3. Survey the changes and update the affected `.agents/context/*.md` files per the scout's rules: product purpose, architecture, invariants, pitfalls, pointers — never duplicated rule text. Bump `last-reviewed:` to `git rev-parse HEAD` on every file you verified, even when no prose changed.
4. Clear `.agents/context/.runtime/unsurveyed-edits` and stale `.runtime/blocked-*` markers when done.
5. Report which files changed and why in ≤10 lines.
