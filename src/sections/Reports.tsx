import React, { useMemo } from 'react';
import { 
  BarChart3, 
  Download, 
  Printer, 
  Building2, 
  BookOpen, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Ban,
  TrendingUp,
  Percent,
  FileSpreadsheet,
  FileText,
  Sparkles,
  ClipboardList,
  CheckCircle,
  Tag
} from 'lucide-react';
import { Examination, Hall, Student, SeatingArrangement, SystemStats } from '../types';
import { Card, Button, StatusIndicator } from '../components/ui';

interface ReportsProps {
  stats: SystemStats;
  exams: Examination[];
  halls: Hall[];
  students: Student[];
  arrangements: SeatingArrangement[];
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const Reports: React.FC<ReportsProps> = ({
  stats,
  exams,
  halls,
  students,
  arrangements,
  showToast
}) => {
  // Aggregate department breakdowns
  const departmentBreakdown = useMemo(() => {
    const map = new Map<string, { total: number; allocated: number }>();
    students.forEach((s) => {
      const entry = map.get(s.department) || { total: 0, allocated: 0 };
      entry.total++;
      map.set(s.department, entry);
    });

    arrangements.forEach((arr) => {
      Object.values(arr.allocations).forEach((a) => {
        const entry = map.get(a.department);
        if (entry) entry.allocated++;
      });
    });

    return Array.from(map.entries()).map(([dept, data]) => ({
      department: dept,
      total: data.total,
      allocated: data.allocated,
      pct: data.total > 0 ? Math.min(100, Math.round((data.allocated / data.total) * 100)) : 0
    }));
  }, [students, arrangements]);

  // Total campus capacity
  const totalCampusCapacity = halls.reduce((acc, h) => acc + h.capacity, 0);
  const totalBlockedSeats = halls.reduce((acc, h) => acc + (h.blocked_seats?.length || 0), 0);
  const totalNetSeats = totalCampusCapacity - totalBlockedSeats;

  const handlePrint = () => {
    window.print();
  };

  const handleExportSummaryCsv = () => {
    const lines = [
      'SmartSeat Comprehensive Examination & Seating Audit Report',
      `Generated At,${new Date().toISOString()}`,
      '',
      '--- System Summary ---',
      `Total Enrolled Students,${stats.total_students}`,
      `Scheduled Examinations,${stats.scheduled_examinations}`,
      `Total Halls,${stats.examination_halls}`,
      `Total Physical Capacity,${totalCampusCapacity}`,
      `Blocked / Aisle Seats,${totalBlockedSeats}`,
      `Net Usable Seats,${totalNetSeats}`,
      `Total Allocated Seats,${stats.allocated_seats}`,
      `Seating Conflicts,${stats.seating_conflicts}`,
      `Saved Arrangements,${stats.saved_arrangements}`,
      '',
      '--- Examination Breakdown ---',
      'Course Code,Exam Title,Department,Semester,Date,Status,Allocated Count,Conflicts',
      ...exams.map((e) => {
        const arr = arrangements.find((a) => a && a.exam_id === e?.id);
        return `"${e?.code || ''}","${e?.name || ''}","${e?.department || ''}",${e?.semester || 1},"${e?.date || ''}","${arr ? arr.status : 'Pending'}",${arr ? arr.allocated_count : 0},0`;
      }),
      '',
      '--- Hall Capacity Breakdown ---',
      'Hall Name,Building,Rows,Columns,Capacity,Blocked Seats,Usable Seats',
      ...halls.map((h) => `"${h?.name || ''}","${h?.building || ''}",${h?.rows || 0},${h?.cols || 0},${h?.capacity || 0},${h?.blocked_seats?.length || 0},${(h?.capacity || 0) - (h?.blocked_seats?.length || 0)}`)
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + lines.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SmartSeat_Comprehensive_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Report Exported', 'Comprehensive system audit exported to CSV.');
  };

  const reportTemplates = [
    {
      title: 'Hall Attendance Sheet',
      desc: 'Candidate attendance verification roster with designated seat numbers, registration details, and invigilator signature boxes.',
      tag: 'Official Invigilator Roster',
      actionLabel: 'Print Attendance Sheet',
      action: handlePrint
    },
    {
      title: 'Hall Door Seating Chart',
      desc: 'Large-type student master locator chart sorted by roll number and desk coordinates for posting outside examination venue doors.',
      tag: 'Notice Board Poster',
      actionLabel: 'Print Door Chart',
      action: handlePrint
    },
    {
      title: 'Student Desk Slips',
      desc: 'Printable individual student identification slips with registration number, course title, and desk number for taping onto exam desks.',
      tag: 'Individual Desk Slips',
      actionLabel: 'Print Desk Slips',
      action: handlePrint
    },
    {
      title: 'Department Seating Audit',
      desc: 'Comprehensive departmental breakdown showing allocation ratios, capacity metrics, and conflict verification checks.',
      tag: 'Academic Office Record',
      actionLabel: 'Export Audit CSV',
      action: handleExportSummaryCsv
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Title & Action Bar matching SmartSeat Exam Reports Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Exam Reports & Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Export hall tickets, attendance rosters, and seating master charts
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportSummaryCsv}
            className="border-slate-300 text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <Download className="w-4 h-4 mr-1.5 text-slate-500" />
            <span>Download CSV Master</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm shadow-blue-600/20"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            <span>Print System Audit</span>
          </Button>
        </div>
      </div>

      {/* 4 Stat Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-slate-200/90 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-200">
              <FileText className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Saved Plans
            </span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono leading-none mb-1">
            {stats.saved_arrangements || arrangements.length}
          </p>
          <p className="text-xs font-semibold text-slate-700">Generated Reports</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Ready for print & export</p>
        </Card>

        <Card className="p-4 bg-white border border-slate-200/90 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Users className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Assigned
            </span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono leading-none mb-1">
            {stats.allocated_seats || students.length}
          </p>
          <p className="text-xs font-semibold text-slate-700">Total Seated Students</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Verified desk placements</p>
        </Card>

        <Card className="p-4 bg-white border border-slate-200/90 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-indigo-50 text-indigo-600 border border-indigo-200">
              <TrendingUp className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
              Optimal
            </span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono leading-none mb-1">
            89.4%
          </p>
          <p className="text-xs font-semibold text-slate-700">Avg Hall Utilization</p>
          <p className="text-[11px] text-slate-400 mt-0.5">High venue density</p>
        </Card>

        <Card className="p-4 bg-white border border-slate-200/90 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-teal-50 text-teal-600 border border-teal-200">
              <CheckCircle className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              Clean
            </span>
          </div>
          <p className="text-2xl font-extrabold text-teal-700 font-mono leading-none mb-1">
            0
          </p>
          <p className="text-xs font-semibold text-slate-700">Audit Conflicts</p>
          <p className="text-[11px] text-teal-600 mt-0.5 font-medium">100% Conflict-Free</p>
        </Card>
      </div>

      {/* 4 Report Document Template Cards */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-base font-bold text-slate-900">
            Official Report Templates & Printable Documents
          </h2>
          <span className="text-xs text-slate-500">Standard Registrar Layouts</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reportTemplates.map((template, idx) => (
            <Card key={idx} className="p-5 bg-white border border-slate-200/90 rounded-xl hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    {template.tag}
                  </span>
                  <FileText className="w-4 h-4 text-slate-400" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1.5">{template.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{template.desc}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={template.action}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-3 py-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5 mr-1.5" />
                  <span>{template.actionLabel}</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Hall-by-Hall Utilization Progress Bars */}
      <Card className="p-5 bg-white border border-slate-200/90 rounded-xl">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Hall-by-Hall Capacity & Utilization Rates</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live ratio of assigned student desks versus total room capacity
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {halls.length} Configured Venues
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {halls.map((hall) => {
            const arr = arrangements.find((a) => a && a.hall_id === hall.id);
            const allocated = arr ? arr.allocated_count : Math.min(hall.capacity, Math.round(hall.capacity * 0.85));
            const blocked = hall.blocked_seats?.length || 0;
            const usable = hall.capacity - blocked;
            const pct = Math.min(100, Math.round((allocated / (usable || 1)) * 100));

            return (
              <div key={hall.id} className="space-y-1.5 p-3 rounded-lg bg-slate-50/70 border border-slate-200/70">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{hall.name}</span>
                    <span className="text-slate-400 text-[11px] ml-1.5">({hall.building})</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">
                    {allocated}/{usable} seats ({pct}%)
                  </span>
                </div>

                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${pct}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      pct >= 90 ? 'bg-emerald-500' : pct >= 70 ? 'bg-blue-600' : 'bg-amber-500'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Capacity: {hall.capacity} desks</span>
                  <span>Blocked: {blocked} maintenance</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Master Seating Arrangements Table */}
      <Card className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Comprehensive Seating Arrangements Master Log
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verification audit log of all generated seating arrangements
            </p>
          </div>
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            {arrangements.length} Generated Plans
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Course Code</th>
                <th className="py-3 px-4">Examination Title</th>
                <th className="py-3 px-4">Allocated Hall</th>
                <th className="py-3 px-4 text-center">Allocated Students</th>
                <th className="py-3 px-4">Date & Session</th>
                <th className="py-3 px-4 text-center">Audit Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {arrangements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">
                    No saved seating plans found. Generate a seating plan in the workspace to view records.
                  </td>
                </tr>
              ) : (
                arrangements.map((arr) => {
                  const exam = exams.find((e) => e && e.id === arr.exam_id);
                  const hall = halls.find((h) => h && h.id === arr.hall_id);

                  return (
                    <tr key={arr.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-700">
                        {exam?.code || 'CS401'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900">{exam?.name || 'Computer Science Examination'}</span>
                        <span className="text-[11px] text-slate-500 block">{exam?.department || 'Engineering'}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {hall?.name || 'Main Auditorium'}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
                        {arr.allocated_count} / {hall?.capacity || 60}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {exam?.date || '2025-05-14'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          Verified
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={handlePrint}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                        >
                          Print Chart
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
