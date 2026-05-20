from __future__ import annotations

import argparse
from pathlib import Path
from typing import Any

from common import CODEBASE_REPORT_JSON, CODEBASE_REPORT_MD, REPO_ROOT, accepted_manifest, now_iso, read_text, repo_relative, write_json, write_text


SCREEN_LIMIT = 220
HOOK_LIMIT = 180
COMPONENT_LIMIT = 220


def file_line_count(path: Path) -> int:
    return len(read_text(path).splitlines())


def add_size_findings(findings: list[dict[str, Any]]) -> None:
    for path in REPO_ROOT.glob("src/features/**/*"):
        if not path.is_file() or path.suffix not in {".ts", ".tsx"}:
            continue
        rel = repo_relative(path)
        lines = file_line_count(path)
        if path.name.endswith("Screen.tsx") and lines > SCREEN_LIMIT:
            findings.append(
                {
                    "finding_id": f"screen-size::{rel}",
                    "rule_id": "arch-uniformity-small-files-hooks-components",
                    "path": rel,
                    "category": "screen_decomposition",
                    "severity": "medium",
                    "confidence": "high",
                    "recommended_fix_type": "split_into_shell_hook_components",
                    "shared_layer_candidate": False,
                    "summary": f"Screen file is {lines} lines; prefer a shell plus hooks/components split.",
                }
            )
        if path.name.startswith("use") and lines > HOOK_LIMIT:
            findings.append(
                {
                    "finding_id": f"hook-size::{rel}",
                    "rule_id": "arch-uniformity-small-files-hooks-components",
                    "path": rel,
                    "category": "hook_decomposition",
                    "severity": "medium",
                    "confidence": "high",
                    "recommended_fix_type": "split_hook_by_domain_or_responsibility",
                    "shared_layer_candidate": False,
                    "summary": f"Hook file is {lines} lines; split by responsibility before it becomes a new hotspot.",
                }
            )
        if "/components/" in rel and lines > COMPONENT_LIMIT:
            findings.append(
                {
                    "finding_id": f"component-size::{rel}",
                    "rule_id": "arch-uniformity-small-files-hooks-components",
                    "path": rel,
                    "category": "component_decomposition",
                    "severity": "low",
                    "confidence": "medium",
                    "recommended_fix_type": "split_component_and_extract_helpers",
                    "shared_layer_candidate": False,
                    "summary": f"Component file is {lines} lines; review whether it now mixes layout, state, and helpers.",
                }
            )


def add_provider_findings(findings: list[dict[str, Any]]) -> None:
    for path in REPO_ROOT.glob("src/providers/**/*.tsx"):
        text = read_text(path)
        if "/data/" in text and ".queries" in text:
            rel = repo_relative(path)
            findings.append(
                {
                    "finding_id": f"provider-cycle::{rel}",
                    "rule_id": "arch-shell-only-app-provider",
                    "path": rel,
                    "category": "provider_boundary_cleanup",
                    "severity": "high",
                    "confidence": "medium",
                    "recommended_fix_type": "move_shell_state_access_to_repositories_or_composition",
                    "shared_layer_candidate": True,
                    "summary": "Provider imports appear to cross into feature query/data code; verify that the shell remains repository-driven.",
                }
            )


def add_manual_hotspot_findings(findings: list[dict[str, Any]], rules: list[dict[str, Any]]) -> None:
    seen: set[tuple[str, str]] = set()
    for rule in rules:
        for hotspot in rule.get("hotspots", []):
            path = REPO_ROOT / hotspot
            if not path.exists():
                continue
            key = (rule["id"], hotspot)
            if key in seen:
                continue
            seen.add(key)
            findings.append(
                {
                    "finding_id": f"hotspot::{rule['id']}::{hotspot}",
                    "rule_id": rule["id"],
                    "path": hotspot,
                    "category": "manual_review_hotspot",
                    "severity": "low",
                    "confidence": "medium",
                    "recommended_fix_type": "manual_review_against_rule",
                    "shared_layer_candidate": path.is_dir(),
                    "summary": f"Historical hotspot for rule `{rule['id']}`. Review this surface against the accepted preference.",
                }
            )


def cluster(findings: list[dict[str, Any]]) -> list[dict[str, Any]]:
    packets: dict[str, dict[str, Any]] = {}
    names = {
        "provider_boundary_cleanup": "Provider boundary cleanup",
        "screen_decomposition": "Screen decomposition",
        "hook_decomposition": "Hook decomposition",
        "component_decomposition": "Component decomposition",
        "manual_review_hotspot": "Manual product and native review",
    }
    for finding in findings:
        packet_id = finding["category"]
        packet = packets.setdefault(
            packet_id,
            {
                "packet_id": packet_id,
                "title": names.get(packet_id, packet_id.replace("_", " ").title()),
                "findings": [],
            },
        )
        packet["findings"].append(finding)
    return list(packets.values())


def report_markdown(payload: dict[str, Any]) -> str:
    lines = [
        "# Codebase Improvement Report",
        "",
        f"- Scope: `{payload['scope']}`",
        f"- Findings: `{len(payload['findings'])}`",
        f"- Work packets: `{len(payload['work_packets'])}`",
        "",
    ]
    for packet in payload["work_packets"]:
        lines.append(f"## {packet['title']}")
        lines.append("")
        for finding in packet["findings"]:
            lines.append(f"- `{finding['path']}` -> `{finding['recommended_fix_type']}`")
            lines.append(f"  Rule: `{finding['rule_id']}`")
            lines.append(f"  Summary: {finding['summary']}")
        lines.append("")
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--markdown", action="store_true")
    parser.add_argument("--report-only", action="store_true")
    args = parser.parse_args()

    manifest = accepted_manifest()
    findings: list[dict[str, Any]] = []
    add_size_findings(findings)
    add_provider_findings(findings)
    add_manual_hotspot_findings(findings, manifest["rules"])

    payload = {
        "scope": "vesta-mobile",
        "generatedAt": now_iso(),
        "findings": findings,
        "work_packets": cluster(findings),
    }
    write_json(CODEBASE_REPORT_JSON, payload)
    write_text(CODEBASE_REPORT_MD, report_markdown(payload))

    if args.markdown or args.report_only:
        print(f"Generated {repo_relative(CODEBASE_REPORT_MD)} with {len(findings)} findings.")


if __name__ == "__main__":
    main()
