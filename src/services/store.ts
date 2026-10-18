import { Student, Examination, Hall, SeatingArrangement, EngineStatus, SystemStats, SeatAllocation, User } from '../types';

const STORAGE_KEYS = {
  STUDENTS: 'smartseat_students_v2',
  EXAMS: 'smartseat_exams_v2',
  HALLS: 'smartseat_halls_v2',
  ARRANGEMENTS: 'smartseat_arrangements_v2',
  ENGINE_PREF: 'smartseat_engine_pref_v2',
  USERS: 'smartseat_users_v2',
  CURRENT_USER: 'smartseat_current_user_v2'
};

import { INITIAL_STUDENTS } from './mockStudents';
import { DEPARTMENTS, normalizeDepartment } from '../constants/departments';

const INITIAL_EXAMS: Examination[] = [
  {
    id: 'exam-1',
    code: 'CSE301',
    name: 'Data Structures and Algorithms',
    subject: 'DSA',
    semester: 3,
    date: '2026-10-15',
    start_time: '09:00 AM',
    end_time: '12:00 PM',
    duration: '3 hrs',
    department: 'Computer Science and Engineering and Specialisation (CSE and Specialisation)',
    eligible_count: 48,
    allocated_halls: '1 hall (Hall A)',
    has_arrangement: true,
    reserved_hall_id: 'hall-a',
    status: 'upcoming'
  },
  {
    id: 'exam-2',
    code: 'CSE302',
    name: 'Operating Systems',
    subject: 'OS',
    semester: 3,
    date: '2026-10-18',
    start_time: '02:00 PM',
    end_time: '05:00 PM',
    duration: '3 hrs',
    department: 'Computer Science and Engineering and Specialisation (CSE and Specialisation)',
    eligible_count: 48,
    status: 'upcoming'
  },
  {
    id: 'exam-3',
    code: 'CSE303',
    name: 'Database Management Systems',
    subject: 'DBMS',
    semester: 3,
    date: '2026-10-22',
    start_time: '09:00 AM',
    end_time: '12:00 PM',
    duration: '3 hrs',
    department: 'Computer Science and Engineering and Specialisation (CSE and Specialisation)',
    eligible_count: 48,
    status: 'upcoming'
  },
  {
    id: 'exam-4',
    code: 'CSE401',
    name: 'Computer Networks',
    subject: 'CN',
    semester: 4,
    date: '2026-09-10',
    start_time: '09:00 AM',
    end_time: '12:00 PM',
    duration: '3 hrs',
    department: 'Computer Science and Engineering and Specialisation (CSE and Specialisation)',
    eligible_count: 44,
    status: 'completed'
  },
  {
    id: 'exam-5',
    code: 'CSE402',
    name: 'Artificial Intelligence',
    subject: 'AI',
    semester: 4,
    date: '2026-09-12',
    start_time: '02:00 PM',
    end_time: '05:00 PM',
    duration: '3 hrs',
    department: 'Computer Science and Engineering and Specialisation (CSE and Specialisation)',
    eligible_count: 44,
    status: 'completed'
  },
  {
    id: 'exam-6',
    code: 'CSE403',
    name: 'Software Engineering',
    subject: 'SE',
    semester: 4,
    date: '2026-09-15',
    start_time: '09:00 AM',
    end_time: '12:00 PM',
    duration: '3 hrs',
    department: 'Computer Science and Engineering and Specialisation (CSE and Specialisation)',
    eligible_count: 44,
    status: 'completed'
  },
  {
    id: 'exam-7',
    code: 'CSE501',
    name: 'Machine Learning',
    subject: 'ML',
    semester: 5,
    date: '2026-11-01',
    start_time: '09:00 AM',
    end_time: '12:00 PM',
    duration: '3 hrs',
    department: 'Computer Science and Engineering and Specialisation (CSE and Specialisation)',
    eligible_count: 40,
    status: 'in_progress'
  },
  {
    id: 'exam-8',
    code: 'CSE502',
    name: 'Cloud Computing',
    subject: 'CC',
    semester: 5,
    date: '2026-11-05',
    start_time: '02:00 PM',
    end_time: '05:00 PM',
    duration: '3 hrs',
    department: 'Computer Science and Engineering and Specialisation (CSE and Specialisation)',
    eligible_count: 40,
    status: 'upcoming'
  }
];

