from flask import Blueprint, request, jsonify, current_app
from utils.security import require_auth

users_bp = Blueprint('users_bp', __name__)

# In backend/routes/users.py

@users_bp.route('/register', methods=['POST'])
def register_user():
    """
    Handles user registration using the admin client for reliability.
    """
    supabase_client = current_app.supabase
    data = request.json
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'seller')

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    try:
        # Step 1: Create the user in Supabase Auth's admin system.
        created_user_res = supabase_client.auth.admin.create_user({
            "email": email,
            "password": password,
            "email_confirm": True,
        })
        
        # *** FIX: The user object is nested inside the response object. ***
        new_user = created_user_res.user

        # Step 2: Immediately create the public profile.
        profile_response = supabase_client.table('users').insert({
            'id': str(new_user.id),
            'email': new_user.email,
            'role': role
        }).execute()

        return jsonify({"message": "Registration successful! You can now log in."}), 201

    except Exception as e:
        current_app.logger.error(f"REGISTRATION CRASH: {e}")
        if "User already exists" in str(e):
             return jsonify({"error": "A user with this email already exists."}), 400
        return jsonify({"error": "An unexpected server error occurred during registration."}), 500

@users_bp.route('/profile', methods=['GET', 'PUT'])
@require_auth
def handle_profile(user):
    """
    Handles fetching and updating the user's own profile.
    """
    supabase_client = current_app.supabase
    if request.method == 'GET':
        try:
            profile_res = supabase_client.table('users').select('*').eq('id', str(user.id)).single().execute()
            return jsonify(profile_res.data), 200
        except Exception as e:
            current_app.logger.error(f"Error fetching profile: {e}")
            return jsonify({"error": "Could not fetch user profile."}), 500

    if request.method == 'PUT':
        data = request.json
        try:
            update_payload = {
                'full_name': data.get('full_name'),
                'phone_number': data.get('phone_number')
            }
            if data.get('document_url'):
                update_payload['document_url'] = data.get('document_url')
                update_payload['verification_status'] = 'pending'

            updated_profile_res = supabase_client.table('users').update(update_payload).eq('id', str(user.id)).execute()
            return jsonify(updated_profile_res.data[0]), 200
        except Exception as e:
            current_app.logger.error(f"Error updating profile: {e}")
            return jsonify({"error": "Could not update user profile."}), 500

@users_bp.route('/my-tasks', methods=['GET'])
@require_auth
def get_my_tasks(user):
    """Fetches all tasks posted by the current user (for buyers)."""
    supabase_client = current_app.supabase
    try:
        tasks_response = supabase_client.table('tasks').select("*, users!tasks_poster_id_fkey(email)").eq('poster_id', str(user.id)).order('created_at', desc=True).execute()
        return jsonify(tasks_response.data), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching my-tasks: {e}")
        return jsonify({"error": str(e)}), 500

@users_bp.route('/my-bids', methods=['GET'])
@require_auth
def get_my_bids(user):
    """Fetches all tasks the current user has bid on (for sellers)."""
    supabase_client = current_app.supabase
    try:
        bids_response = supabase_client.table('bids').select("task_id").eq('bidder_id', str(user.id)).execute()
        task_ids = list(set(bid['task_id'] for bid in bids_response.data))
        
        if not task_ids:
            return jsonify([]), 200

        tasks_response = supabase_client.table('tasks').select("*, users!tasks_poster_id_fkey(email)").in_('id', task_ids).order('created_at', desc=True).execute()
        return jsonify(tasks_response.data), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching my-bids: {e}")
        return jsonify({"error": str(e)}), 500
