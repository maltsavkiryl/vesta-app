from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


REPO_ROOT = Path(__file__).resolve().parents[2]
TOOLS_DIR = REPO_ROOT / "tools" / "codex-preferences"
DATA_DIR = TOOLS_DIR / "data"
GENERATED_DIR = TOOLS_DIR / "generated"
AGENTS_DIR = REPO_ROOT / ".agents"
AGENTS_SKILLS_DIR = AGENTS_DIR / "skills"
ROOT_AGENTS_PATH = REPO_ROOT / "AGENTS.md"

CODEX_HOME = Path.home() / ".codex"
MEMORY_MD = CODEX_HOME / "memories" / "MEMORY.md"
ROLLOUTS_DIR = CODEX_HOME / "memories" / "rollout_summaries"
SESSIONS_DIR = CODEX_HOME / "sessions"

ACCEPTED_RULES_PATH = DATA_DIR / "accepted-rules.json"
PROPOSED_RULES_PATH = DATA_DIR / "proposed-rules.json"
SCAN_STATE_PATH = DATA_DIR / "scan-state.json"
SKILL_GAP_REPORT_JSON = GENERATED_DIR / "skill-gap-report.json"
SKILL_GAP_REPORT_MD = GENERATED_DIR / "skill-gap-report.md"
CODEBASE_REPORT_JSON = GENERATED_DIR / "codebase-improvement-report.json"
CODEBASE_REPORT_MD = GENERATED_DIR / "codebase-improvement-report.md"

SCOPE_CWD = str(REPO_ROOT)
SCOPE_LABEL = "vesta-mobile"

DOMAIN_TO_SKILL = {
    "product_judgment": "vesta-mobile-product-judgment",
    "native_ios": "vesta-mobile-native-ios",
    "native_android": "vesta-mobile-native-android",
    "react_native_architecture": "vesta-mobile-react-native-architecture",
    "debug_validation": "vesta-mobile-debug-and-validation",
    "repo_workflow": "vesta-mobile-skill-maintainer",
}


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def read_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: Any) -> None:
    ensure_dir(path.parent)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")


def write_text(path: Path, content: str) -> None:
    ensure_dir(path.parent)
    path.write_text(content.rstrip() + "\n", encoding="utf-8")


def slugify(value: str) -> str:
    value = value.lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


def repo_relative(path: Path) -> str:
    try:
        return str(path.relative_to(REPO_ROOT))
    except ValueError:
        return str(path)


def accepted_manifest() -> dict[str, Any]:
    return read_json(ACCEPTED_RULES_PATH, {"metadata": {}, "rules": []})


def proposed_manifest() -> dict[str, Any]:
    return read_json(PROPOSED_RULES_PATH, {"metadata": {}, "rules": []})


def scan_state() -> dict[str, Any]:
    return read_json(
        SCAN_STATE_PATH,
        {
            "scope": SCOPE_LABEL,
            "last_refresh_at": None,
            "memory_bullets_seen": 0,
            "rollout_bullets_seen": 0,
            "session_messages_seen": 0,
        },
    )
