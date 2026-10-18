import unittest
from backend.validation import (
    validate_student_payload,
    validate_examination_payload,
    validate_hall_payload
)

class TestValidators(unittest.TestCase):
    def test_student_valid(self):
        valid, err = validate_student_payload({
            "reg_no": "2024CS001",
            "name": "Aarav Sharma",
            "department": "Computer Science",
            "section": "A",
            "semester": 4
        })
        self.assertTrue(valid)
        self.assertIsNone(err)

    def test_student_missing_reg_no(self):
        valid, err = validate_student_payload({
            "name": "Aarav Sharma",
            "department": "Computer Science",
            "section": "A"
        })
        self.assertFalse(valid)
        self.assertIn("Registration number", err)

    def test_student_invalid_semester(self):
        valid, err = validate_student_payload({
            "reg_no": "2024CS001",
            "name": "Aarav Sharma",
            "department": "Computer Science",
            "section": "A",
            "semester": 99
        })
        self.assertFalse(valid)
        self.assertIn("Semester must be between 1 and 12", err)

    def test_exam_time_order(self):
        valid, err = validate_examination_payload({
            "name": "Data Structures",
            "code": "CS401",
            "date": "2026-10-20",
            "start_time": "14:00",
            "end_time": "12:00"
        })
        self.assertFalse(valid)
        self.assertIn("End time must be after start time", err)

    def test_hall_bounds(self):
        valid, err = validate_hall_payload({
            "name": "Big Hall",
            "rows": 99,
            "cols": 10
        })
        self.assertFalse(valid)
        self.assertIn("Rows must be between 1 and 50", err)

if __name__ == "__main__":
    unittest.main()
