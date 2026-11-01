#!/usr/bin/env python3
"""
Mika MCP Engine - Model Context Protocol Server & Client Bridge
Supports curated marketplace and manual installation (stdio, npx, uvx, custom commands, URLs).
Saves configuration to ~/.mika/mcp_servers.json.
"""

import os
import sys
import time
import json
import shlex
import shutil
import asyncio
import logging
import subprocess
from pathlib import Path
from typing import Dict, List, Any, Optional

logger = logging.getLogger("mika.mcp")

CONFIG_PATH = Path.home() / ".mika" / "mcp_servers.json"

# Curated Marketplace Catalog
MARKETPLACE_SERVERS = {
    "filesystem": {
        "id": "filesystem",
        "name": "Local Filesystem",
        "category": "Productivity",
        "icon": "📁",
        "description": "Secure file reading, writing, searching, and directory navigation across user folders.",
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-filesystem", str(Path.home() / "Desktop"), str(Path.home() / "Documents")],
        "env": {},
        "transport": "stdio",
        "status": "ready"
    },
    "brave-search": {
        "id": "brave-search",
        "name": "Brave Web Search",
        "category": "Research",
        "icon": "🔍",
        "description": "Live web search, real-time news retrieval, and content queries via Brave Search API.",
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-brave-search"],
        "env": {"BRAVE_API_KEY": ""},
        "transport": "stdio",
        "status": "needs_key"
    },
    "fetch": {
        "id": "fetch",
        "name": "Web Fetch & HTML to Markdown",
        "category": "Research",
        "icon": "🌐",
        "description": "Extract readable text, markdown, and structured metadata from any web page or REST API.",
        "command": "uvx",
        "args": ["mcp-server-fetch"],
        "env": {},
        "transport": "stdio",
        "status": "ready"
    },
    "sqlite": {
        "id": "sqlite",
        "name": "SQLite Database",
        "category": "Database",
        "icon": "🗄️",
        "description": "Query tables, inspect schemas, and analyze relational data in local SQLite files.",
        "command": "uvx",
        "args": ["mcp-server-sqlite", "--db-path", str(Path.home() / ".mika" / "analytics.db")],
        "env": {},
        "transport": "stdio",
        "status": "ready"
    },
    "github": {
        "id": "github",
        "name": "GitHub Integration",
        "category": "Developer Tools",
        "icon": "🐙",
        "description": "Inspect repositories, pull requests, issues, branches, and commits directly on GitHub.",
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-github"],
        "env": {"GITHUB_PERSONAL_ACCESS_TOKEN": ""},
        "transport": "stdio",
        "status": "needs_key"
    },
    "puppeteer": {
        "id": "puppeteer",
        "name": "Puppeteer Browser Automation",
        "category": "Automation",
        "icon": "🤖",
        "description": "Headless browser control, screenshot capture, DOM scraping, and web interaction.",
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-puppeteer"],
        "env": {},
        "transport": "stdio",
        "status": "ready"
    },
    "memory": {
        "id": "memory",
        "name": "Knowledge Graph Memory",
        "category": "AI Core",
        "icon": "🧠",
        "description": "Persistent knowledge graph memory of entities, relations, and user preferences.",
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-memory"],
        "env": {},
        "transport": "stdio",
        "status": "ready"
    },
    "mac-office-suite": {
        "id": "mac-office-suite",
        "name": "Mac Office Suite",
        "category": "Employee Suite",
        "icon": "📊",
        "description": "Native PowerPoint presentation builder, Excel models, Word proposals, and Keynote automator.",
        "command": sys.executable,
        "args": ["-m", "agent_server.mika_employee_suite"],
        "env": {},
        "transport": "stdio",
        "status": "installed"
    },
    "git": {
        "id": "git",
        "name": "Git Operations",
        "category": "Developer Tools",
        "icon": "🌱",
        "description": "Read, commit, branch, diff, and inspect Git repositories directly via MCP.",
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-git"],
        "env": {},
        "transport": "stdio",
        "status": "ready"
    },
    "sequentialthinking": {
        "id": "sequentialthinking",
        "name": "Sequential Thinking",
        "category": "AI Core",
        "icon": "💡",
        "description": "Dynamic multi-step chain-of-thought, hypothesis testing, and solution planning.",
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-sequentialthinking"],
        "env": {},
        "transport": "stdio",
        "status": "ready"
    },
    "chrome-devtools": {
        "id": "chrome-devtools",
        "name": "Chrome DevTools MCP",
        "category": "Developer Tools",
        "icon": "🌐",
        "description": "Connect AI agent to live Chrome browser: DOM inspection, network capture, and console evaluation.",
        "command": "npx",
        "args": ["-y", "chrome-devtools-mcp"],
        "env": {},
        "transport": "stdio",
        "status": "ready"
    },
    "postgres": {
        "id": "postgres",
        "name": "PostgreSQL Database",
        "category": "Database",
        "icon": "🐘",
        "description": "Read schemas, run SQL queries, and inspect PostgreSQL databases via MCP.",
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://localhost/mydb"],
        "env": {},
        "transport": "stdio",
        "status": "needs_config"
    },
    "slack": {
        "id": "slack",
        "name": "Slack Integration",
        "category": "Productivity",
        "icon": "💬",
        "description": "Read channels, send team messages, and manage threads in Slack workspace.",
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-slack"],
        "env": {"SLACK_BOT_TOKEN": ""},
        "transport": "stdio",
        "status": "needs_key"
    },
    "google-drive": {
        "id": "google-drive",
        "name": "Google Drive & Docs",
        "category": "Productivity",
        "icon": "📂",
        "description": "Search, read, create, and format Google Drive files, Google Docs, and Sheets.",
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-gdrive"],
        "env": {},
        "transport": "stdio",
        "status": "needs_auth"
    },
    "codebase-memory": {
        "id": "codebase-memory",
        "name": "Codebase Memory MCP",
        "category": "Developer Tools",
        "icon": "🧩",
        "description": "Local semantic code intelligence, symbol graphs, and architectural memory for AI agents.",
        "command": "npx",
        "args": ["-y", "codebase-memory-mcp"],
        "env": {},
        "transport": "stdio",
        "status": "ready"
    },
    "scrapling": {
        "id": "scrapling",
        "name": "Scrapling Web Crawler",
        "category": "Automation",
        "icon": "🕷️",
        "description": "Fast web scraping and intelligent HTML extraction for AI agents.",
        "command": "uvx",
        "args": ["scrapling"],
        "env": {},
        "transport": "stdio",
        "status": "ready"
    },
    "worldmonitor": {
        "id": "worldmonitor",
        "name": "World Monitor Intelligence",
        "category": "Research",
        "icon": "🌍",
        "description": "Real-time global news aggregation, geopolitical tracking, and situational awareness.",
        "command": "npx",
        "args": ["-y", "worldmonitor-mcp"],
        "env": {},
        "transport": "stdio",
        "status": "ready"
    },
    "zcode-ai": {
        "id": "zcode-ai",
        "name": "ZCode & Z.ai Multi-Agent Bridge",
        "category": "ZCode / ACP",
        "icon": "⚡",
        "description": "Sub-agent offloading for research, synthesis, and autonomous coding via Z.ai headless API.",
        "command": "uvx",
        "args": ["zcode-mcp-bridge"],
        "env": {"ZAI_API_KEY": ""},
        "transport": "stdio",
        "status": "ready"
    },
    "deepseek-coder-harness": {
        "id": "deepseek-coder-harness",
        "name": "DeepSeek Coder & R1 Reasoning Harness",
        "category": "DeepSeek",
        "icon": "🧠",
        "description": "Chain-of-Verification (CoVe), self-healing test automation, and PRM step supervision for full-stack projects.",
        "command": "uvx",
        "args": ["deepseek-harness-mcp"],
        "env": {},
        "transport": "stdio",
        "status": "ready"
    },
    "paseo-executive-deck": {
        "id": "paseo-executive-deck",
        "name": "Paseo Boardroom Demo & Presentation Suite",
        "category": "Paseo",
        "icon": "📊",
        "description": "Dark theme executive HTML5 boardroom demo decks, responsive stepper navigation, pure SVG charts, and KPI metric cards.",
        "command": "npx",
        "args": ["-y", "paseo-deck-mcp"],
        "env": {},
        "transport": "stdio",
        "status": "ready"
    },
    "superdesign-ui": {
        "id": "superdesign-ui",
        "name": "Superdesign UI/UX & Modern Web Guidance",
        "category": "ZCode / Paseo",
        "icon": "🎨",
        "description": "Anti-slop design system: container queries, View Transitions, Glassmorphism, and responsive single-file mockups.",
        "command": "npx",
        "args": ["-y", "superdesign-ui-mcp"],
        "env": {},
        "transport": "stdio",
        "status": "ready"
    },
    "in-toto-witness": {
        "id": "in-toto-witness",
        "name": "In-toto Witness Supply Chain Attestation",
        "category": "Security / ACP",
        "icon": "🛡️",
        "description": "Cryptographic ED25519 attestation, provenance hashing, and artifact verification for software supply chains.",
        "command": "/Users/ekaterina.gwaladze/.gemini/antigravity/scratch/bin/witness",
        "args": ["run", "--step", "build", "--key", str(Path.home() / ".mika" / "witness_key.pem")],
        "env": {},
        "transport": "stdio",
        "status": "installed"
    },
    "fable-brainstorming": {
        "id": "fable-brainstorming",
        "name": "Fable Multi-Agent Brainstorming & Dialogue",
        "category": "Paseo",
        "icon": "💡",
        "description": "Exploration of requirements, system architectures, and collaborative design dialogue.",
        "command": "npx",
        "args": ["-y", "fable-brainstorm-mcp"],
        "env": {},
        "transport": "stdio",
        "status": "ready"
    },
    "token-efficiency": {
        "id": "token-efficiency",
        "name": "Token Efficiency & AST-First Optimizer",
        "category": "ZCode / ACP",
        "icon": "⚡",
        "description": "AST-first targeted range reads, Dynamic Tool Output Compression (DTOC), and context compaction.",
        "command": "uvx",
        "args": ["token-efficiency-mcp"],
        "env": {},
        "transport": "stdio",
        "status": "ready"
    },
    "unslop-editor": {
        "id": "unslop-editor",
        "name": "Unslop Intentional Craft & Typography",
        "category": "DeepSeek / Paseo",
        "icon": "✒️",
        "description": "Strip generic AI slop, enforce high-contrast typography, and build disciplined color palettes.",
        "command": "npx",
        "args": ["-y", "unslop-ui-mcp"],
        "env": {},
        "transport": "stdio",
        "status": "ready"
    }
}


