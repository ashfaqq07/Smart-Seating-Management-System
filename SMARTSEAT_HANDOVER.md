# SmartSeat - Project Handover Document

## 1. Executive Summary

SmartSeat has been redesigned from a generic interface into a SaaS-grade Examination Seating Management System. The application includes full C allocation engine integration, a Python fallback engine, SQLite persistence, and an interactive graphical examination hall workspace.

---

## 2. Key Changes & Enhancements

### Frontend (React + TypeScript + Vite + Tailwind CSS)
1. **Design System & Application Shell:**
   - **Dark Navy Sidebar:** Spanning full viewport height with brand graduation cap icon, section links (Overview, Students, Examinations, Halls, Generate Seating, Reports), active blue pill indicator, live engine status pill, and bottom administrator profile with avatar.
   - **Top Header:** Clean horizontal header with global search bar, notification center with drop-down panel, administrator profile menu, and live engine diagnostics trigger.
   - **No Orphan Seating Charts Item:** Unified graphical examination room layout inside the Generate Seating workspace.
2. **Overview Section:**
   - Welcome hero with high-angle university examination hall perspective visual asset.
   - 6 live KPI cards calculated from real database records (Students, Exams, Halls, Allocated Seats, Conflicts, Saved Arrangements).
   - Upcoming examinations schedule with real countdown dates.
   - Hall directory tab strip with capacity and saved arrangement preview.
3. **Students Section:**
   - Directory with live search by name or registration number.
   - Department and section filters.
   - Full CRUD modal dialogs with validation against duplicate registration numbers.
   - CSV batch import and CSV export.
4. **Examinations Section:**
   - Session timetable management with course codes, date, start/end times, and cohort targets.
   - Validation ensuring end time follows start time.
   - Direct launch link to Generate Seating for any exam.
5. **Examination Halls Section:**
   - Dedicated hall directory showing physical seats, blocked seats, available seats, allocated seats, and occupancy percentage.
   - Add/Edit hall dimension controls.
   - Interactive Blocked-Seat matrix configurator modal (click desks to mark aisles or broken chairs).
   - *Adheres to strict requirement:* No duplicate large graphical seating chart in Halls; focused purely on venue management.
6. **Generate Seating Workspace (Centerpiece):**
   - **Left:** Examination selector, Hall selector, C Engine vs Python Fallback switcher, constraint checklist, and capacity pre-flight check.
   - **Center:** Large graphical examination room with interactive desks, row/column indicators, blackboard podium header, and distinct states (Occupied: Green, Available: Neutral Grey, Blocked: Red, Conflict: Amber).
   - **Right:** Seat state legend, Selected desk detail inspector, and real-time Allocation metrics.
   - Unassigned examinees modal for valid partial allocations.
   - Export CSV and Print Seating Plan actions.
7. **Reports Section:**
   - Audit dashboard with Hall utilisation progress bars, department cohort allocation charts, and full audit table.

### Backend & DSA Engine (C + Python Flask + SQLite)
1. **C Engine (`backend/c_engine/seat_engine.c`):**
   - High-performance algorithm implementing 2D Seat Grid Matrix, orthogonal neighbor adjacency validation, and greedy multi-queue section interleaving.
   - Output structured JSON to stdout.
2. **Python Fallback Engine (`backend/algorithms/`):**
   - `seat_graph.py`, `conflict_checker.py`, `greedy_allocation.py`, `student_index.py`, `backtracking.py`.
   - Automatic graceful fallback if GCC or C binary is not present.
3. **Automated Unit Tests (`backend/tests/`):**
   - Tested SeatGraph geometry, orthogonal adjacency, validators, partial allocations, and C engine diagnostics. 19 automated test cases passing.

---

## 3. Verification Results

| Component | Status | Verification Detail |
|---|---|---|
| Frontend Compilation | PASSED | Vite 8 + React 19 + Tailwind v4 compiled with 0 errors via `compile_applet`. |
| Left Sidebar & Shell | PASSED | Dark navy sidebar, smooth scrolling offset handling, admin profile. |
| Graphical Desk Grid | PASSED | Responsive desk matrix with real click inspection and color-coded states. |
| C Engine Source | PASSED | `backend/c_engine/seat_engine.c` with C99 standard structs and memory layout. |
| Python Test Suite | PASSED | `python3 -m unittest discover -s backend/tests` runs and passes core tests. |
| CSV Import / Export | PASSED | Both client-side parser and backend `csv_io.py` verified. |

---

## 4. How to Run on Windows 11

### Prerequisites
- Node.js (v18+) and npm
- Python 3.10+
- (Optional for C binary) GCC via MSYS2 or MinGW-w64

### Launch Instructions
1. Open the project root folder in PowerShell or Command Prompt.
2. Double-click or execute:
   ```cmd
   run_app.bat
   ```
   This will automatically compile `seat_engine.exe` (if GCC is installed), install Python requirements, launch the Flask API on port 5000, and launch the Vite dashboard on port 3000.
3. Open your browser at `http://localhost:3000`.
