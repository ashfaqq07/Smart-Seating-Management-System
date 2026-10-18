from flask import Blueprint, request
from ..models import HallModel
from ..validation import validate_hall_payload
from ..api_utils import success_response, error_response

halls_bp = Blueprint("halls", __name__)

@halls_bp.route("", methods=["GET"])
def get_halls():
    return success_response(HallModel.get_all())

@halls_bp.route("/<hall_id>", methods=["GET"])
def get_hall(hall_id):
    hall = HallModel.get_by_id(hall_id)
    if not hall:
        return error_response("Hall not found", 404)
    return success_response(hall)

@halls_bp.route("", methods=["POST"])
def create_hall():
    data = request.get_json() or {}
    valid, err = validate_hall_payload(data)
    if not valid:
        return error_response(err, 400)

    created = HallModel.create(data)
    return success_response(created, "Hall created", 201)

@halls_bp.route("/<hall_id>", methods=["PUT"])
def update_hall(hall_id):
    data = request.get_json() or {}
    valid, err = validate_hall_payload(data, is_update=True)
    if not valid:
        return error_response(err, 400)

    updated = HallModel.update(hall_id, data)
    if not updated:
        return error_response("Hall not found", 404)
    return success_response(updated, "Hall updated")

@halls_bp.route("/<hall_id>", methods=["DELETE"])
def delete_hall(hall_id):
    deleted = HallModel.delete(hall_id)
    if not deleted:
        return error_response("Hall not found", 404)
    return success_response(None, "Hall deleted")
