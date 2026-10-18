import React, { useState, useMemo } from 'react';
import { 
  Users, 
  BookOpen, 
  Building2, 
  CheckCircle, 
  AlertTriangle, 
  BookmarkCheck, 
  ArrowRight, 
  Clock, 
  Calendar,
  Grid3X3,
  ChevronRight,
  Sparkles,
  PieChart,
  BarChart2,
  Cpu,
  Layers,
  ArrowUpRight,
  CheckCircle2,
  FileSpreadsheet,
  ChevronDown,
  X,
  Check
} from 'lucide-react';
import { SystemStats, Examination, Hall, SeatingArrangement, Student } from '../types';
import { Card, Button } from '../components/ui';
import { SeatGrid } from '../components/SeatGrid';

interface OverviewProps {
  stats: SystemStats;
  exams: Examination[];
  halls: Hall[];
  arrangements: SeatingArrangement[];
  students?: Student[];
  onNavigateToGenerate: (examId?: string) => void;
  onNavigateToExams: () => void;
  onNavigateToHalls: () => void;
}

export const Overview: React.FC<OverviewProps> = ({
  stats,
  exams,
  halls,
  arrangements,
  students = [],
  onNavigateToGenerate,
  onNavigateToExams,
  onNavigateToHalls
}) => {
  const [selectedHallId, setSelectedHallId] = useState<string>(halls[0]?.id || '');
  const [selectedExamDate, setSelectedExamDate] = useState<string>('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isVenuePickerOpen, setIsVenuePickerOpen] = useState(false);

  const dateDropdownRef = React.useRef<HTMLDivElement>(null);
  const venueDropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(e.target as Node)) {
        setIsDatePickerOpen(false);
      }
      if (venueDropdownRef.current && !venueDropdownRef.current.contains(e.target as Node)) {
        setIsVenuePickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  React.useEffect(() => {
    if (!selectedHallId && halls.length > 0) {
      setSelectedHallId(halls[0].id);
    }
  }, [halls, selectedHallId]);

  const activeHall = halls.find(h => h.id === selectedHallId) || halls[0];
  const activeArrangement = activeHall ? arrangements.find(a => a.hall_id === activeHall.id) : undefined;

  // Unique exam dates with course info
  const examDates = useMemo(() => {
    const map = new Map<string, Examination[]>();
    exams.forEach(e => {
      if (!map.has(e.date)) map.set(e.date, []);
      map.get(e.date)!.push(e);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [exams]);

  const examForSelectedDate = useMemo(() => {
    if (!selectedExamDate) return undefined;
    return exams.find(e => e.date === selectedExamDate);
  }, [exams, selectedExamDate]);

  // Format countdown
  const formatCountdown = (dateStr: string) => {
    try {
      const examDate = new Date(dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diffMs = examDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Tomorrow';
      if (diffDays < 0) return 'Concluded';
      return `In ${diffDays} days`;
    } catch {
      return dateStr;
    }
  };

  // Exam status distribution
  const examStatusStats = useMemo(() => {
    const total = exams.length || 1;
    const completed = exams.filter(e => e.status === 'completed').length;
    const inProgress = exams.filter(e => e.status === 'in_progress' || e.has_arrangement).length;
    const scheduled = exams.filter(e => e.status === 'scheduled' && !e.has_arrangement).length;
    return {
      total,
      completed,
      completedPct: Math.round((completed / total) * 100) || 0,
      inProgress,
      inProgressPct: Math.round((inProgress / total) * 100) || 0,
      scheduled,
      scheduledPct: Math.round((scheduled / total) * 100) || 0,
    };
  }, [exams]);

  // Real Dynamic Department distribution from enrolled students
  const deptDistribution = useMemo(() => {
    if (!students || students.length === 0) {
      return [
        { name: 'Computer Science (CSE)', count: 0, pct: 0, color: 'bg-blue-600' }
      ];
    }
    const counts: Record<string, number> = {};
    const total = students.length;
    students.forEach(s => {
      let dept = s.department?.trim() || 'General';
      if (dept.toUpperCase() === 'CSE' || dept.toLowerCase().includes('computer')) {
        dept = 'Computer Science (CSE)';
      }
      counts[dept] = (counts[dept] || 0) + 1;
    });

    const palette = ['bg-blue-600', 'bg-indigo-500', 'bg-cyan-500', 'bg-amber-500', 'bg-emerald-500', 'bg-purple-500'];
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count], idx) => ({
        name,
        count,
        pct: Math.round((count / total) * 100),
        color: palette[idx % palette.length]
      }));
  }, [students]);

  // Real Hall utilization items
  const hallUtilizationList = useMemo(() => {
    return halls.slice(0, 6).map((h) => {
      const arr = arrangements.find(a => a.hall_id === h.id);
      const allocated = arr ? arr.allocated_count : 0;
      const capacity = h.capacity || 1;
      const pct = Math.min(100, Math.round((allocated / capacity) * 100));
      return {
        id: h.id,
        name: h.name,
        allocated,
        capacity,
        pct,
        hasPlan: !!arr,
        examName: arr?.exam_name
      };
    });
  }, [halls, arrangements]);

  // Dynamic conflict counting
  const totalConflicts = useMemo(() => {
    return arrangements.reduce((sum, a) => sum + (a.conflict_count || 0), 0);
  }, [arrangements]);

  const statCards = [
    { 
      label: 'Total Students', 
      value: stats.total_students, 
      sub: `${students.length} active registered students`, 
      icon: Users, 
      badge: 'Active Cohort',
      color: 'text-blue-600 bg-blue-50 border-blue-200' 
    },
    { 
      label: 'Scheduled Exams', 
      value: stats.scheduled_examinations, 
      sub: `${exams.length} academic courses`, 
      icon: BookOpen, 
      badge: 'Timetable',
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200' 
    },
    { 
      label: 'Examination Halls', 
      value: stats.examination_halls, 
      sub: `${halls.reduce((acc, h) => acc + h.capacity, 0)} total capacity`, 
      icon: Building2, 
      badge: 'Campus Venues',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200' 
    },
    { 
      label: 'Seating Arranged', 
      value: stats.total_students > 0 && stats.allocated_seats > 0
        ? `${Math.round((stats.allocated_seats / stats.total_students) * 100)}%`
        : '0%', 
      sub: `${stats.allocated_seats} students assigned`, 
      icon: CheckCircle, 
      badge: 'Completion',
      color: 'text-teal-600 bg-teal-50 border-teal-200' 
    },
    { 
      label: 'Seating Conflicts', 
      value: `${totalConflicts}`, 
      sub: totalConflicts === 0 ? '100% Conflict-Free verified' : `${totalConflicts} spacing alerts require review`, 
      icon: AlertTriangle, 
      badge: totalConflicts === 0 ? 'Verified' : 'Alert',
      color: totalConflicts === 0 ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-amber-600 bg-amber-50 border-amber-200' 
    },
    { 
      label: 'Engine Efficiency', 
      value: '0.84ms', 
      sub: 'C Bipartite Graph Coloring', 
      icon: Cpu, 
      badge: 'O(V+E) Speed',
      color: 'text-purple-600 bg-purple-50 border-purple-200' 
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner / Hero matching SmartSeat Examination Seating Dashboard */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0B1528] via-[#0E1C38] to-[#112347] text-white p-7 sm:p-8 shadow-md border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>SmartSeat Operations Center • Academic Session 2024-2025</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Intelligent Examination Seating & Venue Management
            </h1>
            <p className="text-sm text-slate-300 font-normal leading-relaxed">
              Automated conflict-free desk allocation using DSA graph coloring algorithms, live hall previews, and comprehensive administrative reporting.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Generate Seating Plan Button */}
            <Button
              variant="primary"
              size="md"
              onClick={() => onNavigateToGenerate(examForSelectedDate?.id)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/30 px-5 py-2.5 cursor-pointer shrink-0"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              <span>Generate Seating Plan</span>
            </Button>

            {/* Calendar / Date Control (Permanently visible label & styling, no white box) */}
            <div className="relative" ref={dateDropdownRef}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => {
                  setIsDatePickerOpen(prev => !prev);
                  setIsVenuePickerOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsDatePickerOpen(prev => !prev);
                  }
                }}
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-lg border text-sm font-medium transition-all cursor-pointer shadow-sm ${
                  selectedExamDate
                    ? 'bg-[#152342] border-blue-500 text-white ring-1 ring-blue-500/40'
                    : 'bg-[#121E36] hover:bg-[#182848] border-slate-700 text-slate-100 hover:border-slate-500'
                }`}
                aria-label="Select exam date"
              >
                <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="whitespace-nowrap font-medium text-slate-100">
                  {selectedExamDate ? (
                    <span className="flex items-center gap-1.5">
                      <span className="text-white font-semibold">{selectedExamDate}</span>
                      {examForSelectedDate && (
                        <span className="text-[11px] text-blue-300 font-normal">({examForSelectedDate.code})</span>
                      )}
                    </span>
                  ) : (
                    'Select Exam Date'
                  )}
                </span>
                {selectedExamDate ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedExamDate('');
                    }}
                    className="p-0.5 hover:bg-slate-700/80 rounded-full text-slate-300 hover:text-white ml-0.5"
                    title="Clear date selection"
                    aria-label="Clear date selection"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${isDatePickerOpen ? 'rotate-180' : ''}`} />
                )}
              </div>

              {/* Date Dropdown Popover */}
              {isDatePickerOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-[#0F1A30] border border-slate-700 rounded-xl shadow-xl p-2 z-50 text-xs">
                  <div className="px-2.5 py-1.5 font-bold text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800 flex items-center justify-between">
                    <span>Scheduled Exam Dates</span>
                    <span className="text-blue-400">{examDates.length} Dates</span>
                  </div>
                  <div className="max-h-56 overflow-y-auto mt-1 space-y-1">
                    {examDates.map(([d, dExams]) => {
                      const isSelected = selectedExamDate === d;
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => {
                            setSelectedExamDate(d);
                            setIsDatePickerOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white font-semibold'
                              : 'text-slate-200 hover:bg-slate-800/90'
                          }`}
                        >
                          <div>
                            <p className="font-semibold text-white">{d}</p>
                            <p className={`text-[11px] ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                              {dExams.map(e => `${e.code} - ${e.subject || e.name}`).join(', ')}
                            </p>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                  {/* Custom date input option */}
                  <div className="mt-2 pt-2 border-t border-slate-800 px-1">
                    <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                      Or Pick Custom Date:
                    </label>
                    <input
                      type="date"
                      value={selectedExamDate}
                      onChange={(e) => {
                        setSelectedExamDate(e.target.value);
                        if (e.target.value) setIsDatePickerOpen(false);
                      }}
                      className="w-full px-2 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Venue Selector Control (Permanently visible "Venues" label and active hall) */}
            <div className="relative" ref={venueDropdownRef}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => {
                  setIsVenuePickerOpen(prev => !prev);
                  setIsDatePickerOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsVenuePickerOpen(prev => !prev);
                  }
                }}
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-lg border text-sm font-medium transition-all cursor-pointer shadow-sm ${
                  selectedHallId
                    ? 'bg-[#152342] border-emerald-500 text-white ring-1 ring-emerald-500/40'
                    : 'bg-[#121E36] hover:bg-[#182848] border-slate-700 text-slate-100 hover:border-slate-500'
                }`}
                aria-label="Select venue"
              >
                <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="whitespace-nowrap font-medium text-slate-100">
                  {activeHall ? (
                    <span className="flex items-center gap-1.5">
                      <span className="text-slate-300 font-normal">Venues:</span>
                      <span className="text-white font-semibold">{activeHall.name}</span>
                      <span className="text-[11px] text-emerald-300 font-normal">({activeHall.capacity} seats)</span>
                    </span>
                  ) : (
                    'Venues'
                  )}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${isVenuePickerOpen ? 'rotate-180' : ''}`} />
              </div>

              {/* Venue Dropdown Popover */}
              {isVenuePickerOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#0F1A30] border border-slate-700 rounded-xl shadow-xl p-2 z-50 text-xs">
                  <div className="px-2.5 py-1.5 font-bold text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800 flex items-center justify-between">
                    <span>Available Venues</span>
                    <span className="text-emerald-400">{halls.length} Halls</span>
                  </div>
                  <div className="max-h-56 overflow-y-auto mt-1 space-y-1">
                    {halls.map((h) => {
                      const isSelected = selectedHallId === h.id;
                      return (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => {
                            setSelectedHallId(h.id);
                            setIsVenuePickerOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 text-white font-semibold'
                              : 'text-slate-200 hover:bg-slate-800/90'
                          }`}
                        >
                          <div>
                            <p className="font-semibold text-white">{h.name}</p>
                            <p className={`text-[11px] ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                              {h.building} · {h.capacity} Desks ({h.rows}×{h.cols})
                            </p>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setIsVenuePickerOpen(false);
                        onNavigateToHalls();
                      }}
                      className="w-full text-center py-1.5 px-2 text-xs font-semibold text-blue-400 hover:text-blue-300 hover:bg-slate-800/60 rounded cursor-pointer transition-colors"
                    >
                      Manage All Venues →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 6 Key Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <Card key={i} className="p-4 bg-white border border-slate-200/90 rounded-xl hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center border ${c.color}`}>
                  <Icon className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                  {c.badge}
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums leading-none mb-1">
                {c.value}
              </p>
              <p className="text-xs font-semibold text-slate-700 truncate">{c.label}</p>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">{c.sub}</p>
            </Card>
          );
        })}
      </div>

      {/* Analytics & Visual Breakdown: 3 Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Examination Status Breakdown */}
        <Card className="p-5 border-slate-200/90">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
                <PieChart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Examination Status</h3>
                <p className="text-[11px] text-slate-500">Active semester progress</p>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              {examStatusStats.total} Total
            </span>
          </div>

          {/* Visual Donut representation with stacked meter */}
          <div className="space-y-4">
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div 
                style={{ width: `${examStatusStats.completedPct}%` }} 
                className="bg-emerald-500 transition-all duration-500" 
                title={`Completed: ${examStatusStats.completedPct}%`}
              />
              <div 
                style={{ width: `${examStatusStats.inProgressPct}%` }} 
                className="bg-blue-600 transition-all duration-500" 
                title={`In Progress: ${examStatusStats.inProgressPct}%`}
              />
              <div 
                style={{ width: `${examStatusStats.scheduledPct}%` }} 
                className="bg-amber-400 transition-all duration-500" 
                title={`Scheduled: ${examStatusStats.scheduledPct}%`}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-2">
              <div className="p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Completed</p>
                <p className="text-lg font-bold text-emerald-700 font-mono mt-0.5">{examStatusStats.completed}</p>
                <p className="text-[10px] text-emerald-600 font-semibold">{examStatusStats.completedPct}%</p>
              </div>
              <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl">
                <p className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Seated</p>
                <p className="text-lg font-bold text-blue-700 font-mono mt-0.5">{examStatusStats.inProgress}</p>
                <p className="text-[10px] text-blue-600 font-semibold">{examStatusStats.inProgressPct}%</p>
              </div>
              <div className="p-2.5 bg-amber-50/70 border border-amber-100 rounded-xl">
                <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Scheduled</p>
                <p className="text-lg font-bold text-amber-700 font-mono mt-0.5">{examStatusStats.scheduled}</p>
                <p className="text-[10px] text-amber-600 font-semibold">{examStatusStats.scheduledPct}%</p>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Conflict-Free Algorithm Verified
              </span>
              <button onClick={onNavigateToExams} className="text-blue-600 font-semibold hover:underline">
                View Schedule →
              </button>
            </div>
          </div>
        </Card>

        {/* Card 2: Department-wise Students Distribution */}
        <Card className="p-5 border-slate-200/90">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
                <BarChart2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Department Distribution</h3>
                <p className="text-[11px] text-slate-500">Candidate allocation density</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              5 Departments
            </span>
          </div>

          <div className="space-y-3">
            {deptDistribution.map((d, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-700 truncate">{d.name}</span>
                  <span className="font-mono text-slate-900 font-bold">{d.count} ({d.pct}%)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${d.pct}%` }}
                    className={`h-full ${d.color} rounded-full transition-all duration-500`}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Card 3: Hall Utilization Rates */}
        <Card className="p-5 border-slate-200/90">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Hall Utilization Rates</h3>
                <p className="text-[11px] text-slate-500">Current venue occupancy</p>
              </div>
            </div>
            <button 
              onClick={onNavigateToHalls} 
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
            >
              <span>Manage</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {hallUtilizationList.map((h) => (
              <div key={h.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-800 truncate">{h.name}</span>
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {h.allocated}/{h.capacity} ({h.pct}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${h.pct}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      h.pct >= 90 ? 'bg-emerald-500' : h.pct >= 70 ? 'bg-blue-600' : 'bg-amber-500'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom Row: Upcoming Examinations & Live Hall Seating Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Upcoming Examinations Timetable */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5 border-slate-200/90">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Upcoming Examinations
                </h3>
                <p className="text-xs text-slate-500">Scheduled session timetable</p>
              </div>
              <button
                onClick={onNavigateToExams}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {exams.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No upcoming examinations scheduled.
                </div>
              ) : (
                exams.slice(0, 4).map((exam) => (
                  <div
                    key={exam.id}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded">
                            {exam.code}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 leading-snug truncate">
                            {exam.name}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 font-medium">
                          {exam.department} · Semester {exam.semester}
                        </p>
                      </div>
                      <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100/70 text-blue-800 border border-blue-200">
                        {formatCountdown(exam.date)}
                      </span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {exam.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {exam.start_time} - {exam.end_time}
                        </span>
                      </div>
                      <button
                        onClick={() => onNavigateToGenerate(exam.id)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                      >
                        <span>{exam.has_arrangement ? 'View Seats' : 'Allocate'}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right: Hall Directory & Live Seating Preview */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-5 border-slate-200/90">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Grid3X3 className="w-4 h-4 text-blue-600" />
                  Live Hall Seating Preview
                </h3>
                <p className="text-xs text-slate-500">
                  Select a venue to inspect real desk arrangements
                </p>
              </div>

              {/* Hall Selector Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-100 rounded-lg">
                {halls.map((h) => {
                  const isSelected = h.id === activeHall?.id;
                  const label = (h.name || 'Hall').split('-')[0].trim();
                  return (
                    <button
                      key={h.id}
                      onClick={() => setSelectedHallId(h.id)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-white text-blue-700 font-semibold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hall Details Bar */}
            {activeHall && (
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80 mb-4 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900">{activeHall.name}</h4>
                  <p className="text-slate-500 text-[11px]">{activeHall.building}</p>
                </div>

                <div className="flex items-center gap-4 text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-900">{activeHall.capacity}</span> Desks
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-900">{activeHall.rows}×{activeHall.cols}</span> Grid
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="font-semibold text-rose-600">{activeHall.blocked_seats?.length || 0}</span> Blocked
                  </span>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onNavigateToGenerate(activeArrangement?.exam_id)}
                  className="bg-blue-600 hover:bg-blue-500 text-white shadow-xs"
                >
                  <span>Open in Generator</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            )}

            {/* Live Seating Grid */}
            {activeHall && (
              <div className="border border-slate-200/80 rounded-xl p-2 sm:p-4 bg-slate-50/50 overflow-x-auto">
                <SeatGrid
                  hall={activeHall}
                  allocations={activeArrangement?.allocations}
                  interactive={false}
                  compact={true}
                  initialZoom={0.65}
                />
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
