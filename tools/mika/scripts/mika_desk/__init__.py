"""A loopback-only browser desk for one Mika phone, using the existing CLI transport."""

import argparse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from importlib.resources import files
import json
import os
import re
import secrets
import sys
import time
import threading
import webbrowser
from pathlib import Path

from mika_cli import Adb, CliError, connection, execute, recent_tasks, redact


ASSETS = {
    "/": ("index.html", "text/html"),
    "/desk.css": ("desk.css", "text/css"),
    "/desk.js": ("desk.js", "text/javascript"),
    # 3× header rendition of Android's drawable-nodpi/mika_launcher_art.png.
    "/mika-logo.png": ("mika-logo.png", "image/png"),
}
WATCH_SECONDS = 4
FIELDS = {
    "overview": set(), "watch": {"task_id"}, "select": {"device"}, "run": {"goal"},
    "status": {"task_id"}, "cancel": {"task_id"}, "answer": {"task_id", "text"},
    "steer": {"task_id", "text"}, "open_file": {"path"},
    "mcp_market": set(), "mcp_servers": set(), "mcp_install": {"id", "config", "server_id"},
    "mcp_uninstall": {"id", "server_id"}, "mcp_toggle": {"id", "enabled", "server_id"}, "horizon": {"task_id", "goal"}, "mcp_search": {"query"},
    "mcp_probe": {"id", "config"}, "mcp_raw_config": set(), "mcp_save_raw": {"raw"},
    "coder_team": {"task_id", "goal"},
    "project_tree": {"workspace"}, "project_read_file": {"path"}, "project_run": {"workspace", "command"},
    "dsh_overview": set(), "dsh_pause": {"paused"}, "dsh_tickets": {"stage"},
    "dsh_ticket_retry": {"ticket_id"}, "dsh_ticket_answer": {"ticket_id", "answer"}, "dsh_ticket_approve": {"ticket_id"},
    "dsh_triggers": {"filter"}, "dsh_requeue": {"trigger_id"}, "dsh_evals": set(),
    "dsh_prompts": set(), "dsh_save_prompt": {"section", "text"}
}


def _ensure_backend_paths():
    candidates = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "agent-server")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "..")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")),
        "/Applications/Mika.app/Contents/Resources/mika-core",
        "/Users/ekaterina.gwaladze/.gemini/antigravity/scratch/mika/agent-server",
    ]
    for c in candidates:
        if os.path.isdir(c) and c not in sys.path:
            sys.path.insert(0, c)

def command(data):
    if not isinstance(data, dict):
        raise ValueError
    action = data.get("action")
    if not action or action not in FIELDS:
        raise ValueError
    if "task_id" in data and isinstance(data["task_id"], str) and not re.fullmatch(r"[A-Za-z0-9_-]+", data["task_id"]):
        raise ValueError
    return action


