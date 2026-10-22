# SmartSeat - Examination Seating Management System

SmartSeat is an examination seating management system designed for college and university examination administration. It combines a modern web dashboard with a deterministic seating allocation engine implemented in C (compiled via GCC) and supported by a Python fallback.
Live Demo: https://smartseatingarrangement.netlify.app
---

## Key Features

- **Modern Administrative Dashboard:** Dark navy full-height sidebar, sticky top header, global search, and clean SaaS design.
- **Interactive Seating Workspace:** Graphical room visualisation with individually rendered desks, rows, columns, and color-coded states (Occupied: Green, Available: Grey, Blocked: Red, Conflict: Amber).
- **C-Powered Allocation Engine:** Implements Bipartite Graph Coloring heuristics and greedy interleaved section allocation in `backend/c_engine/seat_engine.c`.
- **Python Fallback Engine:** Pure Python fallback executing identical constraint checking and partial-allocation rules.
- **Complete vs. Valid Partial Allocations:** Differentiates between fully seated cohorts and valid partial arrangements when venue capacity is reached.
- **Full Entity Management:** Complete CRUD for Students (with CSV import/export), Examinations, and Halls (with interactive blocked-desk matrix configurator).
- **Comprehensive Reports:** Real-time hall utilisation metrics, department distribution breakdowns, and print/export audit rosters.

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide React icons
- **Backend:** Python 3, Flask, SQLite3
- **C Engine:** C99, compiled with GCC `-O3`
- **Testing:** Python `unittest` suite

---

## Directory Structure

```
├── backend/
│   ├── algorithms/
│   │   ├── backtracking.py       # Backtracking solver fallback
│   │   ├── c_engine.py           # Subprocess wrapper for C binary
│   │   ├── conflict_checker.py   # Orthogonal neighbor validation
│   │   ├── engine.py             # Unified dispatcher
│   │   ├── greedy_allocation.py  # Python greedy allocator
│   │   ├── seat_graph.py         # Undirected graph representation
│   │   └── student_index.py      # Section bucket partitioning
│   ├── c_engine/
│   │   └── seat_engine.c         # High-performance C allocation engine
│   ├── routes/                   # Flask blueprints (students, exams, halls, seating, reports)
│   ├── tests/                    # Backend unit test suite
│   ├── app.py                    # Flask server
│   ├── config.py                 # Configuration settings
│   ├── database.py               # SQLite schema & connection helpers
│   ├── models.py                 # ORM and data access methods
│   └── requirements.txt          # Python dependencies
├── src/
│   ├── components/               # Sidebar, Header, SeatGrid, Modal, Toast, EngineModal
│   ├── sections/                 # Overview, Students, Exams, Halls, Generate, Reports
│   ├── services/                 # API client, in-memory & persistent storage
│   ├── types/                    # TypeScript interfaces
│   ├── App.tsx                   # Main dashboard shell
│   └── index.css                 # Tailwind typography and print styles
├── build_c.bat                   # Windows GCC compiler batch script
├── build_c.sh                    # Linux/macOS GCC build script
├── run_app.bat                   # Windows 11 full-stack launcher
├── VIVA_GUIDE.md                 # Viva voce questions & DSA explanations
└── SMARTSEAT_HANDOVER.md         # Handover document with verification results
```

---

## Quick Start (Windows 11)

To compile the C engine and launch both backend and frontend on Windows:

```cmd
run_app.bat
```

Or step-by-step:

### 1. Compile C Seating Engine
```cmd
build_c.bat
```

### 2. Start Frontend
```cmd
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Backend Tests
```cmd
python -m unittest discover -s backend/tests
```
