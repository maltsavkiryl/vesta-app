from __future__ import annotations

from collections import defaultdict
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


SKILL_ORDER = list(DOMAIN_TO_SKILL.values())

SKILL_CONFIG = {
    "vesta-mobile-product-judgment": {
        "description": "Repo-specific product and UX judgment for vesta-mobile. Use when refining mobile screen usefulness, trimming low-signal UI, simplifying copy, deciding between local versus shared UI fixes, or matching the app to the user's preferred native-feeling employee experience.",
        "title": "Vesta-Mobile Product Judgment",
        "intro": "Use this skill when the main question is product judgment rather than framework mechanics. Bias toward useful, calm, native-feeling surfaces.",
        "display_name": "Vesta-Mobile Product Judgment",
        "short_description": "Repo-specific UX and product cleanup rules for vesta-mobile screens.",
        "default_prompt": "Use $vesta-mobile-product-judgment to review this screen for low-value UI, weak copy, or a local-versus-shared UX fix choice.",
        "use_when": [
            "The user asks for a critical UX review, cleaner copy, or less clutter.",
            "A screen should feel calmer, more focused, or more native without changing core architecture.",
            "You need to choose between a contextual local UI fix and a shared design-system change.",
        ],
        "do_not_use": [
            "Pure platform mechanics such as which iOS or Android component API to use.",
            "Repo-level architecture refactors, provider boundaries, or debugging root-cause triage.",
        ],
        "upstream": [
            ("react-native-design", "Use after the local rule picks the UX direction and you need React Native implementation patterns."),
            ("ios-design-guidelines", "Use when the judgment call should map to Apple-native hierarchy or control behavior."),
            ("android-design-guidelines", "Use when the judgment call should map to Android-native affordances or Material behavior."),
        ],
    },
    "vesta-mobile-native-ios": {
        "description": "Repo-specific native iOS guidance for vesta-mobile. Use when implementing or reviewing Apple-native UI, Liquid Glass, segmented controls, grouped settings panes, iPhone-first detail screens, or any request that says actual native, real native, Apple-native, refined, or still looks weird on iOS.",
        "title": "Vesta-Mobile Native iOS",
        "intro": "Use this skill when iOS-native feel is central. Prefer real platform behavior over JavaScript lookalikes.",
        "display_name": "Vesta-Mobile Native iOS",
        "short_description": "Repo-local Apple-native guidance layered on top of the imported HIG skill.",
        "default_prompt": "Use $vesta-mobile-native-ios to decide the repo-specific iOS direction for this React Native screen, then map it to the proper native implementation path.",
        "use_when": [
            "The user says actual native, real native, Apple-native, Liquid Glass, or refined on iOS.",
            "Profile, settings, tabs, segmented controls, or detail rows should feel like a real iPhone app.",
            "You must choose between a JS approximation and a real native iOS path already available in the stack.",
        ],
        "do_not_use": [
            "Generic copy cleanup or clutter removal with no iOS-specific behavior decision.",
            "Android-first interaction choices or architecture-level repository/provider refactors.",
        ],
        "upstream": [
            ("ios-design-guidelines", "Use for HIG mechanics, spacing, accessibility, and component conventions after the local rule chooses the direction."),
            ("react-native-design", "Use for the React Native implementation pattern once the Apple-native target behavior is clear."),
        ],
    },
    "vesta-mobile-native-android": {
        "description": "Repo-specific Android guidance for vesta-mobile. Use when implementing Android-facing picker flows, platform dialogs, Material-style interaction choices, or deciding whether a mobile flow should stay lightweight and native on Android instead of growing into custom UI.",
        "title": "Vesta-Mobile Native Android",
        "intro": "Use this skill for Android-specific interaction choices. Keep simple flows lightweight and platform-familiar.",
        "display_name": "Vesta-Mobile Native Android",
        "short_description": "Repo-local Android interaction guidance layered on top of the imported Material skill.",
        "default_prompt": "Use $vesta-mobile-native-android to choose the repo-specific Android flow direction for this screen before implementing the Material or React Native details.",
        "use_when": [
            "A time picker, upload flow, dialog, or compact choice should stay lightweight on Android.",
            "You need to choose between a custom React Native flow and a platform-familiar Android pattern.",
            "The user wants native-feeling Android behavior rather than a larger custom UI.",
        ],
        "do_not_use": [
            "Broad visual cleanup or copy simplification that is not Android-specific.",
            "iOS-native behavior decisions or shared architecture cleanup.",
        ],
        "upstream": [
            ("android-design-guidelines", "Use for Material 3 mechanics, accessibility, and Android behavior once the local flow decision is made."),
            ("react-native-design", "Use for the React Native implementation path after the Android interaction choice is clear."),
        ],
    },
    "vesta-mobile-react-native-architecture": {
        "description": "Repo-specific React Native architecture guidance for vesta-mobile. Use when refactoring screens, providers, repositories, workflows, or app structure; when splitting large files into hooks and reusable components; or when enforcing the repo's clean-break HTTP-ready architecture direction.",
        "title": "Vesta-Mobile React Native Architecture",
        "intro": "Use this skill for architectural refactors and screen decomposition. Optimize for repo-specific boundaries, not generic patterns.",
        "display_name": "Vesta-Mobile React Native Architecture",
        "short_description": "Repo-specific architecture rules for repositories, providers, workflows, and decomposition.",
        "default_prompt": "Use $vesta-mobile-react-native-architecture to choose the correct repo structure and refactor direction before changing this React Native feature.",
        "use_when": [
            "The task is about repo structure, provider boundaries, repositories, workflows, or cleanup direction.",
            "A screen, hook, or component has become too large and should be decomposed.",
            "You need the vesta-mobile opinion on clean-break boundaries rather than generic React Native advice.",
        ],
        "do_not_use": [
            "Pure product polish, copy cleanup, or platform styling with no structural decision.",
            "Native build troubleshooting or machine-state diagnostics.",
        ],
        "upstream": [
            ("react-native-design", "Use for implementation-level React Native composition patterns after the repo boundary choice is made."),
            ("react-native-best-practices", "Use for complementary React Native engineering guidance that does not override the repo's boundary decisions."),
        ],
    },
    "vesta-mobile-debug-and-validation": {
        "description": "Repo-specific debugging and validation workflow for vesta-mobile. Use when the user pastes exact stack traces, route errors, native build failures, machine-state issues, or asks why a mobile runtime/build error is happening.",
        "title": "Vesta-Mobile Debug And Validation",
        "intro": "Use this skill when debugging. Start from the exact failing file, route, or first hard blocker.",
        "display_name": "Vesta-Mobile Debug And Validation",
        "short_description": "Repo-specific debugging workflow for route errors, stack traces, and native failures.",
        "default_prompt": "Use $vesta-mobile-debug-and-validation to triage this exact vesta-mobile error from the first hard blocker rather than from generic troubleshooting steps.",
        "use_when": [
            "The user pastes a stack trace, import error, route failure, or native build failure.",
            "You must separate repo-state bugs from missing local tooling or simulator setup.",
            "The correct first step is determining which exact file, route, or binary mismatch caused the failure.",
        ],
        "do_not_use": [
            "Intentional feature refactors where nothing is currently broken.",
            "Pure UI polish or product judgment requests with no error or validation loop.",
        ],
        "upstream": [
            ("react-native-best-practices", "Use for supporting React Native engineering practices after the repo-specific root cause is identified."),
            ("react-native-testing", "Use when the next step after diagnosis is validating or hardening the behavior with tests."),
        ],
    },
    "vesta-mobile-skill-maintainer": {
        "description": "Maintains the local vesta-mobile Codex preference system. Use when refreshing history-mined rules, reviewing proposed preference updates, regenerating repo-local skills or AGENTS guidance, or producing the codebase improvement backlog from the accepted rules.",
        "title": "Vesta-Mobile Skill Maintainer",
        "intro": "Use this skill when updating the preference system itself or when turning accepted rules into a cleanup backlog.",
        "display_name": "Vesta-Mobile Skill Maintainer",
        "short_description": "Maintains the local vesta-mobile skill overlay, reports, and cleanup backlog.",
        "default_prompt": "Use $vesta-mobile-skill-maintainer to refresh the vesta-mobile preference system, regenerate the local skill pack, and update the cleanup backlog.",
        "use_when": [
            "You are updating the local skills, rule manifests, or agent routing.",
            "You need to regenerate skills, reports, or the codebase improvement backlog.",
            "A new repeated correction should become a drafted rule rather than a one-off memory.",
        ],
        "do_not_use": [
            "Normal feature implementation, UI polish, or app debugging.",
            "Platform-specific component decisions that belong to iOS, Android, or React Native execution skills.",
        ],
        "upstream": [],
    },
}


