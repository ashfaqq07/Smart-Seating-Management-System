"""
Data models and database access methods for SmartSeat.
"""
import json
import uuid
import hashlib
import os
import hmac
from typing import Optional, List, Dict, Any
from .database import get_db_connection

class UserModel:
    @staticmethod
    def hash_password(password: str) -> str:
        salt = os.urandom(16).hex()
        dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), bytes.fromhex(salt), 100000)
        return f"{salt}${dk.hex()}"

    @staticmethod
    def verify_password(stored_hash: str, password: str) -> bool:
        try:
            salt, hash_hex = stored_hash.split("$")
            dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), bytes.fromhex(salt), 100000)
            return hmac.compare_digest(dk.hex(), hash_hex)
        except Exception:
            return False

    @staticmethod
    def get_by_email(email: str, db_path: str = None) -> Optional[Dict[str, Any]]:
        conn = get_db_connection(db_path)
        row = conn.execute("SELECT * FROM users WHERE LOWER(email) = LOWER(?)", (email.strip(),)).fetchone()
        conn.close()
        return dict(row) if row else None

    @staticmethod
    def get_by_id(user_id: str, db_path: str = None) -> Optional[Dict[str, Any]]:
        conn = get_db_connection(db_path)
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        conn.close()
        return dict(row) if row else None

    @staticmethod
    def create(data: Dict[str, Any], db_path: str = None) -> Dict[str, Any]:
        conn = get_db_connection(db_path)
        user_id = data.get("id") or str(uuid.uuid4())
        hashed = UserModel.hash_password(data["password"])
        role = data.get("role", "Examinations Officer")
        department = data.get("department", "Office of Academic Affairs")
        conn.execute(
            """INSERT INTO users (id, email, name, password_hash, role, department)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (user_id, data["email"].strip().lower(), data["name"].strip(), hashed, role, department)
        )
        conn.commit()
        conn.close()
        user = UserModel.get_by_id(user_id, db_path)
        if user:
            user.pop("password_hash", None)
        return user


class StudentModel:
    @staticmethod
    def get_all(db_path: str = None) -> List[Dict[str, Any]]:
        conn = get_db_connection(db_path)
        rows = conn.execute("SELECT * FROM students ORDER BY reg_no ASC").fetchall()
        conn.close()
        return [dict(r) for r in rows]

    @staticmethod
    def get_by_id(student_id: str, db_path: str = None) -> Optional[Dict[str, Any]]:
        conn = get_db_connection(db_path)
        row = conn.execute("SELECT * FROM students WHERE id = ?", (student_id,)).fetchone()
        conn.close()
        return dict(row) if row else None

    @staticmethod
    def get_by_reg_no(reg_no: str, db_path: str = None) -> Optional[Dict[str, Any]]:
        conn = get_db_connection(db_path)
        row = conn.execute("SELECT * FROM students WHERE UPPER(reg_no) = UPPER(?)", (reg_no.strip(),)).fetchone()
        conn.close()
        return dict(row) if row else None

    @staticmethod
    def create(data: Dict[str, Any], db_path: str = None) -> Dict[str, Any]:
        conn = get_db_connection(db_path)
        student_id = data.get("id") or str(uuid.uuid4())
        conn.execute(
            """INSERT INTO students (id, reg_no, name, department, section, semester, email)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (student_id, data["reg_no"].strip().upper(), data["name"].strip(),
             data["department"].strip(), data["section"].strip().upper(),
             int(data.get("semester", 1)), data.get("email"))
        )
        conn.commit()
        conn.close()
        return StudentModel.get_by_id(student_id, db_path)

    @staticmethod
    def update(student_id: str, data: Dict[str, Any], db_path: str = None) -> Optional[Dict[str, Any]]:
        conn = get_db_connection(db_path)
        conn.execute(
            """UPDATE students
               SET reg_no = COALESCE(?, reg_no),
                   name = COALESCE(?, name),
                   department = COALESCE(?, department),
                   section = COALESCE(?, section),
                   semester = COALESCE(?, semester),
                   email = COALESCE(?, email)
               WHERE id = ?""",
            (data.get("reg_no"), data.get("name"), data.get("department"),
             data.get("section"), data.get("semester"), data.get("email"), student_id)
        )
        conn.commit()
        conn.close()
        return StudentModel.get_by_id(student_id, db_path)

    @staticmethod
    def delete(student_id: str, db_path: str = None) -> bool:
        conn = get_db_connection(db_path)
        cur = conn.execute("DELETE FROM students WHERE id = ?", (student_id,))
        conn.commit()
        deleted = cur.rowcount > 0
        conn.close()
        return deleted


