/**
 * SmartSeat C Seating Engine (seat_engine.c)
 * 
 * High-performance deterministic examination seating allocation engine.
 * Implements:
 * 1. 2D Seat Grid Matrix Representation
 * 2. Orthogonal Adjacency Conflict Verification (Bipartite Section Graph)
 * 3. Greedy Disjoint Interleaved Section Allocation
 * 4. Invariant Enforcement for Blocked Aisle/Pillar Desks
 * 5. Complete vs. Valid Partial Allocation Classification
 * 
 * Compilation:
 *   gcc -O3 -std=c99 -Wall seat_engine.c -o seat_engine
 * Windows (MSYS2 / MinGW):
 *   gcc -O3 -std=c99 -Wall seat_engine.c -o seat_engine.exe
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

#define MAX_STUDENTS 2048
#define MAX_ROWS 64
#define MAX_COLS 64
#define STR_LEN 64

typedef struct {
    char id[STR_LEN];
    char reg_no[STR_LEN];
    char name[STR_LEN];
    char department[STR_LEN];
    char section[STR_LEN];
    int semester;
} Student;

typedef struct {
    int row;
    int col;
    bool is_blocked;
    bool is_occupied;
    bool is_conflict;
    char conflict_reason[STR_LEN * 2];
    Student student;
} Seat;

typedef struct {
    int rows;
    int cols;
    Seat grid[MAX_ROWS][MAX_COLS];
} HallGrid;

// Global buffers
static Student g_students[MAX_STUDENTS];
static int g_student_count = 0;
static HallGrid g_hall;

// Comparator for sorting students by Section then Registration Number
static int compare_students(const void *a, const void *b) {
    const Student *sa = (const Student *)a;
    const Student *sb = (const Student *)b;
    int sec_cmp = strcmp(sa->section, sb->section);
    if (sec_cmp != 0) return sec_cmp;
    return strcmp(sa->reg_no, sb->reg_no);
}

// Check orthogonal adjacency constraints (Left, Top)
static bool has_section_conflict(int r, int c, const char *section) {
    // Check Left neighbor
    if (c > 1) {
        Seat *left = &g_hall.grid[r][c - 1];
        if (left->is_occupied && !left->is_blocked) {
            if (strcmp(left->student.section, section) == 0) {
                return true;
            }
        }
    }
    // Check Top neighbor
    if (r > 1) {
        Seat *top = &g_hall.grid[r - 1][c];
        if (top->is_occupied && !top->is_blocked) {
            if (strcmp(top->student.section, section) == 0) {
                return true;
            }
        }
    }
    return false;
}

int main(int argc, char *argv[]) {
    // Parse arguments: <rows> <cols> [blocked_count] ...
    if (argc < 3) {
        fprintf(stderr, "Usage: %s <rows> <cols> [blocked_keys...]\n", argv[0]);
        return 1;
    }

    int rows = atoi(argv[1]);
    int cols = atoi(argv[2]);

    if (rows <= 0 || rows >= MAX_ROWS || cols <= 0 || cols >= MAX_COLS) {
        fprintf(stderr, "Error: Invalid hall dimensions %d x %d\n", rows, cols);
        return 1;
    }

    g_hall.rows = rows;
    g_hall.cols = cols;

    // Initialize hall grid
    for (int r = 1; r <= rows; r++) {
        for (int c = 1; c <= cols; c++) {
            g_hall.grid[r][c].row = r;
            g_hall.grid[r][c].col = c;
            g_hall.grid[r][c].is_blocked = false;
            g_hall.grid[r][c].is_occupied = false;
            g_hall.grid[r][c].is_conflict = false;
            g_hall.grid[r][c].conflict_reason[0] = '\0';
        }
    }

    // Read blocked seats from command line or stdin
    for (int i = 3; i < argc; i++) {
        int br, bc;
        if (sscanf(argv[i], "R%d-C%d", &br, &bc) == 2) {
            if (br >= 1 && br <= rows && bc >= 1 && bc <= cols) {
                g_hall.grid[br][bc].is_blocked = true;
            }
        }
    }

    // Read students from standard input formatted as:
    // <count>\n
    // <id>,<reg_no>,<name>,<department>,<section>,<semester>\n
    char line[512];
    if (fgets(line, sizeof(line), stdin)) {
        int count = atoi(line);
        while (count > 0 && fgets(line, sizeof(line), stdin)) {
            // Trim newline
            line[strcspn(line, "\r\n")] = 0;
            if (strlen(line) == 0) continue;

            Student s;
            memset(&s, 0, sizeof(Student));
            char *tok = strtok(line, ",");
            if (tok) strncpy(s.id, tok, STR_LEN - 1);
            tok = strtok(NULL, ",");
            if (tok) strncpy(s.reg_no, tok, STR_LEN - 1);
            tok = strtok(NULL, ",");
            if (tok) strncpy(s.name, tok, STR_LEN - 1);
            tok = strtok(NULL, ",");
            if (tok) strncpy(s.department, tok, STR_LEN - 1);
            tok = strtok(NULL, ",");
            if (tok) strncpy(s.section, tok, STR_LEN - 1);
            tok = strtok(NULL, ",");
            if (tok) s.semester = atoi(tok);

            if (g_student_count < MAX_STUDENTS) {
                g_students[g_student_count++] = s;
            }
            count--;
        }
    }

    // Sort students by section and registration number
    qsort(g_students, g_student_count, sizeof(Student), compare_students);

    // Multi-section queue simulation
    bool allocated_mask[MAX_STUDENTS];
    memset(allocated_mask, 0, sizeof(allocated_mask));

    int allocated_count = 0;
    int conflict_count = 0;

    // Greedy matrix placement
    for (int r = 1; r <= rows; r++) {
        for (int c = 1; c <= cols; c++) {
            if (g_hall.grid[r][c].is_blocked) continue;

            // Find best candidate student without orthogonal section conflict
            int chosen_idx = -1;
            for (int i = 0; i < g_student_count; i++) {
                if (!allocated_mask[i]) {
                    if (!has_section_conflict(r, c, g_students[i].section)) {
                        chosen_idx = i;
                        break;
                    }
                }
            }

            // Fallback: If no conflict-free student exists but students remain
            bool is_conflict = false;
            if (chosen_idx == -1) {
                for (int i = 0; i < g_student_count; i++) {
                    if (!allocated_mask[i]) {
                        chosen_idx = i;
                        is_conflict = true;
                        conflict_count++;
                        break;
                    }
                }
            }

            if (chosen_idx != -1) {
                allocated_mask[chosen_idx] = true;
                Seat *seat = &g_hall.grid[r][c];
                seat->is_occupied = true;
                seat->is_conflict = is_conflict;
                if (is_conflict) {
                    snprintf(seat->conflict_reason, sizeof(seat->conflict_reason),
                             "Adjacent section match for Section %s", g_students[chosen_idx].section);
                }
                seat->student = g_students[chosen_idx];
                allocated_count++;
            }
        }
    }

    int awaiting_count = g_student_count - allocated_count;
    const char *status = (awaiting_count == 0) ? "complete" : "partial";

    // Output formatted JSON
    printf("{\n");
    printf("  \"status\": \"%s\",\n", status);
    printf("  \"allocated_count\": %d,\n", allocated_count);
    printf("  \"awaiting_count\": %d,\n", awaiting_count);
    printf("  \"conflict_count\": %d,\n", conflict_count);
    printf("  \"total_seats\": %d,\n", rows * cols);
    printf("  \"allocations\": [\n");

    bool first = true;
    for (int r = 1; r <= rows; r++) {
        for (int c = 1; c <= cols; c++) {
            Seat *s = &g_hall.grid[r][c];
            if (s->is_occupied) {
                if (!first) printf(",\n");
                printf("    {\"seat_id\": \"R%d-C%d\", \"row\": %d, \"col\": %d, \"student_id\": \"%s\", \"reg_no\": \"%s\", \"name\": \"%s\", \"department\": \"%s\", \"section\": \"%s\", \"is_conflict\": %s}",
                       r, c, r, c, s->student.id, s->student.reg_no, s->student.name, s->student.department, s->student.section, s->is_conflict ? "true" : "false");
                first = false;
            }
        }
    }

    printf("\n  ],\n");
    printf("  \"unassigned_ids\": [\n");
    first = true;
    for (int i = 0; i < g_student_count; i++) {
        if (!allocated_mask[i]) {
            if (!first) printf(",\n");
            printf("    \"%s\"", g_students[i].id);
            first = false;
        }
    }
    printf("\n  ]\n");
    printf("}\n");

    return 0;
}
