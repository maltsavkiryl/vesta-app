from __future__ import annotations

import argparse
import re
from pathlib import Path
from typing import Any

from common import (
    ACCEPTED_RULES_PATH,
    MEMORY_MD,
    PROPOSED_RULES_PATH,
    ROLLOUTS_DIR,
    SCAN_STATE_PATH,
    SCOPE_CWD,
    SCOPE_LABEL,
    SESSIONS_DIR,
    SKILL_GAP_REPORT_JSON,
    SKILL_GAP_REPORT_MD,
    SKILL_HEALTH_REPORT_JSON,
    SKILL_HEALTH_REPORT_MD,
    accepted_manifest,
    now_iso,
    proposed_manifest,
    read_json,
    read_text,
    repo_relative,
    scan_state,
    write_json,
    write_text,
)


SESSION_PATTERNS = [
    (
        re.compile(r"actual native|real native|liquid glass", re.IGNORECASE),
        {
            "id": "native-ios-real-native-over-lookalikes",
            "title": "Prefer the real native iOS path over lookalikes",
            "domain": "native_ios",
            "directive": "Prefer the true native iOS path over JavaScript approximations when the user asks for actual native behavior.",
        },
    ),
    (
        re.compile(r"still looks weird|awkward here|awkard here", re.IGNORECASE),
        {
            "id": "product-local-context-over-broad-shared-fix",
            "title": "Prefer contextual local UI fixes after the shared primitive is proven wrong in-context",
            "domain": "product_judgment",
            "directive": "Prefer a local contextual fix once the shared primitive is clearly wrong for that card or screen context.",
        },
    ),
    (
        re.compile(r"white text and never black text", re.IGNORECASE),
        {
            "id": "design-system-accent-buttons-use-white-foreground",
            "title": "Treat blue-accent buttons with white text as a design-system rule",
            "domain": "product_judgment",
            "directive": "Treat accent button foreground color as a shared design-system rule rather than a local override.",
        },
    ),
    (
        re.compile(r"camera or files|showUploadOptions", re.IGNORECASE),
        {
            "id": "native-android-use-native-picker-patterns",
            "title": "Prefer native picker patterns over custom stepper controls",
            "domain": "native_android",
            "directive": "Prefer lightweight native picker patterns over oversized custom flows when the choice is simple.",
        },
    ),
]


def parse_memory_bullets() -> list[dict[str, str]]:
    bullets: list[dict[str, str]] = []
    current_task_relevant = False
    current_section = ""
    for raw_line in read_text(MEMORY_MD).splitlines():
        line = raw_line.rstrip()
        if line.startswith("# Task Group:"):
            current_task_relevant = False
            current_section = ""
            continue
        if line.startswith("scope:") or line.startswith("applies_to:"):
            if SCOPE_CWD in line:
                current_task_relevant = True
            continue
        if not current_task_relevant:
            continue
        if line.startswith("## User preferences"):
            current_section = "user_preferences"
            continue
        if line.startswith("## Failures and how to do differently"):
            current_section = "failures"
            continue
        if line.startswith("## Reusable knowledge"):
            current_section = "reusable_knowledge"
            continue
        if current_section and line.startswith("- "):
            bullets.append({"section": current_section, "text": line[2:]})
    return bullets


def parse_rollout_bullets() -> list[dict[str, str]]:
    bullets: list[dict[str, str]] = []
    for path in sorted(ROLLOUTS_DIR.glob("*.md")):
        text = read_text(path)
        if f"cwd: {SCOPE_CWD}" not in text:
            continue
        section = ""
        for raw_line in text.splitlines():
            line = raw_line.rstrip()
            if line.startswith("Preference signals:"):
                section = "preference_signals"
                continue
            if line.startswith("Failures and how to do differently:"):
                section = "failures"
                continue
            if line.startswith("Reusable knowledge:"):
                section = "reusable_knowledge"
                continue
            if line.startswith("## "):
                section = ""
                continue
            if section and line.startswith("- "):
                bullets.append(
                    {
                        "section": section,
                        "text": line[2:],
                        "source": repo_relative(path),
                    }
                )
    return bullets


