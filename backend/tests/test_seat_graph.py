import unittest
from backend.algorithms.seat_graph import SeatGraph

class TestSeatGraph(unittest.TestCase):
    def test_dimensions_and_capacity(self):
        graph = SeatGraph(rows=5, cols=6)
        self.assertEqual(graph.total_usable_seats(), 30)

    def test_blocked_seats_exclusion(self):
        blocked = ["R1-C1", "R2-C2"]
        graph = SeatGraph(rows=3, cols=3, blocked_seats=blocked)
        self.assertEqual(graph.total_usable_seats(), 7)
        self.assertTrue(graph.is_blocked("R1-C1"))
        self.assertFalse(graph.is_blocked("R1-C2"))

    def test_orthogonal_neighbors(self):
        graph = SeatGraph(rows=3, cols=3)
        # Center seat (R2-C2) should have 4 orthogonal neighbors
        neighbors = set(graph.get_neighbors("R2-C2"))
        expected = {"R1-C2", "R3-C2", "R2-C1", "R2-C3"}
        self.assertEqual(neighbors, expected)

    def test_corner_neighbors(self):
        graph = SeatGraph(rows=3, cols=3)
        # Corner seat (R1-C1) has 2 orthogonal neighbors
        neighbors = set(graph.get_neighbors("R1-C1"))
        expected = {"R1-C2", "R2-C1"}
        self.assertEqual(neighbors, expected)

if __name__ == "__main__":
    unittest.main()
