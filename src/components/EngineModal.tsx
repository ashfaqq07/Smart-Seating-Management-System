import React from 'react';
import { Cpu, CheckCircle2, ShieldCheck, FileCode, Layers, Zap, Network } from 'lucide-react';
import { EngineStatus } from '../types';
import { Modal } from './Modal';
import { Button } from './ui';

interface EngineModalProps {
  isOpen: boolean;
  onClose: () => void;
  engineStatus: EngineStatus | null;
  onSetEnginePreference: (engine: 'c_engine' | 'python_fallback') => Promise<void>;
}

export const EngineModal: React.FC<EngineModalProps> = ({
  isOpen,
  onClose,
  engineStatus,
  onSetEnginePreference
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="C Allocation Engine & Algorithm Architecture"
      description="Technical specifications, Data Structures & Algorithms (DSA) invariants, and engine execution modes."
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5 text-xs text-slate-600">
        {/* Engine Switcher */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              Active Seating Dispatcher
            </span>
            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              {engineStatus?.active_engine === 'c_engine' ? 'Compiled GCC Binary' : 'Python Greedy Fallback'}
            </span>
          </div>

          <p className="text-slate-600 mb-3 leading-relaxed">
            Choose whether the backend executes the compiled native C engine binary (<code>seat_engine.c</code>) via subprocess or the pure Python algorithm fallback.
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSetEnginePreference('c_engine')}
              className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                engineStatus?.active_engine === 'c_engine'
                  ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-blue-600" />
                C Allocation Engine
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                High-performance GCC compilation with pointer arithmetic and fixed-width matrix memory structures.
              </p>
            </button>

            <button
              onClick={() => onSetEnginePreference('python_fallback')}
              className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                engineStatus?.active_engine === 'python_fallback'
                  ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-600" />
                Python Fallback Engine
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Pure Python fallback with dictionary adjacency conflict checker and deterministic queue partitioning.
              </p>
            </button>
          </div>
        </div>

        {/* DSA Formal Invariants */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Network className="w-4 h-4 text-indigo-600" />
            Data Structures & Algorithmic Complexity
          </h4>

          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 font-sans uppercase font-bold block">
                Time Complexity
              </span>
              <strong className="text-slate-900 text-sm">O(N log N + R × C)</strong>
              <p className="text-[11px] text-slate-500 font-sans mt-1">
                Where N is candidate examinees (sorted via quicksort/merge sort), R is hall rows, and C is columns.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 font-sans uppercase font-bold block">
                Space Complexity
              </span>
              <strong className="text-slate-900 text-sm">O(R × C + N)</strong>
              <p className="text-[11px] text-slate-500 font-sans mt-1">
                2D matrix representation of physical examination desks and student allocation buffer.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <p className="font-bold text-slate-900 text-xs">
              Algorithmic Invariants Implemented in C:
            </p>
            <ul className="space-y-1.5 text-slate-600 text-xs list-disc list-inside">
              <li>
                <strong>Bipartite Section Separation:</strong> Prevents two examinees from the same section or same academic cohort from sitting in orthogonal adjacent seats (left, right, front, back).
              </li>
              <li>
                <strong>Greedy Multi-Queue Disjoint Interleaving:</strong> Alternates candidates from Section A, B, and C across staggered coordinate parity <code>(r + c) % 2</code>.
              </li>
              <li>
                <strong>Physical Barrier Invariant:</strong> Blocked seats (aisles, pillars, broken desks) are treated as non-allocatable boundary vertices, preventing assignment leaks.
              </li>
              <li>
                <strong>Valid Partial Allocation:</strong> When cohort size exceeds usable capacity, the engine safely terminates without crash, marks the arrangement as <code>partial</code>, and outputs unassigned examinees.
              </li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <Button variant="primary" size="sm" onClick={onClose}>
            Close Specifications
          </Button>
        </div>
      </div>
    </Modal>
  );
};
