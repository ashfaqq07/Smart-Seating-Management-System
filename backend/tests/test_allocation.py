import unittest
from backend.algorithms.greedy_allocation import GreedyAllocator
from backend.tests.helpers import make_cohort

class TestAllocation(unittest.TestCase):
    def test_complete_allocation(self):
        cohort = make_cohort(count_a=6, count_b=6)
        allocator = GreedyAllocator(rows=4, cols=4)
        result = allocator.allocate(cohort)

        self.assertEqual(result["status"], "complete")
        self.assertEqual(result["allocated_count"], 12)
        self.assertEqual(result["awaiting_count"], 0)
        self.assertEqual(result["conflict_count"], 0)

    def test_partial_allocation(self):
        # 20 students, but hall only has 2x3 = 6 seats
        cohort = make_cohort(count_a=10, count_b=10)
        allocator = GreedyAllocator(rows=2, cols=3)
        result = allocator.allocate(cohort)

        self.assertEqual(result["status"], "partial")
        self.assertEqual(result["allocated_count"], 6)
        self.assertEqual(result["awaiting_count"], 14)
        self.assertEqual(len(result["unassigned_students"]), 14)

    def test_blocked_seats_respected(self):
        cohort = make_cohort(count_a=5, count_b=5)
        blocked = ["R1-C1", "R1-C2"]
        allocator = GreedyAllocator(rows=3, cols=4, blocked_seats=blocked)
        result = allocator.allocate(cohort)

        for seat_key in blocked:
            self.assertNotIn(seat_key, result["allocations"])

    def test_section_separation_checkerboard(self):
        cohort = make_cohort(count_a=4, count_b=4)
        allocator = GreedyAllocator(rows=2, cols=4)
        result = allocator.allocate(cohort)

        allocs = result["allocations"]
        # Check that R1-C1 and R1-C2 do not have the same section
        if "R1-C1" in allocs and "R1-C2" in allocs:
            self.assertNotEqual(allocs["R1-C1"]["section"], allocs["R1-C2"]["section"])

if __name__ == "__main__":
    unittest.main()
