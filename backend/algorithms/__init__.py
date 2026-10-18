"""
SmartSeat Algorithms Package
Provides Graph Conflict Verification, Greedy Allocation, C Subprocess Wrapper, and Fallbacks.
"""
from .engine import allocate_seating, get_engine_diagnostics
from .seat_graph import SeatGraph
from .conflict_checker import ConflictChecker
from .greedy_allocation import GreedyAllocator

__all__ = [
    'allocate_seating',
    'get_engine_diagnostics',
    'SeatGraph',
    'ConflictChecker',
    'GreedyAllocator'
]
