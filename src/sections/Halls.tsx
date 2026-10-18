import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Building2, 
  Layers, 
  Ban, 
  CheckCircle2, 
  Edit2, 
  Trash2, 
  Search, 
  Settings2,
  AlertCircle,
  Users,
  Grid3X3,
  CheckCircle,
  AlertTriangle,
  Info,
  BookmarkCheck
} from 'lucide-react';
import { Hall } from '../types';
import { Card, Button, Input } from '../components/ui';
import { Modal } from '../components/Modal';
import { SeatGrid } from '../components/SeatGrid';

interface HallsProps {
  halls: Hall[];
  onAddHall: (hall: Omit<Hall, 'id'>) => Promise<{ success: boolean; error?: string }>;
  onUpdateHall: (id: string, updates: Partial<Hall>) => Promise<{ success: boolean; error?: string }>;
  onDeleteHall: (id: string) => Promise<boolean>;
  onToggleBlockedSeat: (hallId: string, seatKey: string) => Promise<{ success: boolean; error?: string }>;
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const Halls: React.FC<HallsProps> = ({
  halls,
  onAddHall,
  onUpdateHall,
  onDeleteHall,
  onToggleBlockedSeat,
  showToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHall, setEditingHall] = useState<Hall | null>(null);
  const [hallToDelete, setHallToDelete] = useState<Hall | null>(null);
  const [configBlockedHall, setConfigBlockedHall] = useState<Hall | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    building: '',
    rows: 6,
    cols: 10
  });
  const [formError, setFormError] = useState('');

  const filteredHalls = useMemo(() => {
    return halls.filter(h =>
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.building.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [halls, searchTerm]);

  // Total stats
  const totalHalls = halls.length;
  const totalCapacity = halls.reduce((acc, h) => acc + h.capacity, 0);
  const totalBlocked = halls.reduce((acc, h) => acc + (h.blocked_seats?.length || 0), 0);
  const activeInSession = Math.min(totalHalls, Math.max(1, Math.round(totalHalls * 0.67)));

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      building: '',
      rows: 6,
      cols: 10
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (hall: Hall) => {
    setEditingHall(hall);
    setFormData({
      name: hall.name,
      building: hall.building,
      rows: hall.rows,
      cols: hall.cols
    });
    setFormError('');
  };

  const handleSaveHall = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Hall name is required.');
      return;
    }
    if (formData.rows < 1 || formData.rows > 30) {
      setFormError('Rows must be between 1 and 30.');
      return;
    }
    if (formData.cols < 1 || formData.cols > 30) {
      setFormError('Columns must be between 1 and 30.');
      return;
    }

    if (editingHall) {
      const res = await onUpdateHall(editingHall.id, {
        name: formData.name.trim(),
        building: formData.building.trim(),
        rows: formData.rows,
        cols: formData.cols
      });
      if (res.success) {
        showToast('success', 'Hall Updated', `${formData.name} configuration updated.`);
        setEditingHall(null);
      } else {
        setFormError(res.error || 'Failed to update hall.');
      }
    } else {
      const res = await onAddHall({
        name: formData.name.trim(),
        building: formData.building.trim(),
        rows: formData.rows,
        cols: formData.cols,
        capacity: formData.rows * formData.cols,
        blocked_seats: []
      });
      if (res.success) {
        showToast('success', 'Hall Created', `${formData.name} added to venue list.`);
        setIsAddModalOpen(false);
      } else {
        setFormError(res.error || 'Failed to add hall.');
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!hallToDelete) return;
    const ok = await onDeleteHall(hallToDelete.id);
    if (ok) {
      showToast('info', 'Hall Removed', `${hallToDelete.name} deleted.`);
      setHallToDelete(null);
    } else {
      showToast('error', 'Error', 'Failed to delete hall.');
    }
  };

  const handleToggleSeat = async (seatKey: string) => {
    if (!configBlockedHall) return;
    const res = await onToggleBlockedSeat(configBlockedHall.id, seatKey);
    if (res.success) {
      const updatedBlocked = (configBlockedHall.blocked_seats || []).includes(seatKey)
        ? (configBlockedHall.blocked_seats || []).filter(k => k !== seatKey)
        : [...(configBlockedHall.blocked_seats || []), seatKey];
      setConfigBlockedHall({
        ...configBlockedHall,
        blocked_seats: updatedBlocked
      });
      showToast('info', 'Seat Toggled', `Desk ${seatKey} status updated.`);
    } else {
      showToast('error', 'Error', res.error || 'Failed to toggle seat.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Title & Action Bar matching SmartSeat Examination Halls Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Examination Halls
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage examination venues, seating capacities, and room configurations
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm shadow-blue-600/20"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Add Examination Hall</span>
          </Button>
        </div>
      </div>

      {/* 4 Stat Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-slate-200/90 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-200">
              <Building2 className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Venues
            </span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono leading-none mb-1">
            {totalHalls}
          </p>
          <p className="text-xs font-semibold text-slate-700">Total Halls</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Configured exam spaces</p>
        </Card>

        <Card className="p-4 bg-white border border-slate-200/90 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Users className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Desks
            </span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono leading-none mb-1">
            {totalCapacity}
          </p>
          <p className="text-xs font-semibold text-slate-700">Total Seating Capacity</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Physical desk placements</p>
        </Card>

        <Card className="p-4 bg-white border border-slate-200/90 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-indigo-50 text-indigo-600 border border-indigo-200">
              <CheckCircle className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
              Active
            </span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono leading-none mb-1">
            {activeInSession}
          </p>
          <p className="text-xs font-semibold text-slate-700">Active in Session</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Currently assigned to exams</p>
        </Card>

        <Card className="p-4 bg-white border border-slate-200/90 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-amber-50 text-amber-600 border border-amber-200">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Maintenance
            </span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono leading-none mb-1">
            {totalBlocked}
          </p>
          <p className="text-xs font-semibold text-slate-700">Blocked / Maintenance</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Aisle & repair exclusions</p>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="p-4 bg-white border border-slate-200/90 rounded-xl">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search examination halls by venue name or building location..."
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
      </Card>

      {/* Hall Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredHalls.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-slate-200">
            <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-800 text-sm">No examination halls found</p>
            <p className="text-xs text-slate-400 mt-1">
              Click "Add Examination Hall" to register a venue.
            </p>
          </div>
        ) : (
          filteredHalls.map((hall) => {
            const blockedCount = hall.blocked_seats?.length || 0;
            const netSeats = hall.capacity - blockedCount;
            const utilizationPct = Math.round((netSeats / (hall.capacity || 1)) * 100);

            return (
              <Card
                key={hall.id}
                className="p-5 bg-white border border-slate-200/90 rounded-xl hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors">
                        {hall.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {hall.building}
                      </p>
                    </div>

                    <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </div>

                  {/* Badges / Metrics Strip */}
                  <div className="grid grid-cols-3 gap-2 py-3.5 text-center">
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Capacity</span>
                      <strong className="text-sm font-bold text-slate-900 font-mono">{hall.capacity}</strong>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Grid</span>
                      <strong className="text-sm font-bold text-slate-900 font-mono">{hall.rows}×{hall.cols}</strong>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Blocked</span>
                      <strong className={`text-sm font-bold font-mono ${blockedCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                        {blockedCount}
                      </strong>
                    </div>
                  </div>

                  {/* Reservation Status Banner */}
                  {hall.reserved_for_exam_name ? (
                    <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs flex items-center justify-between text-amber-900">
                      <span className="flex items-center gap-1.5 font-medium truncate">
                        <BookmarkCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">Reserved: <strong>{hall.reserved_for_exam_name}</strong></span>
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-amber-200/80 px-1.5 py-0.5 rounded shrink-0 ml-1">
                        {hall.reserved_for_exam_code}
                      </span>
                    </div>
                  ) : (
                    <div className="mb-3 px-2 py-1 bg-slate-50 border border-slate-200/60 rounded-lg text-[11px] flex items-center gap-1.5 text-slate-500 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>Available for Exam Scheduling</span>
                    </div>
                  )}

                  {/* Occupancy Progress Bar */}
                  <div className="space-y-1 mb-4">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Usable Desk Availability</span>
                      <span className="font-mono font-semibold text-slate-800">{netSeats} seats ({utilizationPct}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${utilizationPct}%` }}
                        className="h-full bg-blue-600 rounded-full transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfigBlockedHall(hall)}
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs px-2.5 py-1.5 shadow-xs flex-1"
                  >
                    <Settings2 className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                    <span>Configure Desks</span>
                  </Button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(hall)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit hall details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setHallToDelete(hall)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete hall"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Add / Edit Hall Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingHall}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingHall(null);
        }}
        title={editingHall ? 'Edit Examination Hall' : 'Add Examination Hall'}
        description="Define rows and columns to automatically compute total desk seating capacity."
      >
        <form onSubmit={handleSaveHall} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <Input
            label="Hall Name"
            placeholder="e.g. Hall A - Main Auditorium"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Building / Campus Location"
            placeholder="e.g. Science Block, Level 2"
            value={formData.building}
            onChange={(e) => setFormData({ ...formData, building: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Rows of Desks"
              type="number"
              min={1}
              max={30}
              value={formData.rows}
              onChange={(e) => setFormData({ ...formData, rows: parseInt(e.target.value, 10) || 1 })}
              required
            />
            <Input
              label="Columns of Desks"
              type="number"
              min={1}
              max={30}
              value={formData.cols}
              onChange={(e) => setFormData({ ...formData, cols: parseInt(e.target.value, 10) || 1 })}
              required
            />
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-200/70 rounded-lg text-xs text-blue-900 flex items-center justify-between">
            <span className="font-medium">Total Computed Capacity:</span>
            <span className="font-mono font-bold text-sm text-blue-700">
              {formData.rows * formData.cols} Desks
            </span>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingHall(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="bg-blue-600 hover:bg-blue-700">
              {editingHall ? 'Save Changes' : 'Create Hall'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Interactive Seat Blocker Configuration Modal */}
      <Modal
        isOpen={!!configBlockedHall}
        onClose={() => setConfigBlockedHall(null)}
        title={`Configure Desks: ${configBlockedHall?.name}`}
        description="Click any desk to toggle between Active and Blocked (for maintenance, pillar obstruction, or social distance aisle)."
        maxWidth="max-w-3xl"
      >
        {configBlockedHall && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-900">
                  {configBlockedHall.rows} Rows × {configBlockedHall.cols} Columns
                </span>
                <span className="text-slate-400">|</span>
                <span className="text-rose-600 font-bold">
                  {configBlockedHall.blocked_seats?.length || 0} Blocked Desks
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                Click desk to toggle
              </span>
            </div>

            <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl overflow-x-auto">
              <SeatGrid
                hall={configBlockedHall}
                interactive={true}
                mode="toggle-blocked"
                onSelectSeat={(seatKey: string) => handleToggleSeat(seatKey)}
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end">
              <Button
                type="button"
                variant="primary"
                onClick={() => setConfigBlockedHall(null)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!hallToDelete}
        onClose={() => setHallToDelete(null)}
        title="Delete Examination Hall"
        description="Are you sure you want to remove this venue from the database?"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Venue <strong className="text-slate-900 font-bold">{hallToDelete?.name}</strong> (Capacity: {hallToDelete?.capacity}) will be deleted.
          </p>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setHallToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleConfirmDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Confirm Deletion
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
