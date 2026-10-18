import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { Student, Examination, Hall, SeatingArrangement, EngineStatus, SystemStats, User } from './types';
import { Sidebar, SectionId } from './components/Sidebar';
import { Header } from './components/Header';
import { ToastContainer, ToastMessage } from './components/Toast';
import { EngineModal } from './components/EngineModal';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Overview } from './sections/Overview';
import { Students } from './sections/Students';
import { Exams } from './sections/Exams';
import { Halls } from './sections/Halls';
import { Generate } from './sections/Generate';
import { Reports } from './sections/Reports';

import { smartSeatStore } from './services/store';

export default function App() {
  // Authentication State: check for logged-in user in session/localStorage
  const [currentUser, setCurrentUser] = useState<User | null>(() => smartSeatStore.getCurrentUser());
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [authSuccessMessage, setAuthSuccessMessage] = useState<string | null>(null);

  const [activeSection, setActiveSection] = useState<SectionId>('overview');
  const [globalSearch, setGlobalSearch] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isEngineModalOpen, setIsEngineModalOpen] = useState(false);

  // Core Data State - initialize eagerly from store so first render is never blank or undefined
  const [stats, setStats] = useState<SystemStats>(() => smartSeatStore.getStats());
  const [students, setStudents] = useState<Student[]>(() => smartSeatStore.getStudents());
  const [exams, setExams] = useState<Examination[]>(() => smartSeatStore.getExaminations());
  const [halls, setHalls] = useState<Hall[]>(() => smartSeatStore.getHalls());
  const [arrangements, setArrangements] = useState<SeatingArrangement[]>(() => smartSeatStore.getAllArrangements());
  const [engineStatus, setEngineStatus] = useState<EngineStatus | null>(() => smartSeatStore.getEngineStatus());

  // Navigation target for generate seating
  const [targetExamForGenerate, setTargetExamForGenerate] = useState<string | undefined>(undefined);

  const showToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load initial data
  const refreshAllData = async () => {
    try {
      const [allStats, allStudents, allExams, allHalls, allArrangements, engStatus] = await Promise.all([
        api.getStats(),
        api.getStudents(),
        api.getExaminations(),
        api.getHalls(),
        api.getAllArrangements(),
        api.getEngineStatus()
      ]);

      setStats(allStats);
      setStudents(allStudents);
      setExams(allExams);
      setHalls(allHalls);
      setArrangements(allArrangements);
      setEngineStatus(engStatus);
    } catch (err) {
      console.error('Failed to load initial data:', err);
      showToast('error', 'Network Error', 'Could not sync application data.');
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Section navigation handler
  const handleNavigate = (sectionId: SectionId) => {
    setActiveSection(sectionId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Authentication Handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setAuthSuccessMessage(null);
    showToast('success', `Welcome back, ${user.name}!`, 'Signed into SmartSeat Administration.');
  };

  const handleRegisterSuccess = (message: string) => {
    setAuthSuccessMessage(message);
    setAuthView('login');
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setAuthSuccessMessage(null);
    setAuthView('login');
    showToast('info', 'Signed Out', 'You have been securely logged out.');
  };

  // --- Student operations ---
  const handleAddStudent = async (student: Omit<Student, 'id'>) => {
    const res = await api.addStudent(student);
    if (res.success) {
      await refreshAllData();
    }
    return res;
  };

  const handleUpdateStudent = async (id: string, updates: Partial<Student>) => {
    const res = await api.updateStudent(id, updates);
    if (res.success) {
      await refreshAllData();
    }
    return res;
  };

  const handleDeleteStudent = async (id: string) => {
    const ok = await api.deleteStudent(id);
    if (ok) {
      await refreshAllData();
    }
    return ok;
  };

  const handleImportCsv = async (csvText: string) => {
    const res = await api.importStudentsCsv(csvText);
    if (res.imported > 0) {
      await refreshAllData();
    }
    return res;
  };

  const handleExportCsv = () => {
    const csvContent = 'data:text/csv;charset=utf-8,' + api.exportStudentsCsv(students);
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SmartSeat_Students_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Export Complete', `${students.length} students exported to CSV.`);
  };

  // --- Exam operations ---
  const handleAddExam = async (exam: Omit<Examination, 'id'>) => {
    const res = await api.addExamination(exam);
    if (res.success) {
      await refreshAllData();
    }
    return res;
  };

  const handleUpdateExam = async (id: string, updates: Partial<Examination>) => {
    const res = await api.updateExamination(id, updates);
    if (res.success) {
      await refreshAllData();
    }
    return res;
  };

  const handleDeleteExam = async (id: string) => {
    const ok = await api.deleteExamination(id);
    if (ok) {
      await refreshAllData();
    }
    return ok;
  };

  // --- Hall operations ---
  const handleAddHall = async (hall: Omit<Hall, 'id'>) => {
    const res = await api.addHall(hall);
    if (res.success) {
      await refreshAllData();
    }
    return res;
  };

  const handleUpdateHall = async (id: string, updates: Partial<Hall>) => {
    const res = await api.updateHall(id, updates);
    if (res.success) {
      await refreshAllData();
    }
    return res;
  };

  const handleDeleteHall = async (id: string) => {
    const ok = await api.deleteHall(id);
    if (ok) {
      await refreshAllData();
    }
    return ok;
  };

  const handleToggleBlockedSeat = async (hallId: string, seatKey: string) => {
    const res = await api.toggleSeatBlocked(hallId, seatKey);
    if (res.success) {
      await refreshAllData();
    }
    return res;
  };

  // --- Seating Generation operations ---
  const handleGenerate = async (examId: string, hallId: string) => {
    const res = await api.generateSeating(examId, hallId);
    if (res.success) {
      await refreshAllData();
    }
    return res;
  };

  const handleSaveArrangement = async (examId: string, arrangement: SeatingArrangement) => {
    const res = await api.saveArrangement(examId, arrangement);
    if (res.success) {
      await refreshAllData();
      showToast(
        'success',
        'Arrangement Saved',
        `Seating plan for ${arrangement.exam_name} successfully saved to ${arrangement.hall_name}. Hall is now reserved.`
      );
    } else {
      showToast('error', 'Cannot Save Arrangement', res.error || 'Failed to save arrangement.');
    }
    return res;
  };

  const handleSaveReset = async (examId: string) => {
    const res = await api.saveResetArrangement(examId);
    if (res.success) {
      await refreshAllData();
      showToast('info', 'Plan Reset & Saved', 'The seating arrangement was cleared and the hall reservation has been released.');
    } else {
      showToast('error', 'Reset Error', res.error || 'Failed to save reset.');
    }
    return res;
  };

  const handleDeleteArrangement = async (examId: string) => {
    const ok = await api.deleteArrangement(examId);
    if (ok) {
      await refreshAllData();
    }
    return ok;
  };

  const handleMoveOrSwapSeat = async (examId: string, fromSeatKey: string, toSeatKey: string) => {
    const res = await api.moveOrSwapSeat(examId, fromSeatKey, toSeatKey);
    if (res.success) {
      await refreshAllData();
      if (res.action === 'swapped') {
        showToast(
          'success',
          'Students Swapped',
          `Swapped positions of ${res.studentMoved} (${fromSeatKey}) and ${res.studentTarget} (${toSeatKey}).`
        );
      } else {
        showToast(
          'success',
          'Student Moved',
          `Moved ${res.studentMoved} from ${fromSeatKey} to ${toSeatKey}.`
        );
      }
    } else {
      showToast('error', 'Cannot Move Student', res.error || 'Failed to move student.');
    }
    return res;
  };

  const handleSetEnginePreference = async (engine: 'c_engine' | 'python_fallback') => {
    const updated = await api.setEnginePreference(engine);
    setEngineStatus(updated);
    showToast(
      'info',
      'Engine Preference Updated',
      `Switched seating dispatcher to: ${updated.active_engine_label}`
    );
  };

  const handleQuickNavigateToGenerate = (examId?: string) => {
    if (examId) {
      setTargetExamForGenerate(examId);
    }
    handleNavigate('generate');
  };

  // Unauthenticated: Show Login or Register Flow
  if (!currentUser) {
    return (
      <>
        {authView === 'login' ? (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onNavigateToRegister={() => {
              setAuthSuccessMessage(null);
              setAuthView('register');
            }}
            successMessage={authSuccessMessage}
          />
        ) : (
          <Register
            onRegisterSuccess={handleRegisterSuccess}
            onNavigateToLogin={() => {
              setAuthView('login');
            }}
          />
        )}
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  // Authenticated: Render Main Application Dashboard
  return (
    <div className="min-h-screen smartseat-bg flex text-slate-800 font-sans selection:bg-blue-600 selection:text-white">
      {/* LEFT SIDEBAR (Dark Navy, full viewport height, bottom profile) */}
      <Sidebar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        engineStatus={engineStatus}
        onOpenEngineModal={() => setIsEngineModalOpen(true)}
        currentUser={currentUser}
      />

      {/* MAIN VIEWPORT CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP HEADER */}
        <Header
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
          engineStatus={engineStatus}
          onOpenEngineModal={() => setIsEngineModalOpen(true)}
          onOpenNotifications={() => {}}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* MAIN DASHBOARD CONTENT AREA */}
        <main className="flex-1 p-6 sm:p-8 max-w-[1560px] w-full mx-auto">
          {activeSection === 'overview' && (
            <Overview
              stats={stats}
              exams={exams}
              halls={halls}
              arrangements={arrangements}
              students={students}
              onNavigateToGenerate={handleQuickNavigateToGenerate}
              onNavigateToExams={() => handleNavigate('examinations')}
              onNavigateToHalls={() => handleNavigate('halls')}
            />
          )}

          {activeSection === 'students' && (
            <Students
              students={students}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              onImportCsv={handleImportCsv}
              onExportCsv={handleExportCsv}
              showToast={showToast}
            />
          )}

          {activeSection === 'examinations' && (
            <Exams
              exams={exams}
              onAddExam={handleAddExam}
              onUpdateExam={handleUpdateExam}
              onDeleteExam={handleDeleteExam}
              onNavigateToGenerate={handleQuickNavigateToGenerate}
              showToast={showToast}
            />
          )}

          {activeSection === 'halls' && (
            <Halls
              halls={halls}
              onAddHall={handleAddHall}
              onUpdateHall={handleUpdateHall}
              onDeleteHall={handleDeleteHall}
              onToggleBlockedSeat={handleToggleBlockedSeat}
              showToast={showToast}
            />
          )}

          {activeSection === 'generate' && (
            <Generate
              exams={exams}
              halls={halls}
              students={students}
              arrangements={arrangements}
              engineStatus={engineStatus}
              onGenerate={handleGenerate}
              onDeleteArrangement={handleDeleteArrangement}
              onSetEnginePreference={handleSetEnginePreference}
              onMoveOrSwapSeat={handleMoveOrSwapSeat}
              onSaveArrangement={handleSaveArrangement}
              onSaveReset={handleSaveReset}
              showToast={showToast}
              initialExamId={targetExamForGenerate}
            />
          )}

          {activeSection === 'reports' && (
            <Reports
              stats={stats}
              exams={exams}
              halls={halls}
              students={students}
              arrangements={arrangements}
              showToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <EngineModal
        isOpen={isEngineModalOpen}
        onClose={() => setIsEngineModalOpen(false)}
        engineStatus={engineStatus}
        onSetEnginePreference={handleSetEnginePreference}
      />
    </div>
  );
}
