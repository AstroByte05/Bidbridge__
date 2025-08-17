from flask import Blueprint, request, jsonify, current_app
from utils.security import require_auth

ai_bp = Blueprint('ai_bp', __name__)

@ai_bp.route('/suggest-description', methods=['POST'])
@require_auth
def suggest_description(user):
    gemini_model = current_app.gemini_model
    data = request.json
    if not data or not data.get('title'):
        return jsonify({"error": "Task title is required."}), 400
    
    title = data['title']
    prompt = (
        f'Based on the task title "{title}", generate a helpful and structured task description template.\n'
        "The user wants to post a hyperlocal delivery task.\n"
        "The description should be a template that the user can easily fill out.\n"
        "Include prompts for essential details like:\n"
        "- Item Details (e.g., dimensions, weight, fragility)\n"
        "- Pickup Location (e.g., specific address, contact person)\n"
        "- Drop-off Location (e.g., specific address, contact person)\n"
        "- Deadline or Time Window\n"
        "Keep it concise and formatted as plain text with clear sections."
    )
    
    try:
        response = gemini_model.generate_content(prompt)
        return jsonify({"suggestion": response.text})
    except Exception as e:
        current_app.logger.error(f"Error getting AI suggestion: {e}")
        return jsonify({"error": "Failed to get AI suggestion."}), 500
