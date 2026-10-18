export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  department?: string;
  created_at?: string;
}

export interface Student {
  id: string;
  reg_no: string;
  name: string;
  department: string;
  section: string;
  semester: number;
  email?: string;
  phone?: string;
  dob?: string;
  address?: string;
  status?: 'Active' | 'Inactive';
  allocated?: boolean;
}

export interface Examination {
  id: string;
  name: string;
  code: string;
  subject?: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  duration?: string;
  department: string;
  semester: number;
  eligible_count?: number;
  allocated_halls?: string;
  has_arrangement?: boolean;
  reserved_hall_id?: string;
  status: 'scheduled' | 'completed' | 'in_progress' | 'upcoming';
}

export interface Hall {
  id: string;
  name: string;
  building: string;
  location?: string;
  rows: number;
  cols: number;
  capacity: number; // rows * cols
  blocked_seats: string[]; // e.g. ["R1-C5", "R2-C5"]
  allocated_count?: number;
  status?: 'Active' | 'Inactive';
  reserved_for_exam_id?: string;
  reserved_for_exam_name?: string;
  reserved_for_exam_code?: string;
}

export interface SeatAllocation {
  seat_id: string; // e.g. "R1-C1" or "H101-R1-C1"
  row: number;
  col: number;
  student_id: string;
  student_name: string;
  reg_no: string;
  department: string;
  section: string;
  is_conflict?: boolean;
  conflict_reason?: string;
}

export interface SeatingArrangement {
  id: string;
  exam_id: string;
  exam_name: string;
  hall_id: string;
  hall_name: string;
  created_at: string;
  status: 'complete' | 'partial';
  total_seats: number;
  allocated_count: number;
  awaiting_count: number;
  blocked_count: number;
  conflict_count: number;
  completion_pct: number;
  engine_used: 'C Engine (Compiled GCC)' | 'Python Greedy Fallback';
  execution_time_ms: number;
  allocations: Record<string, SeatAllocation>; // key: "R{row}-C{col}"
  unassigned_students: Student[];
  is_saved?: boolean;
  has_unsaved_changes?: boolean;
  saved_at?: string;
}

export interface EngineStatus {
  c_engine_available: boolean;
  compiler_found: boolean;
  active_engine: 'c_engine' | 'python_fallback';
  active_engine_label: string;
  algorithm_name: string;
  time_complexity: string;
  space_complexity: string;
  constraints_enforced: string[];
  last_benchmark_ms?: number;
}

export interface SystemStats {
  total_students: number;
  scheduled_examinations: number;
  examination_halls: number;
  allocated_seats: number;
  seating_conflicts: number;
  saved_arrangements: number;
}