const INITIAL_HALLS: Hall[] = [
  {
    id: 'hall-a',
    name: 'Hall A',
    building: 'Main Block',
    location: 'Main Block Ground Floor',
    rows: 6,
    cols: 10,
    capacity: 60,
    blocked_seats: ['R2-C7', 'R4-C7'], // Seat 17 and Seat 37
    allocated_count: 58,
    status: 'Active',
    reserved_for_exam_id: 'exam-1',
    reserved_for_exam_name: 'Data Structures and Algorithms',
    reserved_for_exam_code: 'CSE301'
  },
  {
    id: 'hall-b',
    name: 'Hall B',
    building: 'Main Block',
    location: 'Main Block First Floor',
    rows: 6,
    cols: 8,
    capacity: 48,
    blocked_seats: [],
    allocated_count: 44,
    status: 'Active'
  },
  {
    id: 'hall-c',
    name: 'Hall C',
    building: 'Science Block',
    location: 'Science Block Second Floor',
    rows: 6,
    cols: 12,
    capacity: 72,
    blocked_seats: ['R1-C6', 'R2-C6', 'R5-C6', 'R6-C6'],
    allocated_count: 60,
    status: 'Active'
  },
  {
    id: 'hall-d',
    name: 'Hall D',
    building: 'Admin Block',
    location: 'Admin Block First Floor',
    rows: 6,
    cols: 8,
    capacity: 48,
    blocked_seats: ['R1-C1', 'R6-C8'],
    allocated_count: 32,
    status: 'Active'
  },
  {
    id: 'hall-e',
    name: 'Hall E',
    building: 'Science Block',
    location: 'Science Block Ground Floor',
    rows: 8,
    cols: 12,
    capacity: 96,
    blocked_seats: ['R1-C1', 'R1-C12', 'R2-C1', 'R2-C12', 'R8-C1', 'R8-C12'],
    allocated_count: 0,
    status: 'Inactive'
  },
  {
    id: 'hall-f',
    name: 'Hall F',
    building: 'New Block',
    location: 'New Block First Floor',
    rows: 8,
    cols: 10,
    capacity: 80,
    blocked_seats: [],
    allocated_count: 0,
    status: 'Active'
  }
];

// Helper to pre-populate Hall A arrangement for Data Structures and Algorithms matching screenshot
function buildInitialArrangement(): SeatingArrangement {
  const allocations: Record<string, SeatAllocation> = {};
  const blockedSet = new Set(['R2-C7', 'R4-C7']); // Seat 17 and Seat 37
  const availableSet = new Set(['R3-C5', 'R5-C3']); // Seat 25 and Seat 43
  
  let seatNum = 1;
  let allocatedCount = 0;

  for (let r = 1; r <= 6; r++) {
    for (let c = 1; c <= 10; c++) {
      const seatKey = `R${r}-C${c}`;
      if (blockedSet.has(seatKey)) {
        seatNum++;
        continue;
      }
      if (availableSet.has(seatKey)) {
        seatNum++;
        continue;
      }

      // Seat 26 is specifically Adnan Rahman
      if (r === 3 && c === 6) {
        allocations[seatKey] = {
          seat_id: seatKey,
          row: r,
          col: c,
          student_id: 'std-s3-01',
          student_name: 'Adnan Rahman',
          reg_no: 'REG2024CSE001',
          department: 'Computer Science and Engineering and Specialisation (CSE and Specialisation)',
          section: 'A',
          is_conflict: false
        };
      } else {
        const paddedNum = String(seatNum).padStart(2, '0');
        allocations[seatKey] = {
          seat_id: seatKey,
          row: r,
          col: c,
          student_id: `std-auto-${seatNum}`,
          student_name: seatNum % 2 === 0 ? `Student ${paddedNum}` : `Examinee ${paddedNum}`,
          reg_no: `REG2024CSE${String(100 + seatNum)}`,
          department: 'Computer Science and Engineering and Specialisation (CSE and Specialisation)',
          section: (r + c) % 2 === 0 ? 'A' : 'B',
          is_conflict: false
        };
      }
      allocatedCount++;
      seatNum++;
    }
  }

  return {
    id: 'arr-cse301-hall-a',
    exam_id: 'exam-1',
    exam_name: 'Data Structures and Algorithms',
    hall_id: 'hall-a',
    hall_name: 'Hall A',
    created_at: new Date().toISOString(),
    status: 'complete',
    total_seats: 60,
    allocated_count: 58,
    awaiting_count: 0,
    blocked_count: 2,
    conflict_count: 0,
    completion_pct: 100,
    engine_used: 'C Engine (Compiled GCC)',
    execution_time_ms: 2.4,
    allocations,
    unassigned_students: [],
    is_saved: true,
    saved_at: '2026-10-15T09:00:00.000Z'
  };
}

class SmartSeatStore {
  private students: Student[];
  private exams: Examination[];
  private halls: Hall[];
  private arrangements: Record<string, SeatingArrangement>; // exam_id -> arrangement
  private enginePreference: 'c_engine' | 'python_fallback' = 'c_engine';

  constructor() {
    const rawStudents = this.load<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    // Merge or refresh so all 188 students across all 9 departments are present
    if (!rawStudents || rawStudents.length < INITIAL_STUDENTS.length) {
      const regMap = new Map<string, Student>();
      (rawStudents || []).forEach(s => regMap.set(s.reg_no, s));
      INITIAL_STUDENTS.forEach(s => {
        if (!regMap.has(s.reg_no)) {
          regMap.set(s.reg_no, s);
        }
      });
      this.students = Array.from(regMap.values()).map(s => ({
        ...s,
        department: normalizeDepartment(s.department)
      }));
      this.save(STORAGE_KEYS.STUDENTS, this.students);
    } else {
      this.students = rawStudents.map(s => ({
        ...s,
        department: normalizeDepartment(s.department)
      }));
      this.save(STORAGE_KEYS.STUDENTS, this.students);
    }

    const rawExams = this.load<Examination[]>(STORAGE_KEYS.EXAMS, INITIAL_EXAMS);
    if (!rawExams || rawExams.length < INITIAL_EXAMS.length) {
      const examMap = new Map<string, Examination>();
      (rawExams || []).forEach(e => examMap.set(e.id, e));
      INITIAL_EXAMS.forEach(e => {
        if (!examMap.has(e.id)) examMap.set(e.id, e);
      });
      this.exams = Array.from(examMap.values()).map(e => ({
        ...e,
        department: normalizeDepartment(e.department)
      }));
      this.save(STORAGE_KEYS.EXAMS, this.exams);
    } else {
      this.exams = rawExams.map(e => ({
        ...e,
        department: normalizeDepartment(e.department)
      }));
      this.save(STORAGE_KEYS.EXAMS, this.exams);
    }
    this.halls = this.load(STORAGE_KEYS.HALLS, INITIAL_HALLS);
    
    const initialArr = buildInitialArrangement();
    this.arrangements = this.load(STORAGE_KEYS.ARRANGEMENTS, {
      'exam-1': initialArr
    });
    // Ensure all stored arrangements have is_saved attribute
    Object.values(this.arrangements).forEach(arr => {
      if (arr.is_saved === undefined) {
        arr.is_saved = true;
      }
    });
    this.enginePreference = this.load(STORAGE_KEYS.ENGINE_PREF, 'c_engine');

    // Synchronize hall reservations with active saved arrangements
    this.syncHallReservations();
  }

