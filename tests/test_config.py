from __future__ import annotations

from pathlib import Path

from pyverdex.config import Config, GateMode, StageName


def test_defaults():
    c = Config()
    assert c.thresholds.line_critical == 95.0
    assert c.thresholds.line_standard == 85.0
    assert c.thresholds.line_cold == 70.0
    assert c.thresholds.mutation_kill_rate == 1.0
    assert c.loop.max_cycles == 3


def test_line_target_by_tier():
    t = Config().thresholds
    assert t.line_target("critical") == 95.0
    assert t.line_target("standard") == 85.0
    assert t.line_target("cold") == 70.0
    assert t.line_target("unknown") == 85.0  # falls back to standard


def test_tier_for_classifies():
    t = Config().thresholds
    # boundary always wins
    assert t.tier_for(is_boundary=True, module="pkg.api") == "critical"
    # no cold_paths configured => everything non-boundary is standard
    assert t.tier_for(is_boundary=False, module="pkg._internal.util") == "standard"


def test_cold_tier_reachable_when_configured():
    t = Config(thresholds={"cold_paths": ["_internal", "experimental"]}).thresholds
    assert t.tier_for(is_boundary=False, module="pkg._internal.util") == "cold"
    assert t.line_target(t.tier_for(is_boundary=False, module="pkg._internal.util")) == 70.0
    # a configured cold path does not override boundary criticality
    assert t.tier_for(is_boundary=True, module="pkg._internal.util") == "critical"
    # unrelated modules stay standard
    assert t.tier_for(is_boundary=False, module="pkg.core") == "standard"


def test_gate_toggle_helpers():
    c = Config()
    # defaults: generate is gated, audit is auto
    assert c.is_gated(StageName.generate) is True
    assert c.is_gated(StageName.audit) is False
    assert c.is_enabled(StageName.report) is True


def test_from_yaml(tmp_path: Path):
    p = tmp_path / "c.yaml"
    p.write_text(
        "thresholds:\n  line_standard: 90.0\n"
        "stages:\n  generate:\n    enabled: false\n    gate: auto\n",
        encoding="utf-8",
    )
    c = Config.from_yaml(p)
    assert c.thresholds.line_standard == 90.0
    assert c.is_enabled(StageName.generate) is False
    assert c.stage(StageName.generate).gate is GateMode.auto
