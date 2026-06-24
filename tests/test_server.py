"""FastAPI server tests via the in-process TestClient (deterministic run).

Covers the auth hardening: per-process token, loopback-origin policy, the
origin-gated token dispenser, sandboxed file reads pinned to approved roots, and
WebSocket rejection before the shell is spawned.
"""

from __future__ import annotations

import time
import warnings
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from starlette.websockets import WebSocketDisconnect

from pyverdex.server import create_app

warnings.filterwarnings("ignore")
REPO = Path(__file__).resolve().parents[1]
SAMPLE = str(REPO / "examples" / "sample_project")


def _auothed():
    """A client whose default headers carry the per-process token."""
    c = TestClient(create_app(default_project=SAMPLE, allowed_hosts=["testserver"]))
    token = c.get("/api/session").json()["token"]
    c.headers.update({"X-Pyverdex-Token": token})
    return c, token


def test_health_is_open():
    c = TestClient(create_app(default_project=SAMPLE, allowed_hosts=["testserver"]))
    assert c.get("/api/health").json() == {"ok": True}


def test_session_issues_token_and_default_needs_it():
    c = TestClient(create_app(default_project=SAMPLE, allowed_hosts=["testserver"]))
    # No token yet → sensitive endpoint refused.
    assert c.get("/api/default").status_code == 403
    token = c.get("/api/session").json()["token"]
    assert token
    ok = c.get("/api/default", headers={"X-Pyverdex-Token": token})
    assert ok.status_code == 200 and ok.json()["path"].endswith("sample_project")


def test_foreign_host_header_rejected():
    # DNS-rebinding defence: a domain rebound to 127.0.0.1 still carries its own
    # Host header, which TrustedHostMiddleware rejects before any route runs.
    c, _ = _auothed()
    assert c.get("/api/health", headers={"host": "rebind.evil"}).status_code == 400
    assert c.get("/api/session", headers={"host": "rebind.evil"}).status_code == 400


def test_pinned_server_does_not_widen_to_discovered_outside_root(tmp_path):
    # With a launch default, opening a project OUTSIDE it must not approve it.
    (tmp_path / "secret.txt").write_text("top secret")
    c, _ = _auothed()
    c.post("/api/discover", json={"path": str(tmp_path)})  # may 200, but must not approve
    leaked = c.get("/api/file", params={"root": str(tmp_path), "path": "secret.txt"})
    assert leaked.status_code == 403


def test_cross_origin_cannot_read_token_or_call_api():
    c, token = _auothed()
    evil = {"origin": "http://evil.example"}
    # The token dispenser refuses a non-loopback origin outright…
    assert c.get("/api/session", headers=evil).status_code == 403
    # …and even *with* a valid token, a foreign origin is rejected.
    assert c.get("/api/file", params={"root": SAMPLE, "path": "src/sample/calc.py"},
                 headers=evil).status_code == 403


def test_discover_endpoint():
    c, _ = _auothed()
    d = c.post("/api/discover", json={"path": SAMPLE}).json()
    assert d["source_root"] == "src" and d["test_root"] == "tests"


def test_file_read_is_sandboxed_to_approved_roots():
    c, _ = _auothed()
    ok = c.get("/api/file", params={"root": SAMPLE, "path": "src/sample/calc.py"})
    assert ok.status_code == 200 and "def classify" in ok.json()["content"]
    # Traversal out of an approved root is blocked…
    escape = c.get("/api/file", params={"root": SAMPLE, "path": "../../../../etc/passwd"})
    assert escape.status_code == 403
    # …and a wholly unapproved root is refused before any read.
    unapproved = c.get("/api/file", params={"root": "/etc", "path": "passwd"})
    assert unapproved.status_code == 403


def test_run_endpoint_produces_report():
    c, _ = _auothed()
    rid = c.post("/api/run", json={"path": SAMPLE, "apply": False}).json()["run_id"]
    snap = {}
    for _ in range(80):
        snap = c.get(f"/api/runs/{rid}").json()
        if snap["status"] != "running":
            break
        time.sleep(0.5)
    assert snap["status"] == "done"
    assert snap["report"]["overall_status"] in {"pass", "fail", "warn"}
    assert any(d["name"] == "line" for d in snap["report"]["dimensions"])


def test_run_rejects_unapproved_path(tmp_path):
    c, _ = _auothed()
    r = c.post("/api/run", json={"path": str(tmp_path), "apply": False})
    assert r.status_code == 403


def test_terminal_requires_token():
    c, _ = _auothed()
    # No ?token= → the handshake is rejected before any shell is forked.
    with pytest.raises(WebSocketDisconnect):
        with c.websocket_connect(f"/ws/terminal?path={SAMPLE}"):
            pass


def test_terminal_websocket_echo_with_token():
    c, token = _auothed()
    with c.websocket_connect(f"/ws/terminal?path={SAMPLE}&token={token}") as ws:
        ws.send_text("echo PYVERDEX_WS_OK\n")
        got = ""
        for _ in range(30):
            try:
                got += ws.receive_bytes().decode(errors="ignore")
            except Exception:
                break
            if "PYVERDEX_WS_OK" in got:
                break
        assert "PYVERDEX_WS_OK" in got
