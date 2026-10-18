import React, { useState, useMemo } from 'react';
import { 
  Play, 
  RotateCcw, 
  Download, 
  Printer, 
  Users, 
  Building2, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  Ban, 
  Info, 
  ShieldAlert,
  UserCheck,
  Hash,
  BookOpen,
  Sparkles,
  Zap,
  CheckCircle,
  FileSpreadsheet,
  Calendar,
  Clock,
  Layers,
  ArrowRight,
  Save,
  BookmarkCheck
} from 'lucide-react';
import { Examination, Hall, Student, SeatingArrangement, EngineStatus, SeatAllocation } from '../types';
import { Card, Button, StatusIndicator } from '../components/ui';
import { SeatGrid } from '../components/SeatGrid';
import { Modal } from '../components/Modal';

interface GenerateProps {
  exams: Examination[];
  halls: Hall[];
  students: Student[];
  arrangements: SeatingArrangement[];
  engineStatus: EngineStatus | null;
  onGenerate: (examId: string, hallId: string) => Promise<{ success: boolean; arrangement?: SeatingArrangement; error?: string }>;
  onDeleteArrangement: (examId: string) => Promise<boolean>;
  onSetEnginePreference: (engine: 'c_engine' | 'python_fallback') => Promise<void>;
  onMoveOrSwapSeat?: (examId: string, fromSeatKey: string, toSeatKey: string) => Promise<any>;
  onSaveArrangement?: (examId: string, arrangement: SeatingArrangement) => Promise<{ success: boolean; arrangement?: SeatingArrangement; error?: string }>;
  onSaveReset?: (examId: string) => Promise<{ success: boolean; error?: string }>;
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  initialExamId?: string;
}

