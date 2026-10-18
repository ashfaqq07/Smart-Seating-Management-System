"""
CSV import and export utilities for SmartSeat students and seating rosters.
"""
import csv
import io
from typing import List, Dict, Any, Tuple

def parse_students_csv(csv_content: str) -> Tuple[List[Dict[str, Any]], List[str]]:
    students = []
    errors = []
    reader = csv.reader(io.StringIO(csv_content.strip()))
    
    header = None
    for row_idx, row in enumerate(reader, 1):
        if not row or not any(row):
            continue

        if header is None:
            # Check if this row is a header
            first_col = row[0].strip().lower()
            if any(k in first_col for k in ("reg", "roll", "id", "student")):
                header = [c.strip().lower() for c in row]
                continue
            else:
                header = ["reg_no", "name", "department", "section", "semester"]

        # Parse row
        try:
            reg_no = row[0].strip().upper()
            name = row[1].strip() if len(row) > 1 else ""
            dept = row[2].strip() if len(row) > 2 else "Computer Science"
            sec = row[3].strip().upper() if len(row) > 3 else "A"
            sem = int(row[4].strip()) if len(row) > 4 and row[4].strip().isdigit() else 4

            if not reg_no or not name:
                errors.append(f"Row {row_idx}: Missing required registration number or name.")
                continue

            students.append({
                "reg_no": reg_no,
                "name": name,
                "department": dept,
                "section": sec,
                "semester": sem
            })
        except Exception as e:
            errors.append(f"Row {row_idx}: {str(e)}")

    return students, errors
