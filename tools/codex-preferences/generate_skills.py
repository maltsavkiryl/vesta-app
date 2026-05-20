from __future__ import annotations

from collections import defaultdict
from pathlib import Path
from typing import Any

from common import (
    AGENTS_SKILLS_DIR,
    DOMAIN_TO_SKILL,
    ROOT_AGENTS_PATH,
    SCOPE_LABEL,
    accepted_manifest,
    ensure_dir,
    write_text,
)


SKILL_CONFIG = {
    "vesta-mobile-product-judgment": {
        "description": "Repo-specific product and UX judgment for vesta-mobile. Use when refining mobile screen usefulness, trimming low-signal UI, simplifying copy, deciding between local versus shared UI fixes, or matching the app to the user's preferred native-feeling employee experience.",
        "title": "Vesta-Mobile Product Judgment",
        "intro": "Use this skill when the main question is product judgment rather than framework mechanics. Bias toward useful, calm, native-feeling surfaces.",
    },
    "vesta-mobile-native-ios": {
        "description": "Repo-specific native iOS guidance for vesta-mobile. Use when implementing or reviewing Apple-native UI, Liquid Glass, segmented controls, grouped settings panes, iPhone-first detail screens, or any request that says actual native, real native, Apple-native, refined, or still looks weird on iOS.",
        "title": "Vesta-Mobile Native iOS",
        "intro": "Use this skill when iOS-native feel is central. Prefer real platform behavior over JavaScript lookalikes.",
    },
    "vesta-mobile-native-android": {
        "description": "Repo-specific Android guidance for vesta-mobile. Use when implementing Android-facing picker flows, platform dialogs, Material-style interaction choices, or deciding whether a mobile flow should stay lightweight and native on Android instead of growing into custom UI.",
        "title": "Vesta-Mobile Native Android",
        "intro": "Use this skill for Android-specific interaction choices. Keep simple flows lightweight and platform-familiar.",
    },
    "vesta-mobile-react-native-architecture": {
        "description": "Repo-specific React Native architecture guidance for vesta-mobile. Use when refactoring screens, providers, repositories, workflows, or app structure; when splitting large files into hooks and reusable components; or when enforcing the repo's clean-break HTTP-ready architecture direction.",
        "title": "Vesta-Mobile React Native Architecture",
        "intro": "Use this skill for architectural refactors and screen decomposition. Optimize for repo-specific boundaries, not generic patterns.",
    },
    "vesta-mobile-debug-and-validation": {
        "description": "Repo-specific debugging and validation workflow for vesta-mobile. Use when the user pastes exact stack traces, route errors, native build failures, machine-state issues, or asks why a mobile runtime/build error is happening.",
        "title": "Vesta-Mobile Debug And Validation",
        "intro": "Use this skill when debugging. Start from the exact failing file, route, or first hard blocker.",
    },
    "vesta-mobile-skill-maintainer": {
        "description": "Maintains the local vesta-mobile Codex preference system. Use when refreshing history-mined rules, reviewing proposed preference updates, regenerating repo-local skills or AGENTS guidance, or producing the codebase improvement backlog from the accepted rules.",
        "title": "Vesta-Mobile Skill Maintainer",
        "intro": "Use this skill when updating the preference system itself or when turning accepted rules into a cleanup backlog.",
    },
}


def render_rule(rule: dict[str, Any]) -> str:
    lines = [
        f"## {rule['title']}",
        "",
        f"- Directive: {rule['directive']}",
    ]
    triggers = ", ".join(f"`{trigger}`" for trigger in rule.get("triggerPhrases", []))
    if triggers:
        lines.append(f"- Trigger phrases: {triggers}")
    anti_patterns = rule.get("antiPatterns", [])
    if anti_patterns:
        lines.append("- Avoid:")
        for item in anti_patterns:
            lines.append(f"  - {item}")
    hotspots = rule.get("hotspots", [])
    if hotspots:
        lines.append("- Review hotspots first:")
        for item in hotspots:
            lines.append(f"  - `{item}`")
    return "\n".join(lines)


