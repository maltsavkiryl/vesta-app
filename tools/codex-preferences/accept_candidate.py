from __future__ import annotations

import argparse
import subprocess
import sys
from typing import Any

from common import ACCEPTED_RULES_PATH, PROPOSED_RULES_PATH, accepted_manifest, now_iso, proposed_manifest, write_json


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("rule_id")
    parser.add_argument("--no-regenerate", action="store_true")
    args = parser.parse_args()

    accepted = accepted_manifest()
    proposed = proposed_manifest()

    candidate = None
    remaining = []
    for rule in proposed["rules"]:
        if rule["id"] == args.rule_id:
            candidate = rule
        else:
            remaining.append(rule)

    if candidate is None:
        raise SystemExit(f"Unknown proposed rule: {args.rule_id}")

    candidate["status"] = "accepted"
    candidate["lastSeen"] = now_iso()
    accepted["rules"].append(candidate)
    accepted["rules"] = sorted(accepted["rules"], key=lambda item: item["id"])
    accepted["metadata"]["updatedAt"] = now_iso()
    proposed["rules"] = remaining
    proposed["metadata"]["updatedAt"] = now_iso()

    write_json(ACCEPTED_RULES_PATH, accepted)
    write_json(PROPOSED_RULES_PATH, proposed)

    if not args.no_regenerate:
        subprocess.run([sys.executable, "tools/codex-preferences/generate_skills.py"], check=True)
        subprocess.run([sys.executable, "tools/codex-preferences/audit_codebase.py"], check=True)

    print(f"Accepted proposed rule: {args.rule_id}")


if __name__ == "__main__":
    main()
