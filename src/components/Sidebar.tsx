import React from 'react';
import { 
  GraduationCap, 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Building2, 
  Grid3X3, 
  BarChart3, 
  Cpu,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { EngineStatus, User } from '../types';

export type SectionId = 'overview' | 'students' | 'examinations' | 'halls' | 'generate' | 'reports';

interface SidebarProps {
  activeSection: SectionId;
  onNavigate: (sectionId: SectionId) => void;
  engineStatus: EngineStatus | null;
  onOpenEngineModal: () => void;
  currentUser?: User | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onNavigate,
  engineStatus,
  onOpenEngineModal,
  currentUser
}) => {
  const navItems: { id: SectionId; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'examinations', label: 'Examinations', icon: BookOpen },
    { id: 'halls', label: 'Examination Halls', icon: Building2 },
    { id: 'generate', label: 'Generate Seating', icon: Grid3X3 },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-[#0B1528] text-slate-300 flex flex-col h-screen shrink-0 sticky top-0 border-r border-slate-800/90 shadow-[2px_0_12px_rgba(0,0,0,0.16)] select-none z-30">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/70">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 ring-1 ring-blue-400/30 shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              SmartSeat
            </h1>
            <p className="text-[11px] font-medium text-slate-400 tracking-wider uppercase">
              Exam Seating Management
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3.5 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 mb-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Menu Navigation
          </span>
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer text-left ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-[0_2px_8px_rgba(37,99,235,0.35)] ring-1 ring-blue-400/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70 hover:translate-x-0.5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-blue-200" />}
            </button>
          );
        })}

        {/* Engine Status Callout in Sidebar */}
        <div className="pt-6 px-1">
          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800/90">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                Seating Engine
              </span>
              <span className="inline-flex items-center text-[10px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                Active
              </span>
            </div>
            <p className="text-xs font-medium text-slate-200 truncate">
              {engineStatus?.active_engine === 'c_engine' ? 'C Binary (GCC -O3)' : 'Python Fallback'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
              Bipartite graph separation
            </p>
            <button
              onClick={onOpenEngineModal}
              className="mt-2.5 w-full text-left text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center justify-between pt-1.5 border-t border-slate-800/80 cursor-pointer"
            >
              <span>Algorithm Specs</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </nav>

      {/* University Office & Administrator Profile Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-[#080F1E]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0 border border-blue-400/30">
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate flex items-center gap-1">
              {currentUser?.name || 'Administrator'}
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {currentUser?.role || 'Examinations Officer'}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {currentUser?.department || 'Office of Academic Affairs'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
