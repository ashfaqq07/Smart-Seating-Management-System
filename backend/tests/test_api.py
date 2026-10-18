import unittest
import os
import tempfile
import json

try:
    from backend.app import create_app
    from backend.config import Config
    FLASK_AVAILABLE = True
except ImportError:
    FLASK_AVAILABLE = False

class TestApiEndpoints(unittest.TestCase):
    def setUp(self):
        if not FLASK_AVAILABLE:
            self.skipTest("Flask is not installed in the test container; run pip install -r backend/requirements.txt")
        self.temp_db = tempfile.NamedTemporaryFile(suffix=".sqlite", delete=False)
        self.temp_db.close()

        class TestConfig(Config):
            TESTING = True
            DATABASE_PATH = self.temp_db.name

        self.app = create_app(TestConfig)
        self.client = self.app.test_client()

    def tearDown(self):
        if os.path.exists(self.temp_db.name):
            os.remove(self.temp_db.name)

    def test_health(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)

    def test_student_crud(self):
        # Create
        res = self.client.post("/api/students", json={
            "reg_no": "2024CS001",
            "name": "Aarav Sharma",
            "department": "Computer Science",
            "section": "A",
            "semester": 4
        })
        self.assertEqual(res.status_code, 201)
        data = res.get_json()["data"]
        student_id = data["id"]

        # Read
        res2 = self.client.get(f"/api/students/{student_id}")
        self.assertEqual(res2.status_code, 200)

        # Update
        res3 = self.client.put(f"/api/students/{student_id}", json={"name": "Aarav S."})
        self.assertEqual(res3.status_code, 200)

        # Delete
        res4 = self.client.delete(f"/api/students/{student_id}")
        self.assertEqual(res4.status_code, 200)

    def test_hall_creation(self):
        res = self.client.post("/api/halls", json={
            "name": "Hall 101",
            "building": "Engineering Block",
            "rows": 6,
            "cols": 8,
            "blocked_seats": ["R1-C1"]
        })
        self.assertEqual(res.status_code, 201)
        hall = res.get_json()["data"]
        self.assertEqual(hall["capacity"], 48)

    def test_exam_creation(self):
        res = self.client.post("/api/examinations", json={
            "name": "Algorithms",
            "code": "CS401",
            "date": "2026-10-25",
            "start_time": "09:30",
            "end_time": "12:30",
            "department": "Computer Science",
            "semester": 4
        })
        self.assertEqual(res.status_code, 201)

if __name__ == "__main__":
    unittest.main()
