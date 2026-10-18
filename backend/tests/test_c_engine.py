import unittest
from backend.algorithms.c_engine import is_c_engine_compiled, run_c_engine
from backend.algorithms.engine import allocate_seating, get_engine_diagnostics
from backend.tests.helpers import make_cohort

class TestCEngineIntegration(unittest.TestCase):
    def test_engine_diagnostics(self):
        diag = get_engine_diagnostics()
        self.assertIn("active_engine", diag)
        self.assertIn("algorithm", diag)
        self.assertIn("time_complexity", diag)

    def test_safe_fallback_when_binary_absent(self):
        # Even if C binary is absent, allocate_seating must never crash
        cohort = make_cohort(count_a=4, count_b=4)
        result = allocate_seating(
            rows=3,
            cols=3,
            blocked_seats=[],
            students=cohort,
            preferred_engine="c_engine"
        )
        self.assertIn("status", result)
        self.assertIn("allocated_count", result)
        self.assertGreater(result["allocated_count"], 0)

if __name__ == "__main__":
    unittest.main()