def parse_session_messages() -> list[dict[str, str]]:
    matches: list[dict[str, str]] = []
    for path in sorted(SESSIONS_DIR.rglob("*.jsonl")):
        try:
            lines = path.read_text(encoding="utf-8").splitlines()
        except UnicodeDecodeError:
            continue
        if not lines or SCOPE_CWD not in lines[0]:
            continue
        for line in lines:
            if '"role":"user"' not in line:
                continue
            for pattern, template in SESSION_PATTERNS:
                hit = pattern.search(line)
                if not hit:
                    continue
                matches.append(
                    {
                        "id": template["id"],
                        "title": template["title"],
                        "domain": template["domain"],
                        "directive": template["directive"],
                        "text": hit.group(0),
                        "source": repo_relative(path),
                    }
                )
                break
    return matches


def update_proposals(
    accepted: dict[str, Any],
    proposed: dict[str, Any],
    session_matches: list[dict[str, str]],
) -> dict[str, Any]:
    accepted_ids = {rule["id"] for rule in accepted["rules"]}
    existing = {rule["id"]: rule for rule in proposed["rules"]}
    for match in session_matches:
        if match["id"] in accepted_ids:
            continue
        if match["id"] in existing:
            existing[match["id"]]["lastSeen"] = now_iso()
            continue
        existing[match["id"]] = {
            "id": match["id"],
            "title": match["title"],
            "scope": SCOPE_LABEL,
            "domain": match["domain"],
            "skill": None,
            "triggerPhrases": [match["text"]],
            "directive": match["directive"],
            "antiPatterns": [],
            "hotspots": [],
            "evidenceRefs": [match["source"]],
            "confidence": "low",
            "status": "proposed",
            "firstSeen": now_iso(),
            "lastSeen": now_iso(),
            "reason": "Detected from raw user correction language in a vesta-mobile session.",
        }
    proposed["metadata"]["updatedAt"] = now_iso()
    proposed["rules"] = sorted(existing.values(), key=lambda item: item["id"])
    return proposed


def build_gap_report(accepted: dict[str, Any], proposed: dict[str, Any]) -> dict[str, Any]:
    buckets = {"covered": [], "partial": [], "overlay": []}
    for rule in accepted["rules"]:
        coverage = rule.get("upstreamCoverage", "none")
        if coverage == "covered":
            buckets["covered"].append(rule)
        elif coverage == "partial":
            buckets["partial"].append(rule)
        else:
            buckets["overlay"].append(rule)
    return {
        "scope": SCOPE_LABEL,
        "generatedAt": now_iso(),
        "acceptedRuleCount": len(accepted["rules"]),
        "proposedRuleCount": len(proposed["rules"]),
        "buckets": {
            name: [
                {
                    "id": rule["id"],
                    "title": rule["title"],
                    "domain": rule["domain"],
                    "skill": rule["skill"],
                    "upstreamSkillRefs": rule.get("upstreamSkillRefs", []),
                    "overlayReason": rule.get("overlayReason"),
                }
                for rule in rules
            ]
            for name, rules in buckets.items()
        },
    }


def gap_report_markdown(report: dict[str, Any]) -> str:
    sections = [
        "# Skill Gap Report",
        "",
        f"- Scope: `{report['scope']}`",
        f"- Accepted rules: `{report['acceptedRuleCount']}`",
        f"- Proposed rules: `{report['proposedRuleCount']}`",
        "",
    ]
    labels = {
        "overlay": "Missing in upstream and implemented as local overlay",
        "partial": "Partially covered upstream and strengthened locally",
        "covered": "Covered upstream with no extra local requirement",
    }
    for key in ("overlay", "partial", "covered"):
        sections.append(f"## {labels[key]}")
        items = report["buckets"][key]
        if not items:
            sections.append("")
            sections.append("- None.")
            sections.append("")
            continue
        sections.append("")
        for item in items:
            upstream = ", ".join(item["upstreamSkillRefs"]) or "None"
            sections.append(f"- `{item['id']}` -> `{item['skill']}`")
            sections.append(f"  Upstream references: {upstream}")
        sections.append("")
    return "\n".join(sections)


