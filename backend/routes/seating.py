from flask import Blueprint, request
from ..models import ExaminationModel, HallModel, StudentModel, SeatingArrangementModel
from ..algorithms.engine import allocate_seating
from ..api_utils import success_response, error_response

seating_bp = Blueprint("seating", __name__)

def check_hall_reservation(hall_id: str, current_exam_id: str):
    """Checks if a hall is already reserved for a different examination."""
    all_arrangements = SeatingArrangementModel.get_all()
    for arr in all_arrangements:
        if arr.get("hall_id") == hall_id and arr.get("exam_id") != current_exam_id:
            other_exam = ExaminationModel.get_by_id(arr.get("exam_id"))
            hall = HallModel.get_by_id(hall_id)
            hall_name = hall["name"] if hall else "This hall"
            exam_name = other_exam["name"] if other_exam else "another examination"
            exam_code = other_exam["code"] if other_exam else arr.get("exam_id")
            return {
                "is_reserved": True,
                "error": f"{hall_name} is already reserved for {exam_name} ({exam_code}). Choose another hall or clear the saved arrangement for that examination first."
            }
    return {"is_reserved": False}

@seating_bp.route("/arrangements", methods=["GET"])
def get_all_arrangements():
    return success_response(SeatingArrangementModel.get_all())

@seating_bp.route("/arrangement/<exam_id>", methods=["GET"])
def get_arrangement(exam_id):
    arr = SeatingArrangementModel.get_by_exam(exam_id)
    if not arr:
        return error_response("No seating arrangement found for this examination", 404)
    return success_response(arr)

@seating_bp.route("/generate", methods=["POST"])
def generate_seating():
    data = request.get_json() or {}
    exam_id = data.get("exam_id")
    hall_id = data.get("hall_id")
    preferred_engine = data.get("preferred_engine", "c_engine")

    if not exam_id or not hall_id:
        return error_response("Both exam_id and hall_id are required", 400)

    exam = ExaminationModel.get_by_id(exam_id)
    if not exam:
        return error_response("Examination not found", 404)

    hall = HallModel.get_by_id(hall_id)
    if not hall:
        return error_response("Hall not found", 404)

    # Check hall reservation against other examinations
    reservation_check = check_hall_reservation(hall_id, exam_id)
    if reservation_check["is_reserved"]:
        return error_response(reservation_check["error"], 409)

    all_students = StudentModel.get_all()
    # Filter eligible examinees
    eligible = [
        s for s in all_students
        if s["department"].lower() == exam["department"].lower() and
           (not exam.get("semester") or s["semester"] == exam["semester"])
    ]

    if not eligible:
        return error_response(
            f"No eligible examinees found for {exam['department']} Semester {exam.get('semester', '')}",
            400
        )

    # Execute seating algorithm
    result = allocate_seating(
        rows=hall["rows"],
        cols=hall["cols"],
        blocked_seats=hall["blocked_seats"],
        students=eligible,
        preferred_engine=preferred_engine
    )

    # Persist arrangement
    saved_payload = {
        "exam_id": exam_id,
        "hall_id": hall_id,
        "status": result["status"],
        "total_seats": result["total_seats"],
        "allocated_count": result["allocated_count"],
        "awaiting_count": result["awaiting_count"],
        "blocked_count": len(hall["blocked_seats"]),
        "conflict_count": result["conflict_count"],
        "engine_used": result["engine_used"],
        "execution_time_ms": result["execution_time_ms"],
        "allocations": result["allocations"],
        "unassigned_students": result["unassigned_students"]
    }

    saved = SeatingArrangementModel.save(saved_payload)
    return success_response(saved, "Seating arrangement generated successfully")

@seating_bp.route("/save", methods=["POST"])
def save_seating():
    data = request.get_json() or {}
    exam_id = data.get("exam_id")
    arrangement = data.get("arrangement") or data

    if not exam_id:
        return error_response("exam_id is required", 400)

    hall_id = arrangement.get("hall_id")
    if not hall_id:
        return error_response("hall_id is required in arrangement", 400)

    # Validate hall availability in backend
    reservation_check = check_hall_reservation(hall_id, exam_id)
    if reservation_check["is_reserved"]:
        return error_response(reservation_check["error"], 409)

    saved_payload = {
        "exam_id": exam_id,
        "hall_id": hall_id,
        "status": arrangement.get("status", "complete"),
        "total_seats": arrangement.get("total_seats", 0),
        "allocated_count": arrangement.get("allocated_count", 0),
        "awaiting_count": arrangement.get("awaiting_count", 0),
        "blocked_count": arrangement.get("blocked_count", 0),
        "conflict_count": arrangement.get("conflict_count", 0),
        "engine_used": arrangement.get("engine_used", "C Engine"),
        "execution_time_ms": arrangement.get("execution_time_ms", 1.0),
        "allocations": arrangement.get("allocations", {}),
        "unassigned_students": arrangement.get("unassigned_students", [])
    }

    saved = SeatingArrangementModel.save(saved_payload)
    return success_response(saved, "Seating arrangement saved successfully and hall reserved")

@seating_bp.route("/save-reset", methods=["POST"])
def save_reset():
    data = request.get_json() or {}
    exam_id = data.get("exam_id")
    if not exam_id:
        return error_response("exam_id is required", 400)

    SeatingArrangementModel.delete(exam_id)
    return success_response(None, "Seating arrangement reset and hall reservation released")

@seating_bp.route("/arrangement/<exam_id>", methods=["DELETE"])
def delete_arrangement(exam_id):
    deleted = SeatingArrangementModel.delete(exam_id)
    if not deleted:
        return error_response("Arrangement not found", 404)
    return success_response(None, "Seating arrangement deleted")