class Desk(ThreadingHTTPServer):
    def __init__(self, args):
        # A fresh loopback port each run; the session secret only travels in the
        # printed link's fragment, which browsers never send to the server.
        super().__init__(("127.0.0.1", 0), Handler)
        self.args = args
        if self.args.url:
            self.args.device = None
        elif not args.device:
            args.device = os.environ.get("ANDROID_SERIAL")
        self.lock = threading.Lock()
        self.key = secrets.token_urlsafe(32)
        self.host = f"127.0.0.1:{self.server_port}"
        self.origin = "http://" + self.host
        self.cached_overview = None
        if self.args.url and ("127.0.0.1" in self.args.url or "localhost" in self.args.url):
            self.ensure_agent_server()

    def ensure_agent_server(self):
        """Auto-heals and starts local agent server if not running on loopback."""
        import socket
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.settimeout(0.3)
                if s.connect_ex(("127.0.0.1", 8765)) == 0:
                    return
        except Exception:
            pass

        # Locate mika_agent_server.py
        candidates = [
            os.path.join(os.path.dirname(__file__), "..", "..", "..", "agent-server", "mika_agent_server.py"),
            os.path.join(os.path.dirname(__file__), "..", "mika_agent_server.py"),
            "/Applications/Mika.app/Contents/Resources/mika-core/mika_agent_server.py"
        ]
        for c in candidates:
            c_path = os.path.abspath(c)
            if os.path.exists(c_path):
                try:
                    import subprocess
                    subprocess.Popen([sys.executable, c_path, "--port", "8765"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                    time.sleep(0.6)
                    break
                except Exception:
                    pass

    def pin_target(self, choice):
        # A session owns one target even across disconnects and concurrent tabs.
        with self.lock:
            if self.args.url or self.args.device:
                if choice is not None and choice != self.args.device:
                    raise CliError("device_pinned", "The desk already has a target.", http_status=409)
                return
            online = [d["device"] for d in Adb(self.args.adb).devices() if d["state"] == "device"]
            if choice is None and len(online) == 1:
                choice = online[0]
            if choice not in online:
                raise CliError("device_selection", "Choose an online phone.", devices=online, http_status=409)
            self.args.device = choice

    def dispatch(self, action, data, sensitive):
        _ensure_backend_paths()

        if action == "open_file":
            path = data.get("path", "")
            if path and os.path.exists(path):
                import subprocess
                subprocess.run(["open", path])
                return {"opened": True, "path": path}
            return {"opened": False, "error": "file not found"}

        # DeepSeek Harness Superagent (DSH) Endpoints
        if action == "dsh_overview":
            try:
                from mika_dsh_engine import dsh_engine
                return {"status": "ok", "overview": dsh_engine.get_overview()}
            except Exception as e:
                return {"status": "error", "error": str(e)}

        if action == "dsh_pause":
            try:
                from mika_dsh_engine import dsh_engine
                return dsh_engine.toggle_pause(data.get("paused"))
            except Exception as e:
                return {"status": "error", "error": str(e)}

        if action == "dsh_tickets":
            try:
                from mika_dsh_engine import dsh_engine
                return dsh_engine.list_tickets(data.get("stage", "all"))
            except Exception as e:
                return {"status": "error", "error": str(e)}

        if action == "dsh_ticket_retry":
            try:
                from mika_dsh_engine import dsh_engine
                return dsh_engine.retry_ticket(data.get("ticket_id"))
            except Exception as e:
                return {"status": "error", "error": str(e)}

        if action == "dsh_ticket_answer":
            try:
                from mika_dsh_engine import dsh_engine
                return dsh_engine.answer_ticket(data.get("ticket_id"), data.get("answer", ""))
            except Exception as e:
                return {"status": "error", "error": str(e)}

        if action == "dsh_ticket_approve":
            try:
                from mika_dsh_engine import dsh_engine
                return dsh_engine.approve_ticket(data.get("ticket_id"))
            except Exception as e:
                return {"status": "error", "error": str(e)}

        if action == "dsh_triggers":
            try:
                from mika_dsh_engine import dsh_engine
                return dsh_engine.list_triggers(data.get("filter"))
            except Exception as e:
                return {"status": "error", "error": str(e)}

        if action == "dsh_requeue":
            try:
                from mika_dsh_engine import dsh_engine
                return dsh_engine.requeue_trigger(data.get("trigger_id"))
            except Exception as e:
                return {"status": "error", "error": str(e)}

        if action == "dsh_evals":
            try:
                from mika_dsh_engine import dsh_engine
                return dsh_engine.list_evals()
            except Exception as e:
                return {"status": "error", "error": str(e)}

        if action == "dsh_prompts":
            try:
                from mika_dsh_engine import dsh_engine
                return dsh_engine.get_prompts()
            except Exception as e:
                return {"status": "error", "error": str(e)}

        if action == "dsh_save_prompt":
            try:
                from mika_dsh_engine import dsh_engine
                return dsh_engine.save_prompt(data.get("section", "team_custom"), data.get("text", ""))
            except Exception as e:
                return {"status": "error", "error": str(e)}

        # MCP Engine Endpoints
        if action == "mcp_market":
            try:
                from mika_mcp_engine import mcp_engine
                return {"status": "ok", "marketplace": mcp_engine.list_marketplace()}
            except Exception as e:
                return {"status": "error", "error": str(e), "marketplace": []}

        if action == "mcp_search":
            try:
                from mika_mcp_engine import mcp_engine
                return {"status": "ok", "results": mcp_engine.search_external_mcp(data.get("query", ""))}
            except Exception as e:
                return {"status": "error", "error": str(e), "results": []}

        if action == "coder_team":
            try:
                from mika_coder_team import coder_team
                res = coder_team.execute_task(data.get("goal", "Full development cycle"))
                return {"status": "completed", "result": res}
            except Exception as e:
                return {"error": str(e)}

        if action == "mcp_servers":
            try:
                from mika_mcp_engine import mcp_engine
                return {"status": "ok", "servers": mcp_engine.list_installed()}
            except Exception as e:
                return {"status": "error", "error": str(e), "servers": []}

        if action == "mcp_install":
            try:
                from mika_mcp_engine import mcp_engine
                sid = data.get("id") or data.get("server_id")
                return mcp_engine.install_server(sid, data.get("config"))
            except Exception as e:
                return {"status": "error", "error": str(e)}

        if action == "mcp_uninstall":
            try:
                from mika_mcp_engine import mcp_engine
                sid = data.get("id") or data.get("server_id")
                return mcp_engine.uninstall_server(sid)
            except Exception as e:
                return {"status": "error", "error": str(e)}

        if action == "mcp_toggle":
            try:
                from mika_mcp_engine import mcp_engine
                sid = data.get("id") or data.get("server_id")
                return mcp_engine.toggle_server(sid, data.get("enabled", True))
            except Exception as e:
                return {"status": "error", "error": str(e)}

        if action == "mcp_probe":
            try:
                from mika_mcp_engine import mcp_engine
                return mcp_engine.probe_server(data.get("id"), data.get("config"))
            except Exception as e:
                return {"success": False, "status": "error", "error": str(e)}

        if action == "mcp_raw_config":
            try:
                from mika_mcp_engine import mcp_engine
                return mcp_engine.get_raw_config()
            except Exception as e:
                return {"status": "error", "error": str(e)}

        if action == "mcp_save_raw":
            try:
                from mika_mcp_engine import mcp_engine
                return mcp_engine.save_raw_config(data.get("raw", "{}"))
            except Exception as e:
                return {"status": "error", "error": str(e)}

        if action == "horizon":
            try:
                sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "agent-server"))
                from mika_long_horizon import LongHorizonExecutor
                task_id = data.get("task_id", "")
                executor = LongHorizonExecutor()
                def run_h():
                    executor.execute_loop(task_id, data.get("goal", "Long Horizon Goal"))
                threading.Thread(target=run_h, daemon=True).start()
                return {"task_id": task_id, "mode": "long_horizon", "status": "running"}
            except Exception as e:
                return {"error": str(e), "status": "fallback"}

        if action == "project_tree":
            ws_path = data.get("workspace")
            if not ws_path or not os.path.exists(ws_path):
                return {"workspace": "", "files": []}
            p = Path(ws_path).resolve()
            files = []
            if p.exists() and p.is_dir():
                for item in sorted(p.glob("**/*")):
                    if item.is_file() and not item.name.startswith("."):
                        files.append({
                            "name": item.name,
                            "rel_path": str(item.relative_to(p)),
                            "path": str(item),
                            "size": item.stat().st_size,
                            "ext": item.suffix.lower()
                        })
            return {"workspace": str(p), "files": files}

        if action == "project_read_file":
            file_path = data.get("path", "")
            p = Path(file_path).resolve()
            if p.exists() and p.is_file():
                try:
                    content = p.read_text(encoding="utf-8", errors="replace")
                    return {"path": str(p), "name": p.name, "content": content, "size": p.stat().st_size}
                except Exception as e:
                    return {"error": str(e)}
            return {"error": "file not found"}

        if action == "project_run":
            ws_path = data.get("workspace")
            if not ws_path or not os.path.exists(ws_path):
                return {"stdout": "", "stderr": "No project workspace found. Please select an active project with files.", "exit_code": 1, "duration": 0, "command": ""}
            p = Path(ws_path).resolve()
            cmd_type = data.get("command", "main")
            import subprocess
            exec_cmd = [sys.executable, "-m", "unittest", "test_suite.py"] if cmd_type == "test" else [sys.executable, "main.py", "--action", "run"]
            start_t = time.time()
            try:
                proc = subprocess.run(
                    exec_cmd,
                    cwd=str(p),
                    capture_output=True,
                    text=True,
                    timeout=20
                )
                duration = round(time.time() - start_t, 3)
                return {
                    "stdout": proc.stdout,
                    "stderr": proc.stderr,
                    "exit_code": proc.returncode,
                    "duration": duration,
                    "command": " ".join(exec_cmd)
                }
            except Exception as e:
                return {
                    "stdout": "",
                    "stderr": str(e),
                    "exit_code": -1,
                    "duration": round(time.time() - start_t, 3),
                    "command": " ".join(exec_cmd)
                }

        self.pin_target(data.get("device"))
        if action in {"overview", "select", "watch"}:
            for attempt in range(2):
                try:
                    with connection(self.args, sensitive) as (client, transport):
                        info = client.discover()
                        if action == "watch":
                            # A state change wakes the view early. At the deadline the same
                            # overview also picks up progress text and other remote tasks.
                            try:
                                client.request("POST", f"/tasks/{data['task_id']}/wait", {"timeout_s": min(WATCH_SECONDS, 2)},
                                               timeout=max(client.timeout, WATCH_SECONDS + 5))
                            except CliError as exc:
                                if exc.details.get("http_status") != 404:
                                    raise
                                # The agent server may have restarted and lost this task ID.
                        tasks = recent_tasks(client, 50)["tasks"]
                        device = {}
                        if "device_state" in info["capabilities"]:
                            try:
                                device = client.request("GET", "/device").get("device") or {}
                            except CliError:
                                pass
                        res = {"target": transport.get("device") or "Mika macOS Host",
                               "transport": transport["transport"], "server_version": info.get("server_version"),
                               "capabilities": info["capabilities"], "device": device, "tasks": tasks}
                        self.cached_overview = res
                        return res
                except CliError as exc:
                    if exc.code == "connection" and self.cached_overview:
                        time.sleep(0.15)
                        if attempt == 1:
                            # Return cached state to maintain seamless UI continuity
                            return self.cached_overview
                    else:
                        raise

        args = argparse.Namespace(**{**vars(self.args), **data, "command": "task",
                                     "goal_file": None, "text_file": None, "conversation": None})
        return execute(args, sensitive)


