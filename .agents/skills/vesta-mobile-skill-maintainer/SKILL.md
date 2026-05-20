---
name: vesta-mobile-skill-maintainer
description: Maintains the local vesta-mobile Codex preference system. Use when refreshing history-mined rules, reviewing proposed preference updates, regenerating repo-local skills or AGENTS guidance, or producing the codebase improvement backlog from the accepted rules.
---

# Vesta-Mobile Skill Maintainer

Use this skill when updating the preference system itself or when turning accepted rules into a cleanup backlog.

## Workflow

- Refresh history-derived proposals with `pnpm codex:skills:refresh`.
- Review queued updates in `tools/codex-preferences/data/proposed-rules.json` before activating anything.
- Accept a proposal with `pnpm codex:skills:accept -- <rule-id>` and then regenerate the repo-local skills.
- Regenerate local skills and root agent guidance with `pnpm codex:skills:generate`.
- Produce a fresh codebase cleanup backlog with `pnpm codex:skills:audit`.
- Do not mutate active skills directly from a single new prompt or one low-confidence correction.

## Check worktree state before broad structural changes

- Directive: Before broad refactors or repo sweeps, inspect git status and isolate the work so existing in-progress feature edits are not clobbered.
- Trigger phrases: `large refactor`, `dirty worktree`, `git status`
- Avoid:
  - Sweeping refactors in a dirty worktree without checking current edits
