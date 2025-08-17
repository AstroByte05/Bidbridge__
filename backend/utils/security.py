from functools import wraps
from flask import request, jsonify, current_app
import supabase

def ensure_user_profile_exists(user_id, email):
    """
    Checks if a user profile exists in public.users and creates it if not.
    """
    supabase_client = current_app.supabase
    try:
        supabase_client.table('users').upsert({
            'id': str(user_id),
            'email': email
        }).execute()
        return True
    except Exception as e:
        current_app.logger.error(f"CRITICAL: Failed to upsert user profile for {user_id}: {e}")
        return False

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        supabase_client = current_app.supabase
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "Authorization header is missing or invalid"}), 401
        
        jwt = auth_header.split('Bearer ').pop()
        try:
            user_response = supabase_client.auth.get_user(jwt)
            user = user_response.user
            kwargs['user'] = user
            
            profile_ok = ensure_user_profile_exists(user.id, user.email)
            if not profile_ok:
                return jsonify({"error": "Could not verify user profile. Please try again."}), 500

        except Exception as e:
            current_app.logger.error(f"Error verifying token: {e}")
            return jsonify({"error": "Invalid or expired token"}), 401
            
        return f(*args, **kwargs)
    return decorated_function