def yaml_quote(value: str) -> str:
    escaped = value.replace("\\", "\\\\").replace('"', '\\"')
    return f'"{escaped}"'


def rule_trigger_summary(rule: dict[str, Any]) -> str:
    triggers = rule.get("triggerPhrases", [])
    if not triggers:
        return "Use the directive and hotspots below to match the task."
    return ", ".join(f"`{trigger}`" for trigger in triggers)


def aggregate_hotspots(rules: list[dict[str, Any]]) -> list[str]:
    seen: set[str] = set()
    ordered: list[str] = []
    for rule in rules:
        for hotspot in rule.get("hotspots", []):
            if hotspot in seen:
                continue
            seen.add(hotspot)
            ordered.append(hotspot)
    return ordered


def aggregate_upstream_refs(rules: list[dict[str, Any]]) -> list[str]:
    seen: set[str] = set()
    ordered: list[str] = []
    for rule in rules:
        for ref in rule.get("upstreamSkillRefs", []):
            if ref in seen:
                continue
            seen.add(ref)
            ordered.append(ref)
    return ordered


def render_rule(rule: dict[str, Any]) -> list[str]:
    lines = [
        f"## {rule['title']}",
        "",
        f"- Directive: {rule['directive']}",
        f"- Match when: {rule_trigger_summary(rule)}",
    ]
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
    return lines


