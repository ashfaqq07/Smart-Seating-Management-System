"""
Helper utilities for testing SmartSeat backend.
"""
def make_student(id="s1", reg_no="2024CS001", name="Student One", dept="Computer Science", sec="A", sem=4):
    return {
        "id": id,
        "reg_no": reg_no,
        "name": name,
        "department": dept,
        "section": sec,
        "semester": sem
    }

def make_cohort(count_a=10, count_b=10):
    cohort = []
    for i in range(1, count_a + 1):
        cohort.append(make_student(
            id=f"sa_{i}",
            reg_no=f"2024CS0{i:02d}",
            name=f"CS Student A{i}",
            dept="Computer Science",
            sec="A",
            sem=4
        ))
    for i in range(1, count_b + 1):
        cohort.append(make_student(
            id=f"sb_{i}",
            reg_no=f"2024CS1{i:02d}",
            name=f"CS Student B{i}",
            dept="Computer Science",
            sec="B",
            sem=4
        ))
    return cohort