class ExaminationModel:
    @staticmethod
    def get_all(db_path: str = None) -> List[Dict[str, Any]]:
        conn = get_db_connection(db_path)
        rows = conn.execute("SELECT * FROM examinations ORDER BY date ASC, start_time ASC").fetchall()
        conn.close()
        return [dict(r) for r in rows]

    @staticmethod
    def get_by_id(exam_id: str, db_path: str = None) -> Optional[Dict[str, Any]]:
        conn = get_db_connection(db_path)
        row = conn.execute("SELECT * FROM examinations WHERE id = ?", (exam_id,)).fetchone()
        conn.close()
        return dict(row) if row else None

    @staticmethod
    def create(data: Dict[str, Any], db_path: str = None) -> Dict[str, Any]:
        conn = get_db_connection(db_path)
        exam_id = data.get("id") or str(uuid.uuid4())
        conn.execute(
            """INSERT INTO examinations (id, name, code, date, start_time, end_time, department, semester, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (exam_id, data["name"].strip(), data["code"].strip().upper(),
             data["date"].strip(), data["start_time"].strip(), data["end_time"].strip(),
             data["department"].strip(), int(data.get("semester", 1)), data.get("status", "scheduled"))
        )
        conn.commit()
        conn.close()
        return ExaminationModel.get_by_id(exam_id, db_path)

    @staticmethod
    def update(exam_id: str, data: Dict[str, Any], db_path: str = None) -> Optional[Dict[str, Any]]:
        conn = get_db_connection(db_path)
        conn.execute(
            """UPDATE examinations
               SET name = COALESCE(?, name),
                   code = COALESCE(?, code),
                   date = COALESCE(?, date),
                   start_time = COALESCE(?, start_time),
                   end_time = COALESCE(?, end_time),
                   department = COALESCE(?, department),
                   semester = COALESCE(?, semester),
                   status = COALESCE(?, status)
               WHERE id = ?""",
            (data.get("name"), data.get("code"), data.get("date"),
             data.get("start_time"), data.get("end_time"), data.get("department"),
             data.get("semester"), data.get("status"), exam_id)
        )
        conn.commit()
        conn.close()
        return ExaminationModel.get_by_id(exam_id, db_path)

    @staticmethod
    def delete(exam_id: str, db_path: str = None) -> bool:
        conn = get_db_connection(db_path)
        cur = conn.execute("DELETE FROM examinations WHERE id = ?", (exam_id,))
        conn.commit()
        deleted = cur.rowcount > 0
        conn.close()
        return deleted


class HallModel:
    @staticmethod
    def get_all(db_path: str = None) -> List[Dict[str, Any]]:
        conn = get_db_connection(db_path)
        rows = conn.execute("SELECT * FROM halls ORDER BY name ASC").fetchall()
        conn.close()
        result = []
        for r in rows:
            d = dict(r)
            d["blocked_seats"] = json.loads(d.get("blocked_seats", "[]"))
            result.append(d)
        return result

    @staticmethod
    def get_by_id(hall_id: str, db_path: str = None) -> Optional[Dict[str, Any]]:
        conn = get_db_connection(db_path)
        row = conn.execute("SELECT * FROM halls WHERE id = ?", (hall_id,)).fetchone()
        conn.close()
        if not row:
            return None
        d = dict(row)
        d["blocked_seats"] = json.loads(d.get("blocked_seats", "[]"))
        return d

    @staticmethod
    def create(data: Dict[str, Any], db_path: str = None) -> Dict[str, Any]:
        conn = get_db_connection(db_path)
        hall_id = data.get("id") or str(uuid.uuid4())
        rows = int(data["rows"])
        cols = int(data["cols"])
        blocked = json.dumps(data.get("blocked_seats", []))

        conn.execute(
            """INSERT INTO halls (id, name, building, rows, cols, capacity, blocked_seats)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (hall_id, data["name"].strip(), data.get("building", ""), rows, cols, rows * cols, blocked)
        )
        conn.commit()
        conn.close()
        return HallModel.get_by_id(hall_id, db_path)

    @staticmethod
    def update(hall_id: str, data: Dict[str, Any], db_path: str = None) -> Optional[Dict[str, Any]]:
        conn = get_db_connection(db_path)
        current = HallModel.get_by_id(hall_id, db_path)
        if not current:
            conn.close()
            return None

        rows = int(data.get("rows", current["rows"]))
        cols = int(data.get("cols", current["cols"]))
        blocked = json.dumps(data.get("blocked_seats", current["blocked_seats"]))

        conn.execute(
            """UPDATE halls
               SET name = COALESCE(?, name),
                   building = COALESCE(?, building),
                   rows = ?,
                   cols = ?,
                   capacity = ?,
                   blocked_seats = ?
               WHERE id = ?""",
            (data.get("name"), data.get("building"), rows, cols, rows * cols, blocked, hall_id)
        )
        conn.commit()
        conn.close()
        return HallModel.get_by_id(hall_id, db_path)

    @staticmethod
    def delete(hall_id: str, db_path: str = None) -> bool:
        conn = get_db_connection(db_path)
        cur = conn.execute("DELETE FROM halls WHERE id = ?", (hall_id,))
        conn.commit()
        deleted = cur.rowcount > 0
        conn.close()
        return deleted


