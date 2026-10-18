import { smartSeatStore } from './store';
import { Student, Examination, Hall, SeatingArrangement, EngineStatus, SystemStats, User } from '../types';

export const api = {
  // Stats
  async getStats(): Promise<SystemStats> {
    return smartSeatStore.getStats();
  },

  // Students
  async getStudents(): Promise<Student[]> {
    return smartSeatStore.getStudents();
  },

  async addStudent(student: Omit<Student, 'id'>): Promise<{ success: boolean; student?: Student; error?: string }> {
    return smartSeatStore.addStudent(student);
  },

  async updateStudent(id: string, updates: Partial<Student>): Promise<{ success: boolean; student?: Student; error?: string }> {
    return smartSeatStore.updateStudent(id, updates);
  },

  async deleteStudent(id: string): Promise<boolean> {
    return smartSeatStore.deleteStudent(id);
  },

  async importStudentsCsv(csvText: string): Promise<{ imported: number; skipped: number; errors: string[] }> {
    return smartSeatStore.importStudentsCsv(csvText);
  },

  exportStudentsCsv(students: Student[]): string {
    const headers = ['Registration Number', 'Name', 'Department', 'Section', 'Semester', 'Email'];
    const rows = students.map(s => [
      `"${s.reg_no}"`,
      `"${s.name}"`,
      `"${s.department}"`,
      `"${s.section}"`,
      s.semester,
      `"${s.email || ''}"`
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  },

  // Examinations
  async getExaminations(): Promise<Examination[]> {
    return smartSeatStore.getExaminations();
  },

  async addExamination(exam: Omit<Examination, 'id'>): Promise<{ success: boolean; exam?: Examination; error?: string }> {
    return smartSeatStore.addExamination(exam);
  },

  async updateExamination(id: string, updates: Partial<Examination>): Promise<{ success: boolean; exam?: Examination; error?: string }> {
    return smartSeatStore.updateExamination(id, updates);
  },

  async deleteExamination(id: string): Promise<boolean> {
    return smartSeatStore.deleteExamination(id);
  },

  // Halls
  async getHalls(): Promise<Hall[]> {
    return smartSeatStore.getHalls();
  },

  async addHall(hall: Omit<Hall, 'id'>): Promise<{ success: boolean; hall?: Hall; error?: string }> {
    return smartSeatStore.addHall(hall);
  },

  async updateHall(id: string, updates: Partial<Hall>): Promise<{ success: boolean; hall?: Hall; error?: string }> {
    return smartSeatStore.updateHall(id, updates);
  },

  async deleteHall(id: string): Promise<boolean> {
    return smartSeatStore.deleteHall(id);
  },

  async toggleSeatBlocked(hallId: string, seatKey: string): Promise<{ success: boolean; hall?: Hall; error?: string }> {
    return smartSeatStore.toggleSeatBlocked(hallId, seatKey);
  },

  // Seating
  async getArrangement(examId: string): Promise<SeatingArrangement | null> {
    return smartSeatStore.getArrangement(examId);
  },

  async getAllArrangements(): Promise<SeatingArrangement[]> {
    return smartSeatStore.getAllArrangements();
  },

  async deleteArrangement(examId: string): Promise<boolean> {
    return smartSeatStore.deleteArrangement(examId);
  },

  async generateSeating(examId: string, hallId: string): Promise<{ success: boolean; arrangement?: SeatingArrangement; error?: string }> {
    return smartSeatStore.generateSeating(examId, hallId);
  },

  async saveArrangement(examId: string, arrangement: SeatingArrangement): Promise<{ success: boolean; arrangement?: SeatingArrangement; error?: string }> {
    return smartSeatStore.saveArrangement(examId, arrangement);
  },

  async saveResetArrangement(examId: string): Promise<{ success: boolean; error?: string }> {
    return smartSeatStore.saveResetArrangement(examId);
  },

  async getHallReservation(hallId: string) {
    return smartSeatStore.getHallReservation(hallId);
  },

  async moveOrSwapSeat(examId: string, fromSeatKey: string, toSeatKey: string) {
    return smartSeatStore.moveOrSwapSeat(examId, fromSeatKey, toSeatKey);
  },

  // Engine
  async getEngineStatus(): Promise<EngineStatus> {
    return smartSeatStore.getEngineStatus();
  },

  async setEnginePreference(engine: 'c_engine' | 'python_fallback'): Promise<EngineStatus> {
    smartSeatStore.setEnginePreference(engine);
    return smartSeatStore.getEngineStatus();
  },

  // Authentication
  async register(data: { name: string; email: string; password: string; confirm_password?: string }): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // First attempt backend API
      const resp = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (resp.ok) {
        const json = await resp.json();
        // Also persist locally in store
        smartSeatStore.registerUser(data);
        return { success: true, user: json.data };
      } else {
        const json = await resp.json().catch(() => ({}));
        if (json.error) return { success: false, error: json.error };
      }
    } catch {
      // Fallback to client-side store
    }
    return smartSeatStore.registerUser(data);
  },

  async login(data: { email: string; password: string }): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (resp.ok) {
        const json = await resp.json();
        const user = json.data?.user || json.data;
        smartSeatStore.setCurrentUser(user);
        return { success: true, user };
      } else {
        const json = await resp.json().catch(() => ({}));
        if (json.error) return { success: false, error: json.error };
      }
    } catch {
      // Fallback to client-side store
    }
    return smartSeatStore.loginUser(data);
  },

  async getCurrentUser(): Promise<User | null> {
    return smartSeatStore.getCurrentUser();
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } catch {
      // ignore
    }
    smartSeatStore.logoutUser();
  }
};