export const Generate: React.FC<GenerateProps> = ({
  exams,
  halls,
  students,
  arrangements,
  engineStatus,
  onGenerate,
  onDeleteArrangement,
  onSetEnginePreference,
  onMoveOrSwapSeat,
  onSaveArrangement,
  onSaveReset,
  showToast,
  initialExamId
}) => {
  const [selectedExamId, setSelectedExamId] = useState<string>(initialExamId || exams[0]?.id || '');
  const [selectedHallId, setSelectedHallId] = useState<string>(halls[0]?.id || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isResetDraft, setIsResetDraft] = useState(false);
  const [pendingExamSwitchId, setPendingExamSwitchId] = useState<string | null>(null);
  const [isLeaveWarningOpen, setIsLeaveWarningOpen] = useState(false);
  const [selectedSeatKey, setSelectedSeatKey] = useState<string | null>(null);
  const [isUnassignedModalOpen, setIsUnassignedModalOpen] = useState(false);

  // Manual rearrangement state
  const [rearrangeSourceKey, setRearrangeSourceKey] = useState<string | null>(null);
  const [targetRow, setTargetRow] = useState<number>(1);
  const [targetCol, setTargetCol] = useState<number>(1);
  const [isMoving, setIsMoving] = useState(false);

  // Synchronize initialExamId if provided
  React.useEffect(() => {
    if (initialExamId) {
      setSelectedExamId(initialExamId);
    }
  }, [initialExamId]);

  // Keep selected IDs in sync when options become available
  React.useEffect(() => {
    if (!selectedExamId && exams.length > 0) {
      setSelectedExamId(exams[0].id);
    }
  }, [exams, selectedExamId]);

  React.useEffect(() => {
    if (!selectedHallId && halls.length > 0) {
      setSelectedHallId(halls[0].id);
    }
  }, [halls, selectedHallId]);

  // Active examination and hall with safety fallbacks
  const currentExam = useMemo(() => {
    if (!exams || exams.length === 0) return undefined;
    return exams.find(e => e && e.id === selectedExamId) || exams[0];
  }, [exams, selectedExamId]);

  const currentHall = useMemo(() => {
    if (!halls || halls.length === 0) return undefined;
    return halls.find(h => h && h.id === selectedHallId) || halls[0];
  }, [halls, selectedHallId]);

  // Active arrangement for this exam
  const currentArrangement = useMemo(() => {
    if (!currentExam) return undefined;
    return arrangements.find(a => a && a.exam_id === currentExam.id);
  }, [arrangements, currentExam]);

  // Eligible students for the current exam (by department and semester)
  const eligibleStudents = useMemo(() => {
    if (!currentExam) return [];
    return students.filter(
      s => s && (s.department.trim().toLowerCase() === currentExam.department.trim().toLowerCase() ||
                 (currentExam.department.toUpperCase() === 'CSE' && (s.department.toUpperCase() === 'CSE' || s.department.toUpperCase().includes('COMPUTER')))) &&
           (!currentExam.semester || s.semester === currentExam.semester)
    );
  }, [students, currentExam]);

  // Track hall reservation status for currently selected hall
  const hallReservation = useMemo(() => {
    if (!currentHall) return { isReserved: false, isReservedByOther: false, isReservedByCurrent: false, examName: '', examCode: '' };

    if (currentHall.reserved_for_exam_id) {
      if (currentExam && currentHall.reserved_for_exam_id === currentExam.id) {
        return {
          isReserved: true,
          isReservedByOther: false,
          isReservedByCurrent: true,
          examId: currentHall.reserved_for_exam_id,
          examName: currentHall.reserved_for_exam_name || currentExam.name,
          examCode: currentHall.reserved_for_exam_code || currentExam.code
        };
      } else {
        return {
          isReserved: true,
          isReservedByOther: true,
          isReservedByCurrent: false,
          examId: currentHall.reserved_for_exam_id,
          examName: currentHall.reserved_for_exam_name || 'Another Examination',
          examCode: currentHall.reserved_for_exam_code || currentHall.reserved_for_exam_id
        };
      }
    }

    // Cross-check arrangements in case hall reservation fields were not set
    const otherSavedArr = arrangements.find(
      a => a.is_saved && a.hall_id === currentHall.id && a.exam_id !== currentExam?.id
    );
    if (otherSavedArr) {
      const otherExam = exams.find(e => e.id === otherSavedArr.exam_id);
      return {
        isReserved: true,
        isReservedByOther: true,
        isReservedByCurrent: false,
        examId: otherSavedArr.exam_id,
        examName: otherExam?.name || otherSavedArr.exam_name,
        examCode: otherExam?.code || otherSavedArr.exam_id
      };
    }

    const currentSavedArr = arrangements.find(
      a => a.is_saved && a.hall_id === currentHall.id && a.exam_id === currentExam?.id
    );
    if (currentSavedArr) {
      return {
        isReserved: true,
        isReservedByOther: false,
        isReservedByCurrent: true,
        examId: currentExam!.id,
        examName: currentExam!.name,
        examCode: currentExam!.code
      };
    }

    return { isReserved: false, isReservedByOther: false, isReservedByCurrent: false, examName: '', examCode: '' };
  }, [currentHall, currentExam, arrangements, exams]);

  // Active display arrangement (handling reset draft view vs current saved/working arrangement)
  const activeDisplayArrangement = useMemo(() => {
    if (isResetDraft) {
      if (!currentExam || !currentHall) return undefined;
      return {
        id: `draft-reset-${currentExam.id}`,
        exam_id: currentExam.id,
        exam_name: currentExam.name,
        hall_id: currentHall.id,
        hall_name: currentHall.name,
        created_at: new Date().toISOString(),
        status: 'partial' as const,
        total_seats: currentHall.rows * currentHall.cols,
        allocated_count: 0,
        awaiting_count: eligibleStudents.length,
        blocked_count: currentHall.blocked_seats?.length || 0,
        conflict_count: 0,
        completion_pct: 0,
        engine_used: 'C Engine (Compiled GCC)' as const,
        execution_time_ms: 0,
        allocations: {},
        unassigned_students: eligibleStudents,
        is_saved: false,
        has_unsaved_changes: true
      };
    }
    return currentArrangement;
  }, [isResetDraft, currentArrangement, currentExam, currentHall, eligibleStudents]);

  // Derived unsaved changes flag
  const hasUnsavedChanges = useMemo(() => {
    if (isResetDraft) return true;
    if (!currentArrangement) return false;
    if (!currentArrangement.is_saved) return true;
    return !!currentArrangement.has_unsaved_changes;
  }, [isResetDraft, currentArrangement]);

  // Warn user on browser close / refresh if there are unsaved changes
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Intercept exam switching if current plan has unsaved changes
  const handleExamSelect = (newExamId: string) => {
    if (newExamId === selectedExamId) return;
    if (hasUnsavedChanges) {
      setPendingExamSwitchId(newExamId);
      setIsLeaveWarningOpen(true);
    } else {
      setSelectedExamId(newExamId);
      setIsResetDraft(false);
      setSelectedSeatKey(null);
    }
  };

  // Calculations for current hall
  const netCapacity = currentHall ? currentHall.capacity - (currentHall.blocked_seats?.length || 0) : 0;
  const isHallSufficient = netCapacity >= eligibleStudents.length;

  const handleRunGenerate = async () => {
    if (!currentExam || !currentHall) {
      showToast('error', 'Selection Required', 'Please select both an examination and a hall.');
      return;
    }

    if (hallReservation.isReservedByOther) {
      showToast(
        'error',
        'Hall Already Reserved',
        `${currentHall.name} is already reserved for ${hallReservation.examName} (${hallReservation.examCode}). Choose another hall or clear the saved arrangement for that examination first.`
      );
      return;
    }

    setIsGenerating(true);
    try {
      const res = await onGenerate(currentExam.id, currentHall.id);
      if (res.success && res.arrangement) {
        setIsResetDraft(false);
        showToast(
          'success',
          'Seating Plan Generated',
          `Allocated ${res.arrangement.allocated_count} students to ${currentHall.name || 'Hall'}. Click "Save Arrangement" to finalize and reserve this hall.`
        );
        // Pre-select the first allocated seat for convenience
        const firstKey = Object.keys(res.arrangement.allocations)[0];
        if (firstKey) setSelectedSeatKey(firstKey);
      } else {
        showToast('error', 'Generation Error', res.error || 'Failed to generate seating.');
      }
    } catch (err) {
      showToast('error', 'Generation Exception', 'Engine invocation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveArrangement = async () => {
    if (!currentExam) {
      showToast('error', 'Error', 'No examination selected.');
      return;
    }
    if (isResetDraft) {
      await handleSaveReset();
      return;
    }
    if (!currentArrangement) {
      showToast('error', 'Nothing to Save', 'Generate a seating plan first before saving.');
      return;
    }

    if (hallReservation.isReservedByOther) {
      showToast(
        'error',
        'Hall Already Reserved',
        `${currentHall?.name || 'This hall'} is already reserved for ${hallReservation.examName} (${hallReservation.examCode}).`
      );
      return;
    }

    setIsSaving(true);
    try {
      if (onSaveArrangement) {
        const res = await onSaveArrangement(currentExam.id, currentArrangement);
        if (res.success) {
          setIsResetDraft(false);
        }
      }
    } catch (err: any) {
      showToast('error', 'Save Failed', err?.message || 'Could not save seating arrangement.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveReset = async () => {
    if (!currentExam) return;
    setIsSaving(true);
    try {
      if (onSaveReset) {
        const res = await onSaveReset(currentExam.id);
        if (res.success) {
          setIsResetDraft(false);
          setSelectedSeatKey(null);
        }
      } else {
        await onDeleteArrangement(currentExam.id);
        setIsResetDraft(false);
        setSelectedSeatKey(null);
        showToast('info', 'Plan Reset & Saved', 'The seating plan was cleared and hall reservation released.');
      }
    } catch (err: any) {
      showToast('error', 'Reset Failed', err?.message || 'Could not reset arrangement.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmReset = () => {
    setIsResetConfirmOpen(false);
    setIsResetDraft(true);
    setSelectedSeatKey(null);
    showToast(
      'info',
      'Working Plan Reset',
      'Current assignments cleared. Click "Save Reset" to permanently remove saved arrangement and release hall reservation.'
    );
  };

  const handleDirectMove = async (fromKey: string, toKey: string) => {
    if (!currentExam) return;
    setIsMoving(true);
    try {
      const res = await onMoveOrSwapSeat?.(currentExam.id, fromKey, toKey);
      if (res && res.success) {
        setRearrangeSourceKey(null);
        setSelectedSeatKey(toKey);
      }
    } finally {
      setIsMoving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    if (!activeDisplayArrangement || !currentExam || !currentHall) return;

    const rows = [
      ['SmartSeat Official Seating Chart Report'],
      [`Examination: ${currentExam.code} - ${currentExam.name}`],
      [`Date: ${currentExam.date} | Session: ${currentExam.start_time} - ${currentExam.end_time}`],
      [`Venue: ${currentHall.name} (${currentHall.building})`],
      [''],
      ['Desk Number', 'Seat Row', 'Seat Col', 'Student Reg No', 'Student Name', 'Department', 'Semester', 'Section']
    ];

    Object.entries(activeDisplayArrangement.allocations).forEach(([seatKey, a]) => {
      const [r, c] = seatKey.split('-');
      rows.push([
        seatKey,
        `Row ${parseInt(r, 10) + 1}`,
        `Col ${parseInt(c, 10) + 1}`,
        a.reg_no,
        a.student_name,
        a.department,
        ((a as any).semester || currentExam.semester || 1).toString(),
        a.section
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.map(i => `"${i}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SeatingPlan_${currentExam.code}_${currentHall.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Export Complete', 'Seating roster exported to CSV.');
  };

  // Inspect selected seat
  const selectedAllocation: SeatAllocation | undefined = useMemo(() => {
    if (!selectedSeatKey || !activeDisplayArrangement) return undefined;
    return activeDisplayArrangement.allocations[selectedSeatKey];
  }, [selectedSeatKey, activeDisplayArrangement]);

  // Breakdown of departments allocated in the current arrangement
  const deptDistribution = useMemo(() => {
    if (!activeDisplayArrangement) return {};
    const counts: Record<string, number> = {};
    Object.values(activeDisplayArrangement.allocations).forEach((alloc) => {
      const dept = alloc.department || 'General';
      counts[dept] = (counts[dept] || 0) + 1;
    });
    return counts;
  }, [activeDisplayArrangement]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Section Header matching Reference Images */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Generate Seating Plan
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Architectural examination hall seating generator powered by DSA heuristic graph-coloring & C engine
          </p>
        </div>

        {/* Engine status indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50/80 border border-blue-200/80 text-blue-700 text-xs font-semibold">
            <Cpu className="w-4 h-4 text-blue-600" />
            <span>Algorithm: {engineStatus?.active_engine === 'c_engine' ? 'C Binary (GCC -O3)' : 'Python DSA Fallback'}</span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Engine Online
          </span>
        </div>
      </div>

      {/* THREE-COLUMN WORKSPACE: LEFT SELECTORS + CENTER FLOOR PLAN + RIGHT INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ========================================================
            LEFT COLUMN: EXAMINATION & HALL SELECTION + SETTINGS
           ======================================================== */}
        <div className="lg:col-span-3 space-y-4">
          {/* Card 1: Examination Selection & Details */}
          <Card className="p-4 bg-white border border-slate-200/90 rounded-xl shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                1. Select Examination
              </span>
              <span className="text-[11px] text-blue-600 font-semibold">
                {exams.length} Available
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Target Examination
              </label>
              <select
                value={selectedExamId}
                onChange={(e) => handleExamSelect(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 cursor-pointer"
              >
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.code} - {exam.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Exam Information Panel */}
            {currentExam && (
              <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200/80 space-y-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Course Name</span>
                  <span className="font-bold text-slate-900 text-xs block leading-tight">{currentExam.name}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Dept & Sem</span>
                    <span className="font-semibold text-slate-800">{currentExam.department} · Sem {currentExam.semester}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Candidates</span>
                    <span className="font-extrabold text-blue-700">{eligibleStudents.length} Students</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {currentExam.date}
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {currentExam.start_time}
                  </span>
                </div>
              </div>
            )}
          </Card>

          {/* Card 2: Examination Hall Selection */}
          <Card className="p-4 bg-white border border-slate-200/90 rounded-xl shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                2. Select Hall
              </span>
              <span className="text-[11px] text-blue-600 font-semibold">
                {halls.length} Halls
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Target Venue
              </label>
              <select
                value={selectedHallId}
                onChange={(e) => setSelectedHallId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 cursor-pointer"
              >
                {halls.map((hall) => {
                  const isReservedOther = (hall.reserved_for_exam_id && hall.reserved_for_exam_id !== currentExam?.id) ||
                    arrangements.some(a => a.is_saved && a.hall_id === hall.id && a.exam_id !== currentExam?.id);
                  const isReservedSelf = hall.reserved_for_exam_id === currentExam?.id ||
                    arrangements.some(a => a.is_saved && a.hall_id === hall.id && a.exam_id === currentExam?.id);
                  const statusNote = isReservedOther ? ' [Reserved]' : isReservedSelf ? ' [Reserved for this exam]' : '';
                  return (
                    <option key={hall.id} value={hall.id}>
                      {hall.name} ({hall.capacity} desks){statusNote}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Hall Reservation Notice / Warning */}
            {hallReservation.isReservedByOther && currentHall && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 space-y-1.5 animate-in fade-in">
                <div className="flex items-center gap-1.5 font-bold text-rose-900">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Hall Already Reserved</span>
                </div>
                <p className="leading-relaxed">
                  {currentHall.name} is already reserved for {hallReservation.examName} ({hallReservation.examCode}). Choose another hall or clear the saved arrangement for that examination first.
                </p>
              </div>
            )}

            {hallReservation.isReservedByCurrent && currentHall && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-semibold text-emerald-900">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Reserved for this Examination ({currentExam?.code})
                </span>
                <span className="text-[10px] text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200 font-mono font-bold">
                  Active
                </span>
              </div>
            )}

            {/* Selected Hall Information Panel */}
            {currentHall && (
              <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{currentHall.name}</span>
                  <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {currentHall.building}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Grid Layout</span>
                    <span className="font-mono font-bold text-slate-800">{currentHall.rows} Rows × {currentHall.cols} Cols</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Usable Desks</span>
                    <span className="font-mono font-bold text-emerald-700">{netCapacity} Desks</span>
                  </div>
                </div>

                {currentHall.blocked_seats && currentHall.blocked_seats.length > 0 && (
                  <div className="text-[10px] text-rose-600 font-medium flex items-center gap-1 pt-1 border-t border-slate-200/60">
                    <Ban className="w-3 h-3" />
                    <span>{currentHall.blocked_seats.length} Desks marked Blocked / Aisle</span>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Card 3: Generation Settings & Action */}
          <Card className="p-4 bg-white border border-slate-200/90 rounded-xl shadow-xs space-y-3.5">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              3. Generation Control
            </span>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-600 font-medium">Spacing Heuristic:</span>
                <span className="font-bold text-slate-900">Alternate Desks</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-600 font-medium">Conflict Model:</span>
                <span className="font-bold text-emerald-700">DSA Bipartite</span>
              </div>
            </div>

            {/* Capacity Warning */}
            {!isHallSufficient && currentHall && currentExam && (
              <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-tight">
                  Capacity ({netCapacity}) is below cohort ({eligibleStudents.length}). Overflow students won't be seated.
                </span>
              </div>
            )}

            {/* Run Generation Button */}
            <Button
              variant="primary"
              size="md"
              onClick={handleRunGenerate}
              disabled={isGenerating || !currentExam || !currentHall || hallReservation.isReservedByOther}
              className={`w-full font-bold py-2.5 shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                hallReservation.isReservedByOther
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Generating Floor Plan...' : 'Generate Seating Plan'}</span>
            </Button>

            {/* Save Arrangement / Save Changes Action Button */}
            {(activeDisplayArrangement || currentArrangement || isResetDraft) && currentExam && (
              <div className="space-y-1.5 pt-1">
                {isResetDraft ? (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleSaveReset}
                    disabled={isSaving}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 shadow-sm cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
                    <span>{isSaving ? 'Saving Reset...' : 'Save Reset (Release Reservation)'}</span>
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleSaveArrangement}
                    disabled={isSaving || hallReservation.isReservedByOther}
                    className={`w-full font-bold py-2 shadow-sm cursor-pointer flex items-center justify-center gap-2 ${
                      hallReservation.isReservedByOther
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        : hasUnsavedChanges
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 ring-2 ring-emerald-400/50'
                        : 'bg-slate-800 hover:bg-slate-900 text-white'
                    }`}
                  >
                    {isSaving ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : hasUnsavedChanges ? (
                      <Save className="w-4 h-4" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                    <span>
                      {isSaving
                        ? 'Saving Arrangement...'
                        : hasUnsavedChanges
                        ? (currentArrangement?.is_saved ? 'Save Changes' : 'Save Arrangement')
                        : 'Save Arrangement'}
                    </span>
                  </Button>
                )}

                {/* Status Indicator Bar */}
                <div className="text-[11px] rounded-lg">
                  {isResetDraft ? (
                    <span className="text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg w-full flex items-center justify-between font-medium">
                      <span className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        Reset Unsaved
                      </span>
                      <span className="font-semibold text-[10px]">Click Save Reset to Release</span>
                    </span>
                  ) : hasUnsavedChanges ? (
                    <span className="text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg w-full flex items-center justify-between font-medium">
                      <span className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        Unsaved Changes
                      </span>
                      <span className="font-semibold text-[10px]">
                        {currentArrangement?.is_saved ? 'Modifications pending save' : 'Draft not saved'}
                      </span>
                    </span>
                  ) : currentArrangement?.is_saved ? (
                    <span className="text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg w-full flex items-center justify-between font-medium">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Arrangement Saved
                      </span>
                      <span className="font-semibold text-[10px]">
                        Hall Reserved ({currentHall?.name})
                      </span>
                    </span>
                  ) : null}
                </div>
              </div>
            )}

            {/* Clear Plan Button (Reset Current Plan with confirmation workflow) */}
            {(activeDisplayArrangement || currentArrangement || isResetDraft) && currentExam && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsResetConfirmOpen(true)}
                disabled={isGenerating || isSaving}
                className="w-full border-slate-300 text-slate-600 hover:text-rose-600 hover:border-rose-300 text-xs py-1.5 cursor-pointer flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                <span>Reset Current Plan</span>
              </Button>
            )}
          </Card>
        </div>

        {/* ========================================================
            RIGHT COLUMN (9 Cols): 3 SUMMARY PANELS ABOVE + FULL-WIDTH FLOOR PLAN
           ======================================================== */}
        <div className="lg:col-span-9 space-y-5">
          {/* THREE PANELS ABOVE THE HALL (Arranged horizontally across the top) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Panel 1: Allocation Summary Metrics */}
            <Card className="p-4 bg-white border border-slate-200/90 rounded-xl shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    Allocation Summary
                  </span>
                  {activeDisplayArrangement && (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {isResetDraft ? 'Reset Draft' : 'Generated'}
                    </span>
                  )}
                </h3>

                {/* Candidates Placed Progress Meter */}
                <div className="space-y-1.5 mt-3">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600">Candidates Seated:</span>
                    <span className="text-blue-700 font-mono font-bold">
                      {activeDisplayArrangement ? activeDisplayArrangement.allocated_count : 0} / {eligibleStudents.length}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          eligibleStudents.length > 0
                            ? Math.min(100, Math.round(((activeDisplayArrangement?.allocated_count || 0) / eligibleStudents.length) * 100))
                            : 0
                        }%`
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0%</span>
                    <span>
                      {eligibleStudents.length > 0 && activeDisplayArrangement
                        ? `${Math.round((activeDisplayArrangement.allocated_count / eligibleStudents.length) * 100)}% Placed`
                        : 'Awaiting generation'}
                    </span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* Quick Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Utilization</span>
                  <strong className="text-xs font-extrabold text-slate-900 font-mono">
                    {activeDisplayArrangement && currentHall
                      ? `${Math.round((activeDisplayArrangement.allocated_count / (currentHall.capacity || 1)) * 100)}%`
                      : '0%'}
                  </strong>
                </div>

                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Conflicts</span>
                  <strong className={`text-xs font-extrabold font-mono flex items-center gap-1 ${
                    (activeDisplayArrangement?.conflict_count || 0) > 0 ? 'text-amber-700' : 'text-emerald-700'
                  }`}>
                    {(activeDisplayArrangement?.conflict_count || 0) > 0 ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>{activeDisplayArrangement?.conflict_count} Spacing Alert{activeDisplayArrangement!.conflict_count > 1 ? 's' : ''}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>0 (100% Conflict-Free)</span>
                      </>
                    )}
                  </strong>
                </div>
              </div>
            </Card>

            {/* Panel 2: Interactive Seat Details & Manual Rearrangement Inspector */}
            <Card className="p-4 bg-white border border-slate-200/90 rounded-xl shadow-xs space-y-2.5 flex flex-col justify-between">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-blue-600" />
                  Seat Allocation Details
                </span>
                {selectedSeatKey && (
                  <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    {selectedSeatKey}
                  </span>
                )}
              </h3>

              {selectedAllocation ? (
                <div className="space-y-2 text-xs">
                  <div className="p-2 bg-blue-50/80 border border-blue-200/80 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-blue-700 font-bold uppercase tracking-wider block">Candidate</span>
                      <strong className="text-slate-900 text-xs block truncate mt-0.5">
                        {selectedAllocation.student_name || (selectedAllocation as any).name || 'Assigned Candidate'}
                      </strong>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-blue-800 bg-white px-2 py-0.5 rounded border border-blue-200">
                      {selectedAllocation.reg_no}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-1.5 bg-slate-50 rounded border border-slate-200">
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">Department</span>
                      <strong className="text-slate-900 block truncate">{selectedAllocation.department}</strong>
                    </div>
                    <div className="p-1.5 bg-slate-50 rounded border border-slate-200">
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">Section</span>
                      <strong className="text-slate-900 block">Sec {selectedAllocation.section || 'A'}</strong>
                    </div>
                  </div>

                  {/* Conflict alert if flagged */}
                  {selectedAllocation.is_conflict ? (
                    <div className="p-2 bg-amber-50 border border-amber-300 rounded text-[11px] text-amber-900 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{selectedAllocation.conflict_reason || 'Spacing Conflict: adjacent desk shares identical section'}</span>
                    </div>
                  ) : (
                    <div className="pt-1 flex items-center justify-between text-[10px]">
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Conflict-Free Desk Separation Verified
                      </span>
                    </div>
                  )}

                  {/* Manual Rearrangement Control Buttons */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <Button
                      variant={rearrangeSourceKey === selectedSeatKey ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => {
                        if (rearrangeSourceKey === selectedSeatKey) {
                          setRearrangeSourceKey(null);
                        } else {
                          setRearrangeSourceKey(selectedSeatKey);
                          showToast('info', 'Move Mode Enabled', `Selected ${selectedAllocation.student_name} (${selectedSeatKey}). Click any destination desk or drag to move/swap.`);
                        }
                      }}
                      className={`w-full text-xs font-semibold py-1.5 cursor-pointer flex items-center justify-center gap-1.5 ${
                        rearrangeSourceKey === selectedSeatKey ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200' : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>{rearrangeSourceKey === selectedSeatKey ? 'Cancel Moving' : 'Move / Swap Student'}</span>
                    </Button>

                    {/* Quick Move by Coordinates Picker */}
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        Or Move by Coordinates:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1">
                          <label className="text-[10px] text-slate-500 block mb-0.5 font-medium">Row</label>
                          <select
                            value={targetRow}
                            onChange={(e) => setTargetRow(Number(e.target.value))}
                            className="w-full text-xs font-semibold p-1 bg-white border border-slate-300 rounded cursor-pointer"
                          >
                            {Array.from({ length: currentHall?.rows || 1 }).map((_, idx) => (
                              <option key={idx + 1} value={idx + 1}>Row {idx + 1}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex-1">
                          <label className="text-[10px] text-slate-500 block mb-0.5 font-medium">Column</label>
                          <select
                            value={targetCol}
                            onChange={(e) => setTargetCol(Number(e.target.value))}
                            className="w-full text-xs font-semibold p-1 bg-white border border-slate-300 rounded cursor-pointer"
                          >
                            {Array.from({ length: currentHall?.cols || 1 }).map((_, idx) => (
                              <option key={idx + 1} value={idx + 1}>Col {idx + 1}</option>
                            ))}
                          </select>
                        </div>

                        <div className="self-end">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isMoving || !selectedSeatKey || `R${targetRow}-C${targetCol}` === selectedSeatKey}
                            onClick={() => {
                              const destKey = `R${targetRow}-C${targetCol}`;
                              if (selectedSeatKey && destKey !== selectedSeatKey) {
                                handleDirectMove(selectedSeatKey, destKey);
                              }
                            }}
                            className="text-xs px-2.5 py-1 text-blue-700 border-blue-300 hover:bg-blue-50 font-bold"
                          >
                            <span>Move</span>
                          </Button>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {(() => {
                          const destKey = `R${targetRow}-C${targetCol}`;
                          const isDestBlocked = currentHall?.blocked_seats?.includes(destKey);
                          const destAlloc = currentArrangement?.allocations?.[destKey];
                          if (destKey === selectedSeatKey) return 'Destination matches current seat.';
                          if (isDestBlocked) return <span className="text-rose-600 font-semibold">⚠️ Destination is blocked</span>;
                          if (destAlloc) return <span className="text-purple-700 font-semibold">⇄ Will swap with {destAlloc.student_name}</span>;
                          return <span className="text-emerald-700 font-semibold">⇲ Move to vacant desk</span>;
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              ) : selectedSeatKey ? (
                <div className="space-y-2 text-xs">
                  <div className={`p-2 rounded-lg border flex items-center justify-between ${
                    currentHall?.blocked_seats?.includes(selectedSeatKey)
                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <div>
                      <span className="text-[9px] uppercase font-bold block">Status</span>
                      <strong className="text-xs">
                        {currentHall?.blocked_seats?.includes(selectedSeatKey) ? 'Blocked Desk' : 'Available / Vacant'}
                      </strong>
                    </div>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white border">
                      {selectedSeatKey}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {currentHall?.blocked_seats?.includes(selectedSeatKey)
                      ? 'This desk is reserved for structural aisle clearance or maintenance and cannot seat candidates.'
                      : 'This desk is currently empty. You can drag any student desk here, or select a student and click this desk to place them.'}
                  </p>

                  {rearrangeSourceKey && !currentHall?.blocked_seats?.includes(selectedSeatKey) && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleDirectMove(rearrangeSourceKey, selectedSeatKey)}
                      className="w-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <span>Move Student Here</span>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-slate-400 my-auto">
                  <Hash className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-slate-700">No Desk Selected</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 max-w-[200px] mx-auto">
                    Click any desk below to inspect student credentials or drag to move/swap seats
                  </p>
                </div>
              )}
            </Card>

            {/* Panel 3: Department Cohort Breakdown */}
            <Card className="p-4 bg-white border border-slate-200/90 rounded-xl shadow-xs space-y-2.5 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span>Department Cohort Breakdown</span>
                  <span className="text-[10px] text-slate-400 font-mono font-semibold">
                    {eligibleStudents.length} Total
                  </span>
                </h3>

                <div className="space-y-1.5 mt-2.5">
                  {Object.keys(deptDistribution).length > 0 ? (
                    Object.entries(deptDistribution).map(([dept, count]) => (
                      <div key={dept} className="flex items-center justify-between text-xs p-1.5 bg-slate-50 rounded border border-slate-200">
                        <span className="font-semibold text-slate-700 truncate">{dept}</span>
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {count} Seated
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs text-slate-500">
                      <span>{currentExam ? `${currentExam.department} (${eligibleStudents.length} candidates awaiting allocation)` : 'No active cohort selected'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Engine Status micro-banner */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1 font-medium text-slate-600">
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  Section Disjoint Rules Active
                </span>
                <span className="text-[10px] font-mono text-emerald-600 font-bold">
                  0 Copied
                </span>
              </div>
            </Card>
          </div>

          {/* MAIN PROMINENT EXAMINATION HALL FLOOR PLAN (Full Width of Right Zone) */}
          <Card className="p-5 bg-white border border-slate-200/90 rounded-xl shadow-xs">
            {/* Floor Plan Header with Venue details & quick actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 mb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <span>Examination Hall Floor Plan: {currentHall?.name}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Architectural top-down CAD view with front blackboard, entrance doors, aisle clearances, and assigned desks
                </p>
              </div>

              {/* Floor Plan Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCsv}
                  disabled={!activeDisplayArrangement || isResetDraft}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs px-2.5 py-1.5 shadow-2xs font-semibold cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  <span>Export CSV</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  disabled={!activeDisplayArrangement || isResetDraft}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs px-2.5 py-1.5 shadow-2xs font-semibold cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 mr-1" />
                  <span>Print Chart</span>
                </Button>
              </div>
            </div>

            {/* Architectural Seating Floor Plan Visual with plenty of horizontal space */}
            {currentHall ? (
              <div className="w-full bg-slate-100/50 p-2 sm:p-5 rounded-xl border border-slate-200 overflow-x-auto">
                <SeatGrid
                  hall={currentHall}
                  allocations={activeDisplayArrangement?.allocations}
                  interactive={!isResetDraft}
                  onSelectSeat={(key: string) => {
                    setSelectedSeatKey(key);
                    const m = key.match(/R(\d+)-C(\d+)/);
                    if (m) {
                      setTargetRow(parseInt(m[1], 10));
                      setTargetCol(parseInt(m[2], 10));
                    }
                  }}
                  selectedSeatKey={selectedSeatKey}
                  exam={currentExam}
                  onMoveOrSwapSeat={(fromKey, toKey) => handleDirectMove(fromKey, toKey)}
                  rearrangeSourceKey={rearrangeSourceKey}
                  onSetRearrangeSourceKey={setRearrangeSourceKey}
                />
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400">
                <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold">Select an examination hall to load its architectural floor plan</p>
              </div>
            )}

            {/* Bottom Status / Unassigned banner */}
            {activeDisplayArrangement && (activeDisplayArrangement.unassigned_students?.length || 0) > 0 && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>
                    <strong>{activeDisplayArrangement.unassigned_students.length} candidates</strong> could not be accommodated in this hall.
                  </span>
                </div>
                <button
                  onClick={() => setIsUnassignedModalOpen(true)}
                  className="font-bold text-amber-700 hover:text-amber-900 underline cursor-pointer"
                >
                  View Unassigned List →
                </button>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Unassigned Students Modal */}
      <Modal
        isOpen={isUnassignedModalOpen}
        onClose={() => setIsUnassignedModalOpen(false)}
        title="Unassigned Candidates"
        description="These students could not be seated in this examination hall due to desk capacity constraints."
      >
        <div className="space-y-3">
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 border rounded-lg border-slate-200">
            {(activeDisplayArrangement?.unassigned_students || []).map((st, idx) => (
              <div key={st?.id || st?.reg_no || idx} className="p-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">{st?.name || 'Student'}</p>
                  <p className="text-[11px] text-slate-500 font-mono">{st?.reg_no || '—'}</p>
                </div>
                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {st?.department || 'General'} · Sem {st?.semester || 1}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end">
            <Button
              type="button"
              variant="primary"
              onClick={() => setIsUnassignedModalOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        title="Reset Current Seating Plan?"
        description="Clear working seating assignments while preserving hall geometry."
      >
        <div className="space-y-4 text-xs text-slate-600">
          <p>
            Are you sure you want to reset the current seating plan for <strong>{currentExam?.name} ({currentExam?.code})</strong>?
          </p>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 space-y-1">
            <p className="font-bold">What happens during reset:</p>
            <ul className="list-disc pl-4 space-y-1 text-[11px]">
              <li>All student desk assignments in this view will be cleared.</li>
              <li>Hall dimensions, layout, and blocked seats remain preserved.</li>
              <li>The reset will be marked as <strong>unsaved</strong>.</li>
              <li>
                <strong>The saved arrangement is NOT permanently deleted</strong> until you explicitly click <strong>"Save Reset"</strong>.
              </li>
              <li>The hall reservation remains active until the reset is saved.</li>
            </ul>
          </div>
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsResetConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
              onClick={handleConfirmReset}
            >
              Confirm Reset
            </Button>
          </div>
        </div>
      </Modal>

      {/* Unsaved Changes Leave Warning Modal */}
      <Modal
        isOpen={isLeaveWarningOpen}
        onClose={() => {
          setIsLeaveWarningOpen(false);
          setPendingExamSwitchId(null);
        }}
        title="Unsaved Changes Warning"
        description="You have unsaved changes to the current seating arrangement."
      >
        <div className="space-y-4 text-xs text-slate-600">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">You have unsaved changes!</p>
              <p className="text-[11px] mt-0.5">
                If you switch examinations without saving, your unsaved manual moves, swaps, or plan resets will not be saved to persistent storage.
              </p>
            </div>
          </div>
          <p>
            Would you like to stay and save your changes, or discard unsaved changes and switch?
          </p>
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsLeaveWarningOpen(false);
                setPendingExamSwitchId(null);
              }}
            >
              Stay on Current Plan
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold"
              onClick={() => {
                if (pendingExamSwitchId) {
                  setSelectedExamId(pendingExamSwitchId);
                  setIsResetDraft(false);
                  setSelectedSeatKey(null);
                }
                setIsLeaveWarningOpen(false);
                setPendingExamSwitchId(null);
              }}
            >
              Discard & Switch
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