class SeatingArrangementModel:
    @staticmethod
    def get_by_exam(exam_id: str, db_path: str = None) -> Optional[Dict[str, Any]]:
        conn = get_db_connection(db_path)
        row = conn.execute(
            "SELECT * FROM seating_arrangements WHERE exam_id = ? ORDER BY created_at DESC LIMIT 1",
            (exam_id,)
        ).fetchone()
        conn.close()
        if not row:
            return None
        d = dict(row)
        d["allocations"] = json.loads(d.get("allocations_json", "{}"))
        d["unassigned_students"] = json.loads(d.get("unassigned_json", "[]"))
        return d

    @staticmethod
    def get_all(db_path: str = None) -> List[Dict[str, Any]]:
        conn = get_db_connection(db_path)
        rows = conn.execute("SELECT * FROM seating_arrangements ORDER BY created_at DESC").fetchall()
        conn.close()
        res = []
        for r in rows:
            d = dict(r)
            d["allocations"] = json.loads(d.get("allocations_json", "{}"))
            d["unassigned_students"] = json.loads(d.get("unassigned_json", "[]"))
            res.append(d)
        return res

    @staticmethod
    def save(data: Dict[str, Any], db_path: str = None) -> Dict[str, Any]:
        conn = get_db_connection(db_path)
        arr_id = data.get("id") or str(uuid.uuid4())
        
        # Delete existing for this exam
        conn.execute("DELETE FROM seating_arrangements WHERE exam_id = ?", (data["exam_id"],))

        conn.execute(
            """INSERT INTO seating_arrangements
               (id, exam_id, hall_id, status, total_seats, allocated_count, awaiting_count,
                blocked_count, conflict_count, engine_used, execution_time_ms, allocations_json, unassigned_json)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (arr_id, data["exam_id"], data["hall_id"], data["status"],
             int(data["total_seats"]), int(data["allocated_count"]), int(data["awaiting_count"]),
             int(data.get("blocked_count", 0)), int(data.get("conflict_count", 0)),
             data.get("engine_used", "C Engine"), float(data.get("execution_time_ms", 1.0)),
             json.dumps(data.get("allocations", {})), json.dumps(data.get("unassigned_students", [])))
        )
        conn.commit()
        conn.close()
        return SeatingArrangementModel.get_by_exam(data["exam_id"], db_path)

    @staticmethod
    def delete(exam_id: str, db_path: str = None) -> bool:
        conn = get_db_connection(db_path)
        cur = conn.execute("DELETE FROM seating_arrangements WHERE exam_id = ?", (exam_id,))
        conn.commit()
        deleted = cur.rowcount > 0
        conn.close()
        return deleted
