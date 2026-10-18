"""
StudentIndex module for SmartSeat.
Provides deterministic sorting and bucketed queue partitioning by Department and Section.
"""

class StudentIndex:
    @staticmethod
    def partition_by_section(students: list[dict]) -> dict[str, list[dict]]:
        """
        Groups students into section queues and sorts each queue by registration number.
        """
        sections: dict[str, list[dict]] = {}
        for s in students:
            sec = str(s.get("section", "A")).upper()
            if sec not in sections:
                sections[sec] = []
            sections[sec].append(s)

        # Sort each section deterministically by registration number
        for sec in sections:
            sections[sec].sort(key=lambda x: str(x.get("reg_no", "")))

        return sections
