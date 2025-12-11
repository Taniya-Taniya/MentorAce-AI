from flask import Blueprint, jsonify
from institution.analytics_service import get_dashboard_data

institution = Blueprint("institution", __name__)

@institution.route("/dashboard-data", methods=["GET"])
def dashboard_data():
    data = get_dashboard_data()
    return jsonify(data)
