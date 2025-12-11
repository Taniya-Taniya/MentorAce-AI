from flask import Flask, render_template
from auth.auth_routes import auth_bp
from mentor.mentor_routes import mentor_bp
from institution.institution_routes import institution_bp
from utils.db import init_db
import os
from flask import Blueprint, jsonify

api_bp = Blueprint("api", __name__)

@api_bp.get("/dashboard-data")
def dashboard_data():
    return jsonify({
        "avg_score": 87,
        "top_mentor": "Sarah Johnson",
        "top_mentor_reason": "Highest consistency and clarity",
        "trend": [70, 75, 82, 88, 90],
        "weak_areas": ["Eye contact", "Body posture", "Speaking pace"],
        "distribution": [10, 24, 32, 18, 5],
        "metrics": {
            "clarity": 82,
            "confidence": 90,
            "engagement": 88,
            "knowledge": 85,
            "delivery": 80
        }
    })

@api_bp.get("/evaluation-data")

def evaluation_data():
    return jsonify({
        "scores": [78, 80, 83, 85],
        "details": "Evaluation retrieved successfully"
    })

def create_app():
    # Set up paths - templates and static are in parent directory
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    template_dir = os.path.join(base_dir, 'templates')
    static_dir = os.path.join(base_dir, 'static')
    
    app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)

    # -----------------------------
    # CONFIGURATION
    # -----------------------------
    app.config['SECRET_KEY'] = 'your-secret-key'
    upload_folder = os.path.join(base_dir, "data", "uploads")
    # If uploads exists as a file, remove it first
    if os.path.exists(upload_folder) and os.path.isfile(upload_folder):
        try:
            os.remove(upload_folder)
        except (PermissionError, OSError):
            # If we can't remove it, use a different path
            upload_folder = os.path.join(base_dir, "data", "video_uploads")
    app.config['UPLOAD_FOLDER'] = upload_folder
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # -----------------------------
    # INITIALIZE DATABASE
    # -----------------------------
    init_db()

    # -----------------------------
    # REGISTER BLUEPRINTS
    # -----------------------------
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(mentor_bp, url_prefix="/mentor")
    app.register_blueprint(institution_bp, url_prefix="/institution")

    # -----------------------------
    # FRONTEND ROUTES (HTML PAGES)
    # -----------------------------

    @app.route('/')
    def home_page():
        return render_template('base.html')
    
    @app.route('/dashboard')
    def dashboard_page():
        return render_template('dashboard.html')

    @app.route('/upload_video')
    def upload_video_page():
        return render_template('upload_video.html')

    @app.route('/evaluation')
    def evaluation_page():
        return render_template('evaluation.html')

    @app.route('/compare')
    def compare_page():
        return render_template('compare.html')

    @app.route('/signup')
    def signup_page():
        return render_template('signup.html')

    @app.route('/login')
    def login_page():
        return render_template('login.html')

    return app


# -----------------------------
# RUN THE APP
# -----------------------------
if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
