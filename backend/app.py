from flask import Flask
from .config import Config
from .database import init_db
from .routes import (
    students_bp,
    examinations_bp,
    halls_bp,
    seating_bp,
    reports_bp,
    engine_bp,
    auth_bp
)

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize SQLite database
    init_db(app.config["DATABASE_PATH"])

    # Register blueprints with api prefix
    app.register_blueprint(students_bp, url_prefix="/api/students")
    app.register_blueprint(examinations_bp, url_prefix="/api/examinations")
    app.register_blueprint(halls_bp, url_prefix="/api/halls")
    app.register_blueprint(seating_bp, url_prefix="/api/seating")
    app.register_blueprint(reports_bp, url_prefix="/api/reports")
    app.register_blueprint(engine_bp, url_prefix="/api/engine")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    @app.route("/api/health", methods=["GET"])
    def health():
        return {"status": "ok", "service": "SmartSeat Backend", "version": "2.4.0"}

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)
