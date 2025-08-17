from flask import Blueprint, request, jsonify, current_app
from utils.security import require_auth # We will create a require_admin decorator later

admin_bp = Blueprint('admin_bp', __name__)

# This is a placeholder for now. We will add security to this route next.
@admin_bp.route('/admin/pending-users', methods=['GET'])
@require_auth 
def get_pending_users(user):
    """
    An endpoint for admins to get all users with a 'pending' verification status.
    """
    supabase_client = current_app.supabase
    try:
        # For now, we'll just check if the current user is an admin by email for simplicity.
        # In a real app, you would have a more robust role check.
        # IMPORTANT: Replace this with your actual admin email address.
        ADMIN_EMAIL = "your-admin-email@example.com"
        if user.email != ADMIN_EMAIL:
            return jsonify({"error": "Not authorized"}), 403

        pending_users_res = supabase_client.table('users').select('*').eq('verification_status', 'pending').execute()
        
        return jsonify(pending_users_res.data), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching pending users: {e}")
        return jsonify({"error": "An internal server error occurred."}), 500

