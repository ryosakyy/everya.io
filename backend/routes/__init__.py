"""
Routes module - registers all blueprints.
"""
from .auth import auth_bp
from .users import users_bp
from .attendance import attendance_bp


def register_blueprints(app):
    """Register all blueprints with the Flask app."""
    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(attendance_bp)