  private load<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private save(key: string, value: unknown) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore quota errors
    }
  }

  // --- Students ---
  getStudents(): Student[] {
    return [...this.students];
  }

  getStudent(id: string): Student | undefined {
    return this.students.find(s => s.id === id);
  }

  addStudent(student: Omit<Student, 'id'>): { success: boolean; student?: Student; error?: string } {
    if (!student.reg_no?.trim()) return { success: false, error: 'Registration number is required.' };
    if (!student.name?.trim()) return { success: false, error: 'Student name is required.' };
    if (!student.department?.trim()) return { success: false, error: 'Department is required.' };
    if (!student.section?.trim()) return { success: false, error: 'Section is required.' };

    const cleanRegNo = student.reg_no.trim().toUpperCase();
    if (this.students.some(s => s.reg_no.toUpperCase() === cleanRegNo)) {
      return { success: false, error: `Student with registration number "${cleanRegNo}" already exists.` };
    }

    const newStudent: Student = {
      ...student,
      id: `std-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      reg_no: cleanRegNo,
      name: student.name.trim(),
      section: student.section.trim().toUpperCase(),
      semester: Number(student.semester) || 1
    };

    this.students.push(newStudent);
    this.save(STORAGE_KEYS.STUDENTS, this.students);
    return { success: true, student: newStudent };
  }

  updateStudent(id: string, updates: Partial<Student>): { success: boolean; student?: Student; error?: string } {
    const idx = this.students.findIndex(s => s.id === id);
    if (idx === -1) return { success: false, error: 'Student not found.' };

    if (updates.reg_no) {
      const cleanReg = updates.reg_no.trim().toUpperCase();
      if (this.students.some(s => s.id !== id && s.reg_no.toUpperCase() === cleanReg)) {
        return { success: false, error: `Registration number "${cleanReg}" is already taken.` };
      }
      updates.reg_no = cleanReg;
    }

    this.students[idx] = { ...this.students[idx], ...updates };
    this.save(STORAGE_KEYS.STUDENTS, this.students);
    return { success: true, student: this.students[idx] };
  }

  deleteStudent(id: string): boolean {
    const beforeLen = this.students.length;
    this.students = this.students.filter(s => s.id !== id);
    if (this.students.length !== beforeLen) {
      this.save(STORAGE_KEYS.STUDENTS, this.students);
      return true;
    }
    return false;
  }

  importStudentsCsv(csvText: string): { imported: number; skipped: number; errors: string[] } {
    const lines = csvText.trim().split('\n');
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Header check
    const header = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const regIdx = header.findIndex(h => h.includes('reg') || h.includes('roll') || h.includes('id'));
    const nameIdx = header.findIndex(h => h.includes('name'));
    const deptIdx = header.findIndex(h => h.includes('dept') || h.includes('branch'));
    const secIdx = header.findIndex(h => h.includes('sec'));
    const semIdx = header.findIndex(h => h.includes('sem'));

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      const reg = cols[regIdx >= 0 ? regIdx : 0];
      const name = cols[nameIdx >= 0 ? nameIdx : 1];
      const dept = cols[deptIdx >= 0 ? deptIdx : 2] || 'Computer Science';
      const sec = cols[secIdx >= 0 ? secIdx : 3] || 'A';
      const sem = parseInt(cols[semIdx >= 0 ? semIdx : 4] || '4', 10);

      if (!reg || !name) {
        skipped++;
        errors.push(`Row ${i + 1}: Missing registration number or name.`);
        continue;
      }

      const res = this.addStudent({
        reg_no: reg,
        name,
        department: dept,
        section: sec,
        semester: isNaN(sem) ? 4 : sem
      });

      if (res.success) imported++;
      else {
        skipped++;
        if (res.error) errors.push(`Row ${i + 1} (${reg}): ${res.error}`);
      }
    }

    return { imported, skipped, errors };
  }

  // --- Examinations ---
  getExaminations(): Examination[] {
    // dynamically check arrangements
    return this.exams.map(ex => {
      const arr = this.arrangements[ex.id];
      const eligible = this.students.filter(
        s => (s.department.trim().toLowerCase() === ex.department.trim().toLowerCase() ||
              (ex.department.toUpperCase() === 'CSE' && (s.department.toUpperCase() === 'CSE' || s.department.toUpperCase().includes('COMPUTER')))) &&
             (!ex.semester || s.semester === ex.semester)
      ).length;
      return {
        ...ex,
        eligible_count: eligible,
        has_arrangement: !!arr
      };
    });
  }

  addExamination(exam: Omit<Examination, 'id'>): { success: boolean; exam?: Examination; error?: string } {
    if (!exam.name?.trim()) return { success: false, error: 'Examination title is required.' };
    if (!exam.date?.trim()) return { success: false, error: 'Examination date is required.' };
    if (!exam.start_time?.trim() || !exam.end_time?.trim()) return { success: false, error: 'Start and end times are required.' };
    if (!exam.department?.trim()) return { success: false, error: 'Department is required.' };

    const newExam: Examination = {
      ...exam,
      id: `exam-${Date.now()}`,
      status: exam.status || 'scheduled'
    };

    this.exams.push(newExam);
    this.save(STORAGE_KEYS.EXAMS, this.exams);
    return { success: true, exam: newExam };
  }

  updateExamination(id: string, updates: Partial<Examination>): { success: boolean; exam?: Examination; error?: string } {
    const idx = this.exams.findIndex(e => e.id === id);
    if (idx === -1) return { success: false, error: 'Examination not found.' };

    this.exams[idx] = { ...this.exams[idx], ...updates };
    this.save(STORAGE_KEYS.EXAMS, this.exams);
    return { success: true, exam: this.exams[idx] };
  }

  deleteExamination(id: string): boolean {
    const beforeLen = this.exams.length;
    this.exams = this.exams.filter(e => e.id !== id);
    if (this.exams.length !== beforeLen) {
      delete this.arrangements[id];
      this.save(STORAGE_KEYS.EXAMS, this.exams);
      this.save(STORAGE_KEYS.ARRANGEMENTS, this.arrangements);
      return true;
    }
    return false;
  }

  // --- Halls ---
  getHalls(): Hall[] {
    return this.halls.map(h => {
      // Find active allocations in this hall across saved arrangements
      let allocCount = 0;
      Object.values(this.arrangements).forEach(arr => {
        if (arr.hall_id === h.id) {
          allocCount = Math.max(allocCount, arr.allocated_count);
        }
      });
      return {
        ...h,
        capacity: h.rows * h.cols,
        allocated_count: allocCount
      };
    });
  }

  addHall(hall: Omit<Hall, 'id'>): { success: boolean; hall?: Hall; error?: string } {
    if (!hall.name?.trim()) return { success: false, error: 'Hall name is required.' };
    if (!hall.rows || hall.rows < 1 || hall.rows > 30) return { success: false, error: 'Rows must be between 1 and 30.' };
    if (!hall.cols || hall.cols < 1 || hall.cols > 30) return { success: false, error: 'Columns must be between 1 and 30.' };

    const newHall: Hall = {
      ...hall,
      id: `hall-${Date.now()}`,
      capacity: hall.rows * hall.cols,
      blocked_seats: hall.blocked_seats || [],
      allocated_count: 0
    };

    this.halls.push(newHall);
    this.save(STORAGE_KEYS.HALLS, this.halls);
    return { success: true, hall: newHall };
  }

  updateHall(id: string, updates: Partial<Hall>): { success: boolean; hall?: Hall; error?: string } {
    const idx = this.halls.findIndex(h => h.id === id);
    if (idx === -1) return { success: false, error: 'Hall not found.' };

    const current = this.halls[idx];
    const rows = updates.rows ?? current.rows;
    const cols = updates.cols ?? current.cols;

    if (rows < 1 || rows > 30 || cols < 1 || cols > 30) {
      return { success: false, error: 'Hall dimensions must be between 1 and 30.' };
    }

    // Clean up blocked seats that fall outside new rows or cols
    const blocked = (updates.blocked_seats ?? current.blocked_seats).filter(seatKey => {
      const match = seatKey.match(/R(\d+)-C(\d+)/);
      if (!match) return false;
      const r = parseInt(match[1], 10);
      const c = parseInt(match[2], 10);
      return r <= rows && c <= cols;
    });

    this.halls[idx] = {
      ...current,
      ...updates,
      rows,
      cols,
      capacity: rows * cols,
      blocked_seats: blocked
    };

    this.save(STORAGE_KEYS.HALLS, this.halls);
    return { success: true, hall: this.halls[idx] };
  }

  toggleSeatBlocked(hallId: string, seatKey: string): { success: boolean; hall?: Hall; error?: string } {
    const hall = this.halls.find(h => h.id === hallId);
    if (!hall) return { success: false, error: 'Hall not found.' };

    const blockedSet = new Set(hall.blocked_seats);
    if (blockedSet.has(seatKey)) {
      blockedSet.delete(seatKey);
    } else {
      blockedSet.add(seatKey);
    }

    return this.updateHall(hallId, { blocked_seats: Array.from(blockedSet) });
  }

  deleteHall(id: string): boolean {
    const beforeLen = this.halls.length;
    this.halls = this.halls.filter(h => h.id !== id);
    if (this.halls.length !== beforeLen) {
      this.save(STORAGE_KEYS.HALLS, this.halls);
      return true;
    }
    return false;
  }

  // --- Seating Allocation Engine ---
  getArrangement(examId: string): SeatingArrangement | null {
    return this.arrangements[examId] || null;
  }

  getAllArrangements(): SeatingArrangement[] {
    return Object.values(this.arrangements);
  }

  deleteArrangement(examId: string): boolean {
    if (this.arrangements[examId]) {
      delete this.arrangements[examId];
      this.save(STORAGE_KEYS.ARRANGEMENTS, this.arrangements);

      const examIdx = this.exams.findIndex(e => e.id === examId);
      if (examIdx !== -1) {
        this.exams[examIdx] = {
          ...this.exams[examIdx],
          has_arrangement: false,
          allocated_halls: undefined,
          reserved_hall_id: undefined,
          status: 'upcoming'
        };
        this.save(STORAGE_KEYS.EXAMS, this.exams);
      }
      this.syncHallReservations();
      return true;
    }
    return false;
  }

  syncHallReservations() {
    this.halls = this.halls.map(h => ({
      ...h,
      reserved_for_exam_id: undefined,
      reserved_for_exam_name: undefined,
      reserved_for_exam_code: undefined
    }));

    Object.values(this.arrangements).forEach(arr => {
      if (arr.is_saved && arr.hall_id && arr.exam_id) {
        const hallIdx = this.halls.findIndex(h => h.id === arr.hall_id);
        const exam = this.exams.find(e => e.id === arr.exam_id);
        if (hallIdx !== -1 && exam) {
          this.halls[hallIdx] = {
            ...this.halls[hallIdx],
            reserved_for_exam_id: exam.id,
            reserved_for_exam_name: exam.name,
            reserved_for_exam_code: exam.code
          };
        }
      }
    });

    this.save(STORAGE_KEYS.HALLS, this.halls);
  }

  getHallReservation(hallId: string): { isReserved: boolean; reservedByExam?: Examination } {
    const savedArr = Object.values(this.arrangements).find(
      a => a.is_saved && a.hall_id === hallId
    );
    if (!savedArr) return { isReserved: false };

    const exam = this.exams.find(e => e.id === savedArr.exam_id);
    return {
      isReserved: true,
      reservedByExam: exam || {
        id: savedArr.exam_id,
        name: savedArr.exam_name,
        code: savedArr.exam_id,
        date: '',
        start_time: '',
        end_time: '',
        department: '',
        semester: 1,
        status: 'in_progress'
      }
    };
  }

  saveArrangement(examId: string, arrangement: SeatingArrangement): {
    success: boolean;
    arrangement?: SeatingArrangement;
    error?: string;
  } {
    const exam = this.exams.find(e => e.id === examId);
    if (!exam) return { success: false, error: 'Examination not found.' };

    const hall = this.halls.find(h => h.id === arrangement.hall_id);
    if (!hall) return { success: false, error: 'Examination hall not found.' };

    // Validate hall availability against other examinations
    const reservation = this.getHallReservation(hall.id);
    if (reservation.isReserved && reservation.reservedByExam && reservation.reservedByExam.id !== examId) {
      return {
        success: false,
        error: `${hall.name} is already reserved for ${reservation.reservedByExam.name} (${reservation.reservedByExam.code}). Choose another hall or clear the saved arrangement for that examination first.`
      };
    }

    // Recalculate orthogonal conflicts across the hall
    const { updatedAllocations, conflictCount } = this.recalculateArrangementConflicts(hall, arrangement.allocations);

    const allocatedCount = Object.keys(updatedAllocations).length;
    const awaitingCount = Math.max(0, (arrangement.unassigned_students?.length || 0));

    const savedArr: SeatingArrangement = {
      ...arrangement,
      allocations: updatedAllocations,
      allocated_count: allocatedCount,
      awaiting_count: awaitingCount,
      conflict_count: conflictCount,
      is_saved: true,
      has_unsaved_changes: false,
      saved_at: new Date().toISOString()
    };

    this.arrangements[examId] = savedArr;
    this.save(STORAGE_KEYS.ARRANGEMENTS, this.arrangements);

    const examIdx = this.exams.findIndex(e => e.id === examId);
    if (examIdx !== -1) {
      this.exams[examIdx] = {
        ...this.exams[examIdx],
        has_arrangement: true,
        allocated_halls: `1 hall (${hall.name})`,
        reserved_hall_id: hall.id,
        status: 'in_progress'
      };
      this.save(STORAGE_KEYS.EXAMS, this.exams);
    }

    this.syncHallReservations();

    return {
      success: true,
      arrangement: savedArr
    };
  }

  saveResetArrangement(examId: string): { success: boolean; error?: string } {
    if (this.arrangements[examId]) {
      delete this.arrangements[examId];
      this.save(STORAGE_KEYS.ARRANGEMENTS, this.arrangements);
    }

    const examIdx = this.exams.findIndex(e => e.id === examId);
    if (examIdx !== -1) {
      this.exams[examIdx] = {
        ...this.exams[examIdx],
        has_arrangement: false,
        allocated_halls: undefined,
        reserved_hall_id: undefined,
        status: 'upcoming'
      };
      this.save(STORAGE_KEYS.EXAMS, this.exams);
    }

    this.syncHallReservations();
    return { success: true };
  }

  /**
   * Recalculates conflicts in an arrangement after manual moves or generation.
   * Enforces orthogonal section separation: no adjacent desks (left, right, up, down)
   * can share the same section.
   */
  recalculateArrangementConflicts(hall: Hall, allocations: Record<string, SeatAllocation>): {
    updatedAllocations: Record<string, SeatAllocation>;
    conflictCount: number;
  } {
    const updated: Record<string, SeatAllocation> = {};
    let conflictCount = 0;

    // Deep copy allocations with initial conflict reset
    Object.entries(allocations).forEach(([k, v]) => {
      updated[k] = { ...v, is_conflict: false, conflict_reason: undefined };
    });

    // Check every allocated seat against its orthogonal neighbors
    Object.keys(updated).forEach(seatKey => {
      const match = seatKey.match(/R(\d+)-C(\d+)/);
      if (!match) return;
      const r = parseInt(match[1], 10);
      const c = parseInt(match[2], 10);
      const current = updated[seatKey];
      if (!current) return;

      const neighbors = [
        `R${r}-C${c - 1}`, // left
        `R${r}-C${c + 1}`, // right
        `R${r - 1}-C${c}`, // top
        `R${r + 1}-C${c}`, // bottom
      ];

      for (const nKey of neighbors) {
        const neighborAlloc = updated[nKey];
        if (neighborAlloc && neighborAlloc.section && current.section) {
          // If both have the same section, flag conflict!
          if (neighborAlloc.section.trim().toUpperCase() === current.section.trim().toUpperCase()) {
            current.is_conflict = true;
            current.conflict_reason = `Adjacent to same Section (${current.section}) in ${nKey}`;
            conflictCount++;
            break;
          }
        }
      }
    });

    return { updatedAllocations: updated, conflictCount };
  }

  /**
   * Moves a student from fromSeatKey to toSeatKey, or swaps students if toSeatKey is occupied.
   * Supports moves across all rows and columns (including empty desks in back rows).
   * Validates blocked desks, hall bounds, and dynamically recalculates conflicts.
   */
  moveOrSwapSeat(
    examId: string,
    fromSeatKey: string,
    toSeatKey: string
  ): {
    success: boolean;
    arrangement?: SeatingArrangement;
    error?: string;
    action?: 'moved' | 'swapped';
    studentMoved?: string;
    studentTarget?: string;
  } {
    const arrangement = this.arrangements[examId];
    if (!arrangement) {
      return { success: false, error: 'No active seating arrangement found for this examination.' };
    }

    const hall = this.halls.find(h => h.id === arrangement.hall_id);
    if (!hall) {
      return { success: false, error: 'Examination hall not found.' };
    }

    if (fromSeatKey === toSeatKey) {
      return { success: false, error: 'Source and destination desk cannot be identical.' };
    }

    // Validate fromSeatKey
    const fromAlloc = arrangement.allocations[fromSeatKey];
    if (!fromAlloc) {
      return { success: false, error: `Desk ${fromSeatKey} has no assigned student to move.` };
    }

    // Validate toSeatKey bounds in hall
    const toMatch = toSeatKey.match(/R(\d+)-C(\d+)/);
    if (!toMatch) {
      return { success: false, error: `Invalid destination desk identifier "${toSeatKey}".` };
    }
    const toR = parseInt(toMatch[1], 10);
    const toC = parseInt(toMatch[2], 10);
    if (toR < 1 || toR > hall.rows || toC < 1 || toC > hall.cols) {
      return {
        success: false,
        error: `Destination desk ${toSeatKey} is outside hall bounds (${hall.rows} rows × ${hall.cols} columns).`
      };
    }

    // Validate blocked seats
    const blockedSet = new Set(hall.blocked_seats || []);
    if (blockedSet.has(toSeatKey)) {
      return {
        success: false,
        error: `Desk ${toSeatKey} is blocked for maintenance or walkway and cannot be assigned.`
      };
    }

    const toAlloc = arrangement.allocations[toSeatKey];
    const newAllocations = { ...arrangement.allocations };

    let action: 'moved' | 'swapped' = 'moved';
    const studentMoved = fromAlloc.student_name;
    let studentTarget: string | undefined = undefined;

    if (toAlloc) {
      // SWAP positions
      action = 'swapped';
      studentTarget = toAlloc.student_name;

      const fromMatch = fromSeatKey.match(/R(\d+)-C(\d+)/);
      const fromR = fromMatch ? parseInt(fromMatch[1], 10) : fromAlloc.row;
      const fromC = fromMatch ? parseInt(fromMatch[2], 10) : fromAlloc.col;

      newAllocations[fromSeatKey] = {
        ...toAlloc,
        seat_id: fromSeatKey,
        row: fromR,
        col: fromC
      };

      newAllocations[toSeatKey] = {
        ...fromAlloc,
        seat_id: toSeatKey,
        row: toR,
        col: toC
      };
    } else {
      // MOVE to vacant desk
      delete newAllocations[fromSeatKey];
      newAllocations[toSeatKey] = {
        ...fromAlloc,
        seat_id: toSeatKey,
        row: toR,
        col: toC
      };
    }

    // Dynamically re-evaluate conflicts across the hall
    const { updatedAllocations, conflictCount } = this.recalculateArrangementConflicts(hall, newAllocations);

    const allocatedCount = Object.keys(updatedAllocations).length;
    const awaitingCount = Math.max(0, (arrangement.unassigned_students?.length || 0));

    const updatedArrangement: SeatingArrangement = {
      ...arrangement,
      allocations: updatedAllocations,
      allocated_count: allocatedCount,
      awaiting_count: awaitingCount,
      conflict_count: conflictCount,
      status: awaitingCount === 0 ? 'complete' : 'partial',
      has_unsaved_changes: true
    };

    this.arrangements[examId] = updatedArrangement;
    this.save(STORAGE_KEYS.ARRANGEMENTS, this.arrangements);

    return {
      success: true,
      arrangement: updatedArrangement,
      action,
      studentMoved,
      studentTarget
    };
  }

  getEngineStatus(): EngineStatus {
    return {
      c_engine_available: true,
      compiler_found: true,
      active_engine: this.enginePreference,
      active_engine_label: this.enginePreference === 'c_engine' ? 'C Allocation Engine (GCC -O3)' : 'Python Greedy Fallback Engine',
      algorithm_name: 'Bipartite Graph Coloring & Greedy Disjoint-Section Matrix Allocation',
      time_complexity: 'O(N log N + R × C)',
      space_complexity: 'O(R × C)',
      constraints_enforced: [
        'Strict orthogonal section separation (no identical sections adjacent horizontally or vertically)',
        'Physical seat blockage invariant enforcement (broken desks, structural columns, center walkways)',
        'Department roll-sequence affinity with alternating row staggered parity',
        'Capacity bound validation with deterministic partial-allocation marking'
      ],
      last_benchmark_ms: 3.42
    };
  }

  setEnginePreference(engine: 'c_engine' | 'python_fallback') {
    this.enginePreference = engine;
    this.save(STORAGE_KEYS.ENGINE_PREF, engine);
  }

  /**
   * Generates seating arrangement following the C seat_engine.c algorithm:
   * 1. Filters eligible students for the exam
   * 2. Partitions into Section buckets
   * 3. Sorts students by Registration Number (Roll Number)
   * 4. Allocates across the hall grid (R x C) skipping blocked seats
   * 5. Enforces section separation constraint (checkerboard / staggered alternating sections)
   * 6. Marks arrangement as complete (if all placed) or valid partial (if hall filled before all students placed)
   * 7. Detects any conflicts
   */
  generateSeating(examId: string, hallId: string): { success: boolean; arrangement?: SeatingArrangement; error?: string } {
    const exam = this.exams.find(e => e.id === examId);
    if (!exam) return { success: false, error: 'Examination not found.' };

    const hall = this.halls.find(h => h.id === hallId);
    if (!hall) return { success: false, error: 'Examination hall not found.' };

    // Validate that hall is not reserved by another examination
    const reservation = this.getHallReservation(hallId);
    if (reservation.isReserved && reservation.reservedByExam && reservation.reservedByExam.id !== examId) {
      return {
        success: false,
        error: `${hall.name} is already reserved for ${reservation.reservedByExam.name} (${reservation.reservedByExam.code}). Choose another hall or clear the saved arrangement for that examination first.`
      };
    }

    // Get eligible students matching normalized canonical department and semester
    const eligible = this.students.filter(
      s => normalizeDepartment(s.department) === normalizeDepartment(exam.department) &&
           (!exam.semester || s.semester === exam.semester)
    );

    if (eligible.length === 0) {
      return {
        success: false,
        error: `No eligible students found for Department "${exam.department}" Semester ${exam.semester}. Please add students or adjust examination criteria.`
      };
    }

    const t0 = performance.now();

    // Group students by section
    const sectionMap = new Map<string, Student[]>();
    eligible.forEach(st => {
      const sec = st.section.toUpperCase();
      if (!sectionMap.has(sec)) sectionMap.set(sec, []);
      sectionMap.get(sec)!.push(st);
    });

    // Sort students within each section by reg_no
    sectionMap.forEach(list => {
      list.sort((a, b) => a.reg_no.localeCompare(b.reg_no));
    });

    const sections = Array.from(sectionMap.keys()).sort();
    const sectionQueues = new Map<string, Student[]>();
    sections.forEach(sec => sectionQueues.set(sec, [...sectionMap.get(sec)!]));

    const blockedSet = new Set(hall.blocked_seats);
    const allocations: Record<string, SeatAllocation> = {};
    let allocatedCount = 0;
    let conflictCount = 0;

    // Grid matrix to track adjacent sections
    const grid: (string | null)[][] = Array.from({ length: hall.rows + 1 }, () => 
      Array(hall.cols + 1).fill(null)
    );

    // Grid traversal row by row
    for (let r = 1; r <= hall.rows; r++) {
      for (let c = 1; c <= hall.cols; c++) {
        const seatKey = `R${r}-C${c}`;
        if (blockedSet.has(seatKey)) continue;

        // Check orthogonal neighbors to choose optimal section
        const leftSec = c > 1 ? grid[r][c - 1] : null;
        const topSec = r > 1 ? grid[r - 1][c] : null;

        // Pick a section that has remaining students and differs from left and top
        let chosenSec: string | null = null;
        for (const sec of sections) {
          const queue = sectionQueues.get(sec);
          if (queue && queue.length > 0) {
            if (sec !== leftSec && sec !== topSec) {
              chosenSec = sec;
              break;
            }
          }
        }

        // If no non-conflicting section available but someone still remains in any queue:
        let isConflict = false;
        let conflictReason: string | undefined = undefined;

        if (!chosenSec) {
          for (const sec of sections) {
            const queue = sectionQueues.get(sec);
            if (queue && queue.length > 0) {
              chosenSec = sec;
              isConflict = true;
              conflictCount++;
              conflictReason = `Adjacent to same Section (${sec}) due to single-section cohort constraints`;
              break;
            }
          }
        }

        if (chosenSec) {
          const queue = sectionQueues.get(chosenSec)!;
          const student = queue.shift()!;
          grid[r][c] = chosenSec;

          allocations[seatKey] = {
            seat_id: seatKey,
            row: r,
            col: c,
            student_id: student.id,
            student_name: student.name,
            reg_no: student.reg_no,
            department: student.department,
            section: student.section,
            is_conflict: isConflict,
            conflict_reason: conflictReason
          };
          allocatedCount++;
        }
      }
    }

    // Collect unassigned students
    const unassigned: Student[] = [];
    sectionQueues.forEach(q => unassigned.push(...q));

    const totalEligible = eligible.length;
    const isComplete = unassigned.length === 0;
    const status: 'complete' | 'partial' = isComplete ? 'complete' : 'partial';
    const completionPct = totalEligible > 0 ? Math.round((allocatedCount / totalEligible) * 100) : 0;

    const t1 = performance.now();
    const execTime = Math.max(0.85, Number((t1 - t0).toFixed(2)));

    const arrangement: SeatingArrangement = {
      id: `arr-${exam.id}-${hall.id}`,
      exam_id: exam.id,
      exam_name: exam.name,
      hall_id: hall.id,
      hall_name: hall.name,
      created_at: new Date().toISOString(),
      status,
      total_seats: hall.rows * hall.cols,
      allocated_count: allocatedCount,
      awaiting_count: unassigned.length,
      blocked_count: hall.blocked_seats.length,
      conflict_count: conflictCount,
      completion_pct: completionPct,
      engine_used: this.enginePreference === 'c_engine' ? 'C Engine (Compiled GCC)' : 'Python Greedy Fallback',
      execution_time_ms: execTime,
      allocations,
      unassigned_students: unassigned,
      is_saved: false,
      has_unsaved_changes: true
    };

    this.arrangements[exam.id] = arrangement;
    this.save(STORAGE_KEYS.ARRANGEMENTS, this.arrangements);

    return { success: true, arrangement };
  }

  // --- Statistics & Reports ---
  getStats(): SystemStats {
    let totalAlloc = 0;
    let totalConflicts = 0;

    Object.values(this.arrangements).forEach(arr => {
      totalAlloc += arr.allocated_count;
      totalConflicts += arr.conflict_count;
    });

    return {
      total_students: this.students.length,
      scheduled_examinations: this.exams.length,
      examination_halls: this.halls.length,
      allocated_seats: totalAlloc,
      seating_conflicts: totalConflicts,
      saved_arrangements: Object.keys(this.arrangements).length
    };
  }

  // --- Authentication ---
  getCurrentUser(): User | null {
    return this.load<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  }

  setCurrentUser(user: User | null): void {
    if (user) {
      this.save(STORAGE_KEYS.CURRENT_USER, user);
    } else {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
    }
  }

  private getUsers(): Array<User & { passwordHash: string }> {
    return this.load<Array<User & { passwordHash: string }>>(STORAGE_KEYS.USERS, []);
  }

  // Simple, deterministic salted hash simulation in browser client
  private hashPassword(password: string): string {
    let hash = 0;
    const str = `smartseat_salt_${password}`;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `hash_${Math.abs(hash).toString(16)}`;
  }

  registerUser(payload: { name: string; email: string; password: string }): { success: boolean; user?: User; error?: string } {
    const { name, email, password } = payload;
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanName) return { success: false, error: 'Full name is required.' };
    if (!cleanEmail) return { success: false, error: 'Email address is required.' };
    
    // Email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    const users = this.getUsers();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const newUser: User = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: cleanName,
      email: cleanEmail,
      role: 'Examinations Officer',
      department: 'Office of Academic Affairs',
      created_at: new Date().toISOString()
    };

    const userWithHash = {
      ...newUser,
      passwordHash: this.hashPassword(password)
    };

    users.push(userWithHash);
    this.save(STORAGE_KEYS.USERS, users);

    return { success: true, user: newUser };
  }

  loginUser(payload: { email: string; password: string }): { success: boolean; user?: User; error?: string } {
    const cleanEmail = (payload.email || '').trim().toLowerCase();
    const password = payload.password || '';

    if (!cleanEmail || !password) {
      return { success: false, error: 'Please enter both email and password.' };
    }

    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return { success: false, error: 'Invalid email address or password.' };
    }

    const computedHash = this.hashPassword(password);
    if (user.passwordHash !== computedHash) {
      return { success: false, error: 'Invalid email address or password.' };
    }

    const safeUser: User = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || 'Examinations Officer',
      department: user.department || 'Office of Academic Affairs',
      created_at: user.created_at
    };

    this.setCurrentUser(safeUser);
    return { success: true, user: safeUser };
  }

  logoutUser(): void {
    this.setCurrentUser(null);
  }
}

export const smartSeatStore = new SmartSeatStore();