def build_skill_health_report(accepted: dict[str, Any], proposed: dict[str, Any]) -> dict[str, Any]:
    grouped: dict[str, list[dict[str, Any]]] = {}
    issues: list[dict[str, str]] = []
    trigger_index: dict[str, list[str]] = {}

    for rule in accepted["rules"]:
        grouped.setdefault(rule["skill"], []).append(rule)
        triggers = [trigger.strip().lower() for trigger in rule.get("triggerPhrases", []) if trigger.strip()]
        if len(triggers) < 2:
            issues.append(
                {
                    "kind": "weak_trigger_coverage",
                    "rule_id": rule["id"],
                    "detail": "Rule has fewer than two explicit trigger phrases.",
                }
            )
        if rule.get("upstreamCoverage") in {"partial", "covered"} and not rule.get("upstreamSkillRefs"):
            issues.append(
                {
                    "kind": "missing_upstream_reference",
                    "rule_id": rule["id"],
                    "detail": "Rule claims upstream coverage but has no upstream skill references.",
                }
            )
        for trigger in triggers:
            trigger_index.setdefault(trigger, []).append(rule["id"])

    for trigger, rule_ids in sorted(trigger_index.items()):
        unique_rule_ids = sorted(set(rule_ids))
        if len(unique_rule_ids) < 2:
            continue
        issues.append(
            {
                "kind": "overlapping_trigger_phrase",
                "rule_id": ", ".join(unique_rule_ids),
                "detail": f"Trigger phrase `{trigger}` appears in multiple accepted rules.",
            }
        )

    skill_summaries = []
    for skill_name, rules in sorted(grouped.items()):
        upstream_refs: list[str] = []
        seen_upstream: set[str] = set()
        for rule in rules:
            for ref in rule.get("upstreamSkillRefs", []):
                if ref in seen_upstream:
                    continue
                seen_upstream.add(ref)
                upstream_refs.append(ref)
        skill_summaries.append(
            {
                "skill": skill_name,
                "ruleCount": len(rules),
                "upstreamRefs": upstream_refs,
            }
        )

    return {
        "scope": SCOPE_LABEL,
        "generatedAt": now_iso(),
        "acceptedRuleCount": len(accepted["rules"]),
        "proposedRuleCount": len(proposed["rules"]),
        "skillCount": len(skill_summaries),
        "issues": issues,
        "skills": skill_summaries,
    }


def skill_health_markdown(report: dict[str, Any]) -> str:
    lines = [
        "# Skill Health Report",
        "",
        f"- Scope: `{report['scope']}`",
        f"- Local skills: `{report['skillCount']}`",
        f"- Accepted rules: `{report['acceptedRuleCount']}`",
        f"- Proposed rules: `{report['proposedRuleCount']}`",
        f"- Health issues: `{len(report['issues'])}`",
        "",
        "## Local Skill Coverage",
        "",
    ]
    for skill in report["skills"]:
        upstream = ", ".join(f"`{ref}`" for ref in skill["upstreamRefs"]) or "None"
        lines.append(f"- `{skill['skill']}`: `{skill['ruleCount']}` rules. Upstream fallbacks: {upstream}.")
    lines.append("")
    lines.append("## Health Issues")
    lines.append("")
    if not report["issues"]:
        lines.append("- None.")
        lines.append("")
        return "\n".join(lines)
    for issue in report["issues"]:
        lines.append(f"- `{issue['kind']}` on `{issue['rule_id']}`: {issue['detail']}")
    lines.append("")
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--report", action="store_true")
    args = parser.parse_args()

    accepted = accepted_manifest()
    proposed = proposed_manifest()
    state = scan_state()

    memory_bullets = parse_memory_bullets()
    rollout_bullets = parse_rollout_bullets()
    session_matches = parse_session_messages()
    proposed = update_proposals(accepted, proposed, session_matches)

    accepted["metadata"]["updatedAt"] = now_iso()
    proposed["metadata"]["updatedAt"] = now_iso()
    state["last_refresh_at"] = now_iso()
    state["memory_bullets_seen"] = len(memory_bullets)
    state["rollout_bullets_seen"] = len(rollout_bullets)
    state["session_messages_seen"] = len(session_matches)

    report = build_gap_report(accepted, proposed)
    health_report = build_skill_health_report(accepted, proposed)

    write_json(ACCEPTED_RULES_PATH, accepted)
    write_json(PROPOSED_RULES_PATH, proposed)
    write_json(SCAN_STATE_PATH, state)
    write_json(SKILL_GAP_REPORT_JSON, report)
    write_text(SKILL_GAP_REPORT_MD, gap_report_markdown(report))
    write_json(SKILL_HEALTH_REPORT_JSON, health_report)
    write_text(SKILL_HEALTH_REPORT_MD, skill_health_markdown(health_report))

    if args.report:
        print(f"Refreshed {SCOPE_LABEL} preference data.")
        print(f"Accepted rules: {len(accepted['rules'])}")
        print(f"Proposed rules: {len(proposed['rules'])}")
        print(f"Gap report: {repo_relative(SKILL_GAP_REPORT_MD)}")
        print(f"Health report: {repo_relative(SKILL_HEALTH_REPORT_MD)}")


if __name__ == "__main__":
    main()
