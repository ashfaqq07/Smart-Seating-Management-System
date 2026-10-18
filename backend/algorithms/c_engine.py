"""
C Engine Interface for SmartSeat.
Wraps the compiled native seat_engine binary via subprocess with stdin/stdout streaming.
"""
import os
import sys
import subprocess
import json
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Determine binary name based on operating system
BINARY_NAME = "seat_engine.exe" if sys.platform.startswith("win") else "seat_engine"
DEFAULT_BIN_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "c_engine", BINARY_NAME)

def is_c_engine_compiled(binary_path: str = DEFAULT_BIN_PATH) -> bool:
    return os.path.isfile(binary_path) and os.access(binary_path, os.X_OK or os.R_OK)

def run_c_engine(
    rows: int,
    cols: int,
    blocked_seats: list[str],
    students: list[dict],
    binary_path: str = DEFAULT_BIN_PATH
) -> Optional[dict]:
    """
    Executes the C seat_engine binary with hall parameters and student payload.
    Returns parsed dictionary or None if execution fails.
    """
    if not is_c_engine_compiled(binary_path):
        logger.warning(f"C engine binary not found at {binary_path}. Fallback required.")
        return None

    try:
        # Construct arguments: <rows> <cols> [blocked...]
        args = [binary_path, str(rows), str(cols)] + (blocked_seats or [])

        # Prepare stdin payload:
        # <count>\n
        # <id>,<reg_no>,<name>,<department>,<section>,<semester>\n
        lines = [f"{len(students)}"]
        for s in students:
            line = f"{s.get('id', '')},{s.get('reg_no', '')},{s.get('name', '')},{s.get('department', '')},{s.get('section', 'A')},{s.get('semester', 4)}"
            lines.append(line)
        input_data = "\n".join(lines) + "\n"

        proc = subprocess.run(
            args,
            input=input_data,
            capture_output=True,
            text=True,
            timeout=10,
            check=True
        )

        output = proc.stdout.strip()
        data = json.loads(output)
        
        # Convert allocations list to dictionary keyed by seat_id
        alloc_dict = {}
        for a in data.get("allocations", []):
            alloc_dict[a["seat_id"]] = a

        unassigned_ids = set(data.get("unassigned_ids", []))
        unassigned_students = [s for s in students if s.get("id") in unassigned_ids]

        return {
            "status": data.get("status", "complete"),
            "total_seats": data.get("total_seats", rows * cols),
            "allocated_count": data.get("allocated_count", len(alloc_dict)),
            "awaiting_count": data.get("awaiting_count", len(unassigned_students)),
            "conflict_count": data.get("conflict_count", 0),
            "allocations": alloc_dict,
            "unassigned_students": unassigned_students,
            "engine_used": "C Engine (Compiled GCC)"
        }

    except Exception as e:
        logger.error(f"Error running C engine: {e}")
        return None
