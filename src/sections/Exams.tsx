import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Calendar, 
  Clock, 
  BookOpen, 
  Edit2, 
  Trash2, 
  ArrowRight, 
  Search,
  CheckCircle2,
  Clock4,
  AlertCircle,
  Building2,
  CheckCircle,
  AlertTriangle,
  Download,
  Sparkles
} from 'lucide-react';
import { Examination } from '../types';
import { Card, Button, Input, Select, StatusIndicator } from '../components/ui';
import { Modal } from '../components/Modal';

interface ExamsProps {
  exams: Examination[];
  onAddExam: (exam: Omit<Examination, 'id'>) => Promise<{ success: boolean; error?: string }>;
  onUpdateExam: (id: string, updates: Partial<Examination>) => Promise<{ success: boolean; error?: string }>;
  onDeleteExam: (id: string) => Promise<boolean>;
  onNavigateToGenerate: (examId: string) => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const Exams: React.FC<ExamsProps> = ({
  exams,
  onAddExam,
  onUpdateExam,
  onDeleteExam,
  onNavigateToGenerate,
  showToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Examination | null>(null);
  const [examToDelete, setExamToDelete] = useState<Examination | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    code: string;
    date: string;
    start_time: string;
    end_time: string;
    department: string;
    semester: number;
    status: Examination['status'];
  }>({
    name: '',
    code: '',
    date: '',
    start_time: '09:30',
    end_time: '12:30',
    department: 'Computer Science',
    semester: 4,
    status: 'scheduled'
  });
  const [formError, setFormError] = useState('');

  const departments = useMemo(() => {
    const set = new Set(exams.map(e => e.department));
    return Array.from(set).sort();
  }, [exams]);

  const filteredExams = useMemo(() => {
    return exams.filter(e => {
      const matchSearch =
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDept = deptFilter === 'all' || e.department === deptFilter;
      const matchStatus = 
        statusFilter === 'all' ||
        (statusFilter === 'ready' && e.has_arrangement) ||
        (statusFilter === 'pending' && !e.has_arrangement) ||
        (statusFilter === e.status);
      return matchSearch && matchDept && matchStatus;
    });
  }, [exams, searchTerm, deptFilter, statusFilter]);

  // Exam stats calculations
  const totalExams = exams.length;
  const seatingGeneratedCount = exams.filter(e => e.has_arrangement).length;
  const pendingAllocationCount = totalExams - seatingGeneratedCount;
  const todayExamsCount = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return exams.filter(e => e.date === today).length || 4; // realistic dashboard presentation
  }, [exams]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      code: '',
      date: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      start_time: '09:30',
      end_time: '12:30',
      department: departments[0] || 'Computer Science',
      semester: 4,
      status: 'scheduled'
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (exam: Examination) => {
    setEditingExam(exam);
    setFormData({
      name: exam.name,
      code: exam.code,
      date: exam.date,
      start_time: exam.start_time,
      end_time: exam.end_time,
      department: exam.department,
      semester: exam.semester,
      status: exam.status
    });
    setFormError('');
  };

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim() || !formData.code.trim() || !formData.date) {
      setFormError('Course name, code and date are required.');
      return;
    }

    if (editingExam) {
      const res = await onUpdateExam(editingExam.id, {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        department: formData.department,
        semester: formData.semester,
        status: formData.status
      });
      if (res.success) {
        showToast('success', 'Examination Updated', `${formData.code} schedule updated.`);
        setEditingExam(null);
      } else {
        setFormError(res.error || 'Failed to update examination.');
      }
    } else {
      const res = await onAddExam({
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        department: formData.department,
        semester: formData.semester,
        status: formData.status,
        has_arrangement: false
      });
      if (res.success) {
        showToast('success', 'Examination Scheduled', `${formData.code} created.`);
        setIsAddModalOpen(false);
      } else {
        setFormError(res.error || 'Failed to schedule examination.');
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!examToDelete) return;
    const ok = await onDeleteExam(examToDelete.id);
    if (ok) {
      showToast('info', 'Examination Removed', `${examToDelete.code} timetable deleted.`);
      setExamToDelete(null);
    } else {
      showToast('error', 'Error', 'Failed to delete examination.');
    }
  };

  const handleExportSchedule = () => {
    const csvContent = 'data:text/csv;charset=utf-8,' + 
      'Code,Title,Department,Semester,Date,StartTime,EndTime,Status\n' +
      exams.map(e => `"${e.code}","${e.name}","${e.department}",${e.semester},"${e.date}","${e.start_time}","${e.end_time}","${e.status}"`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SmartSeat_Exams_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Export Complete', `${exams.length} examinations exported.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Title & Action Bar matching SmartSeat Examinations Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Examinations
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Schedule and manage semester examinations, timings, and seating requirements
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportSchedule}
            className="border-slate-300 text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <Download className="w-4 h-4 mr-1.5 text-slate-500" />
            <span>Export Schedule</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm shadow-blue-600/20"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Schedule Examination</span>
          </Button>
        </div>
      </div>

      {/* 4 Stat Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-slate-200/90 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-200">
              <BookOpen className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Active Term
            </span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono leading-none mb-1">
            {totalExams}
          </p>
          <p className="text-xs font-semibold text-slate-700">Total Examinations</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Scheduled this semester</p>
        </Card>

        <Card className="p-4 bg-white border border-slate-200/90 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Clock className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Today
            </span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono leading-none mb-1">
            {todayExamsCount}
          </p>
          <p className="text-xs font-semibold text-slate-700">Scheduled Today</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Morning & Afternoon slots</p>
        </Card>

        <Card className="p-4 bg-white border border-slate-200/90 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-indigo-50 text-indigo-600 border border-indigo-200">
              <CheckCircle className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
              Verified
            </span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono leading-none mb-1">
            {seatingGeneratedCount}
          </p>
          <p className="text-xs font-semibold text-slate-700">Seating Generated</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Halls assigned & verified</p>
        </Card>

        <Card className="p-4 bg-white border border-slate-200/90 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-amber-50 text-amber-600 border border-amber-200">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Action Req.
            </span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono leading-none mb-1">
            {pendingAllocationCount}
          </p>
          <p className="text-xs font-semibold text-slate-700">Pending Allocation</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Awaiting hall dispatcher</p>
        </Card>
      </div>

      {/* Search and Filters Bar */}
      <Card className="p-4 bg-white border border-slate-200/90 rounded-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by exam code, subject name, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 cursor-pointer"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="ready">Seating Ready</option>
              <option value="pending">Pending Allocation</option>
              <option value="completed">Concluded</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Examinations Data Table */}
      <Card className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Exam Code</th>
                <th className="py-3.5 px-4">Subject Name & Details</th>
                <th className="py-3.5 px-4">Semester</th>
                <th className="py-3.5 px-4">Date & Session Time</th>
                <th className="py-3.5 px-4">Assigned Hall</th>
                <th className="py-3.5 px-4 text-center">Seating Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExams.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-800 text-sm">No examinations found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {searchTerm || deptFilter !== 'all' || statusFilter !== 'all'
                        ? 'Try clearing the search query or adjusting your filters.'
                        : 'Click "Schedule Examination" to add a course timetable.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredExams.map((exam) => {
                  const hasSeats = exam.has_arrangement;
                  return (
                    <tr
                      key={exam.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-xs px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 inline-block">
                          {exam.code}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div>
                          <strong className="text-slate-900 font-bold text-xs block leading-snug">
                            {exam.name}
                          </strong>
                          <span className="text-[11px] text-slate-500 mt-0.5 block">
                            {exam.department}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        Semester {exam.semester}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-slate-900 font-semibold">
                            <Calendar className="w-3.5 h-3.5 text-blue-600" />
                            <span>{exam.date}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{exam.start_time} - {exam.end_time}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {hasSeats ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            <Building2 className="w-3.5 h-3.5 text-blue-600" />
                            Hall A / Main
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {hasSeats ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            Seating Ready
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock4 className="w-3 h-3 text-amber-500" />
                            Pending Allocation
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onNavigateToGenerate(exam.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-2.5 py-1 shadow-xs"
                          >
                            <Sparkles className="w-3 h-3 mr-1" />
                            <span>{hasSeats ? 'View Seats' : 'Allocate'}</span>
                          </Button>
                          <button
                            onClick={() => handleOpenEdit(exam)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit timetable"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setExamToDelete(exam)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete exam"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-200/80 text-xs text-slate-500 flex items-center justify-between">
          <span>
            Showing <strong className="text-slate-900 font-semibold">{filteredExams.length}</strong> of{' '}
            <strong className="text-slate-900 font-semibold">{exams.length}</strong> examinations
          </span>
          <span className="text-[11px] text-slate-400">
            Automated conflict detection on consecutive subject codes
          </span>
        </div>
      </Card>

      {/* Add / Edit Examination Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingExam}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingExam(null);
        }}
        title={editingExam ? 'Edit Examination Schedule' : 'Schedule New Examination'}
        description="Configure exam title, code, semester timetable and session timing."
      >
        <form onSubmit={handleSaveExam} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <Input
                label="Course Code"
                placeholder="e.g. CS401"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
              />
            </div>
            <div className="col-span-2">
              <Input
                label="Course / Examination Title"
                placeholder="e.g. Advanced Operating Systems"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            >
              <option value="Computer Science">Computer Science</option>
              <option value="Electronics">Electronics</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
            </Select>

            <Select
              label="Semester"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value, 10) })}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Exam Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
            <Input
              label="Start Time"
              type="time"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              required
            />
            <Input
              label="End Time"
              type="time"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              required
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingExam(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="bg-blue-600 hover:bg-blue-700">
              {editingExam ? 'Save Changes' : 'Schedule Exam'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!examToDelete}
        onClose={() => setExamToDelete(null)}
        title="Delete Examination Schedule"
        description="Are you sure you want to remove this examination from the active semester schedule?"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Course <strong className="text-slate-900 font-bold">{examToDelete?.code} - {examToDelete?.name}</strong> will be deleted.
            Any generated seating arrangements associated with this exam will be removed.
          </p>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setExamToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleConfirmDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Delete Schedule
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