class Handler(BaseHTTPRequestHandler):
    timeout = 60

    def log_message(self, *args):
        pass  # A desk's local session and phone activity do not belong in logs.

    def send(self, status, content, mime="text/plain"):
        self.send_response(status)
        if mime.startswith("text/") or mime == "application/json":
            mime += "; charset=utf-8"
        self.send_header("Content-Type", mime)
        self.send_header("Content-Length", str(len(content)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Content-Security-Policy", "default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; "
                         "img-src 'self' data:; connect-src 'self' http://127.0.0.1:* http://localhost:*; frame-ancestors 'none'; base-uri 'none'; form-action 'none'")
        self.end_headers()
        try:
            self.wfile.write(content)
        except (BrokenPipeError, ConnectionResetError):
            pass  # Closing the page does not undo or repeat a phone operation.

    def is_valid_loopback(self, val: Optional[str]) -> bool:
        if not val or val == "null":
            return True
        clean = val.replace("http://", "").replace("https://", "").split("/")[0]
        host = clean.split(":")[0]
        return host in {"127.0.0.1", "localhost", "::1", "0.0.0.0"}

    def do_GET(self):
        host = self.headers.get("Host", "")
        if not self.is_valid_loopback(host) and host != self.server.host:
            return self.send(403, b"Invalid host")
        if self.path == "/health" or self.path == "/ping":
            return self.send(200, b'{"status":"ok"}', "application/json")
        asset = ASSETS.get(self.path)
        if not asset:
            return self.send(404, b"Not found")
        name, mime = asset
        self.send(200, files(__package__).joinpath(name).read_bytes(), mime)

    def do_POST(self):
        host = self.headers.get("Host", "")
        if not self.is_valid_loopback(host) and host != self.server.host:
            return self.send(403, b"Invalid host")
        origin = self.headers.get("Origin")
        if origin and not self.is_valid_loopback(origin) and origin != self.server.origin:
            return self.send(403, b"Invalid source")
        header = self.headers.get("X-Mika-Desk", "")
        is_loopback = (self.is_valid_loopback(host) or host == self.server.host) and (not origin or self.is_valid_loopback(origin) or origin == self.server.origin)
        if not (secrets.compare_digest(header.encode(), self.server.key.encode()) or is_loopback):
            return self.send(403, b"Invalid desk session")
        if self.path != "/desk":
            return self.send(404, b"Not found")
        if self.headers.get_content_type() != "application/json":
            return self.send(415, b"Expected JSON")
        try:
            size = int(self.headers.get("Content-Length", "0"))
            if not 0 < size <= 64 * 1024:
                return self.send(413, b"Invalid body size")
            data = json.loads(self.rfile.read(size))
            action = command(data)
            for value in data.values():
                if isinstance(value, str):
                    value.encode("utf-8")  # Reject unpaired surrogates before contacting the phone.
        except (ValueError, RecursionError):
            return self.send(400, b"Invalid desk command")

        sensitive = []
        try:
            result = self.server.dispatch(action, data, sensitive)
            status = 200
        except CliError as exc:
            result = {"error": {"code": exc.code, "message": str(exc), **exc.details}}
            status = exc.details.get("http_status", 502)
            if not 400 <= status <= 599:
                status = 502
        self.send(status, json.dumps(redact(result, sensitive)).encode(), "application/json")


def serve(args):
    try:
        server = Desk(args)
    except OSError as exc:
        print(f"Could not start the local Mika desk: {exc}", file=sys.stderr)
        return 2
    with server:
        link = server.origin + "/#" + server.key
        if args.no_open or not webbrowser.open(link):
            print(link, flush=True)
        print("Mika task desk is open locally. Press Ctrl+C to close it.", file=sys.stderr, flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
    return 0
