"""
GreedyAllocator module for SmartSeat.
Implements the Python greedy fallback algorithm mirroring the C engine logic.
"""
from .seat_graph import SeatGraph
from .conflict_checker import ConflictChecker
from .student_index import StudentIndex

class GreedyAllocator:
    def __init__(self, rows: int, cols: int, blocked_seats: list[str] = None):
        self.rows = rows
        self.cols = cols
        self.graph = SeatGraph(rows, cols, blocked_seats)

    def allocate(self, students: list[dict]) -> dict:
        section_queues = StudentIndex.partition_by_section(students)
        sections = sorted(section_queues.keys())

        allocations = {}
        allocated_count = 0
        conflict_count = 0

        # Traverse the hall grid row by row, column by column
        for r in range(1, self.rows + 1):
            for c in range(1, self.cols + 1):
                seat_key = f"R{r}-C{c}"
                if self.graph.is_blocked(seat_key):
                    continue

                # Find candidate section with remaining students that does not conflict
                chosen_sec = None
                for sec in sections:
                    if section_queues[sec]:
                        has_conflict, _ = ConflictChecker.check_conflict(seat_key, sec, allocations, self.graph)
                        if not has_conflict:
                            chosen_sec = sec
                            break

                is_conflict = false_conflict = False
                conflict_reason = None

                # Fallback: if no non-conflicting section is available but students remain
                if not chosen_sec:
                    for sec in sections:
                        if section_queues[sec]:
                            chosen_sec = sec
                            is_conflict = True
                            conflict_count += 1
                            conflict_reason = f"Adjacent section match for Section {sec}"
                            break

                if chosen_sec:
                    student = section_queues[chosen_sec].pop(0)
                    allocations[seat_key] = {
                        "seat_id": seat_key,
                        "row": r,
                        "col": c,
                        "student_id": student.get("id"),
                        "student_name": student.get("name"),
                        "reg_no": student.get("reg_no"),
                        "department": student.get("department"),
                        "section": student.get("section"),
                        "is_conflict": is_conflict,
                        "conflict_reason": conflict_reason
                    }
                    allocated_count += 1

        # Collect unassigned students
        unassigned = []
        for sec in sections:
            unassigned.extend(section_queues[sec])

        status = "complete" if len(unassigned) == 0 else "partial"

        return {
            "status": status,
            "total_seats": self.rows * self.cols,
            "allocated_count": allocated_count,
            "awaiting_count": len(unassigned),
            "conflict_count": conflict_count,
            "allocations": allocations,
            "unassigned_students": unassigned,
            "engine_used": "Python Greedy Fallback"
        }