def render_openai_yaml(config: dict[str, Any]) -> str:
    lines = [
        "interface:",
        f"  display_name: {yaml_quote(config['display_name'])}",
        f"  short_description: {yaml_quote(config['short_description'])}",
        f"  default_prompt: {yaml_quote(config['default_prompt'])}",
    ]
    return "\n".join(lines) + "\n"


def render_skill(skill_name: str, rules: list[dict[str, Any]]) -> str:
    config = SKILL_CONFIG[skill_name]
    rule_hotspots = aggregate_hotspots(rules)
    upstream_refs = config["upstream"]
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
        "## Use This When",
        "",
    ]
    for item in config["use_when"]:
        body.append(f"- {item}")
    body.extend(["", "## Do Not Use This For", ""])
    for item in config["do_not_use"]:
        body.append(f"- {item}")
    if skill_name == "vesta-mobile-skill-maintainer":
        body.extend(
            [
                "",
                "## Workflow",
                "",
                "- Refresh raw history signals with `pnpm codex:skills:refresh`.",
                "- Review `tools/codex-preferences/data/proposed-rules.json` before promoting anything.",
                "- Accept only durable patterns with `pnpm codex:skills:accept -- <rule-id>`.",
                "- Regenerate `.agents/skills/*`, `AGENTS.md`, and local metadata with `pnpm codex:skills:generate`.",
                "- Rebuild the cleanup backlog with `pnpm codex:skills:audit` and review the latest generated reports before broad sweeps.",
                "",
                "## Health Checks",
                "",
                "- Read `tools/codex-preferences/generated/skill-gap-report.md` to see what stays local versus upstream.",
                "- Read `tools/codex-preferences/generated/skill-health-report.md` to catch weak trigger coverage or overlap.",
                "- Read `tools/codex-preferences/generated/codebase-improvement-report.md` before starting a codebase cleanup pass.",
            ]
        )
    else:
        body.extend(
            [
                "",
                "## Workflow",
                "",
                "- Use the repo rules below to choose the direction, scope, and shared-versus-local fix strategy.",
                "- If a rule decides the product or platform direction but not the exact implementation mechanics, load the upstream guidance listed next.",
            ]
        )
    if upstream_refs:
        body.extend(["", "## Upstream Fallback", ""])
        for skill_ref, reason in upstream_refs:
            body.append(f"- `{skill_ref}`: {reason}")
    if rule_hotspots:
        body.extend(["", "## Repo Hotspots", ""])
        for hotspot in rule_hotspots:
            body.append(f"- `{hotspot}`")
    body.extend(["", "## Active Repo Rules", ""])
    for rule in rules:
        body.extend(render_rule(rule))
        body.append("")
    if rules and aggregate_upstream_refs(rules):
        body.append("## Imported Upstream Links")
        body.append("")
        for ref in aggregate_upstream_refs(rules):
            body.append(f"- `{ref}`")
        body.append("")
    return "\n".join(body).rstrip() + "\n"


