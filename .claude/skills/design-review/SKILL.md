---
name: design-review
description: Audit Bridged admin dashboard UI against the design system — runs the mechanical rule checker (antd/other icon sets, new CSS, hex colours, radius scale, popper selects, native confirm, raw tables, toast copy, missing-value dashes, number locale, hand-made callouts, info-as-status badges, "...", US spellings) and a full ui-reviewer pass. Use before committing UI work, when asked to "review the design", "check consistency" or "audit this page", or to measure a page against the standard.
---

# Design review

## 1. Mechanical checks

```bash
node .claude/skills/design-review/scripts/check-ui.js            # uncommitted changes
node .claude/skills/design-review/scripts/check-ui.js --branch   # everything this branch changed vs main
node .claude/skills/design-review/scripts/check-ui.js --all      # whole codebase (legacy debt included)
node .claude/skills/design-review/scripts/check-ui.js src/presentation/Teams   # specific files or folders
```

- **ERROR** findings break a hard rule: antd, another icon set, a new stylesheet, native `confirm`/`alert`.
- **WARN** findings are strong hints. Read each one in context before acting:
  - code identifiers can trip the spelling check;
  - legacy files carry known debt such as "Failed to …" toasts.
- On a scoped task, fix the findings in files you touched. Don't fix the whole codebase uninvited.

## 2. Judgement review

Delegate to the `ui-reviewer` subagent. Give it the scope: uncommitted changes, specific files or a branch. It checks:

- reuse of the app components;
- page anatomy and toolbar order;
- tokens and radius;
- states (loading, empty, error);
- copy;
- motion;
- mobile;
- that no logic changed.

It returns verified findings with file:line and a fix.

## 3. Live check

Use the `verify-ui` skill for anything a screenshot would settle: layout, dark mode, phone width.

## 4. Report

Merge the results into one list, ordered most severe first. For each item give file:line, the rule (a section of `docs/design-system.md`) and the fix. When asked to, apply the fixes, then re-run step 1.
