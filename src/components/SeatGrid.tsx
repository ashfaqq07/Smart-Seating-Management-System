import React, { useState } from 'react';
import { Hall, SeatAllocation, Examination } from '../types';
import { 
  Ban, 
  AlertTriangle, 
  Compass, 
  CheckCircle2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Maximize2
} from 'lucide-react';

interface SeatGridProps {
  hall: Hall;
  allocations?: Record<string, SeatAllocation>;
  selectedSeatKey?: string | null;
  onSelectSeat?: (seatKey: string) => void;
  interactive?: boolean;
  mode?: 'view' | 'toggle-blocked';
  exam?: Examination;
  onMoveOrSwapSeat?: (fromSeatKey: string, toSeatKey: string) => void;
  rearrangeSourceKey?: string | null;
  onSetRearrangeSourceKey?: (key: string | null) => void;
  compact?: boolean;
  initialZoom?: number;
}

export const SeatGrid: React.FC<SeatGridProps> = ({
  hall,
  allocations = {},
  selectedSeatKey,
  onSelectSeat,
  interactive = true,
  mode = 'view',
  onMoveOrSwapSeat,
  rearrangeSourceKey,
  onSetRearrangeSourceKey,
  compact = false,
  initialZoom
}) => {
  const rows = Math.max(1, hall?.rows || 1);
  const cols = Math.max(1, hall?.cols || 1);
  const blockedSet = new Set(hall?.blocked_seats || []);

  // Responsive scale factor with user zoom controls
  const [zoomLevel, setZoomLevel] = useState<number>(initialZoom || (compact ? 0.7 : 1));
  const [draggedSeatKey, setDraggedSeatKey] = useState<string | null>(null);
  const [dragOverSeatKey, setDragOverSeatKey] = useState<string | null>(null);
  const viewportRef = React.useRef<HTMLDivElement>(null);

  // Center/balance horizontal scroll when hall, zoom, or allocations change
  React.useEffect(() => {
    const balanceScroll = () => {
      if (viewportRef.current) {
        const el = viewportRef.current;
        if (el.scrollWidth > el.clientWidth) {
          el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
        } else {
          el.scrollLeft = 0;
        }
      }
    };
    balanceScroll();
    const timer = setTimeout(balanceScroll, 100);
    return () => clearTimeout(timer);
  }, [hall?.id, zoomLevel, Object.keys(allocations).length]);

  // Determine aisle placement: split into 2 banks if cols >= 4
  const aisleAfterCol = cols >= 4 ? Math.floor(cols / 2) : -1;

  // Department color palette for student desk badges
  const getDeptColor = (dept?: string) => {
    switch (dept) {
      case 'Computer Science':
      case 'CSE':
      case 'CS':
        return {
          badge: 'bg-blue-100 text-blue-800 border-blue-200',
          accent: 'border-l-blue-600',
          deskBg: 'bg-blue-50/40'
        };
      case 'Electrical Engineering':
      case 'EEE':
      case 'EE':
        return {
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          accent: 'border-l-amber-500',
          deskBg: 'bg-amber-50/40'
        };
      case 'Mechanical Engineering':
      case 'MECH':
      case 'ME':
        return {
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          accent: 'border-l-emerald-600',
          deskBg: 'bg-emerald-50/40'
        };
      case 'Civil Engineering':
      case 'CIVIL':
      case 'CE':
        return {
          badge: 'bg-purple-100 text-purple-800 border-purple-200',
          accent: 'border-l-purple-600',
          deskBg: 'bg-purple-50/40'
        };
      case 'Information Technology':
      case 'IT':
        return {
          badge: 'bg-cyan-100 text-cyan-800 border-cyan-200',
          accent: 'border-l-cyan-600',
          deskBg: 'bg-cyan-50/40'
        };
      default:
        return {
          badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          accent: 'border-l-indigo-600',
          deskBg: 'bg-indigo-50/30'
        };
    }
  };

  // Dynamic desk dimensions based on hall column count to prevent any overflow or clipping
  const isLargeHall = cols > 8 || rows > 8;
  const deskWidthClass = isLargeHall ? 'w-20' : 'w-24';
  const deskHeightClass = isLargeHall ? 'h-13' : 'h-14';
  const minContainerWidth = Math.max(820, cols * (isLargeHall ? 92 : 108) + 220);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Active Rearrange Mode Banner */}
      {rearrangeSourceKey && (
        <div className="w-full max-w-4xl bg-blue-600 text-white px-4 py-2.5 rounded-xl mb-3 shadow-md flex items-center justify-between text-xs animate-in slide-in-from-top-1">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
            <span className="leading-snug">
              <strong>Move Mode Active:</strong> Moving{' '}
              <span className="font-mono font-bold bg-blue-800 px-1.5 py-0.5 rounded text-white">
                {allocations[rearrangeSourceKey]?.student_name || rearrangeSourceKey} ({rearrangeSourceKey})
              </span>. Click any destination desk to place or swap, or drag and drop across any row & column.
            </span>
          </div>
          <button
            type="button"
            onClick={() => onSetRearrangeSourceKey && onSetRearrangeSourceKey(null)}
            className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded text-white font-semibold cursor-pointer shrink-0 ml-3 transition-colors"
          >
            Cancel Move
          </button>
        </div>
      )}

      {/* Zoom / View controls toolbar */}
      <div className="w-full flex items-center justify-between px-2 mb-2 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-medium flex-wrap">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-700 font-semibold">{hall?.name || 'Examination Hall'}</span>
          <span>•</span>
          <span>{rows} Rows × {cols} Columns</span>
          <span>({hall?.capacity || rows * cols} seats)</span>
          {interactive && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 ml-1">
              <span>Drag & drop desks to move / swap</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 bg-white border border-slate-200/90 rounded-lg p-1 shadow-2xs shrink-0">
          <button
            type="button"
            onClick={() => setZoomLevel(prev => Math.max(0.5, Number((prev - 0.1).toFixed(2))))}
            disabled={zoomLevel <= 0.5}
            className="p-1 hover:bg-slate-100 rounded text-slate-600 disabled:opacity-40 cursor-pointer"
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono px-1.5 font-bold text-slate-700 min-w-10 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoomLevel(prev => Math.min(1.3, Number((prev + 0.1).toFixed(2))))}
            disabled={zoomLevel >= 1.3}
            className="p-1 hover:bg-slate-100 rounded text-slate-600 disabled:opacity-40 cursor-pointer"
            title="Zoom In"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel(compact ? 0.7 : 1)}
            className="p-1 hover:bg-slate-100 rounded text-slate-500 cursor-pointer border-l border-slate-100 ml-0.5"
            title="Reset Zoom"
            aria-label="Reset zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Floor Plan Viewport / Canvas Container */}
      <div 
        ref={viewportRef}
        className="w-full overflow-x-auto overflow-y-visible pb-6 pt-1 scrollbar-thin scroll-smooth"
      >
        <div 
          className="transition-transform duration-200 origin-top w-fit min-w-full flex justify-center pl-12 pr-8"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Architectural Examination Hall Room Enclosure */}
          <div 
            className="relative bg-[#f8fafc] border-[7px] border-slate-700 rounded-sm shadow-xl p-6 sm:p-8"
            style={{ width: `${minContainerWidth}px`, minWidth: `${minContainerWidth}px` }}
          >
            {/* Subtle Architectural Grid Background Pattern */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-[0.25]"
              style={{
                backgroundImage: `linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)`,
                backgroundSize: '24px 24px'
              }}
            />

            {/* Room Header Info Stamp (Architectural Title Block) */}
            <div className="relative z-10 flex items-center justify-between border-b border-slate-300 pb-3 mb-6 text-xs text-slate-600 font-mono">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-800 tracking-wider uppercase text-sm">
                  FLOOR PLAN: {hall.name}
                </span>
                <span className="text-slate-400">|</span>
                <span>VENUE: {hall.building}</span>
                <span className="text-slate-400">|</span>
                <span>GRID: {rows}R × {cols}C ({hall.capacity} DESKS)</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <Compass className="w-3.5 h-3.5 text-blue-600" />
                  NORTH ↑
                </span>
                <span className="px-1.5 py-0.5 bg-slate-200/80 rounded text-slate-700 font-semibold">
                  SCALE 1:50
                </span>
              </div>
            </div>

            {/* FRONT WALL: Blackboard, Teacher/Invigilator Podium, Entrance Door */}
            <div className="relative z-10 mb-8">
              <div className="relative flex items-center justify-between gap-4">
                {/* ENTRANCE DOOR (Architectural Door Swing Arc on Front-Left Wall) */}
                <div className="shrink-0 flex flex-col items-center">
                  <div className="relative w-24 h-16 border-l-4 border-slate-700 pl-2">
                    {/* Door Opening & Frame */}
                    <div className="absolute top-0 -left-[11px] w-2.5 h-2.5 bg-slate-800 rounded-full" />
                    <div className="absolute bottom-0 -left-[11px] w-2.5 h-2.5 bg-slate-800 rounded-full" />
                    
                    {/* Door Leaf & Quarter-circle Swing Arc */}
                    <svg className="w-20 h-16 overflow-visible" viewBox="0 0 80 60">
                      {/* Dashed swing radius */}
                      <path
                        d="M 6 4 A 48 48 0 0 1 54 52"
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />
                      {/* Door Leaf (angled at 30 deg into room) */}
                      <line
                        x1="6"
                        y1="4"
                        x2="52"
                        y2="34"
                        stroke="#334155"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                      {/* Door Handle */}
                      <circle cx="48" cy="31" r="1.5" fill="#f59e0b" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold tracking-widest text-slate-700 uppercase bg-slate-200/90 px-2 py-0.5 rounded border border-slate-300 mt-1">
                    MAIN ENTRANCE
                  </span>
                </div>

                {/* CENTER FRONT: PROMINENT FRONT (BOARD) & INVIGILATOR PODIUM */}
                <div className="flex-1 max-w-lg mx-auto flex flex-col items-center">
                  {/* Chalkboard / Whiteboard Bar Mounted on Wall */}
                  <div className="w-full bg-[#1e293b] border-2 border-[#0f172a] rounded-sm py-2 px-6 shadow-md flex items-center justify-between text-white">
                    <div className="w-2 h-2 rounded-full bg-slate-500" />
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-xs font-extrabold tracking-widest uppercase font-mono text-emerald-300">
                        FRONT (BOARD)
                      </span>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-slate-500" />
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono tracking-wider mt-0.5 uppercase">
                    WALL SURFACE · TEACHER'S WHITEBOARD
                  </div>

                  {/* Invigilator Podium / Table & Chair */}
                  <div className="mt-3 flex flex-col items-center">
                    {/* Teacher Chair */}
                    <div className="w-7 h-2 rounded-b-md bg-slate-400 border border-slate-600 mb-0.5" />
                    {/* Teacher Table */}
                    <div className="w-28 h-6 bg-amber-100/90 border border-amber-800/60 rounded-xs shadow-xs flex items-center justify-center text-[10px] font-bold text-amber-950 uppercase tracking-wider">
                      <span>PODIUM / DESK</span>
                    </div>
                  </div>
                </div>

                {/* FRONT RIGHT: WINDOW WALL NOTATION */}
                <div className="shrink-0 flex flex-col items-end">
                  <div className="flex items-center gap-1 border-r-4 border-slate-700 pr-2">
                    {/* Windows Architectural Symbol */}
                    <div className="flex flex-col gap-1 py-1">
                      <div className="w-8 h-2 border-y-2 border-cyan-500 bg-cyan-100/60" />
                      <div className="w-8 h-2 border-y-2 border-cyan-500 bg-cyan-100/60" />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold tracking-wider text-cyan-800 uppercase bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200 mt-1">
                    EXTERIOR WINDOWS
                  </span>
                </div>
              </div>
            </div>

            {/* MAIN SEATING MATRIX: DESKS & CHAIRS ARRANGED IN ROWS & COLUMNS */}
            <div className="relative z-10 flex justify-center">
              <div className="inline-block">
                {/* Column Dimension Headers */}
                <div className="flex items-center mb-3 pl-16">
                  {Array.from({ length: cols }).map((_, cIdx) => {
                    const colNum = cIdx + 1;
                    const isAisleEdge = aisleAfterCol > 0 && colNum === aisleAfterCol;
                    return (
                      <React.Fragment key={`col-hdr-${cIdx}`}>
                        <div className={`${deskWidthClass} text-center mx-1.5`}>
                          <div className="text-[11px] font-mono font-extrabold text-slate-700">
                            COL {colNum}
                          </div>
                          <div className="h-1 w-full border-b border-slate-400 mt-0.5 mx-auto" />
                        </div>
                        {/* Walking Aisle Column Gap & Marker */}
                        {isAisleEdge && (
                          <div className="w-12 text-center text-[9px] font-mono font-bold text-slate-600 uppercase tracking-tighter self-end pb-0.5">
                            AISLE
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Desk Rows */}
                <div className="space-y-4">
                  {Array.from({ length: rows }).map((_, rIdx) => {
                    const rowNum = rIdx + 1;
                    return (
                      <div key={`row-${rowNum}`} className="flex items-center">
                        {/* Row Dimension Label (Left Wall) */}
                        <div className="w-16 text-right pr-3 shrink-0">
                          <div className="text-xs font-mono font-extrabold text-slate-800">
                            ROW {rowNum}
                          </div>
                          <div className="text-[9px] text-slate-600 font-mono">
                            L-{(rowNum * 1.5).toFixed(1)}m
                          </div>
                        </div>

                        {/* Desks in Row */}
                        <div className="flex items-center">
                          {Array.from({ length: cols }).map((_, cIdx) => {
                            const colNum = cIdx + 1;
                            const seatKey = `R${rowNum}-C${colNum}`;
                            const isBlocked = blockedSet.has(seatKey);
                            const allocation = allocations[seatKey];
                            const isOccupied = !isBlocked && !!allocation;
                            const isConflict = allocation?.is_conflict;
                            const isSelected = selectedSeatKey === seatKey;
                            const isAisleEdge = aisleAfterCol > 0 && colNum === aisleAfterCol;

                            const isRearrangeSource = rearrangeSourceKey === seatKey;
                            const isDraggedSource = draggedSeatKey === seatKey;
                            const isDragTarget = dragOverSeatKey === seatKey;

                            // Theme based on allocated student department
                            const deptStyle = isOccupied ? getDeptColor(allocation.department) : null;

                            const handleDeskClick = () => {
                              if (!interactive) return;
                              if (rearrangeSourceKey) {
                                if (rearrangeSourceKey === seatKey) {
                                  // Unselect current source
                                  onSetRearrangeSourceKey?.(null);
                                } else {
                                  // Execute move or swap
                                  if (onMoveOrSwapSeat) {
                                    onMoveOrSwapSeat(rearrangeSourceKey, seatKey);
                                  }
                                  onSetRearrangeSourceKey?.(null);
                                }
                              } else {
                                onSelectSeat?.(seatKey);
                              }
                            };

                            return (
                              <React.Fragment key={seatKey}>
                                {/* Single Architectural Desk & Chair Unit */}
                                <div className="flex flex-col items-center mx-1.5 group">
                                  {/* The Desk Top (Rectangular examination table with beveled edge) */}
                                  <button
                                    type="button"
                                    disabled={!interactive}
                                    onClick={handleDeskClick}
                                    draggable={interactive && isOccupied && !isBlocked}
                                    onDragStart={(e) => {
                                      if (!interactive || !isOccupied || isBlocked) return;
                                      e.dataTransfer.setData('text/plain', seatKey);
                                      e.dataTransfer.effectAllowed = 'move';
                                      setDraggedSeatKey(seatKey);
                                    }}
                                    onDragEnd={() => {
                                      setDraggedSeatKey(null);
                                      setDragOverSeatKey(null);
                                    }}
                                    onDragOver={(e) => {
                                      if (!interactive) return;
                                      e.preventDefault();
                                      e.dataTransfer.dropEffect = 'move';
                                      if (dragOverSeatKey !== seatKey) {
                                        setDragOverSeatKey(seatKey);
                                      }
                                    }}
                                    onDragLeave={(e) => {
                                      e.preventDefault();
                                      if (dragOverSeatKey === seatKey) {
                                        setDragOverSeatKey(null);
                                      }
                                    }}
                                    onDrop={(e) => {
                                      if (!interactive) return;
                                      e.preventDefault();
                                      const sourceKey = e.dataTransfer.getData('text/plain') || draggedSeatKey;
                                      if (sourceKey && sourceKey !== seatKey && onMoveOrSwapSeat) {
                                        onMoveOrSwapSeat(sourceKey, seatKey);
                                      }
                                      setDraggedSeatKey(null);
                                      setDragOverSeatKey(null);
                                    }}
                                    className={`relative ${deskWidthClass} ${deskHeightClass} rounded-xs border transition-all text-left flex flex-col justify-between p-1.5 shadow-xs select-none ${
                                      interactive
                                        ? isOccupied
                                          ? 'cursor-grab active:cursor-grabbing hover:shadow-md'
                                          : 'cursor-pointer hover:shadow-md'
                                        : 'cursor-default'
                                    } ${
                                      isDragTarget
                                        ? isBlocked
                                          ? 'border-rose-600 ring-4 ring-rose-400 bg-rose-100 shadow-lg scale-105 z-30 cursor-not-allowed'
                                          : isOccupied
                                          ? 'border-purple-600 ring-4 ring-purple-400 bg-purple-100 shadow-lg scale-105 z-30'
                                          : 'border-emerald-600 ring-4 ring-emerald-400 bg-emerald-100 shadow-lg scale-105 z-30'
                                        : isRearrangeSource
                                        ? 'border-blue-600 ring-4 ring-blue-500 ring-offset-2 bg-blue-100 shadow-lg animate-pulse z-30'
                                        : isDraggedSource
                                        ? 'opacity-40 border-dashed border-blue-400 scale-95'
                                        : rearrangeSourceKey && rearrangeSourceKey !== seatKey
                                        ? isBlocked
                                          ? 'bg-rose-50/70 border-rose-200 border-dashed text-rose-400 opacity-60 cursor-not-allowed'
                                          : isOccupied
                                          ? 'bg-white border-purple-400 hover:border-purple-600 hover:ring-2 hover:ring-purple-400 hover:bg-purple-50/80 cursor-pointer shadow-xs'
                                          : 'bg-white border-emerald-400 hover:border-emerald-600 hover:ring-2 hover:ring-emerald-400 hover:bg-emerald-50/80 cursor-pointer shadow-xs'
                                        : isSelected
                                        ? 'border-blue-600 ring-2 ring-blue-600 ring-offset-2 bg-blue-50/90 shadow-md z-20'
                                        : isBlocked
                                        ? 'bg-rose-50/90 border-rose-300 border-dashed text-rose-800'
                                        : isConflict
                                        ? 'bg-amber-50 border-amber-400 text-amber-900 ring-1 ring-amber-400'
                                        : isOccupied
                                        ? `bg-white ${deptStyle?.accent || 'border-l-blue-600'} border-l-[3.5px] border-slate-300 text-slate-900 hover:border-slate-400 hover:shadow-md`
                                        : 'bg-[#ffffff] border-slate-300 hover:border-slate-400 text-slate-500'
                                    }`}
                                    title={`${seatKey}: ${
                                      isBlocked
                                        ? 'Blocked Seat'
                                        : isOccupied
                                        ? `${allocation.student_name} (${allocation.reg_no}) - ${allocation.department}. Drag to move/swap.`
                                        : 'Available Desk. Drag another student here or click to assign.'
                                    }`}
                                  >
                                    {/* Pen groove line at top edge of desk */}
                                    <div className="absolute top-1 left-2 right-2 h-[1.5px] bg-slate-200 rounded-full" />

                                    {/* Desk Header: Seat Key + Status Tag */}
                                    <div className="flex items-center justify-between text-[10px] font-mono leading-none pt-0.5">
                                      <span className={`font-bold ${isRearrangeSource ? 'text-blue-700' : isSelected ? 'text-blue-700' : 'text-slate-600'}`}>
                                        {seatKey}
                                      </span>
                                      {isDragTarget ? (
                                        <span className={`text-[8px] font-extrabold px-1 rounded uppercase ${
                                          isBlocked ? 'bg-rose-600 text-white' : isOccupied ? 'bg-purple-600 text-white' : 'bg-emerald-600 text-white'
                                        }`}>
                                          {isBlocked ? 'Blocked' : isOccupied ? 'Swap' : 'Move'}
                                        </span>
                                      ) : isRearrangeSource ? (
                                        <span className="text-[8px] font-extrabold px-1 rounded bg-blue-600 text-white uppercase animate-pulse">
                                          Source
                                        </span>
                                      ) : isOccupied ? (
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                      ) : isBlocked ? (
                                        <span className="text-rose-500">
                                          <Ban className="w-2.5 h-2.5" />
                                        </span>
                                      ) : (
                                        <span className="text-[9px] text-slate-400">Empty</span>
                                      )}
                                    </div>

                                    {/* Desk Surface Content */}
                                    <div className="my-auto overflow-hidden">
                                      {isOccupied ? (
                                        <div>
                                          <p className="text-[10px] font-bold text-slate-900 truncate leading-tight">
                                            {allocation.student_name}
                                          </p>
                                          <p className="text-[9px] font-mono text-slate-500 truncate leading-none mt-0.5">
                                            {allocation.reg_no}
                                          </p>
                                        </div>
                                      ) : isBlocked ? (
                                        <p className="text-[9px] font-semibold text-rose-600 uppercase tracking-tighter truncate">
                                          Blocked
                                        </p>
                                      ) : (
                                        <p className="text-[9px] font-medium text-slate-400 tracking-tight">
                                          Available
                                        </p>
                                      )}
                                    </div>

                                    {/* Desk Bottom: Department Badge or Mode Indicator */}
                                    <div className="leading-none">
                                      {isOccupied && allocation.department ? (
                                        <span className={`text-[8px] font-bold px-1 py-0.2 rounded-xs border uppercase tracking-wider inline-block truncate max-w-full ${deptStyle?.badge || 'bg-slate-100 text-slate-700'}`}>
                                          {allocation.department.slice(0, 4)}
                                        </span>
                                      ) : isConflict ? (
                                        <span className="text-[8px] font-bold text-amber-700 flex items-center gap-0.5">
                                          <AlertTriangle className="w-2 h-2" /> Conflict
                                        </span>
                                      ) : (
                                        <span className="text-[8px] font-mono text-slate-400">
                                          R{rowNum}C{colNum}
                                        </span>
                                      )}
                                    </div>
                                  </button>

                                  {/* The Visible Chair (South side of desk, facing north) */}
                                  <div className="mt-1 flex flex-col items-center">
                                    {/* Ergonomic Curved Chair Backrest */}
                                    <div
                                      className={`w-9 h-2 rounded-b-md border shadow-2xs transition-colors ${
                                        isSelected
                                          ? 'bg-blue-300 border-blue-500'
                                          : isOccupied
                                          ? 'bg-slate-300 border-slate-500'
                                          : isBlocked
                                          ? 'bg-rose-200 border-rose-300'
                                          : 'bg-slate-200 border-slate-400'
                                      }`}
                                    />
                                    {/* Chair Seat Cushion */}
                                    <div
                                      className={`w-7 h-3 rounded-t-xs border-x border-b -mt-[1px] transition-colors ${
                                        isSelected
                                          ? 'bg-blue-100 border-blue-400'
                                          : isOccupied
                                          ? 'bg-slate-100 border-slate-400'
                                          : isBlocked
                                          ? 'bg-rose-100 border-rose-200'
                                          : 'bg-slate-100 border-slate-300'
                                      }`}
                                    />
                                  </div>
                                </div>

                                {/* Walking Aisle Gap between Column Banks */}
                                {isAisleEdge && (
                                  <div className="w-12 flex flex-col items-center justify-center self-stretch mx-1">
                                    <div className="h-full w-[1.5px] border-r border-dashed border-slate-300 flex items-center justify-center">
                                      <span className="text-[8px] font-mono font-bold text-slate-600 bg-slate-100 px-0.5 py-1 rounded rotate-90 whitespace-nowrap">
                                        AISLE
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* BACK WALL: Emergency Exit Door & Floor Plan Scale Legend */}
            <div className="relative z-10 mt-8 pt-4 border-t-2 border-slate-300 flex items-center justify-between text-xs text-slate-600">
              {/* Rear Emergency Exit */}
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-600 rounded-xs" />
                <span className="text-[10px] font-bold font-mono tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 uppercase">
                  REAR EMERGENCY EXIT
                </span>
              </div>

              {/* Room Dimensions & Aisle clearance metrics */}
              <div className="text-[11px] font-mono text-slate-500">
                HALL AISLE CLEARANCE: 1.2 METERS · COMPLIANT WITH EXAM REGULATIONS
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Architectural Floor Plan Legend */}
      <div className="w-full max-w-4xl mt-2 p-3 bg-white border border-slate-200/90 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs text-slate-700">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-2">
            <div className="w-5 h-3.5 bg-white border-l-[3.5px] border-l-blue-600 border-slate-300 rounded-xs shadow-2xs" />
            <span className="font-medium text-slate-800">Occupied (Allocated Student)</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-5 h-3.5 bg-white border border-slate-300 rounded-xs shadow-2xs" />
            <span className="font-medium text-slate-600">Available (Vacant Desk)</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-5 h-3.5 bg-rose-50 border border-dashed border-rose-300 rounded-xs flex items-center justify-center text-rose-600 text-[9px] font-bold">
              ✕
            </div>
            <span className="font-medium text-rose-700">Blocked (Maintenance/Spacer)</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-5 h-3.5 bg-blue-50 border border-blue-600 ring-1 ring-blue-600 rounded-xs" />
            <span className="font-medium text-blue-800">Selected / Move Source</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-5 h-3.5 bg-purple-50 border border-purple-500 rounded-xs flex items-center justify-center text-purple-700 text-[9px] font-bold">
              ⇄
            </div>
            <span className="font-medium text-purple-800">Swap Student Position</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-5 h-3.5 bg-amber-50 border border-amber-400 rounded-xs" />
            <span className="font-medium text-amber-800">Conflict / Spacing Issue</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-600 font-mono flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Real-time Top-Down CAD Layout</span>
        </div>
      </div>
    </div>
  );
};