def render_agents_md(grouped: dict[str, list[dict[str, Any]]]) -> str:
    sections = [
        "# Vesta-Mobile Agent Guide",
        "",
        "This repository uses a local Codex overlay skill pack. For `vesta-mobile` work, use the repo-local skill first to choose repo policy, then fall through to the imported upstream React Native, iOS, or Android guidance when the task needs platform mechanics.",
        "",
        "## Routing Order",
        "",
        "- `vesta-mobile-debug-and-validation`: first stop for pasted logs, route crashes, Metro/import failures, native build failures, and validation loops.",
        "- `vesta-mobile-native-ios`: first stop when the user asks for actual native, Apple-native, refined iPhone behavior, or real iOS controls.",
        "- `vesta-mobile-native-android`: first stop when a compact Android flow should stay lightweight and platform-familiar.",
        "- `vesta-mobile-react-native-architecture`: first stop for repository boundaries, provider cycles, oversized screens/hooks, and cleanup direction.",
        "- `vesta-mobile-product-judgment`: first stop for low-signal UI removal, action-first rows, copy cleanup, and contextual local UX fixes.",
        "- `vesta-mobile-skill-maintainer`: use only when evolving the skill system or preparing a cleanup program from it.",
        "",
        "## Upstream Escalation",
        "",
        "- Use the local skill to decide repo policy and user preference first.",
        "- Then load `react-native-design`, `ios-design-guidelines`, `android-design-guidelines`, `react-native-best-practices`, or `react-native-testing` only when you need implementation mechanics that the local overlay intentionally does not duplicate.",
        "- Do not edit vendored upstream skill snapshots for repo-specific behavior; keep repo policy in `.agents/skills` and `tools/codex-preferences`.",
        "",
        "## Working Rules",
        "",
        "- Check `git status` before broad sweeps and avoid clobbering in-progress feature work.",
        "- Start from the exact failing file, route, stack trace, or native binary mismatch before expanding the search.",
        "- Prefer real native controls and platform behavior over JavaScript lookalikes when the user asks for actual native behavior.",
        "- Keep shell providers thin; do not recreate provider-to-feature cycles.",
        "- Split large screens into shells, hooks, and reusable components instead of growing local monoliths.",
        "- Remove exact low-value UI or copy when the user points it out; do not soften it into renamed clutter.",
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
    for skill_name in SKILL_ORDER:
        config = SKILL_CONFIG[skill_name]
        rule_count = len(grouped.get(skill_name, []))
        sections.append(f"- `{skill_name}`: {config['short_description']} Active rules: `{rule_count}`.")
    sections.append("")
    return "\n".join(sections)


def main() -> None:
    manifest = accepted_manifest()
    grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for rule in manifest["rules"]:
        grouped[rule["skill"]].append(rule)

    ensure_dir(AGENTS_SKILLS_DIR)
    for skill_name in SKILL_ORDER:
        skill_dir = AGENTS_SKILLS_DIR / skill_name
        agents_dir = skill_dir / "agents"
        ensure_dir(agents_dir)
        write_text(skill_dir / "SKILL.md", render_skill(skill_name, grouped.get(skill_name, [])))
        write_text(agents_dir / "openai.yaml", render_openai_yaml(SKILL_CONFIG[skill_name]))

    write_text(ROOT_AGENTS_PATH, render_agents_md(grouped))
    print(f"Generated local skills for {SCOPE_LABEL}.")


if __name__ == "__main__":
    main()
