from flask import Blueprint, request, jsonify, current_app
from mentor.video_processing import process_video
from mentor.transcription_service import transcribe_video
from mentor.scoring_service import score_transcript
from models.mentor_model import MentorModel
from utils.helpers import format_strengths

mentor_bp = Blueprint("mentor", __name__)

@mentor_bp.route("/evaluate", methods=["POST"])
def evaluate_video():
    if "video" not in request.files:
        return jsonify({"error": "No video file provided"}), 400
    
    file = request.files.get("video")
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400
    
    mentor_id = request.form.get("mentor_id", 1)

    try:
        # Get upload folder from app config
        upload_folder = current_app.config.get('UPLOAD_FOLDER')
        path = process_video(file, upload_folder)
        transcript = transcribe_video(path)
        
        overall, metrics = score_transcript(transcript)

        MentorModel.save_metrics(mentor_id, metrics, overall)
        strengths = format_strengths(metrics)

        return jsonify({
            "overall": overall,
            "metrics": metrics,
            "strengths": strengths,
            "explanation": "Based on clarity, depth, engagement, and pacing.",
            "success": True
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@mentor_bp.route("/latest", methods=["GET"])
def get_latest_evaluation():
    """Get the latest evaluation for a mentor"""
    mentor_id = request.args.get("mentor_id", 1, type=int)
    evaluation = MentorModel.get_latest(mentor_id)
    
    if not evaluation:
        return jsonify({"error": "No evaluation found"}), 404
    
    # Convert Row to dict
    eval_dict = dict(evaluation)
    metrics = {
        "clarity": eval_dict.get("clarity", 0),
        "depth": eval_dict.get("depth", 0),
        "engagement": eval_dict.get("engagement", 0),
        "pacing": eval_dict.get("pacing", 0)
    }
    strengths = format_strengths(metrics)
    
    return jsonify({
        "overall_score": eval_dict.get("overall", 0),
        "metrics": metrics,
        "strengths": strengths,
        "explanation": "Based on clarity, depth, engagement, and pacing."
    })
