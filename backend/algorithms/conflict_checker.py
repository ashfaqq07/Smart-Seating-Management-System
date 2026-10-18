"""
ConflictChecker module for SmartSeat.
Enforces orthogonal section separation and detects illegal adjacent placement.
"""

class ConflictChecker:
    @staticmethod
    def check_conflict(seat_key: str, student_section: str, current_allocations: dict, graph) -> tuple[bool, str]:
        """
        Verifies if placing a student with section `student_section` at `seat_key`
        violates section separation with any already allocated neighbor.
        """
        neighbors = graph.get_neighbors(seat_key)
        for nkey in neighbors:
            if nkey in current_allocations:
                neighbor_student = current_allocations[nkey]
                if neighbor_student.get("section") == student_section:
                    return True, f"Adjacent orthogonal seat {nkey} occupied by same Section ({student_section})"
        return False, ""
