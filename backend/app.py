import os
from flask import Flask
from flask_cors import CORS
import supabase
from dotenv import load_dotenv
import google.generativeai as genai

# Import the blueprints from our new route files
from routes.users import users_bp
from routes.tasks import tasks_bp
from routes.ai import ai_bp
from routes.admin import admin_bp # Import the new admin blueprint

def create_app():
    """
    Creates and configures the Flask application.
    This pattern is great for scalability.
    """
    app = Flask(__name__)
    load_dotenv()

    # --- INITIALIZATIONS ---
    # Initialize CORS
    # Allow requests from your deployed frontend and your local environment
CORS(app, resources={r"/*": {"origins": ["https://astrobyte05.github.io/", "http://127.0.0.1:5500"]}})

    # Initialize Supabase
    try:
        supa_url = os.getenv("SUPABASE_URL")
        supa_key = os.getenv("SUPABASE_SERVICE_KEY")
        if not supa_url or not supa_key:
            raise ValueError("Supabase URL and Key must be set.")
        app.supabase = supabase.create_client(supa_url, supa_key)
        print("✅ Successfully initialized Supabase client")
    except Exception as e:
        print(f"❌ Error initializing Supabase client: {e}")

    # Initialize Gemini
    try:
        gemini_api_key = os.getenv('GEMINI_API_KEY')
        if not gemini_api_key:
            raise ValueError("GEMINI_API_KEY not found.")
        genai.configure(api_key=gemini_api_key)
        app.gemini_model = genai.GenerativeModel('gemini-1.5-flash')
        print("✅ Successfully initialized Gemini API")
    except Exception as e:
        print(f"❌ Error initializing Gemini API: {e}")

    # --- REGISTER BLUEPRINTS ---
    # This is where we tell Flask to use our separated route files.
    app.register_blueprint(users_bp)
    app.register_blueprint(tasks_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(admin_bp) # Register the new admin blueprint

    return app

# --- MAIN EXECUTION ---
if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
