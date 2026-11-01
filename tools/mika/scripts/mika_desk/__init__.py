"""A loopback-only browser desk for one Mika phone, using the existing CLI transport."""

import argparse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from importlib.resources import files
import json
import os
import re
import secrets
import sys
import threading
import webbrowser

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
    "mcp_market": set(), "mcp_servers": set(), "mcp_install": {"id"},
    "mcp_uninstall": {"id"}, "mcp_toggle": {"id"}, "horizon": {"task_id"}
}


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
        if not args.url and not args.device:
            args.device = os.environ.get("ANDROID_SERIAL")
        self.lock = threading.Lock()
        self.key = secrets.token_urlsafe(32)
        self.host = f"127.0.0.1:{self.server_port}"
        self.origin = "http://" + self.host

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
        if action == "open_file":
            path = data.get("path", "")
            if path and os.path.exists(path):
                import subprocess
                subprocess.run(["open", path])
                return {"opened": True, "path": path}
            return {"opened": False, "error": "file not found"}

        if action == "mcp_market":
            try:
                sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "agent-server"))
                from mika_mcp_engine import mcp_engine
                return {"marketplace": mcp_engine.list_marketplace()}
            except Exception as e:
                return {"error": str(e), "marketplace": []}

        if action == "mcp_servers":
            try:
                sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "agent-server"))
                from mika_mcp_engine import mcp_engine
                return {"servers": mcp_engine.list_installed()}
            except Exception as e:
                return {"error": str(e), "servers": []}

        if action == "mcp_install":
            try:
                sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "agent-server"))
                from mika_mcp_engine import mcp_engine
                return mcp_engine.install_server(data.get("id"), data.get("config"))
            except Exception as e:
                return {"error": str(e)}

        if action == "mcp_uninstall":
            try:
                sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "agent-server"))
                from mika_mcp_engine import mcp_engine
                return mcp_engine.uninstall_server(data.get("id"))
            except Exception as e:
                return {"error": str(e)}

        if action == "mcp_toggle":
            try:
                sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "agent-server"))
                from mika_mcp_engine import mcp_engine
                return mcp_engine.toggle_server(data.get("id"), data.get("enabled", True))
            except Exception as e:
                return {"error": str(e)}

        self.pin_target(data.get("device"))
        if action in {"overview", "select", "watch"}:
            with connection(self.args, sensitive) as (client, transport):
                info = client.discover()
                if action == "watch":
                    # A state change wakes the view early. At the deadline the same
                    # overview also picks up progress text and other remote tasks.
                    try:
                        client.request("POST", f"/tasks/{data['task_id']}/wait", {"timeout_s": WATCH_SECONDS},
                                       timeout=max(client.timeout, WATCH_SECONDS + 5))
                    except CliError as exc:
                        if exc.details.get("http_status") != 404:
                            raise
                        # The phone may have restarted and lost this task ID.
                tasks = recent_tasks(client, 50)["tasks"]
                device = {}
                if "device_state" in info["capabilities"]:
                    try:
                        device = client.request("GET", "/device").get("device") or {}
                    except CliError:
                        # The optional screen/helper status can be unavailable on a
                        # phone that just returned a valid list of tasks.
                        pass
                return {"target": transport.get("device") or self.args.url,
                        "transport": transport["transport"], "server_version": info.get("server_version"),
                        "capabilities": info["capabilities"], "device": device, "tasks": tasks}

        args = argparse.Namespace(**{**vars(self.args), **data, "command": "task",
                                     "goal_file": None, "text_file": None, "conversation": None})
        return execute(args, sensitive)


class Handler(BaseHTTPRequestHandler):
    timeout = 10

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
        if not secrets.compare_digest(header.encode(), self.server.key.encode()):
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
