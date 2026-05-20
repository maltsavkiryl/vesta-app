---
name: vesta-mobile-skill-maintainer
description: Maintains the local vesta-mobile Codex preference system. Use when refreshing history-mined rules, reviewing proposed preference updates, regenerating repo-local skills or AGENTS guidance, or producing the codebase improvement backlog from the accepted rules.
---

# Vesta-Mobile Skill Maintainer

Use this skill when updating the preference system itself or when turning accepted rules into a cleanup backlog.

## Use This When

- You are updating the local skills, rule manifests, or agent routing.
- You need to regenerate skills, reports, or the codebase improvement backlog.
- A new repeated correction should become a drafted rule rather than a one-off memory.

## Do Not Use This For

- Normal feature implementation, UI polish, or app debugging.
- Platform-specific component decisions that belong to iOS, Android, or React Native execution skills.

## Workflow

- Refresh raw history signals with `pnpm codex:skills:refresh`.
- Review `tools/codex-preferences/data/proposed-rules.json` before promoting anything.
- Accept only durable patterns with `pnpm codex:skills:accept -- <rule-id>`.
- Regenerate `.agents/skills/*`, `AGENTS.md`, and local metadata with `pnpm codex:skills:generate`.
- Rebuild the cleanup backlog with `pnpm codex:skills:audit` and review the latest generated reports before broad sweeps.

## Health Checks

- Read `tools/codex-preferences/generated/skill-gap-report.md` to see what stays local versus upstream.
- Read `tools/codex-preferences/generated/skill-health-report.md` to catch weak trigger coverage or overlap.
- Read `tools/codex-preferences/generated/codebase-improvement-report.md` before starting a codebase cleanup pass.

## Active Repo Rules

## Check worktree state before broad structural changes

- Directive: Before broad refactors or repo sweeps, inspect git status and isolate the work so existing in-progress feature edits are not clobbered.
- Match when: `large refactor`, `dirty worktree`, `git status`
- Avoid:
  - Sweeping refactors in a dirty worktree without checking current edits