class MCPEngine:
    def __init__(self, config_file: Path = CONFIG_PATH):
        self.config_file = config_file
        self.servers: Dict[str, Dict[str, Any]] = {}
        self.processes: Dict[str, subprocess.Popen] = {}
        self.cached_tools: Dict[str, List[Dict[str, Any]]] = {}
        self.load_config()

    def load_config(self):
        self.config_file.parent.mkdir(parents=True, exist_ok=True)
        if self.config_file.exists():
            try:
                data = json.loads(self.config_file.read_text(encoding="utf-8"))
                self.servers = data.get("servers", {})
            except Exception as e:
                logger.error(f"Failed to load MCP config: {e}")
                self.servers = {}
        else:
            # Seed with default office suite
            self.servers = {
                "mac-office-suite": {
                    "id": "mac-office-suite",
                    "name": "Mac Office Suite",
                    "command": sys.executable,
                    "args": ["-c", "print('Office Suite ready')"],
                    "env": {},
                    "enabled": True,
                    "installed_at": "builtin"
                }
            }
            self.save_config()

    def save_config(self):
        try:
            self.config_file.parent.mkdir(parents=True, exist_ok=True)
            self.config_file.write_text(json.dumps({"servers": self.servers}, indent=2, ensure_ascii=False), encoding="utf-8")
        except Exception as e:
            logger.error(f"Failed to save MCP config: {e}")

    def list_marketplace(self) -> List[Dict[str, Any]]:
        result = []
        for key, item in MARKETPLACE_SERVERS.items():
            entry = dict(item)
            entry["installed"] = key in self.servers
            entry["enabled"] = self.servers.get(key, {}).get("enabled", False)
            result.append(entry)
        return result

    def search_external_mcp(self, query: str = "") -> List[Dict[str, Any]]:
        """Searches live GitHub MCP topics and Smithery AI registry, paired dynamically."""
        results = []
        q_lower = query.lower().strip()
        
        # 1. Local curated marketplace
        for key, item in MARKETPLACE_SERVERS.items():
            if not q_lower or q_lower in key or q_lower in item["name"].lower() or q_lower in item["description"].lower():
                entry = dict(item)
                entry["source"] = "Curated Catalog"
                entry["installed"] = key in self.servers
                results.append(entry)

        # 2. Query live GitHub API for topic:mcp-server
        try:
            import urllib.request, urllib.parse
            gh_query = f"topic:mcp-server {q_lower}".strip()
            gh_url = f"https://api.github.com/search/repositories?q={urllib.parse.quote(gh_query)}&sort=stars&order=desc&per_page=15"
            req = urllib.request.Request(gh_url, headers={"User-Agent": "Mika-Agent"})
            with urllib.request.urlopen(req, timeout=4) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                for repo in data.get("items", []):
                    rid = repo["name"].lower()
                    if any(r["id"] == rid for r in results):
                        continue
                    results.append({
                        "id": rid,
                        "name": repo["full_name"],
                        "category": "GitHub Open Source",
                        "icon": "🐙",
                        "description": f"⭐ {repo.get('stargazers_count', 0)} stars — {repo.get('description', '') or 'Open source MCP server on GitHub.'}",
                        "command": "npx",
                        "args": ["-y", repo["html_url"]],
                        "env": {},
                        "transport": "stdio",
                        "status": "ready",
                        "source": "GitHub",
                        "url": repo["html_url"],
                        "installed": rid in self.servers
                    })
        except Exception as e:
            logger.warning(f"GitHub search failed: {e}")

        # 3. Query live Smithery AI Registry
        try:
            import urllib.request
            smithery_url = "https://registry.smithery.ai/servers"
            req = urllib.request.Request(smithery_url, headers={"User-Agent": "Mika-Agent"})
            with urllib.request.urlopen(req, timeout=3) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                for s in data.get("servers", []):
                    name = s.get("displayName") or s.get("qualifiedName") or ""
                    desc = s.get("description") or ""
                    sid = (s.get("qualifiedName") or name).lower().replace("/", "-")
                    if q_lower and (q_lower not in name.lower() and q_lower not in desc.lower()):
                        continue
                    if any(r["id"] == sid for r in results):
                        continue
                    results.append({
                        "id": sid,
                        "name": name,
                        "category": "Smithery Registry",
                        "icon": "⚡",
                        "description": desc or "Verified server from Smithery AI MCP registry.",
                        "command": "npx",
                        "args": ["-y", f"@smithery/cli@{sid}"],
                        "env": {},
                        "transport": "stdio",
                        "status": "ready",
                        "source": "Smithery AI",
                        "installed": sid in self.servers
                    })
        except Exception as e:
            logger.warning(f"Smithery search failed: {e}")

        return results

    def list_installed(self) -> List[Dict[str, Any]]:
        result = []
        for sid, conf in self.servers.items():
            item = dict(conf)
            item["id"] = sid
            item["name"] = conf.get("name", sid)
            item["scope"] = conf.get("scope", "user")
            
            # Transport normalization
            if conf.get("command"):
                item["type"] = "stdio"
            elif conf.get("type") in ["http", "sse", "streamableHttp"]:
                item["type"] = conf["type"]
            elif conf.get("url"):
                item["type"] = "http"
            else:
                item["type"] = "stdio"
            
            # Tools & Status
            if sid == "mac-office-suite":
                office_tools = [
                    {"name": "create_deck", "description": "Generate PowerPoint .pptx deck & interactive HTML presentation"},
                    {"name": "create_model", "description": "Generate multi-tab Excel financial model & budget calculation"},
                    {"name": "create_proposal", "description": "Generate Word proposal document (.docx) with cover page"},
                    {"name": "create_workspace", "description": "Create organized project workspace on Desktop"}
                ]
                item["tools"] = office_tools
                item["tools_count"] = len(office_tools)
                item["status"] = "connected" if conf.get("enabled", True) else "disconnected"
            elif sid in self.cached_tools:
                item["tools"] = self.cached_tools[sid]
                item["tools_count"] = len(self.cached_tools[sid])
                item["status"] = "connected" if conf.get("enabled", True) else "disconnected"
            else:
                item["tools"] = []
                item["tools_count"] = 0
                item["status"] = "connected" if conf.get("enabled", True) else "disconnected"

            result.append(item)
        return result

    def probe_server(self, server_id: Optional[str] = None, config: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Runs connectivity & tool discovery probe similar to ZCode's testMcpConnectivity."""
        start_time = time.time()
        cfg = config or (self.servers.get(server_id) if server_id else None)
        if not cfg:
            return {"success": False, "status": "error", "error": "Server configuration not found", "response_time_ms": 0}

        sid = server_id or cfg.get("id") or cfg.get("name") or "custom"

        # Special case: mac-office-suite
        if sid == "mac-office-suite":
            office_tools = [
                {"name": "create_deck", "description": "Generate PowerPoint .pptx deck & interactive HTML presentation"},
                {"name": "create_model", "description": "Generate multi-tab Excel financial model & budget calculation"},
                {"name": "create_proposal", "description": "Generate Word proposal document (.docx) with cover page"},
                {"name": "create_workspace", "description": "Create organized project workspace on Desktop"}
            ]
            self.cached_tools[sid] = office_tools
            return {
                "success": True,
                "status": "connected",
                "response_time_ms": round((time.time() - start_time) * 1000, 1),
                "tool_count": len(office_tools),
                "tools": office_tools
            }

        cmd = cfg.get("command", "")
        url = cfg.get("url", "")

        # 1. URL / HTTP probe
        if url and not cmd:
            try:
                import urllib.request
                req = urllib.request.Request(url, headers=cfg.get("headers", {}))
                with urllib.request.urlopen(req, timeout=4) as resp:
                    resp_time = round((time.time() - start_time) * 1000, 1)
                    return {
                        "success": True,
                        "status": "connected",
                        "response_time_ms": resp_time,
                        "tool_count": len(self.cached_tools.get(sid, [])),
                        "tools": self.cached_tools.get(sid, [])
                    }
            except Exception as e:
                resp_time = round((time.time() - start_time) * 1000, 1)
                return {
                    "success": False,
                    "status": "error",
                    "failureKind": "connection_refused",
                    "error": str(e),
                    "response_time_ms": resp_time
                }

        # 2. Stdio probe
        if not cmd:
            return {"success": False, "status": "error", "error": "Missing command for stdio server", "response_time_ms": 0}

        executable = shutil.which(cmd)
        if not executable and not os.path.isabs(cmd):
            resp_time = round((time.time() - start_time) * 1000, 1)
            return {
                "success": False,
                "status": "error",
                "failureKind": "spawn_failed",
                "error": f"Executable '{cmd}' not found on system PATH. Please ensure Node/Python/uv is installed.",
                "response_time_ms": resp_time
            }

        args = cfg.get("args", [])
        if isinstance(args, str):
            args = shlex.split(args) if args.strip() else []
        full_cmd = [cmd] + args
        env = os.environ.copy()
        env.update(cfg.get("env", {}))

        rpc_request = {"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}
        try:
            proc = subprocess.Popen(
                full_cmd,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                env=env
            )
            stdout, stderr = proc.communicate(input=json.dumps(rpc_request) + "\n", timeout=3.5)
            resp_time = round((time.time() - start_time) * 1000, 1)

            tools = []
            for line in stdout.splitlines():
                line = line.strip()
                if line.startswith("{") and line.endswith("}"):
                    try:
                        res = json.loads(line)
                        if "result" in res and "tools" in res["result"]:
                            tools = res["result"]["tools"]
                            break
                    except Exception:
                        pass

            if tools:
                self.cached_tools[sid] = tools
                return {
                    "success": True,
                    "status": "connected",
                    "response_time_ms": resp_time,
                    "tool_count": len(tools),
                    "tools": tools
                }
            elif proc.returncode == 0:
                return {
                    "success": True,
                    "status": "connected",
                    "response_time_ms": resp_time,
                    "tool_count": len(self.cached_tools.get(sid, [])),
                    "tools": self.cached_tools.get(sid, [])
                }
            else:
                return {
                    "success": False,
                    "status": "error",
                    "failureKind": "process_exit",
                    "error": stderr.strip() or f"Process exited with code {proc.returncode}",
                    "response_time_ms": resp_time
                }
        except subprocess.TimeoutExpired:
            proc.kill()
            resp_time = round((time.time() - start_time) * 1000, 1)
            return {
                "success": True,
                "status": "connected",
                "response_time_ms": resp_time,
                "tool_count": len(self.cached_tools.get(sid, [])),
                "tools": self.cached_tools.get(sid, []),
                "note": "Process spawned successfully (keep-alive stream)"
            }
        except Exception as e:
            resp_time = round((time.time() - start_time) * 1000, 1)
            return {
                "success": False,
                "status": "error",
                "failureKind": "spawn_failed",
                "error": str(e),
                "response_time_ms": resp_time
            }

    def get_raw_config(self) -> Dict[str, Any]:
        """Returns raw JSON configuration from ~/.mika/mcp_servers.json."""
        try:
            if self.config_file.exists():
                text = self.config_file.read_text(encoding="utf-8")
                return {"status": "ok", "raw": text}
            raw = json.dumps({"mcpServers": self.servers}, indent=2, ensure_ascii=False)
            return {"status": "ok", "raw": raw}
        except Exception as e:
            return {"status": "error", "error": str(e), "raw": "{}"}

    def save_raw_config(self, raw_str: str) -> Dict[str, Any]:
        """Saves and validates raw JSON configuration."""
        try:
            data = json.loads(raw_str)
            if not isinstance(data, dict):
                return {"status": "error", "error": "Root JSON must be an object"}

            servers_dict = data.get("mcpServers") or data.get("servers") or data
            if not isinstance(servers_dict, dict):
                return {"status": "error", "error": "'mcpServers' must be a dictionary of server objects"}

            self.servers = servers_dict
            self.save_config()
            return {"status": "ok", "count": len(self.servers)}
        except json.JSONDecodeError as jde:
            return {"status": "error", "error": f"JSON syntax error: {jde}"}
        except Exception as e:
            return {"status": "error", "error": str(e)}

    def install_server(self, server_id: str, config: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Installs from marketplace or custom definition."""
        if server_id in MARKETPLACE_SERVERS and not config:
            catalog_item = MARKETPLACE_SERVERS[server_id]
            self.servers[server_id] = {
                "id": server_id,
                "name": catalog_item["name"],
                "command": catalog_item["command"],
                "args": catalog_item["args"],
                "env": catalog_item.get("env", {}),
                "scope": catalog_item.get("scope", "user"),
                "enabled": True,
                "type": "marketplace"
            }
        elif config:
            cmd = config.get("command", "")
            args = config.get("args", [])
            if isinstance(args, str):
                args = shlex.split(args) if args.strip() else []

            env = config.get("env", {})
            if isinstance(env, str):
                try:
                    env = json.loads(env) if env.strip() else {}
                except Exception:
                    env = {}

            headers = config.get("headers", {})
            if isinstance(headers, str):
                try:
                    headers = json.loads(headers) if headers.strip() else {}
                except Exception:
                    headers = {}

            url = config.get("url", "").strip()
            if url and not cmd:
                if "github.com" in url or url.endswith(".git"):
                    cmd = "npx"
                    args = ["-y", url]
                elif url.startswith("http"):
                    cmd = ""

            self.servers[server_id] = {
                "id": server_id,
                "name": config.get("name", server_id),
                "command": cmd,
                "args": args,
                "env": env,
                "headers": headers,
                "scope": config.get("scope", config.get("storageLevel", "user")),
                "enabled": config.get("enabled", True),
                "type": config.get("type", "stdio" if cmd else "http"),
                "url": url,
                "timeoutMs": config.get("timeoutMs", 5000)
            }
        elif not config:
            ext = self.search_external_mcp(server_id)
            match = next((item for item in ext if item["id"] == server_id), None)
            if match:
                self.servers[server_id] = {
                    "id": server_id,
                    "name": match["name"],
                    "command": match["command"],
                    "args": match["args"],
                    "env": match.get("env", {}),
                    "scope": "user",
                    "enabled": True,
                    "type": match.get("source", "external")
                }
            else:
                return {"error": f"Unknown server {server_id} and no config provided"}
        else:
            return {"error": f"Unknown server {server_id} and no config provided"}

        self.save_config()
        return {"status": "installed", "server": self.servers[server_id]}

    def uninstall_server(self, server_id: str) -> Dict[str, Any]:
        if server_id in self.servers:
            self.stop_server(server_id)
            del self.servers[server_id]
            self.save_config()
            return {"status": "uninstalled", "server_id": server_id}
        return {"error": "Server not found"}

    def toggle_server(self, server_id: str, enabled: bool) -> Dict[str, Any]:
        if server_id in self.servers:
            self.servers[server_id]["enabled"] = enabled
            if not enabled:
                self.stop_server(server_id)
            self.save_config()
            return {"status": "updated", "enabled": enabled}
        return {"error": "Server not found"}

    def stop_server(self, server_id: str):
        if server_id in self.processes:
            proc = self.processes[server_id]
            try:
                proc.terminate()
                proc.wait(timeout=2)
            except Exception:
                try:
                    proc.kill()
                except Exception:
                    pass
            del self.processes[server_id]

    def stop_all(self):
        for sid in list(self.processes.keys()):
            self.stop_server(sid)

    def execute_tool(self, server_id: str, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Calls a tool on a configured MCP server via JSON-RPC 2.0 or local dispatch."""
        if server_id not in self.servers:
            return {"error": f"Server {server_id} not installed"}
        
        conf = self.servers[server_id]
        if not conf.get("enabled", True):
            return {"error": f"Server {server_id} is disabled"}

        # Handle local built-in office tools
        if server_id == "mac-office-suite":
            try:
                from agent_server.mika_employee_suite import (
                    handle_presentation_request,
                    create_financial_model,
                    create_project_proposal,
                    create_finder_workspace
                )
                if tool_name == "create_deck":
                    return handle_presentation_request(arguments.get("topic", "Georgia Tours 2027"))
                elif tool_name == "create_model":
                    return create_financial_model(arguments.get("topic", "Business Plan"))
                elif tool_name == "create_proposal":
                    return create_project_proposal(arguments.get("title", "Proposal"), arguments.get("client", "Client"))
                elif tool_name == "create_workspace":
                    return create_finder_workspace(arguments.get("name", "Project"))
                else:
                    return {"status": "ok", "message": f"Local suite executed {tool_name}"}
            except Exception as e:
                return {"error": str(e)}

        # Generic stdio MCP runner
        command = [conf["command"]] + conf.get("args", [])
        env = os.environ.copy()
        env.update(conf.get("env", {}))

        rpc_request = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/call",
            "params": {
                "name": tool_name,
                "arguments": arguments
            }
        }

        try:
            p = subprocess.Popen(
                command,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                env=env
            )
            stdout, stderr = p.communicate(input=json.dumps(rpc_request) + "\n", timeout=15)
            
            # Parse JSON-RPC response
            for line in stdout.splitlines():
                line = line.strip()
                if line.startswith("{") and line.endswith("}"):
                    try:
                        res = json.loads(line)
                        if "result" in res:
                            return res["result"]
                        elif "error" in res:
                            return {"error": res["error"]}
                    except Exception:
                        continue
            
            return {"output": stdout.strip(), "stderr": stderr.strip()}
        except Exception as e:
            return {"error": f"MCP execution failed: {e}"}

    def get_all_tools(self) -> List[Dict[str, Any]]:
        """Returns unified list of all available tools across active MCP servers."""
        tools = []
        # Add Office Suite Tools
        tools.extend([
            {
                "name": "create_deck",
                "server": "mac-office-suite",
                "description": "Generate end-to-end PowerPoint .pptx deck & interactive HTML presentation",
                "parameters": {"topic": "string"}
            },
            {
                "name": "create_model",
                "server": "mac-office-suite",
                "description": "Generate professional multi-tab Excel financial model & budget",
                "parameters": {"topic": "string"}
            },
            {
                "name": "create_proposal",
                "server": "mac-office-suite",
                "description": "Generate executive Word .docx proposal & contract outline",
                "parameters": {"title": "string", "client": "string"}
            },
            {
                "name": "create_workspace",
                "server": "mac-office-suite",
                "description": "Organize dedicated project folder hierarchy on macOS Desktop",
                "parameters": {"name": "string"}
            }
        ])

        for sid, conf in self.servers.items():
            if sid != "mac-office-suite" and conf.get("enabled", True):
                tools.append({
                    "name": f"{sid}_tool",
                    "server": sid,
                    "description": f"Tool from {conf.get('name', sid)}",
                    "parameters": {}
                })
        return tools


# Global Engine Instance
mcp_engine = MCPEngine()

if __name__ == "__main__":
    print("Mika MCP Engine Initialized")
    print(f"Marketplace items: {len(mcp_engine.list_marketplace())}")
    print(f"Installed items: {len(mcp_engine.list_installed())}")
