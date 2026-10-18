export const DEPARTMENTS = [
  'Computer Science and Engineering and Specialisation (CSE and Specialisation)',
  'Information Technology (IT)',
  'Electronics and Communication Engineering (ECE)',
  'Electrical and Electronics Engineering (EEE)',
  'Electronics and Computer Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Biotechnology',
  'Biomedical Engineering'
] as const;

export type DepartmentName = (typeof DEPARTMENTS)[number];

export function normalizeDepartment(dept?: string): string {
  const d = (dept || '').trim();
  if (!d) return 'Computer Science and Engineering and Specialisation (CSE and Specialisation)';

  // Exact match
  if ((DEPARTMENTS as readonly string[]).includes(d)) {
    return d;
  }

  const lower = d.toLowerCase();

  // Electronics and Computer Engineering (distinct from CSE and ECE)
  if (lower.includes('electronics and computer') || lower === 'ecm') {
    return 'Electronics and Computer Engineering';
  }

  // Information Technology
  if (lower === 'it' || lower.includes('information technology')) {
    return 'Information Technology (IT)';
  }

  // Electronics and Communication
  if (lower === 'ece' || lower.includes('electronics and communication') || (lower.includes('electronics') && !lower.includes('electrical') && !lower.includes('computer'))) {
    return 'Electronics and Communication Engineering (ECE)';
  }

  // Electrical and Electronics
  if (lower === 'eee' || lower.includes('electrical and electronics') || lower.includes('electrical')) {
    return 'Electrical and Electronics Engineering (EEE)';
  }

  // Mechanical
  if (lower === 'mech' || lower.includes('mechanical')) {
    return 'Mechanical Engineering';
  }

  // Civil
  if (lower === 'civil' || lower.includes('civil')) {
    return 'Civil Engineering';
  }

  // Biotechnology
  if (lower.includes('biotech')) {
    return 'Biotechnology';
  }

  // Biomedical
  if (lower.includes('biomed')) {
    return 'Biomedical Engineering';
  }

  // CSE & Computer Science
  if (lower === 'cse' || lower.includes('computer science') || lower.includes('specialisation') || lower.includes('cs')) {
    return 'Computer Science and Engineering and Specialisation (CSE and Specialisation)';
  }

  return d;
}
