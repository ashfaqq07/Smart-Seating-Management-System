from flask import Blueprint
from ..algorithms.engine import get_engine_diagnostics
from ..api_utils import success_response

engine_bp = Blueprint("engine", __name__)

@engine_bp.route("/status", methods=["GET"])
def engine_status():
    diagnostics = get_engine_diagnostics()
    return success_response(diagnostics)
