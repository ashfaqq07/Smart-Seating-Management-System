from flask import Blueprint, request
from ..models import ExaminationModel
from ..validation import validate_examination_payload
from ..api_utils import success_response, error_response

examinations_bp = Blueprint("examinations", __name__)

@examinations_bp.route("", methods=["GET"])
def get_examinations():
    return success_response(ExaminationModel.get_all())

@examinations_bp.route("/<exam_id>", methods=["GET"])
def get_examination(exam_id):
    exam = ExaminationModel.get_by_id(exam_id)
    if not exam:
        return error_response("Examination not found", 404)
    return success_response(exam)

@examinations_bp.route("", methods=["POST"])
def create_examination():
    data = request.get_json() or {}
    valid, err = validate_examination_payload(data)
    if not valid:
        return error_response(err, 400)

    created = ExaminationModel.create(data)
    return success_response(created, "Examination created", 201)

@examinations_bp.route("/<exam_id>", methods=["PUT"])
def update_examination(exam_id):
    data = request.get_json() or {}
    valid, err = validate_examination_payload(data, is_update=True)
    if not valid:
        return error_response(err, 400)

    updated = ExaminationModel.update(exam_id, data)
    if not updated:
        return error_response("Examination not found", 404)
    return success_response(updated, "Examination updated")

@examinations_bp.route("/<exam_id>", methods=["DELETE"])
def delete_examination(exam_id):
    deleted = ExaminationModel.delete(exam_id)
    if not deleted:
        return error_response("Examination not found", 404)
    return success_response(None, "Examination deleted")
