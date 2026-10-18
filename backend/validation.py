"""
Validation functions for SmartSeat entities.
"""
from typing import Tuple, Optional

def validate_student_payload(data: dict, is_update: bool = False) -> Tuple[bool, Optional[str]]:
    if not is_update:
        if not data.get("reg_no") or not str(data["reg_no"]).strip():
            return False, "Registration number is required"
        if not data.get("name") or not str(data["name"]).strip():
            return False, "Student name is required"
        if not data.get("department") or not str(data["department"]).strip():
            return False, "Department is required"
        if not data.get("section") or not str(data["section"]).strip():
            return False, "Section is required"

    if "semester" in data:
        try:
            sem = int(data["semester"])
            if sem < 1 or sem > 12:
                return False, "Semester must be between 1 and 12"
        except (ValueError, TypeError):
            return False, "Semester must be a valid integer"

    return True, None

def validate_examination_payload(data: dict, is_update: bool = False) -> Tuple[bool, Optional[str]]:
    if not is_update:
        if not data.get("name") or not str(data["name"]).strip():
            return False, "Examination title is required"
        if not data.get("code") or not str(data["code"]).strip():
            return False, "Course code is required"
        if not data.get("date") or not str(data["date"]).strip():
            return False, "Date is required"
        if not data.get("start_time") or not data.get("end_time"):
            return False, "Start and end times are required"

    if "start_time" in data and "end_time" in data:
        if data["start_time"] >= data["end_time"]:
            return False, "End time must be after start time"

    return True, None

def validate_hall_payload(data: dict, is_update: bool = False) -> Tuple[bool, Optional[str]]:
    if not is_update:
        if not data.get("name") or not str(data["name"]).strip():
            return False, "Hall name is required"

    for dim in ("rows", "cols"):
        if dim in data:
            try:
                val = int(data[dim])
                if val < 1 or val > 50:
                    return False, f"{dim.capitalize()} must be between 1 and 50"
            except (ValueError, TypeError):
                return False, f"{dim.capitalize()} must be an integer"

    return True, None
