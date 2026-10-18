"""
Backtracking allocator module for SmartSeat.
Provides an alternative backtracking search for small examination halls requiring 0 conflicts.
"""
from .seat_graph import SeatGraph
from .conflict_checker import ConflictChecker

class BacktrackingAllocator:
    def __init__(self, rows: int, cols: int, blocked_seats: list[str] = None):
        self.rows = rows
        self.cols = cols
        self.graph = SeatGraph(rows, cols, blocked_seats)

    def allocate(self, students: list[dict], max_depth: int = 100) -> dict:
        # Sort students by section
        sorted_students = sorted(students, key=lambda s: (s.get("section", ""), s.get("reg_no", "")))
        allocations = {}
        usable_seats = [f"R{r}-C{c}" for r in range(1, self.rows + 1) for c in range(1, self.cols + 1) if not self.graph.is_blocked(f"R{r}-C{c}")]

        def backtrack(seat_idx: int, student_idx: int) -> bool:
            if student_idx >= len(sorted_students) or seat_idx >= len(usable_seats):
                return True

            seat_key = usable_seats[seat_idx]
            current_st = sorted_students[student_idx]

            conflict, _ = ConflictChecker.check_conflict(seat_key, current_st.get("section", "A"), allocations, self.graph)
            if not conflict:
                r, c = map(int, seat_key.replace("R", "").split("-C"))
                allocations[seat_key] = {
                    "seat_id": seat_key,
                    "row": r,
                    "col": c,
                    "student_id": current_st.get("id"),
                    "student_name": current_st.get("name"),
                    "reg_no": current_st.get("reg_no"),
                    "department": current_st.get("department"),
                    "section": current_st.get("section"),
                    "is_conflict": False
                }
                if backtrack(seat_idx + 1, student_idx + 1):
                    return True
                del allocations[seat_key]

            # Try skipping this seat
            return backtrack(seat_idx + 1, student_idx)

        backtrack(0, 0)
        unassigned = sorted_students[len(allocations):]

        return {
            "status": "complete" if len(unassigned) == 0 else "partial",
            "total_seats": self.rows * self.cols,
            "allocated_count": len(allocations),
            "awaiting_count": len(unassigned),
            "conflict_count": 0,
            "allocations": allocations,
            "unassigned_students": unassigned,
            "engine_used": "Python Backtracking Search"
        }
