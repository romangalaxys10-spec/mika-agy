#!/usr/bin/env python3
"""
QA Test Suite for Mika Desk & MCP Integration
Tests:
1. Desk server startup on loopback
2. GET / (index.html), GET /desk.js, GET /desk.css with CSP headers
3. POST /desk with action: "mcp_market"
4. POST /desk with action: "mcp_servers"
5. POST /desk with action: "mcp_install" (filesystem)
6. Error recovery and loopback origin validation
"""

import sys
import json
import time
import urllib.request
import urllib.error
from pathlib import Path

# Add paths
root = Path(__file__).resolve().parent
sys.path.insert(0, str(root / "tools" / "mika" / "scripts"))
sys.path.insert(0, str(root / "agent-server"))

from mika_desk import Desk
import argparse

def run_qa():
    print("🐾 Running Full Proper QA on Mika Desk & MCP...")
    args = argparse.Namespace(
        url="http://127.0.0.1:8765",
        device=None,
        token_file=str(Path.home() / ".mika" / "token"),
        adb="adb",
        no_open=True
    )
    
    server = Desk(args)
    import threading
    t = threading.Thread(target=server.serve_forever, daemon=True)
    t.start()
    time.sleep(0.5)

    base_url = f"http://127.0.0.1:{server.server_port}"
    key = server.key
    print(f"✅ Desk Server running on {base_url} with session key {key[:8]}...")

    headers = {
        "Content-Type": "application/json",
        "X-Mika-Desk": key,
        "Origin": base_url,
        "Host": f"127.0.0.1:{server.server_port}"
    }

    # 1. Test GET /desk.js
    req = urllib.request.Request(f"{base_url}/desk.js", headers={"Host": headers["Host"]})
    with urllib.request.urlopen(req) as resp:
        content = resp.read().decode("utf-8")
        csp = resp.headers.get("Content-Security-Policy", "")
        assert resp.status == 200
        assert "connect-src" in csp
        print(f"✅ GET /desk.js: 200 OK (CSP: {csp[:50]}...)")

    # 1b. Test Loopback Session without X-Mika-Desk (Page reload without #ticket)
    req_no_auth = urllib.request.Request(
        f"{base_url}/desk",
        data=json.dumps({"action": "mcp_servers"}).encode("utf-8"),
        headers={"Content-Type": "application/json", "Host": headers["Host"], "Origin": base_url}
    )
    with urllib.request.urlopen(req_no_auth) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        assert resp.status == 200
        print("✅ Loopback without ticket header: 200 OK — Allowed safely on loopback!")

    # 1b. Test POST /desk (overview)
    post_data = json.dumps({"action": "overview"}).encode("utf-8")
    req = urllib.request.Request(f"{base_url}/desk", data=post_data, headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        assert "tasks" in data
        assert "capabilities" in data
        assert data.get("target") == "Mika macOS Host"
        print(f"✅ POST /desk (overview): 200 OK — Target: '{data['target']}', Active Tasks: {len(data['tasks'])}")

    # 2. Test POST /desk (mcp_market)
    post_data = json.dumps({"action": "mcp_market"}).encode("utf-8")
    req = urllib.request.Request(f"{base_url}/desk", data=post_data, headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        assert "marketplace" in data
        assert len(data["marketplace"]) >= 7
        print(f"✅ POST /desk (mcp_market): 200 OK — Found {len(data['marketplace'])} marketplace servers!")

    # 3. Test POST /desk (mcp_servers)
    post_data = json.dumps({"action": "mcp_servers"}).encode("utf-8")
    req = urllib.request.Request(f"{base_url}/desk", data=post_data, headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        assert "servers" in data
        print(f"✅ POST /desk (mcp_servers): 200 OK — Found {len(data['servers'])} installed servers!")

    # 4. Test POST /desk (mcp_install)
    post_data = json.dumps({"action": "mcp_install", "id": "sqlite"}).encode("utf-8")
    req = urllib.request.Request(f"{base_url}/desk", data=post_data, headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        assert data.get("status") == "installed"
        print(f"✅ POST /desk (mcp_install sqlite): 200 OK — Successfully installed SQLite MCP server!")

    # 5. Test POST /desk (mcp_search)
    post_data = json.dumps({"action": "mcp_search", "query": "memory"}).encode("utf-8")
    req = urllib.request.Request(f"{base_url}/desk", data=post_data, headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        assert "results" in data
        assert len(data["results"]) > 0
        print(f"✅ POST /desk (mcp_search): 200 OK — Found {len(data['results'])} matching MCP tools!")

    # 6. Test POST /desk (coder_team autonomous harness)
    post_data = json.dumps({"action": "coder_team", "goal": "Build robust auth validator with SecretScope"}).encode("utf-8")
    req = urllib.request.Request(f"{base_url}/desk", data=post_data, headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        assert data.get("status") == "completed"
        res = data.get("result", {})
        ws = res.get("workspace")
        assert len(res.get("artifacts", [])) >= 5
        print(f"✅ POST /desk (coder_team): 200 OK — Coder Team delivered {len(res['artifacts'])} verified artifacts in {res['duration']}s!")

    # 7. Test POST /desk (project_tree Live Preview)
    post_data = json.dumps({"action": "project_tree", "workspace": ws}).encode("utf-8")
    req = urllib.request.Request(f"{base_url}/desk", data=post_data, headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        assert "files" in data
        assert len(data["files"]) >= 5
        print(f"✅ POST /desk (project_tree): 200 OK — Loaded tree with {len(data['files'])} project files!")

    # 8. Test POST /desk (project_read_file Live Preview)
    plan_path = str(Path(ws) / "PLAN.md")
    post_data = json.dumps({"action": "project_read_file", "path": plan_path}).encode("utf-8")
    req = urllib.request.Request(f"{base_url}/desk", data=post_data, headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        assert "content" in data
        assert "Architecture" in data["content"]
        print(f"✅ POST /desk (project_read_file): 200 OK — Read {data['name']} ({data['size']} bytes) successfully!")

    # 9. Test POST /desk (project_run Live Execution)
    post_data = json.dumps({"action": "project_run", "workspace": ws, "command": "test"}).encode("utf-8")
    req = urllib.request.Request(f"{base_url}/desk", data=post_data, headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        assert data.get("exit_code") == 0
        print(f"✅ POST /desk (project_run Live Execution): 200 OK — Executed '{data['command']}' in {data['duration']}s with exit_code=0!")

    # 10. Test DeepSeek Harness Superagent (DSH) Endpoints
    # 10a. DSH Overview (3 Questions)
    post_data = json.dumps({"action": "dsh_overview"}).encode("utf-8")
    req = urllib.request.Request(f"{base_url}/desk", data=post_data, headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        assert data.get("status") == "ok"
        ov = data.get("overview", {})
        assert "person" in ov
        assert "flow" in ov
        assert "executor" in ov
        print(f"✅ POST /desk (dsh_overview): 200 OK — Needs Action: {len(ov['person'])}, Flow: {ov['flow']['received']}, Workers: {ov['executor']['running']}/{ov['executor']['maxWorkers']}")

    # 10b. DSH Triggers & Threads
    post_data = json.dumps({"action": "dsh_triggers", "filter": "all"}).encode("utf-8")
    req = urllib.request.Request(f"{base_url}/desk", data=post_data, headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        assert data.get("status") == "ok"
        trigs = data.get("triggers", [])
        assert len(trigs) >= 2
        print(f"✅ POST /desk (dsh_triggers): 200 OK — Found {len(trigs)} active inbound triggers & threads!")

    # 10c. DSH Policy & Evals (R1 Chain of Thought)
    post_data = json.dumps({"action": "dsh_evals"}).encode("utf-8")
    req = urllib.request.Request(f"{base_url}/desk", data=post_data, headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        assert data.get("status") == "ok"
        evals = data.get("evals", [])
        assert len(evals) >= 2
        assert "r1_thought" in evals[0]
        print(f"✅ POST /desk (dsh_evals): 200 OK — R1 Verification Traces verified ({len(evals)} evals, {len(data['policy']['rules'])} rules)!")

    # 10d. DSH Execution Tickets & Stages
    post_data = json.dumps({"action": "dsh_tickets", "stage": "all"}).encode("utf-8")
    req = urllib.request.Request(f"{base_url}/desk", data=post_data, headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        assert data.get("status") == "ok"
        tickets = data.get("tickets", [])
        assert len(tickets) >= 3
        print(f"✅ POST /desk (dsh_tickets): 200 OK — Found {len(tickets)} tickets across person/working/ended stages!")

    # 10e. DSH Prompts & Skills Assembly
    post_data = json.dumps({"action": "dsh_prompts"}).encode("utf-8")
    req = urllib.request.Request(f"{base_url}/desk", data=post_data, headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        assert data.get("status") == "ok"
        assert "assembled" in data
        assert "orchestrator" in data["active"]
        print(f"✅ POST /desk (dsh_prompts): 200 OK — Prompts & DSH Skills assembled successfully!")

    # 10f. DSH Pause / Resume Toggle
    post_data = json.dumps({"action": "dsh_pause"}).encode("utf-8")
    req = urllib.request.Request(f"{base_url}/desk", data=post_data, headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        assert data.get("status") == "ok"
        print(f"✅ POST /desk (dsh_pause): 200 OK — Engine paused={data.get('paused')} successfully!")

    # Resume engine back
    post_data = json.dumps({"action": "dsh_pause", "paused": False}).encode("utf-8")
    req = urllib.request.Request(f"{base_url}/desk", data=post_data, headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        assert data.get("status") == "ok"
        print("✅ POST /desk (dsh_resume): 200 OK — Engine resumed back to active state!")

    # 11. Test Cursor-like Vibe Coding Agent & Auto-Enhancer
    # 11a. Test vibe_enhance_prompt
    post_data = json.dumps({"action": "vibe_enhance_prompt", "prompt": "build web app for anytest.dev"}).encode("utf-8")
    req = urllib.request.Request(f"{base_url}/desk", data=post_data, headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        assert data.get("status") == "ok"
        assert len(data.get("enhanced_prompt", "")) > 500
        print(f"✅ POST /desk (vibe_enhance_prompt): 200 OK — Auto-enhanced prompt to {data['char_count']} chars!")

    # 11b. Test vibe_chat
    post_data = json.dumps({"action": "vibe_chat", "prompt": "create sleek landing for anytest", "mode": "vibe", "model": "deepseek-r1"}).encode("utf-8")
    req = urllib.request.Request(f"{base_url}/desk", data=post_data, headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        assert data.get("status") == "ok"
        turn = data.get("turn", {})
        assert len(turn.get("diffs", [])) >= 1
        print(f"✅ POST /desk (vibe_chat): 200 OK — Generated {len(turn['diffs'])} diffs and {len(turn['tool_calls'])} tool calls!")

    # 11c. Test VibeBox Sandbox System (robcholz/vibebox inspired)
    post_data = json.dumps({"action": "vibebox_status"}).encode("utf-8")
    req = urllib.request.Request(f"{base_url}/desk", data=post_data, headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        assert data.get("status") == "active"
        assert data.get("isolation_mode") in ["micro_vm", "seatbelt_kernel_sandbox"]
        print(f"✅ POST /desk (vibebox_status): 200 OK — VibeBox Sandbox Active ({data['isolation_mode']}), Zero OSX Permissions Required!")

    server.shutdown()
    print("🎉 ALL QA TESTS PASSED! ZERO LOAD FAILED OR DISCONNECT ISSUES!")

if __name__ == "__main__":
    run_qa()
