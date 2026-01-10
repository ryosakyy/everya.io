"""
EVERYA Backend Application
Main entry point for the Flask server.
"""
from flask import Flask
from flask_cors import CORS
from config import Config
from routes import register_blueprints


def create_app():
    """Application factory for creating the Flask app."""
    app = Flask(__name__)
    
    # Initialize configuration
    Config.init_app(app)
    
    # Enable CORS
    CORS(app, resources={r"/*": {"origins": "*"}})
    
    # Register all blueprints
    register_blueprints(app)
    
    return app


# Create application instance
app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5000)