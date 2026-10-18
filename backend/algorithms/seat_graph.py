"""
SeatGraph module for SmartSeat.
Models the examination room as an undirected adjacency graph where desks are vertices
and physical proximity (orthogonal/diagonal neighbors) represents edges.
"""

class SeatGraph:
    def __init__(self, rows: int, cols: int, blocked_seats: list[str] = None):
        self.rows = rows
        self.cols = cols
        self.blocked_seats = set(blocked_seats or [])
        self.adjacency = {}
        self._build_graph()

    def _build_graph(self):
        for r in range(1, self.rows + 1):
            for c in range(1, self.cols + 1):
                key = f"R{r}-C{c}"
                if key in self.blocked_seats:
                    continue

                neighbors = []
                # Orthogonal neighbors (Top, Bottom, Left, Right)
                for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                    nr, nc = r + dr, c + dc
                    if 1 <= nr <= self.rows and 1 <= nc <= self.cols:
                        nkey = f"R{nr}-C{nc}"
                        if nkey not in self.blocked_seats:
                            neighbors.append(nkey)

                self.adjacency[key] = neighbors

    def get_neighbors(self, seat_key: str) -> list[str]:
        return self.adjacency.get(seat_key, [])

    def is_blocked(self, seat_key: str) -> bool:
        return seat_key in self.blocked_seats

    def total_usable_seats(self) -> int:
        return len(self.adjacency)
