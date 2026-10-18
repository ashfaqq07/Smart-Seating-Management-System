from flask import Blueprint
from ..models import StudentModel, ExaminationModel, HallModel, SeatingArrangementModel
from ..api_utils import success_response

reports_bp = Blueprint("reports", __name__)

@reports_bp.route("/summary", methods=["GET"])
def get_summary():
    students = StudentModel.get_all()
    exams = ExaminationModel.get_all()
    halls = HallModel.get_all()
    arrangements = SeatingArrangementModel.get_all()

    total_allocated = sum(a.get("allocated_count", 0) for a in arrangements)
    total_conflicts = sum(a.get("conflict_count", 0) for a in arrangements)

    return success_response({
        "total_students": len(students),
        "scheduled_examinations": len(exams),
        "examination_halls": len(halls),
        "allocated_seats": total_allocated,
        "seating_conflicts": total_conflicts,
        "saved_arrangements": len(arrangements)
    })
