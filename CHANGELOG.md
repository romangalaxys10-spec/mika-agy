# Changelog - Mika AGY

All notable changes to **Mika AGY** are documented in this file.

## [v0.2.0-macos-agy] - 2026-11-01

### 🚀 Major Milestones & Innovations
- **Fork Elevation**: Forked from `wangzan101/mika` and elevated into a full native macOS desktop computer use agent powered by Google Antigravity (AGY).
- **Native macOS Application (`Mika.app`)**:
  - Implemented AppKit + Swift native application with status bar menu, global keyboard shortcut (`⌘⇧M`), Quick Task HUD, and WKWebView task desk.
  - Implemented auto-restart watchdog in `MikaBridge.swift` for self-healing server processes.
- **End-to-End MCP Support**:
  - Built `mika_mcp_engine.py` featuring a curated marketplace (Filesystem, Brave Search, Fetch, SQLite, GitHub, Puppeteer, Memory, Mac Office Suite).
  - Added support for manual installs via Git URLs, custom commands, NPX, and UVX with custom environment variables.
  - Interactive UI modal with marketplace browsing, toggle switches, and 1-click install.
- **Long-Horizon Autonomous Loop**:
  - Cloned and adapted core execution loops from `HKUDS/AutoAgent`, `openclaw/openclaw`, and `NousResearch/hermes-agent`.
  - Implemented `RepetitionGuard` circuit breaker to avoid infinite loops.
  - Implemented `SecretScope` to redact API keys, tokens, and credentials from all logs and outputs.
  - Multi-step milestone planning with self-refine verification.
- **Autonomous "Coder" Team Mode**:
  - Multi-agent coding pipeline inspired by `zai-org/ZCode`, `getpaseo/paseo`, and `anywhere-labs/dsh-desktop`.
  - Defined 6 specialized roles: Lead Software Architect, System Designer, Senior Code Engineer, QA Automation Specialist, Security Reviewer, and Release Manager.
  - Generates `PLAN.md`, `DESIGN.md`, `QA_REPORT.md`, `CODE_REVIEW.md`.
- **Full Employee Deliverable Suite**:
  - Native generator for Microsoft PowerPoint presentations (`.pptx` and responsive HTML5).
  - Multi-tab financial models in Microsoft Excel (`.xlsx`).
  - Executive proposals in Microsoft Word (`.docx`).
  - Finder project workspace organizer on the macOS Desktop.
- **Auto-Healing & Mitigations**:
  - Fully solved and mitigated `"Cannot reach the local desk"` errors by normalizing loopback host/origin checks in `mika_desk/__init__.py`.
  - Enhanced `desk.js` with exponential backoff and silent reconnect without disruptive red error alerts.
- **Supply Chain Security**:
  - Integrated `in-toto/witness` for cryptographic provenance attestations (`attestation.json`).
