"""Phase B resilience: backend retries, config validation, the weak-test
pre-screen, and integrate isolating a per-candidate backend failure."""

from __future__ import annotations

import pytest
from pydantic import ValidationError

from pyverdex.backends import FakeBackend
from pyverdex.config import Config, GateMode, StageConfig, StageName
from pyverdex.skills.generate import _assertion_weakness
from pyverdex.skills.integrate import build_integrate_graph


# --- B2: LLM retry / backoff ----------------------------------------------

def test_backend_retries_then_succeeds():
    calls = {"n": 0}

    def responder(_p: str) -> str:
        calls["n"] += 1
        if calls["n"] < 3:
            raise RuntimeError("transient")
        return "ok"

    b = FakeBackend(responder)
    b.retry_base_delay = 0.0  # no real sleeping in tests
    assert b.invoke("hi") == "ok"
    assert calls["n"] == 3   # two transient failures, third attempt succeeds
    assert b.calls == 1      # counts one *successful* invoke


def test_backend_raises_clean_after_exhaustion():
    def responder(_p: str) -> str:
        raise RuntimeError("always down")

    b = FakeBackend(responder)
    b.retry_base_delay = 0.0
    with pytest.raises(RuntimeError, match="failed after 3 attempt"):
        b.invoke("hi")
    assert b.calls == 0  # never succeeded


# --- B3: config validation fails fast at load ------------------------------

@pytest.mark.parametrize("bad", [
    {"thresholds": {"line_critical": 150.0}},   # > 100
    {"thresholds": {"mutation_kill_rate": 2.0}},  # > 1.0
    {"model": {"provider": "bogus"}},            # not a known provider
    {"model": {"max_tokens": 0}},                # must be positive
    {"generate": {"mutation_timeout": 0.0}},     # must be > 0
    {"loop": {"max_cycles": 0}},                 # must be >= 1
])
def test_invalid_config_rejected(bad):
    with pytest.raises(ValidationError):
        Config(**bad)


def test_valid_config_accepted():
    c = Config(thresholds={"line_critical": 90.0}, model={"provider": "fake"},
               loop={"max_cycles": 5})
    assert c.thresholds.line_critical == 90.0
    assert c.model.provider == "fake"
    assert c.loop.max_cycles == 5


# --- B4: weak-test pre-screen ----------------------------------------------

def test_assertion_weakness_flags_too_few():
    assert "at least 2" in _assertion_weakness("def test_x():\n    x = 1\n", 2)


def test_assertion_weakness_flags_tautology():
    code = "def test_x():\n    assert True\n    assert 1\n"
    assert "tautology" in _assertion_weakness(code, 2)


def test_assertion_weakness_accepts_real_assertions():
    code = "def test_x():\n    assert f(1) == 2\n    assert g() is None\n"
    assert _assertion_weakness(code, 2) == ""


# --- B1: integrate isolates a per-candidate backend failure ----------------

def test_integrate_survives_backend_error():
    def boom(_p: str) -> str:
        raise RuntimeError("LLM down")

    backend = FakeBackend(boom)
    backend.retry_base_delay = 0.0

    cfg = Config()
    cfg.stages = {n: StageConfig(enabled=True, gate=GateMode.auto) for n in StageName}
    graph = build_integrate_graph(cfg, backend=backend)

    out = graph.invoke({
        "integration_strategies": [
            {"candidates": [{"boundary_fn": "handler", "module": "m.api",
                             "category": "api", "pattern": "vcrpy"}]},
        ],
        "generated": [], "approvals": {}, "log": [], "errors": [],
    })

    # the stage completed (did not raise) and recorded the failure
    assert any("failed" in e for e in out.get("errors", []))
    # the failing candidate produced no proposal
    assert out.get("generated", []) == []
