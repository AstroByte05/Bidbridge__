from flask import Blueprint, request, jsonify, current_app
from utils.security import require_auth # Import the decorator
from datetime import datetime, timedelta

tasks_bp = Blueprint('tasks_bp', __name__)

@tasks_bp.route('/tasks', methods=['GET'])
def get_all_tasks():
    supabase_client = current_app.supabase
    try:
        tasks_response = supabase_client.table('tasks').select("*, users!tasks_poster_id_fkey(email)").order('created_at', desc=True).execute()
        return jsonify(tasks_response.data), 200
    except Exception as e:
        current_app.logger.error(f"Error in get_all_tasks: {e}")
        return jsonify({"error": str(e)}), 500

@tasks_bp.route('/tasks', methods=['POST'])
@require_auth
def create_task(user):
    supabase_client = current_app.supabase
    data = request.json
    is_urgent = data.get('is_urgent', False)

    task_payload = {
        'title': data.get('title'),
        'description': data.get('description'),
        'budget': data.get('budget'),
        'from_location': data.get('from_location'),
        'to_location': data.get('to_location'),
        'poster_id': str(user.id)
    }

    if is_urgent:
        task_payload['expires_at'] = (datetime.utcnow() + timedelta(hours=24)).isoformat()

    try:
        response = supabase_client.table('tasks').insert(task_payload).execute()
        return jsonify(response.data[0]), 201
    except Exception as e:
        current_app.logger.error(f"Error creating task: {e}")
        return jsonify({"error": str(e)}), 500

@tasks_bp.route('/tasks/<int:task_id>', methods=['GET'])
def get_task_details(task_id):
    supabase_client = current_app.supabase
    try:
        # *** FIX: Remove .single() to prevent a crash on 0 rows ***
        task_response = supabase_client.table('tasks').select("*, users!tasks_poster_id_fkey(email)").eq('id', task_id).execute()
        
        # *** FIX: Manually check if any data was returned ***
        if not task_response.data:
            return jsonify({"error": "Task not found"}), 404
        
        # Since we didn't use .single(), the result is a list. Get the first item.
        task = task_response.data[0]
        
        bids_response = supabase_client.table('bids').select("*, users!bids_bidder_id_fkey(email)").eq('task_id', task_id).execute()
        
        return jsonify({"task": task, "bids": bids_response.data}), 200
    except Exception as e:
        current_app.logger.error(f"Error in get_task_details for task {task_id}: {e}")
        return jsonify({"error": "An internal server error occurred."}), 500

@tasks_bp.route('/tasks/<int:task_id>', methods=['DELETE'])
@require_auth
def delete_task(user, task_id):
    supabase_client = current_app.supabase
    try:
        task_res = supabase_client.table('tasks').select('poster_id').eq('id', task_id).single().execute()
        if not task_res.data:
            return jsonify({"error": "Task not found"}), 404
        if task_res.data['poster_id'] != str(user.id):
            return jsonify({"error": "You are not authorized to delete this task"}), 403
        
        delete_response = supabase_client.table('tasks').delete().eq('id', task_id).execute()
        return jsonify({"message": "Task deleted successfully"}), 200
    except Exception as e:
        current_app.logger.error(f"Error deleting task {task_id}: {e}")
        return jsonify({"error": "An internal server error occurred."}), 500

@tasks_bp.route('/tasks/<int:task_id>/bids', methods=['POST'])
@require_auth
def post_bid(user, task_id):
    supabase_client = current_app.supabase
    data = request.json
    try:
        task_owner_res = supabase_client.table('tasks').select('poster_id, title').eq('id', task_id).single().execute()
        if not task_owner_res.data:
            return jsonify({"error": "Task not found."}), 404

        task_data = task_owner_res.data
        if task_data['poster_id'] == str(user.id):
            return jsonify({"error": "You cannot bid on your own task."}), 403

        bid_response = supabase_client.table('bids').insert({
            'amount': data['amount'], 'time_estimate': data['timeEstimate'],
            'task_id': task_id, 'bidder_id': str(user.id)
        }).execute()

        supabase_client.table('notifications').insert({
            'user_id': task_data['poster_id'],
            'message': f"You have a new bid on your task: '{task_data['title']}'",
            'link': f'#task-{task_id}'
        }).execute()

        return jsonify(bid_response.data[0]), 201
    except Exception as e:
        current_app.logger.error(f"Error posting bid: {e}")
        return jsonify({"error": "An internal server error occurred."}), 500

@tasks_bp.route('/tasks/<int:task_id>/accept_bid', methods=['POST'])
@require_auth
def accept_bid(user, task_id):
    supabase_client = current_app.supabase
    bid_id = request.json.get('bid_id')
    try:
        task_res = supabase_client.table('tasks').select('poster_id, title').eq('id', task_id).single().execute()
        if not task_res.data or task_res.data['poster_id'] != str(user.id):
            return jsonify({"error": "Unauthorized"}), 403
        
        task_data = task_res.data
        bid_info = supabase_client.table('bids').select('bidder_id').eq('id', bid_id).single().execute()
        if not bid_info.data:
            return jsonify({"error": "Bid not found"}), 404

        update_response = supabase_client.table('tasks').update({
            'status': 'assigned', 'volunteer_id': bid_info.data['bidder_id'], 'accepted_bid_id': bid_id
        }).eq('id', task_id).execute()

        supabase_client.table('notifications').insert({
            'user_id': bid_info.data['bidder_id'],
            'message': f"Your bid for '{task_data['title']}' was accepted!",
            'link': f'#task-{task_id}'
        }).execute()

        return jsonify(update_response.data[0]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