def render_skill(skill_name: str, rules: list[dict[str, Any]]) -> str:
    config = SKILL_CONFIG[skill_name]
    body = [
        "---",
        f"name: {skill_name}",
        f"description: {config['description']}",
        "---",
        "",
        f"# {config['title']}",
        "",
        config["intro"],
        "",
        "## Workflow",
        "",
    ]
    if skill_name == "vesta-mobile-skill-maintainer":
        body.extend(
            [
                "- Refresh history-derived proposals with `pnpm codex:skills:refresh`.",
                "- Review queued updates in `tools/codex-preferences/data/proposed-rules.json` before activating anything.",
                "- Accept a proposal with `pnpm codex:skills:accept -- <rule-id>` and then regenerate the repo-local skills.",
                "- Regenerate local skills and root agent guidance with `pnpm codex:skills:generate`.",
                "- Produce a fresh codebase cleanup backlog with `pnpm codex:skills:audit`.",
                "- Do not mutate active skills directly from a single new prompt or one low-confidence correction.",
                "",
            ]
        )
    else:
        body.extend(
            [
                "- Prefer these repo-local rules over upstream imported mobile skill packs when they conflict.",
                "- Apply the rule that matches the user's exact wording first, especially direct corrections and screenshot feedback.",
                "- Favor the shared-layer fix only when the issue is clearly shared; otherwise localize the change to the affected context.",
                "",
            ]
        )
    for rule in rules:
        body.append(render_rule(rule))
        body.append("")
    return "\n".join(body).rstrip() + "\n"


def render_agents_md(grouped: dict[str, list[dict[str, Any]]]) -> str:
    sections = [
        "# Vesta-Mobile Agent Guide",
        "",
        "This repository has a local Codex overlay skill pack. For `vesta-mobile` work, prefer these repo-local skills before relying on the imported upstream mobile plugins when their guidance conflicts.",
        "",
        "## Skill Order",
        "",
        "- `vesta-mobile-debug-and-validation` for errors, stack traces, and native build/runtime issues.",
        "- `vesta-mobile-native-ios` when the user asks for actual native, Apple-native, refined, Liquid Glass, or real iOS controls.",
        "- `vesta-mobile-native-android` when the flow should stay lightweight and platform-familiar on Android.",
        "- `vesta-mobile-react-native-architecture` for repo structure, repositories/workflows, provider boundaries, and screen decomposition.",
        "- `vesta-mobile-product-judgment` for copy, chrome pruning, low-signal UI removal, and contextual UI choices.",
        "- `vesta-mobile-skill-maintainer` when updating the preference system or generating the cleanup backlog.",
        "",
        "## Working Rules",
        "",
        "- Inspect `git status` before broad sweeps or large refactors.",
        "- Start from the exact failing file, route, or first hard blocker in the user's pasted log.",
        "- Prefer real native controls and platform behavior over JavaScript lookalikes when the user asks for actual native behavior.",
        "- Keep shell providers thin; do not recreate provider-to-feature cycles.",
        "- Split large screens into shells, hooks, and reusable components instead of growing monoliths.",
        "- Delete exact low-value UI blocks when the user points them out; do not soften them into renamed clutter.",
        "- Separate machine-state failures from repo-state failures before changing application code.",
        "",
        "## Maintenance Commands",
        "",
        "- `pnpm codex:skills:refresh`",
        "- `pnpm codex:skills:generate`",
        "- `pnpm codex:skills:audit`",
        "- `pnpm codex:skills:report`",
        "- `pnpm codex:skills:accept -- <rule-id>`",
        "",
        "## Local Skills",
        "",
    ]
    for skill_name in DOMAIN_TO_SKILL.values():
        rule_count = len(grouped.get(skill_name, []))
        sections.append(f"- `{skill_name}` with `{rule_count}` active rules")
    sections.append("")
    return "\n".join(sections)


def main() -> None:
    manifest = accepted_manifest()
    grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for rule in manifest["rules"]:
        grouped[rule["skill"]].append(rule)

    ensure_dir(AGENTS_SKILLS_DIR)
    for skill_name in DOMAIN_TO_SKILL.values():
        skill_dir = AGENTS_SKILLS_DIR / skill_name
        ensure_dir(skill_dir)
        write_text(skill_dir / "SKILL.md", render_skill(skill_name, grouped.get(skill_name, [])))

    write_text(ROOT_AGENTS_PATH, render_agents_md(grouped))
    print(f"Generated local skills for {SCOPE_LABEL}.")


if __name__ == "__main__":
    main()
