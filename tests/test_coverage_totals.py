"""Adapter test: whole-codebase coverage totals from a real coverage run.

Exercises ``collect_coverage`` (with ``--branch``) and ``coverage_totals`` against
the sample project, and the graceful-degradation path when there is no data.
"""

from __future__ import annotations

from pyverdex.tools import adapters


def test_coverage_totals_whole_codebase(sample_root):
    src = sample_root / "src"
    test = sample_root / "tests"
    # run the suite under coverage (--branch) to make a .coverage in project_root
    res = adapters.collect_coverage(sample_root, src, test)
    assert res.returncode in (0, 1, 5)  # pass / failures / no-tests all leave data

    totals = adapters.coverage_totals(sample_root, src)
    assert totals.ok and totals.data is not None
    # calc.py: 6 of 8 statements covered; classify's two branches missed
    assert totals.data["line"] == {"covered": 6, "executable": 8, "pct": 75.0}
    branch = totals.data["branch"]
    assert branch["total"] == 4 and branch["covered"] == 2 and branch["pct"] == 50.0


def test_coverage_totals_no_data(tmp_path):
    # no .coverage file and no sources => graceful rc=2, never an exception
    res = adapters.coverage_totals(tmp_path, tmp_path)
    assert not res.ok
    assert res.returncode == 2
