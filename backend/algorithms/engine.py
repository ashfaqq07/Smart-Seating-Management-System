"""
Unified Engine Dispatcher for SmartSeat.
Coordinates allocation execution between compiled C engine and Python greedy fallback.
"""
import time
from .c_engine import run_c_engine, is_c_engine_compiled, DEFAULT_BIN_PATH
from .greedy_allocation import GreedyAllocator

def allocate_seating(
    rows: int,
    cols: int,
    blocked_seats: list[str],
    students: list[dict],
    preferred_engine: str = "c_engine"
) -> dict:
    """
    Executes seating allocation using the preferred engine with safe automatic fallback.
    """
    t0 = time.perf_counter()
    result = None

    if preferred_engine == "c_engine" and is_c_engine_compiled():
        result = run_c_engine(rows, cols, blocked_seats, students)

    # If C engine was not used or failed, run python fallback
    if result is None:
        allocator = GreedyAllocator(rows, cols, blocked_seats)
        result = allocator.allocate(students)

    t1 = time.perf_counter()
    result["execution_time_ms"] = round((t1 - t0) * 1000, 2)
    return result

def get_engine_diagnostics() -> dict:
    compiled = is_c_engine_compiled()
    return {
        "c_engine_available": compiled,
        "binary_path": DEFAULT_BIN_PATH,
        "active_engine": "c_engine" if compiled else "python_fallback",
        "algorithm": "Greedy Bipartite Section Interleaving",
        "time_complexity": "O(N log N + R × C)",
        "space_complexity": "O(R × C + N)"
    }
