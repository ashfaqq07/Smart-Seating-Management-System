from flask import Blueprint, request
from ..models import StudentModel
from ..validation import validate_student_payload
from ..api_utils import success_response, error_response
from ..csv_io import parse_students_csv

students_bp = Blueprint("students", __name__)

@students_bp.route("", methods=["GET"])
def get_students():
    return success_response(StudentModel.get_all())

@students_bp.route("/<student_id>", methods=["GET"])
def get_student(student_id):
    student = StudentModel.get_by_id(student_id)
    if not student:
        return error_response("Student not found", 404)
    return success_response(student)

@students_bp.route("", methods=["POST"])
def create_student():
    data = request.get_json() or {}
    valid, err = validate_student_payload(data)
    if not valid:
        return error_response(err, 400)

    existing = StudentModel.get_by_reg_no(data["reg_no"])
    if existing:
        return error_response(f"Student with registration number {data['reg_no']} already exists", 409)

    created = StudentModel.create(data)
    return success_response(created, "Student created", 201)

@students_bp.route("/<student_id>", methods=["PUT"])
def update_student(student_id):
    data = request.get_json() or {}
    valid, err = validate_student_payload(data, is_update=True)
    if not valid:
        return error_response(err, 400)

    if "reg_no" in data:
        existing = StudentModel.get_by_reg_no(data["reg_no"])
        if existing and existing["id"] != student_id:
            return error_response(f"Registration number {data['reg_no']} is already assigned", 409)

    updated = StudentModel.update(student_id, data)
    if not updated:
        return error_response("Student not found", 404)
    return success_response(updated, "Student updated")

@students_bp.route("/<student_id>", methods=["DELETE"])
def delete_student(student_id):
    deleted = StudentModel.delete(student_id)
    if not deleted:
        return error_response("Student not found", 404)
    return success_response(None, "Student deleted")

@students_bp.route("/import-csv", methods=["POST"])
def import_csv():
    data = request.get_json() or {}
    csv_content = data.get("csv", "")
    if not csv_content:
        return error_response("No CSV content provided", 400)

    parsed, errors = parse_students_csv(csv_content)
    imported = 0
    skipped = 0
    for s in parsed:
        existing = StudentModel.get_by_reg_no(s["reg_no"])
        if existing:
            skipped += 1
            errors.append(f"Reg No {s['reg_no']} already exists.")
        else:
            StudentModel.create(s)
            imported += 1

    return success_response({
        "imported": imported,
        "skipped": skipped,
        "errors": errors
    }, "CSV import processed")
